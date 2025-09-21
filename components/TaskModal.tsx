


import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, Subtask, Asset, AttachedFile, TaskAttachment, User } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TaskModalProps {
    onClose: () => void;
    onSave: (task: Task) => void;
    initialData?: Task | null;
    projectFiles: Asset[];
    projectMembers: User[];
}

const getAllFiles = (assets: Asset[]): AttachedFile[] => {
    let files: AttachedFile[] = [];
    const traverse = (currentAssets: Asset[]) => {
        for (const asset of currentAssets) {
            if (asset.type === 'file') {
                files.push(asset as AttachedFile);
            } else if (asset.type === 'folder') {
                traverse(asset.children);
            }
        }
    };
    traverse(assets);
    return files;
};


const TaskModal: React.FC<TaskModalProps> = ({ onClose, onSave, initialData, projectFiles, projectMembers }) => {
    const isEditMode = !!initialData;
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'To Do');
    const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'Medium');
    const [dueDate, setDueDate] = useState(initialData?.dueDate ? initialData.dueDate.split('T')[0] : '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [attachments, setAttachments] = useState<TaskAttachment[]>(initialData?.attachments || []);
    const [assigneeId, setAssigneeId] = useState<string | undefined>(initialData?.assigneeId);

    const allFiles = getAllFiles(projectFiles);

    const handleSave = () => {
        if (!title.trim()) return;
        const taskData: Task = {
            id: initialData?.id || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            subtasks,
            attachments,
            assigneeId,
        };
        onSave(taskData);
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim(), completed: false }]);
            setNewSubtask('');
        }
    };
    
    const toggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
    };
    
    const deleteSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleAttachmentChange = (fileId: string) => {
        const file = allFiles.find(f => f.id === fileId);
        if (!file) return;

        if (attachments.some(a => a.id === fileId)) {
            setAttachments(attachments.filter(a => a.id !== fileId));
        } else {
            setAttachments([...attachments, { id: file.id, name: file.name }]);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
                <header className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                    <h2 className="text-xl font-bold text-neutral-100">{isEditMode ? 'Edit Task' : 'Add New Task'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    {/* Status, Priority, Due Date, Assignee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assignee" className="block text-sm font-medium text-neutral-300 mb-1">Assignee</label>
                            <select id="assignee" value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value || undefined)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                                <option value="">Unassigned</option>
                                {projectMembers.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                                <option>To Do</option>
                                <option>In Progress</option>
                                <option>Done</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-neutral-300 mb-1">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-300 mb-1">Due Date</label>
                            <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        </div>
                    </div>
                    {/* Subtasks */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Subtasks</label>
                        <div className="space-y-2">
                            {subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-2 bg-neutral-800/50 p-2 rounded-md">
                                    <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st.id)} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-brand-500 focus:ring-brand-500 shrink-0" />
                                    <span className={`flex-grow text-sm ${st.completed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>{st.text}</span>
                                    <button onClick={() => deleteSubtask(st.id)} className="p-1 text-neutral-400 hover:text-red-400"><TrashIcon /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="Add a new subtask..." onKeyDown={e => e.key === 'Enter' && handleAddSubtask()} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                            <button onClick={handleAddSubtask} className="p-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"><PlusIcon /></button>
                        </div>
                    </div>
                    {/* Attachments */}
                    <div>
                        <label htmlFor="attachments" className="block text-sm font-medium text-neutral-300 mb-1">Attachments</label>
                         <select id="attachments" value={attachments.map(a => a.id)} onChange={e => handleAttachmentChange(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="" disabled>Select a file to attach...</option>
                            {allFiles.map(file => (
                                <option key={file.id} value={file.id}>
                                    {attachments.some(a => a.id === file.id) ? `✓ ${file.name}` : file.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {attachments.map(att => (
                                <div key={att.id} className="bg-brand-800/70 text-sm text-neutral-100 rounded-full px-3 py-1">
                                    {att.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <footer className="flex justify-end p-6 border-t border-neutral-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors mr-2">Cancel</button>
                    <button onClick={handleSave} disabled={!title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors">Save Task</button>
                </footer>
            </div>
        </div>
    );
};

export default TaskModal;