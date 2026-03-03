"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type GradientType = "linear" | "radial" | "conic";

type Stop = { color: string; position: number };

function generateCSS(type: GradientType, angle: number, stops: Stop[]): string {
    const stopsStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
    if (type === "radial") return `radial-gradient(circle, ${stopsStr})`;
    return `conic-gradient(from ${angle}deg, ${stopsStr})`;
}

const PRESETS: { name: string; type: GradientType; angle: number; stops: Stop[] }[] = [
    { name: "Violet Dusk", type: "linear", angle: 135, stops: [{ color: "#7c3aed", position: 0 }, { color: "#2563eb", position: 100 }] },
    { name: "Cyber Punk", type: "linear", angle: 90, stops: [{ color: "#f72585", position: 0 }, { color: "#7209b7", position: 50 }, { color: "#3a0ca3", position: 100 }] },
    { name: "Aurora", type: "linear", angle: 120, stops: [{ color: "#06d6a0", position: 0 }, { color: "#118ab2", position: 100 }] },
    { name: "Sunset Fire", type: "linear", angle: 135, stops: [{ color: "#f97316", position: 0 }, { color: "#ef4444", position: 50 }, { color: "#7c3aed", position: 100 }] },
    { name: "Ocean", type: "radial", angle: 0, stops: [{ color: "#0ea5e9", position: 0 }, { color: "#0f172a", position: 100 }] },
    { name: "Rose Gold", type: "linear", angle: 135, stops: [{ color: "#ffd6e0", position: 0 }, { color: "#f472b6", position: 50 }, { color: "#c026d3", position: 100 }] },
];

export function CssGradientTool() {
    const [type, setType] = useState<GradientType>("linear");
    const [angle, setAngle] = useState(135);
    const [stops, setStops] = useState<Stop[]>([
        { color: "#7c3aed", position: 0 },
        { color: "#2563eb", position: 100 },
    ]);
    const [copied, setCopied] = useState(false);
    const copiedCssRef = useRef(false);

    const gradientCSS = generateCSS(type, angle, stops);
    const fullCSS = `background: ${gradientCSS};`;

    const updateStop = (index: number, field: keyof Stop, value: string | number) => {
        setStops((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const addStop = () => {
        if (stops.length >= 6) return;
        const mid = Math.round((stops[stops.length - 1].position + stops[0].position) / 2);
        setStops((prev) => [...prev, { color: "#8b5cf6", position: mid }].sort((a, b) => a.position - b.position));
    };

    const removeStop = (index: number) => {
        if (stops.length <= 2) return;
        setStops((prev) => prev.filter((_, i) => i !== index));
    };

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setType(preset.type);
        setAngle(preset.angle);
        setStops(preset.stops);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(fullCSS);
        setCopied(true);
        copiedCssRef.current = true;
        setTimeout(() => { setCopied(false); copiedCssRef.current = false; }, 2000);
    };

    const randomize = () => {
        const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
        setStops([
            { color: randomColor(), position: 0 },
            { color: randomColor(), position: Math.floor(Math.random() * 40) + 30 },
            { color: randomColor(), position: 100 },
        ]);
        setAngle(Math.floor(Math.random() * 360));
    };

    return (
        <div className="space-y-6">
            {/* ─── Preview ─────────────────────────────────── */}
            <div
                className="w-full h-48 rounded-2xl border border-[rgb(45,45,65)] shadow-inner transition-all duration-300"
                style={{ background: gradientCSS }}
            />

            {/* ─── CSS Output ──────────────────────────────── */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <code className="flex-1 text-xs mono text-emerald-300 truncate">{fullCSS}</code>
                <button
                    onClick={handleCopy}
                    className={cn(
                        "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30"
                    )}
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy CSS"}
                </button>
            </div>

            {/* ─── Controls ────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                    <label className="block text-xs font-medium text-[rgb(80,80,120)] mb-2 uppercase tracking-wider">Gradient Type</label>
                    <div className="flex gap-1 bg-[rgb(17,17,27)] p-1 rounded-xl">
                        {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all",
                                    type === t ? "bg-violet-600 text-white" : "text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)]"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Angle */}
                {(type === "linear" || type === "conic") && (
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Angle</label>
                            <span className="text-xs font-bold gradient-text">{angle}°</span>
                        </div>
                        <input
                            type="range" min={0} max={360} step={5} value={angle}
                            onChange={(e) => setAngle(Number(e.target.value))}
                            className="w-full h-2 rounded-full cursor-pointer accent-violet-500"
                        />
                    </div>
                )}
            </div>

            {/* ─── Color Stops ─────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Color Stops</label>
                    <div className="flex gap-2">
                        <button onClick={randomize} className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                            <RefreshCw className="w-3 h-3" /> Random
                        </button>
                        {stops.length < 6 && (
                            <button onClick={addStop} className="text-xs px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">
                                + Add Stop
                            </button>
                        )}
                    </div>
                </div>
                <div className="space-y-3">
                    {stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                            <input
                                type="color" value={stop.color}
                                onChange={(e) => updateStop(i, "color", e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0.5"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between mb-1 text-xs">
                                    <span className="mono text-[rgb(148,148,186)]">{stop.color}</span>
                                    <span className="text-[rgb(80,80,120)]">{stop.position}%</span>
                                </div>
                                <input
                                    type="range" min={0} max={100} step={1} value={stop.position}
                                    onChange={(e) => updateStop(i, "position", Number(e.target.value))}
                                    className="w-full h-1.5 rounded-full cursor-pointer accent-violet-500"
                                />
                            </div>
                            {stops.length > 2 && (
                                <button onClick={() => removeStop(i)} className="text-[rgb(80,80,120)] hover:text-red-400 transition-colors text-lg leading-none">×</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Presets ─────────────────────────────────── */}
            <div>
                <label className="block text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider mb-3">Presets</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESETS.map((preset) => {
                        const bg = generateCSS(preset.type, preset.angle, preset.stops);
                        return (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset)}
                                title={preset.name}
                                className="group relative h-12 rounded-xl overflow-hidden border border-[rgb(45,45,65)] hover:border-violet-500/50 hover:scale-105 transition-all"
                                style={{ background: bg }}
                            >
                                <span className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                                    <span className="text-[9px] text-white font-medium truncate px-1">{preset.name}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
