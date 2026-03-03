"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Trash2 } from "lucide-react";

function analyzeText(text: string) {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed === "" ? 0 : trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = trimmed === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // avg 200 wpm
    const speakingTime = Math.ceil(words / 130); // avg 130 wpm

    // Top 5 most frequent words
    const wordFreq: Record<string, number> = {};
    if (trimmed) {
        trimmed
            .toLowerCase()
            .replace(/[^a-z\s]/gi, "")
            .split(/\s+/)
            .filter((w) => w.length > 3)
            .forEach((w) => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    }
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime, topWords };
}

export function WordCounterTool() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const stats = useMemo(() => analyzeText(text), [text]);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const STAT_CARDS = [
        { label: "Words", value: stats.words, color: "from-violet-500 to-purple-600" },
        { label: "Characters", value: stats.chars, color: "from-cyan-500 to-blue-600" },
        { label: "No Spaces", value: stats.charsNoSpaces, color: "from-emerald-500 to-teal-600" },
        { label: "Sentences", value: stats.sentences, color: "from-amber-500 to-orange-600" },
        { label: "Paragraphs", value: stats.paragraphs, color: "from-rose-500 to-pink-600" },
    ];

    return (
        <div className="space-y-6">
            {/* ─── Stats Row ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STAT_CARDS.map((card) => (
                    <div key={card.label} className="rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] p-4 text-center">
                        <div className={`text-2xl font-black bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>
                            {card.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-[rgb(80,80,120)] mt-1 font-medium">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* ─── Reading / Speaking Time ─────────────────── */}
            <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-4 flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                        <div className="text-lg font-bold text-white">
                            {stats.readingTime < 1 ? "< 1" : stats.readingTime} <span className="text-sm font-normal text-[rgb(80,80,120)]">min read</span>
                        </div>
                        <div className="text-xs text-[rgb(80,80,120)]">At 200 words/min</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-3">
                    <span className="text-2xl">🎙️</span>
                    <div>
                        <div className="text-lg font-bold text-white">
                            {stats.speakingTime < 1 ? "< 1" : stats.speakingTime} <span className="text-sm font-normal text-[rgb(80,80,120)]">min speak</span>
                        </div>
                        <div className="text-xs text-[rgb(80,80,120)]">At 130 words/min</div>
                    </div>
                </div>
            </div>

            {/* ─── Textarea ────────────────────────────────── */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-[rgb(148,148,186)]">Your Text</label>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            disabled={!text}
                            className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-white disabled:opacity-30 transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                            onClick={() => setText("")}
                            disabled={!text}
                            className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-red-400 disabled:opacity-30 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                    </div>
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type your text here and see live statistics instantly..."
                    className="w-full h-64 p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(45,45,65)] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-sm resize-none leading-relaxed transition-all"
                />
            </div>

            {/* ─── Top Words ───────────────────────────────── */}
            {stats.topWords.length > 0 && (
                <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Most Frequent Words</h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.topWords.map(([word, count]) => (
                            <div
                                key={word}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgb(24,24,37)] border border-[rgb(45,45,65)]"
                            >
                                <span className="text-sm text-white font-medium">{word}</span>
                                <span className="text-xs text-violet-400 font-bold">{count}×</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
