"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Globe,
    Facebook,
    Twitter,
    Copy,
    Check,
    Eye,
    Code2,
    Image as ImageIcon,
    Text
} from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewMode = "google" | "facebook" | "twitter";

export function MetaTagGeneratorTool() {
    const [title, setTitle] = useState("RapidKit — Professional Web Tools");
    const [description, setDescription] = useState("Free online tools for everyone. Fast, private, and no sign-up required. Built by developers, for everyone.");
    const [url, setUrl] = useState("https://rapidkit.tools");
    const [imageUrl, setImageUrl] = useState("https://rapidkit.tools/og-image.png");
    const [siteName, setSiteName] = useState("RapidKit");
    const [previewMode, setPreviewMode] = useState<PreviewMode>("google");
    const [copied, setCopied] = useState(false);

    // ─── Meta Tags Generation ───────────────────────────────────────
    const metaTags = useMemo(() => {
        return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${imageUrl}">`;
    }, [title, description, url, imageUrl]);

    // ─── Handlers ───────────────────────────────────────────────────
    const handleCopy = () => {
        navigator.clipboard.writeText(metaTags);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
            {/* ─── Left Configuration ───────────────────────── */}
            <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Input Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold">Page Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/50"
                                maxLength={70}
                            />
                            <div className="flex justify-between text-[10px]">
                                <span className={cn(title.length > 60 ? "text-amber-400" : "text-[rgb(60,60,90)]")}>Recommended: 50-60 characters</span>
                                <span className="text-[rgb(80,80,120)]">{title.length}/70</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                                maxLength={160}
                            />
                            <div className="flex justify-between text-[10px]">
                                <span className={cn(description.length > 155 ? "text-amber-400" : "text-[rgb(60,60,90)]")}>Recommended: 120-155 characters</span>
                                <span className="text-[rgb(80,80,120)]">{description.length}/160</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold">Site URL</label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold">Preview Image URL</label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/50"
                            />
                            <p className="text-[10px] text-[rgb(60,60,90)] flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> JPG, PNG or WEBP recommended.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-violet-600/5 border border-violet-500/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-violet-400" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Generated Tags</h4>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-all border border-violet-500/20"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-[10px] font-mono text-violet-200/50 overflow-x-auto">
                        {metaTags}
                    </pre>
                </div>
            </div>

            {/* ─── Right Live Preview ───────────────────────── */}
            <div className="space-y-6">
                <div className="flex bg-[rgb(17,17,27)] p-1.5 rounded-2xl border border-[rgb(45,45,65)]">
                    {[
                        { id: "google", icon: Search, label: "Google" },
                        { id: "facebook", icon: Facebook, label: "Facebook" },
                        { id: "twitter", icon: Twitter, label: "Twitter / X" }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setPreviewMode(item.id as PreviewMode)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
                                previewMode === item.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                    : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="relative p-8 lg:p-12 rounded-[2.5rem] bg-[rgb(10,10,15)] border-2 border-[rgb(45,45,65)] flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] -mr-32 -mt-32" />

                    {/* Google Preview */}
                    {previewMode === "google" && (
                        <div className="w-full max-w-sm space-y-1 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 leading-none">{siteName}</span>
                                    <span className="text-[10px] text-gray-500 leading-none">{url}</span>
                                </div>
                            </div>
                            <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer leading-tight truncate">
                                {title}
                            </h4>
                            <p className="text-sm text-[#4d5156] leading-snug line-clamp-2">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Facebook Preview */}
                    {previewMode === "facebook" && (
                        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                            <div className="aspect-[1.91/1] bg-gray-100 overflow-hidden">
                                <img src={imageUrl} alt="Card Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3 bg-[#f2f3f5] border-t border-gray-200">
                                <p className="text-[11px] text-[#606770] uppercase font-semibold">{new URL(url).hostname}</p>
                                <h4 className="text-[15px] font-bold text-[#1d2129] leading-tight truncate mt-0.5">{title}</h4>
                                <p className="text-[13px] text-[#606770] line-clamp-2 leading-snug mt-1">{description}</p>
                            </div>
                        </div>
                    )}

                    {/* Twitter Preview */}
                    {previewMode === "twitter" && (
                        <div className="w-full max-w-md bg-[rgb(17,17,27)] rounded-2xl border border-[rgb(45,45,65)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            <div className="aspect-[1.91/1] overflow-hidden border-b border-[rgb(45,45,65)]">
                                <img src={imageUrl} alt="Twitter Card" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3">
                                <div className="flex items-center gap-1.5 opacity-50 mb-1">
                                    <Globe className="w-3 h-3 text-white" />
                                    <span className="text-[11px] text-white font-medium">{new URL(url).hostname}</span>
                                </div>
                                <h4 className="text-[14px] font-semibold text-white leading-tight truncate">{title}</h4>
                                <p className="text-[13px] text-[rgb(100,100,140)] line-clamp-2 leading-snug mt-1">{description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Eye className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Search Preview</h4>
                            <p className="text-[11px] text-[rgb(100,100,140)] leading-relaxed">
                                Your title and description are the first things users see in Google. Make them compelling!
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-violet-600/5 border border-violet-500/10 flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-violet-600/20 flex items-center justify-center shrink-0">
                            <Text className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Rich Snippets</h4>
                            <p className="text-[11px] text-[rgb(100,100,140)] leading-relaxed">
                                Open Graph tags ensure your images and info pull correctly on platforms like Slack, WhatsApp, and iMessage.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
