"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
    Search,
    Filter,
    Variable,
    Eye,
    ArrowRight,
    Tag,
    X,
    Code2,
    Database,
    LineChart,
    TrendingUp,
    PenTool,
    Layers,
    Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    PROMPT_TEMPLATES,
    TEMPLATE_CATEGORIES,
    PromptTemplate,
    TemplateCategory,
    searchTemplates,
    getAllTags
} from "@/data/promptTemplates";

interface PromptLibraryTabProps {
    onSelectTemplate: (template: PromptTemplate) => void;
}

const CATEGORY_ICONS: Record<TemplateCategory, typeof Code2> = {
    "Frontend Development": Code2,
    "Backend Development": Database,
    "SEO": LineChart,
    "Sales": TrendingUp,
    "Copywriting": PenTool,
};

const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; text: string; border: string }> = {
    "Frontend Development": {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/30",
    },
    "Backend Development": {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
    },
    "SEO": {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/30",
    },
    "Sales": {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
    },
    "Copywriting": {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/30",
    },
};

export function PromptLibraryTab({ onSelectTemplate }: PromptLibraryTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "All">("All");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // Prevent body scroll when preview modal is open
    useEffect(() => {
        if (!previewTemplate) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [previewTemplate]);

    const allTags = useMemo(() => getAllTags(), []);

    // Filter templates based on search, category, and tag
    const filteredTemplates = useMemo(() => {
        return searchTemplates(searchQuery, selectedCategory, selectedTag);
    }, [searchQuery, selectedCategory, selectedTag]);

    // Calculate category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { All: PROMPT_TEMPLATES.length };
        TEMPLATE_CATEGORIES.forEach((cat) => {
            counts[cat] = PROMPT_TEMPLATES.filter((t) => t.category === cat).length;
        });
        return counts;
    }, []);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("All");
        setSelectedTag(null);
    };

    // Close preview modal on Escape key
    useEffect(() => {
        if (!previewTemplate) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPreviewTemplate(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewTemplate]);

    return (
        <div className="space-y-6">
            {/* ─── Search & Category Header ──────────────────────────── */}
            <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl space-y-5">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[rgb(120,120,160)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates by role, keyword, framework, or {{variable}}..."
                            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(40,40,60)] focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-white placeholder-[rgb(100,100,135)] text-sm transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[rgb(120,120,160)] hover:text-white"
                                title="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Result Count and Active Filters Badge */}
                    <div className="flex items-center gap-2 shrink-0 text-xs text-[rgb(140,140,175)]">
                        <span className="font-semibold text-white">{filteredTemplates.length}</span>
                        <span>template{filteredTemplates.length !== 1 ? "s" : ""} available</span>
                        {(selectedCategory !== "All" || selectedTag || searchQuery) && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="ml-2 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1 -mx-2 px-2">
                    <button
                        type="button"
                        onClick={() => setSelectedCategory("All")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                            selectedCategory === "All"
                                ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30"
                                : "bg-[rgb(18,18,28)] border-[rgb(38,38,58)] text-[rgb(150,150,185)] hover:text-white hover:border-violet-500/40"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>All Categories</span>
                        <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono">
                            {categoryCounts["All"]}
                        </span>
                    </button>

                    {TEMPLATE_CATEGORIES.map((cat) => {
                        const IconComp = CATEGORY_ICONS[cat];
                        const isSelected = selectedCategory === cat;
                        const colors = CATEGORY_COLORS[cat];
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                                    isSelected
                                        ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30"
                                        : "bg-[rgb(18,18,28)] border-[rgb(38,38,58)] text-[rgb(150,150,185)] hover:text-white hover:border-violet-500/40"
                                )}
                            >
                                <IconComp className={cn("w-3.5 h-3.5", isSelected ? "text-white" : colors.text)} />
                                <span>{cat}</span>
                                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 font-mono">
                                    {categoryCounts[cat]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Popular Tag Filters */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                    <span className="text-[rgb(110,110,145)] font-semibold flex items-center gap-1 mr-1">
                        <Tag className="w-3 h-3" />
                        <span>Tags:</span>
                    </span>
                    {allTags.slice(0, 14).map((tag) => {
                        const isTagActive = selectedTag === tag;
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(isTagActive ? null : tag)}
                                className={cn(
                                    "px-2.5 py-1 rounded-lg transition-all border font-mono text-[11px]",
                                    isTagActive
                                        ? "bg-violet-600/25 border-violet-500 text-violet-200 shadow-sm"
                                        : "bg-[rgb(18,18,28)] border-[rgb(35,35,50)] text-[rgb(130,130,165)] hover:text-white hover:border-[rgb(60,60,85)]"
                                )}
                            >
                                #{tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Templates Grid ────────────────────────────────────────── */}
            {filteredTemplates.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-3">
                    <Filter className="w-8 h-8 mx-auto text-[rgb(80,80,120)]" />
                    <h3 className="text-sm font-bold text-white">No matching prompt templates</h3>
                    <p className="text-xs text-[rgb(130,130,165)] max-w-sm mx-auto">
                        We couldn&apos;t find any templates matching your search criteria. Try clearing the query or resetting your filters.
                    </p>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
                    >
                        <span>Reset All Filters</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => {
                        const colors = CATEGORY_COLORS[template.category];
                        const IconComp = CATEGORY_ICONS[template.category];

                        return (
                            <div
                                key={template.id}
                                className="p-5 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] hover:border-violet-500/50 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                            >
                                <div className="space-y-3">
                                    {/* Header: Category Badge + Recommended Model */}
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                                colors.bg,
                                                colors.text,
                                                colors.border
                                            )}
                                        >
                                            <IconComp className="w-3 h-3" />
                                            <span>{template.category}</span>
                                        </span>

                                        {template.recommendedModel && (
                                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[rgb(20,20,32)] text-[rgb(150,150,185)] border border-[rgb(40,40,60)] flex items-center gap-1">
                                                <Bot className="w-3 h-3 text-cyan-400" />
                                                <span>{template.recommendedModel.toUpperCase()}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Title & Description */}
                                    <div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors line-clamp-1">
                                            {template.title}
                                        </h3>
                                        <p className="text-xs text-[rgb(130,130,165)] mt-1.5 line-clamp-2 leading-relaxed">
                                            {template.description}
                                        </p>
                                    </div>

                                    {/* Variables Pill Counter */}
                                    <div className="p-2.5 rounded-xl bg-[rgb(16,16,24)] border border-[rgb(30,30,46)] space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-semibold text-violet-300 flex items-center gap-1">
                                                <Variable className="w-3 h-3 text-violet-400" />
                                                <span>{template.variables.length} Required Variable{template.variables.length > 1 ? "s" : ""}:</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {template.variables.slice(0, 3).map((v) => (
                                                <span
                                                    key={v}
                                                    className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                                >
                                                    {v}
                                                </span>
                                            ))}
                                            {template.variables.length > 3 && (
                                                <span className="px-1.5 py-0.2 rounded font-mono text-[9px] text-[rgb(130,130,160)]">
                                                    +{template.variables.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-mono text-[rgb(110,110,145)] bg-[rgb(18,18,26)] px-2 py-0.5 rounded-md"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions: Preview & Use Template */}
                                <div className="pt-2 flex items-center gap-2 border-t border-[rgb(25,25,38)]">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewTemplate(template)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(40,40,60)] hover:border-violet-500/50 hover:bg-[rgb(24,24,36)] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                        title="Preview template details"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-[rgb(140,140,180)]" />
                                        <span>Preview</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onSelectTemplate(template)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                                        title="Load template into Builder"
                                    >
                                        <span>Use Template</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Template Preview Modal ────────────────────────────── */}
            {mounted && previewTemplate && createPortal(
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="preview-title"
                    onClick={() => setPreviewTemplate(null)}
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", zIndex: 99999 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-2xl max-h-[88vh] rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(45,45,70)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b border-[rgb(30,30,46)] flex items-start justify-between gap-4 shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            CATEGORY_COLORS[previewTemplate.category].bg,
                                            CATEGORY_COLORS[previewTemplate.category].text,
                                            CATEGORY_COLORS[previewTemplate.category].border
                                        )}
                                    >
                                        {previewTemplate.category}
                                    </span>
                                    {previewTemplate.recommendedModel && (
                                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[rgb(20,20,32)] text-[rgb(150,150,185)] border border-[rgb(40,40,60)] flex items-center gap-1">
                                            <Bot className="w-3 h-3 text-cyan-400" />
                                            <span>Best for {previewTemplate.recommendedModel.toUpperCase()}</span>
                                        </span>
                                    )}
                                </div>
                                <h3 id="preview-title" className="text-base font-bold text-white">
                                    {previewTemplate.title}
                                </h3>
                                <p className="text-xs text-[rgb(130,130,165)]">
                                    {previewTemplate.description}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPreviewTemplate(null)}
                                className="p-2 rounded-xl text-[rgb(140,140,180)] hover:text-white hover:bg-[rgb(24,24,36)] transition-all shrink-0"
                                title="Close preview"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: RTCF Breakdown */}
                        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs flex-1 min-h-0">
                            {/* Required Variables Section */}
                            <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/25 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-violet-300">
                                    <Variable className="w-4 h-4 text-violet-400" />
                                    <span>Variables Required to Fill ({previewTemplate.variables.length}):</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {previewTemplate.variables.map((v) => (
                                        <span
                                            key={v}
                                            className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-violet-600/25 text-violet-200 border border-violet-500/30"
                                        >
                                            {v}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-violet-300/80">
                                    When loaded into the Builder, RapidKit will automatically detect these variables so you can quickly populate them.
                                </p>
                            </div>

                            {/* RTCF Breakdown Cards */}
                            <div className="space-y-3">
                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] space-y-1">
                                    <span className="font-bold text-violet-400 uppercase tracking-wider text-[10px]">
                                        Role / Persona
                                    </span>
                                    <p className="text-[rgb(200,200,225)] leading-relaxed">{previewTemplate.role}</p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] space-y-1">
                                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                                        Task / Objective
                                    </span>
                                    <p className="text-[rgb(200,200,225)] leading-relaxed whitespace-pre-wrap">{previewTemplate.task}</p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] space-y-1">
                                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                                        Context & Constraints
                                    </span>
                                    <p className="text-[rgb(200,200,225)] leading-relaxed whitespace-pre-wrap">{previewTemplate.context}</p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[rgb(16,16,24)] border border-[rgb(35,35,50)] space-y-1">
                                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                                        Desired Output Format
                                    </span>
                                    <p className="text-[rgb(200,200,225)] leading-relaxed whitespace-pre-wrap">{previewTemplate.outputFormat}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[rgb(30,30,46)] bg-[rgb(10,10,15)] flex items-center justify-between gap-3 shrink-0">
                            <span className="text-[11px] text-[rgb(120,120,150)]">
                                Ready to customize and export this prompt?
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPreviewTemplate(null)}
                                    className="px-3.5 py-2 rounded-xl text-xs text-[rgb(140,140,170)] hover:text-white hover:bg-[rgb(20,20,30)] transition-all font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const t = previewTemplate;
                                        setPreviewTemplate(null);
                                        onSelectTemplate(t);
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center gap-1.5"
                                >
                                    <span>Use This Template in Builder</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
