

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ResearchMode, MarketAnalysisResult, BusinessPlan, ChatMessage, CompanyCardData, Asset, AttachedFile, GoogleUserProfile, FileOperation, User, CreateGoalOperation, CreateTaskOperation, Goal, Task, EditTaskOperation, AddSubtaskOperation, SetTaskStatusOperation, TeamMember, PatchFileOperation } from './types';
import { fetchMarketAnalysis, fetchBusinessPlan, fetchFollowUp } from './services/geminiService';
import * as googleDriveService from './services/googleDriveService';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import MarketAnalysisDisplay from './components/MarketAnalysisDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryPanel from './components/HistoryPanel';
import BusinessPlanDisplay from './components/BusinessPlanDisplay';
import Header from './components/Header';
import LoginOverlay from './components/LoginOverlay';
import ChatPanel from './components/ChatPanel';
import ChatBar from './components/ChatBar';
import WorkView from './components/WorkView';
import ProjectView from './components/ProjectView';
import ProjectModal from './components/ProjectModal';
import AIFeedbackDisplay from './components/AIFeedbackDisplay';
import ContextualResearchView from './components/ContextualResearchView';
import { AssetManager } from './utils/assetManager';
import SettingsModal from './components/SettingsModal';
import TrashModal from './components/TrashModal';
import DashboardView from './components/DashboardView';
import { demoProjects, mockUsers } from './data/demoData';
import LandingPage from './components/LandingPage';
import TeamView from './components/TeamView';
import SplitView from './components/SplitView';
import ResumeEditingBanner from './components/ResumeEditingBanner';

interface PausedEditorSession {
    asset: AttachedFile;
    messages: ChatMessage[];
    projectId: string;
}

// Helper functions for DOCX processing
declare const mammoth: any;

const uint8ArrayToBinaryString = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}

const b64_to_utf8 = (str: string): string => {
    try {
        const binary_string = atob(str);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        const decoder = new TextDecoder(); // Default is utf-8
        return decoder.decode(bytes);
    } catch (e) {
        console.error("Error in b64_to_utf8:", e);
        return "Error: Could not decode content.";
    }
};

const utf8_to_b64 = (str: string): string => {
    try {
        const encoder = new TextEncoder();
        const uint8array = encoder.encode(str);
        return btoa(uint8ArrayToBinaryString(uint8array));
    } catch (e) {
        console.error("Error in utf8_to_b64:", e);
        return "";
    }
};


const dataUrlToBlob = (dataUrl: string): Blob | null => {
    try {
        const [header, base64] = dataUrl.split(',');
        if (!header || !base64) return null;
        const mime = header.match(/:(.*?);/)?.[1];
        if (!mime) return null;
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new Blob([bytes], { type: mime });
    } catch (error) {
        console.error("Failed to convert data URL to Blob", error);
        return null;
    }
};


type Stage = 'IDLE' | 'RESEARCH' | 'PLANNING';
type ActiveView = 'DASHBOARD' | 'RESEARCH' | 'WORK' | 'TEAM';
type Theme = 'light' | 'dark' | 'rockstar';
type PausedEditorSession = { asset: AttachedFile; messages: ChatMessage[] };

// Helper function to find multiple file assets by their IDs in a nested structure
const findAssetsByIds = (assets: Asset[], ids: string[]): AttachedFile[] => {
    let foundFiles: AttachedFile[] = [];
    const targetIds = new Set(ids);

    const traverse = (currentAssets: Asset[]) => {
        if (foundFiles.length === ids.length) return; // Optimization

        for (const asset of currentAssets) {
            if (targetIds.has(asset.id)) {
                if (asset.type === 'file') {
                    foundFiles.push(asset as AttachedFile);
                }
            }
            if (asset.type === 'folder') {
                traverse(asset.children);
            }
        }
    };

    traverse(assets);
    return foundFiles;
};

// Storage policy: keep content for small text-like files; strip for large/binary to avoid quota
const isTextLikeFile = (file: AttachedFile): boolean => {
    const name = file.name.toLowerCase();
    const mime = (file.mimeType || '').toLowerCase();
    return (
        mime.startsWith('text/') ||
        ['application/json','application/xml','application/sql','application/x-markdown','text/markdown','text/csv'].includes(mime) ||
        name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.csv') || name.endsWith('.json')
    );
};

const stripContentFromAssets = (assets: Asset[], sizeLimitBytes: number = 200_000): Asset[] => {
    return assets.map(asset => {
        if (asset.type === 'folder') {
            return { ...asset, children: stripContentFromAssets(asset.children, sizeLimitBytes) };
        }
        const file = asset as AttachedFile;
        if (isTextLikeFile(file) && typeof file.size === 'number' && file.size <= sizeLimitBytes && file.content) {
            // Keep inline content for small text-like files
            return file;
        }
        const { content, ...restOfAsset } = file;
        return restOfAsset as Asset;
    });
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('DASHBOARD');

  // Research State
  const [topic, setTopic] = useState<string>('');
  const [mode, setMode] = useState<ResearchMode>(ResearchMode.Explore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MarketAnalysisResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>('IDLE');
  const [researchContextProject, setResearchContextProject] = useState<CompanyCardData | null>(null);
  
  // Work State
  const [companyCards, setCompanyCards] = useState<CompanyCardData[]>([]);
  const [archivedCards, setArchivedCards] = useState<CompanyCardData[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CompanyCardData | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedAssetInProject, setSelectedAssetInProject] = useState<Asset | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers); // Mock users for collaboration
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ stage: string; files: string[] } | null>(null);
  const [chatContext, setChatContext] = useState<string>('DASHBOARD');
  const [pendingClarification, setPendingClarification] = useState<{ message: string, attachedFileIds: string[] } | null>(null);
  const [splitViewAsset, setSplitViewAsset] = useState<AttachedFile | null>(null);
  const [pendingPatches, setPendingPatches] = useState<PatchFileOperation | null>(null);
  const [pausedEditorSession, setPausedEditorSession] = useState<PausedEditorSession | null>(null);
  const [isDocumentSaved, setIsDocumentSaved] = useState<boolean>(true);
  
  // Google Drive State
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(null);
  
  // UI State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
      const storedTheme = localStorage.getItem('nexxtTheme');
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'rockstar') {
          return storedTheme;
      }
      return 'dark';
  });
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(true);

   useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'rockstar');
    root.classList.add(theme);
    localStorage.setItem('nexxtTheme', theme);

    // If no theme was stored, default to light for the initial class
    if (!localStorage.getItem('nexxtTheme')) {
        root.classList.add('light');
    }
  }, [theme]);


  const selectedCompany = companyCards.find(c => c.id === selectedCompanyId) || null;
  const isProjectViewActive = !!selectedCompanyId;

  // Initialize Google API Client
   useEffect(() => {
        googleDriveService.initClient((user) => {
            setGoogleUser(user);
        });
    }, []);

    const updateAndStore = (key: string, data: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter(data);
        let storableData = data;
        // Strip content from assets if present
        if (key.includes('Cards') && Array.isArray(data)) {
            storableData = data.map(card => ({
                ...card,
                assets: card.assets ? stripContentFromAssets(card.assets) : [],
            }));
        }
        
        try {
            localStorage.setItem(key, JSON.stringify(storableData));
        } catch (e) {
            console.error(`Failed to save to localStorage with key ${key}`, e);
            setError("Could not save project changes. The browser's storage limit may be exceeded.");
        }
    };

    const updateCompanyCards = (newCards: CompanyCardData[]) => updateAndStore('nexxtepAiCompanyCards', newCards, setCompanyCards);
    const updateArchivedCards = (newCards: CompanyCardData[]) => updateAndStore('nexxtepAiArchivedCards', newCards, setArchivedCards);
    const updateTeamMembers = (newMembers: TeamMember[]) => updateAndStore('nexxtAiTeamMembers', newMembers, setTeamMembers);


  useEffect(() => {
    // Load research history
    try {
      const storedHistory = localStorage.getItem('nexxtepAiHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('nexxtepAiHistory');
    }
    
    // Load Team Members
     try {
        const storedTeam = localStorage.getItem('nexxtAiTeamMembers');
        if (storedTeam) {
            setTeamMembers(JSON.parse(storedTeam));
        }
    } catch (e) {
        console.error("Failed to parse team members from localStorage", e);
        localStorage.removeItem('nexxtAiTeamMembers');
    }

    const loadCards = (key: string, setter: React.Dispatch<React.SetStateAction<CompanyCardData[]>>) => {
        try {
            const stored = localStorage.getItem(key);
            let parsed = stored ? JSON.parse(stored) : [];
            // Remove deprecated demo template (EcoCycle) if present
            parsed = Array.isArray(parsed) ? parsed.filter((p: CompanyCardData) => p.id !== 'demo-project-ecocycle') : [];
            
            if (!stored || parsed.length === 0) {
                 // If storage is empty, initialize with all demo projects
                console.log("Initializing with demo projects (filtered).");
                const initial = demoProjects.filter(p => p.id !== 'demo-project-ecocycle');
                updateAndStore(key, initial, setter);
            } else {
                // If storage has data, check if the "nexxt" project is missing and add it
                const nexxtProjectExists = parsed.some((p: CompanyCardData) => p.id === 'demo-project-nexxt');
                if (!nexxtProjectExists) {
                    const nexxtProject = demoProjects.find(p => p.id === 'demo-project-nexxt');
                    if (nexxtProject) {
                         console.log("Adding missing 'nexxt' demo project.");
                        parsed.push(nexxtProject);
                    }
                }
                // Ensure deprecated template is not present after augmentation
                setter(parsed.filter((p: CompanyCardData) => p.id !== 'demo-project-ecocycle'));
            }
            
        } catch (e) {
            console.error(`Failed to parse from localStorage with key ${key}`, e);
            localStorage.removeItem(key);
            // Fallback to demo projects on error
            const initial = demoProjects.filter(p => p.id !== 'demo-project-ecocycle');
            updateAndStore(key, initial, setter);
        }
    };
    
    loadCards('nexxtepAiCompanyCards', setCompanyCards);
    
    // Load archived cards separately
     try {
        const storedArchived = localStorage.getItem('nexxtepAiArchivedCards');
        if (storedArchived) {
            setArchivedCards(JSON.parse(storedArchived));
        }
    } catch (e) {
        console.error("Failed to parse archived cards from localStorage", e);
        localStorage.removeItem('nexxtepAiArchivedCards');
    }


  }, []);

  const updateHistory = (newHistory: MarketAnalysisResult[]) => {
    setHistory(newHistory);
    localStorage.setItem('nexxtepAiHistory', JSON.stringify(newHistory));
  };
  
    const handleSaveCard = (cardData: CompanyCardData | Omit<CompanyCardData, 'id'>) => {
        if ('id' in cardData) {
            // Update existing card
            const updatedCards = companyCards.map(c => c.id === cardData.id ? cardData : c);
            updateCompanyCards(updatedCards);
        } else {
            // Create new card
            const newCard: CompanyCardData = { ...cardData, id: `proj-${Date.now()}-${Math.random().toString(36).slice(2)}`, members: [users[0]] }; // Add current user as member
            updateCompanyCards([newCard, ...companyCards]);
        }
        setIsProjectModalOpen(false);
        setEditingCard(null);
    };
    
    const handleOpenEditModal = (card: CompanyCardData) => {
        setEditingCard(card);
        setIsProjectModalOpen(true);
    };

    const handleArchiveCard = (cardId: string) => {
        const cardToArchive = companyCards.find(c => c.id === cardId);
        if (cardToArchive) {
            updateCompanyCards(companyCards.filter(c => c.id !== cardId));
            updateArchivedCards([cardToArchive, ...archivedCards]);
        }
    };
    
    const handleUnarchiveCard = (cardId: string) => {
        const cardToRestore = archivedCards.find(c => c.id === cardId);
        if (cardToRestore) {
            updateArchivedCards(archivedCards.filter(c => c.id !== cardId));
            updateCompanyCards([cardToRestore, ...companyCards]);
        }
    };

    const handleDeletePermanently = (cardId: string) => {
        if (window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) {
            updateArchivedCards(archivedCards.filter(c => c.id !== cardId));
        }
    };
    
    const handleClearArchive = () => {
         if (window.confirm("Are you sure you want to permanently delete all items in the archive? This action cannot be undone.")) {
            updateArchivedCards([]);
        }
    };
  
  const handleUpdateCompany = (updatedCompany: CompanyCardData) => {
    const newCards = companyCards.map(c => c.id === updatedCompany.id ? updatedCompany : c);
    updateCompanyCards(newCards);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    const newMembers = teamMembers.map(m => m.id === updatedMember.id ? updatedMember : m);
    updateTeamMembers(newMembers);
  };

  const performResearch = useCallback(async (searchTopic: string, searchMode: ResearchMode, projectContext: CompanyCardData | null = null) => {
    if (!googleUser) { alert('Войдите через Google, чтобы использовать ресерч.'); setIsLandingPageVisible(false); return; }
    if (!searchTopic.trim()) {
      setError('Please enter a topic to research.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage(searchMode === ResearchMode.Analyze ? 'Conducting Market Analysis...' : 'Exploring Business Ideas...');
    setError(null);
    setMarketAnalysis(null);
    setBusinessPlan(null);
    setChatMessages([]);
    setIsChatPanelVisible(false);
    setSplitViewAsset(null);
    setPausedEditorSession(null);

    try {
      const analysis = await fetchMarketAnalysis(searchTopic, searchMode, projectContext);
      const newResult = { ...analysis, topic: searchTopic, mode: searchMode, id: Date.now().toString() };
      setMarketAnalysis(newResult);
      setStage('RESEARCH');
      
      // Update the "last summarized" date on the project if it exists
      if (projectContext) {
        const updatedCards = companyCards.map(c => 
            c.id === projectContext.id 
                ? { ...c, lastSummarized: new Date().toISOString() } 
                : c
        );
        updateCompanyCards(updatedCards);
        // Also update the context project in state to reflect the new date immediately
        setResearchContextProject(prev => prev ? {...prev, lastSummarized: new Date().toISOString()} : null);
      }

      if (searchMode === ResearchMode.Analyze) {
          updateHistory([newResult, ...history.filter(h => h.topic !== searchTopic || h.mode !== searchMode)].slice(0, 20));
      }

    } catch (err) {
      setMarketAnalysis(null);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      setStage('IDLE');
    } finally {
      setIsLoading(false);
    }
  }, [history, companyCards]);
  
  const handleGeneratePlan = useCallback(async (idea: string) => {
    if (!googleUser) { alert('Войдите через Google, чтобы продолжить.'); setIsLandingPageVisible(false); return; }
    if (!marketAnalysis) return;
    
    setIsLoading(true);
    setLoadingMessage('Developing Business Plan...');
    setError(null);
    setBusinessPlan(null);
    setIsChatPanelVisible(false);
    setSplitViewAsset(null);
    setPausedEditorSession(null);

    try {
        const fullMarketContext = `
            Market Overview: ${marketAnalysis.marketOverview}
            Key Trends: ${marketAnalysis.keyTrends}
            Target Audience: ${marketAnalysis.targetAudience}
            SWOT Analysis: ${marketAnalysis.swotAnalysis}
        `;
        const plan = await fetchBusinessPlan(fullMarketContext, idea);
        setBusinessPlan(plan);
        setStage('PLANNING');
    } catch (err) {
         setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the business plan.');
    } finally {
        setIsLoading(false);
    }

  }, [marketAnalysis]);

    const handleCreateProjectFromPlan = (plan: BusinessPlan, analysis: MarketAnalysisResult) => {
        const contentToEncode =
            `# Business Plan for ${analysis.topic}\n\n` +
            `## Mission Statement\n${plan.missionStatement}\n\n` +
            `## Value Proposition\n${plan.valueProposition}\n\n` +
            `## Marketing Strategy\n${plan.marketingStrategy}\n\n` +
            `## KPIs\n${plan.kpis}\n\n` +
            `## 90-Day Action Plan\n${plan.actionPlan}`;
        
        const encodedContent = utf8_to_b64(contentToEncode);
        const newId = `proj-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const newProject: CompanyCardData = {
            id: newId,
            title: analysis.topic,
            description: analysis.executiveSummary,
            category: 'Startup',
            assets: [
                {
                    id: `doc-${newId}`,
                    type: 'file',
                    name: 'Business Plan.txt',
                    mimeType: 'text/plain',
                    size: new Blob([contentToEncode]).size,
                    content: `data:text/plain;base64,${encodedContent}`,
                },
            ],
            members: [users[0]], // Add current user to new project
        };

        const newCards = [newProject, ...companyCards];
        updateCompanyCards(newCards);
        setActiveView('WORK');
        setSelectedCompanyId(newProject.id);
        setResearchContextProject(null);
    };

    const handleStartContextualResearch = (card: CompanyCardData) => {
        setActiveView('RESEARCH');
        setResearchContextProject(card);
        setTopic(card.title); // Pre-fill search bar
        setMode(ResearchMode.Analyze);
        // Reset research state for a new search
        setMarketAnalysis(null);
        setBusinessPlan(null);
        setChatMessages([]);
        setIsChatPanelVisible(false);
        setSplitViewAsset(null);
        setPausedEditorSession(null);
        setError(null);
        setStage('IDLE');
    };
    
    const handlePerformContextualResearch = (analysisType: string) => {
        if (!researchContextProject) return;

        let query = '';
        const baseContext = `project titled "${researchContextProject.title}" with the description: "${researchContextProject.description}"`;

        if (analysisType === 'deep-dive') {
            query = `Perform a deep-dive SWOT analysis and evaluate the viability of the target audience for the ${baseContext}`;
        } else if (analysisType === 'competitors') {
            query = `Find and analyze key competitors for the ${baseContext}`;
        } else { // trends
            query = `Evaluate how the ${baseContext} aligns with current and future market trends.`;
        }

        performResearch(query, ResearchMode.Analyze, researchContextProject);
    };

    const handleClearResearchContext = () => {
        setResearchContextProject(null);
        setTopic('');
    };


  const handleSearch = () => {
    if (!googleUser) { alert('Войдите через Google, чтобы использовать ресерч.'); return; }
    performResearch(topic, mode, researchContextProject);
  };
  
    const getCurrentChatContext = useCallback(() => {
        if (activeView === 'RESEARCH') {
             return researchContextProject ? `CONTEXT_RESEARCH_${researchContextProject.id}` : 'RESEARCH';
        }
        if (activeView === 'WORK') {
            return selectedCompany ? `PROJECT_${selectedCompany.id}` : 'WORK_OVERVIEW';
        }
         if (activeView === 'TEAM') {
            return 'TEAM';
        }
        return 'DASHBOARD';
    }, [activeView, selectedCompany, researchContextProject]);

  const handleSendChatMessage = async (
      message: string, 
      attachedFileIds: string[] = [],
      options: { isContinuation?: boolean; contextOverride?: any, fileContentOverride?: string } = {}
  ) => {
      if (!googleUser) { alert('Войдите через Google, чтобы использовать чат.'); return; }
      if (!message.trim() && attachedFileIds.length === 0) return;
      
      let focusedFiles: AttachedFile[] = [];
      const currentProject = companyCards.find(c => c.id === selectedCompanyId) || null;
      
      const inOngoingSplitView = !!splitViewAsset;
      let isInitiatingSplitView = false;
      let initiatingFile: AttachedFile | null = null;
      
      // ARCHITECTURAL FIX: Detect if we are initiating a split view session
      if (!inOngoingSplitView && attachedFileIds.length === 1 && currentProject) {
        const file = findAssetsByIds(currentProject.assets, attachedFileIds)[0];
        if (file) {
            isInitiatingSplitView = true;
            initiatingFile = file;
            setSplitViewAsset(file);
            setIsChatPanelVisible(false);
            setPausedEditorSession(null);
        }
      }

      // Only show the main chat panel if we are NOT starting a split view and NOT already in one.
      if (!isInitiatingSplitView && !inOngoingSplitView) {
        setIsChatPanelVisible(true);
      }
      
      if (currentProject && attachedFileIds.length > 0) {
        focusedFiles = findAssetsByIds(currentProject.assets, attachedFileIds);
      }

      const findPathById = (assets: Asset[], id: string, prefix: string = ''): string | null => {
        for (const a of assets) {
          const currentPath = prefix ? `${prefix}/${a.name}` : a.name;
          if (a.id === id) return currentPath;
          if (a.type === 'folder') {
            const child = findPathById(a.children, id, currentPath);
            if (child) return child;
          }
        }
        return null;
      };

      const messagesToAdd: ChatMessage[] = [];
      
      if (!options.isContinuation) {
          const newUserMessage: ChatMessage = { 
            role: 'user', 
            content: { text: message,
              ...(focusedFiles.length > 0 && { 
                attachments: focusedFiles.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType }))
              })
            } 
          };
          messagesToAdd.push(newUserMessage);
      }
      
      const newContextKey = options.contextOverride ? 'OVERRIDDEN' : getCurrentChatContext();
      if (!options.isContinuation && chatMessages.length > 0 && newContextKey !== chatContext) {
          let systemText = 'Switched context';
          if (activeView === 'RESEARCH' && !researchContextProject) systemText = 'Continuing in Research';
          else if (activeView === 'WORK' && !selectedCompany) systemText = 'Continuing in Workspace';
          else if (activeView === 'TEAM') systemText = 'Continuing in Team Planner';
          else if (selectedCompany) systemText = `Continuing in project: ${selectedCompany.title}`;
          else if (researchContextProject) systemText = `Continuing research for project: ${researchContextProject.title}`;
          
          messagesToAdd.push({ role: 'system', content: { text: systemText } });
      }
      setChatContext(newContextKey);

      const currentChatHistory = [...chatMessages, ...messagesToAdd];
      setChatMessages(currentChatHistory);
      setIsChatLoading(true);
      setPendingClarification(null);

      const feedbackFiles = focusedFiles.map(f => f.name);
      setAiFeedback({ stage: 'Preparing files...', files: feedbackFiles });

      // Единая централизованная подготовка файла: ленивая дозагрузка из Drive и извлечение текста
      const { extractTextForAttachedFile } = await import('./utils/extractText');
      const MAX_TEXT = 40000;
      const filesForContext = await Promise.all(
        focusedFiles.map(async (orig) => {
          let file = orig;
          if ((!file.content || !file.content.includes(',')) && file.source?.provider === 'gdrive' && file.source.fileId) {
            try {
              const dl = await googleDriveService.downloadFile(file.source.fileId);
              file = { ...file, content: dl.content, mimeType: dl.mimeType, size: dl.size };
            } catch (e) { console.error('Failed to lazy download from Drive', e); }
          }
          try {
            const text = await extractTextForAttachedFile(file);
            const clipped = text.length > MAX_TEXT ? (text.slice(0, MAX_TEXT) + `\n\n...[TRUNCATED ${text.length - MAX_TEXT} CHARS]...`) : text;
            if (clipped) {
              return { ...file, content: `data:text/plain;base64,${utf8_to_b64(clipped)}`, mimeType: 'text/plain' };
            }
          } catch (e) { console.error('Failed to extract text centrally', e); }
          return file;
        })
      );

      const thinkingStage = filesForContext.length > 0
          ? `Analyzing ${filesForContext.length} file(s)...`
          : 'Thinking...';
      setAiFeedback({ stage: thinkingStage, files: feedbackFiles });

      try {
          let context: any;
          if (options.contextOverride) {
              context = options.contextOverride;
          } else if (activeView === 'RESEARCH') {
             // Research view context: pass the current report (and plan if available)
             if (stage === 'RESEARCH' && marketAnalysis) {
                 // Provide the market analysis report directly so the AI can reference it
                 context = { ...marketAnalysis } as any;
             } else if (stage === 'PLANNING' && businessPlan && marketAnalysis) {
                 // Provide both the report and resulting plan
                 context = { ...marketAnalysis, businessPlan } as any;
             } else if (researchContextProject) {
                 // Fallback to contextual research marker (no report yet)
                 context = { view: 'CONTEXT_RESEARCH', project: researchContextProject } as any;
             } else {
                 context = { view: 'RESEARCH' } as any;
             }
          } else if (activeView === 'WORK') {
                if (currentProject) {
                    const projectForContext = { ...currentProject, assets: stripContentFromAssets(currentProject.assets) };
                    const projectContext: any = { view: 'PROJECT', project: projectForContext };
                    
                    // ARCHITECTURAL FIX: Correctly set context for split view sessions
                    const inSplitView = !!splitViewAsset || isInitiatingSplitView;
                    projectContext.isSplitView = inSplitView;

                    if (inSplitView) {
                        const fileForContext = isInitiatingSplitView ? initiatingFile : splitViewAsset;
                        if (fileForContext) {
                            const filePath = findPathById(projectForContext.assets as Asset[], fileForContext.id) || fileForContext.name;
                            projectContext.focusedFiles = [{ ...fileForContext, content: options.fileContentOverride || fileForContext.content, path: filePath } as any];
                            projectContext.focusedFilePath = filePath;
                        }
                    } else if (filesForContext.length > 0) {
                        projectContext.focusedFiles = filesForContext;
                    }
                    context = projectContext;
                } else {
                     const cardsForContext = companyCards.map(card => ({...card, assets: stripContentFromAssets(card.assets) }));
                    context = { view: 'WORK', companyCards: cardsForContext };
                }
          } else if (activeView === 'TEAM') {
                // ... team context logic
          }
          
          if (!context) context = { view: 'IDLE' };
          
          const contextString = JSON.stringify(context);

          const response = await fetchFollowUp(message, contextString, currentChatHistory);
          const finalChatMessages = [...currentChatHistory];
          
          const modelMessage: ChatMessage = { 
            role: 'model', 
            content: { 
                text: response.text, 
                cards: response.cards,
                executedOperations: response.fileOperations,
                projectClarification: response.projectClarification,
                teamMemberSuggestions: response.teamMemberSuggestions,
            }
          };

          if (response.projectClarification && response.projectClarification.length > 0) {
              setPendingClarification({ message, attachedFileIds });
          }

          if (response.text.trim() || modelMessage.content.executedOperations || modelMessage.content.projectClarification || modelMessage.content.teamMemberSuggestions) {
              finalChatMessages.push(modelMessage);
          }

          if (response.teamMemberSuggestions) {
            const newMembers: TeamMember[] = response.teamMemberSuggestions.map(suggestion => ({
                ...suggestion,
                id: `team-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                assignedProjectIds: [],
                status: 'OPEN',
            }));
            updateTeamMembers([...teamMembers, ...newMembers]);
          }
          
          if (response.fileOperations && response.fileOperations.length > 0 && currentProject) {
                // Helper to apply goal/task operations to a project object
                const applyGoalTaskOperations = (project: typeof currentProject, ops: FileOperation[]) => {
                    if (!project) return project;
                    const updated = { ...project };
                    if (!updated.goals) updated.goals = [];

                    const ensureGoal = (title: string, description = '') => {
                        let goal = updated.goals!.find(g => g.title === title);
                        if (!goal) {
                            goal = { id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`, title, description, tasks: [] };
                            updated.goals!.push(goal);
                        }
                        return goal;
                    };

                    ops.forEach((op) => {
                        switch (op.operation) {
                            case 'CREATE_GOAL': {
                                ensureGoal(op.title, op.description || '');
                                break;
                            }
                            case 'CREATE_TASK': {
                                const goal = ensureGoal(op.goalTitle);
                                // Avoid duplicate by title within the goal
                                if (goal.tasks.some(t => t.title === op.title)) break;
                                const newTask: Task = {
                                    id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                                    title: op.title,
                                    description: op.description || '',
                                    status: 'To Do',
                                    priority: op.priority || 'Medium',
                                    subtasks: [],
                                    attachments: [],
                                };
                                goal.tasks.push(newTask);
                                break;
                            }
                            case 'EDIT_TASK': {
                                const goal = updated.goals!.find(g => g.title === op.goalTitle);
                                const task = goal?.tasks.find(t => t.title === op.taskTitle);
                                if (task) {
                                    if (op.newTitle) task.title = op.newTitle;
                                    if (op.newDescription !== undefined) task.description = op.newDescription;
                                    if (op.newPriority) task.priority = op.newPriority;
                                    if (op.newDueDate !== undefined) task.dueDate = op.newDueDate;
                                }
                                break;
                            }
                            case 'ADD_SUBTASK': {
                                const goal = updated.goals!.find(g => g.title === op.goalTitle);
                                const task = goal?.tasks.find(t => t.title === op.taskTitle);
                                if (task) {
                                    task.subtasks.push({ id: `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`, text: op.subtaskText, completed: false });
                                }
                                break;
                            }
                            case 'SET_TASK_STATUS': {
                                const goal = updated.goals!.find(g => g.title === op.goalTitle);
                                const task = goal?.tasks.find(t => t.title === op.taskTitle);
                                if (task) {
                                    task.status = op.newStatus;
                                }
                                break;
                            }
                        }
                    });

                    return updated;
                };

                if (splitViewAsset || isInitiatingSplitView) {
                    // Apply live patch to SplitView and still handle goal/task ops immediately
                    const patchOp = response.fileOperations.find(op => op.operation === 'PATCH_FILE') as PatchFileOperation;
                    if (patchOp) {
                        setPendingPatches(patchOp);
                    }
                    const nonPatchOps = response.fileOperations.filter(op => op.operation !== 'PATCH_FILE');
                    if (nonPatchOps.length > 0) {
                        // First apply file system operations to assets, then goal/task ops
                        let updatedProjectData = { ...currentProject };
                        const assetManager = new AssetManager(updatedProjectData.assets);
                        const { updatedAssets } = assetManager.execute(nonPatchOps);
                        updatedProjectData.assets = updatedAssets;
                        updatedProjectData = applyGoalTaskOperations(updatedProjectData, nonPatchOps);
                        handleUpdateCompany(updatedProjectData);
                    }
                } else {
                    let updatedProjectData = { ...currentProject };
                    let touchedAsset: Asset | null = null;
                    const assetManager = new AssetManager(updatedProjectData.assets);
                    const { updatedAssets, lastTouchedAsset } = assetManager.execute(response.fileOperations);
                    updatedProjectData.assets = updatedAssets;
                    touchedAsset = lastTouchedAsset;

                    // Apply goal/task operations
                    const goalTaskOps = response.fileOperations.filter(op => op.operation === 'CREATE_GOAL' || op.operation === 'CREATE_TASK' || op.operation === 'EDIT_TASK' || op.operation === 'ADD_SUBTASK' || op.operation === 'SET_TASK_STATUS');
                    if (goalTaskOps.length > 0) {
                        updatedProjectData = applyGoalTaskOperations(updatedProjectData, goalTaskOps);
                    }

                    handleUpdateCompany(updatedProjectData);
                    if (touchedAsset) {
                        setSelectedAssetInProject(touchedAsset);
                        setHighlightedAssetId(touchedAsset.id);
                    }
                }
          }
          setChatMessages(finalChatMessages);
      } catch (err) {
          const errorMessage: ChatMessage = { role: 'model', content: { text: "Sorry, I couldn't process that. Please try again." } };
          setChatMessages([...currentChatHistory, errorMessage]);
      } finally {
          setIsChatLoading(false);
          setAiFeedback(null);
      }
  };
  
    const handleSaveFileFromSplitView = (fileOperations: FileOperation[]) => {
        if (!selectedCompany) return;
        
        const assetManager = new AssetManager(selectedCompany.assets);
        const { updatedAssets, lastTouchedAsset } = assetManager.execute(fileOperations);
        
        const updatedProject = { ...selectedCompany, assets: updatedAssets };
        handleUpdateCompany(updatedProject);

        // Update the splitViewAsset with the saved changes to avoid "unsaved changes" warning
        if (lastTouchedAsset && splitViewAsset) {
            const updatedSplitViewAsset = { ...splitViewAsset, ...lastTouchedAsset };
            setSplitViewAsset(updatedSplitViewAsset);
        }

        if (lastTouchedAsset) {
            setSelectedAssetInProject(lastTouchedAsset);
            setHighlightedAssetId(lastTouchedAsset.id);
        }
    };

    const handlePauseEditorSession = (asset: AttachedFile, messages: ChatMessage[]) => {
        if (!selectedCompanyId) return; // Safety check
        
        setPausedEditorSession({ 
            asset, 
            messages, 
            projectId: selectedCompanyId 
        });
        setSplitViewAsset(null);
        setChatMessages(messages); // Keep chat history visible
        setIsDocumentSaved(false); // Mark as unsaved when pausing session
    };

    const handleResumeEditorSession = () => {
        if (pausedEditorSession) {
            setSplitViewAsset(pausedEditorSession.asset);
            setChatMessages(pausedEditorSession.messages);
            // Don't clear pausedEditorSession here - we need it to know which project to save to
            setIsDocumentSaved(false); // Reset to unsaved when resuming
        }
    };

    const handleDocumentSaved = () => {
        setIsDocumentSaved(true);
        setPausedEditorSession(null); // Clear paused session when document is saved
    };

    const handleSaveFromPausedSession = (fileOperations: FileOperation[]) => {
        if (!pausedEditorSession) return;
        
        // Find the correct project for this paused session
        const correctProject = companyCards.find(c => c.id === pausedEditorSession.projectId);
        if (!correctProject) return;
        
        const assetManager = new AssetManager(correctProject.assets);
        const { updatedAssets, lastTouchedAsset } = assetManager.execute(fileOperations);
        
        const updatedProject = { ...correctProject, assets: updatedAssets };
        handleUpdateCompany(updatedProject);

        if (lastTouchedAsset) {
            setSelectedAssetInProject(lastTouchedAsset);
            setHighlightedAssetId(lastTouchedAsset.id);
        }
        
        // Mark as saved and clear paused session
        setIsDocumentSaved(true);
        setPausedEditorSession(null);
    };

    const handleMarkAsUnsaved = () => {
        setIsDocumentSaved(false);
    };



  const handleSelectProjectFromChat = (projectId: string) => {
    if (!pendingClarification) return;
    const project = companyCards.find(c => c.id === projectId);
    if (!project) return;
    setActiveView('WORK');
    setSelectedCompanyId(projectId);
    const systemMessage: ChatMessage = { role: 'system', content: { text: `Switched to project: ${project.title}. Running last command...` } };
    setChatMessages(prev => [...prev.filter(m => !m.content.projectClarification), systemMessage]);
    const { message, attachedFileIds } = pendingClarification;
    const projectContextOverride = { view: 'PROJECT', project };
    handleSendChatMessage(message, attachedFileIds, { isContinuation: true, contextOverride: projectContextOverride });
    setPendingClarification(null);
  };
  
  const handleSelectExploredIdea = (idea: string) => {
    setTopic(idea);
    setMode(ResearchMode.Analyze);
  };
  
  // ... Google Drive Handlers remain the same ...
  const handleSaveAnalysisToDrive = async () => { /* ... */ };
  const handleSavePlanToDrive = async () => { /* ... */ };
  const handleSaveProjectToDrive = async (project: CompanyCardData) => { /* ... */ };
  
  const renderWorkView = () => {
    if (selectedCompany) {
      return (
        <ProjectView
          key={selectedCompany.id}
          project={selectedCompany}
          users={users}
          onUpdateProject={handleUpdateCompany}
          onBack={() => setSelectedCompanyId(null)}
          onSaveToDrive={handleSaveProjectToDrive}
          isGoogleSignedIn={!!googleUser}
          initialSelectedAsset={selectedAssetInProject}
          highlightedAssetId={highlightedAssetId}
          onHighlightConsumed={() => setHighlightedAssetId(null)}
        />
      );
    }
    return (
      <WorkView
        cards={companyCards}
        archivedCount={archivedCards.length}
        users={users}
        onShowAddCardModal={() => { setEditingCard(null); setIsProjectModalOpen(true); }}
        onSelectCard={setSelectedCompanyId}
        onResearchFromProject={handleStartContextualResearch}
        onEditCard={handleOpenEditModal}
        onArchiveCard={handleArchiveCard}
        onShowArchiveModal={() => setIsArchiveModalOpen(true)}
      />
    );
  };

  const renderResearchView = () => (
    <>
        <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            {stage === 'IDLE' && !isLoading && !marketAnalysis && (
                researchContextProject ? (
                    <ContextualResearchView 
                        project={researchContextProject}
                        onPerformResearch={handlePerformContextualResearch}
                        onClearContext={handleClearResearchContext}
                    />
                ) : <WelcomeScreen />
            )}
            {stage === 'RESEARCH' && marketAnalysis && (
                <MarketAnalysisDisplay
                    result={marketAnalysis}
                    onSelectBusinessIdea={handleGeneratePlan}
                    onSelectExploredIdea={handleSelectExploredIdea}
                    onNewResearch={() => setStage('IDLE')}
                    onSaveToDrive={() => {}}
                    isGoogleSignedIn={!!googleUser}
                    theme={theme}
                />
            )}
            {stage === 'PLANNING' && businessPlan && marketAnalysis && (
                <BusinessPlanDisplay
                    plan={businessPlan}
                    onBack={() => setStage('RESEARCH')}
                    onCreateProject={() => handleCreateProjectFromPlan(businessPlan, marketAnalysis)}
                    onSaveToDrive={() => {}}
                    isGoogleSignedIn={!!googleUser}
                />
            )}
        </div>
    </>
  );

  return (
    <>
        {isLandingPageVisible && <LandingPage onEnterApp={() => setIsLandingPageVisible(false)} onStartResearch={(topic, mode) => { if (!googleUser) { setIsLandingPageVisible(false); return; } setTopic(topic); setMode(mode); performResearch(topic, mode); setIsLandingPageVisible(false); setActiveView('RESEARCH'); }} />}

        <div className={`flex flex-col h-screen font-sans antialiased overflow-hidden transition-opacity duration-500 ${isLandingPageVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Header
                activeView={activeView}
                setActiveView={(view) => {
                    setActiveView(view);
                    setSelectedCompanyId(null);
                }}
                googleUser={googleUser}
                onGoogleSignIn={() => googleDriveService.signIn()}
                onGoogleSignOut={() => googleDriveService.signOut()}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogoClick={() => setIsLandingPageVisible(true)}
            />

            <main className="flex-grow pt-16 flex flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950 rockstar:bg-black relative pb-48">
                 <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col">
                    {activeView === 'DASHBOARD' && <DashboardView cards={companyCards} users={users} onSelectCard={(id) => { setActiveView('WORK'); setSelectedCompanyId(id); }} onShowAddCardModal={() => { setEditingCard(null); setIsProjectModalOpen(true); }} onStartResearch={() => setActiveView('RESEARCH')} />}
                    {activeView === 'RESEARCH' && renderResearchView()}
                    {activeView === 'WORK' && renderWorkView()}
                    {activeView === 'TEAM' && <TeamView teamMembers={teamMembers} projects={companyCards} users={users} onUpdateTeamMember={handleUpdateTeamMember} />}
                </div>
            </main>
            
            {isLoading && <Loader message={loadingMessage} />}
            <HistoryPanel history={history} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onSelect={(result) => { setMarketAnalysis(result); setTopic(result.topic); setMode(result.mode); setStage('RESEARCH'); setIsHistoryOpen(false); }} onClear={() => updateHistory([])} currentResultId={marketAnalysis?.id} />
            {isChatPanelVisible && <ChatPanel messages={chatMessages} isLoading={isChatLoading} onClose={() => setIsChatPanelVisible(false)} onSelectProject={handleSelectProjectFromChat} onSendMessage={handleSendChatMessage} aiFeedback={aiFeedback} />}
            {splitViewAsset && <SplitView 
                asset={splitViewAsset} 
                messages={chatMessages} 
                isLoading={isChatLoading} 
                onPauseSession={handlePauseEditorSession} 
                onSendMessage={handleSendChatMessage} 
                onSaveFile={pausedEditorSession ? handleSaveFromPausedSession : handleSaveFileFromSplitView} 
                pendingPatches={pendingPatches} 
                onPatchesConsumed={() => setPendingPatches(null)} 
                onClearPausedSession={handleDocumentSaved} 
                onMarkAsUnsaved={handleMarkAsUnsaved}
                isPausedSession={!!pausedEditorSession}
                onCloseSplitView={() => setSplitViewAsset(null)}
            />}
            {isProjectModalOpen && <ProjectModal onClose={() => { setIsProjectModalOpen(false); setEditingCard(null); }} onSave={handleSaveCard} initialData={editingCard} />}
            {isArchiveModalOpen && <TrashModal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} cards={archivedCards} onRestore={handleUnarchiveCard} onDeletePermanently={handleDeletePermanently} onEmptyTrash={handleClearArchive} />}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} currentTheme={theme} setTheme={setTheme} />}

            {pausedEditorSession && !isDocumentSaved && <ResumeEditingBanner session={pausedEditorSession} onResume={handleResumeEditorSession} />}

            <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center p-4 pointer-events-none">
                <div className="w-full max-w-4xl mx-auto pointer-events-auto relative z-20">
                    {activeView === 'RESEARCH' && stage !== 'RESEARCH' && !splitViewAsset && !isChatPanelVisible && !pausedEditorSession && (
                        <SearchBar
                            topic={topic}
                            setTopic={setTopic}
                            mode={mode}
                            setMode={setMode}
                            onSearch={handleSearch}
                            isLoading={isLoading}
                            onToggleHistory={() => setIsHistoryOpen(true)}
                            researchContextProject={researchContextProject}
                            onClearResearchContext={handleClearResearchContext}
                        />
                    )}
                    {activeView === 'RESEARCH' && stage === 'RESEARCH' && !splitViewAsset && !isChatPanelVisible && !pausedEditorSession && (
                         <>
                            {isChatLoading && aiFeedback && ( <div className="mb-2"> <AIFeedbackDisplay stage={aiFeedback.stage} files={aiFeedback.files} /> </div> )}
                            <ChatBar onSendMessage={handleSendChatMessage} isLoading={isChatLoading} onShowChat={() => setIsChatPanelVisible(true)} hasMessages={chatMessages.length > 0} />
                        </>
                    )}
                    {activeView !== 'DASHBOARD' && activeView !== 'RESEARCH' && !splitViewAsset && !isChatPanelVisible && !pausedEditorSession && (
                         <>
                            {isChatLoading && aiFeedback && ( <div className="mb-2"> <AIFeedbackDisplay stage={aiFeedback.stage} files={aiFeedback.files} /> </div> )}
                            <ChatBar onSendMessage={handleSendChatMessage} isLoading={isChatLoading} onShowChat={() => setIsChatPanelVisible(true)} hasMessages={chatMessages.length > 0} />
                        </>
                    )}
                </div>
            </div>
            {/* Global bottom gradient overlay (full-width), placed behind input panels */}
            {(((activeView === 'RESEARCH') && !splitViewAsset && !isChatPanelVisible && !pausedEditorSession) ||
              ((activeView !== 'DASHBOARD' && activeView !== 'RESEARCH') && !splitViewAsset && !isChatPanelVisible && !pausedEditorSession)) && (
                <div className="fixed bottom-0 left-0 right-0 h-44 pointer-events-none bg-gradient-to-t from-white/70 to-transparent dark:from-black/70 rockstar:from-black/80 z-10" />
            )}
        </div>
        {/* Показывать логин только после входа с лендинга */}
        {!isLandingPageVisible && !googleUser && <LoginOverlay onGoogleSignIn={() => googleDriveService.signIn()} />}
    </>
  );
};

export default App;