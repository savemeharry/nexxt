import React, { useEffect } from 'react';
import { MarketAnalysisResult } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HistoryPanelProps {
  history: MarketAnalysisResult[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: MarketAnalysisResult) => void;
  onClear: () => void;
  currentResultId?: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onClose, onSelect, onClear, currentResultId }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
        {/* Overlay */}
        <div
            onClick={onClose}
            className={`fixed inset-0 bg-neutral-950/20 dark:bg-neutral-950/40 rockstar:bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        />

        {/* Panel */}
        <aside className={`fixed top-0 left-0 h-full w-full max-w-sm bg-neutral-50/90 dark:bg-neutral-900/80 rockstar:bg-neutral-950/80 backdrop-blur-lg border-r border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 shrink-0">
                    <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                        <HistoryIcon />
                        <h2 className="text-xl font-bold">History</h2>
                    </div>
                    <div className="flex items-center gap-2">
                         {history.length > 0 && (
                            <button onClick={onClear} className="text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800" aria-label="Clear history">
                                <TrashIcon />
                            </button>
                        )}
                        <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800" aria-label="Close history">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {history.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">Your research history will appear here.</p>
                    ) : (
                    history.map(item => (
                        <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 border ${
                            currentResultId === item.id 
                            ? 'bg-brand-50 dark:bg-brand-800/40 rockstar:bg-rockstar-500/20 border-brand-300 dark:border-brand-700/60 rockstar:border-rockstar-500/60' 
                            : 'bg-white/50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800/80 rockstar:border-neutral-700/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 rockstar:hover:bg-neutral-800'
                        }`}
                        >
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.topic}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.mode}</p>
                        </button>
                    ))
                    )}
                </div>
            </div>
        </aside>
    </>
  );
};

export default HistoryPanel;