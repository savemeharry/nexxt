


import { Asset, AttachedFile, Folder, FileOperation } from '../types';

const uint8ArrayToBinaryString = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

// Unicode-safe UTF-8 to Base64 encoding
const utf8_to_b64 = (str: string): string => {
    try {
        const encoder = new TextEncoder();
        const uint8array = encoder.encode(str);
        return btoa(uint8ArrayToBinaryString(uint8array));
    } catch (e) {
        console.error("Error in utf8_to_b64:", e);
        return "";
    }
};

export class AssetManager {
    private assets: Asset[];

    constructor(initialAssets: Asset[]) {
        // Deep copy to ensure immutability
        this.assets = JSON.parse(JSON.stringify(initialAssets));
    }

    private findAssetAndParent(path: string): { asset: Asset | null, parent: Folder | null, assets: Asset[] } {
        const parts = path.split('/').filter(p => p);
        if (parts.length === 0) return { asset: null, parent: null, assets: this.assets };

        let currentAssets: Asset[] = this.assets;
        let parent: Folder | null = null;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const found = currentAssets.find(a => a.name === part);

            if (!found) {
                return { asset: null, parent, assets: currentAssets };
            }

            if (i === parts.length - 1) {
                return { asset: found, parent, assets: currentAssets };
            }

            if (found.type === 'folder') {
                parent = found;
                currentAssets = found.children;
            } else {
                // Path continues but we found a file, which is invalid
                return { asset: null, parent: null, assets: [] };
            }
        }
        return { asset: null, parent: null, assets: [] }; // Should not be reached
    }
    
    private findAssetByPath(path: string): Asset | null {
        return this.findAssetAndParent(path).asset;
    }

    private getOrCreateParentFolder(path: string): { parentFolder: Folder | null; newAssets: Asset[] } {
        const parts = path.split('/').filter(p => p);
        if (parts.length <= 1) {
            return { parentFolder: null, newAssets: this.assets };
        }

        const folderPath = parts.slice(0, -1).join('/');
        let newAssets = this.assets;
        let parentFolder: Folder | null = null;
        let currentPath = '';
        let currentChildren = newAssets;

        for (const part of parts.slice(0, -1)) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            let folder = currentChildren.find(a => a.name === part && a.type === 'folder') as Folder | undefined;
            if (!folder) {
                folder = {
                    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    type: 'folder',
                    name: part,
                    children: [],
                };
                currentChildren.push(folder);
            }
            parentFolder = folder;
            currentChildren = folder.children;
        }

        return { parentFolder, newAssets };
    }

    private createUniqueName(assets: Asset[], name: string): string {
        const siblings = new Set(assets.map(a => a.name));
        if (!siblings.has(name)) {
            return name;
        }

        const isFolder = !name.includes('.');
        const extension = isFolder ? '' : `.${name.split('.').pop()}`;
        const baseName = isFolder ? name : name.substring(0, name.lastIndexOf('.'));
        
        let counter = 1;
        let newName = `${baseName} (${counter})${extension}`;
        while (siblings.has(newName)) {
            counter++;
            newName = `${baseName} (${counter})${extension}`;
        }
        return newName;
    }

    public execute(operations: FileOperation[]): { updatedAssets: Asset[], lastTouchedAsset: Asset | null } {
        let lastTouchedAsset: Asset | null = null;
        const fileSystemOps = operations.filter(op => op.operation !== 'PATCH_FILE');


        for (const op of fileSystemOps) {
            switch (op.operation) {
                case 'CREATE_FILE': {
                    const { parentFolder, newAssets } = this.getOrCreateParentFolder(op.path);
                    this.assets = newAssets;
                    const fileName = op.path.split('/').pop()!;
                    const targetContainer = parentFolder ? parentFolder.children : this.assets;

                    const newFile: AttachedFile = {
                        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        type: 'file',
                        name: this.createUniqueName(targetContainer, fileName),
                        mimeType: 'text/markdown', // AI generates markdown
                        size: new Blob([op.content]).size,
                        content: `data:text/markdown;base64,${utf8_to_b64(op.content)}`,
                    };
                    targetContainer.push(newFile);
                    lastTouchedAsset = newFile;
                    break;
                }
                case 'CREATE_FOLDER': {
                    const { parentFolder, newAssets } = this.getOrCreateParentFolder(op.path);
                    this.assets = newAssets;
                    const folderName = op.path.split('/').pop()!;
                    const targetContainer = parentFolder ? parentFolder.children : this.assets;
                    
                     if (!targetContainer.some(a => a.name === folderName && a.type === 'folder')) {
                        const newFolder: Folder = {
                            id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                            type: 'folder',
                            name: this.createUniqueName(targetContainer, folderName),
                            children: []
                        };
                        targetContainer.push(newFolder);
                        lastTouchedAsset = newFolder;
                    }
                    break;
                }
                case 'EDIT_FILE': {
                    const { asset } = this.findAssetAndParent(op.path);
                    if (asset && asset.type === 'file') {
                        asset.content = `data:text/markdown;base64,${utf8_to_b64(op.content)}`;
                        asset.size = new Blob([op.content]).size;
                        asset.mimeType = 'text/markdown';
                        lastTouchedAsset = asset;
                    }
                    break;
                }
                case 'RENAME_ASSET': {
                    const { asset, parent, assets } = this.findAssetAndParent(op.path);
                     if (asset) {
                        const siblings = parent ? parent.children : assets;
                        asset.name = this.createUniqueName(siblings.filter(a => a.id !== asset.id), op.newName);
                        lastTouchedAsset = asset;
                    }
                    break;
                }
                case 'MOVE_ASSET': {
                    const { asset: assetToMove, parent: sourceParent, assets: sourceSiblings } = this.findAssetAndParent(op.sourcePath);
                    if (!assetToMove) break;
                    
                    // Remove from source
                    const sourceContainer = sourceParent ? sourceParent.children : this.assets;
                    const assetIndex = sourceContainer.findIndex(a => a.id === assetToMove.id);
                    if (assetIndex > -1) {
                       sourceContainer.splice(assetIndex, 1);
                    }

                    // Add to destination
                    const destPathParts = op.destinationPath.split('/').filter(p => p);
                    const destFileName = destPathParts.pop()!;
                    const destFolderPath = destPathParts.join('/');
                    
                    const { parentFolder: destParent } = this.getOrCreateParentFolder(op.destinationPath);
                    const destContainer = destParent ? destParent.children : this.assets;

                    assetToMove.name = this.createUniqueName(destContainer, destFileName);
                    destContainer.push(assetToMove);
                    lastTouchedAsset = assetToMove;
                    break;
                }
            }
        }

        return { updatedAssets: this.assets, lastTouchedAsset };
    }
}