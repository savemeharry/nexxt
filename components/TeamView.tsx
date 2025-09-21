


import React, { useState, useMemo } from 'react';
import { CompanyCardData, TeamMember, User } from '../types';
import TeamMemberCard from './TeamMemberCard';
import { UsersIcon } from './icons/UsersIcon';
import AssignProjectModal from './AssignProjectModal';
import FillRoleModal from './FillRoleModal';

type TeamFilter = 'ALL' | 'OPEN' | 'FILLED';

interface TeamViewProps {
    teamMembers: TeamMember[];
    projects: CompanyCardData[];
    users: User[];
    onUpdateTeamMember: (member: TeamMember) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ teamMembers, projects, users, onUpdateTeamMember }) => {
    const [filter, setFilter] = useState<TeamFilter>('ALL');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isFillRoleModalOpen, setIsFillRoleModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const filteredMembers = useMemo(() => {
        if (filter === 'OPEN') return teamMembers.filter(m => m.status === 'OPEN');
        if (filter === 'FILLED') return teamMembers.filter(m => m.status === 'FILLED');
        return teamMembers;
    }, [teamMembers, filter]);

    const handleOpenAssignModal = (member: TeamMember) => {
        setSelectedMember(member);
        setIsAssignModalOpen(true);
    };

    const handleOpenFillRoleModal = (member: TeamMember) => {
        setSelectedMember(member);
        setIsFillRoleModalOpen(true);
    };
    
    const handleUnassignPerson = (member: TeamMember) => {
        if (window.confirm(`Are you sure you want to unassign ${member.person?.name}? This will make the ${member.role} role open again.`)) {
            onUpdateTeamMember({
                ...member,
                status: 'OPEN',
                person: undefined,
            });
        }
    };


    return (
        <div className="animate-fade-scale-in">
             {selectedMember && isAssignModalOpen && (
                <AssignProjectModal
                    member={selectedMember}
                    projects={projects}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSave={(updatedMember) => {
                        onUpdateTeamMember(updatedMember);
                        setIsAssignModalOpen(false);
                    }}
                />
            )}
             {selectedMember && isFillRoleModalOpen && (
                <FillRoleModal
                    member={selectedMember}
                    availableUsers={users}
                    onClose={() => setIsFillRoleModalOpen(false)}
                    onSave={(updatedMember) => {
                        onUpdateTeamMember(updatedMember);
                        setIsFillRoleModalOpen(false);
                    }}
                />
            )}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Team Planner</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Define roles, assign projects, and build the team for your venture.</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800/50 rockstar:bg-neutral-800/50 rounded-lg">
                    {(['ALL', 'OPEN', 'FILLED'] as TeamFilter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                filter === f
                                    ? 'bg-white dark:bg-neutral-700 rockstar:bg-rockstar-900 text-neutral-800 dark:text-white shadow'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/60 rockstar:hover:bg-neutral-700/60'
                            }`}
                        >
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </header>

            {teamMembers.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col items-center min-h-[400px] justify-center">
                    <div className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4">
                        <UsersIcon />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-300 mt-4">Build your dream team.</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2 max-w-lg">
                        Use the AI chat below to get started. Describe your project, and nexxt will suggest roles you need to hire for.
                    </p>
                    <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-500 space-y-2">
                        <p className="font-semibold">Try asking:</p>
                        <ul className="text-left list-disc list-inside">
                            <li>"What roles do I need for my '{projects[0]?.title || 'first'}' project?"</li>
                            <li>"Suggest a team structure for a 5-person startup."</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map(member => (
                        <TeamMemberCard 
                            key={member.id} 
                            member={member} 
                            projects={projects}
                            onAssignProject={() => handleOpenAssignModal(member)}
                            onFillRole={() => handleOpenFillRoleModal(member)}
                            onUnassignPerson={() => handleUnassignPerson(member)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamView;