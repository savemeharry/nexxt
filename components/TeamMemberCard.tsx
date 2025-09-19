


import React, { useState, useRef, useEffect } from 'react';
import { TeamMember, CompanyCardData } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';
import { UserMinusIcon } from './icons/UserMinusIcon';

interface TeamMemberCardProps {
    member: TeamMember;
    projects: CompanyCardData[];
    onAssignProject: () => void;
    onFillRole: () => void;
    onUnassignPerson: () => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, projects, onAssignProject, onFillRole, onUnassignPerson }) => {
    const assignedProjects = member.assignedProjectIds.map(id => projects.find(p => p.id === id)).filter(Boolean);
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
    
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setIsMenuOpen(false);
    };

    if (member.status === 'OPEN') {
        return (
            <div className="bg-white dark:bg-neutral-900/50 rockstar:bg-black/40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 rounded-xl p-6 flex flex-col h-full transition-colors duration-300 hover:border-brand-500/50 dark:hover:border-brand-600/50 rockstar:hover:border-rockstar-500/50">
                <div className="flex items-center mb-4">
                     <div className="w-16 h-16 rounded-full mr-4 bg-neutral-100 dark:bg-neutral-800/70 flex items-center justify-center">
                        <UserPlusIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{member.role}</h3>
                        <p className="text-sm font-semibold text-orange-500 dark:text-orange-400">Open Role</p>
                    </div>
                </div>
                <div className="flex-grow">
                    <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Primary Responsibilities</h4>
                    <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                        {member.responsibilities.slice(0, 3).map((resp, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                                <span>{resp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800/50 rockstar:border-neutral-800/50 space-y-3">
                    {assignedProjects.length > 0 && (
                         <div className="flex flex-wrap gap-1.5">
                             {assignedProjects.map(p => p && (
                                <span key={p.id} className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">{p.title}</span>
                             ))}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                         <button onClick={onAssignProject} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors">
                            <PlusIcon /> Assign Project
                        </button>
                        <button onClick={onFillRole} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-brand-600 rockstar:bg-rockstar-600 text-white rounded-md hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-colors">
                            <UserPlusIcon className="w-4 h-4" /> Fill Role
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group bg-white dark:bg-neutral-900/60 rockstar:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800 rounded-xl p-6 flex flex-col h-full transition-all duration-300 hover:border-brand-400 dark:hover:border-brand-700/60 rockstar:hover:border-rockstar-500">
            <div className="absolute top-3 right-3 z-10" ref={menuRef}>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }}
                    className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="More options"
                >
                    <DotsVerticalIcon />
                </button>
                 {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-100 dark:bg-neutral-800/90 rockstar:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/50 rockstar:border-neutral-700/50 rounded-lg shadow-xl p-1.5 animate-scale-in-out origin-top-right">
                         <button
                            onClick={(e) => handleActionClick(e, onAssignProject)}
                            className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700/50 rockstar:hover:bg-neutral-700/50"
                        >
                            <PlusIcon /> Manage Projects
                        </button>
                         <button
                            onClick={(e) => handleActionClick(e, onUnassignPerson)}
                            className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-sm text-red-500/80 dark:text-red-500/80 hover:bg-red-500/10 dark:hover:bg-red-500/10"
                        >
                            <UserMinusIcon /> Unassign Person
                        </button>
                    </div>
                )}
            </div>
            <div className="flex items-center mb-4">
                {member.person && (
                    <img src={member.person.avatarUrl} alt={member.person.name} className="w-16 h-16 rounded-full mr-4" />
                )}
                <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{member.person?.name || 'N/A'}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{member.role}</p>
                </div>
            </div>
             <div className="flex-grow">
                <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Key Responsibilities</h4>
                <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-300">
                    {member.responsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                            <span>{resp}</span>
                        </li>
                    ))}
                     {member.responsibilities.length > 3 && (
                         <li className="text-xs text-neutral-500 dark:text-neutral-500 pl-6">...and {member.responsibilities.length - 3} more</li>
                    )}
                </ul>
            </div>
            
            {assignedProjects.length > 0 && (
                 <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800 rockstar:border-neutral-800">
                    <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4" />
                        Assigned Projects
                    </h4>
                     <div className="flex flex-wrap gap-1.5">
                         {assignedProjects.map(p => p && (
                            <span key={p.id} className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">{p.title}</span>
                         ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamMemberCard;