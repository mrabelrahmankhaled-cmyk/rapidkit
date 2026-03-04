"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Shapes,
    RefreshCw,
    Copy,
    Check,
    Download,
    Settings2,
    Layers,
    Wind,
    Info,
    Sparkles,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

type ShapeType = "blob" | "wave";

export function SvgShapeGeneratorTool() {
    const [type, setType] = useState<ShapeType>("blob");
    const [seed, setSeed] = useState(Math.random());
    const [complexity, setComplexity] = useState(6); // Points for blob, growth for wave
    const [contrast, setContrast] = useState(4); // How "wild" the shape is
    const [color, setColor] = useState("#F43F5E");
    const [svgCode, setSvgCode] = useState("");
    const [copied, setCopied] = useState(false);

    // ─── Shape Generation Logic ───
    const generatePath = useCallback(() => {
        if (type === "blob") {
            // Blob logic: radial points with oscillation
            const size = 400;
            const center = size / 2;
            const points = [];
            const angleStep = (Math.PI * 2) / complexity;
            const radius = 120;

            for (let i = 0; i < complexity; i++) {
                const theta = i * angleStep;
                // Use a seeded pseudo-random or sine-based oscillation
                const noise = Math.sin(theta * contrast + seed * 10) * (radius * 0.4);
                const r = radius + noise;
                const x = center + r * Math.cos(theta);
                const y = center + r * Math.sin(theta);
                points.push({ x, y });
            }

            // Create smooth Bezier path
            let path = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length; i++) {
                const next = points[(i + 1) % points.length];
                const curr = points[i];
                const xc = (curr.x + next.x) / 2;
                const yc = (curr.y + next.y) / 2;
                path += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
            }
            path += " Z";
            return path;
        } else {
            // Wave logic
            const w = 1440;
            const h = 320;
            const step = w / complexity;
            const points = [];

            for (let i = 0; i <= complexity; i++) {
                const noise = Math.sin(i * contrast + seed * 5) * (h * 0.25);
                points.push({ x: i * step, y: h / 2 + noise });
            }

            let path = `M 0 ${h} L 0 ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                const xc = (curr.x + next.x) / 2;
                const yc = (curr.y + next.y) / 2;
                path += ` Q ${curr.x} ${curr.y}, ${xc} ${yc}`;
            }
            path += ` L ${w} ${points[points.length - 1].y} L ${w} ${h} Z`;
            return path;
        }
    }, [type, complexity, contrast, seed]);

    useEffect(() => {
        const path = generatePath();
        const viewBox = type === "blob" ? "0 0 400 400" : "0 0 1440 320";
        const code = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
  <path fill="${color}" d="${path}"></path>
</svg>`;
        setSvgCode(code);
    }, [generatePath, color, type]);

    const handleCopy = () => {
        navigator.clipboard.writeText(svgCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([svgCode], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rapidkit-${type}-${Math.floor(seed * 1000)}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Preview Zone ─── */}
            <div className="space-y-6">
                <div className="aspect-video rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl overflow-hidden relative group flex items-center justify-center p-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05),transparent)] pointer-events-none" />

                    {/* The SVG Canvas */}
                    <div
                        className="w-full h-full flex items-center justify-center transition-all duration-700 transform"
                        dangerouslySetInnerHTML={{ __html: svgCode }}
                    />

                    <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => setSeed(Math.random())}
                            className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                            title="Randomize Shape"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleCopy}
                        className="py-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-[rgb(30,30,46)] transition-all"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-rose-400" />}
                        {copied ? "Copied SVG!" : "Copy Code"}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="py-4 rounded-2xl bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-rose-400 transition-all shadow-xl shadow-rose-500/20"
                    >
                        <Download className="w-5 h-5" />
                        Download .svg
                    </button>
                </div>
            </div>

            {/* ─── Controls Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    {/* Shape Toggle */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">Shape Style</label>
                        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[rgb(10,10,15)] rounded-2xl border border-[rgb(35,35,50)]">
                            <button
                                onClick={() => setType("blob")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold transition-all",
                                    type === "blob" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-[rgb(100,100,140)] hover:text-white"
                                )}
                            >
                                <Shapes className="w-3.5 h-3.5" /> BLOBS
                            </button>
                            <button
                                onClick={() => setType("wave")}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold transition-all",
                                    type === "wave" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-[rgb(100,100,140)] hover:text-white"
                                )}
                            >
                                <Wind className="w-3.5 h-3.5" /> WAVES
                            </button>
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Complexity</label>
                                <span className="text-[10px] font-mono text-rose-400">{complexity}</span>
                            </div>
                            <input
                                type="range" min="3" max="20" step="1"
                                value={complexity}
                                onChange={(e) => setComplexity(parseInt(e.target.value))}
                                className="w-full accent-rose-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Contrast</label>
                                <span className="text-[10px] font-mono text-rose-400">{contrast}</span>
                            </div>
                            <input
                                type="range" min="1" max="10" step="0.5"
                                value={contrast}
                                onChange={(e) => setContrast(parseFloat(e.target.value))}
                                className="w-full accent-rose-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Primary Color</label>
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

                <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                    <div className="flex gap-3">
                        <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-bold text-white mb-1">Designer Tip</p>
                            <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                                Low complexity with high contrast creates sharp, aggressive shapes. Use high complexity for smooth, natural blobs.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                        Exported SVVs are optimized and clean, ready to be pasted into your Tailwind, CSS, or Figma projects.
                    </p>
                </div>
            </div>
        </div>
    );
}
