

import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { CpuIcon } from './icons/CpuIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

interface SettingsModalProps {
    onClose: () => void;
    currentTheme: 'light' | 'dark' | 'rockstar';
    setTheme: (theme: 'light' | 'dark' | 'rockstar') => void;
}

const Section: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="py-6">
        <div className="flex items-center mb-4">
            <div className="w-6 h-6 mr-3 text-neutral-500 dark:text-neutral-400">{icon}</div>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">{title}</h3>
        </div>
        <div className="pl-9 space-y-4">
            {children}
        </div>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, currentTheme, setTheme }) => {
    return (
        <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-scale-in p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-neutral-900 rockstar:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800 rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800 shrink-0">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800 rockstar:divide-rockstar-800">
                    <Section icon={<PaletteIcon />} title="Appearance">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Theme</label>
                            <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 rounded-lg w-min">
                                <button onClick={() => setTheme('light')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${currentTheme === 'light' ? 'bg-white shadow text-neutral-800' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/50'}`}>Light</button>
                                <button onClick={() => setTheme('dark')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${currentTheme === 'dark' ? 'bg-neutral-600 shadow text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/50'}`}>Dark</button>
                                <button onClick={() => setTheme('rockstar')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${currentTheme === 'rockstar' ? 'bg-rockstar-500 shadow text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/50'}`}>Rockstar</button>
                            </div>
                        </div>
                    </Section>

                    <Section icon={<CpuIcon />} title="AI Configuration">
                        <div className="opacity-50">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Custom API Key (Coming Soon)</label>
                            <input type="password" id="apiKey" placeholder="sk-..." disabled className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:cursor-not-allowed" />
                        </div>
                    </Section>

                    <Section icon={<CreditCardIcon />} title="Subscription & Billing">
                        <div className="flex justify-between items-center opacity-50">
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Plan</p>
                                <p className="text-neutral-800 dark:text-neutral-100 font-semibold">Pro Plan (Demo)</p>
                            </div>
                            <button disabled className="px-4 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:cursor-not-allowed">Change Plan</button>
                        </div>
                    </Section>
                </div>
                 <div className="flex justify-end p-6 border-t border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mr-2">Close</button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rockstar:bg-rockstar-600 rounded-md hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;