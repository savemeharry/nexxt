

import React, { useState, useEffect, useRef } from 'react';
import { CompanyCardData, Asset, User } from '../types';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { SearchIcon } from './icons/SearchIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { getAssetIcon } from '../utils/getAssetIcon';

interface CompanyCardProps {
    card: CompanyCardData;
    users: User[];
    onSelect: () => void;
    onResearchFromProject: (card: CompanyCardData) => void;
    onEdit: (card: CompanyCardData) => void;
    onArchive: (id: string) => void;
}

const categoryColors: Record<string, string> = {
    'Startup': 'border-l-blue-500 dark:border-l-blue-500 rockstar:border-l-rockstar-cyan rockstar:shadow-[0_0_15px_-3px_theme(colors.rockstar.cyan)]',
    'Idea': 'border-l-purple-500 dark:border-l-purple-500 rockstar:border-l-rockstar-purple rockstar:shadow-[0_0_15px_-3px_theme(colors.rockstar.purple)]',
    'Hypothesis': 'border-l-yellow-500 dark:border-l-yellow-400 rockstar:border-l-yellow-400 rockstar:shadow-[0_0_15px_-3px_theme(colors.rockstar.400)]',
};

const countFiles = (assets: Asset[]): number => {
    let count = 0;
    for (const asset of assets) {
        if (asset.type === 'file') {
            count++;
        } else if (asset.type === 'folder') {
            count += countFiles(asset.children);
        }
    }
    return count;
};

const CompanyCard: React.FC<CompanyCardProps> = ({ card, users, onSelect, onResearchFromProject, onEdit, onArchive }) => {
    const totalFiles = countFiles(card.assets);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setIsMenuOpen(false);
    };

    return (
        <div 
            onClick={onSelect}
            className={`relative group bg-white dark:bg-neutral-900/60 rockstar:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800 rounded-xl p-6 flex flex-col h-full hover:border-brand-400 dark:hover:border-brand-700/60 rockstar:hover:border-rockstar-500 transition-all duration-300 border-l-4 ${categoryColors[card.category] ?? 'border-l-neutral-600'} text-left w-full cursor-pointer`}
        >
             <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                <button 
                    onClick={(e) => handleActionClick(e, () => onResearchFromProject(card))}
                    className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 hover:bg-brand-500 dark:hover:bg-brand-600 rockstar:hover:bg-rockstar-600 text-neutral-500 dark:text-neutral-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Start research from this project"
                >
                    <SearchIcon />
                </button>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(prev => !prev);
                        }}
                        className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="More options"
                    >
                        <DotsVerticalIcon />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-neutral-100 dark:bg-neutral-800/90 rockstar:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/50 rockstar:border-neutral-700/50 rounded-lg shadow-xl p-1.5 animate-scale-in-out origin-top-right">
                             <button
                                onClick={(e) => handleActionClick(e, () => onEdit(card))}
                                className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50"
                            >
                                <EditIcon /> Edit
                            </button>
                             <button
                                onClick={(e) => handleActionClick(e, () => onArchive(card.id))}
                                className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50"
                            >
                                <TrashIcon /> Archive
                            </button>
                        </div>
                    )}
                </div>
             </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 pr-20">{card.title}</h3>
                    <span className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-700/80 rockstar:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 rounded-md px-2 py-1 whitespace-nowrap shrink-0">{card.category}</span>
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4 line-clamp-2">{card.description}</p>
                
                {card.assets && card.assets.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Project Composition</h4>
                        <ul className="space-y-1">
                            {card.assets.slice(0, 3).map(asset => (
                                <li key={asset.id} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    <span className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0">{getAssetIcon(asset, 'w-4 h-4')}</span>
                                    <span className="truncate">{asset.name}</span>
                                </li>
                            ))}
                            {card.assets.length > 3 && (
                                <li className="text-xs text-neutral-500 dark:text-neutral-500 pl-6">...and {card.assets.length - 3} more</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <PaperclipIcon />
                        <span>{totalFiles} files</span>
                    </div>
                    <div className="flex -space-x-2">
                        {card.members?.map(member => (
                            <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 rockstar:border-black" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyCard;