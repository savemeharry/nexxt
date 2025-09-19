



import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ResearchMode, MarketAnalysisResult, BusinessPlan, ChatMessage, CompanyCardData, Asset, AttachedFile, GoogleUserProfile, FileOperation, User, CreateGoalOperation, CreateTaskOperation, Goal, Task, EditTaskOperation, AddSubtaskOperation, SetTaskStatusOperation, TeamMember } from './types';
import { fetchMarketAnalysis, fetchBusinessPlan, fetchFollowUp } from './services/geminiService';
import * as googleDriveService from './services/googleDriveService';
import SearchBar from './components/SearchBar';
import Loader from './components/Loader';
import MarketAnalysisDisplay from './components/MarketAnalysisDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import HistoryPanel from './components/HistoryPanel';
import BusinessPlanDisplay from './components/BusinessPlanDisplay';
import Header from './components/Header';
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

// Helper functions for DOCX processing
declare const mammoth: any;

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

const utf8_to_b64 = (str: string): string => {
    try {
        const encoder = new TextEncoder();
        const uint8array = encoder.encode(str);
        let binaryString = '';
        for (let i = 0; i < uint8array.length; i++) {
            binaryString += String.fromCharCode(uint8array[i]);
        }
        return btoa(binaryString);
    } catch (e) {
        console.error("Error in utf8_to_b64:", e);
        return "";
    }
};


type Stage = 'IDLE' | 'RESEARCH' | 'PLANNING';
type ActiveView = 'DASHBOARD' | 'RESEARCH' | 'WORK' | 'TEAM';
type Theme = 'light' | 'dark' | 'rockstar';

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

// Helper to recursively remove 'content' from files to avoid localStorage quota issues
const stripContentFromAssets = (assets: Asset[]): Asset[] => {
    return assets.map(asset => {
        if (asset.type === 'folder') {
            return { ...asset, children: stripContentFromAssets(asset.children) };
        }
        // For files, create a new object without the content
        const { content, ...restOfAsset } = asset as AttachedFile;
        return restOfAsset as Asset; // Cast it back to Asset
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

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ stage: string; files: string[] } | null>(null);
  const [chatContext, setChatContext] = useState<string>('DASHBOARD');
  const [pendingClarification, setPendingClarification] = useState<{ message: string, attachedFileIds: string[] } | null>(null);

  
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
            
            if (!stored || parsed.length === 0) {
                 // If storage is empty, initialize with all demo projects
                console.log("Initializing with demo projects.");
                updateAndStore(key, demoProjects, setter);
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
                setter(parsed);
            }
            
        } catch (e) {
            console.error(`Failed to parse from localStorage with key ${key}`, e);
            localStorage.removeItem(key);
            // Fallback to demo projects on error
            updateAndStore(key, demoProjects, setter);
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
            const newCard: CompanyCardData = { ...cardData, id: Date.now().toString(), members: [users[0]] }; // Add current user as member
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
    if (!marketAnalysis) return;
    
    setIsLoading(true);
    setLoadingMessage('Developing Business Plan...');
    setError(null);
    setBusinessPlan(null);
    setIsChatPanelVisible(false);

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
        // Unicode-safe Base64 encoding
        const contentToEncode =
            `# Business Plan for ${analysis.topic}\n\n` +
            `## Mission Statement\n${plan.missionStatement}\n\n` +
            `## Value Proposition\n${plan.valueProposition}\n\n` +
            `## Marketing Strategy\n${plan.marketingStrategy}\n\n` +
            `## KPIs\n${plan.kpis}\n\n` +
            `## 90-Day Action Plan\n${plan.actionPlan}`;
        
        // Use `unescape` and `encodeURIComponent` for a robust, browser-compatible UTF-8 to Base64 conversion.
        const encodedContent = btoa(unescape(encodeURIComponent(contentToEncode)));

        const newProject: CompanyCardData = {
            id: Date.now().toString(),
            title: analysis.topic,
            description: analysis.executiveSummary,
            category: 'Startup',
            assets: [
                {
                    id: `doc-${Date.now()}`,
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
      options: { isContinuation?: boolean; contextOverride?: string } = {}
  ) => {
      if (!message.trim() && attachedFileIds.length === 0) return;
      
      setIsChatPanelVisible(true);
      
      let focusedFiles: AttachedFile[] = [];
      // Use the currently selected company, as it's the most reliable context
      const currentProject = companyCards.find(c => c.id === selectedCompanyId) || null;
      if (currentProject && attachedFileIds.length > 0) {
        focusedFiles = findAssetsByIds(currentProject.assets, attachedFileIds);
      }

      const messagesToAdd: ChatMessage[] = [];

      // Only add the user message if this is not a continuation of a clarification flow
      if (!options.isContinuation) {
          const newUserMessage: ChatMessage = { 
            role: 'user', 
            content: { 
              text: message,
              ...(focusedFiles.length > 0 && { 
                attachments: focusedFiles.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType }))
              })
            } 
          };
          messagesToAdd.push(newUserMessage);
      }
      
      // Handle context switching messages, but only if it's not a continuation
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
      setPendingClarification(null); // Clear any previous clarification requests

      const feedbackFiles = focusedFiles.map(f => f.name);
      setAiFeedback({ stage: 'Preparing files...', files: feedbackFiles });

      // Process files for AI context (extract text from DOCX)
        const filesForContext = await Promise.all(
            focusedFiles.map(async (file) => {
                const isDocx = file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
                if (isDocx && file.content && typeof mammoth !== 'undefined') {
                    try {
                        const blob = dataUrlToBlob(file.content);
                        if (!blob) throw new Error("Could not convert data URL to Blob.");

                        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as ArrayBuffer);
                            reader.onerror = reject;
                            reader.readAsArrayBuffer(blob);
                        });
                        
                        const { value: textContent } = await mammoth.extractRawText({ arrayBuffer });
                        
                        return { 
                            ...file, 
                            content: `data:text/plain;base64,${utf8_to_b64(textContent)}`, 
                            mimeType: 'text/plain' 
                        };
                    } catch (e) {
                        console.error("Failed to extract text from docx for AI context:", e);
                        const errorContent = 'Error: Could not read content from this DOCX file.';
                        return { 
                            ...file, 
                            content: `data:text/plain;base64,${utf8_to_b64(errorContent)}`, 
                            mimeType: 'text/plain' 
                        };
                    }
                }
                return file;
            })
        );

      const thinkingStage = filesForContext.length > 0
          ? `Analyzing ${filesForContext.length} file(s)...`
          : 'Thinking...';
      setAiFeedback({ stage: thinkingStage, files: feedbackFiles });

      try {
          let context;
          if (options.contextOverride) {
              context = options.contextOverride;
          } else if (activeView === 'RESEARCH') {
              if (researchContextProject) {
                  context = JSON.stringify({ view: 'CONTEXT_RESEARCH', project: researchContextProject });
              } else if (marketAnalysis) {
                  context = JSON.stringify(marketAnalysis);
              }
          } else if (activeView === 'WORK') {
                if (currentProject) {
                    // Create a copy of the project and strip asset content to avoid exceeding token limits.
                    // The actual content of focused files is sent separately.
                    const projectForContext = {
                        ...currentProject,
                        assets: stripContentFromAssets(currentProject.assets),
                    };
                    const projectContext: any = { view: 'PROJECT', project: projectForContext };
                    if (filesForContext.length > 0) {
                        projectContext.focusedFiles = filesForContext;
                    }
                    context = JSON.stringify(projectContext);
                } else {
                     const cardsForContext = companyCards.map(card => ({
                        ...card,
                        assets: stripContentFromAssets(card.assets),
                    }));
                    context = JSON.stringify({ view: 'WORK', companyCards: cardsForContext });
                }
          } else if (activeView === 'TEAM') {
                const projectsForContext = companyCards.map(card => ({
                    id: card.id,
                    title: card.title,
                    description: card.description,
                    category: card.category,
                }));
                context = JSON.stringify({ view: 'TEAM', projects: projectsForContext });
          }
          
          if (!context) {
               context = JSON.stringify({ view: 'IDLE' }); // Fallback
          }

          const response = await fetchFollowUp(message, context, currentChatHistory);
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
                id: `${Date.now()}-${suggestion.role.replace(/\s/g, '')}`,
                assignedProjectIds: [],
                status: 'OPEN',
            }));
            updateTeamMembers([...teamMembers, ...newMembers]);
          }
          
          if (response.fileOperations && response.fileOperations.length > 0 && currentProject) {
              let updatedProjectData = { ...currentProject };
              let touchedAsset: Asset | null = null;
      
              const fileOps = response.fileOperations.filter(op => ['CREATE_FILE', 'EDIT_FILE', 'CREATE_FOLDER', 'MOVE_ASSET', 'RENAME_ASSET'].includes(op.operation));
              const goalTaskOps = response.fileOperations.filter(op => ['CREATE_GOAL', 'CREATE_TASK', 'EDIT_TASK', 'ADD_SUBTASK', 'SET_TASK_STATUS'].includes(op.operation));
      
              if (fileOps.length > 0) {
                  const assetManager = new AssetManager(updatedProjectData.assets);
                  const { updatedAssets, lastTouchedAsset } = assetManager.execute(fileOps);
                  updatedProjectData.assets = updatedAssets;
                  touchedAsset = lastTouchedAsset;
              }
      
              if (goalTaskOps.length > 0) {
                  let updatedGoals = [...(updatedProjectData.goals || [])];
      
                  for (const op of goalTaskOps) {
                       switch (op.operation) {
                        case 'CREATE_GOAL': {
                            const goalOp = op as CreateGoalOperation;
                            if (!updatedGoals.some(g => g.title === goalOp.title)) {
                                const newGoal: Goal = {
                                    id: `${Date.now()}-${goalOp.title}`,
                                    title: goalOp.title,
                                    description: goalOp.description,
                                    tasks: [],
                                };
                                updatedGoals = [newGoal, ...updatedGoals];
                            }
                            break;
                        }
                        case 'CREATE_TASK': {
                            const taskOp = op as CreateTaskOperation;
                            const targetGoal = updatedGoals.find(g => g.title === taskOp.goalTitle);
                            if (targetGoal) {
                                const assignee = users.find(u => u.name === taskOp.assigneeName);
                                const newTask: Task = {
                                    id: `${Date.now()}-${taskOp.title}`,
                                    title: taskOp.title,
                                    description: taskOp.description,
                                    priority: taskOp.priority,
                                    status: 'To Do',
                                    dueDate: taskOp.dueDate ? new Date(taskOp.dueDate).toISOString() : undefined,
                                    assigneeId: assignee?.id,
                                    subtasks: [],
                                    attachments: [],
                                };
                                targetGoal.tasks = [newTask, ...targetGoal.tasks];
                            }
                            break;
                        }
                         case 'EDIT_TASK': {
                            const taskOp = op as EditTaskOperation;
                            const targetGoal = updatedGoals.find(g => g.title === taskOp.goalTitle);
                            if (targetGoal) {
                                const taskIndex = targetGoal.tasks.findIndex(t => t.title === taskOp.taskTitle);
                                if (taskIndex !== -1) {
                                    const originalTask = targetGoal.tasks[taskIndex];
                                    const assignee = users.find(u => u.name === taskOp.newAssigneeName);
                                    const updatedTask = {
                                        ...originalTask,
                                        title: taskOp.newTitle || originalTask.title,
                                        description: taskOp.newDescription || originalTask.description,
                                        priority: taskOp.newPriority || originalTask.priority,
                                        dueDate: taskOp.newDueDate ? new Date(taskOp.newDueDate).toISOString() : originalTask.dueDate,
                                        assigneeId: taskOp.newAssigneeName ? (assignee?.id || originalTask.assigneeId) : originalTask.assigneeId,
                                    };
                                    targetGoal.tasks[taskIndex] = updatedTask;
                                }
                            }
                            break;
                        }
                        case 'ADD_SUBTASK': {
                            const subtaskOp = op as AddSubtaskOperation;
                            const targetGoal = updatedGoals.find(g => g.title === subtaskOp.goalTitle);
                            if (targetGoal) {
                                const task = targetGoal.tasks.find(t => t.title === subtaskOp.taskTitle);
                                if (task) {
                                    const newSubtask = {
                                        id: `${Date.now()}`,
                                        text: subtaskOp.subtaskText,
                                        completed: false,
                                    };
                                    task.subtasks = [...task.subtasks, newSubtask];
                                }
                            }
                             break;
                        }
                        case 'SET_TASK_STATUS': {
                            const statusOp = op as SetTaskStatusOperation;
                            const targetGoal = updatedGoals.find(g => g.title === statusOp.goalTitle);
                            if (targetGoal) {
                                const task = targetGoal.tasks.find(t => t.title === statusOp.taskTitle);
                                if (task) {
                                    task.status = statusOp.newStatus;
                                }
                            }
                            break;
                        }
                    }
                  }
                  updatedProjectData.goals = updatedGoals;
              }
      
              handleUpdateCompany(updatedProjectData);
              
              if (touchedAsset) {
                setSelectedAssetInProject(touchedAsset);
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

  const handleSelectProjectFromChat = (projectId: string) => {
    if (!pendingClarification) return;
    
    const project = companyCards.find(c => c.id === projectId);
    if (!project) return;
    
    // Switch view state
    setActiveView('WORK');
    setSelectedCompanyId(projectId);

    // Add a system message to indicate context switch
    const systemMessage: ChatMessage = {
        role: 'system',
        content: { text: `Switched to project: ${project.title}. Running last command...` }
    };
    
    // Remove the old clarification message and add the new system message
    setChatMessages(prev => [...prev.filter(m => !m.content.projectClarification), systemMessage]);

    // Resend the original message in the new context
    const { message, attachedFileIds } = pendingClarification;
    
    // Build the override context immediately to avoid stale state
    const projectContextOverride = { view: 'PROJECT', project };
    const contextString = JSON.stringify(projectContextOverride);
    
    // Resend the command with the correct context and mark it as a continuation
    handleSendChatMessage(message, attachedFileIds, { 
        isContinuation: true, 
        contextOverride: contextString 
    });
    
    // Clear the pending state
    setPendingClarification(null);
  };
  
  const handleSelectExploredIdea = (idea: string) => {
    setTopic(idea);
    setMode(ResearchMode.Analyze);
    performResearch(idea, ResearchMode.Analyze);
  };

  const handleSelectHistory = (selectedResult: MarketAnalysisResult) => {
    setMarketAnalysis(selectedResult);
    setBusinessPlan(null);
    setChatMessages([]);
    setIsChatPanelVisible(false);
    setTopic(selectedResult.topic);
    setMode(selectedResult.mode);
    setError(null);
    setIsLoading(false);
    setIsHistoryOpen(false);
    setStage('RESEARCH');
    setResearchContextProject(null);
  };
  
  const handleClearHistory = () => {
    updateHistory([]);
  };
  
  const handleNewResearch = () => {
    setMarketAnalysis(null);
    setBusinessPlan(null);
    setChatMessages([]);
    setIsChatPanelVisible(false);
    setTopic('');
    setError(null);
    setStage('IDLE');
    setResearchContextProject(null);
    setActiveView('RESEARCH');
  };

   const handleGoogleSignIn = () => {
        googleDriveService.signIn();
    };

    const handleGoogleSignOut = () => {
        googleDriveService.signOut();
    };

    const handleSaveMarketAnalysisToDrive = async (result: MarketAnalysisResult) => {
        setIsLoading(true);
        setLoadingMessage('Saving to Google Drive...');
        try {
            const content = `
# Market Analysis: ${result.generatedTitle}

## Executive Summary
${result.executiveSummary}

## Market Overview
${result.marketOverview}

## Key Trends
${result.keyTrends}

## Target Audience
${result.targetAudience}

## SWOT Analysis
${result.swotAnalysis}

## Business Ideas
${result.businessIdeas}
            `;
            await googleDriveService.uploadTextFile(result.topic, 'Market Analysis.txt', content);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save to Google Drive.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveBusinessPlanToDrive = async (plan: BusinessPlan, topic: string) => {
        setIsLoading(true);
        setLoadingMessage('Saving to Google Drive...');
        try {
             const content = `
# Business Plan for ${topic}

## Mission Statement
${plan.missionStatement}

## Value Proposition
${plan.valueProposition}

## Marketing Strategy
${plan.marketingStrategy}

## KPIs
${plan.kpis}

## 90-Day Action Plan
${plan.actionPlan}
            `;
            await googleDriveService.uploadTextFile(topic, 'Business Plan.txt', content);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save to Google Drive.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProjectToDrive = async (project: CompanyCardData) => {
        setIsLoading(true);
        setLoadingMessage('Saving project to Google Drive...');
        try {
            await googleDriveService.uploadProject(project);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save project.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoClick = () => {
        setIsLandingPageVisible(true);
    };

    const handleEnterApp = () => {
        setIsLandingPageVisible(false);
    };
    
    const handleStartResearchFromLanding = (landingTopic: string, landingMode: ResearchMode) => {
        setTopic(landingTopic);
        setMode(landingMode);
        setIsLandingPageVisible(false);
        setActiveView('RESEARCH');
        performResearch(landingTopic, landingMode, null);
    };

    const renderContent = () => {
        if (error) {
            return (
                <div className="bg-red-100 dark:bg-red-900/50 rockstar:bg-rockstar-950/50 border border-red-300 dark:border-red-700 rockstar:border-rockstar-700 text-red-800 dark:text-red-300 rockstar:text-rockstar-300 px-4 py-3 rounded-lg text-center animate-fade-scale-in max-w-5xl mx-auto my-8">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            );
        }
        
        if (activeView === 'DASHBOARD') {
            return (
                <DashboardView 
                    cards={companyCards}
                    users={users}
                    onSelectCard={(id) => {
                        setSelectedCompanyId(id);
                        setActiveView('WORK');
                    }}
                    onShowAddCardModal={() => {
                        setEditingCard(null);
                        setIsProjectModalOpen(true);
                    }}
                    onStartResearch={() => setActiveView('RESEARCH')}
                />
            );
        }

        if (activeView === 'RESEARCH') {
            return (
                <>
                    {researchContextProject && !isLoading && (
                        <ContextualResearchView 
                            project={researchContextProject}
                            onPerformResearch={handlePerformContextualResearch}
                            onClearContext={handleClearResearchContext}
                        />
                    )}

                    {!researchContextProject && stage === 'IDLE' && !isLoading && <WelcomeScreen />}
                    
                    {stage === 'RESEARCH' && marketAnalysis && (
                        <MarketAnalysisDisplay 
                            result={marketAnalysis} 
                            onSelectBusinessIdea={handleGeneratePlan}
                            onSelectExploredIdea={handleSelectExploredIdea}
                            onNewResearch={handleNewResearch}
                            onSaveToDrive={() => handleSaveMarketAnalysisToDrive(marketAnalysis)}
                            isGoogleSignedIn={!!googleUser}
                            theme={theme}
                        />
                    )}
                    
                    {stage === 'PLANNING' && businessPlan && marketAnalysis && (
                        <BusinessPlanDisplay 
                            plan={businessPlan}
                            onBack={() => setStage('RESEARCH')}
                            onCreateProject={() => handleCreateProjectFromPlan(businessPlan, marketAnalysis)}
                            onSaveToDrive={() => handleSaveBusinessPlanToDrive(businessPlan, marketAnalysis.topic)}
                            isGoogleSignedIn={!!googleUser}
                        />
                    )}
                </>
            );
        }

        if (activeView === 'WORK') {
            return (
                selectedCompany ? (
                  <ProjectView 
                    project={selectedCompany} 
                    users={users}
                    onUpdateProject={handleUpdateCompany} 
                    onBack={() => {
                        setSelectedCompanyId(null);
                        // Go to dashboard if no project is selected, not work view
                        // setActiveView('DASHBOARD'); 
                    }}
                    onSaveToDrive={handleSaveProjectToDrive}
                    isGoogleSignedIn={!!googleUser}
                    initialSelectedAsset={selectedAssetInProject}
                  />
                ) : (
                  <WorkView 
                    cards={companyCards} 
                    onShowAddCardModal={() => {
                        setEditingCard(null);
                        setIsProjectModalOpen(true);
                    }}
                    onSelectCard={(id) => setSelectedCompanyId(id)}
                    onResearchFromProject={handleStartContextualResearch}
                    onEditCard={handleOpenEditModal}
                    onArchiveCard={handleArchiveCard}
                    onShowArchiveModal={() => setIsArchiveModalOpen(true)}
                    archivedCount={archivedCards.length}
                    users={users}
                  />
                )
            );
        }

        if (activeView === 'TEAM') {
            return (
                <TeamView
                    teamMembers={teamMembers}
                    projects={companyCards}
                    users={users}
                    onUpdateTeamMember={handleUpdateTeamMember}
                />
            );
        }

        return null;
    };

    const renderFooter = () => {
        if (isLoading || activeView === 'DASHBOARD') return null;

        if (activeView === 'RESEARCH' && stage === 'IDLE') {
             return (
                <div className="container mx-auto px-4 w-full max-w-5xl pb-4">
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-neutral-50 dark:from-neutral-900 rockstar:from-black to-transparent pointer-events-none -z-10"></div>
                    <SearchBar
                        topic={topic}
                        setTopic={setTopic}
                        mode={mode}
                        setMode={(newMode) => {
                            setMode(newMode);
                            if (newMode !== mode) setTopic('');
                        }}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        onToggleHistory={() => setIsHistoryOpen(true)}
                        researchContextProject={researchContextProject}
                        onClearResearchContext={handleClearResearchContext}
                    />
                </div>
            );
        }
        
        if ((activeView === 'RESEARCH' && stage !== 'IDLE') || activeView === 'WORK' || activeView === 'TEAM') {
            return (
                <div className="container mx-auto px-4 w-full max-w-5xl pb-4">
                   <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-neutral-50 dark:from-neutral-900 rockstar:from-black to-transparent pointer-events-none -z-10"></div>
                    
                    {isChatLoading && aiFeedback && (
                        <div className="mb-2">
                            <AIFeedbackDisplay stage={aiFeedback.stage} files={aiFeedback.files} />
                        </div>
                    )}
                    
                    <ChatBar
                      onSendMessage={handleSendChatMessage}
                      isLoading={isChatLoading}
                      onShowChat={() => setIsChatPanelVisible(true)}
                      hasMessages={chatMessages.length > 0}
                    />
                </div>
            )
        }
        return null;
    };


  return (
    <div className="h-screen font-sans flex flex-col">
        <div className={`relative flex-grow flex flex-col min-h-0 transition-filter duration-500 ${isLandingPageVisible ? 'filter blur-sm' : ''}`}>
             <Header 
                activeView={activeView} 
                setActiveView={setActiveView} 
                googleUser={googleUser}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleSignOut={handleGoogleSignOut}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogoClick={handleLogoClick}
            />
            
            {activeView === 'RESEARCH' && (
                <HistoryPanel 
                  history={history} 
                  isOpen={isHistoryOpen}
                  onClose={() => setIsHistoryOpen(false)}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory}
                  currentResultId={marketAnalysis?.id}
                />
            )}
            
            <main className={`flex-grow pt-20 overflow-y-auto pb-36 transition-filter duration-300 ${isChatPanelVisible ? 'filter blur-sm' : ''}`}>
                <div className={`container mx-auto px-4 w-full max-w-5xl ${isProjectViewActive ? 'h-full flex flex-col' : ''}`}>
                    {renderContent()}
                </div>
            </main>
            
            <footer className="absolute bottom-0 left-0 right-0 z-50">
               {renderFooter()}
            </footer>
        </div>

      {isProjectModalOpen && (
        <ProjectModal
            onClose={() => {
                setIsProjectModalOpen(false);
                setEditingCard(null);
            }}
            onSave={handleSaveCard}
            initialData={editingCard}
        />
      )}
      
      {isArchiveModalOpen && (
        <TrashModal
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            cards={archivedCards}
            onRestore={handleUnarchiveCard}
            onDeletePermanently={handleDeletePermanently}
            onEmptyTrash={handleClearArchive}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
            onClose={() => setIsSettingsModalOpen(false)} 
            currentTheme={theme}
            setTheme={setTheme}
        />
      )}

      {isLoading && <Loader message={loadingMessage} />}
      
      {isChatPanelVisible && (
          <ChatPanel 
            messages={chatMessages}
            isLoading={isChatLoading}
            onClose={() => setIsChatPanelVisible(false)}
            onSelectProject={handleSelectProjectFromChat}
          />
      )}

      {isLandingPageVisible && <LandingPage onEnterApp={handleEnterApp} onStartResearch={handleStartResearchFromLanding} />}

    </div>
  );
};

export default App;