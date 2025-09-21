import React from 'react';
import { KeyPoint } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface KeyPointsViewProps {
  points: KeyPoint[];
}

export const KeyPointsView: React.FC<KeyPointsViewProps> = ({ points }) => {
  if (!points || points.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 animate-fade-scale-in">
        No key points were generated for this topic.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {points.map((item, index) => (
        <div
          key={index}
          className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 transition-all duration-300 hover:border-brand-700/40 hover:bg-neutral-900/80 opacity-0 animate-fade-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <h3 className="flex items-start text-xl font-bold text-neutral-100 mb-2">
            <div className="text-brand-400 mr-3 mt-1 shrink-0"><ChevronRightIcon /></div>
            <span>{item.point}</span>
          </h3>
          <p className="pl-8 text-neutral-300">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
};
