import React from 'react';
import { TargetIcon } from './icons/TargetIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { MessagesSquareIcon } from './icons/MessagesSquareIcon';


const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] animate-fade-scale-in">
      <div className="text-center p-8 w-full max-w-5xl">
         <h1 className="font-logo text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 rockstar:text-transparent rockstar:bg-clip-text rockstar:bg-gradient-to-r rockstar:from-rockstar-400 rockstar:to-rockstar-purple tracking-wider">nexxt</h1>
         <h2 className="text-xl md:text-2xl font-semibold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-500 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-500 animate-text-reveal [background-size:200%_auto]">
          Pro Business Copilot
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mt-4 mb-10">
          From initial market research to daily project management, nexxt is your AI partner for the entire business lifecycle. Analyze niches, create plans, and manage your projects in one integrated workspace.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white dark:bg-neutral-900/50 rockstar:bg-neutral-900/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800/80 rockstar:border-rockstar-800/60">
            <div className="flex items-center text-neutral-800 dark:text-neutral-200 rockstar:text-neutral-200 mb-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/70 rockstar:bg-rockstar-900/50 flex items-center justify-center mr-3 shrink-0">
                  <TargetIcon />
              </div>
              <h3 className="font-semibold">Deep-Dive Research</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Conduct comprehensive market analysis, generate data-driven business ideas, and create actionable plans to validate your next venture.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900/50 rockstar:bg-neutral-900/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800/80 rockstar:border-rockstar-800/60">
             <div className="flex items-center text-neutral-800 dark:text-neutral-200 rockstar:text-neutral-200 mb-2">
              <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/70 rockstar:bg-rockstar-900/50 flex items-center justify-center mr-3 shrink-0">
                  <BriefcaseIcon />
              </div>
              <h3 className="font-semibold">Integrated Workspace</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Organize your projects, manage documents, and centralize all your business assets in one place for streamlined operations.</p>
          </div>
          <div className="bg-white dark:bg-neutral-900/50 rockstar:bg-neutral-900/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800/80 rockstar:border-rockstar-800/60">
             <div className="flex items-center text-neutral-800 dark:text-neutral-200 rockstar:text-neutral-200 mb-2">
               <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800/70 rockstar:bg-rockstar-900/50 flex items-center justify-center mr-3 shrink-0">
                  <MessagesSquareIcon />
              </div>
              <h3 className="font-semibold">AI Co-Pilot</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Chat with your AI assistant. Analyze documents, brainstorm strategies, and get instant answers based on the context of your projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;