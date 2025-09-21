

import React from 'react';
import { Goal } from '../types';
import { EditIcon } from './icons/EditIcon';

interface GoalsListProps {
    goals: Goal[];
    selectedGoal: Goal | null;
    onSelectGoal: (goal: Goal) => void;
    onEditGoal: (goal: Goal) => void;
}

const GoalsList: React.FC<GoalsListProps> = ({ goals, selectedGoal, onSelectGoal, onEditGoal }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, goal: Goal) => {
        e.dataTransfer.setData('application/x-nexxt-goal-id', goal.id);
        e.dataTransfer.setData('application/x-nexxt-goal-title', goal.title);
    };

    return (
        <div className="p-2 overflow-y-auto h-full">
            {goals.length === 0 ? (
                <p className="text-center text-sm text-neutral-500 p-4">No goals yet. Add a goal to start organizing your tasks.</p>
            ) : (
                <ul className="space-y-1">
                    {goals.map(goal => (
                        <li key={goal.id}>
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, goal)}
                                onClick={() => onSelectGoal(goal)}
                                className={`w-full flex items-start justify-between gap-2 text-left p-2 rounded-md transition-colors text-sm group cursor-pointer ${
                                    selectedGoal?.id === goal.id ? 'bg-brand-600 dark:bg-brand-800/60 rockstar:bg-rockstar-900 text-white' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rockstar:hover:bg-neutral-800/70'
                                }`}
                            >
                                <div className="flex-grow">
                                    <p className="font-semibold">{goal.title}</p>
                                    <p className={`text-xs mt-1 ${selectedGoal?.id === goal.id ? 'text-neutral-200 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}`}>{goal.tasks.length} tasks</p>
                                </div>
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onEditGoal(goal); }}
                                    className="shrink-0 p-1.5 rounded hover:bg-black/10 dark:hover:bg-neutral-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit Goal"
                                >
                                    <EditIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GoalsList;