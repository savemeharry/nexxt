
import React, { useState } from 'react';
import { TeamMember, User } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface FillRoleModalProps {
    member: TeamMember;
    availableUsers: User[];
    onClose: () => void;
    onSave: (updatedMember: TeamMember) => void;
}

const FillRoleModal: React.FC<FillRoleModalProps> = ({ member, availableUsers, onClose, onSave }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    const handleSave = () => {
        const selectedUser = availableUsers.find(u => u.id === selectedUserId);
        if (!selectedUser) return;

        onSave({
            ...member,
            status: 'FILLED',
            person: selectedUser,
        });
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                     <div>
                        <h2 className="text-xl font-bold text-neutral-100">Fill Role</h2>
                        <p className="text-sm text-neutral-400">Assign a person to the "{member.role}" role.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6">
                    <label htmlFor="user-select" className="block text-sm font-medium text-neutral-300 mb-2">Select a person to assign</label>
                    <select
                        id="user-select"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                        <option value="" disabled>Choose a team member...</option>
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <footer className="flex justify-end p-6 border-t border-neutral-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors mr-2">Cancel</button>
                    <button onClick={handleSave} disabled={!selectedUserId} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors">Confirm Assignment</button>
                </footer>
            </div>
        </div>
    );
};

export default FillRoleModal;
