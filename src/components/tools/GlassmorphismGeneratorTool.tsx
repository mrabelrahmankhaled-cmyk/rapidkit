"use client";

import { useState } from "react";
import {
    Layers,
    Copy,
    Check,
    Sparkles,
    Settings2,
    Palette,
    Info,
    Maximize,
    Box,
    Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GlassmorphismGeneratorTool() {
    const [blur, setBlur] = useState(16);
    const [transparency, setTransparency] = useState(0.2);
    const [saturation, setSaturation] = useState(100);
    const [border, setBorder] = useState(0.1);
    const [color, setColor] = useState("#ffffff");
    const [copied, setCopied] = useState(false);

    const hexToRgba = (hex: string, op: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${op})`;
    };

    const glassStyle = {
        background: hexToRgba(color, transparency),
        backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
        border: `1px solid ${hexToRgba(color, border)}`,
        borderRadius: "2rem",
    };

    const cssCode = `background: ${hexToRgba(color, transparency)};
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: 1px solid ${hexToRgba(color, border)};
border-radius: 2rem;`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const Slider = ({ label, value, min, max, unit = "", step = 1, onChange }: any) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">{label}</label>
                <span className="text-[10px] font-mono text-indigo-400">{value}{unit}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-[rgb(25,25,40)] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Preview Zone ─── */}
            <div className="space-y-6">
                <div className="aspect-video rounded-[3.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex items-center justify-center p-12">
                    {/* Dynamic Background Shapes */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }} />
                        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                    </div>

                    {/* The Glass Object */}
                    <div
                        className="w-full max-w-md aspect-[16/9] flex flex-col items-center justify-center text-center p-12 relative z-10 transition-all duration-300"
                        style={glassStyle}
                    >
                        <Layers className="w-12 h-12 text-white mb-6 opacity-80" />
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Glassmorphism</h3>
                        <p className="text-sm text-white/60 leading-relaxed font-medium">
                            Premium UI trend for modern and sleek web experiences.
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-8 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-[rgb(100,100,140)] uppercase tracking-widest">Real-time Visualization</span>
                    </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-bold text-[rgb(120,120,160)] uppercase tracking-widest flex items-center gap-2">
                            <Box className="w-3.5 h-3.5" /> CSS Declarations
                        </h4>
                    </div>
                    <div className="flex items-center gap-4 bg-[rgb(10,10,15)] rounded-3xl p-6 border border-white/5 relative group">
                        <pre className="text-xs font-mono text-indigo-300 flex-grow break-all pr-4 whitespace-pre-wrap leading-relaxed">
                            {cssCode}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all shadow-xl font-bold text-[10px] uppercase tracking-widest",
                                copied ? "bg-emerald-500 text-black" : "bg-indigo-600 text-white hover:bg-indigo-500"
                            )}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy CSS"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Controls Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                        <Settings2 className="w-4 h-4" />
                        <label className="text-xs font-bold uppercase tracking-widest pl-2">Glass Physics</label>
                    </div>

                    <div className="space-y-7">
                        <Slider label="Backdrop Blur" value={blur} min={0} max={40} unit="px" onChange={setBlur} />
                        <Slider label="Transparency" value={transparency} min={0} max={1} step={0.05} onChange={setTransparency} />
                        <Slider label="Saturation" value={saturation} min={0} max={200} unit="%" onChange={setSaturation} />
                        <Slider label="Border Frost" value={border} min={0} max={1} step={0.05} onChange={setBorder} />
                    </div>

                    <div className="pt-6 border-t border-[rgb(45,45,65)] space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1 flex items-center gap-2">
                                <Palette className="w-3.5 h-3.5" /> Tint Color
                            </label>
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
                    </div>
                </div>

                <div className="p-7 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                    <div className="flex gap-3">
                        <Droplets className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-bold text-white mb-1">Optical Tips</p>
                            <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                                Use a low transparency with high blur for the best glass effect. Saturated colors behind the glass help highlight the distortion.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10 flex gap-4">
                    <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        Did you know? Safari was the first browser to support <code>backdrop-filter</code>, sparking the glassmorphism trend.
                    </p>
                </div>
            </div>
        </div>
    );
}
