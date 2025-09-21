

import React, { useState } from 'react';
import { BusinessPlan } from '../types';
import { FormattedText } from './FormattedText';
import { TargetIcon } from './icons/TargetIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

interface BusinessPlanDisplayProps {
  plan: BusinessPlan;
  onBack: () => void;
  onCreateProject: () => void;
  onSaveToDrive: () => void;
  isGoogleSignedIn: boolean;
}

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => (
  <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl overflow-hidden transition-all duration-300">
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 bg-neutral-100 dark:bg-neutral-800 rockstar:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rockstar:text-rockstar-300">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
      </div>
      <div className="prose dark:prose-invert rockstar:prose-rockstar max-w-none">
        {children}
      </div>
    </div>
  </div>
);

const BusinessPlanDisplay: React.FC<BusinessPlanDisplayProps> = ({ plan, onBack, onCreateProject, onSaveToDrive, isGoogleSignedIn }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy for Notion');

  const convertToNotionMarkdown = () => {
    return `
# 🚀 Business Plan

## 🎯 Mission Statement
${plan.missionStatement}

## ✨ Value Proposition
${plan.valueProposition}

## 📢 Marketing & Sales Strategy
${plan.marketingStrategy.replace(/(\d+\.)/g, '\n-')}

## 📊 Key Performance Indicators (KPIs)
${plan.kpis.replace(/(\d+\.)/g, '\n-')}

## 🗓️ 90-Day Action Plan
${plan.actionPlan.replace(/Month (\d+):/g, '\n### Month $1\n').replace(/-\s/g, '- [ ] ')}
    `;
  };

  const handleCopyToClipboard = () => {
    const markdown = convertToNotionMarkdown();
    navigator.clipboard.writeText(markdown.trim());
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy for Notion'), 2000);
  };

  return (
    <div className="mt-12 space-y-8 animate-fade-scale-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white/80 dark:bg-neutral-900/80 rockstar:bg-black/60 border border-brand-200 dark:border-brand-800/50 rockstar:border-rockstar-500/50 rounded-xl">
        <div className="flex-1">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                <DocumentIcon />
                Your Business Plan
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">The next step in your venture. Ready to execute.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors justify-center"
            >
                <ArrowLeftIcon />
                Back to Analysis
            </button>
             <button
                onClick={onCreateProject}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-600 rockstar:bg-rockstar-600 text-white rounded-full hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-colors justify-center"
            >
                <BriefcaseIcon />
                Create Project
            </button>
            <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors justify-center"
            >
            <ClipboardCopyIcon />
            {copyButtonText}
            </button>
            {isGoogleSignedIn && (
                <button
                    onClick={onSaveToDrive}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors justify-center"
                >
                    <GoogleDriveIcon />
                    Save to Drive
                </button>
            )}
        </div>
      </header>

      <div className="space-y-6">
        <ResultCard title="Mission Statement" icon={<TargetIcon />}>
          <p className="text-lg italic text-neutral-600 dark:text-neutral-200">{plan.missionStatement}</p>
        </ResultCard>

        <ResultCard title="Value Proposition" icon={<CheckCircleIcon />}>
          <FormattedText text={plan.valueProposition} />
        </ResultCard>

        <ResultCard title="Marketing & Sales Strategy" icon={<ArrowRightIcon />}>
          <FormattedText text={plan.marketingStrategy} />
        </ResultCard>

        <ResultCard title="Key Performance Indicators (KPIs)" icon={<ChartBarIcon />}>
          <FormattedText text={plan.kpis} />
        </ResultCard>

        <ResultCard title="90-Day Action Plan" icon={<DocumentIcon />}>
          <FormattedText text={plan.actionPlan} />
        </ResultCard>
      </div>
    </div>
  );
};

export default BusinessPlanDisplay;