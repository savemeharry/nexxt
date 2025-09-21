import { CompanyCardData, Asset, AttachedFile, GoogleUserProfile } from '../types';

declare let google: any;
declare let gapi: any;

// Vite uses import.meta.env and requires VITE_ prefix for exposure to client
const API_KEY = (import.meta as any).env?.VITE_GOOGLE_API_KEY;
const CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
// Request Drive scopes (read existing + create) and profile/email for avatar/name
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

let tokenClient: any;
let onAuthChangeCallback: (user: GoogleUserProfile | null) => void;

const waitForGlobal = <T>(name: string): Promise<T> => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
            if ((window as any)[name]) {
                clearInterval(interval);
                resolve((window as any)[name]);
            } else {
                attempts++;
                if (attempts > 50) { // Timeout after 5 seconds
                    clearInterval(interval);
                    reject(new Error(`Timed out waiting for ${name} to load.`));
                }
            }
        }, 100);
    });
};

export const initClient = async (onAuthChange: (user: GoogleUserProfile | null) => void): Promise<void> => {
    onAuthChangeCallback = onAuthChange;

    try {
        const gapiPromise = waitForGlobal('gapi');
        const googlePromise = waitForGlobal('google');
        
        await Promise.all([gapiPromise, googlePromise]);

        await new Promise<void>((resolve, reject) => {
            gapi.load('client', {
                callback: resolve,
                onerror: reject,
                timeout: 5000,
                ontimeout: reject
            });
        });

        if (!API_KEY || !CLIENT_ID) {
            throw new Error('Missing Google API env vars. Expected VITE_GOOGLE_API_KEY and VITE_GOOGLE_CLIENT_ID in .env.local');
        }

        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    gapi.client.setToken(tokenResponse);
                    fetchUserProfile();
                } else if (tokenResponse.error) {
                    console.error("Google Auth Error:", tokenResponse);
                }
            },
        });
    } catch (error) {
        console.error("Error during Google Client initialization:", error);
        onAuthChange(null);
    }
};


const fetchUserProfile = async () => {
    try {
        const res = await gapi.client.request({
            path: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });
        const user: GoogleUserProfile = {
            name: res.result.name,
            email: res.result.email,
            imageUrl: res.result.picture,
        };
        onAuthChangeCallback(user);
    } catch (e) {
        console.error("Could not fetch user profile", e);
        onAuthChangeCallback(null);
    }
};

export const signIn = () => {
    if (!tokenClient) {
        console.error("Google Token Client not initialized.");
        return;
    }
    // FIX: Ensure prompt is included for user consent on first sign-in.
    tokenClient.requestAccessToken({ prompt: 'consent' });
};

export const signOut = () => {
    const token = gapi?.client?.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
            onAuthChangeCallback(null);
        });
    }
};

// ------- Simple Drive rate-limit + retry helpers -------
const driveSleep = (ms: number) => new Promise(res => setTimeout(res, ms));
let lastDriveCallTs = 0;
const MIN_DRIVE_INTERVAL_MS = 800; // throttle sequential Drive calls

const withDriveRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const waitMs = Math.max(0, lastDriveCallTs + MIN_DRIVE_INTERVAL_MS - now);
    if (waitMs > 0) await driveSleep(waitMs);
    try {
        return await fn();
    } finally {
        lastDriveCallTs = Date.now();
    }
};

const fetchWithRetry = async (input: RequestInfo, init: RequestInit, maxRetries: number = 5): Promise<Response> => {
    let attempt = 0;
    let lastError: any = null;
    while (attempt <= maxRetries) {
        try {
            // rate-limit each attempt
            const res = await withDriveRateLimit(() => fetch(input, init));
            if (res.status !== 429 && res.status !== 403) {
                return res;
            }
            // 429/403 userRateLimitExceeded/backoff
            const retryAfter = Number(res.headers.get('Retry-After'));
            const base = !isNaN(retryAfter) ? Math.max(1, retryAfter) * 1000 : Math.min(2000 * Math.pow(2, attempt), 15000);
            const jitter = Math.floor(Math.random() * 500);
            await driveSleep(base + jitter);
        } catch (e) {
            lastError = e;
            const base = Math.min(2000 * Math.pow(2, attempt), 15000);
            const jitter = Math.floor(Math.random() * 500);
            await driveSleep(base + jitter);
        }
        attempt++;
    }
    if (lastError) throw lastError;
    throw new Error('Google Drive request failed after retries');
};

const findOrCreateFolder = async (folderName: string, parentId: string = 'root'): Promise<string> => {
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
    const response = await gapi.client.drive.files.list({ q: query, fields: 'files(id)' });

    if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
    }

    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };
    const newFolder = await gapi.client.drive.files.create({ resource: fileMetadata, fields: 'id' });
    return newFolder.result.id;
};

export const uploadTextFile = async (folderName: string, fileName: string, content: string): Promise<void> => {
    if (!gapi.client.getToken()) throw new Error("Please sign in to Google first.");

    const appFolderId = await findOrCreateFolder('nexxt Projects');
    const projectFolderId = await findOrCreateFolder(folderName, appFolderId);

    const fileMetadata = { name: fileName, parents: [projectFolderId] };
    const media = { mimeType: 'text/plain', body: content };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'text/plain'}));

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        },
        body: form,
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Google Drive API error: ${error.error.message}`);
    }
};

const dataUrlToBlob = (dataUrl: string): Blob | null => {
    try {
        const [header, base64] = dataUrl.split(',');
        if (!header || !base64) return null;
        const mime = header.match(/:(.*?);/)?.[1];
        if (!mime) return null;
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new Blob([bytes], { type: mime });
    } catch (error) {
        console.error("Failed to convert data URL to Blob", error);
        return null;
    }
};


const uploadAsset = async (asset: Asset, parentId: string) => {
    if (asset.type === 'folder') {
        const folderId = await findOrCreateFolder(asset.name, parentId);
        for (const child of asset.children) {
            await uploadAsset(child, folderId);
        }
    } else if (asset.type === 'file') {
        const file = asset as AttachedFile;
        if (!file.content) return; // Don't upload files without content

        const blob = dataUrlToBlob(file.content);
        if (!blob) return;

        const fileMetadata = { name: file.name, parents: [parentId] };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
        form.append('file', blob);

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${gapi.client.getToken().access_token}`,
            },
            body: form,
        });
        if (!res.ok) {
            console.error(`Failed to upload ${file.name}`, await res.json());
        }
    }
};

export const uploadProject = async (project: CompanyCardData): Promise<void> => {
    if (!gapi.client.getToken()) throw new Error("Please sign in to Google first.");
    
    const appFolderId = await findOrCreateFolder('nexxt Projects');
    const projectFolderId = await findOrCreateFolder(project.title, appFolderId);
    
    // Upload a summary file
    const summaryContent = `# ${project.title}\n\n**Category:** ${project.category}\n\n**Description:**\n${project.description}`;
    
    const summaryFileMetadata = { name: 'Project Summary.md', parents: [projectFolderId] };
    const summaryForm = new FormData();
    summaryForm.append('metadata', new Blob([JSON.stringify(summaryFileMetadata)], { type: 'application/json' }));
    summaryForm.append('file', new Blob([summaryContent], { type: 'text/markdown'}));
    const sumRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${gapi.client.getToken().access_token}`,
            },
            body: summaryForm,
    });
    if (!sumRes.ok) {
        const err = await sumRes.text();
        throw new Error(`Failed to upload summary: ${err}`);
    }


    for (const asset of project.assets) {
        await uploadAsset(asset, projectFolderId);
    }
};

// -------- Import (Download) from Google Drive ---------

export const listTextFiles = async (pageSize: number = 50) => {
    if (!gapi.client.getToken()) throw new Error("Please sign in to Google first.");
    const query = [
        "trashed=false",
        "and (",
        "mimeType contains 'text/'",
        " or mimeType='application/json'",
        " or mimeType='application/x-markdown'",
        " or mimeType='text/markdown'",
        " or mimeType='application/xml'",
        " or mimeType='text/csv'",
        " or mimeType='application/vnd.google-apps.document'",
        " or mimeType='application/vnd.google-apps.spreadsheet'",
        " or mimeType='application/vnd.google-apps.presentation'",
        " or mimeType='application/pdf'",
        " or mimeType contains 'image/'",
        ")"
    ].join(' ');
    // Wrap gapi call with rate-limit
    const res: any = await withDriveRateLimit(() => gapi.client.drive.files.list({ q: query, pageSize, fields: 'files(id,name,mimeType,size)', spaces: 'drive' }));
    return (res.result.files || []).map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: Number(f.size || 0) }));
};

export const downloadFile = async (fileId: string): Promise<{ name: string; mimeType: string; content: string; size: number } > => {
    if (!gapi.client.getToken()) throw new Error("Please sign in to Google first.");
    const metaRes: any = await withDriveRateLimit(() => gapi.client.drive.files.get({ fileId, fields: 'id,name,mimeType,size' }));
    const { name, mimeType, size } = metaRes.result as { name: string; mimeType: string; size: number };
    const token = gapi.client.getToken().access_token;
    let finalMime = mimeType;
    let base64 = '';
    // Google Docs export handling
    if (mimeType === 'application/vnd.google-apps.document') {
        const exportRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, { headers: { Authorization: `Bearer ${token}` } });
        if (!exportRes.ok) throw new Error(`Failed to export Google Doc: ${await exportRes.text()}`);
        const text = await exportRes.text();
        base64 = btoa(unescape(encodeURIComponent(text)));
        finalMime = 'text/plain';
        return { name: name.endsWith('.txt') ? name : `${name}.txt`, mimeType: finalMime, content: `data:${finalMime};base64,${base64}`, size: text.length };
    }
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
        const exportRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`, { headers: { Authorization: `Bearer ${token}` } });
        if (!exportRes.ok) throw new Error(`Failed to export Google Sheet: ${await exportRes.text()}`);
        const text = await exportRes.text();
        base64 = btoa(unescape(encodeURIComponent(text)));
        finalMime = 'text/csv';
        return { name: name.endsWith('.csv') ? name : `${name}.csv`, mimeType: finalMime, content: `data:${finalMime};base64,${base64}`, size: text.length };
    }
    if (mimeType === 'application/vnd.google-apps.presentation') {
        const exportRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, { headers: { Authorization: `Bearer ${token}` } });
        if (!exportRes.ok) throw new Error(`Failed to export Google Slides: ${await exportRes.text()}`);
        const text = await exportRes.text();
        base64 = btoa(unescape(encodeURIComponent(text)));
        finalMime = 'text/plain';
        return { name: name.endsWith('.txt') ? name : `${name}.txt`, mimeType: finalMime, content: `data:${finalMime};base64,${base64}`, size: text.length };
    }
    // Other files (binary/text)
    const contentRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } });
    if (!contentRes.ok) throw new Error(`Failed to download file: ${await contentRes.text()}`);
    const buf = await contentRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    base64 = btoa(binary);
    return { name, mimeType: finalMime, content: `data:${finalMime};base64,${base64}`, size: Number(size) || bytes.length };
};