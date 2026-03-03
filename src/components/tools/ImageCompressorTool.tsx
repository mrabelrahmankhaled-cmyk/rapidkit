"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, AlertCircle, X, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

type CompressedFile = {
    name: string;
    originalSize: number;
    compressedSize: number;
    originalUrl: string;
    compressedUrl: string;
    savings: number;
};

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

async function compressImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas not supported")); return; }
            ctx.drawImage(img, 0, 0);

            const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
            canvas.toBlob(
                (blob) => { if (blob) resolve(blob); else reject(new Error("Compression failed")); },
                mimeType,
                quality / 100
            );
        };

        img.onerror = reject;
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function ImageCompressorTool() {
    const [files, setFiles] = useState<CompressedFile[]>([]);
    const [quality, setQuality] = useState(80);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (fileList: File[]) => {
        setError("");
        setLoading(true);
        const results: CompressedFile[] = [];

        for (const file of fileList) {
            if (!file.type.startsWith("image/")) continue;
            try {
                const compressed = await compressImage(file, quality);
                const originalUrl = URL.createObjectURL(file);
                const compressedUrl = URL.createObjectURL(compressed);
                const savings = ((file.size - compressed.size) / file.size) * 100;
                results.push({
                    name: file.name,
                    originalSize: file.size,
                    compressedSize: compressed.size,
                    originalUrl,
                    compressedUrl,
                    savings: Math.max(0, savings),
                });
            } catch {
                setError(`Failed to compress ${file.name}`);
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

    const handleDownload = (file: CompressedFile) => {
        const a = document.createElement("a");
        a.href = file.compressedUrl;
        a.download = `compressed-${file.name}`;
        a.click();
    };

    const handleRemove = (index: number) => {
        setFiles((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index].originalUrl);
            URL.revokeObjectURL(next[index].compressedUrl);
            next.splice(index, 1);
            return next;
        });
    };

    const downloadAll = () => files.forEach(handleDownload);

    return (
        <div className="space-y-6">
            {/* ─── Quality Slider ─────────────────────────── */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-[rgb(148,148,186)]">Compression Quality</label>
                    <span className="text-sm font-bold gradient-text">{quality}%</span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 rounded-full cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-[rgb(80,80,120)] mt-1">
                    <span>Smallest file</span>
                    <span>Best quality</span>
                </div>
            </div>

            {/* ─── Drop Zone ──────────────────────────────── */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                    isDragOver
                        ? "border-violet-500 bg-violet-500/5"
                        : "border-[rgb(45,45,65)] hover:border-violet-500/40 hover:bg-[rgba(139,92,246,0.03)]"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                        isDragOver ? "bg-violet-500/20" : "bg-[rgb(24,24,37)]"
                    )}>
                        <Upload className={cn("w-6 h-6", isDragOver ? "text-violet-400" : "text-[rgb(80,80,120)]")} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Drag & drop images here</p>
                        <p className="text-xs text-[rgb(80,80,120)] mt-1">or click to browse — JPG, PNG, WebP supported</p>
                    </div>
                </div>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgb(10,10,15)]/80 rounded-2xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-[rgb(148,148,186)]">Compressing...</span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* ─── Results ────────────────────────────────── */}
            {files.length > 0 && (
                <div className="space-y-4 fade-in-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{files.length} file{files.length > 1 ? "s" : ""} compressed</h3>
                        {files.length > 1 && (
                            <button onClick={downloadAll} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                                <Download className="w-3 h-3" /> Download All
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {files.map((file, i) => (
                            <div key={i} className="glass-card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[rgb(24,24,37)] flex items-center justify-center shrink-0">
                                        <FileImage className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                            <span className="text-[rgb(80,80,120)]">
                                                {formatBytes(file.originalSize)} → {formatBytes(file.compressedSize)}
                                            </span>
                                            <span className={cn(
                                                "font-bold",
                                                file.savings > 20 ? "text-emerald-400" : "text-amber-400"
                                            )}>
                                                -{file.savings.toFixed(1)}% saved
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="mt-2 h-1.5 rounded-full bg-[rgb(24,24,37)] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all"
                                                style={{ width: `${file.savings}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="p-2 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemove(i)}
                                            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[rgb(80,80,120)] hover:text-white transition-colors"
                                            title="Remove"
                                        >
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
