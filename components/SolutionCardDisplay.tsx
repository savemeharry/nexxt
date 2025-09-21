

import React from 'react';
import { SolutionCard } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface SolutionCardDisplayProps {
    card: SolutionCard;
    compact?: boolean;
}

const CardContent: React.FC<{ card: SolutionCard; compact?: boolean }> = ({ card, compact }) => {
    const truncate = (text: string, max: number) => (text.length > max ? text.slice(0, max - 1) + '…' : text);
    return (
        <div className="bg-neutral-800/80 rounded-lg p-3 w-full max-w-xs group transition-all duration-300 border border-neutral-700/60 hover:border-brand-700/50 hover:bg-neutral-800">
             <div className="flex items-start gap-3">
                <div className="mt-1 text-neutral-500 group-hover:text-brand-400 transition-colors">
                    <LinkIcon />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-neutral-100">{compact ? truncate(card.title || 'Link', 60) : (card.title || 'Link')}</h4>
                    {card.description && (
                        <p className="text-xs text-neutral-400 mt-1">{compact ? truncate(card.description, 80) : card.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export const SolutionCardDisplay: React.FC<SolutionCardDisplayProps> = ({ card, compact }) => {
    if (card.link) {
        return (
            <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
                <CardContent card={card} compact={compact} />
            </a>
        );
    }

    return <CardContent card={card} compact={compact} />;
};