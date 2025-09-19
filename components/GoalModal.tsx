

import React, { useState } from 'react';
import { Goal } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface GoalModalProps {
    onClose: () => void;
    onSave: (goal: Goal) => void;
    initialData?: Goal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ onClose, onSave, initialData }) => {
    const isEditMode = !!initialData;
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const handleSave = () => {
        if (!title.trim()) return;
        const goalData: Goal = {
            id: initialData?.id || Date.now().toString(),
            title,
            description,
            tasks: initialData?.tasks || [],
        };
        onSave(goalData);
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-xl relative flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                    <h2 className="text-xl font-bold text-neutral-100">{isEditMode ? 'Edit Goal' : 'Add New Goal'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="goal-title" className="block text-sm font-medium text-neutral-300 mb-1">Goal Title</label>
                        <input
                            type="text"
                            id="goal-title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Q4 Product Launch"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="goal-description" className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                        <textarea
                            id="goal-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What is this goal about?"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                </div>
                <footer className="flex justify-end p-6 border-t border-neutral-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors mr-2">Cancel</button>
                    <button onClick={handleSave} disabled={!title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors">Save Goal</button>
                </footer>
            </div>
        </div>
    );
};

export default GoalModal;