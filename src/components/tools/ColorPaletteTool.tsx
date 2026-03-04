"use client";

import { useState, useCallback, useRef } from "react";
// @ts-ignore
import { Vibrant } from "node-vibrant/browser";
import {
    Palette,
    Upload,
    Trash2,
    Copy,
    Check,
    Droplets,
    Sparkles,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorRGB {
    r: number;
    g: number;
    b: number;
    hex: string;
    population: number;
    name: string;
}

export function ColorPaletteTool() {
    const [image, setImage] = useState<string | null>(null);
    const [palette, setPalette] = useState<ColorRGB[]>([]);
    const [dominantColor, setDominantColor] = useState<ColorRGB | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Extraction Logic ───────────────────────────────────────────
    const extractPalette = useCallback(async (imgUrl: string) => {
        setLoading(true);
        try {
            const v = Vibrant.from(imgUrl);
            const swatches = await v.getPalette();

            const results: ColorRGB[] = [];

            // Map common swatches
            const roles = [
                { key: "Vibrant", label: "Vibrant" },
                { key: "Muted", label: "Muted" },
                { key: "DarkVibrant", label: "Dark" },
                { key: "DarkMuted", label: "Midnight" },
                { key: "LightVibrant", label: "Pop" },
                { key: "LightMuted", label: "Soft" }
            ];

            roles.forEach(({ key, label }) => {
                const swatch = (swatches as any)[key];
                if (swatch) {
                    const [r, g, b] = swatch.getRgb();
                    results.push({
                        r: Math.round(r),
                        g: Math.round(g),
                        b: Math.round(b),
                        hex: swatch.getHex(),
                        population: swatch.getPopulation(),
                        name: label
                    });
                }
            });

            if (results.length > 0) {
                // Sort by population for the dominant one, but keep results for the palette
                const sorted = [...results].sort((a, b) => b.population - a.population);
                setDominantColor(sorted[0]);
                setPalette(results);
            }

            setLoading(false);
        } catch (error) {
            console.error("Vibrant extraction failed:", error);
            setLoading(false);
        }
    }, []);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            setImage(result);
            await extractPalette(result);
        };
        reader.readAsDataURL(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleCopy = (hex: string, index: number) => {
        navigator.clipboard.writeText(hex);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClear = () => {
        setImage(null);
        setPalette([]);
        setDominantColor(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Workspace ────────────────────────────── */}
            <div className="space-y-6">
                {!image ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "group aspect-video rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 cursor-pointer overflow-hidden relative",
                            dragActive
                                ? "border-rose-500 bg-rose-500/10 scale-[0.99]"
                                : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-rose-500/50 hover:bg-rose-500/5 shadow-2xl"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent pointer-events-none" />

                        <div className="w-20 h-20 rounded-[2rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl relative">
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/50">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                            <Upload className="w-8 h-8 text-rose-400 group-hover:animate-bounce" />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Extract Palette from Image</h3>
                            <p className="text-sm text-[rgb(80,80,120)]">Drag photos here or tap to select from gallery</p>
                        </div>

                        <div className="flex gap-3 relative">
                            {["#F43F5E", "#10B981", "#3B82F6", "#F59E0B"].map((c, i) => (
                                <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                            ))}
                        </div>

                        <input
                            ref={fileInputRef} type="file" className="hidden" accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Image Preview & Dominant Color */}
                        <div className="relative group p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent opacity-50" />

                            <div className="relative grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
                                <div className="aspect-square rounded-3xl overflow-hidden border border-[rgb(45,45,65)] shadow-2xl bg-black/40 group">
                                    <img
                                        src={image}
                                        alt="Uploaded Content"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Main Color Cluster</h3>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl"
                                                    style={{ backgroundColor: dominantColor?.hex || "transparent" }}
                                                />
                                                <div>
                                                    <p className="text-2xl font-mono font-bold text-white tracking-widest">{dominantColor?.hex?.toUpperCase() || "---"}</p>
                                                    <p className="text-xs text-[rgb(100,100,140)]">RGB: {dominantColor?.r}, {dominantColor?.g}, {dominantColor?.b}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleClear}
                                            className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                            title="Try another image"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => dominantColor && handleCopy(dominantColor.hex, -1)}
                                            className="flex-1 py-3.5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white text-xs font-bold hover:bg-[rgb(30,30,46)] transition-all flex items-center justify-center gap-2"
                                        >
                                            {copiedIndex === -1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 opacity-50" />}
                                            {copiedIndex === -1 ? "Dominant Copied!" : "Copy Main HEX"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Palette Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-3.5 h-3.5" /> Extracted Swatches
                                </h4>
                                <span className="text-[10px] text-[rgb(60,60,90)] italic">Tap colors to copy HEX code</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {palette.map((color, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleCopy(color.hex, index)}
                                        className="group cursor-pointer rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] p-4 transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                                    >
                                        <div
                                            className="aspect-[2/1] rounded-2xl border-2 border-white/5 shadow-inner mb-4 relative overflow-hidden"
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            <div className="absolute inset-x-0 bottom-0 py-1 bg-black/20 backdrop-blur-sm text-center">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter opacity-80">{color.name}</span>
                                            </div>
                                            {copiedIndex === index && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm animate-in fade-in duration-300">
                                                    <Check className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-mono font-bold text-white tracking-widest">{color.hex.toUpperCase()}</p>
                                            <p className="text-[10px] text-[rgb(80,80,120)]">RGB({color.r}, {color.g}, {color.b})</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                        <p className="text-sm text-[rgb(80,80,120)] font-medium animate-pulse">Extracting color spirit...</p>
                    </div>
                )}
            </div>

            {/* ─── Designer Sidebar ──────────────────────────── */}
            <div className="space-y-5">
                <div className="p-7 rounded-[2.5rem] bg-gradient-to-br from-rose-600 to-pink-700 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden">
                    <Droplets className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Vibrant Swatches</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        We use the Vibrant algorithm to extract unique color roles like "Pop" (Vibrant) and "Midnight" (Dark Muted) for perfectly balanced designs.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-5">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest pl-1">How it works</h4>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-rose-400">01</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">3D Image Sampling</p>
                                <p className="text-[10px] text-[rgb(100,100,140)] leading-relaxed">Pixels are mapped to a 3D space to identify the most clusters of color.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-rose-400">02</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">Zero Data Logs</p>
                                <p className="text-[10px] text-[rgb(100,100,140)] leading-relaxed">All processing is 100% private. Your images never leave your browser.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed">
                            <strong>Tip:</strong> Use the "Soft" (Light Muted) colors for subtle backgrounds and the "Vibrant" colors for call-to-action buttons.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
