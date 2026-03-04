"use client";

import { useState, useMemo } from "react";
import {
    FileSearch,
    ArrowRight,
    Columns,
    Rows,
    Copy,
    Trash2,
    Check,
    Info,
    MoveHorizontal
} from "lucide-react";
import { diffLines, diffChars, Change } from "diff";
import { cn } from "@/lib/utils";

type DiffMode = "split" | "unified";
type DiffType = "lines" | "chars";

export function TextDiffCheckerTool() {
    const [original, setOriginal] = useState("");
    const [modified, setModified] = useState("");
    const [mode, setMode] = useState<DiffMode>("split");
    const [type, setType] = useState<DiffType>("lines");
    const [copied, setCopied] = useState(false);

    // ─── Diff Logic ──────────────────────────────────────────────────
    const diffResult = useMemo(() => {
        if (type === "lines") {
            return diffLines(original, modified);
        }
        return diffChars(original, modified);
    }, [original, modified, type]);

    const stats = useMemo(() => {
        const added = diffResult.filter(c => c.added).length;
        const removed = diffResult.filter(c => c.removed).length;
        return { added, removed };
    }, [diffResult]);

    // ─── Handlers ───────────────────────────────────────────────────
    const handleClear = () => {
        setOriginal("");
        setModified("");
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <div className="flex items-center gap-2">
                    <div className="flex p-1 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                        <button
                            onClick={() => setMode("split")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                mode === "split" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            <Columns className="w-3.5 h-3.5" />
                            Side by Side
                        </button>
                        <button
                            onClick={() => setMode("unified")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                mode === "unified" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            <Rows className="w-3.5 h-3.5" />
                            Unified
                        </button>
                    </div>

                    <div className="h-6 w-px bg-[rgb(45,45,65)] hidden sm:block" />

                    <div className="flex p-1 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                        <button
                            onClick={() => setType("lines")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                type === "lines" ? "bg-[rgb(30,30,46)] text-white" : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            Lines
                        </button>
                        <button
                            onClick={() => setType("chars")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                type === "chars" ? "bg-[rgb(30,30,46)] text-white" : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            Chars
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-emerald-400">+{stats.added}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                            <span className="text-[10px] font-bold text-rose-400">-{stats.removed}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleClear}
                        className="p-2.5 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-rose-400 hover:border-rose-400/30 transition-all"
                        title="Clear all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            Original Text
                        </label>
                    </div>
                    <textarea
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        placeholder="Paste original version here..."
                        className="w-full h-48 lg:h-64 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner leading-relaxed"
                    />
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            Modified Text
                        </label>
                    </div>
                    <textarea
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        placeholder="Paste modified version here..."
                        className="w-full h-48 lg:h-64 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner leading-relaxed"
                    />
                </div>
            </div>

            {/* Diff Result Display */}
            {(original || modified) && (
                <div className="p-1 rounded-[2rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] overflow-hidden shadow-2xl">
                    <div className="bg-black/20 p-4 border-b border-[rgb(45,45,65)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileSearch className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Comparison Summary</span>
                        </div>
                        <p className="text-[10px] text-[rgb(80,80,120)]">Highlighting {type === 'lines' ? 'Line' : 'Character'} Changes</p>
                    </div>

                    <div className={cn(
                        "p-6 font-mono text-sm overflow-x-auto",
                        mode === "split" ? "grid grid-cols-2 gap-px bg-[rgb(45,45,65)] bg-opacity-30" : "flex flex-col"
                    )}>
                        {mode === "unified" ? (
                            <div className="space-y-0.5 min-w-full">
                                {diffResult.map((part, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "px-4 py-0.5 rounded-sm whitespace-pre-wrap flex gap-3",
                                            part.added ? "bg-emerald-500/10 text-emerald-400" :
                                                part.removed ? "bg-rose-500/10 text-rose-400 line-through decoration-rose-400/30" :
                                                    "text-[rgb(100,100,140)]"
                                        )}
                                    >
                                        <span className="w-4 opacity-30 select-none">{part.added ? '+' : part.removed ? '-' : ' '}</span>
                                        {part.value}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Left: Original Highlights */}
                                <div className="bg-[rgb(10,10,15)] p-4 space-y-0.5">
                                    {diffResult.map((part, index) => (
                                        !part.added && (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "whitespace-pre-wrap",
                                                    part.removed ? "bg-rose-500/20 text-rose-400" : "text-[rgb(100,100,140)]"
                                                )}
                                            >
                                                {part.value}
                                            </div>
                                        )
                                    ))}
                                </div>
                                {/* Right: Modified Highlights */}
                                <div className="bg-[rgb(10,10,15)] p-4 space-y-0.5 border-l border-[rgb(45,45,65)]">
                                    {diffResult.map((part, index) => (
                                        !part.removed && (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "whitespace-pre-wrap",
                                                    part.added ? "bg-emerald-500/20 text-emerald-400" : "text-[rgb(100,100,140)]"
                                                )}
                                            >
                                                {part.value}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-600/5 border border-violet-500/10">
                <Info className="w-4 h-4 text-violet-400 shrink-0" />
                <p className="text-[11px] text-[rgb(100,100,140)] leading-relaxed">
                    <strong>Character Mode:</strong> Compares every single letter. <strong>Line Mode:</strong> Compares text line by line. All processing is done locally for maximum security.
                </p>
            </div>
        </div>
    );
}
