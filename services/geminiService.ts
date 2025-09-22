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

const generateFollowUpPrompt = (question: string, context: string, chatHistory: ChatMessage[]): string => {
    const contextInfo = (() => {
        try {
            const parsed = JSON.parse(context);
            if (parsed.view === 'RESEARCH') {
                return 'You are assisting with research and market analysis tasks.';
            } else if (parsed.view === 'PROJECT' && parsed.project) {
                return `You are helping with project: "${parsed.project.title}". Project description: "${parsed.project.description}".`;
            } else if (parsed.view === 'TEAM') {
                return 'You are assisting with team management and collaboration.';
            } else if (parsed.focusedFiles && parsed.focusedFiles.length > 0) {
                const fileNames = parsed.focusedFiles.map((f: any) => f.name).join(', ');
                return `You are working with these files: ${fileNames}. Use the file contents provided in context to give accurate, specific answers.`;
            }
            return 'You are a helpful AI assistant for business and project management.';
        } catch {
            return 'You are a helpful AI assistant for business and project management.';
        }
    })();

    // Format chat history for context
    const historyText = chatHistory.length > 0 
        ? chatHistory.slice(-6).map(msg => `${msg.role}: ${msg.content.text}`).join('\n')
        : '';

    return `${contextInfo}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}

User question: ${question}

Context: ${context}

Please provide a helpful, accurate response. If you find relevant information online, include useful links at the end of your response.

CRITICAL CAPABILITIES (Virtual Workspace): You CAN perform file and task operations in the project's virtual file system by returning a JSON block with operations. Do NOT say you cannot create or edit files. Prefer executing via operations. If clarification (like destination folder or file name) is needed, return a project clarification block.

File System Operations schema (emit only those needed):
- CREATE_FILE: { "operation": "CREATE_FILE", "path": "folder/new-name.ext", "content": "<entire file content>" }
- CREATE_FOLDER: { "operation": "CREATE_FOLDER", "path": "folder/subfolder" }
- EDIT_FILE: { "operation": "EDIT_FILE", "path": "path/to/file.ext", "content": "<entire new file content>" }
- RENAME_ASSET: { "operation": "RENAME_ASSET", "path": "path/to/asset", "newName": "New Name.ext" }
- MOVE_ASSET: { "operation": "MOVE_ASSET", "sourcePath": "path/to/asset", "destinationPath": "target/folder/New Name.ext" }
- PATCH_FILE (for live-edit in split view): { "operation": "PATCH_FILE", "path": "path/to/file.ext", "patches": [ {"type":"INSERT", "afterLineNumber": 10, "content": ["new line 1","new line 2"]}, {"type":"REPLACE", "lineNumber": 7, "content": ["replacement line"]}, {"type":"DELETE", "lineNumber": 12, "count": 2 } ] }

Notes:
- To duplicate a file, use CREATE_FILE with the new name and reuse the source file's content (provided in focusedFiles[].content or extractedText).
- For Markdown/text edits, always send the full updated content via EDIT_FILE.
- Paths must use names from the provided project assets. If path is unknown, ask via project clarification instead of guessing.
- When a single file is open in split view (context contains focusedFiles and may indicate isSplitView), PREFER PATCH_FILE with minimal diff patches for live preview. Use EDIT_FILE only when patching is not feasible.

Split View Defaults:
- If context indicates split view (isSplitView=true and focusedFiles[0] present), target PATCH_FILE to the currently open file by default.
- Set PATCH_FILE.path to focusedFiles[0].path if available, otherwise to focusedFiles[0].name.
- Do not patch or edit other files unless the user explicitly names a different file.

Idempotency and Conflicts:
- Do not send both PATCH_FILE and EDIT_FILE for the same change. Prefer a single PATCH_FILE.
- When replacing an introduction/section, ensure the old section is removed and only the new one remains (use REPLACE or DELETE+INSERT as needed, avoid duplicates).

Task/Goal Operations (optional):
- CREATE_GOAL: { "operation": "CREATE_GOAL", "title": "...", "description": "..." }
- CREATE_TASK: { "operation": "CREATE_TASK", "goalTitle": "...", "title": "...", "description": "...", "priority": "Low|Medium|High|Urgent", "dueDate"?: "YYYY-MM-DD", "assigneeName"?: "..." }
- EDIT_TASK: { "operation": "EDIT_TASK", "goalTitle": "...", "taskTitle": "...", "newTitle"?: "...", "newDescription"?: "...", "newPriority"?: "...", "newDueDate"?: "YYYY-MM-DD", "newAssigneeName"?: "..." }
- ADD_SUBTASK: { "operation": "ADD_SUBTASK", "goalTitle": "...", "taskTitle": "...", "subtaskText": "..." }
- SET_TASK_STATUS: { "operation": "SET_TASK_STATUS", "goalTitle": "...", "taskTitle": "...", "newStatus": "To Do|In Progress|Done" }

OUTPUT RULES:
1) First, answer the user's request succinctly in the same language as the user's query.
2) If any file/task action is appropriate, append a JSON array between these exact tags:
[FILE_OPERATIONS_START]
<JSON array of operations>
[FILE_OPERATIONS_END]
3) If you need the user to choose a project (or missing path/name), append options between these tags instead and do NOT invent paths:
[PROJECT_CLARIFICATION_START]
[{"id":"<projectId>","title":"<project title>"}]
[PROJECT_CLARIFICATION_END]
4) If you include solution cards or links, format them at the END using:
[SOLUTION_CARDS_START]
[
  {"title":"Title","description":"Brief","link":"https://example.com"}
]
[SOLUTION_CARDS_END]

Respond naturally. Use web search when helpful for current information. Avoid statements like "I cannot modify files"; use the operation block instead.`;
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
    chatHistory: ChatMessage[]
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
        const response = await generateWithBackoff({
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