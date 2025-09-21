import React, { useState, useEffect, useRef } from 'react';
import { AttachedFile, ChatMessage, FileOperation, PatchFileOperation, PatchAction } from '../types';
import DocumentViewer from './DocumentViewer';
import ChatDisplay from './ChatDisplay';
import ChatBar from './ChatBar';
import { CloseIcon } from './icons/CloseIcon';
import AIFeedbackDisplay from './AIFeedbackDisplay';

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
        console.error("Error in b64_to_utf8:", e);
        return "Error: Could not decode content.";
    }
};

const utf8_to_b64 = (str: string): string => {
    try {
        const encoder = new TextEncoder();
        const uint8array = encoder.encode(str);
        const binaryString = Array.from(uint8array).map(byte => String.fromCharCode(byte)).join('');
        return btoa(binaryString);
    } catch (e) {
        console.error("Error in utf8_to_b64:", e);
        return "";
    }
};


const applyPatches = (originalContent: string, patches: PatchAction[]): { newContent: string, animatedLines: { text: string; state: string }[] } => {
    let lines = originalContent.split('\n');
    let lineStates = lines.map(text => ({ text, state: 'normal' as 'normal' | 'added' | 'deleted' | 'modified' }));

    // Deconstruct REPLACE into DELETE + INSERT for simpler processing
    // FIX: Correctly type `decomposedPatches` as a discriminated union of INSERT and DELETE actions
    // to allow TypeScript to correctly infer types and properties.
    const decomposedPatches: Extract<PatchAction, { type: 'INSERT' | 'DELETE' }>[] = [];
    patches.forEach(p => {
        if (p.type === 'REPLACE') {
            decomposedPatches.push({ type: 'DELETE', lineNumber: p.lineNumber, count: 1 });
            decomposedPatches.push({ type: 'INSERT', afterLineNumber: p.lineNumber - 1, content: p.content });
        } else {
            decomposedPatches.push(p);
        }
    });

    // Handle deletions first, in reverse order to preserve line numbers
    const deletePatches = decomposedPatches.filter((p): p is Extract<PatchAction, {type: 'DELETE'}> => p.type === 'DELETE').sort((a, b) => b.lineNumber - a.lineNumber);
     for (const patch of deletePatches) {
        const index = patch.lineNumber - 1;
        const count = patch.count || 1;
        const deleted = lineStates.splice(index, count);
        deleted.forEach(d => {
            lineStates.splice(index, 0, { ...d, state: 'deleted' });
        });
    }

    // Handle insertions, in reverse order
    const insertPatches = decomposedPatches.filter((p): p is Extract<PatchAction, {type: 'INSERT'}> => p.type === 'INSERT').sort((a, b) => b.afterLineNumber - a.afterLineNumber);
    for (const patch of insertPatches) {
        const index = patch.afterLineNumber;
        const newLines = patch.content.map(text => ({ text, state: 'added' as const }));
        lineStates.splice(index + 1, 0, ...newLines);
    }

    const newContent = lineStates.filter(l => l.state !== 'deleted').map(l => l.text).join('\n');
    return { newContent, animatedLines: lineStates };
};


interface SplitViewProps {
    asset: AttachedFile;
    messages: ChatMessage[];
    isLoading: boolean;
    onPauseSession: (currentAsset: AttachedFile, currentMessages: ChatMessage[]) => void;
    onSendMessage: (message: string, attachedFileIds: string[], options?: { fileContentOverride?: string }) => void;
    onSaveFile: (operations: FileOperation[]) => void;
    pendingPatches: PatchFileOperation | null;
    onPatchesConsumed: () => void;
    onClearPausedSession?: () => void;
    onMarkAsUnsaved?: () => void;
    isPausedSession?: boolean;
    onCloseSplitView?: () => void;
}

const SplitView: React.FC<SplitViewProps> = ({ 
    asset, 
    messages, 
    isLoading, 
    onPauseSession, 
    onSendMessage, 
    onSaveFile,
    pendingPatches,
    onPatchesConsumed,
    onClearPausedSession,
    onMarkAsUnsaved,
    isPausedSession = false,
    onCloseSplitView
}) => {
    const [localAsset, setLocalAsset] = useState(asset);
    const [animatedLines, setAnimatedLines] = useState<{ text: string; state: string }[] | null>(null);
    const [hasPendingAiChanges, setHasPendingAiChanges] = useState(false);
    const localAssetRef = useRef(asset);

    useEffect(() => {
        setLocalAsset(asset);
        localAssetRef.current = asset;
        setAnimatedLines(null);
        setHasPendingAiChanges(false);
    }, [asset]);

    useEffect(() => {
        if (pendingPatches) {
            // Check if the patch is for the current asset
            const patchPath = pendingPatches.path || '';
            const patchBaseName = patchPath.split('/').pop() || patchPath;
            const currentName = localAssetRef.current.name;
            const currentId = localAssetRef.current.id;

            if (patchBaseName === currentName || patchPath === currentId) {
                
                const base64 = localAssetRef.current.content?.split(',')[1] || '';
                const originalContent = b64_to_utf8(base64);
                
                const { newContent, animatedLines: newAnimatedLines } = applyPatches(originalContent, pendingPatches.patches);
                
                setAnimatedLines(newAnimatedLines);
                setHasPendingAiChanges(true);

                const updatedAsset: AttachedFile = { 
                    ...localAssetRef.current, 
                    content: `data:text/plain;base64,${utf8_to_b64(newContent)}`, 
                    mimeType: 'text/plain' 
                };
                
                setLocalAsset(updatedAsset);
                localAssetRef.current = updatedAsset;
                
                onPatchesConsumed();
                onMarkAsUnsaved?.(); // Mark as unsaved when AI makes changes
            }
        }
    }, [pendingPatches, onPatchesConsumed, asset.name]);


    const handleUserContentUpdate = (updatedAsset: AttachedFile) => {
        setLocalAsset(updatedAsset);
        localAssetRef.current = updatedAsset;
        if (animatedLines) {
            setAnimatedLines(null);
            setHasPendingAiChanges(false);
        }
    };

    const handleSaveFromDocumentViewer = (updatedAsset: AttachedFile) => {
        // Update local asset
        setLocalAsset(updatedAsset);
        localAssetRef.current = updatedAsset;
        
        // Save to file system
        const content = updatedAsset.content?.includes('base64,') 
            ? b64_to_utf8(updatedAsset.content.split(',')[1])
            : '';
            
        const saveOperation: FileOperation = {
            operation: 'EDIT_FILE',
            path: updatedAsset.name,
            content: content,
        };
        onSaveFile([saveOperation]);
        
        // Clear AI changes state
        setAnimatedLines(null);
        setHasPendingAiChanges(false);
        
        // Clear paused session since we saved (only for paused sessions)
        if (isPausedSession) {
            onClearPausedSession?.();
        }
    };

    const handleSaveAiChanges = () => {
        // Save the current localAsset (which contains AI changes) to file system
        const content = localAssetRef.current.content?.includes('base64,') 
            ? b64_to_utf8(localAssetRef.current.content.split(',')[1])
            : '';
            
        const saveOperation: FileOperation = {
            operation: 'EDIT_FILE',
            path: localAssetRef.current.name,
            content: content,
        };
        onSaveFile([saveOperation]);
        
        // Clear AI changes state
        setAnimatedLines(null);
        setHasPendingAiChanges(false);
        
        // Clear paused session since we saved (only for paused sessions)
        if (isPausedSession) {
            onClearPausedSession?.();
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-neutral-950/80 backdrop-blur-md flex flex-col animate-fade-scale-in">
            <header className="flex items-center justify-between p-4 border-b border-neutral-800/80 shrink-0">
                 <h2 className="text-xl font-bold text-neutral-100">AI Editing Session</h2>
                 <button
                    onClick={() => {
                        if (hasPendingAiChanges) {
                            onPauseSession(localAssetRef.current, messages);
                        } else {
                            onCloseSplitView && onCloseSplitView();
                        }
                    }}
                    className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    aria-label="Close editing session"
                >
                    <CloseIcon />
                </button>
            </header>
            <div className="flex-grow flex min-h-0">
                {/* Left Panel: Document Viewer */}
                <div className="w-1/2 h-full p-4">
                     <DocumentViewer
                        asset={localAsset}
                        onUpdateAsset={handleUserContentUpdate}
                        onSelectAsset={() => {}} // Not needed in split view
                        isSplitViewMode={true}
                        animatedLines={animatedLines}
                        onClearAnimatedLines={() => {
                            setAnimatedLines(null);
                            setHasPendingAiChanges(false);
                        }}
                        aiHasChanges={hasPendingAiChanges}
                        onSaveForSplitView={animatedLines ? handleSaveAiChanges : handleSaveFromDocumentViewer}
                    />
                </div>
                {/* Right Panel: Chat */}
                <div className="w-1/2 h-full flex flex-col border-l border-neutral-800/80">
                    <div className="flex-grow overflow-y-auto">
                         <ChatDisplay 
                            messages={messages} 
                            isLoading={isLoading} 
                            onSelectProject={() => {}} 
                        />
                    </div>
                    <div className="p-4 border-t border-neutral-800/80 shrink-0">
                        {isLoading && !animatedLines && <div className="mb-2"><AIFeedbackDisplay stage="Thinking..." files={[]} /></div>}
                        <ChatBar
                            onSendMessage={(msg) => onSendMessage(msg, [asset.id], { fileContentOverride: localAssetRef.current.content })}
                            isLoading={isLoading}
                            onShowChat={() => {}}
                            hasMessages={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitView;