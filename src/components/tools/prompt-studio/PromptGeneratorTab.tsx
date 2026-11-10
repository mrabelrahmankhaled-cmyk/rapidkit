"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Sparkles,
    Wand2,
    Copy,
    Check,
    Star,
    ArrowRight,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Bot,
    Cpu,
    Palette,
    Languages,
    Layers,
    Gauge,
    Info,
    Lock,
    FileText,
    UserCheck,
    Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    generatePrompt,
    type GeneratorTargetModel,
    type GeneratorDomain,
    type PromptGenerationResult
} from "@/lib/promptGenerator";
import { type DecomposedPrompt } from "@/lib/promptOptimizer";

export interface PromptGeneratorTabProps {
    rawInput: string;
    onRawInputChange: (value: string) => void;
    targetModel: GeneratorTargetModel;
    onTargetModelChange: (model: GeneratorTargetModel) => void;
    domain: GeneratorDomain | "auto";
    onDomainChange: (domain: GeneratorDomain | "auto") => void;
    language: string;
    onLanguageChange: (language: string) => void;
    includeBestPractices: boolean;
    onIncludeBestPracticesChange: (include: boolean) => void;
    hasGenerated: boolean;
    onHasGeneratedChange: (generated: boolean) => void;
    onCopyPrompt: (
        formattedPrompt: string,
        fields: DecomposedPrompt,
        model: GeneratorTargetModel
    ) => Promise<boolean> | boolean;
    onSaveToFavorites: (formattedPrompt: string, fields: DecomposedPrompt, model: GeneratorTargetModel) => void;
    onSendToBuilder: (fields: DecomposedPrompt) => void;
    onSendToOptimizer: (formattedPrompt: string) => void;
}

interface ModelSelectorOption {
    id: GeneratorTargetModel;
    name: string;
    tag: string;
    icon: typeof Bot;
    activeBorder: string;
    activeBg: string;
    description: string;
}

const GENERATOR_MODEL_OPTIONS: ModelSelectorOption[] = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        tag: "OpenAI",
        icon: Bot,
        activeBorder: "border-emerald-500/50",
        activeBg: "bg-emerald-500/10 text-emerald-300",
        description: "Clean Markdown sections (### Role, ### Task, ### Context, ### Output Format).",
    },
    {
        id: "claude",
        name: "Claude",
        tag: "Anthropic",
        icon: Cpu,
        activeBorder: "border-amber-500/50",
        activeBg: "bg-amber-500/10 text-amber-300",
        description: "Semantic XML tags (<role>, <task>, <context_and_constraints>, <output_format>).",
    },
    {
        id: "gemini",
        name: "Gemini",
        tag: "Google",
        icon: Sparkles,
        activeBorder: "border-cyan-500/50",
        activeBg: "bg-cyan-500/10 text-cyan-300",
        description: "Structured directive headings optimized for Google Gemini.",
    },
    {
        id: "midjourney",
        name: "Midjourney",
        tag: "Image AI",
        icon: Palette,
        activeBorder: "border-purple-500/50",
        activeBg: "bg-purple-500/10 text-purple-300",
        description: "Visual synthesis (/imagine prompt:) for artistic scenes, lighting, and mediums.",
    },
];

const DOMAIN_OPTIONS: Array<{ value: GeneratorDomain | "auto"; label: string }> = [
    { value: "auto", label: "✨ Auto Detect (Recommended)" },
    { value: "code", label: "💻 Software & Code" },
    { value: "seo", label: "🔍 SEO & Content Strategy" },
    { value: "sales", label: "📧 Sales & Outbound" },
    { value: "marketing", label: "📣 Marketing & Copywriting" },
    { value: "writing", label: "✍️ Writing & Editing" },
    { value: "general", label: "🧭 General Task" },
];

const OUTPUT_LANGUAGES = [
    { code: "English", label: "English" },
    { code: "Arabic", label: "Arabic (العربية)" },
    { code: "Spanish", label: "Spanish (Español)" },
    { code: "French", label: "French (Français)" },
    { code: "German", label: "German (Deutsch)" },
    { code: "Japanese", label: "Japanese (日本語)" },
    { code: "Portuguese", label: "Portuguese (Português)" },
    { code: "Chinese", label: "Chinese (中文)" },
];

const QUICK_STARTERS = [
    {
        label: "React Dashboard",
        text: "Create a React dashboard with authentication and role-based access control",
        model: "chatgpt" as GeneratorTargetModel,
    },
    {
        label: "Go API Optimization",
        text: "Optimize a Go API and improve goroutine performance under high concurrency",
        model: "claude" as GeneratorTargetModel,
    },
    {
        label: "SaaS Cold Email",
        text: "Write a cold email for a SaaS product targeting B2B engineering leaders",
        model: "chatgpt" as GeneratorTargetModel,
    },
    {
        label: "Arabic SEO Outline",
        text: "انشئ خطة سيو وكلمات مفتاحية لموقع تجارة إلكترونية يستهدف الشركات",
        model: "gemini" as GeneratorTargetModel,
    },
    {
        label: "Midjourney Scene",
        text: "A cinematic futuristic city at night, neon lights, rainy streets",
        model: "midjourney" as GeneratorTargetModel,
    },
];

export function PromptGeneratorTab({
    rawInput,
    onRawInputChange,
    targetModel,
    onTargetModelChange,
    domain,
    onDomainChange,
    language,
    onLanguageChange,
    includeBestPractices,
    onIncludeBestPracticesChange,
    hasGenerated,
    onHasGeneratedChange,
    onCopyPrompt,
    onSaveToFavorites,
    onSendToBuilder,
    onSendToOptimizer,
}: PromptGeneratorTabProps) {
    const [inputError, setInputError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copyFailed, setCopyFailed] = useState(false);
    const [favoriteSaved, setFavoriteSaved] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);

    const isInputEmpty = rawInput.trim().length === 0;

    // Deterministic generation result computed whenever hasGenerated is active
    const generationResult: PromptGenerationResult | null = useMemo(() => {
        if (!hasGenerated || isInputEmpty) {
            return null;
        }
        return generatePrompt(rawInput, {
            targetModel,
            domain,
            responseLanguage: targetModel === "midjourney" ? undefined : language,
            includeBestPractices,
        });
    }, [hasGenerated, isInputEmpty, rawInput, targetModel, domain, language, includeBestPractices]);

    const handleGenerate = useCallback(() => {
        if (rawInput.trim().length === 0) {
            setInputError("Please describe what you want the AI to do before clicking Generate.");
            onHasGeneratedChange(false);
            return;
        }
        setInputError(null);
        setIsGenerating(true);
        onHasGeneratedChange(true);
        setTimeout(() => setIsGenerating(false), 120);
    }, [rawInput, onHasGeneratedChange]);

    const handleReset = useCallback(() => {
        onRawInputChange("");
        onDomainChange("auto");
        onHasGeneratedChange(false);
        setInputError(null);
        setShowBreakdown(false);
    }, [onRawInputChange, onDomainChange, onHasGeneratedChange]);

    const handleCopy = useCallback(() => {
        if (!generationResult || !generationResult.formattedPrompt) return;
        Promise.resolve(onCopyPrompt(generationResult.formattedPrompt, generationResult.fields, targetModel))
            .catch(() => false)
            .then((ok) => {
                if (ok) {
                    setCopyFailed(false);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    setCopied(false);
                    setCopyFailed(true);
                    setTimeout(() => setCopyFailed(false), 4000);
                }
            });
    }, [generationResult, onCopyPrompt, targetModel]);

    const handleFavorite = useCallback(() => {
        if (!generationResult || !generationResult.formattedPrompt) return;
        onSaveToFavorites(generationResult.formattedPrompt, generationResult.fields, targetModel);
        setFavoriteSaved(true);
        setTimeout(() => setFavoriteSaved(false), 2000);
    }, [generationResult, onSaveToFavorites, targetModel]);

    const handleSendToBuilderClick = useCallback(() => {
        if (!generationResult) return;
        // If user is on Midjourney with a rejected non-visual task, compute standard text fields so nothing is lost
        if (targetModel === "midjourney" && !generationResult.formattedPrompt) {
            const fallbackTextResult = generatePrompt(rawInput, {
                targetModel: "chatgpt",
                domain,
                responseLanguage: language,
                includeBestPractices,
            });
            onTargetModelChange("chatgpt");
            onSendToBuilder(fallbackTextResult.fields);
            return;
        }
        onSendToBuilder(generationResult.fields);
    }, [
        generationResult,
        targetModel,
        rawInput,
        domain,
        language,
        includeBestPractices,
        onTargetModelChange,
        onSendToBuilder,
    ]);

    const handleOptimizeClick = useCallback(() => {
        if (!generationResult || !generationResult.formattedPrompt) return;
        onSendToOptimizer(generationResult.formattedPrompt);
    }, [generationResult, onSendToOptimizer]);

    const activeModelInfo =
        GENERATOR_MODEL_OPTIONS.find((m) => m.id === targetModel) || GENERATOR_MODEL_OPTIONS[0];

    const isMidjourneyDeclined =
        Boolean(generationResult) &&
        targetModel === "midjourney" &&
        !generationResult?.formattedPrompt &&
        Boolean(generationResult?.validationMessage);

    const formattedText = generationResult?.formattedPrompt || "";
    const wordCount = useMemo(() => {
        const trimmed = formattedText.trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [formattedText]);

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ─── Hero Entry Banner ──────────────────────────────────── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="relative z-10 max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span>Natural Language Prompt Generator • 100% Client-Side</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Describe What You Need in Plain Language
                    </h2>

                    <p className="text-xs sm:text-sm text-[rgb(140,140,180)] leading-relaxed">
                        Write a sentence or two in English or Arabic, pick your target AI model, and generate a structured, ready-to-use prompt. Your original objective is preserved verbatim while missing context is highlighted as optional placeholders.
                    </p>

                    {/* Quick Starter Chips */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-[rgb(110,110,145)]">
                            Quick examples:
                        </span>
                        {QUICK_STARTERS.map((starter) => (
                            <button
                                key={starter.label}
                                type="button"
                                onClick={() => {
                                    onRawInputChange(starter.text);
                                    onTargetModelChange(starter.model);
                                    setInputError(null);
                                    onHasGeneratedChange(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:border-violet-500/50 hover:bg-[rgb(24,24,36)] text-xs text-[rgb(160,160,195)] hover:text-white transition-all font-medium"
                            >
                                ⚡ {starter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Main Two-Column Generator Workspace ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ─── Left Column: Input & Configuration (5 cols) ────── */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="p-5 sm:p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-5">
                        {/* Step 1: Natural Language Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="generator-nl-input"
                                    className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5 text-violet-400" />
                                    <span>1. What do you want to create or solve?</span>
                                </label>
                                {rawInput && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="text-[11px] text-[rgb(120,120,150)] hover:text-rose-400 flex items-center gap-1 transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>

                            <textarea
                                id="generator-nl-input"
                                value={rawInput}
                                onChange={(e) => {
                                    onRawInputChange(e.target.value);
                                    if (inputError) setInputError(null);
                                }}
                                rows={5}
                                placeholder="e.g., Create a React dashboard with authentication, Write a cold email for a SaaS product, or اكتب خطة محتوى سيو لمتجر إلكتروني..."
                                className={cn(
                                    "w-full p-4 rounded-2xl bg-[rgb(16,16,24)] border text-white placeholder-[rgb(90,90,125)] text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 transition-all leading-relaxed custom-scrollbar",
                                    inputError
                                        ? "border-rose-500/60 focus:ring-rose-500/20"
                                        : "border-[rgb(38,38,58)] focus:border-violet-500 focus:ring-violet-500/20"
                                )}
                            />

                            {inputError && (
                                <p
                                    role="alert"
                                    className="text-xs text-rose-400 flex items-center gap-1.5 font-medium"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{inputError}</span>
                                </p>
                            )}
                        </div>

                        {/* Step 2: Target AI Model Selector */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                                <span>2. Target AI Model</span>
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                                {GENERATOR_MODEL_OPTIONS.map((model) => {
                                    const IconComp = model.icon;
                                    const isSelected = targetModel === model.id;
                                    return (
                                        <button
                                            key={model.id}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => onTargetModelChange(model.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all relative",
                                                isSelected
                                                    ? cn("bg-[rgb(18,18,28)] shadow-md", model.activeBorder)
                                                    : "bg-[rgb(14,14,22)] border-[rgb(38,38,58)] hover:border-[rgb(60,60,90)] hover:bg-[rgb(18,18,28)]"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    isSelected
                                                        ? cn(model.activeBg, "border border-current/20")
                                                        : "bg-[rgb(20,20,30)] text-[rgb(130,130,160)]"
                                                )}
                                            >
                                                <IconComp className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-xs font-bold text-white block truncate">
                                                    {model.name}
                                                </span>
                                                <span className="text-[10px] text-[rgb(110,110,150)] block truncate">
                                                    {model.tag}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-[11px] text-[rgb(125,125,160)] pl-0.5">
                                {activeModelInfo.description}
                            </p>
                        </div>

                        {/* Step 3: Domain & Output Language Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="generator-domain-select"
                                    className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5"
                                >
                                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                                    <span>3. Task Domain</span>
                                </label>
                                <select
                                    id="generator-domain-select"
                                    value={domain}
                                    onChange={(e) =>
                                        onDomainChange(e.target.value as GeneratorDomain | "auto")
                                    }
                                    className="w-full px-3 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-amber-500/50 cursor-pointer transition-all"
                                >
                                    {DOMAIN_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                            className="bg-[rgb(18,18,28)] text-white"
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="generator-language-select"
                                    className="text-xs font-bold text-[rgb(180,180,210)] flex items-center gap-1.5"
                                >
                                    <Languages className="w-3.5 h-3.5 text-rose-400" />
                                    <span>4. Output Language</span>
                                </label>
                                <select
                                    id="generator-language-select"
                                    value={language}
                                    onChange={(e) => onLanguageChange(e.target.value)}
                                    disabled={targetModel === "midjourney"}
                                    className={cn(
                                        "w-full px-3 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all",
                                        targetModel === "midjourney"
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                    )}
                                >
                                    {OUTPUT_LANGUAGES.map((lang) => (
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

                        {/* Optional Best-Practice Guidelines Toggle */}
                        {targetModel !== "midjourney" && (
                            <label className="flex items-center justify-between p-3 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(32,32,48)] cursor-pointer hover:border-violet-500/30 transition-all">
                                <div className="space-y-0.5 pr-2">
                                    <span className="text-xs font-bold text-white block">
                                        Include Domain Best-Practice Guidelines
                                    </span>
                                    <span className="text-[10px] text-[rgb(125,125,160)] block">
                                        Appends concise anti-hallucination and quality guardrails.
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={includeBestPractices}
                                    onChange={(e) => onIncludeBestPracticesChange(e.target.checked)}
                                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer shrink-0"
                                />
                            </label>
                        )}

                        {/* Primary Generate Button */}
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isInputEmpty || isGenerating}
                            className={cn(
                                "w-full py-3.5 px-6 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2",
                                isInputEmpty
                                    ? "bg-[rgb(24,24,36)] text-[rgb(100,100,135)] border border-[rgb(38,38,58)] cursor-not-allowed shadow-none"
                                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99]"
                            )}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>
                                {isGenerating ? "Structuring Prompt..." : "Generate Structured Prompt"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ─── Right Column: Generated Output & Transparency (7 cols) ─ */}
                <div className="lg:col-span-7 space-y-5">
                    {generationResult ? (
                        <div className="space-y-5">
                            {/* Case A: Midjourney Non-Visual Task Validation Banner */}
                            {isMidjourneyDeclined ? (
                                <div
                                    role="alert"
                                    className="p-6 rounded-3xl bg-[rgb(14,12,20)] border border-amber-500/40 shadow-2xl space-y-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                Not an Image-Generation Request
                                            </span>
                                            <h3 className="text-base font-extrabold text-white">
                                                Midjourney Requires a Visual Scene Description
                                            </h3>
                                            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                                                {generationResult.validationMessage}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preserved Original Intent Preview */}
                                    <div className="p-3.5 rounded-2xl bg-[rgb(10,10,16)] border border-[rgb(32,32,48)] space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                                            Your Preserved Request (Intact):
                                        </span>
                                        <p className="text-xs font-mono text-white whitespace-pre-wrap">
                                            {generationResult.normalizedInput}
                                        </p>
                                    </div>

                                    {/* One-Click Switch to Text Models */}
                                    <div className="space-y-2 pt-1">
                                        <span className="text-xs font-bold text-[rgb(175,175,210)] block">
                                            Switch to a text &amp; code AI model to format this request immediately:
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {(["chatgpt", "claude", "gemini"] as GeneratorTargetModel[]).map(
                                                (modelId) => {
                                                    const modelOpt = GENERATOR_MODEL_OPTIONS.find(
                                                        (m) => m.id === modelId
                                                    )!;
                                                    const IconComp = modelOpt.icon;
                                                    return (
                                                        <button
                                                            key={modelId}
                                                            type="button"
                                                            onClick={() => onTargetModelChange(modelId)}
                                                            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/25 flex items-center gap-2"
                                                        >
                                                            <IconComp className="w-3.5 h-3.5" />
                                                            <span>Switch to {modelOpt.name}</span>
                                                        </button>
                                                    );
                                                }
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleSendToBuilderClick}
                                                className="px-3.5 py-2 rounded-xl bg-[rgb(20,20,32)] hover:bg-[rgb(28,28,44)] border border-[rgb(45,45,68)] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                                            >
                                                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>Open in Builder (as ChatGPT)</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Case B: Successful Structured Prompt Output Card */
                                <div className="p-5 sm:p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl space-y-4">
                                    {/* Output Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[rgb(30,30,46)]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                                                Generated {activeModelInfo.name} Prompt
                                            </span>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                                                {generationResult.metadata.inferred.domain.toUpperCase()}{" "}
                                                {generationResult.metadata.inferred.domainSource ===
                                                "user_selected"
                                                    ? "(Selected)"
                                                    : "(Auto-Detected)"}
                                            </span>
                                        </div>

                                        <div className="text-[11px] font-mono text-[rgb(120,120,160)]">
                                            {wordCount} words • {formattedText.length} chars
                                        </div>
                                    </div>

                                    {/* Generated Prompt Textarea */}
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            aria-label="Generated Prompt Output"
                                            value={formattedText}
                                            className="w-full h-[290px] sm:h-[310px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,52)] text-emerald-200/95 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed shadow-inner custom-scrollbar select-all"
                                        />
                                    </div>

                                    {/* Optional Placeholders Notice (Compact & Clear) */}
                                    {generationResult.metadata.missingInformation.length > 0 && (
                                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    <span>
                                                        {generationResult.metadata.missingInformation.length}{" "}
                                                        Optional Placeholder
                                                        {generationResult.metadata.missingInformation.length > 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        Included (Not Mandatory)
                                                    </span>
                                                </span>
                                                <span className="text-[10px] text-amber-200/80">
                                                    Fill in Builder or replace before sending to AI
                                                </span>
                                            </div>
                                            <ul className="space-y-1 text-[11px] text-amber-100/90">
                                                {generationResult.metadata.missingInformation.map((item) => (
                                                    <li
                                                        key={item.placeholder}
                                                        className="flex flex-wrap items-start gap-x-2 gap-y-1"
                                                    >
                                                        <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] max-w-full break-all">
                                                            {item.placeholder}
                                                        </code>
                                                        <span className="text-[rgb(190,190,220)] min-w-0 break-words">
                                                            {item.reason}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {copyFailed && (
                                        <p role="status" className="text-xs text-amber-300 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                Your browser blocked clipboard access. Select the prompt text above and copy it manually (Ctrl/Cmd+C).
                                            </span>
                                        </p>
                                    )}

                                    {/* Primary & Cross-Tool Result Actions */}
                                    <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className={cn(
                                                "py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5",
                                                copied
                                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25"
                                            )}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : copyFailed ? (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>Copy blocked</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy Prompt</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSendToBuilderClick}
                                            className="py-2.5 px-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(42,42,64)] hover:border-cyan-500/50 hover:bg-[rgb(24,24,38)] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                            title="Edit individual sections and fill variables in the Builder"
                                        >
                                            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                                            <span>Send to Builder</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleOptimizeClick}
                                            className="py-2.5 px-3.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(42,42,64)] hover:border-violet-500/50 hover:bg-[rgb(24,24,38)] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                            title="Inspect RTCF completeness score and suggestions in the Optimizer"
                                        >
                                            <Gauge className="w-3.5 h-3.5 text-violet-400" />
                                            <span>Optimize Prompt</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleFavorite}
                                            className={cn(
                                                "py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                                                favoriteSaved
                                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                                    : "bg-[rgb(18,18,28)] border-[rgb(42,42,64)] hover:border-amber-500/40 text-white"
                                            )}
                                        >
                                            <Star
                                                className={cn(
                                                    "w-3.5 h-3.5 text-amber-400",
                                                    favoriteSaved && "fill-amber-400"
                                                )}
                                            />
                                            <span>{favoriteSaved ? "Saved to Favorites" : "Save to Favorites"}</span>
                                        </button>
                                    </div>

                                    {/* Progressive Disclosure: Transparent Breakdown Panel */}
                                    <div className="pt-2 border-t border-[rgb(28,28,44)]">
                                        <button
                                            type="button"
                                            aria-expanded={showBreakdown}
                                            onClick={() => setShowBreakdown(!showBreakdown)}
                                            className="w-full flex items-center justify-between py-1.5 text-xs font-semibold text-[rgb(150,150,190)] hover:text-white transition-colors"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                                                <span>
                                                    Prompt Transparency Breakdown (User Facts vs. Inferred vs. Optional)
                                                </span>
                                            </span>
                                            {showBreakdown ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </button>

                                        {showBreakdown && (
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
                                                {/* 1. Original User Intent & Facts */}
                                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-emerald-500/25 space-y-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        <span>1. User-Provided Facts (Preserved)</span>
                                                    </span>
                                                    <p className="text-[11px] text-white font-mono break-words">
                                                        &ldquo;{generationResult.metadata.userProvided.rawIntent}&rdquo;
                                                    </p>
                                                    <div className="text-[11px] text-[rgb(150,150,185)] space-y-0.5 pt-1">
                                                        <div>
                                                            <strong>Detected Tech:</strong>{" "}
                                                            {generationResult.metadata.userProvided.detectedTech
                                                                .length > 0
                                                                ? generationResult.metadata.userProvided.detectedTech.join(
                                                                      ", "
                                                                  )
                                                                : "None specified"}
                                                        </div>
                                                        {generationResult.metadata.userProvided.detectedAudience && (
                                                            <div>
                                                                <strong>Audience:</strong>{" "}
                                                                {
                                                                    generationResult.metadata.userProvided
                                                                        .detectedAudience
                                                                }
                                                            </div>
                                                        )}
                                                        {generationResult.metadata.userProvided
                                                            .detectedProductOrOffer && (
                                                            <div>
                                                                <strong>Product / Offer:</strong>{" "}
                                                                {
                                                                    generationResult.metadata.userProvided
                                                                        .detectedProductOrOffer
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 2. Rule-Based Inferred Structure */}
                                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-cyan-500/25 space-y-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                                                        <UserCheck className="w-3 h-3" />
                                                        <span>2. Inferred Structure (Heuristic)</span>
                                                    </span>
                                                    <div className="text-[11px] text-[rgb(175,175,210)] space-y-1">
                                                        <div>
                                                            <strong>Domain:</strong>{" "}
                                                            {generationResult.metadata.inferred.domain} (
                                                            {generationResult.metadata.inferred.domainSource.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                            )
                                                        </div>
                                                        <div>
                                                            <strong>Input Language:</strong>{" "}
                                                            {generationResult.metadata.inferred.inputLanguage.toUpperCase()}
                                                        </div>
                                                        {generationResult.metadata.inferred.inferredRole && (
                                                            <div>
                                                                <strong>Suggested Persona:</strong>{" "}
                                                                {generationResult.metadata.inferred.inferredRole}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 3. Generic Best-Practice Additions */}
                                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-violet-500/25 space-y-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 block">
                                                        3. Generic Best-Practice Guardrails
                                                    </span>
                                                    {generationResult.metadata.genericBestPractices.length > 0 ? (
                                                        <ul className="list-disc list-inside text-[11px] text-[rgb(175,175,210)] space-y-1">
                                                            {generationResult.metadata.genericBestPractices.map(
                                                                (bp, i) => (
                                                                    <li key={i}>{bp}</li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[11px] text-[rgb(125,125,160)]">
                                                            None added (disabled or already supplied by user).
                                                        </p>
                                                    )}
                                                </div>

                                                {/* 4. Missing Information / Optional Placeholders */}
                                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-amber-500/25 space-y-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                                                        4. Optional Placeholders
                                                    </span>
                                                    {generationResult.metadata.missingInformation.length > 0 ? (
                                                        <ul className="space-y-1 text-[11px] text-[rgb(175,175,210)]">
                                                            {generationResult.metadata.missingInformation.map(
                                                                (m) => (
                                                                    <li key={m.placeholder}>
                                                                        <code className="text-amber-300 font-mono">
                                                                            {m.placeholder}
                                                                        </code>{" "}
                                                                        ({m.targetField})
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[11px] text-emerald-300">
                                                            No missing placeholders required.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Initial Empty State Before Generation */
                        <div className="p-12 text-center rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5 max-w-md mx-auto">
                                <h3 className="text-sm font-bold text-white">
                                    Describe Your Task &amp; Click Generate
                                </h3>
                                <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                    Type a brief description on the left or pick a quick example above. The generator will assemble a structured prompt tailored to{" "}
                                    <strong className="text-white">{activeModelInfo.name}</strong> without altering your core intent.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Deterministic Transparency Footer ──────────────────── */}
            <div className="p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(30,30,46)] flex items-center gap-3 text-xs text-[rgb(130,130,165)]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                    <strong>100% Client-Side Deterministic Engine:</strong> Prompts are structured locally in your browser using rule-based templates and domain heuristics. No external AI APIs are called and your text never leaves your device.
                </span>
            </div>
        </div>
    );
}
