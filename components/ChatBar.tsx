

import React, { useState, useRef, DragEvent } from 'react';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { MessagesSquareIcon } from './icons/MessagesSquareIcon';
import { FileBadgeIcon } from './icons/FileBadgeIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { FlagIcon } from './icons/FlagIcon';
import { GoalIcon } from './icons/GoalIcon';
import { SearchIcon } from './icons/SearchIcon';

interface ChatBarProps {
  onSendMessage: (message: string, attachedFileIds: string[], options: { webSearch?: boolean }) => void;
  isLoading: boolean;
  onShowChat: () => void;
  hasMessages: boolean;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: (enabled: boolean) => void;
}

const ChatBar: React.FC<ChatBarProps> = ({ 
  onSendMessage, 
  isLoading, 
  onShowChat, 
  hasMessages, 
  webSearchEnabled = false,
  onToggleWebSearch 
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{id: string, name: string}[]>([]);
  const [contextItem, setContextItem] = useState<{ id: string; type: 'task' | 'goal'; name: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalMessage = message;
    if (contextItem) {
      // Use a more direct command prefix that the AI is trained on
      finalMessage = `For the ${contextItem.type} "${contextItem.name}": ${message}`;
    }

    if (!isLoading && (finalMessage.trim() || attachedFiles.length > 0)) {
      onSendMessage(finalMessage, attachedFiles.map(f => f.id), {
        webSearch: webSearchEnabled
      });
      setMessage('');
      setAttachedFiles([]);
      setContextItem(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Clear any previous single-item context (task/goal) or files to avoid confusion
    setMessage('');

    // Handle task drop
    const taskId = e.dataTransfer.getData('application/x-nexxt-task-id');
    const taskTitle = e.dataTransfer.getData('application/x-nexxt-task-title');
    if (taskId && taskTitle) {
        setAttachedFiles([]); // A task context is exclusive
        setContextItem({ id: taskId, type: 'task', name: taskTitle });
        inputRef.current?.focus();
        return;
    }
    
    // Handle goal drop
    const goalId = e.dataTransfer.getData('application/x-nexxt-goal-id');
    const goalTitle = e.dataTransfer.getData('application/x-nexxt-goal-title');
    if (goalId && goalTitle) {
        setAttachedFiles([]); // A goal context is exclusive
        setContextItem({ id: goalId, type: 'goal', name: goalTitle });
        inputRef.current?.focus();
        return;
    }

    // Handle asset file drop
    const assetType = e.dataTransfer.getData('assetType');
    if (assetType === 'file') {
        setContextItem(null); // File context is exclusive
        const assetId = e.dataTransfer.getData('assetId');
        const assetName = e.dataTransfer.getData('assetName');
        if (assetId && assetName && !attachedFiles.some(f => f.id === assetId)) {
            setAttachedFiles(prev => [...prev, { id: assetId, name: assetName }]);
            inputRef.current?.focus();
            return;
        }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isAsset = e.dataTransfer.types.includes('assettype');
    const isTask = e.dataTransfer.types.includes('application/x-nexxt-task-id');
    const isGoal = e.dataTransfer.types.includes('application/x-nexxt-goal-id');
    if (isAsset || isTask || isGoal) {
        setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeAttachedFile = (idToRemove: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  return (
    <div className={`bg-white dark:bg-neutral-900/50 rockstar:bg-black/50 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rockstar:border-rockstar-500/50 rounded-xl p-2 shadow-lg shadow-neutral-300/30 dark:shadow-black/30 rockstar:shadow-[0_0_20px_rgba(236,72,153,0.2)] w-full transition-all duration-300 ${isDragOver ? 'border-brand-500 dark:border-brand-500 ring-2 ring-brand-500/50' : ''}`}>
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center gap-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {hasMessages && (
             <button 
                type="button"
                onClick={onShowChat}
                className="p-3 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rockstar:hover:bg-rockstar-900/50 transition-colors shrink-0"
                aria-label="Show chat history"
              >
                <MessagesSquareIcon />
             </button>
        )}
        
        <div className="flex items-center w-full min-h-[3rem] text-neutral-900 dark:text-neutral-100 text-lg placeholder-neutral-500 dark:placeholder-neutral-500 focus:outline-none px-4 flex-wrap gap-2 py-2">
            {attachedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 bg-brand-50 dark:bg-brand-800/70 rockstar:bg-rockstar-900/70 text-sm text-brand-800 dark:text-neutral-100 rockstar:text-neutral-100 rounded-full px-3 py-1 shrink-0 animate-scale-in-out">
                    <FileBadgeIcon />
                    <span className="truncate max-w-xs">{file.name}</span>
                    <button type="button" onClick={() => removeAttachedFile(file.id)} className="text-brand-500 dark:text-brand-300 rockstar:text-rockstar-300 hover:text-brand-700 dark:hover:text-white rockstar:hover:text-white">
                        <XCircleIcon />
                    </button>
                </div>
            ))}
             {contextItem && (
                <div className="flex items-center gap-2 bg-rockstar-purple/10 dark:bg-rockstar-purple/20 text-sm text-rockstar-purple rounded-full pl-3 pr-1 py-1 shrink-0 animate-scale-in-out">
                    <div className="w-4 h-4">
                        {contextItem.type === 'task' ? <FlagIcon /> : <GoalIcon />}
                    </div>
                    <span className="truncate max-w-xs font-medium">{contextItem.name}</span>
                    <button type="button" onClick={() => setContextItem(null)} className="text-rockstar-purple/70 hover:text-rockstar-purple">
                        <XCircleIcon />
                    </button>
                </div>
            )}
            <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                    isDragOver ? "Drop a task, goal, or file here..." :
                    contextItem ? `Set due date, add subtasks...` :
                    attachedFiles.length > 0 ? "Ask about the files..." :
                    webSearchEnabled ? "Ask a question (searching web)..." :
                    "Ask a follow-up question..."
                }
                className="flex-grow h-full bg-transparent focus:outline-none min-w-[150px]"
                disabled={isLoading}
                style={isLoading && webSearchEnabled ? { 
                    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                } : {}}
            />
        </div>

        {onToggleWebSearch && (
          <button
              type="button"
              onClick={() => onToggleWebSearch(!webSearchEnabled)}
              className={`flex items-center justify-center h-12 w-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 transition-all duration-300 shrink-0 ${
                  webSearchEnabled 
                      ? 'bg-brand-100 dark:bg-brand-900/50 rockstar:bg-rockstar-purple/20 text-brand-700 dark:text-brand-300 rockstar:text-rockstar-purple hover:bg-brand-200 dark:hover:bg-brand-800/50 rockstar:hover:bg-rockstar-purple/30 focus:ring-brand-500' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rockstar:hover:bg-rockstar-900/50 focus:ring-neutral-500'
              }`}
              aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
              title={webSearchEnabled ? "Отключить поиск в интернете" : "Включить поиск в интернете"}
          >
              <SearchIcon />
          </button>
        )}

        <button
            type="submit"
            disabled={isLoading || (!message.trim() && attachedFiles.length === 0 && !contextItem)}
            className="flex items-center justify-center h-12 w-12 bg-brand-600 text-white rounded-lg hover:bg-brand-700 rockstar:bg-rockstar-600 rockstar:hover:bg-rockstar-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-brand-500 transition-all duration-300 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
        >
            <ArrowUpIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatBar;