"use client";

import { useState } from "react";
import { Copy, Check, Trash2, Minimize2, Maximize2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "format" | "minify" | "validate";

function formatJSON(raw: string): { result: string; error: string | null } {
    try {
        const parsed = JSON.parse(raw);
        return { result: JSON.stringify(parsed, null, 2), error: null };
    } catch (e) {
        return { result: "", error: (e as Error).message };
    }
}

function minifyJSON(raw: string): { result: string; error: string | null } {
    try {
        const parsed = JSON.parse(raw);
        return { result: JSON.stringify(parsed), error: null };
    } catch (e) {
        return { result: "", error: (e as Error).message };
    }
}

export function JsonFormatterTool() {
    const [input, setInput] = useState("");
    const [mode, setMode] = useState<Mode>("format");
    const [copied, setCopied] = useState(false);

    const { result, error } = (() => {
        if (!input.trim()) return { result: "", error: null };
        if (mode === "format" || mode === "validate") return formatJSON(input);
        return minifyJSON(input);
    })();

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getSyntaxHighlight = (json: string): string => {
        // Simple syntax coloring via escaped HTML
        return json
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    let cls = "text-amber-300"; // number
                    if (/^"/.test(match)) {
                        cls = /:$/.test(match) ? "text-cyan-300" : "text-emerald-300";
                    } else if (/true|false/.test(match)) {
                        cls = "text-violet-400";
                    } else if (/null/.test(match)) {
                        cls = "text-rose-400";
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
    };

    const lineCount = (result || input).split("\n").length;
    const charCount = (result || input).length;

    return (
        <div className="space-y-4">
            {/* ─── Mode Tabs ──────────────────────────────── */}
            <div className="flex gap-1 bg-[rgb(17,17,27)] p-1 rounded-xl w-fit">
                {(["format", "minify", "validate"] as Mode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                            mode === m
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                : "text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)]"
                        )}
                    >
                        {m === "format" && <Maximize2 className="w-3.5 h-3.5 inline mr-1.5" />}
                        {m === "minify" && <Minimize2 className="w-3.5 h-3.5 inline mr-1.5" />}
                        {m === "validate" && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                        {m}
                    </button>
                ))}
            </div>

            {/* ─── Editor Split ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Input JSON</label>
                        <button
                            onClick={() => setInput("")}
                            className="text-xs text-[rgb(80,80,120)] hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={'{\n  "name": "RapidKit",\n  "type": "awesome"\n}'}
                        className="w-full h-80 p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(45,45,65)] focus:outline-none focus:border-violet-500/50 text-xs mono resize-none leading-relaxed"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                            {mode === "validate" ? (error ? "❌ Invalid JSON" : input ? "✅ Valid JSON" : "Output") : "Output"}
                        </label>
                        {result && (
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "text-xs flex items-center gap-1 transition-colors",
                                    copied ? "text-emerald-400" : "text-[rgb(80,80,120)] hover:text-white"
                                )}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        )}
                    </div>

                    <div className={cn(
                        "w-full h-80 p-4 rounded-xl border text-xs mono overflow-auto relative",
                        error
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)]"
                    )}>
                        {error ? (
                            <div className="flex items-start gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold mb-1">JSON Parse Error</p>
                                    <p className="text-xs leading-relaxed">{error}</p>
                                </div>
                            </div>
                        ) : result ? (
                            <pre
                                className="text-white leading-relaxed whitespace-pre-wrap break-all"
                                dangerouslySetInnerHTML={{ __html: getSyntaxHighlight(result) }}
                            />
                        ) : (
                            <span className="text-[rgb(45,45,65)]">Output will appear here...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Stats Bar ───────────────────────────────── */}
            {(input || result) && (
                <div className="flex items-center gap-4 text-xs text-[rgb(80,80,120)] py-2 px-3 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(30,30,46)]">
                    <span>Lines: <span className="text-white font-mono">{lineCount}</span></span>
                    <span>Chars: <span className="text-white font-mono">{charCount.toLocaleString()}</span></span>
                    {result && input && mode === "minify" && (
                        <span className="text-emerald-400 font-medium">
                            Saved: {(((input.length - result.length) / input.length) * 100).toFixed(1)}%
                        </span>
                    )}
                    {!error && input && (
                        <span className="ml-auto text-emerald-400 font-medium">✓ Valid JSON</span>
                    )}
                    {error && (
                        <span className="ml-auto text-red-400 font-medium">✗ Invalid JSON</span>
                    )}
                </div>
            )}
        </div>
    );
}
