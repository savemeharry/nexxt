

import React from 'react';
import { ChatMessage } from '../types';
import ChatDisplay from './ChatDisplay';
import { CloseIcon } from './icons/CloseIcon';
import ChatBar from './ChatBar';
import AIFeedbackDisplay from './AIFeedbackDisplay';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onSendMessage: (message: string, attachedFileIds: string[], options: {}) => void;
  aiFeedback: { stage: string; files: string[] } | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onClose, onSelectProject, onSendMessage, aiFeedback }) => {
  return (
    <div
      className="fixed inset-0 z-40 bg-white/60 dark:bg-neutral-950/60 rockstar:bg-black/60 backdrop-blur-md flex flex-col animate-fade-scale-in"
      aria-modal="true"
      role="dialog"
    >
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-end">
        <button
          onClick={onClose}
          className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 rounded-full bg-white/50 dark:bg-neutral-900/50 rockstar:bg-neutral-900/50"
          aria-label="Close chat"
        >
          <CloseIcon />
        </button>
      </header>


      <div
        className="flex-grow w-full h-full overflow-y-auto pt-16 pb-4"
      >
        <ChatDisplay messages={messages} isLoading={isLoading} onSelectProject={onSelectProject} />
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 shrink-0">
          {isLoading && aiFeedback && (
            <div className="mb-2">
                <AIFeedbackDisplay stage={aiFeedback.stage} files={aiFeedback.files} />
            </div>
          )}
          <ChatBar
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              onShowChat={() => {}}
              hasMessages={messages.length > 0}
          />
      </div>
    </div>
  );
};

export default ChatPanel;