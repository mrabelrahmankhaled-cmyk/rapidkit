"use client";

import { useState, useEffect } from "react";
import {
    Maximize,
    Video,
    Monitor,
    Smartphone,
    Tv,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Link,
    RefreshCw,
    Settings2,
    Info,
    Sparkles,
    Copy,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
    { name: "HD Video", ratio: "16:9", icon: Video },
    { name: "Classic TV", ratio: "4:3", icon: Tv },
    { name: "Instagram Post", ratio: "1:1", icon: Square },
    { name: "TikTok / Stories", ratio: "9:16", icon: Smartphone },
    { name: "Cinema", ratio: "21:9", icon: RectangleHorizontal },
    { name: "Photo Print", ratio: "3:2", icon: RectangleHorizontal },
];

export function AspectRatioCalculatorTool() {
    const [width, setWidth] = useState<string>("1920");
    const [height, setHeight] = useState<string>("1080");
    const [ratioW, setRatioW] = useState<string>("16");
    const [ratioH, setRatioH] = useState<string>("9");
    const [lockRatio, setLockRatio] = useState(true);
    const [copied, setCopied] = useState(false);

    // GCD function to simplify ratios
    const gcd = (a: number, b: number): number => {
        return b === 0 ? a : gcd(b, a % b);
    };

    const getCurrentRatio = () => {
        const w = parseFloat(width);
        const h = parseFloat(height);
        if (!w || !h) return "0:0";
        const common = gcd(w, h);
        return `${w / common}:${h / common}`;
    };

    const handleWidthChange = (val: string) => {
        setWidth(val);
        const w = parseFloat(val);
        const rw = parseFloat(ratioW);
        const rh = parseFloat(ratioH);
        if (lockRatio && w && rw && rh) {
            setHeight(Math.round((w * rh) / rw).toString());
        }
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        const h = parseFloat(val);
        const rw = parseFloat(ratioW);
        const rh = parseFloat(ratioH);
        if (lockRatio && h && rw && rh) {
            setWidth(Math.round((h * rw) / rh).toString());
        }
    };

    const applyPreset = (ratio: string) => {
        const [rw, rh] = ratio.split(":").map(Number);
        setRatioW(rw.toString());
        setRatioH(rh.toString());
        const w = parseFloat(width);
        if (w) {
            setHeight(Math.round((w * rh) / rw).toString());
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${width} x ${height} (${getCurrentRatio()})`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentRatioStr = getCurrentRatio();
    const previewScale = lockRatio ? parseFloat(ratioW) / parseFloat(ratioH) : parseFloat(width) / parseFloat(height);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Calculator ─── */}
            <div className="space-y-6">
                <div className="p-10 rounded-[3.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        {/* Dimension Inputs */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-indigo-400 mb-2">
                                <Settings2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest pl-1">Dimensions (px)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Width</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(e) => handleWidthChange(e.target.value)}
                                        className="w-full h-14 bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-2xl px-6 text-white font-mono font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Height</label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => handleHeightChange(e.target.value)}
                                        className="w-full h-14 bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-2xl px-6 text-white font-mono font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Ratio Controls */}
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Target Ratio</span>
                                    <button
                                        onClick={() => setLockRatio(!lockRatio)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                            lockRatio ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/5 text-[rgb(80,80,120)]"
                                        )}
                                    >
                                        <Link className="w-3.5 h-3.5" />
                                        {lockRatio ? "Ratio Locked" : "Free Form"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-2xl px-6 h-14 text-white font-mono font-bold">
                                        <input
                                            type="number"
                                            value={ratioW}
                                            onChange={(e) => setRatioW(e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 outline-none"
                                        />
                                        <span className="text-[rgb(80,80,120)] mx-2">:</span>
                                        <input
                                            type="number"
                                            value={ratioH}
                                            onChange={(e) => setRatioH(e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-2xl h-14">
                                        <div className="text-center">
                                            <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Identified Ratio</p>
                                            <p className="text-lg font-mono font-black text-white">{currentRatioStr}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Preview */}
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="aspect-square w-full max-w-[280px] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-[3rem] flex items-center justify-center p-8 relative">
                                <div
                                    className="bg-indigo-600/20 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 transition-all duration-500 ease-out flex items-center justify-center relative overflow-hidden rounded-2xl"
                                    style={{
                                        width: previewScale > 1 ? "100%" : `${previewScale * 100}%`,
                                        height: previewScale > 1 ? `${(1 / previewScale) * 100}%` : "100%",
                                    }}
                                >
                                    <Maximize className="w-8 h-8 text-indigo-400 opacity-20" />
                                    <div className="absolute bottom-2 right-3 text-[8px] font-mono text-indigo-300 font-bold opacity-60">
                                        {currentRatioStr}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "w-full max-w-[280px] py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2",
                                    copied ? "bg-emerald-500 text-black px-6" : "bg-white text-black hover:scale-105"
                                )}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied Spec!" : "Copy Specifications"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset.ratio)}
                            className="p-5 rounded-[2rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] hover:border-indigo-500/50 hover:bg-[rgb(22,22,35)] transition-all flex flex-col items-center text-center space-y-3 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                                <preset.icon className="w-5 h-5 text-[rgb(100,100,140)] group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-0.5">{preset.name}</p>
                                <p className="text-xs font-mono font-bold text-white tracking-widest">{preset.ratio}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Sidebar Intelligence ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Dimension Logic</span>
                    </div>

                    <div className="space-y-5">
                        <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-2">
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">How it works</p>
                            <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed">
                                Enter your current width and height to see the <strong>Simplified Ratio</strong>. If you want to scale up or down while keeping the same shape, click <strong>Ratio Locked</strong>.
                            </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-2">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Pro Usage</p>
                            <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed">
                                Use the presets for common standards like 16:9 (YouTube) or 9:16 (Shorts/Reels) to ensure your media fits perfectly.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        The "Golden Ratio" is approximately 1.618:1. Use 16:10 for a close modern digital approximation.
                    </p>
                </div>

                <div className="p-4 rounded-[2rem] bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/20 flex items-center justify-between px-6 py-5 group cursor-default">
                    <div className="flex items-center gap-4">
                        <RectangleVertical className="w-5 h-5 opacity-70" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Cinema Ready</span>
                    </div>
                    <RefreshCw className="w-4 h-4 animate-spin-slow opacity-50" />
                </div>
            </div>
        </div>
    );
}
