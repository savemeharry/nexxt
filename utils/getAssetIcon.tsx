

import React from 'react';
import { Asset } from '../types';
import { FileIcon } from '../components/icons/FileIcon';
import { ImageIcon } from '../components/icons/ImageIcon';
import { PdfIcon } from '../components/icons/PdfIcon';
import { FileTextIcon } from '../components/icons/FileTextIcon';
import { FolderIcon } from '../components/icons/FolderIcon';
import { VideoIcon } from '../components/icons/VideoIcon';
import { CodeIcon } from '../components/icons/CodeIcon';
import { DocxIcon } from '../components/icons/DocxIcon';

export const getAssetIcon = (asset: Asset, className: string = 'w-5 h-5') => {
    if (asset.type === 'folder') {
        return <FolderIcon className={className} />;
    }
    const docxMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const extension = asset.name.split('.').pop()?.toLowerCase();

    // By MIME Type
    if (asset.mimeType.startsWith('image/')) return <ImageIcon className={className} />;
    if (asset.mimeType.startsWith('video/')) return <VideoIcon className={className} />;
    if (asset.mimeType === 'application/pdf') return <PdfIcon className={className} />;
    if (asset.mimeType === docxMimeType || extension === 'docx') return <DocxIcon className={className} />;
    
    // By extension for data/code files
    if (['json', 'xml', 'sql', 'log', 'csv'].includes(extension || '')) {
        return <CodeIcon className={className} />;
    }

    // Text-based documents
    if (asset.mimeType.startsWith('text/')) return <FileTextIcon className={className} />;

    // Default
    return <FileIcon className={className} />;
};