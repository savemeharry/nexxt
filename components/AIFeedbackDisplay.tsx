

import React from 'react';
import { ThinkingAnimationIcon } from './icons/ThinkingAnimationIcon';
import { FileIcon } from './icons/FileIcon';

interface AIFeedbackDisplayProps {
    stage: string;
    files: string[];
    searchQueries?: string[];
    foundSources?: string[];
    isWebSearch?: boolean;
}

const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({ 
    stage, 
    files, 
    searchQueries = [], 
    foundSources = [], 
    isWebSearch = false 
}) => {
    const handleStop = () => {
        try {
            // Dynamically import to avoid circular deps
            import('../services/geminiService').then(m => m.cancelActiveRun && m.cancelActiveRun());
        } catch {}
    };

    return (
        <div className="bg-neutral-100 dark:bg-neutral-900 rockstar:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 w-full animate-fade-scale-in text-sm">
            <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-200">
                <div className="relative flex items-center justify-center w-6 h-6">
                    <ThinkingAnimationIcon />
                </div>
                <span className="font-medium">{stage}</span>
                <div className="flex-1"></div>
                <button onClick={handleStop} className="px-3 py-1.5 text-sm rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                    <span aria-hidden>⏹</span>
                    <span className="ml-2">Стоп</span>
                </button>
            </div>
            {files.length > 0 && (
                <div className="mt-2 pl-8 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-1">
                            <FileIcon />
                            <span className="truncate max-w-[200px]">{file}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Live search sources */}
            {isWebSearch && foundSources.length > 0 && (
                <div className="mt-3 pl-8">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        Найденные источники:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {foundSources.map((source, index) => {
                            // Cycle through project card colors: yellow, green, blue, purple
                            const colors = [
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
                                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
                                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border
                                        ${colorClass} animate-fade-in
                                    `}
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                    <span className="font-mono">
                                        {source}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIFeedbackDisplay;