

import React from 'react';
import { CompanyCardData, Asset } from '../types';
import { ScopeIcon } from './icons/ScopeIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { CloseIcon } from './icons/CloseIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ContextualResearchViewProps {
    project: CompanyCardData;
    onPerformResearch: (analysisType: string) => void;
    onClearContext: () => void;
}

const countFiles = (assets: Asset[]): number => {
    let count = 0;
    const traverse = (currentAssets: Asset[]) => {
        for (const asset of currentAssets) {
            if (asset.type === 'file') {
                count++;
            } else if (asset.type === 'folder') {
                traverse(asset.children);
            }
        }
    };
    traverse(assets);
    return count;
};

const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; description: string; onClick: () => void }> = ({ icon, label, description, onClick }) => (
    <button 
        onClick={onClick}
        className="text-left p-4 bg-neutral-800/50 border border-neutral-700/60 rounded-lg hover:bg-neutral-800/80 hover:border-brand-700/50 transition-all duration-200 w-full"
    >
        <div className="flex items-center mb-1">
            <div className="w-5 h-5 mr-3 text-neutral-300">{icon}</div>
            <h4 className="font-semibold text-neutral-100">{label}</h4>
        </div>
        <p className="text-sm text-neutral-400 pl-8">{description}</p>
    </button>
);

const ContextualResearchView: React.FC<ContextualResearchViewProps> = ({ project, onPerformResearch, onClearContext }) => {
    const totalFiles = countFiles(project.assets);

    return (
        <div className="space-y-6 animate-fade-scale-in">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative">
                 <button onClick={onClearContext} className="absolute top-3 right-3 p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Clear research context">
                    <CloseIcon />
                </button>
                <p className="text-sm text-neutral-400 mb-1">Researching in context of:</p>
                <h2 className="text-2xl font-bold text-neutral-100 pr-8">{project.title}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-400 mt-3 pt-3 border-t border-neutral-800">
                    <span className="text-xs font-semibold bg-neutral-700/80 text-neutral-300 rounded-md px-2 py-1 whitespace-nowrap shrink-0">{project.category}</span>
                    <div className="flex items-center gap-1.5">
                        <PaperclipIcon />
                        <span>{totalFiles} document{totalFiles !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon />
                         <span>Last analyzed: {formatDate(project.lastSummarized)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <ActionButton 
                    icon={<ScopeIcon />}
                    label="Deep Dive Analysis"
                    description="SWOT, target audience viability, risks & opportunities."
                    onClick={() => onPerformResearch('deep-dive')}
                />
                 <ActionButton 
                    icon={<ShieldExclamationIcon />}
                    label="Competitor Analysis"
                    description="Identify and analyze top competitors in this niche."
                    onClick={() => onPerformResearch('competitors')}
                />
                 <ActionButton 
                    icon={<TrendingUpIcon />}
                    label="Market Trend Alignment"
                    description="Assess how the project fits with current and future trends."
                    onClick={() => onPerformResearch('trends')}
                />
            </div>
             <p className="text-center text-sm text-neutral-500 pt-2">
                Or, use the search bar below for a custom query about this project.
            </p>
        </div>
    );
};

export default ContextualResearchView;