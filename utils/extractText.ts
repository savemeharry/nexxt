import type { AttachedFile } from '../types';

declare global {
    interface Window {
        pdfjsLib?: any;
        Tesseract?: any;
    }
}

const MAX_EXTRACTED_CHARS = 40000; // keep prompt size reasonable

const dataUrlToArrayBuffer = async (dataUrl: string): Promise<ArrayBuffer> => {
    const res = await fetch(dataUrl);
    return await res.arrayBuffer();
};

const clampText = (text: string, maxLen: number = MAX_EXTRACTED_CHARS): string => {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + `\n\n...[TRUNCATED ${text.length - maxLen} CHARS]...`;
};

export const isTextLike = (mimeType: string, name: string): boolean => {
    return mimeType.startsWith('text/') ||
        [
            'application/json', 'application/xml', 'application/sql',
            'text/markdown', 'application/x-markdown',
        ].includes(mimeType) ||
        name.endsWith('.log') || name.endsWith('.sql') || name.endsWith('.md');
};

export const extractTextFromPdf = async (dataUrl: string): Promise<string> => {
    if (!window.pdfjsLib) {
        return '';
    }
    try {
        const buffer = await dataUrlToArrayBuffer(dataUrl);
        const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
        const numPages = Math.min(pdf.numPages, 30); // hard cap pages for performance
        let text = '';
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings: string[] = (content.items || []).map((it: any) => it.str).filter(Boolean);
            text += strings.join(' ') + '\n\n';
            if (text.length > MAX_EXTRACTED_CHARS) break;
        }
        return clampText(text);
    } catch (e) {
        console.error('PDF text extraction failed', e);
        return '';
    }
};

export const extractTextFromImage = async (dataUrl: string, languages: string = 'eng+rus'): Promise<string> => {
    if (!window.Tesseract || !dataUrl) return '';
    try {
        const result = await window.Tesseract.recognize(dataUrl, languages);
        const text: string = result?.data?.text || '';
        return clampText(text);
    } catch (e) {
        console.error('Image OCR failed', e);
        return '';
    }
};

const b64_to_utf8 = (str: string): string => {
    try {
        const binary_string = atob(str);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    } catch (e) {
        return '';
    }
};

export const extractTextForAttachedFile = async (file: AttachedFile): Promise<string> => {
    const content = file.content || '';
    if (!content) return '';

    try {
        if (file.mimeType === 'application/pdf') {
            return await extractTextFromPdf(content);
        }
        if (file.mimeType?.startsWith('image/')) {
            return await extractTextFromImage(content, 'eng+rus');
        }

        if (isTextLike(file.mimeType, file.name)) {
            const base64 = content.split(',')[1] || '';
            return clampText(b64_to_utf8(base64));
        }
    } catch (e) {
        console.error('Failed to extract text for file', file.name, e);
    }
    return '';
};


