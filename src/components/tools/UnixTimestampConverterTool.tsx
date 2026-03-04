"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Calendar,
    Hash,
    RefreshCw,
    Copy,
    Check,
    Globe,
    Info,
    Sparkles,
    ArrowRightLeft,
    Terminal,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UnixTimestampConverterTool() {
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [timestampInput, setTimestampInput] = useState(currentTime.toString());
    const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));

    const [resultDate, setResultDate] = useState<Date | null>(new Date());
    const [resultTimestamp, setResultTimestamp] = useState<number | null>(currentTime);

    const [copied, setCopied] = useState<string | null>(null);

    // ─── Live Clock ───
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // ─── Conversion Logic ───
    const handleTimestampChange = (val: string) => {
        setTimestampInput(val);
        const ts = parseInt(val);
        if (!isNaN(ts)) {
            // Support both seconds and milliseconds
            const date = new Date(ts > 100000000000 ? ts : ts * 1000);
            if (date.getTime()) {
                setResultDate(date);
            } else {
                setResultDate(null);
            }
        } else {
            setResultDate(null);
        }
    };

    const handleDateChange = (val: string) => {
        setDateInput(val);
        const date = new Date(val);
        if (date.getTime()) {
            setResultTimestamp(Math.floor(date.getTime() / 1000));
        } else {
            setResultTimestamp(null);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const useCurrent = () => {
        const now = Math.floor(Date.now() / 1000);
        handleTimestampChange(now.toString());
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Content ─── */}
            <div className="space-y-6">
                {/* Live Epoch Banner */}
                <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-[rgb(100,100,140)] uppercase tracking-widest pl-1">Current Unix Epoch</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight">{currentTime}</h2>
                        </div>
                        <button
                            onClick={useCurrent}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shrink-0"
                        >
                            <RefreshCw className="w-4 h-4" /> Use Current Time
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TS to Date */}
                    <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                        <div className="flex items-center gap-3 text-indigo-400 mb-2">
                            <Terminal className="w-4 h-4" />
                            <label className="text-[10px] font-bold uppercase tracking-widest">Timestamp to Date</label>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={timestampInput}
                                onChange={(e) => handleTimestampChange(e.target.value)}
                                className="w-full bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] rounded-2xl p-5 font-mono text-xl text-white focus:border-indigo-500 transition-all outline-none"
                                placeholder="Enter timestamp..."
                            />

                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-1.5">
                                            <Globe className="w-3 h-3" /> UTC Time
                                        </p>
                                        <p className="text-sm font-mono text-indigo-100">{resultDate ? resultDate.toUTCString() : "Invalid Date"}</p>
                                    </div>
                                    <button
                                        onClick={() => resultDate && handleCopy(resultDate.toUTCString(), 'utc')}
                                        className="p-2.5 rounded-xl hover:bg-white/5 text-[rgb(100,100,140)] transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        {copied === 'utc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" /> Local Time
                                        </p>
                                        <p className="text-sm font-mono text-indigo-100">{resultDate ? resultDate.toString().split('(')[0] : "Invalid Date"}</p>
                                    </div>
                                    <button
                                        onClick={() => resultDate && handleCopy(resultDate.toString(), 'local')}
                                        className="p-2.5 rounded-xl hover:bg-white/5 text-[rgb(100,100,140)] transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        {copied === 'local' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date to TS */}
                    <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <label className="text-[10px] font-bold uppercase tracking-widest">Date to Timestamp</label>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="datetime-local"
                                value={dateInput}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] rounded-2xl p-5 text-indigo-100 font-medium focus:border-emerald-500 transition-all outline-none"
                            />

                            <div className="space-y-3 pt-2">
                                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Resulting Unix Epoch</p>
                                        <p className="text-2xl font-mono font-bold text-white">{resultTimestamp ?? "---"}</p>
                                    </div>
                                    <button
                                        onClick={() => resultTimestamp && handleCopy(resultTimestamp.toString(), 'res-ts')}
                                        className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        {copied === 'res-ts' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-[rgb(100,100,140)] text-center italic">Value is represented in seconds.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-gradient-to-br from-[rgb(30,30,46)] to-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white shadow-xl relative overflow-hidden">
                    <ArrowRightLeft className="w-10 h-10 mb-4 text-indigo-400 opacity-80" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Epoch Logic</h4>
                    <p className="text-xs text-[rgb(150,150,180)] leading-relaxed">
                        The Unix timestamp is the number of seconds that have elapsed since January 1, 1970 (UTC). It's the universal language for servers.
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">RapidKit Dev</span>
                        <Info className="w-4 h-4 text-[rgb(80,80,120)]" />
                    </div>
                </div>

                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <h4 className="text-xs font-bold text-[rgb(100,100,140)] uppercase tracking-widest pl-1">Debugging Tips</h4>
                    <div className="space-y-5">
                        <div className="group">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">10 digits vs 13 digits</p>
                            <p className="text-[11px] text-[rgb(150,150,180)] leading-relaxed group-hover:text-white transition-colors">
                                10 digits are seconds. 13 digits are milliseconds (JS default). Our converter auto-detects both!
                            </p>
                        </div>
                        <div className="group">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">UTC vs Local</p>
                            <p className="text-[11px] text-[rgb(150,150,180)] leading-relaxed group-hover:text-white transition-colors">
                                Servers always store in UTC. Browsers convert to Local. Always check the UTC result for API responses.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                        Tooltip: JavaScript's <code>Date.now()</code> returns 13 digits. Use <code>/ 1000</code> to get standard Unix seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
