/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useCallback } from "react";
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
    FileCode,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewMode = "google" | "facebook" | "twitter";
type OutputFormat = "html" | "nextjs";

export function MetaTagGeneratorTool() {
    const [title, setTitle] = useState("RapidKit — Free Online Web & Developer Tools");
    const [description, setDescription] = useState("38+ fast, private, and 100% free web tools for developers, designers, and marketers. No sign-up or server logs required.");
    const [url, setUrl] = useState("https://getrapidkit.me");
    const [imageUrl, setImageUrl] = useState("https://getrapidkit.me/opengraph-image");
    const [siteName, setSiteName] = useState("RapidKit");
    const [previewMode, setPreviewMode] = useState<PreviewMode>("google");
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("html");
    const [copied, setCopied] = useState(false);

    // ─── Safe Hostname ───────────────────────────────────────────────
    const safeHostname = useMemo(() => {
        try {
            return new URL(url).hostname || "getrapidkit.me";
        } catch {
            return url.replace(/^https?:\/\//, "").split("/")[0] || "getrapidkit.me";
        }
    }, [url]);

    // ─── Standard HTML Meta Tags ─────────────────────────────────────
    const htmlMetaTags = useMemo(() => {
        return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:image" content="${imageUrl}">

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${imageUrl}">`;
    }, [title, description, url, imageUrl, siteName]);

    // ─── Next.js 14/15 App Router Metadata Object ────────────────────
    const nextJsMetadata = useMemo(() => {
        return `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
  metadataBase: new URL(${JSON.stringify(url || "https://getrapidkit.me")}),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    url: ${JSON.stringify(url)},
    siteName: ${JSON.stringify(siteName)},
    images: [
      {
        url: ${JSON.stringify(imageUrl)},
        width: 1200,
        height: 630,
        alt: ${JSON.stringify(title)},
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(title)},
    description: ${JSON.stringify(description)},
    images: [${JSON.stringify(imageUrl)}],
  },
};`;
    }, [title, description, url, imageUrl, siteName]);

    const activeCode = outputFormat === "html" ? htmlMetaTags : nextJsMetadata;

    // ─── Handlers ───────────────────────────────────────────────────
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(activeCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [activeCode]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
            {/* ─── Left Configuration Column ─────────────────────────── */}
            <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-xl space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[rgb(30,30,46)]">
                        <Code2 className="w-4 h-4 text-violet-400" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Metadata Details
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold">
                                Page Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-white text-xs focus:outline-none focus:border-violet-500/50"
                                maxLength={70}
                            />
                            <div className="flex justify-between text-[10px]">
                                <span className={cn(title.length > 60 ? "text-amber-400" : "text-[rgb(100,100,140)]")}>
                                    Recommended: 50-60 characters
                                </span>
                                <span className="text-[rgb(120,120,160)] font-mono">{title.length}/70</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-white text-xs focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
                                maxLength={160}
                            />
                            <div className="flex justify-between text-[10px]">
                                <span className={cn(description.length > 155 ? "text-amber-400" : "text-[rgb(100,100,140)]")}>
                                    Recommended: 120-155 characters
                                </span>
                                <span className="text-[rgb(120,120,160)] font-mono">{description.length}/160</span>
                            </div>
                        </div>

                        {/* Site Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold">
                                Site / Brand Name
                            </label>
                            <input
                                type="text"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-white text-xs focus:outline-none focus:border-violet-500/50"
                            />
                        </div>

                        {/* Site URL */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold">
                                Site URL (Canonical)
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono"
                            />
                        </div>

                        {/* Preview Image URL */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold">
                                OpenGraph / Twitter Image URL
                            </label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-white text-xs focus:outline-none focus:border-violet-500/50 font-mono"
                            />
                            <p className="text-[10px] text-[rgb(100,100,140)] flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-cyan-400" />
                                1200 x 630 px (1.91:1 ratio) recommended
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Output Generator Card ─────────────────────────── */}
                <div className="p-6 rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Format Switcher */}
                        <div className="flex p-0.5 bg-[rgb(20,20,32)] rounded-xl border border-[rgb(45,45,68)]">
                            <button
                                type="button"
                                onClick={() => setOutputFormat("html")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                                    outputFormat === "html"
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(140,140,175)] hover:text-white"
                                )}
                            >
                                <Code2 className="w-3 h-3" />
                                <span>HTML Tags</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setOutputFormat("nextjs")}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                                    outputFormat === "nextjs"
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(140,140,175)] hover:text-white"
                                )}
                            >
                                <FileCode className="w-3 h-3 text-indigo-400" />
                                <span>Next.js App Router</span>
                            </button>
                        </div>

                        {/* Copy Code */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border shadow-sm",
                                copied
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                    : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-white hover:bg-[rgb(28,28,44)] hover:border-violet-500/40"
                            )}
                            title="Copy code to clipboard"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
                            <span>{copied ? "Copied!" : outputFormat === "nextjs" ? "Copy Next.js" : "Copy HTML"}</span>
                        </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] text-[11px] font-mono text-[rgb(180,180,220)] overflow-x-auto max-h-72 leading-relaxed custom-scrollbar">
                        {activeCode}
                    </pre>
                </div>
            </div>

            {/* ─── Right Live Preview Column ─────────────────────────── */}
            <div className="space-y-6">
                {/* Preview Platform Tabs */}
                <div className="flex bg-[rgb(14,14,22)] p-1.5 rounded-2xl border border-[rgb(38,38,58)] shadow-lg">
                    {[
                        { id: "google", icon: Search, label: "Google Search" },
                        { id: "facebook", icon: Facebook, label: "Facebook / OG" },
                        { id: "twitter", icon: Twitter, label: "Twitter / X Card" }
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setPreviewMode(item.id as PreviewMode)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                                previewMode === item.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                                    : "text-[rgb(120,120,160)] hover:text-white"
                            )}
                        >
                            <item.icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Live Preview Display Box */}
                <div className="relative p-6 sm:p-10 rounded-[2.5rem] bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] flex flex-col items-center justify-center min-h-[380px] overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 blur-[110px] pointer-events-none" />

                    {/* Google SERP Preview */}
                    {previewMode === "google" && (
                        <div className="w-full max-w-lg space-y-1.5 p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(38,38,58)] animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[11px] text-[rgb(180,180,210)] font-medium leading-none truncate">{siteName}</span>
                                    <span className="text-[10px] text-[rgb(120,120,160)] leading-none truncate mt-0.5">{url}</span>
                                </div>
                            </div>
                            <h4 className="text-base sm:text-lg text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1 font-medium">
                                {title}
                            </h4>
                            <p className="text-xs text-[rgb(180,180,210)] leading-relaxed line-clamp-2">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Facebook OpenGraph Preview */}
                    {previewMode === "facebook" && (
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                            <div className="aspect-[1.91/1] bg-gray-100 overflow-hidden relative">
                                <img
                                    src={imageUrl}
                                    alt="Card Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <div className="p-3.5 bg-[#f0f2f5] border-t border-gray-200 text-left">
                                <p className="text-[10px] text-[#65676b] uppercase font-bold tracking-wider">{safeHostname}</p>
                                <h4 className="text-[14px] font-bold text-[#050505] leading-snug line-clamp-1 mt-0.5">{title}</h4>
                                <p className="text-[12px] text-[#65676b] line-clamp-2 leading-snug mt-1">{description}</p>
                            </div>
                        </div>
                    )}

                    {/* Twitter / X Large Summary Card Preview */}
                    {previewMode === "twitter" && (
                        <div className="w-full max-w-md bg-[rgb(18,18,28)] rounded-2xl border border-[rgb(45,45,68)] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
                            <div className="aspect-[1.91/1] overflow-hidden border-b border-[rgb(40,40,60)] bg-black/40">
                                <img
                                    src={imageUrl}
                                    alt="Twitter Card"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <div className="p-3.5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[rgb(120,120,160)] text-[11px]">
                                    <Globe className="w-3 h-3 text-cyan-400" />
                                    <span className="font-medium">{safeHostname}</span>
                                </div>
                                <h4 className="text-[14px] font-bold text-white leading-snug line-clamp-1">{title}</h4>
                                <p className="text-[12px] text-[rgb(150,150,185)] line-clamp-2 leading-snug">{description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Educational Insights Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] flex gap-3.5 shadow-lg">
                        <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">CTR Optimization</h4>
                            <p className="text-[11px] text-[rgb(130,130,165)] leading-relaxed">
                                Keep titles under 60 characters to prevent Google from truncating your headline on mobile search results.
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] flex gap-3.5 shadow-lg">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Next.js App Router</h4>
                            <p className="text-[11px] text-[rgb(130,130,165)] leading-relaxed">
                                Copy the <code>metadata</code> object directly into your <code>layout.tsx</code> or <code>page.tsx</code> for native Next.js 14/15 SEO!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
