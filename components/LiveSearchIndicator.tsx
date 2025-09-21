import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface LiveSearchIndicatorProps {
    isSearching: boolean;
    searchQueries?: string[];
    foundSources?: string[];
}

export const LiveSearchIndicator: React.FC<LiveSearchIndicatorProps> = ({ 
    isSearching, 
    searchQueries = [], 
    foundSources = [] 
}) => {
    // Always show when web search is active, even without queries/sources
    // Only hide if nothing is happening at all

    return (
        <div className="
            mb-3 p-4 rounded-xl border
            bg-gradient-to-r from-brand-50/80 to-blue-50/80
            dark:from-brand-900/20 dark:to-blue-900/20
            rockstar:from-rockstar-purple/10 rockstar:to-purple-900/10
            border-brand-200/60 dark:border-brand-700/60 rockstar:border-rockstar-purple/30
            backdrop-blur-sm
        ">
            <div className="flex items-center gap-2 mb-2">
                <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${isSearching 
                        ? 'bg-brand-500 text-white animate-pulse' 
                        : 'bg-green-500 text-white'
                    }
                `}>
                    <SearchIcon />
                </div>
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300 rockstar:text-rockstar-purple">
                    {isSearching ? 'Поиск в интернете...' : foundSources.length > 0 ? `Найдено источников: ${foundSources.length}` : 'Веб-поиск включен'}
                </span>
            </div>

            {searchQueries.length > 0 && (
                <div className="mb-2">
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Поисковые запросы:
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {searchQueries.map((query, index) => (
                            <span
                                key={index}
                                className="
                                    inline-block px-2 py-1 text-xs rounded-full
                                    bg-brand-100 dark:bg-brand-800/50 rockstar:bg-rockstar-purple/20
                                    text-brand-700 dark:text-brand-300 rockstar:text-rockstar-purple
                                    border border-brand-200 dark:border-brand-700 rockstar:border-rockstar-purple/50
                                "
                            >
                                {query}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {foundSources.length > 0 && (
                <div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        Найденные источники:
                    </div>
                    <div className="space-y-1">
                        {foundSources.slice(0, 5).map((source, index) => (
                            <div
                                key={index}
                                className="
                                    flex items-center gap-2 text-xs
                                    text-neutral-700 dark:text-neutral-300 rockstar:text-neutral-300
                                    animate-fade-in
                                "
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="truncate max-w-xs">
                                    {source}
                                </span>
                            </div>
                        ))}
                        {foundSources.length > 5 && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 ml-4">
                                и ещё {foundSources.length - 5} источников...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
