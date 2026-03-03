"use client";

import { useState } from "react";
import { Tags, Copy, Check, Search, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    // Raw ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
}

type TagResult = {
    videoId: string;
    title: string;
    tags: string[];
};

export function YoutubeTagExtractorTool() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TagResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const handleExtract = async () => {
        const videoId = extractVideoId(url.trim());
        if (!videoId) {
            setError("Please enter a valid YouTube video URL.");
            setResult(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Fetch the YouTube page and parse meta tags
            const res = await fetch(`/api/youtube-tags?id=${videoId}`);
            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || "Failed to fetch video data.");
            }

            setResult({ videoId, title: data.title, tags: data.tags });
        } catch (e) {
            setError((e as Error).message || "Could not fetch tags. The video may be private or tags may be hidden.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAll = () => {
        if (!result?.tags.length) return;
        navigator.clipboard.writeText(result.tags.join(", "));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 1500);
    };

    const thumbnailUrl = result?.videoId
        ? `https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`
        : null;

    return (
        <div className="space-y-5">
            {/* ─── Input ──────────────────────────────────── */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(80,80,120)]" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                        placeholder="Paste YouTube video URL or video ID..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(45,45,65)] focus:outline-none focus:border-red-500/50 text-sm transition-colors"
                    />
                </div>
                <button
                    onClick={handleExtract}
                    disabled={loading || !url.trim()}
                    className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tags className="w-4 h-4" />}
                    {loading ? "Fetching..." : "Extract Tags"}
                </button>
            </div>

            {/* ─── Error ──────────────────────────────────── */}
            {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* ─── Results ────────────────────────────────── */}
            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Video Preview */}
                    <div className="flex gap-4 p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                        {thumbnailUrl && (
                            <img
                                src={thumbnailUrl}
                                alt={result.title}
                                className="w-28 h-16 object-cover rounded-lg shrink-0 bg-[rgb(30,30,46)]"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm leading-snug line-clamp-2 mb-1">{result.title}</p>
                            <a
                                href={`https://www.youtube.com/watch?v=${result.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[rgb(80,80,120)] hover:text-red-400 flex items-center gap-1 transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" /> View on YouTube
                            </a>
                        </div>
                    </div>

                    {/* Tags Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Tags className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-white">
                                {result.tags.length > 0 ? `${result.tags.length} Tags Found` : "No Tags Found"}
                            </span>
                        </div>
                        {result.tags.length > 0 && (
                            <button
                                onClick={handleCopyAll}
                                className={cn(
                                    "text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all",
                                    copied
                                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                        : "text-[rgb(80,80,120)] border-[rgb(45,45,65)] hover:text-white hover:border-[rgb(80,80,120)]"
                                )}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Copied All!" : "Copy All Tags"}
                            </button>
                        )}
                    </div>

                    {/* Tags Grid */}
                    {result.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleCopyTag(tag)}
                                    title="Click to copy"
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer",
                                        copiedTag === tag
                                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                            : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:border-red-500/40 hover:text-white hover:bg-red-500/5"
                                    )}
                                >
                                    {copiedTag === tag ? "✓ " : "# "}{tag}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-[rgb(80,80,120)] text-sm">
                            <Tags className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p>This video has no public tags, or tags are hidden by the creator.</p>
                        </div>
                    )}

                    {/* Stats */}
                    {result.tags.length > 0 && (
                        <div className="text-xs text-[rgb(80,80,120)] p-3 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(30,30,46)]">
                            💡 <strong className="text-[rgb(148,148,186)]">Pro Tip:</strong> Click any tag to copy it individually, or use &quot;Copy All Tags&quot; to get a comma-separated list ready for your video.
                        </div>
                    )}
                </div>
            )}

            {/* ─── Empty State ─────────────────────────────── */}
            {!result && !error && !loading && (
                <div className="text-center py-12 text-[rgb(45,45,65)]">
                    <Tags className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Enter a YouTube URL above to extract its hidden tags</p>
                </div>
            )}
        </div>
    );
}
