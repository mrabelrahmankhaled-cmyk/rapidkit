"use client";

import {
    Sparkles,
    Gauge,
    ShieldCheck,
    Zap,
    Cpu,
    ArrowRight,
    Lock,
    Clock
} from "lucide-react";

interface PromptOptimizerTabProps {
    onNavigateToBuilder: () => void;
    onNavigateToLibrary: () => void;
}

export function PromptOptimizerTab({ onNavigateToBuilder, onNavigateToLibrary }: PromptOptimizerTabProps) {
    const plannedModules = [
        {
            icon: Zap,
            title: "Token Compression & Cost Optimizer",
            tag: "Cost Efficiency",
            description: "Identifies verbose or redundant instructions, pruning token overhead by 20–40% without sacrificing LLM reasoning fidelity.",
        },
        {
            icon: Gauge,
            title: "Constraint & Specificity Scorer",
            tag: "Clarity Score",
            description: "Evaluates boundary tightness and detects fuzzy adjectives (e.g., 'make it fast') with automated suggestions for quantifiable parameters.",
        },
        {
            icon: Cpu,
            title: "Synthetic Few-Shot Injector",
            tag: "Few-Shot Examples",
            description: "Automatically generates 2 high-contrast input/output demonstration pairs tailored to your target model to guide complex reasoning paths.",
        },
        {
            icon: ShieldCheck,
            title: "Security & Prompt Leakage Guard",
            tag: "Defensive Prompting",
            description: "Scans system prompts for prompt injection vulnerabilities, role usurpation vectors, and instructions that risk data extraction.",
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Hero Banner */}
            <div className="p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-[11px] font-bold uppercase tracking-wider text-violet-300">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>Under Active Engineering • Planned for Phase 5</span>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                        AI Prompt Optimizer Engine
                    </h2>

                    <p className="text-sm text-[rgb(140,140,180)] leading-relaxed">
                        Transform good prompts into mathematically resilient, token-efficient system instructions. The Optimizer runs client-side heuristic rules to audit clarity, reduce API token burn, and harden constraints.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={onNavigateToBuilder}
                            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center gap-1.5"
                        >
                            <span>Open Prompt Builder</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={onNavigateToLibrary}
                            className="px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(40,40,60)] hover:border-violet-500/50 hover:bg-[rgb(24,24,36)] text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                            <span>Browse 20+ Templates</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Planned Modules Architecture Grid */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(140,140,180)]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Planned Optimizer Architecture Modules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plannedModules.map((mod) => {
                        const IconComp = mod.icon;
                        return (
                            <div
                                key={mod.title}
                                className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(35,35,50)] hover:border-[rgb(55,55,80)] transition-all space-y-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                                        <IconComp className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[rgb(20,20,30)] text-[rgb(130,130,165)] border border-[rgb(35,35,50)]">
                                        {mod.tag}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                                <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Client-Side Philosophy Card */}
            <div className="p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(30,30,46)] flex items-center gap-3 text-xs text-[rgb(130,130,165)]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                    <strong>100% Client-Side Engine:</strong> Like all RapidKit tools, the Prompt Optimizer will execute entirely in your browser using local parsing and AST token metrics with zero server logging or paid API tokens required.
                </span>
            </div>
        </div>
    );
}
