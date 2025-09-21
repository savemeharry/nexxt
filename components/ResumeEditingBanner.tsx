import React from 'react';
import { AttachedFile, ChatMessage } from '../types';
import { EditIcon } from './icons/EditIcon';

interface PausedEditorSession {
    asset: AttachedFile;
    messages: ChatMessage[];
}

interface ResumeEditingBannerProps {
    session: PausedEditorSession;
    onResume: () => void;
}

const ResumeEditingBanner: React.FC<ResumeEditingBannerProps> = ({ session, onResume }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 animate-fade-scale-in">
            <div className="w-full max-w-4xl mx-auto">
                <button
                    onClick={onResume}
                    className="w-full bg-brand-800/80 backdrop-blur-md border border-brand-700/60 rounded-xl p-4 shadow-lg text-left text-white hover:bg-brand-700/90 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-brand-600 rounded-lg">
                           <EditIcon />
                        </div>
                        <div>
                             <h4 className="font-bold">Resume Editing Session</h4>
                             <p className="text-sm text-neutral-300">
                                You have unsaved changes in <span className="font-medium">{session.asset.name}</span>
                             </p>
                        </div>
                    </div>
                     <span className="text-sm font-semibold bg-brand-600 px-3 py-1 rounded-full">
                        Resume
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ResumeEditingBanner;
