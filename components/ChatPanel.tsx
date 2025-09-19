
import React from 'react';
import { ChatMessage } from '../types';
import ChatDisplay from './ChatDisplay';
import { CloseIcon } from './icons/CloseIcon';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onClose, onSelectProject }) => {
  return (
    <div
      className="fixed inset-0 z-40 bg-white/60 dark:bg-neutral-950/60 rockstar:bg-black/60 backdrop-blur-md flex flex-col animate-fade-scale-in"
      aria-modal="true"
      role="dialog"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors z-50 p-2 rounded-full bg-white/50 dark:bg-neutral-900/50 rockstar:bg-neutral-900/50"
        aria-label="Close chat"
      >
        <CloseIcon />
      </button>

      <div
        className="flex-grow w-full h-full overflow-y-auto pt-20 pb-32"
      >
        <ChatDisplay messages={messages} isLoading={isLoading} onSelectProject={onSelectProject} />
      </div>
    </div>
  );
};

export default ChatPanel;