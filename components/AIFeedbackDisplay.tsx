

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
        <div className="bg-neutral-800/60 backdrop-blur-md border border-neutral-700/50 rounded-lg p-3 w-full animate-fade-scale-in text-sm">
            <div className="flex items-center gap-3 text-neutral-200">
                <div className="relative flex items-center justify-center w-6 h-6">
                    <ThinkingAnimationIcon />
                </div>
                <span className="font-medium">{stage}</span>
            </div>
            {files.length > 0 && (
                <div className="mt-2 pl-8 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-neutral-700/70 text-xs text-neutral-300 rounded-md px-2 py-1">
                            <FileIcon />
                            <span className="truncate max-w-[200px]">{file}</span>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={handleStop} className="mt-2 px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700">Стоп</button>
        </div>
    );
};

export default AIFeedbackDisplay;