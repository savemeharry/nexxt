

import React from 'react';
import { Task, User } from '../types';
import { FlagIcon } from './icons/FlagIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface TaskCardProps {
    task: Task;
    assignee: User | null;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onEdit: () => void;
}

const priorityColors: { [key in Task['priority']]: string } = {
    'Low': 'text-green-500 dark:text-green-400',
    'Medium': 'text-yellow-500 dark:text-yellow-400',
    'High': 'text-orange-500 dark:text-orange-400',
    'Urgent': 'text-red-600 dark:text-red-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, assignee, onDragStart, onEdit }) => {
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const totalSubtasks = task.subtasks.length;

    const formatDate = (isoString?: string) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onEdit}
            className="bg-white dark:bg-neutral-800/70 rockstar:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 rockstar:border-neutral-700/60 rounded-lg p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 rockstar:hover:bg-neutral-800 hover:border-brand-300 dark:hover:border-brand-700/50 rockstar:hover:border-rockstar-500/50 transition-all"
        >
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">{task.title}</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{task.description}</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className={`flex items-center gap-1 font-medium ${priorityColors[task.priority]}`}>
                        <FlagIcon />
                        <span>{task.priority}</span>
                    </div>
                    {task.dueDate && (
                         <div className="flex items-center gap-1.5">
                            <CalendarIcon />
                            <span>{formatDate(task.dueDate)}</span>
                        </div>
                    )}
                    {task.attachments.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <PaperclipIcon />
                            <span>{task.attachments.length}</span>
                        </div>
                    )}
                    {totalSubtasks > 0 && (
                         <div className="flex items-center gap-1.5">
                            <CheckCircleIcon />
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                        </div>
                    )}
                </div>
                {assignee && (
                    <img 
                        src={assignee.avatarUrl} 
                        alt={assignee.name} 
                        title={assignee.name}
                        className="w-6 h-6 rounded-full"
                    />
                )}
            </div>
        </div>
    );
};

export default TaskCard;