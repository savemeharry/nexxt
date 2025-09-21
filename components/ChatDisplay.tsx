

import React, { useEffect, useRef } from 'react';
import { ChatMessage, PatchFileOperation } from '../types';
import { FormattedText } from './FormattedText';
import { SolutionCardDisplay } from './SolutionCardDisplay';
import { FileBadgeIcon } from './icons/FileBadgeIcon';
import { SourcesList } from './SourceCard';
import { LiveSearchIndicator } from './LiveSearchIndicator';
import { TerminalIcon } from './icons/TerminalIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface ChatDisplayProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSelectProject: (projectId: string) => void;
    isWebSearchActive?: boolean;
    searchQueries?: string[];
    foundSources?: string[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ 
    messages, 
    isLoading, 
    onSelectProject,
    isWebSearchActive = false,
    searchQueries = [],
    foundSources = []
}) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="p-4 space-y-6 w-full max-w-4xl mx-auto">
            {/* Live search indicator */}
            {isWebSearchActive && (
                <LiveSearchIndicator 
                    isSearching={isLoading}
                    searchQueries={searchQueries}
                    foundSources={foundSources}
                />
            )}
            
            {messages.map((msg, index) => {
                if (msg.role === 'system') {
                     const text = msg.content.text;
                    let prefix = text;
                    let contextName = '';

                    if (text.includes(': ')) {
                        const parts = text.split(': ');
                        prefix = parts[0] + ': ';
                        contextName = parts.slice(1).join(': ');
                    } else {
                        const lastSpaceIndex = text.lastIndexOf(' ');
                        if (lastSpaceIndex > -1) {
                            prefix = text.substring(0, lastSpaceIndex + 1);
                            contextName = text.substring(lastSpaceIndex + 1);
                        }
                    }

                    return (
                         <div key={index} className="flex justify-center my-4 animate-fade-scale-in">
                            <div className="text-center text-xs text-neutral-400 border border-neutral-700/80 rounded-full px-4 py-2 bg-neutral-900/50">
                                <span>{prefix}</span>
                                <span className="font-bold text-brand-400">{contextName}</span>
                            </div>
                        </div>
                    );
                }
                
                return (
                    <div
                        key={index}
                        className={`flex flex-col gap-2 animate-fade-scale-in ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        {msg.role === 'user' && msg.content.attachments && msg.content.attachments.length > 0 && (
                            <div className="flex flex-wrap justify-end gap-2 max-w-full">
                                {msg.content.attachments.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 bg-neutral-700 text-sm text-neutral-200 rounded-full px-3 py-1">
                                        <FileBadgeIcon />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {msg.content.text && (
                            <div
                                className={`px-4 py-3 rounded-2xl prose prose-invert prose-sm max-w-[85%] w-fit ${
                                msg.role === 'user'
                                ? 'bg-brand-700 text-white rounded-br-lg'
                                : 'bg-neutral-800 text-neutral-200 rounded-bl-lg'
                            }`}
                            >
                                <FormattedText text={msg.content.text} />
                            </div>
                        )}
                        {/* Фоллбек: если у модели есть ссылки в тексте, но нет cards — вытащим и покажем карточками */}
                        {msg.role === 'model' && !msg.content.cards && msg.content.text && (() => {
                            const urlRegex = /(https?:\/\/[^\s)]+)|((?:www\.)[^\s)]+\.[^\s)]+)/gi;
                            const urls = Array.from(new Set((msg.content.text.match(urlRegex) || []).map(u => (u.startsWith('http') ? u : `https://${u}`))));
                            if (urls.length === 0) return null;
                            const sources = urls.slice(0, 8).map(link => ({ 
                                title: new URL(link).hostname.replace(/^www\./,''), 
                                description: '', 
                                link 
                            }));
                            return (
                                <div className="w-full max-w-full mt-3">
                                    <SourcesList 
                                        sources={sources} 
                                        title="Найденные источники"
                                        compact={true}
                                        showIndexes={false}
                                        maxSources={6}
                                    />
                                </div>
                            );
                        })()}
                        {msg.role === 'model' && msg.content.projectClarification && (
                            <div className="w-full max-w-xl mt-2 space-y-2">
                                {msg.content.projectClarification.map(project => (
                                    <button 
                                        key={project.id}
                                        onClick={() => onSelectProject(project.id)}
                                        className="w-full text-left p-3 rounded-lg bg-neutral-800/70 border border-neutral-700 hover:bg-brand-800/50 hover:border-brand-700 transition-colors flex items-center gap-3"
                                    >
                                        <BriefcaseIcon />
                                        <span className="font-semibold text-neutral-200">{project.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {msg.role === 'model' && msg.content.executedOperations && msg.content.executedOperations.length > 0 && (
                            <div className="w-full max-w-xl border border-neutral-700/80 bg-neutral-900/50 rounded-lg p-3 mt-2">
                                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                                    <TerminalIcon />
                                    <span>AI File Operations Executed</span>
                                </div>
                                <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all">
                                    <code>
                                        {msg.content.executedOperations.map((op, i) => {
                                            if (op.operation === 'PATCH_FILE') {
                                                const patchOp = op as PatchFileOperation;
                                                const changeCount = patchOp.patches.length;
                                                return <div key={i}>{`PATCH_FILE: Applied ${changeCount} change${changeCount !== 1 ? 's' : ''} to "${patchOp.path}"`}</div>;
                                            }
                                            let opString = `${op.operation}: `;
                                            if ('path' in op) opString += `"${op.path}"`;
                                            if ('sourcePath' in op) opString += `"${op.sourcePath}" -> "${op.destinationPath}"`;
                                            return <div key={i}>{opString}</div>;
                                        })}
                                    </code>
                                </pre>
                            </div>
                        )}
                        {msg.role === 'model' && msg.content.cards && msg.content.cards.length > 0 && (
                             <div className="w-full max-w-full mt-3">
                                <SourcesList 
                                    sources={msg.content.cards} 
                                    title="Рекомендуемые источники"
                                    compact={true}
                                    showIndexes={false}
                                    maxSources={8}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            {isLoading && (
                <div className="flex justify-start">
                     <div className="px-4 py-3 rounded-2xl bg-neutral-800 text-neutral-200 rounded-bl-lg">
                        <div className="flex items-center space-x-2">
                            <span className="h-2 w-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-neutral-500 rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatDisplay;