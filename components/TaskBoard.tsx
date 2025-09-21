

import React, { useState } from 'react';
import { Task, TaskStatus, Goal, User } from '../types';
import TaskCard from './TaskCard';
import { GoalIcon } from './icons/GoalIcon';

interface TaskBoardProps {
    goal: Goal | null;
    users: User[];
    onTaskDrop: (taskId: string, newStatus: TaskStatus) => void;
    onEditTask: (task: Task) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ goal, users, onTaskDrop, onEditTask }) => {
    const columns: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('application/x-nexxt-task-id', task.id);
        e.dataTransfer.setData('application/x-nexxt-task-title', task.title);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            onTaskDrop(taskId, status);
        }
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };
    
    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    if (!goal) {
        return (
            <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-r-xl h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4">
                    <GoalIcon />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-300">No Goal Selected</h3>
                <p className="text-neutral-500 mt-2">Select a goal from the left panel to see its tasks, or create a new one to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-r-xl h-full flex flex-col">
            <header className="p-4 border-b border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 shrink-0">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{goal.title}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{goal.description}</p>
            </header>
            <div className="flex-grow flex gap-4 p-4 overflow-x-auto min-h-0">
                {columns.map(status => {
                    const baseBg = "bg-neutral-100 dark:bg-neutral-800/40 rockstar:bg-neutral-900/40";
                    const dragBg = "bg-brand-50 dark:bg-brand-900/30 rockstar:bg-rockstar-900/50";
                    
                    const finalBg = dragOverColumn === status ? dragBg : baseBg;

                    const content = (
                        <>
                            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 p-3 border-b border-neutral-200 dark:border-neutral-700/50 rockstar:border-neutral-700/50 shrink-0">
                                {status}
                            </h3>
                            <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                                {(() => {
                                    const tasksForStatus = goal.tasks.filter(task => task.status === status);
                                    const uniqueTasks = tasksForStatus.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
                                    return uniqueTasks.map((task, idx) => (
                                        <TaskCard 
                                            key={`${task.id}-${status}-${idx}`}
                                            task={task} 
                                            assignee={users.find(u => u.id === task.assigneeId) || null}
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            onEdit={() => onEditTask(task)}
                                        />
                                    ));
                                })()}
                            </div>
                        </>
                    );

                    if (status === 'Done') {
                         // Use an opaque background for the inner div of the "Done" column to correctly clip the animated border
                        const doneColumnInnerBg = dragOverColumn === status ? dragBg : "bg-neutral-100 dark:bg-neutral-800 rockstar:bg-neutral-900";
                        return (
                             <div
                                key={status}
                                onDrop={(e) => handleDrop(e, status)}
                                onDragOver={(e) => handleDragOver(e, status)}
                                onDragLeave={handleDragLeave}
                                className="w-1/3 min-w-[300px] done-column-container"
                            >
                                <div className={`${doneColumnInnerBg} w-full h-full flex flex-col rounded-[7px] relative overflow-hidden`}>
                                    <div className="pointer-events-none absolute inset-0 rounded-[7px] ring-1 ring-inset ring-neutral-200/50 dark:ring-neutral-700/60" />
                                    {content}
                                </div>
                            </div>
                        );
                    }

                    let borderClass = 'border-transparent';
                    if (status === 'In Progress') {
                        borderClass = 'border-brand-500/70';
                    }

                    return (
                         <div
                            key={status}
                            onDrop={(e) => handleDrop(e, status)}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            className={`w-1/3 min-w-[300px] flex flex-col rounded-lg border transition-colors ${finalBg} ${borderClass}`}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskBoard;