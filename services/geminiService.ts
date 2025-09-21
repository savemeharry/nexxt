import { GoogleGenAI } from "@google/genai";
import { extractTextForAttachedFile } from '../utils/extractText';
import { ResearchMode } from '../types';
import type { MarketAnalysisResult, GroundingSource, BusinessPlan, Stat, ComparisonTable, ChartData, ChatMessage, SolutionCard, CompanyCardData, Asset, AttachedFile, FileOperation, CreateGoalOperation, CreateTaskOperation, Task, Goal, EditTaskOperation, AddSubtaskOperation, SetTaskStatusOperation, TeamMemberSuggestion } from '../types';

// Use Vite env var (must be prefixed with VITE_ in .env.local)
const ai = new GoogleGenAI({ apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY });

// Global abort controller to support cancelling long AI operations
let activeAbortController: AbortController | null = null;
const REQUEST_TIMEOUT_MS = 120000; // 2 minutes hard cap per attempt

const newRun = () => {
    if (activeAbortController) {
        try { activeAbortController.abort(); } catch {}
    }
    activeAbortController = new AbortController();
    return activeAbortController;
};

export const cancelActiveRun = () => {
    if (activeAbortController) {
        try { activeAbortController.abort(); } catch {}
    }
};


const generateAnalyzeNichePrompt = (topic: string, context?: CompanyCardData | null): string => {
  const contextPrompt = context 
    ? `You must perform this analysis specifically in the context of an existing project.
Project Title: "${context.title}"
Project Description: "${context.description}"
Use this project context to tailor your entire analysis, ensuring the SWOT, business ideas, and all other sections are directly relevant to this specific venture.`
    : '';

  return `
You are a senior business analyst from a top-tier consulting firm. Your task is to conduct a comprehensive market analysis for the business niche: "${topic}".

Default geography policy: If the user did not specify a country/region, assume a GLOBAL perspective. Do NOT assume any specific country. If regional differences are important, briefly note them and ask a follow-up which region to focus on.
${contextPrompt}

**IMPORTANT**: Respond in the same language as the user's query: "${topic}".

Please structure your response *exactly* as follows, using the specified separators. Do not add any extra text or formatting outside these sections. Use information from your search results to generate the content.

[TITLE_START]
Generate a single, insightful title for the market analysis report (max 15 words).
[TITLE_END]

[EXECUTIVE_SUMMARY_START]
Provide a concise "Executive Summary" of the market niche in 2-4 sentences, highlighting the key opportunity.
[EXECUTIVE_SUMMARY_END]

[MARKET_OVERVIEW_START]
Provide a detailed overview of the market. Discuss its size, growth potential, and current state. Use clear paragraphs.
[MARKET_OVERVIEW_END]

[STATS_START]
Identify 2-3 key statistics for this market (e.g., Market Size, Growth Rate, Key Segment). Format *each* on a new line as 'Label: Value'. Example:
Market Size: $500 Million
CAGR: 12%
[STATS_END]

[CHART_DATA_START]
If the data contains quantifiable comparisons suitable for a bar chart (e.g., market share, competitor revenue, feature comparison scores), provide the data in a valid JSON object. If not, write "null".
The JSON must have: type ('bar'), title (string), labels (string[]), and datasets (array of {label: string, data: number[]}).
Example: {"type": "bar", "title": "Competitor Market Share", "labels": ["Company A", "Company B", "Company C"], "datasets": [{"label": "Market Share %", "data": [45, 30, 15]}]}
[CHART_DATA_END]

[KEY_TRENDS_START]
Identify and explain 3-5 key trends currently shaping this market (e.g., technological, consumer behavior, regulatory). Format as a numbered list.
[KEY_TRENDS_END]

[TARGET_AUDIENCE_START]
Describe the primary target audience for this niche. Who are they? What are their needs, pain points, and motivations?
[TARGET_AUDIENCE_END]

[COMPETITOR_ANALYSIS_START]
Provide a brief summary of the competitive landscape.
[COMPETITOR_ANALYSIS_END]

[COMPETITOR_TABLE_START]
Analyze 2-3 key competitors. Format as a pipe-separated table. The first row is headers.
Competitor | Strengths | Weaknesses | Market Position
Company A | Strong brand recognition, large user base | Slow to innovate, expensive pricing | Leader
Company B | Innovative features, agile development | Limited marketing budget, low brand awareness | Challenger
[COMPETITOR_TABLE_END]

[SWOT_ANALYSIS_START]
Provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for a new business entering this niche. Format as four distinct lists, each starting with its title (e.g., "Strengths:").
[SWOT_ANALYSIS_END]

[BUSINESS_IDEAS_START]
Based on the analysis, generate 3-5 distinct and actionable business ideas within this niche. Format as a numbered list. Each idea should be a single, concise sentence.
[BUSINESS_IDEAS_END]
`;
};

const generateExploreIdeasPrompt = (topic: string): string => {
    return `
You are a startup incubator analyst. For the topic "${topic}", generate 5 innovative business ideas.

Default geography policy: If the user did not specify a country/region, assume a GLOBAL perspective. Do NOT assume any specific country.

**IMPORTANT**: Respond in the same language as the user's query: "${topic}".
**IMPORTANT**: Your response MUST follow this structure *exactly*. Do not add any introductory text, explanations, or any formatting other than what is specified. Return ONLY a numbered list.

[TITLE_START]
Business Opportunities in ${topic}
[TITLE_END]

[EXECUTIVE_SUMMARY_START]
A brief, one-sentence summary of why "${topic}" is a promising field for new ventures.
[EXECUTIVE_SUMMARY_END]

[BUSINESS_IDEAS_START]
1. Idea one: A brief, one-sentence description.
2. Idea two: A brief, one-sentence description.
3. Idea three: A brief, one-sentence description.
4. Idea four: A brief, one-sentence description.
5. Idea five: A brief, one-sentence description.
[BUSINESS_IDEAS_END]
`;
};


const generateBusinessPlanPrompt = (marketContext: string, businessIdea: string): string => {
  return `
You are an experienced business consultant and startup mentor. Your task is to create a lean, actionable business plan for a new venture.

**Chosen Business Idea:** "${businessIdea}"

**Background Market Analysis:**
${marketContext}
---
**IMPORTANT**: Respond in the same language as the user's query: "${businessIdea}".

Based on the idea and the market context, develop a business plan. Structure your response *exactly* as follows, using the specified separators. Do not add any extra text.

[MISSION_STATEMENT_START]
Craft a clear and inspiring mission statement for this business (1-2 sentences).
[MISSION_STATEMENT_END]

[VALUE_PROPOSITION_START]
Clearly articulate the unique value proposition. What makes this business different and desirable to customers? Explain in 2-3 sentences.
[VALUE_PROPOSITION_END]

[MARKETING_STRATEGY_START]
Outline 3-4 initial marketing and sales strategies to acquire the first 100 customers. Be specific (e.g., "Content marketing focusing on SEO for keywords like 'X'", "Partnerships with local businesses Y", "Direct outreach on LinkedIn"). Format as a numbered list.
[MARKETING_STRATEGY_END]

[KPIS_START]
List 3-5 Key Performance Indicators (KPIs) to track in the first 6 months to measure success. Format as a numbered list.
[KPIS_END]

[ACTION_PLAN_START]
Create a high-level, 90-day action plan broken down by month. Focus on the most critical steps to launch and validate the business. Format as:
Month 1:
- Task 1
- Task 2
Month 2:
- Task 1
- Task 2
Month 3:
- Task 1
- Task 2
[ACTION_PLAN_END]
`;
};

const flattenAssetsForAI = (assets: Asset[], path = ''): string => {
    let structure = '';
    for (const asset of assets) {
        const currentPath = path ? `${path}/${asset.name}` : asset.name;
        if (asset.type === 'file') {
            structure += `- [File] ${currentPath}\n`;
        } else if (asset.type === 'folder') {
            structure += `- [Folder] ${currentPath}/\n`;
            structure += flattenAssetsForAI(asset.children, currentPath).split('\n').map(line => line ? `  ${line}` : '').join('\n');
        }
    }
    return structure;
};

// Unicode-safe Base64 decoding
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const sleepWithAbort = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('ABORTED'));
    const id = setTimeout(resolve, ms);
    if (signal) {
        const onAbort = () => { clearTimeout(id); reject(new Error('ABORTED')); };
        signal.addEventListener('abort', onAbort, { once: true });
    }
});

const withTimeout = async <T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> => {
    return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
            const id = setTimeout(() => reject(new Error('TIMEOUT')), ms);
            if (signal) signal.addEventListener('abort', () => { clearTimeout(id); reject(new Error('ABORTED')); }, { once: true });
        })
    ]);
};

const parseRetryMs = (error: any): number | null => {
    try {
        const details = error?.error?.details || error?.details || [];
        const retryInfo = details.find((d: any) => d['@type']?.includes('RetryInfo'));
        const delay = retryInfo?.retryDelay;
        if (typeof delay === 'string' && delay.endsWith('s')) {
            const seconds = parseFloat(delay.replace('s',''));
            return isNaN(seconds) ? null : Math.max(1, Math.floor(seconds * 1000));
        }
    } catch {}
    return null;
};

type GenerateParams = { modelCandidates: string[]; contents: any; config?: any };

// Simple client-side rate limiter to mitigate 429s when users trigger many actions
let lastRequestTime = 0;
const MIN_INTERVAL_MS = 1500; // enforce at least 1.5s between calls in this tab
let cooldownUntilMs = 0; // global cooldown after 429

const withRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const waitMs = Math.max(0, lastRequestTime + MIN_INTERVAL_MS - now);
    const cdMs = Math.max(0, cooldownUntilMs - now);
    const totalWait = Math.max(waitMs, cdMs);
    if (totalWait > 0) {
        await sleepWithAbort(totalWait, activeAbortController?.signal);
    }
    try {
        const result = await fn();
        return result;
    } finally {
        lastRequestTime = Date.now();
    }
};

const generateWithBackoff = async ({ modelCandidates, contents, config }: GenerateParams) => {
    let lastError: any = null;
    for (const model of modelCandidates) {
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                if (activeAbortController?.signal.aborted) throw new Error('ABORTED');
                const response = await withRateLimit(() => withTimeout(ai.models.generateContent({ model, contents, config }), REQUEST_TIMEOUT_MS, activeAbortController?.signal));
                return response;
            } catch (err: any) {
                lastError = err;
                const code = err?.error?.code || err?.status;
                const status = err?.error?.status;
                if (err && (err.message === 'ABORTED' || err.message === 'TIMEOUT')) {
                    throw err;
                }
                if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
                    const base = parseRetryMs(err) ?? 15000;
                    const jitter = Math.floor(Math.random() * 5000);
                    const backoff = Math.min(base * Math.pow(2, attempt) + jitter, 60000);
                    cooldownUntilMs = Date.now() + backoff;
                    await sleepWithAbort(backoff, activeAbortController?.signal);
                    continue;
                }
                break;
            }
        }
    }
    throw lastError;
};

// Streaming version for real-time grounding sources
const generateStreamWithBackoff = async ({ modelCandidates, contents, config }: GenerateParams, onSearchUpdate?: (queries: string[], sources: string[]) => void) => {
    let lastError: any = null;
    for (const model of modelCandidates) {
        for (let attempt = 0; attempt < 4; attempt++) {
            try {
                if (activeAbortController?.signal.aborted) throw new Error('ABORTED');
                
                const stream = ai.models.generateContentStream({ model, contents, config });
                let fullText = '';
                let groundingSources: string[] = [];
                
                for await (const chunk of stream) {
                    if (activeAbortController?.signal.aborted) throw new Error('ABORTED');
                    
                    // Accumulate text
                    if (chunk.text) {
                        fullText += chunk.text;
                    }
                    
                    // Extract grounding sources in real-time
                    if (chunk.groundingMetadata?.groundingChunks) {
                        const newSources = chunk.groundingMetadata.groundingChunks
                            .map((chunk: any) => chunk.web?.uri ? new URL(chunk.web.uri).hostname.replace(/^www\./, '') : '')
                            .filter(Boolean);
                        
                        groundingSources = [...new Set([...groundingSources, ...newSources])];
                        
                        // Call callback with real-time updates
                        if (onSearchUpdate && newSources.length > 0) {
                            onSearchUpdate([], groundingSources);
                        }
                    }
                }
                
                // Return final response with accumulated data
                return {
                    text: fullText,
                    groundingMetadata: { groundingChunks: groundingSources.map(source => ({ web: { uri: `https://${source}` } })) }
                };
                
            } catch (err: any) {
                lastError = err;
                const code = err?.error?.code || err?.status;
                const status = err?.error?.status;
                if (err && (err.message === 'ABORTED' || err.message === 'TIMEOUT')) {
                    throw err;
                }
                if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
                    const base = parseRetryMs(err) ?? 15000;
                    const jitter = Math.floor(Math.random() * 5000);
                    const backoff = Math.min(base * Math.pow(2, attempt) + jitter, 60000);
                    cooldownUntilMs = Date.now() + backoff;
                    await sleepWithAbort(backoff, activeAbortController?.signal);
                    continue;
                }
                break;
            }
        }
    }
    throw lastError;
};

const generateFollowUpPrompt = (question: string, context: string, chatHistory: ChatMessage[]): string => {
    const historyString = chatHistory
        .map(m => `${m.role}: ${m.content.text}`)
        .join('\n');
    
    const previousCards = chatHistory
        .filter(msg => msg.role === 'model' && msg.content.cards)
        .flatMap(msg => msg.content.cards!)
        .map(card => card.title);

    let repetitionInstruction = '';
    if (previousCards.length > 0) {
        repetitionInstruction = `**CRITICAL INSTRUCTION**: You have already suggested the following solutions: "${previousCards.join('", "')}". DO NOT suggest these specific items again. Find new, unique examples.`;
    }

    let reportTypeContext = '';
    let focusedFileContext = '';
    let operationOverrideInstruction = '';
    let saveFileFlowInstruction = '';
    let liveEditingInstruction = '';

    // Check for the special save prompt
    if (question.startsWith("The user wants to save the changes to the document")) {
        saveFileFlowInstruction = `
**CRITICAL WORKFLOW: SAVE FILE**: The user has clicked "Save" on a document with pending changes.
1. Your first task is to ask the user to confirm and provide a path to save the file. Be helpful, suggest the original path as a default or give examples like "folder/new-name.md".
2. DO NOT use any file operations in this response. Just ask the question.
3. In your *next* response, after the user provides a path, you will use the 'EDIT_FILE' or 'CREATE_FILE' operation to save the content. The application has the pending content saved and will inject it into your operation.
`;
    }


    try {
        const parsedContext = JSON.parse(context);
        
        if (parsedContext.isSplitView) {
            liveEditingInstruction = `
**CRITICAL WORKFLOW: LIVE EDITING SESSION**: You are in a collaborative live editing session with the user in a split-screen view. Your task is to modify the document based on the user's request.

**ABSOLUTE RULE for SAVING**: If the user's request is to "save", "confirm", "keep", or anything similar, your ONLY response must be a short confirmation like "Okay, saved." You MUST NOT generate a [FILE_OPERATIONS_START] block in this case. The user will click a button in the UI to perform the final save.

1.  Acknowledge the user's edit request with a brief confirmation (e.g., "Okay, I'll make that change.").
2.  Your primary output MUST be a \`PATCH_FILE\` operation inside the [FILE_OPERATIONS_START] block. DO NOT use \`EDIT_FILE\`.
3.  Analyze the document's current content (provided in the context) and determine the line-by-line changes needed.
4.  Construct a \`patches\` array describing these changes. The application will animate these changes for the user.

**PATCH_FILE Schema:**
\`\`\`json
{
  "operation": "PATCH_FILE",
  "path": "path/to/file.md",
  "patches": [
    { "type": "DELETE", "lineNumber": 5, "count": 2 },
    { "type": "INSERT", "afterLineNumber": 8, "content": ["- New bullet point 1", "- New bullet point 2"] },
    { "type": "REPLACE", "lineNumber": 12, "content": ["This is the updated line content."] }
  ]
}
\`\`\`
- \`lineNumber\` and \`afterLineNumber\` are 1-based indexes.
- \`content\` is an array of strings, where each string is a new line of plain text or markdown.
- For \`REPLACE\`, the \`content\` array replaces the single line specified by \`lineNumber\`.
- For \`DELETE\`, \`count\` is optional and defaults to 1.
\n
**LINKS AS SOLUTION CARDS (MANDATORY IN SPLIT VIEW)**:
When you cite sources or provide external links, you MUST also provide them as Solution Cards. Keep each card compact: a short, human-readable title (<= 60 chars) and a one-line summary (<= 80 chars). Add them using the [SOLUTION_CARDS_START] ... [SOLUTION_CARDS_END] block, in valid JSON, e.g.:
\n
[SOLUTION_CARDS_START]
[
  { "title": "National Bank of Kazakhstan", "description": "Official exchange rates.", "link": "https://www.nationalbank.kz/" }
]
[SOLUTION_CARDS_END]
`;
        }

        if (parsedContext.focusedFiles && parsedContext.focusedFiles.length > 0) {
            const files = parsedContext.focusedFiles as AttachedFile[];
            const MAX_TOTAL_CONTENT_LENGTH = 50000;
            let currentTotalLength = 0;

            const fileContents = files.map(file => {
                let fileContent = 'File content is binary or not available for preview.';
                let truncated = false;
                if (file.content && file.content.includes('base64,')) {
                    const base64 = file.content.split(',')[1] || '';
                    const decodedContent = b64_to_utf8(base64);

                    const remainingLength = MAX_TOTAL_CONTENT_LENGTH - currentTotalLength;

                    if (remainingLength <= 0) {
                        fileContent = '';
                        truncated = true;
                    } else if (decodedContent.length > remainingLength) {
                        fileContent = decodedContent.substring(0, remainingLength);
                        truncated = true;
                    } else {
                        fileContent = decodedContent;
                    }
                    currentTotalLength += fileContent.length;
                }
                
                if (truncated) {
                    return `
**Attached File Content ("${file.name}")**:
---
${fileContent}

...[CONTENT TRUNCATED TO FIT CONTEXT WINDOW]...
---`;
                } else {
                     return `
**Attached File Content ("${file.name}")**:
---
${fileContent}
---`;
                }
            }).join('\n\n');

            const focusedPath = (parsedContext as any).focusedFilePath ? ` at path "${(parsedContext as any).focusedFilePath}"` : '';
            focusedFileContext = `
**CRITICAL CONTEXT**: The user is editing the file${focusedPath}. Apply changes directly to this file using PATCH_FILE. Do NOT create copies.

${fileContents}
`;
        }

        const view = parsedContext.view;

        if (view === 'PROJECT') {
             const project = parsedContext.project as CompanyCardData;
             const assetTree = flattenAssetsForAI(project.assets);
             const goalList = (project.goals || []).map(g => {
                const taskList = g.tasks.map(t => `  - ${t.title} [${t.status}]`).join('\n');
                return `"${g.title}" with tasks:\n${taskList}`;
             }).join('\n') || 'None';
             const memberList = (project.members || []).map(m => `"${m.name}"`).join(', ') || 'None';

             reportTypeContext = `The user is focused on a single project: "${project.title}".
Description: "${project.description}".
Project members available for assignment: ${memberList}.
Existing goals and tasks in this project:
${goalList}
The project has the following file/folder structure:
\`\`\`
${assetTree}
\`\`\`
Base your answers and operations on this specific project's context. You can create new goals or add tasks to existing goals. If a task is for a goal that does not exist, create the goal first in the same operation array.
You can now also EDIT existing tasks, ADD subtasks to them, or SET their status.`;
        } else if (view === 'WORK') {
            const cards = parsedContext.companyCards as CompanyCardData[];
            const projectListForAI = JSON.stringify(cards.map(c => ({ id: c.id, title: c.title })));
            reportTypeContext = `The user is in their "Workspace", managing these projects: ${cards.map(c => `"${c.title}"`).join(', ')}.`;
            operationOverrideInstruction = `\n**CRITICAL RULE**: The user is in the general "Workspace" view. If they ask to perform an operation (create file, create task, etc.) and the target project is ambiguous, you MUST ask for clarification.
To do this, you MUST respond with:
1. A brief question like "Which project should I perform this action in?".
2. The [PROJECT_CLARIFICATION_START] tag, followed by a valid JSON array of *all* available projects from the list below, then the [PROJECT_CLARIFICATION_END] tag.
The list of available projects is: ${projectListForAI}.
DO NOT attempt any operations yourself in this case.

Example Response:
I can do that. Which project should this be in?
[PROJECT_CLARIFICATION_START]
[{"id":"proj_1","title":"Project Alpha"},{"id":"proj_2","title":"Marketing Campaign"}]
[PROJECT_CLARIFICATION_END]`;
        } else if (view === 'TEAM') {
            const projects = parsedContext.projects as CompanyCardData[];
            const projectList = projects.map(p => `- "${p.title}" (Description: ${p.description})`).join('\n');
            reportTypeContext = `The user is in the "Team" section. Their goal is to plan and build their team structure. They have the following projects:\n${projectList}\nYour role is to act as an expert HR consultant and startup advisor. Help them define roles, responsibilities, and team structures. When suggesting a new role, you MUST use the [TEAM_SUGGESTIONS_START] format.`;
            operationOverrideInstruction = `\n**CRITICAL RULE**: The user is in the "Team" view. You MUST NOT use the [FILE_OPERATIONS_START] tag or attempt any file operations. Focus on team building advice and generating team member profiles.`;
        } else if (view === 'CONTEXT_RESEARCH') {
             const project = parsedContext.project as CompanyCardData;
            reportTypeContext = `The user is performing contextual research on their project: "${project.title}". The focus is on market analysis, not file or task management.`;
            operationOverrideInstruction = `\n**CRITICAL RULE**: The user is in the "Research" view. You MUST NOT use the [FILE_OPERATIONS_START] tag or attempt any file, goal, or task operations. If the user asks to modify something, guide them to the 'Work' tab to find their project first.`;
        } else if ((parsedContext as any).mode) {
             const report: MarketAnalysisResult = parsedContext as any;
            if (report.mode === ResearchMode.Explore) {
                reportTypeContext = "The user is currently viewing a high-level 'Explore Ideas' report, which is a simple list of business ideas. It is NOT a deep market analysis. Acknowledge this if the user asks about the 'analysis'.";
            } else {
                reportTypeContext = "The user is currently viewing a detailed 'Analyze Niche' report. This is a full market analysis.";
            }
             // Provide the analysis sections verbatim so the model can cite them
             reportTypeContext += `\n\nUse these sections from the current report as primary context.\nTitle: ${report.generatedTitle}\nExecutive Summary: ${report.executiveSummary}\nMarket Overview: ${report.marketOverview}\nKey Trends: ${report.keyTrends}\nTarget Audience: ${report.targetAudience}\nSWOT: ${report.swotAnalysis}\nIdeas: ${report.businessIdeas}`;
             if ((parsedContext as any).businessPlan) {
                const bp = (parsedContext as any).businessPlan as BusinessPlan;
                reportTypeContext += `\n\nThere is also a generated business plan.\nMission: ${bp.missionStatement}\nValue Proposition: ${bp.valueProposition}\nMarketing: ${bp.marketingStrategy}\nKPIs: ${bp.kpis}`;
             }
        } else {
            reportTypeContext = "The user is viewing a report or their workspace.";
        }
    } catch (e) {
        // Fallback if context is not a valid JSON
        reportTypeContext = "The user is viewing a report or their workspace.";
    }


    return `
You are nexxt, a Pro Business Copilot. Your purpose is to act as an integrated AI partner within this application, helping users turn ideas into successful ventures. Your personality is professional, insightful, and proactive.

**Your Core Identity & Directives:**
1.  **Identify as "nexxt" only when asked:** Do not self-identify repeatedly. If the user asks who you are, introduce yourself as "nexxt, your Pro Business Copilot." Otherwise, focus on helpful, concise answers.
2.  **Understand the User's Context:** The user interacts with you from multiple views: "Research", "Work", and "Team". Your primary goal is to provide contextually relevant assistance. The JSON \`context\` string tells you where the user is and what they're looking at.
3.  **Be an Action-Oriented Partner:** Don't just answer questions. Provide actionable advice, generate useful content, suggest next steps, and perform tasks when requested.
4.  **Language Proficiency:** Always respond in the same language as the user's last query.

${saveFileFlowInstruction}
${liveEditingInstruction}

**Context-Specific Behavior:**

*   **If the context is "Research":**
    *   The user is in the idea validation and market analysis phase.
    *   **Your Role:** Act as a market analyst and startup incubator consultant.
    *   **Your Tasks:** Help users explore broad topics, perform deep-dive analyses on specific niches, generate innovative business ideas, and create lean business plans. Use the \`googleSearch\` tool to provide up-to-date information.

*   **If the context is "Work":**
    *   The user is in the project management and execution phase. They are either viewing their list of projects ("Workspace") or are inside a specific project.
    *   **Your Role:** Act as an operational assistant and strategic advisor for their existing projects.
    *   **Your Tasks:**
        *   Answer questions based on the provided project title, description, and file structure.
        *   If specific files are attached to the prompt, your analysis **must** focus primarily on the content of those files.
        *   Perform operations (create/edit files, create/edit goals/tasks) when explicitly asked. Adhere strictly to the JSON format provided in the instructions.
        *   If an operation is requested from the general "Workspace" and the target project is unclear, you **must** ask for clarification using the \`[PROJECT_CLARIFICATION_START]\` tag.

*   **If the context is "Team":**
    *   The user is planning their team structure.
    *   **Your Role:** Act as an expert HR consultant and startup advisor.
    *   **Your Tasks:** Help the user define necessary roles, outline responsibilities, and suggest team structures based on their projects. When suggesting a role, use the \`[TEAM_SUGGESTIONS_START]\` tag.

${focusedFileContext}

**General Context:** ${reportTypeContext}

**Your Core Directives (Recap & Additions):**
1.  **Be Concise:** Your text answer MUST be short and to the point. Avoid long paragraphs. Use lists if appropriate.
2.  **Brainstorm & Go Beyond:** If the user's question goes beyond the initial report, you MUST use your own knowledge and the search tool to fully explore their idea. DO NOT say "the information is not in the report."
3.  **Offer Solution Cards (If Applicable):** AFTER your text answer, if you find concrete, real-world products, companies, or concepts, provide them as an array of "Solution Cards".
4.  **Perform AI Operations (If Requested):** If the user asks you to create/edit files, goals, or tasks, you MUST use the operations format. Provide a brief text confirmation, then use the operations tags. You can perform multiple operations at once.

${repetitionInstruction}${operationOverrideInstruction}

**External Sources Policy (Very Important):**
1. Use the googleSearch tool whenever you provide external references or statistics. Prefer official/org sites and fresh pages.
2. Do NOT invent URLs. If unsure about a link, omit it.
3. Prefer links that appear in your grounding citations (groundingMetadata). Base your Solution Cards on those.

**Response Formatting Rules:**
*   **IMPORTANT**: Respond in the same language as the user's question: "${question}".
*   Provide your concise text answer first.
*   If you have Solution Cards, add them using the [SOLUTION_CARDS_START]...[SOLUTION_CARDS_END] tags.
*   If you are suggesting team members, use the [TEAM_SUGGESTIONS_START]...[TEAM_SUGGESTIONS_END] tags.
*   If you are performing operations, use the [FILE_OPERATIONS_START]...[FILE_OPERATIONS_END] tags. The content inside must be a single JSON array of operation objects.
*   If you need to ask for project clarification, use the [PROJECT_CLARIFICATION_START]...[PROJECT_CLARIFICATION_END] tags.

---
**AI Operations Schema & Examples:**

You MUST return a JSON array of operations.
**CRITICAL**: The 'content' field for CREATE_FILE and EDIT_FILE operations MUST be a valid JSON string (newlines escaped as \`\\n\`, double quotes as \`\\"\`). When saving a file after a user provides a path, you MUST provide the 'content' field, but the application will overwrite it with the real content; you can use "..." as a placeholder.

1.  **Create a File:**
    \`{ "operation": "CREATE_FILE", "path": "path/to/new_file.txt", "content": "File content." }\`

2.  **Create a Folder:**
    \`{ "operation": "CREATE_FOLDER", "path": "path/to/new_folder" }\`

3.  **Edit/Overwrite a File:**
    \`{ "operation": "EDIT_FILE", "path": "path/to/existing_file.txt", "content": "New content." }\`

4.  **Move a File or Folder:**
    \`{ "operation": "MOVE_ASSET", "sourcePath": "old/path/item.txt", "destinationPath": "new/path/item.txt" }\`

5.  **Rename a File or Folder:**
    \`{ "operation": "RENAME_ASSET", "path": "path/to/item.txt", "newName": "new_name.txt" }\`

6.  **Create a Goal:**
    \`{ "operation": "CREATE_GOAL", "title": "New Goal Title", "description": "Description of the goal." }\`

7.  **Create a Task:**
    \`{ "operation": "CREATE_TASK", "goalTitle": "Existing Goal Title", "title": "New Task Title", "description": "...", "priority": "Medium", "dueDate": "YYYY-MM-DD", "assigneeName": "Alex Chen" }\`

8.  **Edit a Task:** Identify task by its current title. Only include fields you want to change.
    \`{ "operation": "EDIT_TASK", "goalTitle": "Goal Containing Task", "taskTitle": "Task to Edit", "newTitle": "Updated Task Title", "newPriority": "High" }\`

9.  **Add a Subtask:**
    \`{ "operation": "ADD_SUBTASK", "goalTitle": "Goal Title", "taskTitle": "Target Task Title", "subtaskText": "Text for the new subtask." }\`

10. **Set Task Status:**
    \`{ "operation": "SET_TASK_STATUS", "goalTitle": "Goal Title", "taskTitle": "Target Task Title", "newStatus": "In Progress" }\`
    
11. **Patch a File (Live Editing ONLY):**
    \`{ "operation": "PATCH_FILE", "path": "path/to/file.md", "patches": [...] }\`

**Example Usage:**
User: "Edit task 'Draft press release': set priority to Urgent and assign to Maria Garcia."
[FILE_OPERATIONS_START]
[
  { "operation": "EDIT_TASK", "goalTitle": "Q4 Marketing Push", "taskTitle": "Draft press release", "newPriority": "Urgent", "newAssigneeName": "Maria Garcia" }
]
[FILE_OPERATIONS_END]
---

**Solution Cards Format:**
[SOLUTION_CARDS_START]
[
  { "title": "Solution 1", "description": "...", "link": "..." }
]
[SOLUTION_CARDS_END]

---

**Team Suggestions Format:**
[TEAM_SUGGESTIONS_START]
[
  { "role": "Role Title", "responsibilities": ["Responsibility 1", "Responsibility 2"] }
]
[TEAM_SUGGESTIONS_END]

---

**Project Clarification Format:**
[PROJECT_CLARIFICATION_START]
[
  { "id": "project_id_1", "title": "Project Title 1" }
]
[PROJECT_CLARIFICATION_END]


---
**Full Data Context (JSON String):**
${context}
---
**Conversation History:**
${historyString}
---

**User's Latest Question:** "${question}"

Your Comprehensive Answer:
`;
};


const parseMarketAnalysis = (text: string): Omit<MarketAnalysisResult, 'id' | 'topic' | 'mode' | 'sources'> => {
    const getSection = (startTag: string, endTag: string) => text.split(startTag)[1]?.split(endTag)[0]?.trim() ?? '';

    const statsRaw = getSection('[STATS_START]', '[STATS_END]');
    const marketStats: Stat[] = statsRaw.split('\n').filter(line => line.includes(':')).map(line => {
        const [label, ...valueParts] = line.split(':');
        return { label: label.trim(), value: valueParts.join(':').trim() };
    });
    
    const tableRaw = getSection('[COMPETITOR_TABLE_START]', '[COMPETITOR_TABLE_END]');
    let competitorTable: ComparisonTable | null = null;
    if (tableRaw) {
        // Нормализуем переносы: некоторые модели выводят таблицу одной строкой
        const safe = tableRaw
            .replace(/\r/g, '')
            .replace(/\n+/g, '\n')
            // Если нет переносов, попробуем разбить по заголовкам и регулярному разделителю столбцов
            .replace(/\s*Competitor\s*\|\s*Strengths\s*\|\s*Weaknesses\s*\|\s*Market Position\s*/i, (m) => `\n${m}\n`);

        const lines = safe.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
            const header = lines[0].split('|').map(h => h.trim());
            const dataRows = lines.slice(1).map(line => {
                const cells = line.split('|').map(c => c.trim());
                // Если модель склеила всё в один блок, попробуем fallback-разбиение по двойным пробелам
                if (cells.length < 4) {
                    const alt = line.split(/\s\|\s|\s{2,}/).map(c => c.trim()).filter(Boolean);
                    return alt.length >= 4 ? alt.slice(0,4) : cells;
                }
                return cells;
            }).filter(r => r.length >= 4);

            if (dataRows.length > 0) {
                competitorTable = { headers: header, rows: dataRows };
            }
        }
    }

    const chartDataRaw = getSection('[CHART_DATA_START]', '[CHART_DATA_END]');
    let chartData: ChartData | null = null;
    if (chartDataRaw && chartDataRaw.trim().toLowerCase() !== 'null') {
        try {
            chartData = JSON.parse(chartDataRaw);
        } catch (e) {
            console.error("Failed to parse chart data JSON:", e, "Raw data:", chartDataRaw);
            chartData = null;
        }
    }


    return { 
        generatedTitle: getSection('[TITLE_START]', '[TITLE_END]') || 'Market Analysis',
        executiveSummary: getSection('[EXECUTIVE_SUMMARY_START]', '[EXECUTIVE_SUMMARY_END]'),
        marketOverview: getSection('[MARKET_OVERVIEW_START]', '[MARKET_OVERVIEW_END]'),
        marketStats,
        chartData,
        keyTrends: getSection('[KEY_TRENDS_START]', '[KEY_TRENDS_END]'),
        targetAudience: getSection('[TARGET_AUDIENCE_START]', '[TARGET_AUDIENCE_END]'),
        competitorAnalysis: getSection('[COMPETITOR_ANALYSIS_START]', '[COMPETITOR_ANALYSIS_END]'),
        competitorTable,
        swotAnalysis: getSection('[SWOT_ANALYSIS_START]', '[SWOT_ANALYSIS_END]'),
        businessIdeas: getSection('[BUSINESS_IDEAS_START]', '[BUSINESS_IDEAS_END]'),
    };
};

const parseBusinessPlan = (text: string): BusinessPlan => {
    const getSection = (startTag: string, endTag: string) => text.split(startTag)[1]?.split(endTag)[0]?.trim() ?? '';

    return {
        missionStatement: getSection('[MISSION_STATEMENT_START]', '[MISSION_STATEMENT_END]'),
        valueProposition: getSection('[VALUE_PROPOSITION_START]', '[VALUE_PROPOSITION_END]'),
        marketingStrategy: getSection('[MARKETING_STRATEGY_START]', '[MARKETING_STRATEGY_END]'),
        kpis: getSection('[KPIS_START]', '[KPIS_END]'),
        actionPlan: getSection('[ACTION_PLAN_START]', '[ACTION_PLAN_END]'),
    };
};


export const fetchMarketAnalysis = async (topic: string, mode: ResearchMode, context: CompanyCardData | null = null): Promise<Omit<MarketAnalysisResult, 'id' | 'topic' | 'mode'>> => {
  try {
    newRun();
    const prompt = mode === ResearchMode.Analyze 
        ? generateAnalyzeNichePrompt(topic, context)
        : generateExploreIdeasPrompt(topic);
    
    const response = await generateWithBackoff({
        modelCandidates: ["gemini-2.5-flash", "gemini-1.5-flash"],
        contents: prompt,
        config: {
            ...(mode === ResearchMode.Analyze && { tools: [{ googleSearch: {} }] })
        }
    });

    const parsedContent = parseMarketAnalysis(response.text);

    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundingSource[] = rawSources
      .map((chunk: any) => ({
          uri: chunk.web?.uri ?? '',
          title: chunk.web?.title ?? 'Untitled Source',
      }))
      .filter((source: GroundingSource) => source.uri)
      .filter((source: GroundingSource, index: number, self: GroundingSource[]) =>
          index === self.findIndex((s) => s.uri === source.uri)
      );

    return { ...parsedContent, sources };
  } catch (error) {
    console.error("Error fetching market analysis from Gemini API:", error);
    throw new Error("Failed to generate market analysis. The AI model may be unavailable.");
  }
};


export const fetchBusinessPlan = async (marketContext: string, businessIdea: string): Promise<BusinessPlan> => {
  try {
    newRun();
    const prompt = generateBusinessPlanPrompt(marketContext, businessIdea);
    const response = await generateWithBackoff({
        modelCandidates: ["gemini-2.5-flash", "gemini-1.5-flash"],
        contents: prompt,
    });
    return parseBusinessPlan(response.text);
  } catch (error) {
    console.error("Error fetching business plan:", error);
    throw new Error("Failed to generate the business plan.");
  }
};


export const fetchFollowUp = async (
    question: string, 
    context: string, 
    chatHistory: ChatMessage[],
    onSearchUpdate?: (queries: string[], sources: string[]) => void
): Promise<{ text: string; cards?: SolutionCard[], fileOperations?: FileOperation[], projectClarification?: {id: string, title: string}[], teamMemberSuggestions?: TeamMemberSuggestion[] }> => {
    try {
        newRun();
        // Augment context with extracted text from attachments (PDF/images/text)
        const preparedContext = await (async () => {
            try {
                const parsed = JSON.parse(context);
                if (parsed.focusedFiles && Array.isArray(parsed.focusedFiles)) {
                    const augmented = await Promise.all(parsed.focusedFiles.map(async (f: any) => {
                        try {
                            const extractedText = await extractTextForAttachedFile(f);
                            return extractedText ? { ...f, extractedText } : f;
                        } catch {
                            return f;
                        }
                    }));
                    parsed.focusedFiles = augmented;
                    return JSON.stringify(parsed);
                }
            } catch {}
            return context;
        })();

        const prompt = generateFollowUpPrompt(question, preparedContext, chatHistory);
        
        // Use streaming if web search callback is provided
        const response = onSearchUpdate ? 
            await generateStreamWithBackoff({
                modelCandidates: ["gemini-2.5-flash", "gemini-1.5-flash"],
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            }, onSearchUpdate) :
            await generateWithBackoff({
                modelCandidates: ["gemini-2.5-flash", "gemini-1.5-flash"],
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] }
            });
        
        let text = response.text ?? '';

        let cards: SolutionCard[] | undefined = undefined;
        let fileOperations: FileOperation[] | undefined = undefined;
        let projectClarification: {id: string, title: string}[] | undefined = undefined;
        let teamMemberSuggestions: TeamMemberSuggestion[] | undefined = undefined;
        // Grounded links from search citations
        const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const groundedCards: SolutionCard[] = rawSources
          .map((chunk: any) => ({
              title: chunk.web?.title || (chunk.web?.uri ? new URL(chunk.web.uri).hostname.replace(/^www\./,'') : 'Source'),
              description: '',
              link: chunk.web?.uri || ''
          }))
          .filter(c => !!c.link);
        
        const cardStartTag = '[SOLUTION_CARDS_START]';
        const cardEndTag = '[SOLUTION_CARDS_END]';
        const fileOpStartTag = '[FILE_OPERATIONS_START]';
        const fileOpEndTag = '[FILE_OPERATIONS_END]';
        const clarificationStartTag = '[PROJECT_CLARIFICATION_START]';
        const clarificationEndTag = '[PROJECT_CLARIFICATION_END]';
        const teamStartTag = '[TEAM_SUGGESTIONS_START]';
        const teamEndTag = '[TEAM_SUGGESTIONS_END]';


        if (text.includes(cardStartTag) && text.includes(cardEndTag)) {
            const cardJsonRaw = text.split(cardStartTag)[1].split(cardEndTag)[0].trim();
            try {
                cards = JSON.parse(cardJsonRaw);
                text = text.split(cardStartTag)[0].trim();
            } catch (e) {
                console.error("Failed to parse Solution Cards JSON:", e, "Raw data:", cardJsonRaw);
                text = text.split(cardStartTag)[0].trim() + "\n\n(I found some solutions, but had trouble formatting them.)";
            }
        }

        // Merge grounded cards with model cards, filter duplicates by link
        if (groundedCards.length > 0) {
            const existing = new Set((cards || []).map(c => c.link?.trim()).filter(Boolean));
            const merged = [...(cards || []), ...groundedCards.filter(c => !existing.has(c.link?.trim()))];
            // Compact descriptions
            cards = merged.map(c => ({
                ...c,
                title: c.title?.slice(0, 60) || (c.link ? new URL(c.link).hostname.replace(/^www\./,'') : 'Link'),
                description: c.description ? c.description.slice(0, 80) : ''
            }));
        }

        if (text.includes(fileOpStartTag) && text.includes(fileOpEndTag)) {
            const fileJsonRaw = text.split(fileOpStartTag)[1].split(fileOpEndTag)[0].trim();
            try {
                fileOperations = JSON.parse(fileJsonRaw);
                text = text.split(fileOpStartTag)[0].trim();
            } catch (e) {
                console.error("Failed to parse File Operations JSON:", e, "Raw data:", fileJsonRaw);
                text = text.split(fileOpStartTag)[0].trim() + "\n\n(I tried to perform file actions, but encountered an error.)";
            }
        }
        
        if (text.includes(clarificationStartTag) && text.includes(clarificationEndTag)) {
            const clarificationJsonRaw = text.split(clarificationStartTag)[1].split(clarificationEndTag)[0].trim();
            try {
                projectClarification = JSON.parse(clarificationJsonRaw);
                text = text.split(clarificationStartTag)[0].trim();
            } catch (e) {
                console.error("Failed to parse Project Clarification JSON:", e, "Raw data:", clarificationJsonRaw);
                text = text.split(clarificationStartTag)[0].trim() + "\n\n(I had trouble listing the projects for you to select.)";
            }
        }

        if (text.includes(teamStartTag) && text.includes(teamEndTag)) {
            const teamJsonRaw = text.split(teamStartTag)[1].split(teamEndTag)[0].trim();
            try {
                teamMemberSuggestions = JSON.parse(teamJsonRaw);
                text = text.split(teamStartTag)[0].trim();
            } catch (e) {
                console.error("Failed to parse Team Suggestions JSON:", e, "Raw data:", teamJsonRaw);
                text = text.split(teamStartTag)[0].trim() + "\n\n(I had some ideas for team roles, but had trouble formatting them.)";
            }
        }
        
        return { text: text.trim(), cards, fileOperations, projectClarification, teamMemberSuggestions };
    } catch (error) {
        console.error("Error fetching follow-up from Gemini API:", error, await (error as any).response?.json());
        const code = (error as any)?.error?.code || (error as any)?.status;
        if (code === 429) {
            throw new Error("Слишком много запросов к модели (429). Подождите 10–60 секунд и попробуйте снова.");
        }
        throw new Error("Failed to generate follow-up response.");
    }
};