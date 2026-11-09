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
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    // ─── Framework State ─────────────────────────────────────────────
    const [role, setRole] = useState(PRESETS[0].role);
    const [task, setTask] = useState(PRESETS[0].task);
    const [context, setContext] = useState(PRESETS[0].context);
    const [outputFormat, setOutputFormat] = useState(PRESETS[0].outputFormat);
    const [language, setLanguage] = useState(PRESETS[0].language);
    const [activePreset, setActivePreset] = useState<string | null>("react-debugging");
    const [copied, setCopied] = useState(false);

    // ─── Real-Time Prompt Construction ───────────────────────────────
    const constructedPrompt = useMemo(() => {
        const sections: string[] = [];

        if (role.trim()) {
            sections.push(`### Role & Persona\n${role.trim()}`);
        }
        if (task.trim()) {
            sections.push(`### Task & Objective\n${task.trim()}`);
        }
        if (context.trim()) {
            sections.push(`### Context & Constraints\n${context.trim()}`);
        }
        if (outputFormat.trim()) {
            sections.push(`### Desired Output Format\n${outputFormat.trim()}`);
        }
        if (language.trim()) {
            sections.push(`### Response Language\nPlease provide the final response in ${language.trim()}.`);
        }

        return sections.join("\n\n");
    }, [role, task, context, outputFormat, language]);

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
                        {/* 1. Role / Persona */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-violet-400" />
                                <span>1. Role / Persona</span>
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => {
                                    setRole(e.target.value);
                                    setActivePreset(null);
                                }}
                                placeholder="e.g. Senior Principal React Engineer & Web Performance Architect"
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>

                        {/* 2. Task / Objective */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-cyan-400" />
                                <span>2. Task / Objective</span>
                            </label>
                            <textarea
                                value={task}
                                onChange={(e) => {
                                    setTask(e.target.value);
                                    setActivePreset(null);
                                }}
                                rows={3}
                                placeholder="e.g. Diagnose and resolve memory leaks and unneeded component re-renders..."
                                className="w-full p-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-cyan-500/50 resize-y leading-relaxed transition-all"
                            />
                        </div>

                        {/* 3. Context & Constraints */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                <span>3. Context &amp; Constraints</span>
                            </label>
                            <textarea
                                value={context}
                                onChange={(e) => {
                                    setContext(e.target.value);
                                    setActivePreset(null);
                                }}
                                rows={3}
                                placeholder="e.g. Next.js App Router, React 19, TypeScript strict mode. Avoid external libraries..."
                                className="w-full p-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-amber-500/50 resize-y leading-relaxed transition-all"
                            />
                        </div>

                        {/* Grid for Output Format and Language */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 4. Output Format */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>4. Output Format</span>
                                </label>
                                <input
                                    type="text"
                                    value={outputFormat}
                                    onChange={(e) => {
                                        setOutputFormat(e.target.value);
                                        setActivePreset(null);
                                    }}
                                    placeholder="e.g. Markdown table followed by code"
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
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all cursor-pointer"
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

                {/* ─── Right Column: Live Constructed Prompt Preview ─ */}
                <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl flex flex-col justify-between space-y-4 min-h-[580px]">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[rgb(30,30,46)]">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Live Constructed Prompt</span>
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
                                className="w-full h-[400px] sm:h-[420px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-emerald-200/90 font-mono text-xs focus:outline-none resize-none leading-relaxed shadow-inner custom-scrollbar select-all"
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
                                    <span>Copy Prompt to Clipboard</span>
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

