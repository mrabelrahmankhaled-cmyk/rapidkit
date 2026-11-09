"use client";

import { useState, useMemo, useCallback } from "react";
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
    Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TargetModel = "chatgpt" | "claude" | "gemini" | "midjourney";

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
        task: "Create an exhaustive, high-ranking SEO content brief designed to satisfy search intent and capture top-3 rankings for the target primary keyword.",
        context: "Target audience: Technical practitioners and engineering managers. Search intent: Informational and comparative. Include secondary LSI keywords, H1/H2/H3 outline, internal linking suggestions, and FAQ schema recommendations.",
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

    const handleCopy = useCallback(() => {
        if (!constructedPrompt) return;
        navigator.clipboard.writeText(constructedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [constructedPrompt]);

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

            {/* ─── Quick Presets Bar (V1) ──────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[rgb(150,150,190)] flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                        <span>Niche Quick Presets</span>
                    </span>
                    <span className="text-[11px] text-[rgb(110,110,150)]">
                        Click to auto-populate framework
                    </span>
                </div>

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
                                className="w-full h-[340px] sm:h-[360px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-emerald-200/90 font-mono text-xs focus:outline-none resize-none leading-relaxed shadow-inner custom-scrollbar select-all"
                            />

                            {/* Floating Quick Action */}
                            <div className="absolute top-3 right-3">
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
                                    title="Copy structured prompt to clipboard"
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

                    {/* Bottom Primary Copy Bar */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!constructedPrompt}
                            className={cn(
                                "w-full py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2",
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
                                    <span>Copy {activeModelConfig.name} Prompt to Clipboard</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

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
