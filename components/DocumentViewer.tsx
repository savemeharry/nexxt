import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AttachedFile, Asset, Folder } from '../types';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { ListIcon } from './icons/ListIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { FolderView } from './FolderView';
import { CsvViewer } from './CsvViewer';


declare const marked: any;
declare const DOMPurify: any;
declare const mammoth: any;

interface DocumentViewerProps {
    asset: Asset | null;
    onUpdateAsset: (updatedAsset: AttachedFile) => void;
    onSelectAsset: (asset: Asset) => void;
    isSplitViewMode?: boolean;
    animatedLines?: { text: string; state: string }[] | null;
    onClearAnimatedLines?: () => void;
    aiHasChanges?: boolean;
    onSaveForSplitView?: (updatedAsset: AttachedFile) => void;
}

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

const dataUrlToArrayBuffer = async (dataUrl: string): Promise<ArrayBuffer | null> => {
    try {
        const blob = await (await fetch(dataUrl)).blob();
        return await blob.arrayBuffer();
    } catch (error) {
        console.error("Failed to convert data URL to ArrayBuffer", error);
        return null;
    }
};

const uint8ArrayToBinaryString = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

const b64_to_utf8 = (str: string): string => {
    try {
        const binary_string = atob(str);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        const decoder = new TextDecoder(); // Default is utf-8
        return decoder.decode(bytes);
    } catch (e) {
        console.error("Error in b64_to_utf8:", e);
        return "Error: Could not decode content.";
    }
};

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

const blockElements: { [key: string]: string } = {
    'P': 'Normal text',
    'H1': 'Heading 1',
    'H2': 'Heading 2',
    'H3': 'Heading 3',
    'BLOCKQUOTE': 'Quote'
};

const blockTags: { [key: string]: string } = {
    'Normal text': 'p',
    'Heading 1': 'h1',
    'Heading 2': 'h2',
    'Heading 3': 'h3',
    'Quote': 'blockquote',
};


const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
    asset, 
    onUpdateAsset, 
    onSelectAsset, 
    isSplitViewMode = false,
    animatedLines,
    onClearAnimatedLines,
    aiHasChanges,
    onSaveForSplitView,
}) => {
    const [fileName, setFileName] = useState('');
    const [initialHtml, setInitialHtml] = useState('');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [docxHtml, setDocxHtml] = useState<string | null>(null);
    const [isDocxLoading, setIsDocxLoading] = useState(false);
    const [docxError, setDocxError] = useState<string | null>(null);
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
    const [blockType, setBlockType] = useState('Normal text');
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const isAiEditing = !!animatedLines;

    const updateToolbarState = useCallback(() => {
        if (!editorRef.current) return;
        
        const newFormats = new Set<string>();
        if (document.queryCommandState('bold')) newFormats.add('bold');
        if (document.queryCommandState('italic')) newFormats.add('italic');
        if (document.queryCommandState('insertUnorderedList')) newFormats.add('list');

        const selection = window.getSelection();
        let currentBlockType = 'Normal text';

        if (selection && selection.rangeCount > 0) {
            let node = selection.getRangeAt(0).startContainer;
            if (node.nodeType === 3) {
                node = node.parentNode!;
            }

            while (node && node !== editorRef.current) {
                const nodeName = node.nodeName.toUpperCase();
                if (blockElements[nodeName as keyof typeof blockElements]) {
                    currentBlockType = blockElements[nodeName as keyof typeof blockElements];
                    break;
                }
                 if (nodeName === 'LI') {
                    newFormats.add('list');
                 }
                node = node.parentNode!;
            }
        }
        setBlockType(currentBlockType);
        setActiveFormats(newFormats);
    }, []);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
                setIsStyleDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || isAiEditing) return;
        const handleInteraction = () => requestAnimationFrame(updateToolbarState);
        document.addEventListener('selectionchange', handleInteraction);
        editor.addEventListener('click', handleInteraction);
        editor.addEventListener('keyup', handleInteraction);
        editor.addEventListener('focus', handleInteraction);
        
        const handleInput = () => {
             if (onClearAnimatedLines) onClearAnimatedLines();

             if (isSplitViewMode) {
                const currentHtml = editorRef.current?.innerHTML || '';
                const newContent = `data:text/html;base64,${utf8_to_b64(currentHtml)}`;
                onUpdateAsset({ ...(asset as AttachedFile), content: newContent });
            }
            updateToolbarState();
        };

        editor.addEventListener('input', handleInput);


        return () => {
            document.removeEventListener('selectionchange', handleInteraction);
            editor.removeEventListener('click', handleInteraction);
            editor.removeEventListener('keyup', handleInteraction);
            editor.removeEventListener('focus', handleInteraction);
            editor.removeEventListener('input', handleInput);
        };
    }, [asset, updateToolbarState, isSplitViewMode, onUpdateAsset, isAiEditing, onClearAnimatedLines]);

    useEffect(() => {
        let objectUrl: string | undefined;
        if (asset && asset.type === 'file' && !isAiEditing) {
            setFileName(asset.name);
            setPdfUrl(null);
            setDocxHtml(null);
            setDocxError(null);
            setIsDocxLoading(false);

            const isDocx = asset.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || asset.name.endsWith('.docx');

            if (isDocx && asset.content) {
                setIsDocxLoading(true);
                if (editorRef.current) editorRef.current.innerHTML = '';
    
                const convertDocx = async () => {
                    try {
                        if (typeof mammoth === 'undefined') {
                             throw new Error("Mammoth.js library is not loaded.");
                        }
                        const arrayBuffer = await dataUrlToArrayBuffer(asset.content!);
                        if (arrayBuffer) {
                            const result = await mammoth.convertToHtml({ arrayBuffer });
                            const sanitized = DOMPurify.sanitize(result.value);
                            setDocxHtml(sanitized);
                        } else {
                            throw new Error("Could not create ArrayBuffer from file content.");
                        }
                    } catch (e) {
                        console.error("Error converting DOCX to HTML:", e);
                        setDocxError("Could not render this DOCX file. It might be corrupted or in an unsupported format.");
                    } finally {
                        setIsDocxLoading(false);
                    }
                };
                convertDocx();
            } else if (asset.mimeType === 'application/pdf' && asset.content) {
                const blob = dataUrlToBlob(asset.content);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setPdfUrl(objectUrl);
                } else {
                    setPdfUrl(null);
                }
            } else if (editorRef.current) {
                const isEditableText = 
                    asset.mimeType.startsWith('text/') ||
                    [
                        'application/json', 'application/xml', 'application/sql',
                        'text/markdown', 'application/x-markdown',
                    ].includes(asset.mimeType) ||
                    asset.name.endsWith('.log') || asset.name.endsWith('.sql') || asset.name.endsWith('.md');

                if (asset.content && isEditableText) {
                    const base64Content = asset.content.split(',')[1] || '';
                    const decodedContent = b64_to_utf8(base64Content);
                    let html = decodedContent;
                    
                    if (asset.mimeType.includes('markdown') || asset.name.endsWith('.md')) {
                       if (typeof marked !== 'undefined') {
                            html = marked.parse(decodedContent, { gfm: true, breaks: true });
                        }
                    } else if (!asset.mimeType.includes('html')) { // for text/plain, etc.
                         html = `<p>${decodedContent.replace(/\n/g, '</p><p>')}</p>`;
                    }

                    const sanitizedHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html;
                    if (editorRef.current.innerHTML !== sanitizedHtml) {
                        editorRef.current.innerHTML = sanitizedHtml;
                    }
                    if (!isSplitViewMode) {
                        setInitialHtml(sanitizedHtml);
                    }
                } else {
                    editorRef.current.innerHTML = '';
                    setInitialHtml('');
                }
            }
        } else if (!asset) {
            setFileName('');
            setPdfUrl(null);
            setDocxHtml(null);
            if (editorRef.current) editorRef.current.innerHTML = '';
            setInitialHtml('');
        }
        updateToolbarState();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [asset, updateToolbarState, isSplitViewMode, isAiEditing]);

    if (!asset) {
        return (
            <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-r-xl h-full flex items-center justify-center">
                <p className="text-neutral-500">Select a file or folder to view its content</p>
            </div>
        );
    }
    
    if (asset.type === 'folder') {
        return (
             <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-r-xl h-full flex items-center justify-center overflow-auto">
                <FolderView folder={asset as Folder} onSelectAsset={onSelectAsset} />
            </div>
        )
    }

    const handleSaveText = () => {
        if (asset.type !== 'file' || !editorRef.current) return;
        const currentHtml = editorRef.current.innerHTML;
        const sanitizedHtml = DOMPurify.sanitize(currentHtml);
        const newContent = `data:text/html;base64,${utf8_to_b64(sanitizedHtml)}`;
        onUpdateAsset({
            ...asset,
            name: fileName,
            content: newContent,
            mimeType: 'text/html',
            size: new Blob([sanitizedHtml]).size,
        });
        setInitialHtml(sanitizedHtml);
    };

    const applyStyle = (style: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        const tag = blockTags[style];
        if (tag) {
             // For lists, we use a different command
            if(style === 'Bulleted List') {
                document.execCommand('insertUnorderedList', false);
            } else {
                document.execCommand('formatBlock', false, `<${tag}>`);
            }
        }
        setIsStyleDropdownOpen(false);
        setTimeout(updateToolbarState, 0);
    };

    const applyInlineFormat = (command: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false);
        setTimeout(updateToolbarState, 0);
    };

    const toggleList = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand('insertUnorderedList', false);
        setTimeout(updateToolbarState, 0);
    };

    const toggleQuote = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        const isQuote = blockType === 'Quote';
        document.execCommand('formatBlock', false, isQuote ? '<p>' : '<blockquote>');
        setTimeout(updateToolbarState, 0);
    };


    const currentFile = asset as AttachedFile;
    const isTextChanged = editorRef.current?.innerHTML !== initialHtml;
    const isNameChanged = asset.name !== fileName;
    const isChanged = isTextChanged || isNameChanged;

    const renderContent = () => {
        if (!currentFile.content && !animatedLines) {
            return (
                <div className="text-center p-4">
                    <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">Content not available</h3>
                    <p className="text-neutral-500 mt-2">File content is not loaded. Please re-upload to view.</p>
                </div>
            );
        }
        const getLineClass = (state: string) => {
            switch (state) {
                case 'added': return 'line-added';
                case 'deleted': return 'line-deleted';
                case 'modified': return 'line-modified';
                default: return '';
            }
        };

        if (animatedLines) {
            return (
                 <div className="p-4 h-full flex flex-col w-full">
                     <div className="flex items-center gap-4 mb-2 shrink-0">
                        <span className="flex-grow bg-transparent text-lg font-semibold text-neutral-900 dark:text-neutral-100">{fileName}</span>
                        {isSplitViewMode && <button onClick={() => onSaveForSplitView?.(currentFile)} disabled={!aiHasChanges} className="px-4 py-1.5 text-sm font-medium text-white bg-brand-600 rockstar:bg-rockstar-600 rounded-full hover:bg-brand-700 rockstar:hover:bg-rockstar-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed">
                           Save Changes
                        </button>}
                    </div>
                    <div
                        className="wysiwyg-editor flex-grow w-full h-full overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-700 rockstar:border-neutral-700"
                    >
                        {animatedLines.map((line, i) => (
                           <div key={i} className={getLineClass(line.state)}>{line.text || ' '}</div>
                        ))}
                    </div>
                 </div>
            );
        }


        const isDocx = currentFile.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || currentFile.name.endsWith('.docx');
        if (isDocx) {
            if (isDocxLoading) {
                return <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Rendering DOCX preview...</div>;
            }
            if (docxError) {
                return <div className="p-4 text-center text-red-500 dark:text-red-400">{docxError}</div>;
            }
            if (docxHtml) {
                return (
                    <div className="p-8 h-full w-full overflow-y-auto">
                        <div 
                            className="prose dark:prose-invert rockstar:prose-rockstar max-w-none" 
                            dangerouslySetInnerHTML={{ __html: docxHtml }} 
                        />
                    </div>
                );
            }
        }
        
        if (currentFile.mimeType === 'text/csv' || currentFile.name.toLowerCase().endsWith('.csv')) {
            return <CsvViewer content={currentFile.content} />;
        }

        if (currentFile.mimeType.startsWith('image/')) {
            return <img src={currentFile.content} alt={currentFile.name} className="max-h-full max-w-full object-contain mx-auto" />;
        }
        if (currentFile.mimeType.startsWith('video/')) {
            return (
                <div className="w-full h-full flex items-center justify-center p-4">
                    <video src={currentFile.content} controls className="max-h-full max-w-full rounded-lg">
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }
        if (currentFile.mimeType === 'application/pdf') {
            return pdfUrl ? <iframe src={pdfUrl} className="w-full h-full border-0" title={currentFile.name} /> : <p className="text-neutral-500 dark:text-neutral-400">Loading PDF...</p>;
        }
        
        const isEditableText = 
            currentFile.mimeType.startsWith('text/') ||
            [
                'application/json', 'application/xml', 'application/sql',
                'text/markdown', 'application/x-markdown',
            ].includes(currentFile.mimeType) ||
            currentFile.name.endsWith('.log') || currentFile.name.endsWith('.sql') || currentFile.name.endsWith('.md');

        if (isEditableText) {
            return (
                <div className="p-4 h-full flex flex-col w-full">
                    <div className="flex items-center gap-4 mb-2 shrink-0">
                        <input
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="flex-grow bg-transparent text-lg font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none border-b-2 border-transparent focus:border-brand-500 rockstar:focus:border-rockstar-500"
                            disabled={isAiEditing}
                        />
                        <button onClick={isSplitViewMode ? () => onSaveForSplitView?.(currentFile) : handleSaveText} disabled={!(isChanged || aiHasChanges)} className="px-4 py-1.5 text-sm font-medium text-white bg-brand-600 rockstar:bg-rockstar-600 rounded-full hover:bg-brand-700 rockstar:hover:bg-rockstar-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed">
                           {isSplitViewMode ? 'Save Changes' : 'Save'}
                        </button>
                    </div>
                    {!isAiEditing && (
                        <div ref={toolbarRef} className="flex items-center gap-2 mb-2 p-1 bg-neutral-100 dark:bg-neutral-900 rockstar:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800 rounded-lg shrink-0">
                            <div className="relative">
                                <button onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50">
                                    {blockType}
                                    <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                {isStyleDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-40 bg-neutral-50 dark:bg-neutral-800 rockstar:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rockstar:border-neutral-700 rounded-md shadow-lg z-10">
                                        {Object.keys(blockTags).map(style => (
                                            <button key={style} onClick={() => applyStyle(style)} className={`block w-full text-left px-3 py-1.5 text-sm ${blockType === style ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50'}`}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                            <button onClick={() => applyInlineFormat('bold')} title="Bold" className={`p-2 rounded ${activeFormats.has('bold') ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50'}`}><BoldIcon /></button>
                            <button onClick={() => applyInlineFormat('italic')} title="Italic" className={`p-2 rounded ${activeFormats.has('italic') ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50'}`}><ItalicIcon /></button>
                            <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                            <button onClick={toggleList} title="Bulleted List" className={`p-2 rounded ${activeFormats.has('list') ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50'}`}><ListIcon /></button>
                            <button onClick={toggleQuote} title="Blockquote" className={`p-2 rounded ${blockType === 'Quote' ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50'}`}><QuoteIcon /></button>
                        </div>
                    )}
                    <div
                        ref={editorRef}
                        contentEditable={!isAiEditing}
                        className="wysiwyg-editor flex-grow w-full h-full overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 rounded-md border border-neutral-200 dark:border-neutral-700 rockstar:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rockstar:focus:ring-rockstar-500"
                    />
                </div>
            );
        }
        return (
            <div className="text-center p-4">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-300">Preview not available</h3>
                <p className="text-neutral-500 dark:text-neutral-500 mt-2">Cannot display files of type: {currentFile.mimeType}</p>
            </div>
        );
    };

    const containerClasses = isSplitViewMode 
        ? "bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 rounded-xl h-full flex items-center justify-center overflow-auto"
        : "bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-r-xl h-full flex items-center justify-center overflow-auto";

    return (
        <div className={containerClasses}>
            {renderContent()}
        </div>
    );
};

export default DocumentViewer;