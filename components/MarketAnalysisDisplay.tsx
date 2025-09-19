

import React, { useState, useEffect } from 'react';
import { MarketAnalysisResult, ResearchMode } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { InteractiveList } from './InteractiveList';
import { RefreshIcon } from './icons/RefreshIcon';
import { EyeIcon } from './icons/EyeIcon';
import { ChartPieIcon } from './icons/ChartPieIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { StatCardGrid } from './StatCardGrid';
import { SwotDisplay } from './SwotDisplay';
import { CompetitorTableView } from './CompetitorTableView';
import { FormattedText } from './FormattedText';
import { ChartDisplay } from './ChartDisplay';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';


interface MarketAnalysisDisplayProps {
  result: MarketAnalysisResult;
  onSelectBusinessIdea: (idea: string) => void;
  onSelectExploredIdea: (idea: string) => void;
  onNewResearch: () => void;
  onSaveToDrive: () => void;
  isGoogleSignedIn: boolean;
  theme: 'light' | 'dark' | 'rockstar';
}

const MarketAnalysisDisplay: React.FC<MarketAnalysisDisplayProps> = ({ 
    result, 
    onSelectBusinessIdea, 
    onSelectExploredIdea, 
    onNewResearch,
    onSaveToDrive,
    isGoogleSignedIn,
    theme,
}) => {
    
    const isExploreMode = result.mode === ResearchMode.Explore;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <EyeIcon /> },
        { id: 'insights', label: 'Insights', icon: <ChartPieIcon /> },
        { id: 'competition', label: 'Competition', icon: <ShieldExclamationIcon /> },
        { id: 'ideas', label: 'Ideas & Sources', icon: <RocketLaunchIcon /> },
    ];
    
    const [activeTab, setActiveTab] = useState(tabs[0].id);
    
    useEffect(() => {
        const scrollContainer = document.querySelector('main.overflow-y-auto');
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }, [activeTab]);


    if (isExploreMode) {
        return (
             <div className="space-y-8 animate-fade-scale-in">
                <header>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-500 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-500 rockstar:from-rockstar-400 rockstar:to-rockstar-purple animate-text-reveal [background-size:200%_auto]">
                        {result.generatedTitle}
                    </h1>
                     <div className="flex items-center gap-2 mt-4">
                         <button
                            onClick={onNewResearch}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors shrink-0 text-neutral-700 dark:text-neutral-200"
                        >
                            <RefreshIcon />
                            New Research
                        </button>
                        {isGoogleSignedIn && (
                             <button
                                onClick={onSaveToDrive}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 rockstar:hover:bg-neutral-700 transition-colors shrink-0 text-neutral-700 dark:text-neutral-200"
                            >
                                <GoogleDriveIcon />
                                Save to Drive
                            </button>
                        )}
                     </div>
                </header>
                <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-8">
                    <p className="text-lg italic text-neutral-800 dark:text-neutral-200 mb-6">{result.executiveSummary}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-4">Select an idea to analyze its market potential.</p>
                    <InteractiveList text={result.businessIdeas} onSelect={onSelectExploredIdea} />
                </div>
             </div>
        )
    }

  return (
    <div className="space-y-8 animate-fade-scale-in">
        <header>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-500 dark:from-neutral-100 dark:via-neutral-300 dark:to-neutral-500 rockstar:from-rockstar-400 rockstar:to-rockstar-purple animate-text-reveal [background-size:200%_auto]">
                {result.generatedTitle}
            </h1>
            <div className="flex items-center gap-2 mt-4">
                <button
                    onClick={onNewResearch}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                    <RefreshIcon />
                    New Research
                </button>
                 {isGoogleSignedIn && (
                    <button
                        onClick={onSaveToDrive}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800/80 rockstar:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rockstar:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                        <GoogleDriveIcon />
                        Save to Drive
                    </button>
                )}
            </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <aside className="md:w-1/4 lg:w-1/5 shrink-0">
                <nav className="sticky top-24 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                activeTab === tab.id
                                    ? 'bg-neutral-100 dark:bg-neutral-800 rockstar:bg-rockstar-900 text-neutral-900 dark:text-neutral-100 rockstar:text-rockstar-300'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 rockstar:hover:bg-neutral-800/60 hover:text-neutral-800 dark:hover:text-neutral-200'
                            }`}
                        >
                            <span className="w-5 h-5">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-grow min-w-0">
                {activeTab === 'overview' && (
                    <div id="overview" className="animate-fade-scale-in">
                        <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-8">
                            <p className="text-lg italic text-neutral-800 dark:text-neutral-200 mb-6">{result.executiveSummary}</p>
                            {result.marketStats && result.marketStats.length > 0 && (
                                <StatCardGrid stats={result.marketStats} />
                            )}
                            <div className="prose dark:prose-invert rockstar:prose-rockstar max-w-none mt-6">
                                <FormattedText text={result.marketOverview} />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'insights' && (
                    <div id="insights" className="animate-fade-scale-in">
                         <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-8 space-y-8">
                             {result.chartData && (
                                <>
                                    <ChartDisplay chartData={result.chartData} theme={theme} />
                                    <hr className="border-neutral-200 dark:border-neutral-700/50 rockstar:border-rockstar-800/50" />
                                </>
                             )}
                             <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Key Trends</h3>
                                <div className="prose dark:prose-invert rockstar:prose-rockstar max-w-none">
                                    <FormattedText text={result.keyTrends} />
                                </div>
                             </div>
                             <hr className="border-neutral-200 dark:border-neutral-700/50 rockstar:border-rockstar-800/50" />
                             <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Target Audience</h3>
                                 <div className="prose dark:prose-invert rockstar:prose-rockstar max-w-none">
                                    <FormattedText text={result.targetAudience} />
                                </div>
                             </div>
                         </div>
                    </div>
                )}
                {activeTab === 'competition' && (
                    <div id="competition" className="animate-fade-scale-in">
                        <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-8 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Competitive Landscape</h3>
                                <div className="prose dark:prose-invert rockstar:prose-rockstar max-w-none mb-6">
                                    <p>{result.competitorAnalysis}</p>
                                </div>
                                {result.competitorTable && <CompetitorTableView tableData={result.competitorTable} />}
                            </div>
                            <hr className="border-neutral-200 dark:border-neutral-700/50 rockstar:border-rockstar-800/50" />
                            <div>
                               <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">SWOT Analysis</h3>
                               <SwotDisplay swotAnalysis={result.swotAnalysis} />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'ideas' && (
                    <div id="ideas" className="animate-fade-scale-in">
                         <div className="bg-white/80 dark:bg-neutral-900/60 rockstar:bg-black/40 border border-neutral-200 dark:border-neutral-800 rockstar:border-rockstar-800/60 rounded-xl p-8 space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-3"><LightbulbIcon /> Business Ideas</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-4">Select a business idea below to generate an actionable plan.</p>
                                <InteractiveList text={result.businessIdeas} onSelect={onSelectBusinessIdea} />
                            </div>
                             <hr className="border-neutral-200 dark:border-neutral-700/50 rockstar:border-rockstar-800/50" />
                             <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-3"><LinkIcon /> Sources</h3>
                                {result.sources && result.sources.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                    {result.sources.map((source, index) => (
                                        <a
                                        key={index}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-neutral-100 dark:bg-neutral-800 rockstar:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rockstar:text-neutral-300 text-sm px-3 py-1.5 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/50 rockstar:hover:bg-rockstar-purple/30 hover:text-brand-800 dark:hover:text-neutral-100 rockstar:hover:text-white transition-colors break-all"
                                        title={source.uri}
                                        >
                                        {source.title}
                                        </a>
                                    ))}
                                    </div>
                                ) : (
                                    <p className="text-neutral-500">No web sources were cited for this response.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </div>
  );
};

export default MarketAnalysisDisplay;