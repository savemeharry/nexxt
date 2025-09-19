

import React, { useState, useRef, useEffect } from 'react';
import { CompanyCardData, ResearchMode } from '../types';
import { RESEARCH_MODES } from '../constants';
import { CompassIcon } from './icons/CompassIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface SearchBarProps {
  topic: string;
  setTopic: (topic: string) => void;
  mode: ResearchMode;
  setMode: (mode: ResearchMode) => void;
  onSearch: () => void;
  isLoading: boolean;
  onToggleHistory: () => void;
  researchContextProject: CompanyCardData | null;
  onClearResearchContext: () => void;
}

const placeholderText: Record<ResearchMode, string> = {
    [ResearchMode.Analyze]: "Enter a business niche (e.g., 'pet subscription boxes')",
    [ResearchMode.Explore]: "Enter a broad topic (e.g., 'sustainable living')",
}

const SearchBar: React.FC<SearchBarProps> = ({ topic, setTopic, mode, setMode, onSearch, isLoading, onToggleHistory, researchContextProject, onClearResearchContext }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && topic.trim()) {
      onSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-neutral-900/50 rockstar:bg-black/50 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rockstar:border-rockstar-500/50 rounded-xl p-2 shadow-lg shadow-neutral-300/30 dark:shadow-black/30 rockstar:shadow-[0_0_20px_rgba(236,72,153,0.2)] w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
         <button 
            type="button"
            onClick={onToggleHistory}
            className="p-3 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rockstar:hover:text-rockstar-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rockstar:hover:bg-rockstar-900/50 transition-colors shrink-0"
            aria-label="Open history panel"
          >
            <HistoryIcon />
         </button>
        
        <div className="relative" ref={menuRef}>
            <button 
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rockstar:hover:text-rockstar-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rockstar:hover:bg-rockstar-900/50 transition-colors shrink-0"
                aria-label="Select research mode"
            >
                <CompassIcon />
            </button>
            {isMenuOpen && (
                <div className="absolute bottom-14 left-0 w-48 bg-white/80 dark:bg-neutral-800/80 rockstar:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/50 rockstar:border-rockstar-700/50 rounded-lg shadow-xl p-2 animate-scale-in-out origin-bottom-left z-50">
                    {RESEARCH_MODES.map(modeOption => (
                        <button
                            key={modeOption}
                            type="button"
                            onClick={() => {
                                setMode(modeOption);
                                setIsMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                                mode === modeOption 
                                ? 'bg-brand-500 text-white rockstar:bg-rockstar-500' 
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rockstar:hover:bg-rockstar-900/50'
                            }`}
                        >
                            {modeOption}
                        </button>
                    ))}
                </div>
            )}
        </div>
        
        <div className="flex items-center w-full min-h-[3rem] px-3 flex-wrap gap-2 py-2">
            {!researchContextProject && 
                <span className="text-sm font-semibold bg-neutral-100 dark:bg-neutral-700/80 rockstar:bg-rockstar-900/80 text-neutral-700 dark:text-neutral-300 rockstar:text-rockstar-300 rounded-md px-2 py-1 mr-2 whitespace-nowrap">{mode}</span>
            }

            {researchContextProject && (
                <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-800/70 rockstar:bg-rockstar-purple/20 text-sm text-brand-700 dark:text-neutral-100 rockstar:text-rockstar-purple rounded-full pl-2 pr-1 py-1 shrink-0 animate-scale-in-out">
                    <BriefcaseIcon />
                    <span className="truncate max-w-xs font-medium">{researchContextProject.title}</span>
                    <button type="button" onClick={onClearResearchContext} className="text-brand-500 dark:text-brand-300 rockstar:text-rockstar-purple/70 hover:text-brand-700 dark:hover:text-white rockstar:hover:text-rockstar-purple">
                        <XCircleIcon />
                    </button>
                </div>
            )}

            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={researchContextProject ? "Ask about your project..." : placeholderText[mode]}
                className="flex-grow h-full bg-transparent text-neutral-900 dark:text-neutral-100 text-lg placeholder-neutral-500 dark:placeholder-neutral-500 focus:outline-none min-w-[200px]"
                disabled={isLoading}
            />
        </div>
        
        <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="flex items-center justify-center h-12 w-12 bg-brand-600 text-white rounded-lg hover:bg-brand-700 rockstar:bg-rockstar-600 rockstar:hover:bg-rockstar-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-brand-500 rockstar:focus:ring-rockstar-500 transition-all duration-300 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Perform search"
        >
            <ArrowUpIcon />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;