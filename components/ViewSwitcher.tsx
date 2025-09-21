import React from 'react';

interface ViewSwitcherProps {
  views: { id: string; label: string; icon: React.ReactNode }[];
  activeView: string;
  onViewChange: (viewId: string) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ views, activeView, onViewChange }) => {
  return (
    <div className="my-8 flex items-center justify-center gap-2 p-1 bg-neutral-900/70 border border-neutral-800 rounded-full animate-fade-scale-in" style={{ animationDelay: '0.2s' }}>
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none ${
            activeView === view.id
              ? 'bg-neutral-700/60 text-neutral-100'
              : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100'
          }`}
        >
          {view.icon}
          {view.label}
        </button>
      ))}
    </div>
  );
};
