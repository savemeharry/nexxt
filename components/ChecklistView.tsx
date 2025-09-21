import React, { useState } from 'react';

interface ChecklistViewProps {
  items: string[];
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ items }) => {
  const [checkedState, setCheckedState] = useState<boolean[]>(
    new Array(items.length).fill(false)
  );

  const handleCheckChange = (index: number) => {
    const newCheckedState = [...checkedState];
    newCheckedState[index] = !newCheckedState[index];
    setCheckedState(newCheckedState);
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500 animate-fade-scale-in">
        No checklist was generated for this topic.
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-8 animate-fade-scale-in">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="opacity-0 animate-fade-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <label className="flex items-center p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/40 hover:bg-neutral-800 transition-colors duration-200 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedState[index]}
                onChange={() => handleCheckChange(index)}
                className="h-5 w-5 rounded bg-neutral-700 border-neutral-600 text-brand-500 focus:ring-brand-500 focus:ring-offset-neutral-800 shrink-0"
              />
              <span className={`ml-4 text-neutral-200 transition-colors ${checkedState[index] ? 'line-through text-neutral-500' : ''}`}>
                {item}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
