import React, { useEffect, useState } from 'react';
import { AttachedFile } from '../types';
import { listTextFiles, downloadFile } from '../services/googleDriveService';

interface DriveImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (files: AttachedFile[]) => void;
}

const formatSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let idx = 0;
    while (size >= 1024 && idx < units.length - 1) {
        size /= 1024;
        idx++;
    }
    return `${size.toFixed(1)} ${units[idx]}`;
};

const DriveImportModal: React.FC<DriveImportModalProps> = ({ isOpen, onClose, onImport }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<Array<{ id: string; name: string; mimeType: string; size?: number }>>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);
        setFiles([]);
        setSelectedId(null);
        listTextFiles(50)
            .then((list) => setFiles(list as any))
            .catch((e: any) => setError(e?.message || 'Failed to list Google Drive files'))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const handleImport = async () => {
        if (!selectedId) return;
        try {
            setLoading(true);
            const dl = await downloadFile(selectedId);
            const newFile: AttachedFile = {
                id: `gdrive-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                type: 'file',
                name: dl.name,
                mimeType: dl.mimeType,
                content: dl.content,
                size: dl.size,
                source: { provider: 'gdrive', fileId: selectedId }
            };
            onImport([newFile]);
            onClose();
        } catch (e: any) {
            setError(e?.message || 'Failed to import file');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-white/60 dark:bg-neutral-950/60 rockstar:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-scale-in">
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rockstar:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Import from Google Drive</h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">×</button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {loading && <p className="text-sm text-neutral-500">Loading files…</p>}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {!loading && !error && files.length === 0 && (
                        <p className="text-sm text-neutral-500">No text-like files found in your Drive.</p>
                    )}
                    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {files.map((f) => (
                            <li key={f.id} className="py-2 flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="drive-file"
                                    checked={selectedId === f.id}
                                    onChange={() => setSelectedId(f.id)}
                                    className="accent-brand-600"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">{f.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{f.mimeType} • {formatSize(f.size)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200">Cancel</button>
                    <button onClick={handleImport} disabled={!selectedId || loading} className="px-3 py-1.5 text-sm rounded-md bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">Import</button>
                </div>
            </div>
        </div>
    );
};

export default DriveImportModal;


