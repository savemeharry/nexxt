

import React from 'react';
import { CompanyCardData } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { RestoreIcon } from './icons/RestoreIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: CompanyCardData[];
    onRestore: (id: string) => void;
    onDeletePermanently: (id: string) => void;
    onEmptyTrash: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, cards, onRestore, onDeletePermanently, onEmptyTrash }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-neutral-100">Archive</h2>
                        <p className="text-sm text-neutral-500">Archived projects can be restored or permanently deleted.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto flex-grow">
                    {cards.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">Archive is empty.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {cards.map(card => (
                                <li key={card.id} className="bg-neutral-800/60 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-neutral-200">{card.title}</p>
                                        <p className="text-sm text-neutral-400 line-clamp-1">{card.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        <button onClick={() => onRestore(card.id)} className="p-2 rounded-full text-neutral-300 hover:bg-neutral-700/50 hover:text-white" title="Unarchive project">
                                            <RestoreIcon />
                                        </button>
                                        <button onClick={() => onDeletePermanently(card.id)} className="p-2 rounded-full text-red-500/80 hover:bg-red-900/40 hover:text-red-400" title="Delete permanently">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <footer className="flex justify-between items-center p-6 border-t border-neutral-800 shrink-0">
                    <button 
                        onClick={onEmptyTrash} 
                        disabled={cards.length === 0}
                        className="px-4 py-2 text-sm font-medium text-red-500/80 rounded-md hover:bg-red-900/40 hover:text-red-400 disabled:text-neutral-500 disabled:bg-transparent disabled:cursor-not-allowed"
                    >
                        Clear Archive
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700">Done</button>
                </footer>
            </div>
        </div>
    );
};

export default ArchiveModal;