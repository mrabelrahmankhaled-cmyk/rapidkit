/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Vibrant } from "node-vibrant/browser";
import {
    Palette,
    Upload,
    Trash2,
    Copy,
    Check,
    Droplets,
    Sparkles,
    Info,
    Pipette,
    Code,
    FileJson,
    Share2,
    Layers
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

interface SwatchLike {
    rgb?: number[];
    getRgb?: () => number[];
    r?: number;
    g?: number;
    b?: number;
    hex?: string;
    getHex?: () => string;
    population?: number;
    getPopulation?: () => number;
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function parseSwatch(swatch: unknown, label: string): ColorRGB | null {
    if (!swatch || typeof swatch !== "object") return null;
    try {
        const s = swatch as SwatchLike;
        let r = 0;
        let g = 0;
        let b = 0;

        if (Array.isArray(s.rgb)) {
            r = s.rgb[0] ?? 0;
            g = s.rgb[1] ?? 0;
            b = s.rgb[2] ?? 0;
        } else if (typeof s.getRgb === "function") {
            const rgb = s.getRgb();
            r = rgb?.[0] ?? 0;
            g = rgb?.[1] ?? 0;
            b = rgb?.[2] ?? 0;
        } else if (typeof s.r === "number") {
            r = s.r;
            g = s.g ?? 0;
            b = s.b ?? 0;
        }

        const hex =
            (typeof s.hex === "string" && s.hex.startsWith("#") ? s.hex.toUpperCase() : null) ||
            (typeof s.getHex === "function" ? s.getHex().toUpperCase() : null) ||
            rgbToHex(r, g, b);

        const population =
            (typeof s.population === "number" ? s.population : null) ||
            (typeof s.getPopulation === "function" ? s.getPopulation() : null) ||
            1;

        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
            hex,
            population,
            name: label,
        };
    } catch {
        return null;
    }
}

/**
 * Robust HTML5 Canvas Color Quantizer (works 100% offline, zero-dependency)
 * Samples pixels, creates quantized buckets, and extracts distinct dominant colors.
 */
function extractCanvasPalette(imgSrc: string, targetCount = 8): Promise<ColorRGB[]> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (!ctx) {
                    resolve([]);
                    return;
                }

                const maxDim = 120;
                let w = img.naturalWidth || img.width || 100;
                let h = img.naturalHeight || img.height || 100;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.max(1, Math.round((h * maxDim) / w));
                        w = maxDim;
                    } else {
                        w = Math.max(1, Math.round((w * maxDim) / h));
                        h = maxDim;
                    }
                }

                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);

                const data = ctx.getImageData(0, 0, w, h).data;
                const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

                // Sample pixels for speed & accuracy
                const step = 28;
                for (let i = 0; i < data.length; i += 8) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 128) continue; // Skip transparency

                    const br = Math.round(r / step) * step;
                    const bg = Math.round(g / step) * step;
                    const bb = Math.round(b / step) * step;
                    const key = `${br},${bg},${bb}`;

                    const bData = buckets.get(key);
                    if (bData) {
                        bData.r += r;
                        bData.g += g;
                        bData.b += b;
                        bData.count += 1;
                    } else {
                        buckets.set(key, { r, g, b, count: 1 });
                    }
                }

                if (buckets.size === 0) {
                    resolve([]);
                    return;
                }

                const list = Array.from(buckets.values()).map((b) => ({
                    r: Math.round(b.r / b.count),
                    g: Math.round(b.g / b.count),
                    b: Math.round(b.b / b.count),
                    count: b.count,
                }));

                list.sort((a, b) => b.count - a.count);

                // Euclidean distance filter for distinct hues
                const distinct: typeof list = [];
                for (const item of list) {
                    if (distinct.length >= targetCount) break;
                    const isSimilar = distinct.some(
                        (d) => Math.hypot(d.r - item.r, d.g - item.g, d.b - item.b) < 38
                    );
                    if (!isSimilar) {
                        distinct.push(item);
                    }
                }

                if (distinct.length < targetCount) {
                    for (const item of list) {
                        if (distinct.length >= targetCount) break;
                        if (!distinct.includes(item)) {
                            const isSimilar = distinct.some(
                                (d) => Math.hypot(d.r - item.r, d.g - item.g, d.b - item.b) < 22
                            );
                            if (!isSimilar) {
                                distinct.push(item);
                            }
                        }
                    }
                }

                const semanticLabels = ["Dominant", "Vibrant", "Accent", "Midnight", "Soft", "Pop", "Contrast", "Secondary"];

                const results: ColorRGB[] = distinct.map((item, index) => ({
                    r: item.r,
                    g: item.g,
                    b: item.b,
                    hex: rgbToHex(item.r, item.g, item.b),
                    population: item.count,
                    name: semanticLabels[index] || `Color ${index + 1}`,
                }));

                resolve(results);
            } catch (canvasErr) {
                console.error("Canvas palette fallback error:", canvasErr);
                resolve([]);
            }
        };
        img.onerror = () => resolve([]);
        img.src = imgSrc;
    });
}

// Preset samples for fast 1-click testing
const PRESET_SAMPLES = [
    {
        name: "Ocean Glow",
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2306b6d4'/><stop offset='50%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%231e1b4b'/></linearGradient></defs><rect width='400' height='300' fill='url(%23g)'/><circle cx='120' cy='100' r='50' fill='%23ec4899'/><circle cx='280' cy='200' r='60' fill='%23f59e0b'/></svg>",
    },
    {
        name: "Sunset Horizon",
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><defs><linearGradient id='s' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='%23f43f5e'/><stop offset='45%' stop-color='%23fb923c'/><stop offset='75%' stop-color='%23facc15'/><stop offset='100%' stop-color='%2318181b'/></linearGradient></defs><rect width='400' height='300' fill='url(%23s)'/><circle cx='200' cy='160' r='45' fill='%23ffffff'/></svg>",
    },
    {
        name: "Emerald Forest",
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><defs><linearGradient id='f' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='50%' stop-color='%23047857'/><stop offset='100%' stop-color='%23064e3b'/></linearGradient></defs><rect width='400' height='300' fill='url(%23f)'/><circle cx='250' cy='120' r='40' fill='%23a7f3d0'/><rect x='40' y='180' width='100' height='80' rx='16' fill='%2384cc16'/></svg>",
    },
];

export function ColorPaletteTool() {
    const [image, setImage] = useState<string | null>(null);
    const [palette, setPalette] = useState<ColorRGB[]>([]);
    const [dominantColor, setDominantColor] = useState<ColorRGB | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exportModal, setExportModal] = useState<"css" | "tailwind" | "json" | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgPreviewRef = useRef<HTMLImageElement>(null);

    // ─── Extraction Logic ───────────────────────────────────────────
    const extractPalette = useCallback(async (imgUrl: string) => {
        setLoading(true);
        try {
            const results: ColorRGB[] = [];

            // 1. Try node-vibrant extraction
            try {
                const v = Vibrant.from(imgUrl);
                const swatches = await v.getPalette();

                const roles = [
                    { key: "Vibrant", label: "Vibrant" },
                    { key: "LightVibrant", label: "Pop" },
                    { key: "DarkVibrant", label: "Dark" },
                    { key: "Muted", label: "Muted" },
                    { key: "LightMuted", label: "Soft" },
                    { key: "DarkMuted", label: "Midnight" }
                ];

                roles.forEach(({ key, label }) => {
                    const raw = (swatches as Record<string, unknown>)?.[key];
                    if (raw) {
                        const parsed = parseSwatch(raw, label);
                        if (parsed) results.push(parsed);
                    }
                });
            } catch (vibrantErr) {
                console.warn("Vibrant primary extraction warning, using canvas quantizer:", vibrantErr);
            }

            // 2. Supplement or fallback with HTML5 Canvas quantizer
            if (results.length < 5) {
                const canvasColors = await extractCanvasPalette(imgUrl, 8 - results.length);
                for (const cc of canvasColors) {
                    const alreadyExists = results.some(
                        (existing) => Math.hypot(existing.r - cc.r, existing.g - cc.g, existing.b - cc.b) < 32
                    );
                    if (!alreadyExists) {
                        results.push(cc);
                    }
                }
            }

            if (results.length > 0) {
                const sorted = [...results].sort((a, b) => b.population - a.population);
                setDominantColor(sorted[0]);
                setPalette(results);
            } else {
                setDominantColor(null);
                setPalette([]);
            }
        } catch (error) {
            console.error("Color extraction failed:", error);
            setDominantColor(null);
            setPalette([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const result = e.target?.result as string;
            setImage(result);
            await extractPalette(result);
        };
        reader.readAsDataURL(file);
    }, [extractPalette]);

    // ─── Clipboard Paste Listener ────────────────────────────────────
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                    const file = items[i].getAsFile();
                    if (file) {
                        processFile(file);
                        break;
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [processFile]);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleCopy = (text: string, identifier: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(identifier);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyAll = () => {
        const hexList = palette.map((p) => p.hex).join(", ");
        handleCopy(hexList, "all");
    };

    const handleClear = () => {
        setImage(null);
        setPalette([]);
        setDominantColor(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ─── Native Eyedropper API ──────────────────────────────────────
    const handlePickColor = async () => {
        if (typeof window !== "undefined" && "EyeDropper" in window) {
            try {
                // @ts-expect-error EyeDropper is experimental in Chromium
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                if (result?.sRGBHex) {
                    const hex = result.sRGBHex.toUpperCase();
                    handleCopy(hex, "eyedropper");
                }
            } catch {
                // User canceled eyedropper
            }
        }
    };

    // Generate export code snippets
    const getCssSnippet = () => {
        return `:root {\n${palette
            .map((c, i) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-") || i + 1}: ${c.hex}; /* RGB(${c.r}, ${c.g}, ${c.b}) */`)
            .join("\n")}\n}`;
    };

    const getTailwindSnippet = () => {
        const obj = palette.reduce((acc, c, i) => {
            const key = c.name.toLowerCase().replace(/\s+/g, "-") || `color-${i + 1}`;
            acc[key] = c.hex;
            return acc;
        }, {} as Record<string, string>);
        return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(
            obj,
            null,
            6
        )}\n    }\n  }\n};`;
    };

    const getJsonSnippet = () => {
        return JSON.stringify(
            {
                dominant: dominantColor?.hex || null,
                palette: palette.map((c) => ({
                    role: c.name,
                    hex: c.hex,
                    rgb: { r: c.r, g: c.g, b: c.b },
                    population: c.population,
                })),
            },
            null,
            2
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Workspace ────────────────────────────── */}
            <div className="space-y-6">
                {!image ? (
                    <div className="space-y-4">
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

                            <div className="text-center space-y-2 px-4">
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Extract Palette from Image</h3>
                                <p className="text-sm text-[rgb(130,130,170)]">
                                    Drag and drop any photo here, tap to select, or press <kbd className="px-1.5 py-0.5 rounded bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-xs text-white">Ctrl+V</kbd> to paste
                                </p>
                            </div>

                            <div className="flex gap-3 relative">
                                {["#F43F5E", "#10B981", "#3B82F6", "#F59E0B"].map((c, i) => (
                                    <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                                ))}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                            />
                        </div>

                        {/* Preset Test Images */}
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs text-[rgb(110,110,150)] shrink-0">Try with a sample:</span>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_SAMPLES.map((sample) => (
                                    <button
                                        key={sample.name}
                                        type="button"
                                        onClick={() => {
                                            setImage(sample.url);
                                            extractPalette(sample.url);
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] hover:border-rose-500/50 text-[rgb(148,148,186)] hover:text-white transition-all"
                                    >
                                        {sample.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Image Preview & Dominant Color */}
                        <div className="relative group p-6 sm:p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent opacity-50" />

                            <div className="relative grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 sm:gap-8 items-center">
                                <div className="aspect-square rounded-3xl overflow-hidden border border-[rgb(45,45,65)] shadow-2xl bg-black/40 group relative">
                                    <img
                                        ref={imgPreviewRef}
                                        src={image}
                                        alt="Uploaded Content"
                                        className="w-full h-full object-cover"
                                    />
                                    {typeof window !== "undefined" && "EyeDropper" in window && (
                                        <button
                                            type="button"
                                            onClick={handlePickColor}
                                            className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white hover:text-rose-400 hover:scale-105 transition-all shadow-lg"
                                            title="Pick color from screen with EyeDropper"
                                        >
                                            <Pipette className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xs font-bold text-[rgb(110,110,150)] uppercase tracking-widest">
                                                Main Dominant Cluster
                                            </h3>
                                            <div className="flex items-center gap-4 pt-1">
                                                <div
                                                    className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl transition-all"
                                                    style={{ backgroundColor: dominantColor?.hex || "#2d2d41" }}
                                                />
                                                <div>
                                                    <p className="text-2xl font-mono font-bold text-white tracking-widest">
                                                        {dominantColor ? dominantColor.hex : "Analyzing..."}
                                                    </p>
                                                    <p className="text-xs text-[rgb(130,130,170)] font-mono">
                                                        {dominantColor
                                                            ? `RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`
                                                            : "RGB: ---"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleClear}
                                            className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                            title="Upload another image"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => dominantColor && handleCopy(dominantColor.hex, -1)}
                                            disabled={!dominantColor}
                                            className="flex-1 py-3 px-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white text-xs font-bold hover:bg-[rgb(30,30,46)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {copiedIndex === -1 ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 opacity-50" />
                                            )}
                                            <span>{copiedIndex === -1 ? "Copied!" : "Copy Dominant HEX"}</span>
                                        </button>

                                        <button
                                            onClick={handleCopyAll}
                                            disabled={palette.length === 0}
                                            className="py-3 px-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white text-xs font-bold hover:bg-[rgb(30,30,46)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {copiedIndex === "all" ? (
                                                <Check className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <Share2 className="w-4 h-4 opacity-50" />
                                            )}
                                            <span>{copiedIndex === "all" ? "All Copied!" : "Copy All HEX"}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Palette Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2 flex-wrap gap-2">
                                <h4 className="text-xs font-bold text-[rgb(130,130,170)] uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-rose-400" /> Extracted Swatches ({palette.length})
                                </h4>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setExportModal(exportModal === "css" ? null : "css")}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5",
                                            exportModal === "css"
                                                ? "bg-rose-500/20 border-rose-500/50 text-white"
                                                : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white"
                                        )}
                                    >
                                        <Code className="w-3.5 h-3.5" />
                                        <span>CSS</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setExportModal(exportModal === "tailwind" ? null : "tailwind")}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5",
                                            exportModal === "tailwind"
                                                ? "bg-rose-500/20 border-rose-500/50 text-white"
                                                : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white"
                                        )}
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>Tailwind</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setExportModal(exportModal === "json" ? null : "json")}
                                        className={cn(
                                            "text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5",
                                            exportModal === "json"
                                                ? "bg-rose-500/20 border-rose-500/50 text-white"
                                                : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white"
                                        )}
                                    >
                                        <FileJson className="w-3.5 h-3.5" />
                                        <span>JSON</span>
                                    </button>
                                </div>
                            </div>

                            {/* Export code panel */}
                            {exportModal && (
                                <div className="p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(45,45,65)] relative animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-[rgb(130,130,170)] uppercase">
                                            {exportModal === "css" && "CSS Variables Snippet"}
                                            {exportModal === "tailwind" && "Tailwind Colors Configuration"}
                                            {exportModal === "json" && "JSON Palette Object"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const snippet =
                                                    exportModal === "css"
                                                        ? getCssSnippet()
                                                        : exportModal === "tailwind"
                                                        ? getTailwindSnippet()
                                                        : getJsonSnippet();
                                                handleCopy(snippet, "export");
                                            }}
                                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                                        >
                                            {copiedIndex === "export" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedIndex === "export" ? "Copied!" : "Copy Snippet"}</span>
                                        </button>
                                    </div>
                                    <pre className="text-xs font-mono text-white/90 p-3 rounded-xl bg-[rgb(7,7,12)] border border-[rgb(30,30,45)] overflow-x-auto max-h-48">
                                        {exportModal === "css" && getCssSnippet()}
                                        {exportModal === "tailwind" && getTailwindSnippet()}
                                        {exportModal === "json" && getJsonSnippet()}
                                    </pre>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {palette.map((color, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleCopy(color.hex, index)}
                                        className="group cursor-pointer rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] p-4 transition-all hover:scale-[1.02] hover:border-rose-500/50 hover:shadow-2xl active:scale-[0.98]"
                                    >
                                        <div
                                            className="aspect-[2/1] rounded-2xl border-2 border-white/5 shadow-inner mb-4 relative overflow-hidden"
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            <div className="absolute inset-x-0 bottom-0 py-1 bg-black/40 backdrop-blur-sm text-center">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider opacity-90">
                                                    {color.name}
                                                </span>
                                            </div>
                                            {copiedIndex === index && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/90 backdrop-blur-sm animate-in fade-in duration-200">
                                                    <Check className="w-6 h-6 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-mono font-bold text-white tracking-widest">{color.hex}</p>
                                            <p className="text-[10px] text-[rgb(130,130,170)] font-mono">
                                                RGB({color.r}, {color.g}, {color.b})
                                            </p>
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
                        <p className="text-sm text-[rgb(130,130,170)] font-medium animate-pulse">Extracting palette clusters...</p>
                    </div>
                )}
            </div>

            {/* ─── Designer Sidebar ──────────────────────────── */}
            <div className="space-y-5">
                <div className="p-7 rounded-[2.5rem] bg-gradient-to-br from-rose-600 to-pink-700 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden">
                    <Droplets className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Vibrant Swatches</h4>
                    <p className="text-xs text-white/90 leading-relaxed relative">
                        Extracts color roles including &quot;Vibrant&quot;, &quot;Pop&quot;, &quot;Dark&quot;, and &quot;Midnight&quot; using the Modified Median Cut algorithm for balanced UI palettes.
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
                                <p className="text-[11px] font-bold text-white mb-0.5">Dual-Engine Extraction</p>
                                <p className="text-[10px] text-[rgb(130,130,170)] leading-relaxed">
                                    Combines Vibrant 3D color clustering with native HTML5 Canvas quantization for instant, 100% reliable swatches.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-rose-400">02</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">100% Client-Side Privacy</p>
                                <p className="text-[10px] text-[rgb(130,130,170)] leading-relaxed">
                                    Your photos never leave your device. All color analysis executes securely in your local browser sandbox.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-rose-400">03</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">One-Click Export</p>
                                <p className="text-[10px] text-[rgb(130,130,170)] leading-relaxed">
                                    Copy individual HEX codes or export the entire palette directly as CSS Custom Properties, Tailwind colors, or JSON.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] text-[rgb(140,140,180)] leading-relaxed">
                            <strong>Tip:</strong> Press <kbd className="px-1 py-0.5 rounded bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-[10px] text-white">Ctrl+V</kbd> anywhere on the page to paste an image straight from your clipboard!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
