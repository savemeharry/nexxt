import React, { useState, useRef, useEffect } from 'react';
import { CompanyCardData, AttachedFile, Asset, Folder, Task, Goal, User } from '../types';
import FileExplorer from './FileExplorer';
import DocumentViewer from './DocumentViewer';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { FolderPlusIcon } from './icons/FolderPlusIcon';
import { FilesIcon } from './icons/FilesIcon';
import { TasksIcon } from './icons/TasksIcon';
import TaskBoard from './TaskBoard';
import TaskModal from './TaskModal';
import { PlusIcon } from './icons/PlusIcon';
import GoalsList from './GoalsList';
import GoalModal from './GoalModal';
import { GoalIcon } from './icons/GoalIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';
import { ShareIcon } from './icons/ShareIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';

type ActiveProjectView = 'files' | 'tasks';

interface ProjectViewProps {
    project: CompanyCardData;
    users: User[];
    onUpdateProject: (updatedProject: CompanyCardData) => void;
    onBack: () => void;
    onSaveToDrive: (project: CompanyCardData) => void;
    isGoogleSignedIn: boolean;
    initialSelectedAsset?: Asset | null;
    highlightedAssetId: string | null;
    onHighlightConsumed: () => void;
}

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

const getUniqueName = (assets: Asset[], baseName: string, isFolder: boolean): string => {
    const existingNames = new Set(assets.map(a => a.name));
    let counter = 1;
    let newName = baseName;

    const extension = isFolder ? '' : baseName.split('.').pop() || '';
    const nameWithoutExt = isFolder ? baseName : baseName.replace(/\.[^/.]+$/, "");

    while (existingNames.has(newName)) {
        newName = isFolder 
            ? `${nameWithoutExt} (${counter})`
            : `${nameWithoutExt} (${counter}).${extension}`;
        counter++;
    }
    return newName;
};

const ProjectView: React.FC<ProjectViewProps> = ({ project, users, onUpdateProject, onBack, onSaveToDrive, isGoogleSignedIn, initialSelectedAsset, highlightedAssetId, onHighlightConsumed }) => {
    const [activeView, setActiveView] = useState<ActiveProjectView>('files');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(initialSelectedAsset || project.assets[0] || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Goal & Task State
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(project.goals?.[0] || null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    useEffect(() => {
        if (initialSelectedAsset) {
            setSelectedAsset(initialSelectedAsset);
            setActiveView('files');
        }
    }, [initialSelectedAsset]);

     // When switching to task view, if no goal is selected, select the first one
    useEffect(() => {
        if (activeView === 'tasks' && !selectedGoal && (project.goals?.length || 0) > 0) {
            setSelectedGoal(project.goals![0]);
        }
    }, [activeView, selectedGoal, project.goals]);

    useEffect(() => {
        // This effect ensures that the local selectedGoal state is synchronized
        // with the project data coming from props. This is crucial for updates
        // like drag-and-drop to reflect immediately.
        if (selectedGoal) {
            const updatedGoalFromProps = project.goals?.find(g => g.id === selectedGoal.id);
            setSelectedGoal(updatedGoalFromProps || project.goals?.[0] || null);
        } else {
             setSelectedGoal(project.goals?.[0] || null);
        }
    }, [project.goals]);

    const updateAssetTree = (assets: Asset[], targetId: string, updateFn: (asset: Asset) => Asset): Asset[] => {
        return assets.map(asset => {
            if (asset.id === targetId) {
                return updateFn(asset);
            }
            if (asset.type === 'folder') {
                return { ...asset, children: updateAssetTree(asset.children, targetId, updateFn) };
            }
            return asset;
        });
    };

    const handleUpdateAsset = (updatedAsset: AttachedFile) => {
        const newAssets = updateAssetTree(project.assets, updatedAsset.id, () => updatedAsset);
        onUpdateProject({ ...project, assets: newAssets });
        setSelectedAsset(updatedAsset);
    };

    const handleCreateDocument = () => {
        const newDoc: AttachedFile = {
            id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: 'file',
            name: getUniqueName(project.assets, 'Untitled Document.txt', false),
            mimeType: 'text/plain',
            size: 0,
            content: 'data:text/plain;base64,',
        };
        onUpdateProject({ ...project, assets: [...project.assets, newDoc] });
        setSelectedAsset(newDoc);
    };

    const handleCreateFolder = () => {
        const newFolder: Folder = {
            id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: 'folder',
            name: getUniqueName(project.assets, 'New Folder', true),
            children: [],
        };
        onUpdateProject({ ...project, assets: [...project.assets, newFolder] });
    };

    const handleAddFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const newAttachedFilesData = await Promise.all(
                Array.from(files).map(file => readFileAsBase64(file))
            );
            const newAssets: AttachedFile[] = newAttachedFilesData.map(data => ({ ...data, id: `${Date.now()}-${data.name}` }));
            const updatedAssets = [...project.assets];
            newAssets.forEach(newFile => {
                 if (!updatedAssets.some(asset => asset.name === newFile.name)) {
                    updatedAssets.push(newFile);
                }
            });
            onUpdateProject({ ...project, assets: updatedAssets });
        }
    };
    
    const handleRenameAsset = (assetId: string, newName: string) => {
        const newAssets = updateAssetTree(project.assets, assetId, (asset) => ({...asset, name: newName}));
        onUpdateProject({ ...project, assets: newAssets });
    };

    const handleMoveAsset = (draggedId: string, targetFolderId: string | null) => {
        let draggedAsset: Asset | null = null;
        const removeAsset = (assets: Asset[]): Asset[] => {
            return assets.reduce((acc, asset) => {
                if (asset.id === draggedId) {
                    draggedAsset = asset;
                    return acc;
                }
                if (asset.type === 'folder') {
                    asset.children = removeAsset(asset.children);
                }
                acc.push(asset);
                return acc;
            }, [] as Asset[]);
        };
        let newAssets = removeAsset([...project.assets]);
        if (!draggedAsset) return;

        const addAsset = (assets: Asset[], targetId: string | null): Asset[] => {
            if (targetId === null) {
                return [...assets, draggedAsset!];
            }
            return assets.map(asset => {
                if (asset.id === targetId && asset.type === 'folder') {
                    return { ...asset, children: [...asset.children, draggedAsset!] };
                }
                if (asset.type === 'folder') {
                    return { ...asset, children: addAsset(asset.children, targetId) };
                }
                return asset;
            });
        };
        // FIX: Corrected a variable name from `targetId` to `targetFolderId` to resolve a reference error.
        newAssets = addAsset(newAssets, targetFolderId);
        onUpdateProject({ ...project, assets: newAssets });
    };

    // Goal & Task Handlers
    const handleSaveGoal = (goalData: Goal) => {
        const currentGoals = project.goals || [];
        let updatedGoals;
        if (currentGoals.some(g => g.id === goalData.id)) {
            updatedGoals = currentGoals.map(g => g.id === goalData.id ? goalData : g);
        } else {
            updatedGoals = [goalData, ...currentGoals];
        }
        onUpdateProject({ ...project, goals: updatedGoals });
        setIsGoalModalOpen(false);
        setEditingGoal(null);
        if(!isEditMode) {
             setSelectedGoal(goalData);
        }
    };
    
    const isEditMode = !!editingGoal;

    const handleOpenTaskModal = (task: Task | null) => {
        if (!selectedGoal) {
            alert("Please select a goal first to add a task.");
            return;
        }
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (taskData: Task) => {
        if (!selectedGoal) return;

        const updatedGoals = (project.goals || []).map(goal => {
            if (goal.id === selectedGoal.id) {
                const existingTask = goal.tasks.find(t => t.id === taskData.id);
                let newTasks;
                if (existingTask) {
                    newTasks = goal.tasks.map(t => t.id === taskData.id ? taskData : t);
                } else {
                    newTasks = [taskData, ...goal.tasks];
                }
                return { ...goal, tasks: newTasks };
            }
            return goal;
        });

        onUpdateProject({ ...project, goals: updatedGoals });
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    const handleTaskDrop = (taskId: string, newStatus: Task['status']) => {
        if (!selectedGoal) return;

        const updatedGoals = (project.goals || []).map(goal => {
             if (goal.id === selectedGoal.id) {
                const updatedTasks = goal.tasks.map(t => t.id === taskId ? {...t, status: newStatus} : t);
                return { ...goal, tasks: updatedTasks };
             }
             return goal;
        });

        onUpdateProject({ ...project, goals: updatedGoals });
    };
    
    return (
        <div className="animate-fade-scale-in flex flex-col h-full w-full flex-grow min-h-0">
            {isGoalModalOpen && <GoalModal onClose={() => setIsGoalModalOpen(false)} onSave={handleSaveGoal} initialData={editingGoal} />}
            {isTaskModalOpen && selectedGoal && (
                <TaskModal 
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={handleSaveTask}
                    initialData={editingTask}
                    projectFiles={project.assets}
                    projectMembers={project.members || []}
                />
            )}
            
            <div className="mb-4 shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4">
                    <ArrowLeftIcon /> Back to Workspace
                </button>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-grow">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{project.title}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex -space-x-2">
                                {project.members?.map(member => (
                                    <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-900 rockstar:border-black" />
                                ))}
                            </div>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                                <UserGroupIcon />
                                Manage Members
                            </button>
                        </div>
                    </div>
                     <div className="relative h-8 w-full sm:w-auto">
                        {/* Files Toolbar */}
                        <div className={`absolute inset-0 flex items-center justify-end gap-2 transition-all duration-300 ${activeView === 'files' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                                <FilePlusIcon /> Add File
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleAddFiles} multiple className="hidden" />
                            <button onClick={handleCreateDocument} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                                <FileTextIcon className="w-4 h-4" /> Create Doc
                            </button>
                            <button onClick={handleCreateFolder} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                                <FolderPlusIcon /> New Folder
                            </button>
                        </div>
                         {/* Tasks Toolbar */}
                        <div className={`absolute inset-0 flex items-center justify-end gap-2 transition-all duration-300 ${activeView === 'tasks' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                           <button onClick={() => alert('Import from Google Drive coming soon!')} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                               <GoogleDriveIcon /> Import from Drive
                           </button>
                           <button onClick={() => alert('Share functionality coming soon!')} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                               <ShareIcon /> Share
                           </button>
                           <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 rockstar:bg-neutral-700 mx-1"></div>
                           <button onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors whitespace-nowrap">
                                <GoalIcon /> Add Goal
                            </button>
                           <button onClick={() => handleOpenTaskModal(null)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-brand-600 rockstar:bg-rockstar-600 text-white rounded-full hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-colors whitespace-nowrap">
                                <PlusIcon /> Add Task
                            </button>
                        </div>
                     </div>
                </div>
            </div>

            <div className="flex-grow flex min-h-0 pb-4 border-t border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800 pt-4">
                <div className="w-full sm:w-1/3 md:w-1/4 lg:w-1/5 shrink-0 h-full">
                    <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-l-xl border-r-0 h-full flex flex-col">
                        <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 shrink-0">
                             <div className="p-1 bg-neutral-100 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 rounded-lg flex items-center w-full">
                                <button 
                                    onClick={() => setActiveView('files')}
                                    className={`w-1/2 flex justify-center items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${activeView === 'files' ? 'bg-white dark:bg-neutral-700 rockstar:bg-rockstar-900 text-neutral-800 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/60 rockstar:hover:bg-neutral-700/60'}`}
                                >
                                    <FilesIcon /> Files
                                </button>
                                <button 
                                    onClick={() => setActiveView('tasks')}
                                    className={`w-1/2 flex justify-center items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${activeView === 'tasks' ? 'bg-white dark:bg-neutral-700 rockstar:bg-rockstar-900 text-neutral-800 dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/60 rockstar:hover:bg-neutral-700/60'}`}
                                >
                                    <TasksIcon /> Tasks
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {activeView === 'files' ? (
                                <FileExplorer 
                                    assets={project.assets}
                                    selectedAsset={selectedAsset}
                                    onSelectAsset={setSelectedAsset}
                                    onRenameAsset={handleRenameAsset}
                                    onMoveAsset={handleMoveAsset}
                                    highlightedAssetId={highlightedAssetId}
                                    onHighlightConsumed={onHighlightConsumed}
                                />
                            ) : (
                                <GoalsList
                                    goals={project.goals || []}
                                    selectedGoal={selectedGoal}
                                    onSelectGoal={setSelectedGoal}
                                    onEditGoal={(goal) => { setEditingGoal(goal); setIsGoalModalOpen(true); }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-grow min-w-0 h-full">
                     {activeView === 'files' ? (
                        <DocumentViewer 
                            asset={selectedAsset}
                            onUpdateAsset={handleUpdateAsset}
                            onSelectAsset={setSelectedAsset}
                        />
                    ) : (
                        <TaskBoard 
                            goal={selectedGoal}
                            users={users}
                            onTaskDrop={handleTaskDrop}
                            onEditTask={(task) => handleOpenTaskModal(task)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectView;