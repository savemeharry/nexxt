
import React, { useState } from 'react';
import { TeamMember, CompanyCardData } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface AssignProjectModalProps {
    member: TeamMember;
    projects: CompanyCardData[];
    onClose: () => void;
    onSave: (updatedMember: TeamMember) => void;
}

const AssignProjectModal: React.FC<AssignProjectModalProps> = ({ member, projects, onClose, onSave }) => {
    const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set(member.assignedProjectIds));

    const handleToggleProject = (projectId: string) => {
        const newSelection = new Set(selectedProjectIds);
        if (newSelection.has(projectId)) {
            newSelection.delete(projectId);
        } else {
            newSelection.add(projectId);
        }
        setSelectedProjectIds(newSelection);
    };

    const handleSave = () => {
        onSave({
            ...member,
            assignedProjectIds: Array.from(selectedProjectIds),
        });
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-100">Assign Projects</h2>
                        <p className="text-sm text-neutral-400">Assign the "{member.role}" role to projects.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 overflow-y-auto">
                    {projects.length === 0 ? (
                        <p className="text-neutral-500 text-center py-8">You have no projects to assign.</p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map(project => (
                                <li key={project.id}>
                                    <label
                                        htmlFor={`project-${project.id}`}
                                        className="flex items-center p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            id={`project-${project.id}`}
                                            checked={selectedProjectIds.has(project.id)}
                                            onChange={() => handleToggleProject(project.id)}
                                            className="h-5 w-5 rounded bg-neutral-700 border-neutral-600 text-brand-500 focus:ring-brand-500 shrink-0"
                                        />
                                        <span className="ml-4 font-medium text-neutral-200">{project.title}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <footer className="flex justify-end p-6 border-t border-neutral-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors mr-2">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors">Save Assignments</button>
                </footer>
            </div>
        </div>
    );
};

export default AssignProjectModal;
