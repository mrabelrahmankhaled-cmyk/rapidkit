"use client";

import { useState } from "react";
import { Download, Link2, AlertCircle, CheckCircle, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Quality = {
    label: string;
    key: string;
    res: string;
    url: string;
};

function getThumbnails(videoId: string): Quality[] {
    return [
        { label: "Max Resolution", key: "maxresdefault", res: "1280×720", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        { label: "Standard Quality", key: "sddefault", res: "640×480", url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
        { label: "High Quality", key: "hqdefault", res: "480×360", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        { label: "Medium Quality", key: "mqdefault", res: "320×180", url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
    ];
}

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export function YoutubeThumbnailTool() {
    const [url, setUrl] = useState("");
    const [videoId, setVideoId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState("maxresdefault");
    const [copied, setCopied] = useState(false);

    const handleFetch = () => {
        setError("");
        setVideoId(null);
        if (!url.trim()) { setError("Please paste a YouTube URL first."); return; }
        const id = extractVideoId(url.trim());
        if (!id) { setError("Invalid YouTube URL. Please check and try again."); return; }
        setVideoId(id);
    };

    const thumbnails = videoId ? getThumbnails(videoId) : [];
    const current = thumbnails.find((t) => t.key === selected);

    const handleDownload = async () => {
        if (!current) return;
        try {
            const res = await fetch(current.url);
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `thumbnail-${videoId}-${selected}.jpg`;
            a.click();
            URL.revokeObjectURL(objectUrl);
        } catch {
            // fallback: open in new tab
            window.open(current.url, "_blank");
        }
    };

    const handleCopyUrl = () => {
        if (!current) return;
        navigator.clipboard.writeText(current.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* ─── Input ──────────────────────────────────── */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-[rgb(148,148,186)]">
                    YouTube Video URL
                </label>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(80,80,120)]" />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); setError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(80,80,120)] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={handleFetch}
                        className="btn-primary flex items-center gap-2 px-6 whitespace-nowrap"
                    >
                        Get Thumbnails
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            {/* ─── Results ────────────────────────────────── */}
            {videoId && thumbnails.length > 0 && (
                <div className="space-y-5 fade-in-up">
                    {/* Success message */}
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4" />
                        Thumbnails found! Select a quality and download.
                    </div>

                    {/* Quality Selector */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(148,148,186)] mb-3">Select Quality</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {thumbnails.map((thumb) => (
                                <button
                                    key={thumb.key}
                                    onClick={() => setSelected(thumb.key)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all text-xs",
                                        selected === thumb.key
                                            ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                                            : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] text-[rgb(80,80,120)] hover:border-[rgb(80,80,120)]"
                                    )}
                                >
                                    <div className="font-semibold mb-0.5">{thumb.label}</div>
                                    <div className="text-[10px] opacity-70">{thumb.res}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {current && (
                        <div className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden border border-[rgb(45,45,65)] bg-[rgb(17,17,27)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={current.url}
                                    alt="YouTube Thumbnail"
                                    className="w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = thumbnails[thumbnails.length - 1].url;
                                    }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download ({current.res})
                                </button>
                                <button
                                    onClick={handleCopyUrl}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                                        copied
                                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                            : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] text-[rgb(148,148,186)] hover:border-violet-500/40"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy URL"}
                                </button>
                                <a
                                    href={`https://youtube.com/watch?v=${videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgb(45,45,65)] bg-[rgb(17,17,27)] text-sm text-[rgb(148,148,186)] hover:border-red-500/40 hover:text-red-400 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Video
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
