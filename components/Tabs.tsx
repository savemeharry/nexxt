import React, { useState, Children, isValidElement, cloneElement } from 'react';

interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    return (
        <div>
            <div className="mb-6 flex items-center justify-center gap-2 p-1 bg-neutral-900/70 border border-neutral-800 rounded-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none ${
                            activeTab === tab.id
                            ? 'bg-neutral-700/60 text-neutral-100'
                            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div>
                {Children.map(children, child => {
                    // FIX: Cast child.props to access the 'id' property and resolve the TypeScript error.
                    if (isValidElement(child) && (child.props as { id?: string }).id === activeTab) {
                        return cloneElement(child, { key: activeTab });
                    }
                    return null;
                })}
            </div>
        </div>
    );
};