

import React, { useState } from 'react';
import { Logo } from './Logo';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ResearchMode } from '../types';
import { ArrowUpIcon } from './icons/ArrowUpIcon';

interface LandingPageProps {
    onEnterApp: () => void;
    onStartResearch: (topic: string, mode: ResearchMode) => void;
}

const ElegantMediaFrame: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
    <div className="aspect-video w-full p-2 bg-white/5 rounded-2xl relative shadow-2xl shadow-black/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="w-full h-full bg-neutral-900 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
             {imageUrl ? (
                <img src={imageUrl} alt="Feature visual" className="w-full h-full object-cover rounded-lg" />
            ) : (
                <p className="text-neutral-500 text-sm">Your animation or image here</p>
            )}
        </div>
         <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none"></div>
         <div className="absolute -inset-px rounded-2xl border border-white/20 blur pointer-events-none"></div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onStartResearch }) => {
    const [topic, setTopic] = useState('');
    const [mode, setMode] = useState<ResearchMode>(ResearchMode.Analyze);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onStartResearch(topic, mode);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg animate-fade-scale-in flex flex-col font-sans">
            <style>{`.bg-grid-pattern { background-image: linear-gradient(white 0.5px, transparent 0.5px), linear-gradient(to right, white 0.5px, transparent 0.5px); background-size: 20px 20px; }`}</style>
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
            
             <header className="fixed top-0 left-0 right-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Logo />
                        <button 
                            onClick={onEnterApp} 
                            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-neutral-200 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-colors"
                        >
                            Enter Workspace
                            <ChevronRightIcon className="w-4 h-4 text-current" />
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow overflow-y-auto pt-16 text-white">
                {/* Hero Section */}
                <section className="text-center pt-24 pb-20 px-4">
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight animate-fade-scale-in" style={{ animationDelay: '100ms' }}>
                        Build what's <span className="font-logo text-transparent bg-clip-text bg-gradient-to-r from-rockstar-400 to-rockstar-purple">nexxt</span>
                    </h1>
                    <p className="max-w-2xl mx-auto mt-4 text-lg text-neutral-300 animate-fade-scale-in" style={{ animationDelay: '250ms' }}>
                        Your Pro Business Copilot. Validate your idea and get started in seconds.
                    </p>
                    
                    <form 
                        onSubmit={handleSubmit}
                        className="mt-8 max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2 shadow-lg rockstar:shadow-[0_0_30px_rgba(236,72,153,0.25)] flex flex-col sm:flex-row items-center gap-2 animate-fade-scale-in" 
                        style={{ animationDelay: '400ms' }}
                    >
                        <div className="flex items-center gap-1 p-1 bg-black/20 rounded-lg w-full sm:w-auto">
                            <button type="button" onClick={() => setMode(ResearchMode.Analyze)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === ResearchMode.Analyze ? 'bg-white/10 rockstar:bg-rockstar-500/50' : 'text-neutral-400 hover:bg-white/5'}`}>Analyze</button>
                            <button type="button" onClick={() => setMode(ResearchMode.Explore)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${mode === ResearchMode.Explore ? 'bg-white/10 rockstar:bg-rockstar-500/50' : 'text-neutral-400 hover:bg-white/5'}`}>Explore</button>
                        </div>
                         <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={mode === ResearchMode.Analyze ? "Analyze a business niche..." : "Explore ideas for..."}
                            className="flex-grow h-12 w-full sm:w-auto bg-transparent text-white text-lg placeholder-neutral-500 focus:outline-none px-4"
                        />
                        <button
                            type="submit"
                            disabled={!topic.trim()}
                            className="flex items-center justify-center h-12 w-full sm:w-24 bg-brand-600 text-white rounded-lg hover:bg-brand-700 rockstar:bg-rockstar-600 rockstar:hover:bg-rockstar-700 transition-colors disabled:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            aria-label="Start research"
                        >
                            <span className="hidden sm:inline">Start</span>
                            <ArrowUpIcon />
                        </button>
                    </form>
                </section>
                
                {/* Visual Journey Section */}
                <section className="py-24 px-4 container mx-auto max-w-5xl">
                    <div className="relative">
                        {/* Timeline */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-rockstar-purple/50 to-transparent"></div>

                        {/* Step 1: Research */}
                        <div className="relative mb-32 grid md:grid-cols-2 gap-x-12 items-center">
                            <div className="md:text-right">
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 rounded-full bg-rockstar-purple shadow-[0_0_15px_3px] shadow-rockstar-purple/80"></div>
                                <span className="text-sm font-bold text-brand-400 rockstar:text-rockstar-cyan">STEP 1</span>
                                <h2 className="text-3xl font-bold text-white mt-2">From Spark to Strategy</h2>
                                <p className="text-neutral-300 mt-4">
                                    Turn your idea into a data-backed strategy. Our AI conducts deep market research, analyzes competitors, and visualizes data to give you clarity.
                                </p>
                            </div>
                            <div className="mt-8 md:mt-0">
                                <ElegantMediaFrame imageUrl="https://higgsfield.ai/_next/image?url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_325JgdX3BRXQoNum4750JYlQHGd%2Ffbfef035-8a67-4153-81e5-c3ed600a2df4_min.webp&w=3840&q=75" />
                            </div>
                        </div>

                        {/* Step 2: Workspace */}
                         <div className="relative mb-32 grid md:grid-cols-2 gap-x-12 items-center">
                            <div className="md:order-2 md:text-left">
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 rounded-full bg-rockstar-purple shadow-[0_0_15px_3px] shadow-rockstar-purple/80"></div>
                                <span className="text-sm font-bold text-brand-400 rockstar:text-rockstar-cyan">STEP 2</span>
                                <h2 className="text-3xl font-bold text-white mt-2">Your Command Center</h2>
                                <p className="text-neutral-300 mt-4">
                                   Centralize all your documents, from business plans to marketing copy. Our intelligent file manager creates order from chaos.
                                </p>
                            </div>
                             <div className="md:order-1 mt-8 md:mt-0">
                               <ElegantMediaFrame imageUrl="https://higgsfield.ai/_next/image?url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_325JgdX3BRXQoNum4750JYlQHGd%2F217e2e77-1c7c-4c6e-826c-d2c2049e217c_min.webp&w=3840&q=75" />
                            </div>
                        </div>

                        {/* Step 3: Copilot */}
                        <div className="relative grid md:grid-cols-2 gap-x-12 items-center">
                           <div className="md:text-right">
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-3 h-3 rounded-full bg-rockstar-purple shadow-[0_0_15px_3px] shadow-rockstar-purple/80"></div>
                                <span className="text-sm font-bold text-brand-400 rockstar:text-rockstar-cyan">STEP 3</span>
                                <h2 className="text-3xl font-bold text-white mt-2">Supercharge Your Workflow</h2>
                                <p className="text-neutral-300 mt-4">
                                   Let your AI Copilot do the heavy lifting. Draft documents, summarize research, create tasks, and organize files with simple chat commands.
                                </p>
                            </div>
                             <div className="mt-8 md:mt-0">
                               <ElegantMediaFrame imageUrl="https://higgsfield.ai/_next/image?url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_325JgdX3BRXQoNum4750JYlQHGd%2F7ea5bc19-dc4b-4385-aec7-c26f5beb8d3c_min.webp&w=3840&q=75" />
                             </div>
                        </div>
                    </div>
                </section>
                
                 {/* Final CTA */}
                <section className="py-20 px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to build what's nexxt?</h2>
                    <p className="max-w-xl mx-auto mt-4 text-neutral-300">
                        Stop juggling tabs and tools. Get the integrated AI workspace that takes you from idea to execution.
                    </p>
                    <button 
                        onClick={onEnterApp} 
                        className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 text-lg font-medium text-white bg-brand-600 rockstar:bg-rockstar-600 rounded-lg hover:bg-brand-700 rockstar:hover:bg-rockstar-700 transition-transform hover:scale-105"
                    >
                        Enter Workspace
                        <ChevronRightIcon className="w-5 h-5 text-current" />
                    </button>
                </section>

                <footer className="text-center py-8 text-neutral-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} nexxt. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;