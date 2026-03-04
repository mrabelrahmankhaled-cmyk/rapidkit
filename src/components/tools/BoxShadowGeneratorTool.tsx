"use client";

import { useState } from "react";
import {
    Box,
    Copy,
    Check,
    Layers,
    Maximize,
    Info,
    Sparkles,
    Palette,
    Settings2,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BoxShadowGeneratorTool() {
    const [hOffset, setHOffset] = useState(10);
    const [vOffset, setVOffset] = useState(10);
    const [blur, setBlur] = useState(20);
    const [spread, setSpread] = useState(0);
    const [color, setColor] = useState("#000000");
    const [opacity, setOpacity] = useState(0.2);
    const [inset, setInset] = useState(false);
    const [copied, setCopied] = useState(false);

    // Convert hex to RGBA
    const hexToRgba = (hex: string, op: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${op})`;
    };

    const shadowColor = hexToRgba(color, opacity);
    const shadowCode = `${inset ? "inset " : ""}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${shadowColor}`;
    const fullCssCode = `box-shadow: ${shadowCode};`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullCssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const Slider = ({ label, value, min, max, onChange }: any) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">{label}</label>
                <span className="text-[10px] font-mono text-rose-400">{value}px</span>
            </div>
            <input
                type="range" min={min} max={max} step="1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full accent-rose-500 bg-[rgb(25,25,40)] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Preview Zone ─── */}
            <div className="space-y-6">
                <div className="aspect-video rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl overflow-hidden relative flex items-center justify-center p-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05),transparent)] pointer-events-none" />

                    {/* The Target Object */}
                    <div
                        className="w-48 h-48 rounded-[2rem] bg-white transition-all duration-300 transform"
                        style={{ boxShadow: shadowCode }}
                    />

                    <div className="absolute bottom-8 left-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-[rgb(100,100,140)] uppercase tracking-widest">Real-time Rendering</span>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-bold text-[rgb(120,120,160)] uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Generated CSS
                        </h4>
                    </div>
                    <div className="flex items-center gap-4 bg-[rgb(10,10,15)] rounded-2xl p-5 border border-white/5">
                        <code className="text-sm font-mono text-emerald-400 flex-grow break-all pr-4">
                            {fullCssCode}
                        </code>
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "p-3 rounded-xl transition-all",
                                copied ? "bg-emerald-500 text-black" : "bg-white/5 text-white hover:bg-white/10"
                            )}
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Controls Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    <div className="flex items-center gap-2 text-rose-500 mb-2">
                        <Settings2 className="w-4 h-4" />
                        <label className="text-xs font-bold uppercase tracking-widest pl-2">Shadow Physics</label>
                    </div>

                    <div className="space-y-6">
                        <Slider label="Horizontal Offset" value={hOffset} min={-100} max={100} onChange={setHOffset} />
                        <Slider label="Vertical Offset" value={vOffset} min={-100} max={100} onChange={setVOffset} />
                        <Slider label="Blur Radius" value={blur} min={0} max={150} onChange={setBlur} />
                        <Slider label="Spread Radius" value={spread} min={-50} max={100} onChange={setSpread} />
                    </div>

                    <div className="pt-4 border-t border-[rgb(45,45,65)] space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Shadow Color</label>
                            <div className="flex items-center gap-4 p-3 bg-[rgb(10,10,15)] rounded-2xl border border-[rgb(35,35,50)]">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                                />
                                <span className="text-xs font-mono text-white/50 uppercase">{color}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Opacity</label>
                                <span className="text-[10px] font-mono text-rose-400">{(opacity * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                className="w-full accent-rose-500 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setInset(!inset)}
                                className={cn(
                                    "w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                    inset
                                        ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20"
                                        : "bg-[rgb(10,10,15)] border-[rgb(45,45,65)] text-[rgb(100,100,140)] hover:text-white"
                                )}
                            >
                                {inset ? "★ Inset Shadow Active" : "Set as Inset Shadow"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                    <div className="flex gap-3">
                        <Eye className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-bold text-white mb-1">Visual Depth</p>
                            <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                                Use subtle, low-opacity shadows for modern designs. Avoid absolute black (#000) for a more natural, fluid aesthetic.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 flex gap-4">
                    <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        Tip: Combine multiple shadows in CSS by separating them with commas for advanced realism.
                    </p>
                </div>
            </div>
        </div>
    );
}
