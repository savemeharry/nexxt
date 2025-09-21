
import React from 'react';
import { Stat } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface StatCardGridProps {
    stats: Stat[];
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-neutral-50 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700/60 rockstar:border-neutral-700/60">
                    <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm mb-2">
                        <div className="w-6 h-6 mr-2 text-neutral-400 dark:text-neutral-500">
                            <ChartBarIcon />
                        </div>
                        <h4 className="font-semibold text-neutral-600 dark:text-neutral-400">{stat.label}</h4>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};