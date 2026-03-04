"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Fingerprint,
    Copy,
    Check,
    Download,
    RefreshCw,
    ShieldCheck,
    Info,
    Sparkles,
    Hash,
    Settings2,
    List
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UuidGeneratorTool() {
    const [count, setCount] = useState(10);
    const [uuids, setUuids] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [uppercase, setUppercase] = useState(false);
    const [braces, setBraces] = useState(false);

    const generateUuid = useCallback(() => {
        // Use crypto.randomUUID if available, else fallback
        const newUuids = [];
        for (let i = 0; i < count; i++) {
            let id = "";
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                id = crypto.randomUUID();
            } else {
                // Basic fallback
                id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }

            if (uppercase) id = id.toUpperCase();
            if (braces) id = `{${id}}`;
            newUuids.push(id);
        }
        setUuids(newUuids);
    }, [count, uppercase, braces]);

    // Initial generation
    useEffect(() => {
        generateUuid();
    }, [generateUuid]);

    const handleCopy = () => {
        navigator.clipboard.writeText(uuids.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rapidkit-uuids-${new Date().getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Results Area ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

                    <div className="relative flex-grow flex flex-col space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="text-[10px] font-bold text-[rgb(120,120,160)] uppercase tracking-widest flex items-center gap-2">
                                <List className="w-3.5 h-3.5" /> Generated Registry
                            </h4>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCopy}
                                    className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-300 transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? "Copied!" : "Copy All"}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-300 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" /> Export .txt
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow bg-[rgb(17,17,27)] rounded-[2rem] border border-[rgb(45,45,65)] p-6 font-mono text-sm overflow-y-auto max-h-[400px] custom-scrollbar">
                            {uuids.map((id, i) => (
                                <div key={i} className="flex gap-4 py-2 border-b border-white/5 last:border-0 group">
                                    <span className="text-[rgb(80,80,120)] select-none">{(i + 1).toString().padStart(2, '0')}</span>
                                    <span className="text-indigo-300 selection:bg-indigo-500 selection:text-white flex-grow">{id}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/5 text-[rgb(100,100,140)] transition-all"
                                        title="Copy Single ID"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={generateUuid}
                            className="w-full py-4 rounded-3xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Generate New Batch
                        </button>
                    </div>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white mb-0.5">V4 Standard</p>
                            <p className="text-[10px] text-[rgb(120,120,160)]">Cryptographically strong random identifiers.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">Total Bits</p>
                        <p className="text-xs font-mono text-white">128-bit</p>
                    </div>
                </div>
            </div>

            {/* ─── Controls Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Settings2 className="w-4 h-4" />
                        <label className="text-xs font-bold uppercase tracking-widest pl-2">Generator Settings</label>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest text-indigo-200">Batch Quantity</label>
                                <span className="text-xs font-mono font-bold text-indigo-400">{count}</span>
                            </div>
                            <input
                                type="range" min="1" max="100" step="1"
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value))}
                                className="w-full accent-indigo-500 bg-[rgb(25,25,40)] h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Formatting Options</label>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setUppercase(!uppercase)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                                        uppercase ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-[rgb(10,10,15)] border-[rgb(45,45,65)] text-[rgb(100,100,140)]"
                                    )}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-tight flex items-center gap-2">
                                        <Hash className="w-3.5 h-3.5" /> Uppercase Format
                                    </span>
                                    {uppercase ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-white/10 group-hover:border-white/20" />}
                                </button>
                                <button
                                    onClick={() => setBraces(!braces)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group",
                                        braces ? "bg-indigo-500/10 border-indigo-500/30 text-white" : "bg-[rgb(10,10,15)] border-[rgb(45,45,65)] text-[rgb(100,100,140)]"
                                    )}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-tight flex items-center gap-2">
                                        <Fingerprint className="w-3.5 h-3.5" /> Curly Braces { }
                                    </span>
                                    {braces ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-white/10 group-hover:border-white/20" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Backend Ready</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        UUIDs are perfect for distributed systems. They are unique enough to be generated on different machines without collisions.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-5 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        Tip: Version 4 UUIDs are based on random numbers, providing 122 bits of randomness.
                    </p>
                </div>
            </div>
        </div>
    );
}
