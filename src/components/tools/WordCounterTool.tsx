"use client";

import { useState, useMemo } from "react";
import {
    AlignLeft,
    Type,
    FileText,
    Hash,
    Layers,
    BookOpen,
    Mic,
    Copy,
    Check,
    Trash2,
    Sparkles,
    Settings2,
    Info,
    History,
    FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

function analyzeText(text: string) {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;

    // Sentence detection (supports Latin and Arabic punctuation)
    const sentences = trimmed === "" ? 0 : trimmed.split(/[.!?\u06D4\u061F]+/).filter((s) => s.trim().length > 0).length;

    // Paragraph detection
    const paragraphs = trimmed === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

    // Reading/Speaking Time
    const readingTimeSeconds = Math.round((words / 200) * 60); // 200 wpm
    const speakingTimeSeconds = Math.round((words / 130) * 60); // 130 wpm

    const formatSeconds = (totalSeconds: number) => {
        if (totalSeconds < 60) return `${totalSeconds}s`;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    };

    // Keyword Analysis
    const wordFreq: Record<string, number> = {};
    if (trimmed) {
        trimmed
            .toLowerCase()
            .replace(/[^\w\s\u0600-\u06FF]/gi, "") // Keep alphanumeric + Arabic
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .forEach((w) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    }
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const avgWordLength = words > 0 ? (charsNoSpaces / words).toFixed(1) : "0";
    const avgSentLength = sentences > 0 ? (words / sentences).toFixed(1) : "0";

    return {
        words, chars, charsNoSpaces, sentences, paragraphs,
        readingTime: formatSeconds(readingTimeSeconds),
        speakingTime: formatSeconds(speakingTimeSeconds),
        topWords,
        avgWordLength,
        avgSentLength
    };
}

export function WordCounterTool() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const stats = useMemo(() => analyzeText(text), [text]);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const MAIN_STATS = [
        { label: "Words", value: stats.words, icon: AlignLeft, color: "text-indigo-400", bg: "bg-indigo-400/10" },
        { label: "Characters", value: stats.chars, icon: Type, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "No Spaces", value: stats.charsNoSpaces, icon: Hash, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Sentences", value: stats.sentences, icon: FileText, color: "text-rose-400", bg: "bg-rose-400/10" },
        { label: "Paragraphs", value: stats.paragraphs, icon: Layers, color: "text-blue-400", bg: "bg-blue-400/10" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Editor Zone ─── */}
            <div className="space-y-6">
                <div className="flex flex-col h-[550px] rounded-[3.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

                    <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                            <AlignLeft className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(120,120,160)]">Advanced Analysis Surface</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopy}
                                disabled={!text}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[rgb(120,120,160)] hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                Copy
                            </button>
                            <button
                                onClick={() => setText("")}
                                disabled={!text}
                                className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10 flex items-center justify-center"
                                title="Clear Text"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste or type your text here. We'll handle the math while you handle the writing..."
                        className="flex-grow p-10 bg-transparent border-none text-white font-medium text-lg leading-relaxed focus:ring-0 resize-none custom-scrollbar placeholder:text-[rgb(45,45,65)]"
                    />
                </div>

                {/* Counter Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {MAIN_STATS.map((stat) => (
                        <div key={stat.label} className="p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-mono font-bold text-white tracking-tight">{stat.value.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Sidebar Analysis ─── */}
            <div className="space-y-6">
                {/* Time Metrics */}
                <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">Reading Time</p>
                                <p className="text-lg font-bold text-white">{stats.readingTime}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                <Mic className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">Speaking Time</p>
                                <p className="text-lg font-bold text-white">{stats.speakingTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="pt-6 border-t border-[rgb(45,45,65)] grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[rgb(14,14,24)] border border-white/5">
                            <p className="text-[8px] font-bold text-[rgb(80,80,120)] uppercase tracking-[0.2em] mb-1">Avg. Word</p>
                            <p className="text-sm font-bold text-indigo-100">{stats.avgWordLength} <span className="text-[10px] text-[rgb(80,80,120)]">chars</span></p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[rgb(14,14,24)] border border-white/5">
                            <p className="text-[8px] font-bold text-[rgb(80,80,120)] uppercase tracking-[0.2em] mb-1">Avg. Sentence</p>
                            <p className="text-sm font-bold text-indigo-100">{stats.avgSentLength} <span className="text-[10px] text-[rgb(80,80,120)]">words</span></p>
                        </div>
                    </div>
                </div>

                {/* Keyword Density */}
                <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Keyword Analysis
                        </h4>
                        <Info className="w-3.5 h-3.5 text-[rgb(60,60,100)]" />
                    </div>

                    <div className="space-y-3">
                        {stats.topWords.length > 0 ? stats.topWords.map(([word, count]) => {
                            const percent = Math.round((count / stats.words) * 100);
                            return (
                                <div key={word} className="space-y-1.5 group">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-xs font-bold text-indigo-100/80 group-hover:text-white transition-colors capitalize">{word}</span>
                                        <span className="text-[10px] font-mono text-indigo-400 font-bold">{count}× ({percent}%)</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500/40 group-hover:bg-indigo-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(percent * 5, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center text-[rgb(60,60,100)] opacity-40">
                                <FileSpreadsheet className="w-10 h-10 mb-2" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Analysis</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pro Tip */}
                <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                    <History className="w-10 h-10 mb-4 opacity-30 group-hover:scale-110 transition-transform" />
                    <p className="text-[11px] font-medium leading-relaxed relative z-10">
                        For high-impact SEO, try to keep your most important keywords between 1-2% of the total word count.
                    </p>
                </div>
            </div>
        </div>
    );
}
