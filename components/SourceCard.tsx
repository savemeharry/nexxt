import React from 'react';
import { SolutionCard, GroundingSource } from '../types';

interface SourceCardProps {
    source: SolutionCard | GroundingSource;
    index?: number;
    compact?: boolean;
}

const getFavicon = (url: string): string => {
    try {
        const domain = new URL(url).hostname;
        // Try multiple high-quality favicon services
        return `https://logo.clearbit.com/${domain}`;
    } catch {
        return `https://logo.clearbit.com/google.com`;
    }
};

const getFallbackFavicon = (url: string): string => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return `https://www.google.com/s2/favicons?domain=google.com&sz=64`;
    }
};

const getDomain = (url: string): string => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'Unknown source';
    }
};

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
};

export const SourceCard: React.FC<SourceCardProps> = ({ source, index, compact = false }) => {
    const link = 'link' in source ? source.link : source.uri;
    const title = source.title || getDomain(link || '');
    const description = 'description' in source ? source.description : '';

    if (!link) {
        return null;
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group relative inline-flex items-center gap-3 px-4 py-3 
                bg-white/80 dark:bg-neutral-800/80 rockstar:bg-neutral-900/80
                border border-neutral-200/60 dark:border-neutral-700/60 rockstar:border-rockstar-800/60
                rounded-xl shadow-sm
                hover:bg-white dark:hover:bg-neutral-800 rockstar:hover:bg-neutral-900
                hover:border-neutral-300 dark:hover:border-neutral-600 rockstar:hover:border-rockstar-700
                hover:shadow-md
                transition-all duration-200 ease-out
                text-left max-w-full
                ${compact ? 'text-sm' : 'text-base'}
            `}
            title={link}
        >
            {/* Индекс источника */}
            {index !== undefined && (
                <div className="
                    flex items-center justify-center w-6 h-6 
                    bg-brand-100 dark:bg-brand-900/50 rockstar:bg-rockstar-purple/20
                    text-brand-700 dark:text-brand-300 rockstar:text-rockstar-purple
                    rounded-full text-xs font-semibold shrink-0
                ">
                    {index + 1}
                </div>
            )}

            {/* Иконка сайта */}
            <div className="relative shrink-0">
                <div className="
                    w-7 h-7 rounded-full overflow-hidden 
                    bg-neutral-100 dark:bg-neutral-700 rockstar:bg-neutral-800
                    border border-neutral-200 dark:border-neutral-600 rockstar:border-rockstar-700
                    flex items-center justify-center p-0.5
                ">
                    <img
                        src={getFavicon(link)}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Try fallback favicon service
                            if (target.src.includes('clearbit')) {
                                target.src = getFallbackFavicon(link);
                                return;
                            }
                            // If both fail, show default icon
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                    <svg class="w-4 h-4 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path>
                                    </svg>
                                `;
                            }
                        }}
                    />
                </div>
            </div>

            {/* Контент */}
            <div className="flex-1 min-w-0">
                <div className="
                    font-medium text-neutral-900 dark:text-neutral-100 rockstar:text-neutral-100
                    group-hover:text-brand-700 dark:group-hover:text-brand-300 rockstar:group-hover:text-rockstar-purple
                    transition-colors duration-200
                ">
                    {truncateText(title, compact ? 40 : 60)}
                </div>
                
                {description && (
                    <div className="
                        text-neutral-600 dark:text-neutral-400 rockstar:text-neutral-400
                        text-sm mt-1 leading-relaxed
                    ">
                        {truncateText(description, compact ? 60 : 100)}
                    </div>
                )}
                
                <div className="
                    text-neutral-500 dark:text-neutral-500 rockstar:text-neutral-500
                    text-xs mt-1 font-mono
                ">
                    {getDomain(link)}
                </div>
            </div>

            {/* Иконка внешней ссылки */}
            <div className="
                text-neutral-400 dark:text-neutral-500 rockstar:text-neutral-500
                group-hover:text-brand-600 dark:group-hover:text-brand-400 rockstar:group-hover:text-rockstar-purple
                transition-colors duration-200 shrink-0
            ">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
        </button>
    );
};

interface SourcesListProps {
    sources: (SolutionCard | GroundingSource)[];
    title?: string;
    compact?: boolean;
    showIndexes?: boolean;
    maxSources?: number;
}

export const SourcesList: React.FC<SourcesListProps> = ({ 
    sources, 
    title = "Источники", 
    compact = false,
    showIndexes = true,
    maxSources = 8
}) => {
    const validSources = sources
        .filter(source => {
            const link = 'link' in source ? source.link : source.uri;
            return link && link.trim();
        })
        .slice(0, maxSources);

    if (validSources.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="
                text-sm font-semibold 
                text-neutral-700 dark:text-neutral-300 rockstar:text-neutral-300
                flex items-center gap-2
            ">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {title}
            </h4>
            
            <div className={`
                grid gap-2
                ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}
            `}>
                {validSources.map((source, index) => (
                    <SourceCard
                        key={index}
                        source={source}
                        index={showIndexes ? index : undefined}
                        compact={compact}
                    />
                ))}
            </div>
        </div>
    );
};
