"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, AlertCircle, X, FileImage, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

type ConvertedFile = {
    name: string;
    originalSize: number;
    convertedSize: number;
    webpUrl: string;
    savings: number;
};

async function convertToWebP(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target?.result as string; };
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas error")); return; }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
                (blob) => { if (blob) resolve(blob); else reject(new Error("Conversion failed")); },
                "image/webp",
                quality / 100
            );
        };
        img.onerror = reject;
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function WebpConverterTool() {
    const [files, setFiles] = useState<ConvertedFile[]>([]);
    const [quality, setQuality] = useState(85);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (fileList: File[]) => {
        setError("");
        setLoading(true);
        const results: ConvertedFile[] = [];

        for (const file of fileList) {
            if (!["image/jpeg", "image/png", "image/gif", "image/bmp"].includes(file.type)) {
                setError(`Skipped "${file.name}" — only JPG, PNG, GIF, BMP are supported.`);
                continue;
            }
            try {
                const converted = await convertToWebP(file, quality);
                const webpUrl = URL.createObjectURL(converted);
                const savings = ((file.size - converted.size) / file.size) * 100;
                results.push({
                    name: file.name.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, ".webp"),
                    originalSize: file.size,
                    convertedSize: converted.size,
                    webpUrl,
                    savings: Math.max(0, savings),
                });
            } catch {
                setError(`Failed to convert ${file.name}`);
            }
        }

        setFiles((prev) => [...prev, ...results]);
        setLoading(false);
    }, [quality]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        processFiles(Array.from(e.dataTransfer.files));
    }, [processFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(Array.from(e.target.files));
    };

    const handleDownload = (file: ConvertedFile) => {
        const a = document.createElement("a");
        a.href = file.webpUrl;
        a.download = file.name;
        a.click();
    };

    const handleRemove = (index: number) => {
        setFiles((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].webpUrl);
            next.splice(index, 1);
            return next;
        });
    };

    const totalSaved = files.reduce((acc, f) => acc + (f.originalSize - f.convertedSize), 0);

    return (
        <div className="space-y-6">
            {/* ─── Quality ─────────────────────────────────── */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[rgb(148,148,186)]">WebP Quality</label>
                    <span className="text-sm font-bold gradient-text">{quality}%</span>
                </div>
                <input
                    type="range" min={10} max={100} step={5} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 rounded-full cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-[rgb(80,80,120)] mt-1">
                    <span>Smallest</span>
                    <span>Best Quality</span>
                </div>
            </div>

            {/* ─── Info Banner ─────────────────────────────── */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
                <Zap className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" />
                <span>WebP images are <strong>25–34% smaller</strong> than JPG/PNG. Better PageSpeed, better SEO, faster websites. Everything runs in your browser — no uploads!</span>
            </div>

            {/* ─── Drop Zone ───────────────────────────────── */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                    isDragOver ? "border-cyan-500 bg-cyan-500/5" : "border-[rgb(45,45,65)] hover:border-cyan-500/40 hover:bg-[rgba(6,182,212,0.02)]"
                )}
            >
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/bmp" multiple onChange={handleChange} className="hidden" />
                <div className="flex flex-col items-center gap-3">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", isDragOver ? "bg-cyan-500/20" : "bg-[rgb(24,24,37)]")}>
                        <Upload className={cn("w-6 h-6", isDragOver ? "text-cyan-400" : "text-[rgb(80,80,120)]")} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Drag & drop JPG/PNG images here</p>
                        <p className="text-xs text-[rgb(80,80,120)] mt-1">or click to browse — converts to WebP instantly</p>
                    </div>
                </div>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgb(10,10,15)]/80 rounded-2xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[rgb(148,148,186)]">Converting...</span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* ─── Results ─────────────────────────────────── */}
            {files.length > 0 && (
                <div className="space-y-4 fade-in-up">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-white">
                            <span className="font-semibold">{files.length}</span> file{files.length > 1 ? "s" : ""} converted
                            {totalSaved > 0 && (
                                <span className="ml-2 text-emerald-400 font-bold">· saved {formatBytes(totalSaved)} total</span>
                            )}
                        </div>
                        {files.length > 1 && (
                            <button
                                onClick={() => files.forEach(handleDownload)}
                                className="btn-primary text-xs px-4 py-2 flex items-center gap-1"
                            >
                                <Download className="w-3 h-3" /> Download All
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {files.map((file, i) => (
                            <div key={i} className="glass-card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                                        <FileImage className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="text-[rgb(80,80,120)]">{formatBytes(file.originalSize)} → {formatBytes(file.convertedSize)}</span>
                                            <span className={cn("font-bold", file.savings > 10 ? "text-emerald-400" : "text-amber-400")}>
                                                -{file.savings.toFixed(1)}% smaller
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 rounded-full bg-[rgb(24,24,37)] overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${file.savings}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => handleDownload(file)} className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors" title="Download WebP">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleRemove(i)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[rgb(80,80,120)] hover:text-white transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
