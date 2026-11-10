"use client";

import {
    FlaskConical,
    SplitSquareVertical,
    FileCode2,
    Sliders,
    ArrowRight,
    Terminal,
    Clock,
    Lock
} from "lucide-react";

interface PromptLabTabProps {
    onNavigateToBuilder: () => void;
    onNavigateToLibrary: () => void;
}

export function PromptLabTab({ onNavigateToBuilder, onNavigateToLibrary }: PromptLabTabProps) {
    const plannedLabFeatures = [
        {
            icon: SplitSquareVertical,
            title: "Multi-Model Variation Matrix",
            badge: "A/B Comparison",
            description: "Format the same base RTCF prompt simultaneously for ChatGPT, Claude, Gemini, and Midjourney to compare model-specific formatting side by side.",
        },
        {
            icon: Sliders,
            title: "Hyperparameter Guide & Profile Presets",
            badge: "Temperature & Top-P",
            description: "Recommended temperature, top-p, and frequency penalty settings tuned for technical code generation vs creative marketing copy.",
        },
        {
            icon: Terminal,
            title: "Local Model Exporter (Ollama & LM Studio)",
            badge: "Open Source LLMs",
            description: "1-click export of structured prompts directly into Ollama Modelfiles, vLLM chat templates, or LM Studio system instructions.",
        },
        {
            icon: FileCode2,
            title: "System vs User Prompt Decomposer",
            badge: "Role Decomposition",
            description: "Cleanly isolates developer system instructions from runtime user placeholders for seamless copy-pasting into OpenAI / Anthropic SDK code.",
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Hero Banner */}
            <div className="p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div className="relative z-10 max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Under Active Engineering • Planned for Phase 6</span>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                        AI Prompt Experimentation Lab
                    </h2>

                    <p className="text-sm text-[rgb(140,140,180)] leading-relaxed">
                        The ultimate playground to stress-test prompt structures, export to local open-source runtimes like Ollama, and decompose complex multi-turn system architectures.
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
                            <span>Explore Prompt Library</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Planned Features Grid */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[rgb(140,140,180)]">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Planned Lab Capabilities</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plannedLabFeatures.map((feat) => {
                        const IconComp = feat.icon;
                        return (
                            <div
                                key={feat.title}
                                className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(35,35,50)] hover:border-[rgb(55,55,80)] transition-all space-y-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                        <IconComp className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[rgb(20,20,30)] text-[rgb(130,130,165)] border border-[rgb(35,35,50)]">
                                        {feat.badge}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                                <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                    {feat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(30,30,46)] flex items-center gap-3 text-xs text-[rgb(130,130,165)]">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                    <strong>Zero-Cost & Private:</strong> The Prompt Lab will run entirely client-side without requiring API keys or third-party paid AI subscriptions.
                </span>
            </div>
        </div>
    );
}
