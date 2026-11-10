"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Sparkles,
    Gauge,
    Check,
    X,
    Copy,
    RotateCcw,
    ArrowRight,
    Lock,
    AlertCircle,
    CheckCircle2,
    Sliders,
    Wand2,
    FileText,
    Diff as DiffIcon,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    optimizePrompt,
    OptimizationResult,
    DecomposedPrompt
} from "@/lib/promptOptimizer";

interface PromptOptimizerTabProps {
    onNavigateToBuilder: (decomposed?: DecomposedPrompt) => void;
    onNavigateToLibrary: () => void;
    initialPrompt?: string;
}

const SAMPLE_PROMPTS = [
    {
        label: "Bug Fix",
        text: "Fix memory leak and unexpected re-renders in my React component.",
    },
    {
        label: "Cold Outreach",
        text: "Write a cold email to book a demo call with enterprise VP of Engineering.",
    },
    {
        label: "SEO Content",
        text: "Create an SEO content outline for Next.js performance optimization.",
    },
];

export function PromptOptimizerTab({
    onNavigateToBuilder,
    initialPrompt = "",
}: PromptOptimizerTabProps) {
    const [rawPrompt, setRawPrompt] = useState(initialPrompt);
    const [result, setResult] = useState<OptimizationResult | null>(() => {
        return initialPrompt.trim() ? optimizePrompt(initialPrompt) : null;
    });
    const [acceptedIds, setAcceptedIds] = useState<Set<string>>(() => {
        if (!initialPrompt.trim()) return new Set<string>();
        const initialResult = optimizePrompt(initialPrompt);
        return new Set(initialResult.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id));
    });
    const [diffView, setDiffView] = useState<"clean" | "diff">("clean");
    const [copied, setCopied] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Run Optimization
    const handleAnalyze = useCallback(() => {
        const trimmed = rawPrompt.trim();
        if (!trimmed) {
            setValidationError("Please enter or paste a prompt above to analyze and optimize.");
            setResult(null);
            return;
        }

        setValidationError(null);
        const res = optimizePrompt(trimmed);
        setResult(res);

        // Pre-select recommended suggestions
        const defaultAccepted = new Set(res.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id));
        setAcceptedIds(defaultAccepted);
    }, [rawPrompt]);

    // Accept / Reject individual suggestion
    const handleToggleSuggestion = useCallback((id: string) => {
        setAcceptedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Accept all suggestions
    const handleAcceptAll = useCallback(() => {
        if (!result) return;
        setAcceptedIds(new Set(result.suggestions.map((s) => s.id)));
    }, [result]);

    // Reset suggestions to default recommendations
    const handleResetSuggestions = useCallback(() => {
        if (!result) return;
        setAcceptedIds(new Set(result.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id)));
    }, [result]);

    // Clear input
    const handleClear = useCallback(() => {
        setRawPrompt("");
        setResult(null);
        setAcceptedIds(new Set());
        setValidationError(null);
    }, []);

    // Current Optimized Prompt string
    const optimizedText = useMemo(() => {
        if (!result) return "";
        return result.buildOptimizedPrompt(acceptedIds);
    }, [result, acceptedIds]);

    // Diff Parts
    const diffParts = useMemo(() => {
        if (!result) return [];
        return result.getDiff(acceptedIds);
    }, [result, acceptedIds]);

    // Copy to clipboard
    const handleCopy = useCallback(() => {
        if (!optimizedText) return;
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(optimizedText).catch(() => {});
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [optimizedText]);

    // Send to Builder
    const handleSendToBuilder = useCallback(() => {
        if (!result) return;
        const decomposed = result.decomposePrompt(acceptedIds);
        onNavigateToBuilder(decomposed);
    }, [result, acceptedIds, onNavigateToBuilder]);

    const activeSuggestions = result ? result.suggestions : [];
    const score = result?.score;

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            {/* ─── Hero Header ────────────────────────────────────────── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="relative z-10 max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                        <Gauge className="w-3.5 h-3.5 text-violet-400" />
                        <span>Deterministic Heuristic Optimizer • 100% In-Browser</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        AI Prompt Optimizer Engine
                    </h2>

                    <p className="text-xs sm:text-sm text-[rgb(140,140,180)] leading-relaxed">
                        Transform rough prompts into structured, high-clarity instructions. The engine detects missing roles, clarifies ambiguous verbs, introduces domain-appropriate context placeholders, and enforces strict output formats without altering your original objective.
                    </p>

                    {/* Quick Sample Prompts */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-[rgb(110,110,145)]">
                            Try a sample:
                        </span>
                        {SAMPLE_PROMPTS.map((sample) => (
                            <button
                                key={sample.label}
                                type="button"
                                onClick={() => {
                                    setRawPrompt(sample.text);
                                    setValidationError(null);
                                    const res = optimizePrompt(sample.text);
                                    setResult(res);
                                    setAcceptedIds(new Set(res.suggestions.filter((s) => s.appliedByDefault).map((s) => s.id)));
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:border-violet-500/50 hover:bg-[rgb(24,24,36)] text-xs text-[rgb(160,160,195)] hover:text-white transition-all font-medium"
                            >
                                ⚡ {sample.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Two-Column Before / After Workspace ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ─── Left Column: Input & Suggestions (5 cols) ───────── */}
                <div className="lg:col-span-5 space-y-5">
                    {/* Input Area */}
                    <div className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-violet-400" />
                                <span>Original Prompt</span>
                            </span>
                            {rawPrompt && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-[11px] text-[rgb(120,120,150)] hover:text-rose-400 flex items-center gap-1 transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>

                        <div className="relative">
                            <textarea
                                value={rawPrompt}
                                onChange={(e) => {
                                    setRawPrompt(e.target.value);
                                    if (validationError) setValidationError(null);
                                }}
                                rows={7}
                                placeholder="Paste or type your draft prompt here (e.g. 'Fix memory leak in my React component' or 'Write a cold email to book demo calls')..."
                                className={cn(
                                    "w-full p-4 rounded-2xl bg-[rgb(16,16,24)] border text-white placeholder-[rgb(90,90,120)] text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 transition-all leading-relaxed custom-scrollbar",
                                    validationError
                                        ? "border-rose-500/60 focus:ring-rose-500/20"
                                        : "border-[rgb(38,38,58)] focus:border-violet-500 focus:ring-violet-500/20"
                                )}
                            />
                        </div>

                        {validationError && (
                            <p className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{validationError}</span>
                            </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-[rgb(120,120,150)] pt-1">
                            <span>
                                {rawPrompt.length} chars •{" "}
                                {rawPrompt.trim() ? rawPrompt.trim().split(/\s+/).length : 0} words
                            </span>
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Analyze &amp; Optimize</span>
                            </button>
                        </div>
                    </div>

                    {/* Improvement Suggestions Panel */}
                    {result && (
                        <div className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-[rgb(30,30,46)]">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Improvement Suggestions ({activeSuggestions.length})</span>
                                    </h3>
                                    <p className="text-[11px] text-[rgb(130,130,165)] mt-0.5">
                                        Accept or reject additions individually.
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={handleAcceptAll}
                                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition-colors"
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetSuggestions}
                                        className="px-2 py-1 rounded-lg bg-[rgb(18,18,28)] hover:bg-[rgb(24,24,36)] text-[rgb(140,140,175)] hover:text-white border border-[rgb(38,38,58)] transition-colors"
                                        title="Reset to default recommendations"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {activeSuggestions.length === 0 ? (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                    <span>
                                        This prompt already satisfies all core RTCF components. No missing sections detected.
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                                    {activeSuggestions.map((sug) => {
                                        const isAccepted = acceptedIds.has(sug.id);

                                        return (
                                            <div
                                                key={sug.id}
                                                className={cn(
                                                    "p-3.5 rounded-2xl border transition-all space-y-2",
                                                    isAccepted
                                                        ? "bg-[rgb(16,16,24)] border-violet-500/40 shadow-sm"
                                                        : "bg-[rgb(14,14,20)] border-[rgb(30,30,46)] opacity-70"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span
                                                                className={cn(
                                                                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                                                    sug.type === "recommended"
                                                                        ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                                                                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                                                )}
                                                            >
                                                                {sug.category.toUpperCase()} • {sug.type}
                                                            </span>
                                                            <span className="text-xs font-bold text-white">
                                                                {sug.title}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-[rgb(130,130,165)] leading-relaxed">
                                                            {sug.explanation}
                                                        </p>
                                                    </div>

                                                    {/* Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleSuggestion(sug.id)}
                                                        className={cn(
                                                            "p-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1 text-xs font-bold",
                                                            isAccepted
                                                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                                                                : "bg-[rgb(20,20,30)] border-[rgb(40,40,60)] text-[rgb(140,140,170)] hover:text-white"
                                                        )}
                                                        title={isAccepted ? "Reject this addition" : "Accept this addition"}
                                                    >
                                                        {isAccepted ? (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                <span>Accepted</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="w-3.5 h-3.5 text-rose-400" />
                                                                <span>Ignored</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Proposed Text Snippet */}
                                                <div className="p-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(25,25,38)] text-[11px] font-mono text-[rgb(180,180,210)] whitespace-pre-wrap leading-relaxed">
                                                    {sug.proposedAddition}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── Right Column: Score, Output & Diff (7 cols) ────── */}
                <div className="lg:col-span-7 space-y-5">
                    {/* Score Card */}
                    {score && (
                        <div className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[rgb(140,140,180)] flex items-center gap-1.5">
                                        <Gauge className="w-3.5 h-3.5 text-violet-400" />
                                        <span>RTCF Completeness Score</span>
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span
                                            className={cn(
                                                "text-3xl sm:text-4xl font-extrabold tracking-tight",
                                                score.overall >= 75
                                                    ? "text-emerald-400"
                                                    : score.overall >= 50
                                                      ? "text-amber-400"
                                                      : "text-rose-400"
                                            )}
                                        >
                                            {score.overall}
                                        </span>
                                        <span className="text-sm font-semibold text-[rgb(110,110,145)]">
                                            / 100 Structural Points
                                        </span>
                                    </div>
                                </div>

                                {/* Component Badges */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                    <div
                                        className={cn(
                                            "p-2 rounded-xl border",
                                            score.role > 0
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                                : "bg-[rgb(18,18,26)] border-[rgb(35,35,50)] text-[rgb(110,110,140)]"
                                        )}
                                    >
                                        <div className="font-bold">Role</div>
                                        <div className="text-[10px] font-mono">{score.role}/25</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "p-2 rounded-xl border",
                                            score.task > 0
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                                : "bg-[rgb(18,18,26)] border-[rgb(35,35,50)] text-[rgb(110,110,140)]"
                                        )}
                                    >
                                        <div className="font-bold">Task</div>
                                        <div className="text-[10px] font-mono">{score.task}/25</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "p-2 rounded-xl border",
                                            score.context > 0
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                                : "bg-[rgb(18,18,26)] border-[rgb(35,35,50)] text-[rgb(110,110,140)]"
                                        )}
                                    >
                                        <div className="font-bold">Context</div>
                                        <div className="text-[10px] font-mono">{score.context}/25</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "p-2 rounded-xl border",
                                            score.format > 0
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                                : "bg-[rgb(18,18,26)] border-[rgb(35,35,50)] text-[rgb(110,110,140)]"
                                        )}
                                    >
                                        <div className="font-bold">Format</div>
                                        <div className="text-[10px] font-mono">{score.format}/25</div>
                                    </div>
                                </div>
                            </div>

                            {/* Missing elements indicators */}
                            {score.missingElements.length > 0 && (
                                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                                    <span className="font-bold flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Missing Structural Elements in Original Prompt:</span>
                                    </span>
                                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-200/90 pl-1">
                                        {score.missingElements.map((el) => (
                                            <li key={el}>{el}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Score Disclaimer */}
                            <p className="text-[10px] text-[rgb(110,110,140)] leading-relaxed">
                                * The score measures structural prompt completeness according to the RTCF framework. It does not measure or guarantee external AI model output quality.
                            </p>
                        </div>
                    )}

                    {/* Optimized Prompt Preview & Diff View */}
                    {result ? (
                        <div className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgb(30,30,46)]">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-violet-400" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                                        Optimized Prompt
                                    </span>
                                </div>

                                {/* View Mode Toggle (Clean vs Diff) */}
                                <div className="flex items-center gap-1 p-1 bg-[rgb(18,18,28)] rounded-xl border border-[rgb(38,38,58)] text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setDiffView("clean")}
                                        className={cn(
                                            "px-3 py-1 rounded-lg font-semibold transition-all",
                                            diffView === "clean"
                                                ? "bg-violet-600 text-white shadow-sm"
                                                : "text-[rgb(140,140,175)] hover:text-white"
                                        )}
                                    >
                                        Clean Preview
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDiffView("diff")}
                                        className={cn(
                                            "flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all",
                                            diffView === "diff"
                                                ? "bg-violet-600 text-white shadow-sm"
                                                : "text-[rgb(140,140,175)] hover:text-white"
                                        )}
                                    >
                                        <DiffIcon className="w-3 h-3" />
                                        <span>Visual Diff</span>
                                    </button>
                                </div>
                            </div>

                            {/* Content Display */}
                            {diffView === "clean" ? (
                                <div className="p-4 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(30,30,46)] min-h-[220px] max-h-[460px] overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm text-[rgb(210,210,235)] whitespace-pre-wrap leading-relaxed select-text">
                                    {optimizedText}
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(30,30,46)] min-h-[220px] max-h-[460px] overflow-y-auto custom-scrollbar font-mono text-xs sm:text-sm text-[rgb(210,210,235)] whitespace-pre-wrap leading-relaxed">
                                    {diffParts.map((part, idx) => {
                                        if (part.type === "added") {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/40 rounded px-1 py-0.5 font-bold"
                                                    title="Added by Optimizer"
                                                >
                                                    {part.value}
                                                </span>
                                            );
                                        }
                                        if (part.type === "removed") {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="bg-rose-500/20 text-rose-300 line-through rounded px-1 py-0.5"
                                                    title="Modified/Removed"
                                                >
                                                    {part.value}
                                                </span>
                                            );
                                        }
                                        return <span key={idx}>{part.value}</span>;
                                    })}
                                </div>
                            )}

                            {/* Summary of Meaningful Improvements */}
                            <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(30,30,46)] space-y-1.5 text-xs text-[rgb(140,140,175)]">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Summary of Applied Refinements ({acceptedIds.size}):</span>
                                </span>
                                <ul className="list-disc list-inside space-y-1 text-[11px] text-[rgb(170,170,205)] pl-1">
                                    {activeSuggestions
                                        .filter((s) => acceptedIds.has(s.id))
                                        .map((s) => (
                                            <li key={s.id}>
                                                <strong>{s.title}:</strong> {s.explanation}
                                            </li>
                                        ))}
                                    {acceptedIds.size === 0 && (
                                        <li className="list-none text-[rgb(120,120,150)]">
                                            No optional suggestions accepted. Retaining original user prompt verbatim.
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Action Buttons: Copy, Send to Builder */}
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="py-2.5 px-4 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(40,40,60)] hover:border-violet-500/50 hover:bg-[rgb(24,24,36)] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-300 font-bold">Copied to Clipboard!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-[rgb(140,140,180)]" />
                                            <span>Copy Optimized Prompt</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSendToBuilder}
                                    className="py-2.5 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>Send to Prompt Builder</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Empty State when no prompt is analyzed yet */
                        <div className="p-12 text-center rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                                <Wand2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5 max-w-sm mx-auto">
                                <h3 className="text-sm font-bold text-white">
                                    Ready to optimize your prompt
                                </h3>
                                <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                    Paste a draft prompt on the left or select a quick sample, then click <strong>&quot;Analyze &amp; Optimize&quot;</strong> to generate rule-based suggestions and RTCF completeness metrics.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Client-Side Philosophy Card ────────────────────────── */}
            <div className="p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(30,30,46)] flex items-center gap-3 text-xs text-[rgb(130,130,165)]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                    <strong>100% Client-Side Engine:</strong> This optimizer runs strictly deterministic, local rule-based AST parsers in your browser. It does not send your prompt to any external server or AI API, and never claims to replace external reasoning models.
                </span>
            </div>
        </div>
    );
}
