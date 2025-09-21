
import React from 'react';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface InteractiveListProps {
  text: string;
  onSelect: (item: string) => void;
}

export const InteractiveList: React.FC<InteractiveListProps> = ({ text, onSelect }) => {
  const items = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && (line.match(/^\d+\.\s/) || line.startsWith('-') || line.startsWith('*')));

  if (items.length === 0) {
    return <p>{text}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const cleanedItem = item.replace(/^\d+\.\s*|[-*]\s*/, '');
        return (
          <button
            key={index}
            onClick={() => onSelect(cleanedItem)}
            className="w-full flex items-center text-left p-4 rounded-lg border bg-white dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/40 rockstar:border-neutral-700/60 hover:bg-neutral-50 dark:hover:bg-neutral-800 rockstar:hover:bg-rockstar-900/40 hover:border-brand-300 dark:hover:border-neutral-700 rockstar:hover:border-rockstar-500/80 transition-all duration-200 group"
          >
            <span className="flex-grow text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100">{cleanedItem}</span>
            <ChevronRightIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors ml-4 shrink-0" />
          </button>
        );
      })}
    </div>
  );
};