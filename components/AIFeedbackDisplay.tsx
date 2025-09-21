

import React from 'react';
import { ThinkingAnimationIcon } from './icons/ThinkingAnimationIcon';
import { FileIcon } from './icons/FileIcon';

interface AIFeedbackDisplayProps {
    stage: string;
    files: string[];
}

const AIFeedbackDisplay: React.FC<AIFeedbackDisplayProps> = ({ stage, files }) => {
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
        </div>
    );
};

export default AIFeedbackDisplay;