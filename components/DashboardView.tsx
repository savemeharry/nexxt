
import React from 'react';
import { CompanyCardData, Task, User } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { CompassIcon } from './icons/CompassIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { GoalIcon } from './icons/GoalIcon';

interface DashboardViewProps {
    cards: CompanyCardData[];
    users: User[];
    onSelectCard: (id: string) => void;
    onShowAddCardModal: () => void;
    onStartResearch: () => void;
}

const priorityColors: { [key in Task['priority']]: string } = {
    'Low': 'bg-green-500/20 text-green-400',
    'Medium': 'bg-yellow-500/20 text-yellow-400',
    'High': 'bg-orange-500/20 text-orange-400',
    'Urgent': 'bg-red-500/20 text-red-400',
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-5 flex items-center gap-4 border-l-4 ${colorClass}`}>
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${colorClass.replace('border-l', 'bg').replace('500', '500/20')}`}>
             <div className={`w-6 h-6 ${colorClass.replace('border-l', 'text')}`}>{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>
    </div>
);

const TaskRow: React.FC<{ task: Task & { projectName: string }, assignee: User | null, onSelectProject: () => void }> = ({ task, assignee, onSelectProject }) => {
    const formatDate = (isoString?: string) => {
        if (!isoString) return 'No due date';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div onClick={onSelectProject} className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rounded-lg transition-colors cursor-pointer">
            <div className="flex-grow min-w-0">
                <p className="text-neutral-800 dark:text-neutral-200 truncate">{task.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">{task.projectName}</p>
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0 ml-4">
                 <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 hidden sm:block">{formatDate(task.dueDate)}</span>
                {assignee && <img src={assignee.avatarUrl} alt={assignee.name} title={assignee.name} className="w-6 h-6 rounded-full" />}
            </div>
        </div>
    );
};

const ProjectRow: React.FC<{ card: CompanyCardData; onSelectCard: (id: string) => void }> = ({ card, onSelectCard }) => (
    <div onClick={() => onSelectCard(card.id)} className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 rounded-lg transition-colors cursor-pointer">
        <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">{card.title}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">{card.category}</p>
        </div>
        <div className="flex -space-x-2">
            {card.members?.slice(0, 3).map(member => (
                <img key={member.id} src={member.avatarUrl} alt={member.name} title={member.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900" />
            ))}
        </div>
    </div>
);


const DashboardView: React.FC<DashboardViewProps> = ({ cards, users, onSelectCard, onShowAddCardModal, onStartResearch }) => {
    const currentUser = users[0];

    const allTasks = cards.flatMap(card => 
        (card.goals || []).flatMap(goal => goal.tasks.map(task => ({...task, projectName: card.title})))
    );

    const myTasks = allTasks
        .filter(task => task.assigneeId === currentUser.id && task.status !== 'Done')
        .sort((a, b) => new Date(a.dueDate || '2200-01-01').getTime() - new Date(b.dueDate || '2200-01-01').getTime())
        .slice(0, 5); // Show top 5

    const recentProjects = cards.slice(0, 4);

    const stats = {
        totalProjects: cards.length,
        tasksInProgress: allTasks.filter(task => task.status === 'In Progress').length,
        activeGoals: cards.reduce((acc, card) => acc + (card.goals?.length || 0), 0),
    };

    return (
        <div className="animate-fade-scale-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Welcome back, {currentUser.name.split(' ')[0]}!</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">Here's a summary of your workspace.</p>
            </header>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<BriefcaseIcon className="w-full h-full" />} label="Total Projects" value={stats.totalProjects} colorClass="border-l-brand-500 text-brand-500" />
                <StatCard icon={<ActivityIcon />} label="Tasks In Progress" value={stats.tasksInProgress} colorClass="border-l-orange-500 text-orange-500" />
                <StatCard icon={<GoalIcon className="w-full h-full" />} label="Active Goals" value={stats.activeGoals} colorClass="border-l-green-500 text-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Tasks */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">My Tasks</h3>
                        <button className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View All</button>
                    </div>
                    {myTasks.length > 0 ? (
                        <div className="space-y-1">
                           {myTasks.map(task => {
                                const project = cards.find(c => c.title === task.projectName);
                                return <TaskRow 
                                    key={task.id} 
                                    task={task} 
                                    assignee={users.find(u => u.id === task.assigneeId) || null}
                                    onSelectProject={() => project && onSelectCard(project.id)}
                                />;
                           })}
                        </div>
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">You have no upcoming tasks. Great job!</p>
                    )}
                </div>

                {/* Side Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                             <button onClick={onShowAddCardModal} className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors">
                                <div className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg"><PlusIcon /></div>
                                <div>
                                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">New Project</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Organize a new business or idea.</p>
                                </div>
                            </button>
                             <button onClick={onStartResearch} className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors">
                                <div className="w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg"><CompassIcon /></div>
                                 <div>
                                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">Start Research</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Analyze a niche or explore ideas.</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Projects */}
                    <div className="bg-white dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-6">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Recent Projects</h3>
                            <button className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">View All</button>
                        </div>
                        <div className="space-y-1">
                            {recentProjects.map(card => (
                               <ProjectRow key={card.id} card={card} onSelectCard={onSelectCard} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
