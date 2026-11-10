"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
    Sparkles,
    Copy,
    Check,
    RotateCcw,
    Languages,
    UserCheck,
    Target,
    ShieldAlert,
    FileText,
    Wand2,
    ExternalLink,
    Code,
    Search,
    Mail,
    AlertCircle,
    CheckCircle2,
    Bot,
    Palette,
    Cpu,
    Star,
    History,
    Download,
    Trash2,
    Clock,
    Variable,
    Bookmark,
    ChevronDown,
    ChevronUp,
    FolderHeart,
    Lock,
    Layers,
    Gauge,
    FlaskConical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptGeneratorTab } from "./prompt-studio/PromptGeneratorTab";
import { PromptLibraryTab } from "./prompt-studio/PromptLibraryTab";
import { PromptOptimizerTab } from "./prompt-studio/PromptOptimizerTab";
import { PromptLabTab } from "./prompt-studio/PromptLabTab";
import { PromptTemplate } from "@/data/promptTemplates";
import { DecomposedPrompt } from "@/lib/promptOptimizer";
import { type GeneratorDomain } from "@/lib/promptGenerator";

export type TargetModel = "chatgpt" | "claude" | "gemini" | "midjourney";
export type StudioTab = "generator" | "builder" | "optimizer" | "library" | "lab";

interface StudioTabItem {
    id: StudioTab;
    label: string;
    icon: typeof Wand2;
    badge?: string;
}

const STUDIO_TABS: StudioTabItem[] = [
    { id: "generator", label: "Generator", icon: Sparkles, badge: "Start" },
    { id: "builder", label: "Builder", icon: Wand2 },
    { id: "optimizer", label: "Optimizer", icon: Gauge, badge: "New" },
    { id: "library", label: "Library", icon: Layers, badge: "20" },
    { id: "lab", label: "Lab", icon: FlaskConical, badge: "Soon" },
];

interface ModelOption {
    id: TargetModel;
    name: string;
    tag: string;
    icon: typeof Bot;
    color: string;
    activeBorder: string;
    activeBg: string;
    description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        tag: "OpenAI",
        icon: Bot,
        color: "text-emerald-400",
        activeBorder: "border-emerald-500/50",
        activeBg: "bg-emerald-500/10 text-emerald-300",
        description: "Markdown sections with explicit directives and expected output criteria.",
    },
    {
        id: "claude",
        name: "Claude",
        tag: "Anthropic",
        icon: Cpu,
        color: "text-amber-400",
        activeBorder: "border-amber-500/50",
        activeBg: "bg-amber-500/10 text-amber-300",
        description: "Semantic XML-style tags optimized for nuanced contextual reasoning.",
    },
    {
        id: "gemini",
        name: "Gemini",
        tag: "Google",
        icon: Sparkles,
        color: "text-cyan-400",
        activeBorder: "border-cyan-500/50",
        activeBg: "bg-cyan-500/10 text-cyan-300",
        description: "Structured directive headings with explicit goals and output specifications.",
    },
    {
        id: "midjourney",
        name: "Midjourney",
        tag: "Image AI",
        icon: Palette,
        color: "text-purple-400",
        activeBorder: "border-purple-500/50",
        activeBg: "bg-purple-500/10 text-purple-300",
        description: "Visual synthesis with subject, art style, lighting, and parameter flags.",
    },
];

interface PromptPreset {
    id: string;
    name: string;
    category: string;
    icon: typeof Code;
    role: string;
    task: string;
    context: string;
    outputFormat: string;
    language: string;
}

const PRESETS: PromptPreset[] = [
    {
        id: "react-debugging",
        name: "React Debugging",
        category: "Developer",
        icon: Code,
        role: "Senior React & Frontend Performance Specialist",
        task: "Diagnose and resolve unexpected component re-renders, state synchronization bugs, and memory leaks in the provided React component.",
        context: "Targeting React 18/19 with strict hooks rules. Assume Next.js App Router and TypeScript. Provide minimal reproducible fixes and avoid legacy patterns.",
        outputFormat: "1. Root cause diagnosis\n2. Step-by-step fix with before/after diffs\n3. Verification test snippet using Vitest / React Testing Library",
        language: "English",
    },
    {
        id: "typescript-refactoring",
        name: "TypeScript Refactoring",
        category: "Developer",
        icon: Wand2,
        role: "Principal TypeScript Engineer & Type System Architect",
        task: "Refactor existing loosely-typed JavaScript / loose TypeScript code into strict, idiomatic, production-ready TypeScript.",
        context: "Enable 'strict: true' compiler options. Eliminate all 'any' and unvalidated type assertions ('as unknown as X'). Utilize branded types, generics, discriminated unions, and Zod runtime schema validation where appropriate.",
        outputFormat: "Refactored TypeScript code block with detailed JSDoc comments explaining type invariants, followed by a summary of eliminated runtime failure modes.",
        language: "English",
    },
    {
        id: "seo-content-brief",
        name: "SEO Content Brief",
        category: "Marketer",
        icon: Search,
        role: "Lead Technical SEO & Content Marketing Strategist",
        task: "Create an exhaustive, high-ranking SEO content brief for the target primary keyword: {{primary_keyword}}.",
        context: "Target audience: {{target_audience}}. Search intent: Informational and comparative. Include secondary LSI keywords, H1/H2/H3 outline, internal linking suggestions, and FAQ schema recommendations.",
        outputFormat: "Structured Markdown brief with suggested word counts per section, keyword integration checklist, and a ready-to-use FAQ schema JSON-LD block.",
        language: "English",
    },
    {
        id: "cold-email-sequence",
        name: "Cold Email Sequence",
        category: "Marketer",
        icon: Mail,
        role: "B2B SaaS Growth Copywriter & Outbound Sales Specialist",
        task: "Write a high-converting 3-part cold outbound email sequence for B2B tech decision-makers to book product demo calls.",
        context: "Value proposition: Automated CI/CD performance regression detection. Tone: Respectful, direct, conversational, zero corporate fluff. Subject lines under 6 words. Body copy under 90 words each. Single low-friction call-to-action.",
        outputFormat: "3 sequential email drafts (Email 1: Initial Pain Point Hook, Email 2: Social Proof & Metrics, Email 3: Breakup / Low-friction Question), each with Subject Line variants and Preview Text.",
        language: "English",
    },
];

const LANGUAGES = [
    { code: "English", label: "English" },
    { code: "Arabic", label: "Arabic (العربية)" },
    { code: "Spanish", label: "Spanish (Español)" },
    { code: "French", label: "French (Français)" },
    { code: "German", label: "German (Deutsch)" },
    { code: "Japanese", label: "Japanese (日本語)" },
    { code: "Portuguese", label: "Portuguese (Português)" },
    { code: "Chinese", label: "Chinese (中文)" },
];

export interface SavedPrompt {
    id: string;
    timestamp: number;
    title: string;
    model: TargetModel;
    role: string;
    task: string;
    context: string;
    outputFormat: string;
    language: string;
}

export function PromptStudioTool() {
    // ─── Framework & Target Model State ──────────────────────────────
    const [targetModel, setTargetModel] = useState<TargetModel>("chatgpt");
    const [role, setRole] = useState(PRESETS[0].role);
    const [task, setTask] = useState(PRESETS[0].task);
    const [context, setContext] = useState(PRESETS[0].context);
    const [outputFormat, setOutputFormat] = useState(PRESETS[0].outputFormat);
    const [language, setLanguage] = useState(PRESETS[0].language);
    const [activePreset, setActivePreset] = useState<string | null>("react-debugging");
    const [copied, setCopied] = useState(false);
    const [favoriteSaved, setFavoriteSaved] = useState(false);

    // ─── Phase 3: Retention State (History & Favorites) ──────────────
    const [history, setHistory] = useState<SavedPrompt[]>([]);
    const [favorites, setFavorites] = useState<SavedPrompt[]>([]);
    const [showMyPrompts, setShowMyPrompts] = useState(false);
    const [promptsTab, setPromptsTab] = useState<"favorites" | "history">("favorites");

    // ─── Phase 4 & 6: Modular Tabbed Architecture & Generator State ──
    const [activeMainTab, setActiveMainTab] = useState<StudioTab>("generator");
    const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});
    const [showVariableFiller, setShowVariableFiller] = useState(false);
    const [variablesApplied, setVariablesApplied] = useState(false);

    // ─── Phase 6: Natural Language Generator Persistent State ────────
    const [generatorInput, setGeneratorInput] = useState("");
    const [generatorDomain, setGeneratorDomain] = useState<GeneratorDomain | "auto">("auto");
    const [generatorIncludeBestPractices, setGeneratorIncludeBestPractices] = useState(true);
    const [generatorHasGenerated, setGeneratorHasGenerated] = useState(false);
    const [optimizerInitialPrompt, setOptimizerInitialPrompt] = useState("");
    const [optimizerSessionKey, setOptimizerSessionKey] = useState(0);

    // ─── LocalStorage Persistence ────────────────────────────────────
    useEffect(() => {
        queueMicrotask(() => {
            try {
                const savedHistory = localStorage.getItem("rapidkit_prompt_history");
                if (savedHistory) {
                    const parsed = JSON.parse(savedHistory);
                    if (Array.isArray(parsed)) {
                        setHistory(parsed.slice(0, 10));
                    }
                }
                const savedFavs = localStorage.getItem("rapidkit_prompt_favorites");
                if (savedFavs) {
                    const parsedFavs = JSON.parse(savedFavs);
                    if (Array.isArray(parsedFavs)) {
                        setFavorites(parsedFavs);
                    }
                }
            } catch (e) {
                console.error("Failed to load prompt storage", e);
            }
        });
    }, []);

    const saveHistoryToStorage = useCallback((items: SavedPrompt[]) => {
        setHistory(items);
        try {
            localStorage.setItem("rapidkit_prompt_history", JSON.stringify(items));
        } catch {
            // ignore
        }
    }, []);

    const saveFavoritesToStorage = useCallback((items: SavedPrompt[]) => {
        setFavorites(items);
        try {
            localStorage.setItem("rapidkit_prompt_favorites", JSON.stringify(items));
        } catch {
            // ignore
        }
    }, []);

    // ─── Real-Time Quality Checker Logic ─────────────────────────────
    const qualityReport = useMemo(() => {
        const roleFilled = role.trim().length > 0;
        const taskFilled = task.trim().length > 0;
        const contextFilled = context.trim().length > 0;
        const formatFilled = outputFormat.trim().length > 0;

        const issues: string[] = [];
        if (!roleFilled) issues.push("Missing Role: Define who the AI should act as.");
        if (!taskFilled) issues.push("Missing Task: State the exact objective.");
        if (!contextFilled) issues.push("Missing Context: Provide background or strict limits.");
        if (!formatFilled) issues.push("Missing Format: Specify how the output should look.");

        const filledCount = [roleFilled, taskFilled, contextFilled, formatFilled].filter(Boolean).length;
        const percentage = filledCount * 25;

        return {
            percentage,
            isComplete: filledCount === 4,
            issues,
            roleFilled,
            taskFilled,
            contextFilled,
            formatFilled,
        };
    }, [role, task, context, outputFormat]);

    // ─── Model-Specific Prompt Construction ──────────────────────────
    const constructedPrompt = useMemo(() => {
        const r = role.trim();
        const t = task.trim();
        const c = context.trim();
        const f = outputFormat.trim();
        const lang = language.trim();

        // 1. Midjourney: Visual synthesis without text RTCF markdown or conversational language
        if (targetModel === "midjourney") {
            const visualParts: string[] = [];
            if (r) visualParts.push(r);
            if (t) visualParts.push(t);
            if (c) visualParts.push(c);

            let base = visualParts.join(", ");
            if (f) {
                base = base ? `${base} ${f}` : f;
            }
            return base ? `/imagine prompt: ${base}` : "";
        }

        // 2. Claude: Semantic XML tags
        if (targetModel === "claude") {
            const sections: string[] = [];
            if (r) sections.push(`<role>\n${r}\n</role>`);
            if (t) sections.push(`<task>\n${t}\n</task>`);
            if (c) sections.push(`<context_and_constraints>\n${c}\n</context_and_constraints>`);
            if (f) sections.push(`<output_format>\n${f}\n</output_format>`);
            if (lang) sections.push(`<response_language>\nPlease provide the final response in ${lang}.\n</response_language>`);
            return sections.join("\n\n");
        }

        // 3. Gemini: Structured Directive Headings
        if (targetModel === "gemini") {
            const sections: string[] = [];
            if (r) sections.push(`**Primary Directive & Persona:**\n${r}`);
            if (t) sections.push(`**Task & Objectives:**\n${t}`);
            if (c) sections.push(`**Contextual Guidelines & Constraints:**\n${c}`);
            if (f) sections.push(`**Output Specification:**\n${f}`);
            if (lang) sections.push(`**Output Language:**\nPlease provide the final response in ${lang}.`);
            return sections.join("\n\n");
        }

        // 4. ChatGPT (Default): Clean Markdown Section Hierarchy
        const sections: string[] = [];
        if (r) sections.push(`### Role & Persona\n${r}`);
        if (t) sections.push(`### Task & Objective\n${t}`);
        if (c) sections.push(`### Context & Constraints\n${c}`);
        if (f) sections.push(`### Desired Output Format\n${f}`);
        if (lang) sections.push(`### Response Language\nPlease provide the final response in ${lang}.`);
        return sections.join("\n\n");
    }, [targetModel, role, task, context, outputFormat, language]);

    // ─── Bonus: Prompt Variables Detection ───────────────────────────
    const detectedVariables = useMemo(() => {
        const fullContent = `${role} ${task} ${context} ${outputFormat}`;
        const matches = fullContent.match(/\{\{([a-zA-Z0-9_ -]+)\}\}/g);
        if (!matches) return [];
        return Array.from(new Set(matches));
    }, [role, task, context, outputFormat]);

    // ─── Metrics ─────────────────────────────────────────────────────
    const charCount = constructedPrompt.length;
    const wordCount = useMemo(() => {
        const trimmed = constructedPrompt.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [constructedPrompt]);

    // ─── Handlers ────────────────────────────────────────────────────
    const handleApplyPreset = (preset: PromptPreset) => {
        setRole(preset.role);
        setTask(preset.task);
        setContext(preset.context);
        setOutputFormat(preset.outputFormat);
        setLanguage(preset.language);
        setActivePreset(preset.id);
    };

    const handleClearAll = () => {
        setRole("");
        setTask("");
        setContext("");
        setOutputFormat("");
        setLanguage("English");
        setActivePreset(null);
    };

    // Auto-save to History (capped at 10 items) and copy to clipboard
    const handleCopy = useCallback(() => {
        if (!constructedPrompt) return;
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(constructedPrompt).catch(() => {});
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Auto-save current prompt to localStorage history (max 10)
        const entry: SavedPrompt = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: role.trim() || task.trim().slice(0, 36) || `${targetModel.toUpperCase()} Prompt`,
            model: targetModel,
            role,
            task,
            context,
            outputFormat,
            language,
        };

        const updatedHistory = [entry, ...history.filter((h) => h.role !== role || h.task !== task)].slice(0, 10);
        saveHistoryToStorage(updatedHistory);
    }, [constructedPrompt, role, task, context, outputFormat, language, targetModel, history, saveHistoryToStorage]);

    // Save to Favorites (indefinite storage)
    const handleSaveToFavorites = () => {
        if (!constructedPrompt) return;

        const newFav: SavedPrompt = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            title: role.trim() || task.trim().slice(0, 36) || `${targetModel.toUpperCase()} Prompt`,
            model: targetModel,
            role,
            task,
            context,
            outputFormat,
            language,
        };

        const updatedFavs = [newFav, ...favorites.filter((f) => f.role !== role || f.task !== task)];
        saveFavoritesToStorage(updatedFavs);
        setFavoriteSaved(true);
        setTimeout(() => setFavoriteSaved(false), 2000);
    };

    // Restore a saved prompt into the builder
    const handleRestorePrompt = (item: SavedPrompt) => {
        setRole(item.role);
        setTask(item.task);
        setContext(item.context);
        setOutputFormat(item.outputFormat);
        setLanguage(item.language || "English");
        setTargetModel(item.model || "chatgpt");
        setActivePreset(null);
    };

    // Delete item from history
    const handleDeleteHistory = (id: string) => {
        const updated = history.filter((h) => h.id !== id);
        saveHistoryToStorage(updated);
    };

    // Clear entire history
    const handleClearHistory = () => {
        saveHistoryToStorage([]);
    };

    // Delete item from favorites
    const handleDeleteFavorite = (id: string) => {
        const updated = favorites.filter((f) => f.id !== id);
        saveFavoritesToStorage(updated);
    };

    // Export as .txt file
    const handleDownloadTxt = useCallback(() => {
        if (!constructedPrompt) return;
        const blob = new Blob([constructedPrompt], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rapidkit-prompt-${targetModel}-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [constructedPrompt, targetModel]);

    // ─── Phase 4: Template Selection & Variable Injection ────────────
    const handleSelectTemplate = useCallback((template: PromptTemplate) => {
        // Guard against silent data loss: preserve current work to history before loading
        if (role.trim() || task.trim()) {
            const currentDraft: SavedPrompt = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title: role.trim() || task.trim().slice(0, 36) || `${targetModel.toUpperCase()} Draft`,
                model: targetModel,
                role,
                task,
                context,
                outputFormat,
                language,
            };
            const filtered = history.filter((h) => h.role !== role || h.task !== task);
            saveHistoryToStorage([currentDraft, ...filtered].slice(0, 10));
        }

        setRole(template.role);
        setTask(template.task);
        setContext(template.context);
        setOutputFormat(template.outputFormat);
        setActivePreset(null);

        // Switch model only if user was on Midjourney and template is text-based (or vice-versa)
        if (template.recommendedModel && targetModel === "midjourney" && template.recommendedModel !== "midjourney") {
            setTargetModel(template.recommendedModel);
        }

        // Initialize template variables
        const initialVars: Record<string, string> = {};
        template.variables.forEach((v) => {
            initialVars[v] = "";
        });
        setVariableInputs(initialVars);
        setShowVariableFiller(true);

        // Switch to Builder tab
        setOptimizerInitialPrompt("");
        setActiveMainTab("builder");

        if (typeof window !== "undefined") {
            window.scrollTo({ top: 100, behavior: "smooth" });
        }
    }, [role, task, context, outputFormat, language, targetModel, history, saveHistoryToStorage]);

    // Send to Builder Handler from Optimizer or Generator (safe against destroying active draft)
    const handleLoadFromOptimizer = useCallback(
        (decomposed?: DecomposedPrompt, replaceAll = false) => {
            setOptimizerInitialPrompt("");
            // Guard against silent data loss: preserve current work to history before loading
            if (role.trim() || task.trim()) {
                const currentDraft: SavedPrompt = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    title: role.trim() || task.trim().slice(0, 36) || `${targetModel.toUpperCase()} Draft`,
                    model: targetModel,
                    role,
                    task,
                    context,
                    outputFormat,
                    language,
                };
                const filtered = history.filter((h) => h.role !== role || h.task !== task);
                saveHistoryToStorage([currentDraft, ...filtered].slice(0, 10));
            }

            if (decomposed && !replaceAll) {
                if (decomposed.role) setRole(decomposed.role);
                if (decomposed.task) setTask(decomposed.task);
                if (decomposed.context) setContext(decomposed.context);
                if (decomposed.outputFormat) setOutputFormat(decomposed.outputFormat);
                setActivePreset(null);
            } else if (decomposed) {
                setRole(decomposed.role);
                setTask(decomposed.task);
                setContext(decomposed.context);
                setOutputFormat(decomposed.outputFormat);
                setActivePreset(null);

                const fullContent = `${decomposed.role} ${decomposed.task} ${decomposed.context} ${decomposed.outputFormat}`;
                const matches = fullContent.match(/\{\{([^}]+)\}\}/g);
                if (matches && matches.length > 0) {
                    const nextVars: Record<string, string> = {};
                    Array.from(new Set(matches)).forEach((v) => {
                        nextVars[v] = "";
                    });
                    setVariableInputs(nextVars);
                    setShowVariableFiller(true);
                }
            }

            setActiveMainTab("builder");

            if (typeof window !== "undefined") {
                window.scrollTo({ top: 100, behavior: "smooth" });
            }
        },
        [role, task, context, outputFormat, language, targetModel, history, saveHistoryToStorage]
    );

    // Shared Copy & Auto-Save History Handler for Generator
    const handleCopyFromGenerator = useCallback(
        async (formattedPrompt: string, fields: DecomposedPrompt, model: TargetModel): Promise<boolean> => {
            if (!formattedPrompt) return false;
            let copiedOk = false;
            try {
                if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(formattedPrompt);
                    copiedOk = true;
                }
            } catch {
                copiedOk = false;
            }

            const entry: SavedPrompt = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title:
                    fields.role.trim() ||
                    fields.task.trim().slice(0, 36) ||
                    `${model.toUpperCase()} Prompt`,
                model,
                role: fields.role,
                task: fields.task,
                context: fields.context,
                outputFormat: fields.outputFormat,
                language,
            };

            const updatedHistory = [
                entry,
                ...history.filter((h) => h.role !== fields.role || h.task !== fields.task),
            ].slice(0, 10);
            saveHistoryToStorage(updatedHistory);
            return copiedOk;
        },
        [history, language, saveHistoryToStorage]
    );

    // Shared Save to Favorites Handler for Generator
    const handleFavoriteFromGenerator = useCallback(
        (formattedPrompt: string, fields: DecomposedPrompt, model: TargetModel) => {
            if (!formattedPrompt) return;

            const newFav: SavedPrompt = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                title:
                    fields.role.trim() ||
                    fields.task.trim().slice(0, 36) ||
                    `${model.toUpperCase()} Prompt`,
                model,
                role: fields.role,
                task: fields.task,
                context: fields.context,
                outputFormat: fields.outputFormat,
                language,
            };

            const updatedFavs = [
                newFav,
                ...favorites.filter((f) => f.role !== fields.role || f.task !== fields.task),
            ];
            saveFavoritesToStorage(updatedFavs);
        },
        [favorites, language, saveFavoritesToStorage]
    );

    // Send Generated Prompt to Optimizer Tab
    const handleSendToOptimizerFromGenerator = useCallback((formattedPrompt: string) => {
        if (!formattedPrompt.trim()) return;
        setOptimizerInitialPrompt(formattedPrompt);
        setOptimizerSessionKey((prev) => prev + 1);
        setActiveMainTab("optimizer");
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 100, behavior: "smooth" });
        }
    }, []);

    // Variable Quick-Fill Handler (safe against special characters like $, $$, $1)
    const handleApplyVariables = useCallback(() => {
        let nextRole = role;
        let nextTask = task;
        let nextContext = context;
        let nextFormat = outputFormat;

        Object.entries(variableInputs).forEach(([placeholder, value]) => {
            const trimmed = value.trim();
            if (trimmed) {
                const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
                // Use function replacement to prevent $1, $& pattern corruption
                nextRole = nextRole.replace(regex, () => trimmed);
                nextTask = nextTask.replace(regex, () => trimmed);
                nextContext = nextContext.replace(regex, () => trimmed);
                nextFormat = nextFormat.replace(regex, () => trimmed);
            }
        });

        setRole(nextRole);
        setTask(nextTask);
        setContext(nextContext);
        setOutputFormat(nextFormat);
        setVariablesApplied(true);
        setTimeout(() => setVariablesApplied(false), 2500);
    }, [variableInputs, role, task, context, outputFormat]);

    // WAI-ARIA Keyboard Navigation for Tabs (Left / Right / Home / End)
    const goToTab = (id: StudioTab) => {
        if (id !== "optimizer" && optimizerInitialPrompt) {
            setOptimizerInitialPrompt("");
            setOptimizerSessionKey((prev) => prev + 1);
        }
        setActiveMainTab(id);
    };

    const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            const nextIndex = (index + 1) % STUDIO_TABS.length;
            goToTab(STUDIO_TABS[nextIndex].id);
            const nextBtn = document.getElementById(`tab-${STUDIO_TABS[nextIndex].id}`);
            nextBtn?.focus();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            const prevIndex = (index - 1 + STUDIO_TABS.length) % STUDIO_TABS.length;
            goToTab(STUDIO_TABS[prevIndex].id);
            const prevBtn = document.getElementById(`tab-${STUDIO_TABS[prevIndex].id}`);
            prevBtn?.focus();
        } else if (e.key === "Home") {
            e.preventDefault();
            goToTab(STUDIO_TABS[0].id);
            const firstBtn = document.getElementById(`tab-${STUDIO_TABS[0].id}`);
            firstBtn?.focus();
        } else if (e.key === "End") {
            e.preventDefault();
            const lastIndex = STUDIO_TABS.length - 1;
            goToTab(STUDIO_TABS[lastIndex].id);
            const lastBtn = document.getElementById(`tab-${STUDIO_TABS[lastIndex].id}`);
            lastBtn?.focus();
        }
    };

    const activeModelConfig = MODEL_OPTIONS.find((m) => m.id === targetModel) || MODEL_OPTIONS[0];

    return (
        <div className="space-y-8">
            {/* ─── Hero Section ────────────────────────────────────── */}
            <div className="text-center space-y-3 pb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Role-Task-Context-Format Framework</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                    AI Prompt Studio
                </h1>
                <p className="text-sm sm:text-base text-[rgb(140,140,175)] max-w-2xl mx-auto">
                    Professional AI Prompts for Developers &amp; Marketers. Free to Use. No Signup Required.
                </p>
            </div>

            {/* ─── Studio Mode Navigation Tabs (Part 1) ────────────── */}
            <div
                role="tablist"
                aria-label="AI Prompt Power Studio Modes"
                className="flex flex-wrap sm:flex-nowrap items-center justify-center p-1.5 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-lg max-w-2xl mx-auto gap-1"
            >
                {STUDIO_TABS.map((tab, idx) => {
                    const isSelected = activeMainTab === tab.id;
                    const IconComp = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            role="tab"
                            type="button"
                            aria-selected={isSelected}
                            aria-controls={`panel-${tab.id}`}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => goToTab(tab.id)}
                            onKeyDown={(e) => handleTabKeyDown(e, idx)}
                            className={cn(
                                "flex-auto sm:flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                                isSelected
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                    : "text-[rgb(140,140,175)] hover:text-white hover:bg-[rgb(18,18,28)]"
                            )}
                        >
                            <IconComp className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span
                                    className={cn(
                                        "hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                                        isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-[rgb(22,22,34)] text-violet-300 border border-violet-500/30"
                                    )}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ─── Tab 0: Natural Language Generator Panel (Default) ─ */}
            {activeMainTab === "generator" && (
                <div
                    id="panel-generator"
                    role="tabpanel"
                    aria-labelledby="tab-generator"
                >
                    <PromptGeneratorTab
                        rawInput={generatorInput}
                        onRawInputChange={setGeneratorInput}
                        targetModel={targetModel}
                        onTargetModelChange={setTargetModel}
                        domain={generatorDomain}
                        onDomainChange={setGeneratorDomain}
                        language={language}
                        onLanguageChange={setLanguage}
                        includeBestPractices={generatorIncludeBestPractices}
                        onIncludeBestPracticesChange={setGeneratorIncludeBestPractices}
                        hasGenerated={generatorHasGenerated}
                        onHasGeneratedChange={setGeneratorHasGenerated}
                        onCopyPrompt={handleCopyFromGenerator}
                        onSaveToFavorites={handleFavoriteFromGenerator}
                        onSendToBuilder={(fields) => handleLoadFromOptimizer(fields, true)}
                        onSendToOptimizer={handleSendToOptimizerFromGenerator}
                    />
                </div>
            )}

            {/* ─── Tab 1: Builder Panel (Preserves Phase 1–3 Features) ── */}
            {activeMainTab === "builder" && (
                <div id="panel-builder" role="tabpanel" aria-labelledby="tab-builder" className="space-y-8 animate-in fade-in duration-150">
            {/* ─── Target AI Model Selector ────────────────────────── */}
            <div className="p-4 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                            Target AI Model
                        </span>
                        <span className="text-[11px] text-[rgb(120,120,160)] hidden sm:inline">
                            (Select model to adapt prompt formatting)
                        </span>
                    </div>
                    <span className="text-[10px] text-[rgb(100,100,140)] font-mono">
                        Prompt formatting profile only • No API key required
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {MODEL_OPTIONS.map((model) => {
                        const IconComp = model.icon;
                        const isSelected = targetModel === model.id;
                        return (
                            <button
                                key={model.id}
                                type="button"
                                onClick={() => setTargetModel(model.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all relative overflow-hidden",
                                    isSelected
                                        ? cn("bg-[rgb(18,18,28)] shadow-lg shadow-black/40", model.activeBorder)
                                        : "bg-[rgb(14,14,22)] border-[rgb(38,38,58)] hover:border-[rgb(60,60,90)] hover:bg-[rgb(18,18,28)]"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                        isSelected
                                            ? cn(model.activeBg, "border border-current/20")
                                            : "bg-[rgb(20,20,30)] text-[rgb(130,130,160)]"
                                    )}
                                >
                                    <IconComp className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-white truncate">
                                            {model.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[rgb(110,110,150)] truncate block">
                                        {model.tag}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-2.5 rounded-xl bg-[rgb(16,16,24)] border border-[rgb(30,30,46)] text-[11px] text-[rgb(130,130,165)] flex items-center gap-2">
                    <span className="font-semibold text-white shrink-0">
                        {activeModelConfig.name} Profile:
                    </span>
                    <span className="truncate">{activeModelConfig.description}</span>
                </div>
            </div>

            {/* ─── Quick Presets Bar & My Prompts Toggle ───────────── */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[rgb(150,150,190)] flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                        <span>Niche Quick Presets</span>
                    </span>

                    {/* My Prompts Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowMyPrompts(!showMyPrompts)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm",
                            showMyPrompts
                                ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                                : "bg-[rgb(16,16,24)] border-[rgb(38,38,58)] text-[rgb(150,150,190)] hover:text-white hover:border-violet-500/40"
                        )}
                    >
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>My Prompts</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[rgb(24,24,36)] text-white border border-[rgb(45,45,65)]">
                            {favorites.length + history.length}
                        </span>
                        {showMyPrompts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                {/* ─── Collapsible "My Prompts" Panel (Favorites & History) ── */}
                {showMyPrompts && (
                    <div className="p-5 rounded-3xl bg-[rgb(13,13,20)] border border-[rgb(45,45,70)] shadow-2xl space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-[rgb(30,30,46)]">
                            {/* Tabs */}
                            <div className="flex p-1 bg-[rgb(18,18,28)] rounded-xl border border-[rgb(38,38,58)] text-xs">
                                <button
                                    type="button"
                                    onClick={() => setPromptsTab("favorites")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all",
                                        promptsTab === "favorites"
                                            ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm"
                                            : "text-[rgb(140,140,170)] hover:text-white"
                                    )}
                                >
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span>Favorites ({favorites.length})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPromptsTab("history")}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all",
                                        promptsTab === "history"
                                            ? "bg-violet-600/20 border border-violet-500/40 text-violet-300 shadow-sm"
                                            : "text-[rgb(140,140,170)] hover:text-white"
                                    )}
                                >
                                    <History className="w-3.5 h-3.5 text-violet-400" />
                                    <span>History ({history.length}/10)</span>
                                </button>
                            </div>

                            {/* Clear History Button if on history tab */}
                            {promptsTab === "history" && history.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearHistory}
                                    className="text-[11px] text-[rgb(140,140,170)] hover:text-rose-400 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Clear History</span>
                                </button>
                            )}
                        </div>

                        {/* Favorites Content */}
                        {promptsTab === "favorites" && (
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {favorites.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-[rgb(110,110,145)] space-y-1">
                                        <FolderHeart className="w-6 h-6 mx-auto text-[rgb(80,80,110)] mb-1" />
                                        <p>No favorites saved yet.</p>
                                        <p className="text-[10px] text-[rgb(90,90,120)]">Click &quot;⭐ Favorite&quot; to save your go-to prompts locally in your browser (retained until browser cache is cleared).</p>
                                    </div>
                                ) : (
                                    favorites.map((fav) => (
                                        <div
                                            key={fav.id}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(35,35,50)] hover:border-violet-500/40 transition-all group"
                                        >
                                            <div className="truncate mr-3 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white truncate">{fav.title}</span>
                                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                                        {fav.model}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[rgb(120,120,150)] truncate max-w-md">
                                                    {fav.task || fav.context}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRestorePrompt(fav)}
                                                    className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-semibold transition-all border border-violet-500/30"
                                                    title="Load prompt into builder"
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteFavorite(fav.id)}
                                                    className="p-1.5 text-[rgb(110,110,140)] hover:text-rose-400 transition-colors"
                                                    title="Delete favorite"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* History Content */}
                        {promptsTab === "history" && (
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {history.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-[rgb(110,110,145)] space-y-1">
                                        <Clock className="w-6 h-6 mx-auto text-[rgb(80,80,110)] mb-1" />
                                        <p>No copy history yet.</p>
                                        <p className="text-[10px] text-[rgb(90,90,120)]">Clicking &quot;Copy Prompt&quot; will automatically save your last 10 prompts here.</p>
                                    </div>
                                ) : (
                                    history.map((hist) => (
                                        <div
                                            key={hist.id}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(35,35,50)] hover:border-violet-500/40 transition-all group"
                                        >
                                            <div className="truncate mr-3 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white truncate">{hist.title}</span>
                                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                                        {hist.model}
                                                    </span>
                                                    <span className="text-[10px] text-[rgb(100,100,130)] font-mono">
                                                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[rgb(120,120,150)] truncate max-w-md">
                                                    {hist.task || hist.context}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRestorePrompt(hist)}
                                                    className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white text-xs font-semibold transition-all border border-cyan-500/30"
                                                    title="Load prompt into builder"
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteHistory(hist.id)}
                                                    className="p-1.5 text-[rgb(110,110,140)] hover:text-rose-400 transition-colors"
                                                    title="Delete history entry"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Privacy & Storage Transparency Note */}
                        <div className="pt-2 border-t border-[rgb(25,25,38)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] text-[rgb(110,110,140)]">
                            <span className="flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-emerald-400/80 shrink-0" />
                                <span>100% Client-Side Privacy: Prompts are never sent to external servers or logged in analytics.</span>
                            </span>
                            <span className="text-[rgb(90,90,120)] font-mono">
                                Retained in browser until data is cleared
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {PRESETS.map((preset) => {
                        const IconComp = preset.icon;
                        const isSelected = activePreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleApplyPreset(preset)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all group",
                                    isSelected
                                        ? "bg-violet-600/15 border-violet-500/50 shadow-lg shadow-violet-500/10"
                                        : "bg-[rgb(14,14,22)] border-[rgb(38,38,58)] hover:border-violet-500/30 hover:bg-[rgb(18,18,28)]"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                        isSelected
                                            ? "bg-violet-500 text-white shadow-md shadow-violet-500/30"
                                            : "bg-[rgb(22,22,34)] text-[rgb(150,150,190)] group-hover:text-white"
                                    )}
                                >
                                    <IconComp className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-white truncate">
                                            {preset.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[rgb(120,120,160)] font-medium">
                                        {preset.category}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Main Workspace: Framework Builder + Live Preview ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* ─── Left Column: Framework Inputs (The Core Builder) ─ */}
                <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-[rgb(30,30,46)]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-violet-400" />
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                Framework Inputs
                            </h2>
                            {targetModel === "midjourney" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                                    Visual Mode
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Save to Favorites Button */}
                            <button
                                type="button"
                                onClick={handleSaveToFavorites}
                                disabled={!constructedPrompt}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                                    favoriteSaved
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                        : "bg-[rgb(18,18,28)] border-[rgb(45,45,65)] text-[rgb(150,150,190)] hover:text-amber-300 hover:border-amber-500/40"
                                )}
                                title="Save prompt to favorites (stored locally in browser until cleared)"
                            >
                                <Star className={cn("w-3.5 h-3.5 text-amber-400", favoriteSaved && "fill-amber-400")} />
                                <span>{favoriteSaved ? "Saved!" : "Favorite"}</span>
                            </button>

                            {/* Clear All */}
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[rgb(140,140,175)] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                title="Reset all inputs"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Clear All</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Role / Persona (or Visual Subject for Midjourney) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                                    <span>
                                        {targetModel === "midjourney"
                                            ? "1. Visual Subject & Concept (Role)"
                                            : "1. Role / Persona"}
                                    </span>
                                </span>
                                {qualityReport.roleFilled ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <span className="text-[10px] text-rose-400 font-medium">Required</span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setActivePreset(null);
                                }}
                                placeholder={
                                    targetModel === "midjourney"
                                        ? "e.g. A cyberpunk cybernetic investigator standing in a rain-soaked neon alley"
                                        : "e.g. Senior Principal React Engineer & Web Performance Architect"
                                }
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>

                        {/* 2. Task / Objective (or Art Style for Midjourney) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>
                                        {targetModel === "midjourney"
                                            ? "2. Art Style & Medium (Task)"
                                            : "2. Task / Objective"}
                                    </span>
                                </span>
                                {qualityReport.taskFilled ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <span className="text-[10px] text-rose-400 font-medium">Required</span>
                                )}
                            </label>
                            <textarea
                                value={task}
                                onChange={(e) => {
                                    setTask(e.target.value);
                                    setActivePreset(null);
                                }}
                                rows={3}
                                placeholder={
                                    targetModel === "midjourney"
                                        ? "e.g. Cinematic 35mm photograph, moody color grading, hyper-detailed photorealism"
                                        : "e.g. Diagnose and resolve memory leaks and unneeded component re-renders..."
                                }
                                className="w-full p-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed transition-all"
                            />
                        </div>

                        {/* 3. Context & Constraints (or Composition & Lighting for Midjourney) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                        {targetModel === "midjourney"
                                            ? "3. Composition & Lighting (Context)"
                                            : "3. Context & Constraints"}
                                    </span>
                                </span>
                                {qualityReport.contextFilled ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                    <span className="text-[10px] text-rose-400 font-medium">Required</span>
                                )}
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => {
                                    setContext(e.target.value);
                                    setActivePreset(null);
                                }}
                                rows={3}
                                placeholder={
                                    targetModel === "midjourney"
                                        ? "e.g. Volumetric neon rim lighting, golden hour reflection, wide-angle lens, octane render"
                                        : "e.g. Next.js App Router, React 19, TypeScript strict mode. Avoid external libraries..."
                                }
                                className="w-full p-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-amber-500/50 resize-y leading-relaxed transition-all"
                            />
                        </div>

                        {/* Grid for Output Format and Language */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 4. Output Format (or Parameters for Midjourney) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>
                                            {targetModel === "midjourney"
                                                ? "4. Parameters (Format)"
                                                : "4. Output Format"}
                                        </span>
                                    </span>
                                    {qualityReport.formatFilled ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <span className="text-[10px] text-rose-400 font-medium">Required</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={outputFormat}
                                    onChange={(e) => {
                                        setOutputFormat(e.target.value);
                                        setActivePreset(null);
                                    }}
                                    placeholder={
                                        targetModel === "midjourney"
                                            ? "e.g. --ar 16:9 --v 6.1 --style raw"
                                            : "e.g. Markdown table followed by code"
                                    }
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-xs text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>

                            {/* 5. Prompt Output Language */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5">
                                    <Languages className="w-3.5 h-3.5 text-rose-400" />
                                    <span>5. Prompt Output Language</span>
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        setActivePreset(null);
                                    }}
                                    disabled={targetModel === "midjourney"}
                                    className={cn(
                                        "w-full px-3.5 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all",
                                        targetModel === "midjourney" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                    )}
                                    title={targetModel === "midjourney" ? "Midjourney generates visual artwork using English image descriptions" : "Output Language"}
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option
                                            key={lang.code}
                                            value={lang.code}
                                            className="bg-[rgb(18,18,28)] text-white"
                                        >
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Right Column: Quality Checker + Live Preview ─ */}
                <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl flex flex-col justify-between space-y-4 min-h-[580px]">
                    <div className="space-y-4">
                        {/* ─── Real-Time Quality Checker ──────────────── */}
                        <div className="p-4 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                        {qualityReport.isComplete ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-amber-400" />
                                        )}
                                        <span>Framework Completeness</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-xs font-black font-mono px-2.5 py-0.5 rounded-full border",
                                            qualityReport.percentage === 100
                                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                                : qualityReport.percentage >= 50
                                                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                                : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                                        )}
                                    >
                                        {qualityReport.percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-[rgb(24,24,36)] overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-300 rounded-full",
                                        qualityReport.percentage === 100
                                            ? "bg-emerald-500"
                                            : qualityReport.percentage >= 75
                                            ? "bg-cyan-500"
                                            : qualityReport.percentage >= 50
                                            ? "bg-amber-500"
                                            : qualityReport.percentage > 0
                                            ? "bg-rose-500"
                                            : "bg-transparent"
                                    )}
                                    style={{ width: `${qualityReport.percentage}%` }}
                                />
                            </div>

                            {/* Actionable Feedback or Success State */}
                            {qualityReport.isComplete ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Prompt Framework Complete — All 4 core pillars defined.</span>
                                    </div>
                                    <p className="text-[10px] text-[rgb(110,110,140)] leading-tight">
                                        * Note: 100% score indicates all required framework pillars are populated; AI response quality also depends on clarity and model capabilities.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-semibold text-[rgb(160,160,190)] block mb-1">
                                        Actionable Recommendations ({qualityReport.issues.length} missing):
                                    </span>
                                    <ul className="space-y-1">
                                        {qualityReport.issues.map((issue) => (
                                            <li
                                                key={issue}
                                                className="text-[11px] text-amber-300/90 flex items-start gap-1.5"
                                            >
                                                <span className="text-amber-400 shrink-0">•</span>
                                                <span>{issue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* ─── Detected Variables & Quick-Fill Drawer ─── */}
                        {detectedVariables.length > 0 && (
                            <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/30 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 text-xs text-violet-200">
                                        <Variable className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-violet-300">
                                                {detectedVariables.length} Template Variable{detectedVariables.length > 1 ? "s" : ""} Detected:{" "}
                                            </span>
                                            <span className="font-mono text-[11px] text-white">
                                                {detectedVariables.join(", ")}
                                            </span>
                                            <p className="text-[10px] text-violet-300/80 mt-0.5">
                                                Fill variables below to inject your context directly into the prompt without manual searching.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowVariableFiller(!showVariableFiller)}
                                        className="text-[11px] font-semibold text-violet-300 hover:text-white px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-all shrink-0 border border-violet-500/30 flex items-center gap-1"
                                    >
                                        <span>{showVariableFiller ? "Hide Filler" : "Fill Variables"}</span>
                                        {showVariableFiller ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                </div>

                                {/* Quick-Fill Mini Form */}
                                {showVariableFiller && (
                                    <div className="pt-2 border-t border-violet-500/20 space-y-2.5 animate-in fade-in duration-150">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {detectedVariables.map((variable) => {
                                                const cleanLabel = variable.replace(/[{}]/g, "");
                                                return (
                                                    <div key={variable} className="space-y-1">
                                                        <label className="text-[10px] font-mono font-bold text-violet-300 block truncate">
                                                            {cleanLabel}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={variableInputs[variable] || ""}
                                                            onChange={(e) =>
                                                                setVariableInputs((prev) => ({
                                                                    ...prev,
                                                                    [variable]: e.target.value,
                                                                }))
                                                            }
                                                            placeholder={`e.g. ${cleanLabel}`}
                                                            className="w-full px-2.5 py-1.5 rounded-xl bg-[rgb(12,12,18)] border border-violet-500/30 focus:border-violet-400 focus:outline-none text-xs text-white placeholder-[rgb(100,100,130)]"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-[10px] text-[rgb(120,120,150)]">
                                                * Blank variables remain as placeholders
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleApplyVariables}
                                                className={cn(
                                                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md",
                                                    variablesApplied
                                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                        : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30"
                                                )}
                                            >
                                                {variablesApplied ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        <span>Variables Injected!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>Inject Variables into Prompt</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Live Constructed Prompt Preview ────────── */}
                        <div className="flex items-center justify-between pb-1 border-b border-[rgb(30,30,46)]">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Live Preview ({activeModelConfig.name})</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-[rgb(120,120,160)]">
                                <span>{wordCount} words</span>
                                <span>•</span>
                                <span>{charCount} chars</span>
                            </div>
                        </div>

                        {/* Read-Only Live Preview Textarea */}
                        <div className="relative">
                            <textarea
                                readOnly
                                value={constructedPrompt}
                                placeholder="Your structured prompt will appear here automatically as you type..."
                                className="w-full h-[320px] sm:h-[340px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-emerald-200/90 font-mono text-xs focus:outline-none resize-none leading-relaxed shadow-inner custom-scrollbar select-all"
                            />

                            {/* Floating Quick Action Buttons */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                {/* Download .txt */}
                                <button
                                    type="button"
                                    onClick={handleDownloadTxt}
                                    disabled={!constructedPrompt}
                                    className="p-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-[rgb(150,150,190)] hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-md"
                                    title="Download as .txt file"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* Copy Button */}
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!constructedPrompt}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-md",
                                        copied
                                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20"
                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-white hover:bg-[rgb(30,30,48)] hover:border-violet-500/50"
                                    )}
                                    title="Copy prompt to clipboard (auto-saves to History)"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-violet-400" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Primary Action Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!constructedPrompt}
                            className={cn(
                                "flex-grow py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2",
                                copied
                                    ? "bg-emerald-500 text-white shadow-emerald-500/25 scale-[1.01]"
                                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99]"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Prompt Copied to Clipboard!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copy {activeModelConfig.name} Prompt</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadTxt}
                            disabled={!constructedPrompt}
                            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] hover:border-cyan-500/50 hover:bg-[rgb(25,25,38)] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
                            title="Download prompt as .txt"
                        >
                            <Download className="w-4 h-4 text-cyan-400" />
                            <span>Download .txt</span>
                        </button>
                    </div>
                </div>
            </div>
            </div>
            )}

            {/* ─── Tab 2: Optimizer Panel ───────────────────────────── */}
            {activeMainTab === "optimizer" && (
                <div id="panel-optimizer" role="tabpanel" aria-labelledby="tab-optimizer">
                    <PromptOptimizerTab
                        key={optimizerSessionKey}
                        initialPrompt={optimizerInitialPrompt}
                        onNavigateToBuilder={handleLoadFromOptimizer}
                        onNavigateToLibrary={() => goToTab("library")}
                    />
                </div>
            )}

            {/* ─── Tab 3: Library Panel ─────────────────────────────── */}
            {activeMainTab === "library" && (
                <div id="panel-library" role="tabpanel" aria-labelledby="tab-library">
                    <PromptLibraryTab onSelectTemplate={handleSelectTemplate} />
                </div>
            )}

            {/* ─── Tab 4: Lab Panel ─────────────────────────────────── */}
            {activeMainTab === "lab" && (
                <div id="panel-lab" role="tabpanel" aria-labelledby="tab-lab">
                    <PromptLabTab
                        onNavigateToBuilder={() => setActiveMainTab("builder")}
                        onNavigateToLibrary={() => setActiveMainTab("library")}
                    />
                </div>
            )}

            {/* ─── Unobtrusive Bottom Affiliate Recommendations ──── */}
            <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[rgb(160,160,200)] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended Pro Platforms for Marketers &amp; Creators</span>
                    </span>
                    <span className="text-[10px] text-[rgb(100,100,140)]">
                        Partner Tools
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Semrush Recommendation */}
                    <div className="p-4 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white">Semrush SEO Suite</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-semibold">
                                    SEO &amp; Content
                                </span>
                            </div>
                            <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                Pair your AI content briefs with real Google search intent, keyword difficulty scores, and competitor backlink intelligence.
                            </p>
                        </div>
                        <a
                            href="https://semrush.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors pt-1"
                        >
                            <span>Explore Semrush Pro</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Beehiiv Recommendation */}
                    <div className="p-4 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white">beehiiv Newsletter Platform</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                                    Email Growth
                                </span>
                            </div>
                            <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                Deploy your high-converting AI email sequences and newsletter campaigns with built-in referral programs and native monetization.
                            </p>
                        </div>
                        <a
                            href="https://beehiiv.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-1"
                        >
                            <span>Explore beehiiv Platform</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
