

import React, { useState, useEffect } from 'react';
import { CompanyCardData, AttachedFile, CompanyCategory, Asset } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';

interface ProjectModalProps {
    onClose: () => void;
    onSave: (card: Omit<CompanyCardData, 'id'> | CompanyCardData) => void;
    initialData?: CompanyCardData | null;
}

const categories: CompanyCategory[] = ['Startup', 'Idea', 'Hypothesis'];

// Helper to read file as Base64
const readFileAsBase64 = (file: File): Promise<Omit<AttachedFile, 'id'>> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                type: 'file',
                name: file.name,
                mimeType: file.type,
                size: file.size,
                content: reader.result as string,
            });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSave, initialData }) => {
    const isEditMode = !!initialData;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<CompanyCategory>('Idea');
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isEditMode && initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setCategory(initialData.category);
            // File editing is not handled in this modal, so we don't set files.
        }
    }, [isEditMode, initialData]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            setIsUploading(true);
            try {
                const filesData = await Promise.all(
                    Array.from(selectedFiles).map(file => readFileAsBase64(file))
                );
                
                const attachedFiles: AttachedFile[] = filesData.map(data => ({
                    ...data,
                    id: `${Date.now()}-${data.name}`
                }))

                setFiles(prevFiles => [...prevFiles, ...attachedFiles]);
            } catch (error) {
                console.error("Error reading files:", error);
                // Handle error display to user if necessary
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const handleSave = () => {
        if (!title.trim()) return; // Basic validation
        if (isEditMode && initialData) {
             onSave({
                ...initialData,
                title,
                description,
                category,
             });
        } else {
             onSave({
                title,
                description,
                category,
                assets: files,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-neutral-800 shrink-0">
                    <h2 className="text-xl font-bold text-neutral-100">{isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="flex items-start gap-4">
                        <div className="flex-grow">
                            <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
                            <select id="category" value={category} onChange={e => setCategory(e.target.value as CompanyCategory)} className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                    </div>
                    {!isEditMode && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Attachments</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-neutral-700 px-6 py-10 hover:border-brand-500 transition-colors">
                                <div className="text-center">
                                    <PaperclipIcon />
                                    <p className="text-sm text-neutral-400 mt-2">Drag & drop files or click to upload</p>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-brand-400 focus-within:outline-none hover:text-brand-500">
                                        <span>Upload files</span>
                                    </label>
                                </div>
                            </div>
                            {isUploading && <p className="text-sm text-neutral-400 mt-2">Uploading...</p>}
                            {files.length > 0 && (
                                <ul className="mt-4 space-y-1 text-sm text-neutral-300">
                                    {files.map(f => <li key={f.name}>{f.name} ({(f.size/1024).toFixed(1)}KB)</li>)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
                 <div className="flex justify-end p-6 border-t border-neutral-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-200 rounded-md hover:bg-neutral-800 transition-colors mr-2">Cancel</button>
                    <button onClick={handleSave} disabled={!title.trim() || isUploading} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors">Save Project</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;