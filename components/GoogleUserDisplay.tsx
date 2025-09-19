
import React, { useState, useRef, useEffect } from 'react';
import { GoogleUserProfile } from '../types';
import { LogOutIcon } from './icons/LogOutIcon';

interface GoogleUserDisplayProps {
    user: GoogleUserProfile;
    onSignOut: () => void;
}

const GoogleUserDisplay: React.FC<GoogleUserDisplayProps> = ({ user, onSignOut }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 hover:bg-neutral-800/60 p-1 rounded-full transition-colors"
            >
                <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-neutral-200 hidden sm:block">{user.name}</span>
            </button>
            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-800/90 backdrop-blur-md border border-neutral-700/50 rounded-lg shadow-xl p-2 animate-scale-in-out origin-top-right z-50">
                    <div className="px-3 py-2 border-b border-neutral-700/50">
                        <p className="text-sm font-semibold text-neutral-100 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            onSignOut();
                            setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 mt-1 rounded-md text-sm text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
                    >
                        <LogOutIcon />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
};

export default GoogleUserDisplay;
