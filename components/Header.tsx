


import React from 'react';
import { Logo } from './Logo';
import { GoogleUserProfile } from '../types';
import GoogleUserDisplay from './GoogleUserDisplay';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
    activeView: 'DASHBOARD' | 'RESEARCH' | 'WORK' | 'TEAM';
    setActiveView: (view: 'DASHBOARD' | 'RESEARCH' | 'WORK' | 'TEAM') => void;
    googleUser: GoogleUserProfile | null;
    onGoogleSignIn: () => void;
    onGoogleSignOut: () => void;
    onOpenSettings: () => void;
    onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, googleUser, onGoogleSignIn, onGoogleSignOut, onOpenSettings, onLogoClick }) => {
    const navItems = [
        { id: 'DASHBOARD', label: 'Dashboard' },
        { id: 'RESEARCH', label: 'Research' },
        { id: 'WORK', label: 'Workspace' },
        { id: 'TEAM', label: 'Team' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-neutral-950/50 rockstar:bg-black/50 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800/60 rockstar:border-rockstar-800/60">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button onClick={onLogoClick} aria-label="Show landing page">
                            <Logo />
                        </button>
                        <nav className="flex items-center gap-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as 'DASHBOARD' | 'RESEARCH' | 'WORK' | 'TEAM')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        activeView === item.id
                                            ? 'bg-neutral-200 dark:bg-neutral-800 rockstar:bg-gradient-to-r rockstar:from-rockstar-500 rockstar:to-rockstar-purple text-neutral-800 dark:text-neutral-100 rockstar:text-white'
                                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rockstar:hover:bg-rockstar-900/50 hover:text-neutral-700 dark:hover:text-neutral-200 rockstar:hover:text-neutral-200'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                         <button
                            onClick={onOpenSettings}
                            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rockstar:hover:bg-rockstar-900/50 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
                            aria-label="Open settings"
                        >
                            <SettingsIcon />
                        </button>
                        {googleUser ? (
                            <GoogleUserDisplay user={googleUser} onSignOut={onGoogleSignOut} />
                        ) : (
                            <button
                                onClick={onGoogleSignIn}
                                className="px-4 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/70 rockstar:bg-rockstar-900/50 border border-neutral-300 dark:border-neutral-700 rockstar:border-rockstar-700 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-rockstar-700 transition-colors"
                            >
                                Sign In with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;