

import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../types';
import { EditIcon } from './icons/EditIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { getAssetIcon } from '../utils/getAssetIcon';

interface FileExplorerProps {
    assets: Asset[];
    selectedAsset: Asset | null;
    onSelectAsset: (asset: Asset) => void;
    onRenameAsset: (assetId: string, newName: string) => void;
    onMoveAsset: (draggedId: string, targetFolderId: string | null) => void;
}

const AssetItem: React.FC<{ 
    asset: Asset; 
    level: number;
    selectedAsset: Asset | null;
    onSelectAsset: (asset: Asset) => void;
    onRenameAsset: (assetId: string, newName: string) => void;
    onMoveAsset: (draggedId: string, targetFolderId: string | null) => void;
}> = ({ asset, level, selectedAsset, onSelectAsset, onRenameAsset, onMoveAsset }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState(asset.name);
    const [isDragOver, setIsDragOver] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isRenaming && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [isRenaming]);
    
    const handleRename = () => {
        if (name.trim() && name !== asset.name) {
            onRenameAsset(asset.id, name.trim());
        }
        setIsRenaming(false);
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('assetId', asset.id);
        e.dataTransfer.setData('assetName', asset.name);
        e.dataTransfer.setData('assetType', asset.type);
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData('assetId');
        if (draggedId && draggedId !== asset.id) {
            onMoveAsset(draggedId, asset.type === 'folder' ? asset.id : null);
        }
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (asset.type === 'folder') {
            setIsDragOver(true);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const isSelected = selectedAsset?.id === asset.id;

    return (
        <li>
            <div
                onClick={() => onSelectAsset(asset)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full flex items-center gap-1 text-left p-1 rounded-md transition-colors text-sm group ${
                    isSelected ? 'bg-brand-500 dark:bg-brand-800/60 rockstar:bg-rockstar-900 text-white' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rockstar:hover:bg-neutral-800/70'
                } ${isDragOver ? 'bg-brand-100/50 dark:bg-brand-700/50 rockstar:bg-rockstar-500/50' : ''}`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
                draggable="true"
                onDragStart={handleDragStart}
            >
                {asset.type === 'folder' && (
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="p-1 rounded hover:bg-black/10 dark:hover:bg-neutral-700/50">
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                )}
                
                <span className="shrink-0 ml-1">{getAssetIcon(asset)}</span>

                {isRenaming ? (
                    <input
                        ref={renameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="flex-grow bg-white dark:bg-neutral-900 border border-brand-500 rounded px-1 py-0 text-neutral-900 dark:text-white outline-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="truncate flex-grow mx-1">{asset.name}</span>
                )}
                
                {!isRenaming && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
                        className="shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-neutral-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <EditIcon />
                    </button>
                )}
            </div>
            {asset.type === 'folder' && isExpanded && asset.children.length > 0 && (
                <ul>
                    {asset.children.map(child => (
                        <AssetItem 
                            key={child.id} 
                            asset={child} 
                            level={level + 1} 
                            selectedAsset={selectedAsset}
                            onSelectAsset={onSelectAsset}
                            onRenameAsset={onRenameAsset}
                            onMoveAsset={onMoveAsset}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ assets, selectedAsset, onSelectAsset, onRenameAsset, onMoveAsset }) => {
    return (
        <div className="flex-grow overflow-y-auto p-2">
            {assets.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 p-4">No files yet.</p>
            ) : (
                <ul className="space-y-1">
                    {assets.map((asset) => (
                        <AssetItem 
                            key={asset.id} 
                            asset={asset} 
                            level={0}
                            selectedAsset={selectedAsset}
                            onSelectAsset={onSelectAsset}
                            onRenameAsset={onRenameAsset}
                            onMoveAsset={onMoveAsset}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileExplorer;