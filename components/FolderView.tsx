
import React from 'react';
import { Folder, Asset } from '../types';
import { getAssetIcon } from '../utils/getAssetIcon';

interface FolderViewProps {
    folder: Folder;
    onSelectAsset: (asset: Asset) => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ folder, onSelectAsset }) => {
    return (
        <div className="p-6 h-full w-full overflow-y-auto">
            <h2 className="text-xl font-bold text-neutral-200 mb-6 border-b border-neutral-800 pb-2">
                {folder.name}
            </h2>
            {folder.children.length === 0 ? (
                <p className="text-neutral-500">This folder is empty.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {folder.children.map(asset => (
                        <button
                            key={asset.id}
                            onClick={() => onSelectAsset(asset)}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-neutral-800/70 transition-colors text-center group"
                        >
                            <div className="w-16 h-16 mb-2 text-neutral-400 group-hover:text-brand-400 transition-colors">
                                {getAssetIcon(asset, 'w-full h-full')}
                            </div>
                            <span className="text-xs text-neutral-300 break-all line-clamp-2">
                                {asset.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
