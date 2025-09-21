

import React, { useState } from 'react';
import { CompanyCardData, User } from '../types';
import CompanyCard from './CompanyCard';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface WorkViewProps {
    cards: CompanyCardData[];
    archivedCount: number;
    users: User[];
    onShowAddCardModal: () => void;
    onSelectCard: (id: string) => void;
    onResearchFromProject: (card: CompanyCardData) => void;
    onEditCard: (card: CompanyCardData) => void;
    onArchiveCard: (id: string) => void;
    onShowArchiveModal: () => void;
}

const WorkView: React.FC<WorkViewProps> = ({ 
    cards, 
    archivedCount,
    users,
    onShowAddCardModal, 
    onSelectCard, 
    onResearchFromProject,
    onEditCard,
    onArchiveCard,
    onShowArchiveModal,
}) => {

    return (
        <div className="animate-fade-scale-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">All Projects</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your projects, ideas, and businesses.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={onShowArchiveModal}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors w-full sm:w-auto justify-center"
                    >
                        <TrashIcon />
                        Archive
                        {archivedCount > 0 && (
                            <span className="ml-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {archivedCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={onShowAddCardModal}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-600 rockstar:bg-rockstar-600 text-white rounded-full hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-colors w-full sm:w-auto justify-center"
                    >
                        <PlusIcon />
                        Add Project
                    </button>
                </div>
            </header>

            {cards.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center">
                    <img src="https://higgsfield.ai/_next/image?url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_325JgdX3BRXQoNum4750JYlQHGd%2F7ea5bc19-dc4b-4385-aec7-c26f5beb8d3c_min.webp&w=3840&q=75" alt="Empty folder" className="w-32 h-32 opacity-30 mb-4 object-contain" />
                    <h3 className="text-xl font-semibold text-neutral-300 mt-4">Your workspace is empty.</h3>
                    <p className="text-neutral-500 mt-2 max-w-sm">Create your first project to centralize documents and use the AI Co-Pilot for your active business.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map(card => (
                        <CompanyCard 
                            key={card.id} 
                            card={card} 
                            users={users}
                            onSelect={() => onSelectCard(card.id)}
                            onResearchFromProject={onResearchFromProject}
                            onEdit={onEditCard}
                            onArchive={onArchiveCard}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkView;