"use client";

import { useState, useMemo } from "react";
import {
    Link2,
    Copy,
    Check,
    RotateCcw,
    Sparkles,
    Globe,
    Tag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UtmParams {
    url: string;
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
}

const COMMON_SOURCES = [
    { label: "Google", val: "google" },
    { label: "Facebook", val: "facebook" },
    { label: "Twitter / X", val: "twitter" },
    { label: "LinkedIn", val: "linkedin" },
    { label: "Newsletter", val: "newsletter" },
    { label: "YouTube", val: "youtube" },
    { label: "Instagram", val: "instagram" },
    { label: "TikTok", val: "tiktok" },
];

const COMMON_MEDIUMS = [
    { label: "cpc", val: "cpc" },
    { label: "email", val: "email" },
    { label: "social", val: "social" },
    { label: "referral", val: "referral" },
    { label: "banner", val: "banner" },
    { label: "organic", val: "organic" },
];

export function UtmBuilderTool() {
    const [params, setParams] = useState<UtmParams>({
        url: "https://example.com/product",
        source: "newsletter",
        medium: "email",
        campaign: "spring_launch",
        term: "",
        content: "header_cta",
    });

    const [copied, setCopied] = useState(false);

    // ─── Generate Real-Time UTM URL ──────────────────────────────────
    const generatedUrl = useMemo(() => {
        if (!params.url.trim()) return "";

        let base = params.url.trim();
        // Add protocol if missing
        if (!/^https?:\/\//i.test(base)) {
            base = "https://" + base;
        }

        try {
            const urlObj = new URL(base);

            if (params.source.trim()) {
                urlObj.searchParams.set("utm_source", params.source.trim());
            } else {
                urlObj.searchParams.delete("utm_source");
            }

            if (params.medium.trim()) {
                urlObj.searchParams.set("utm_medium", params.medium.trim());
            } else {
                urlObj.searchParams.delete("utm_medium");
            }

            if (params.campaign.trim()) {
                urlObj.searchParams.set("utm_campaign", params.campaign.trim());
            } else {
                urlObj.searchParams.delete("utm_campaign");
            }

            if (params.term.trim()) {
                urlObj.searchParams.set("utm_term", params.term.trim());
            } else {
                urlObj.searchParams.delete("utm_term");
            }

            if (params.content.trim()) {
                urlObj.searchParams.set("utm_content", params.content.trim());
            } else {
                urlObj.searchParams.delete("utm_content");
            }

            return urlObj.toString();
        } catch {
            return base;
        }
    }, [params]);

    const handleCopy = () => {
        if (!generatedUrl) return;
        navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setParams({
            url: "",
            source: "",
            medium: "",
            campaign: "",
            term: "",
            content: "",
        });
    };

    const isMissingRequired = !params.url.trim() || !params.source.trim();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Form & URL Generator ─── */}
            <div className="space-y-6">
                {/* Result Preview Box (Sticky on Mobile/Top) */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                            <Link2 className="w-4 h-4" /> Generated Campaign URL
                        </span>
                        {isMissingRequired ? (
                            <span className="text-[11px] font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                                Fill required fields (*)
                            </span>
                        ) : (
                            <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                Ready to track
                            </span>
                        )}
                    </div>

                    <div className="p-4 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] font-mono text-sm break-all select-all text-white min-h-[56px] flex items-center">
                        {generatedUrl ? (
                            <span className="text-[rgb(230,230,250)]">{generatedUrl}</span>
                        ) : (
                            <span className="text-[rgb(100,100,140)]">Enter your website URL and source below...</span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={!generatedUrl}
                                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold disabled:opacity-50"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? "Copied to Clipboard!" : "Copy URL"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] text-xs text-[rgb(148,148,186)] hover:text-white transition-colors"
                                title="Reset all fields"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        </div>

                        <span className="text-xs text-[rgb(110,110,150)]">
                            Length: <strong className="text-white font-mono">{generatedUrl.length}</strong> chars
                        </span>
                    </div>
                </div>

                {/* Form Inputs */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-violet-400" />
                        <span>Campaign Parameters</span>
                    </h3>

                    <div className="space-y-5">
                        {/* 1. Website URL (Required) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white flex items-center gap-1">
                                <span>Website URL</span>
                                <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <Globe className="w-4 h-4 text-[rgb(120,120,160)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={params.url}
                                    onChange={(e) => setParams({ ...params, url: e.target.value })}
                                    placeholder="https://yourdomain.com/landing-page"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                                />
                            </div>
                            <p className="text-[11px] text-[rgb(110,110,150)]">
                                The full landing page URL you want your traffic directed to.
                            </p>
                        </div>

                        {/* 2. Campaign Source (Required) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white flex items-center gap-1">
                                <span>Campaign Source (<code className="text-[11px] text-violet-300 font-mono">utm_source</code>)</span>
                                <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={params.source}
                                onChange={(e) => setParams({ ...params, source: e.target.value })}
                                placeholder="e.g. google, newsletter, twitter, linkedin"
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                            />
                            {/* Preset source chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-[rgb(100,100,140)]">Quick select:</span>
                                {COMMON_SOURCES.map((s) => (
                                    <button
                                        key={s.val}
                                        type="button"
                                        onClick={() => setParams({ ...params, source: s.val })}
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-md border transition-all",
                                            params.source === s.val
                                                ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                                                : "bg-[rgb(22,22,34)] border-[rgb(40,40,60)] text-[rgb(130,130,170)] hover:text-white"
                                        )}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Campaign Medium */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white">
                                Campaign Medium (<code className="text-[11px] text-cyan-300 font-mono">utm_medium</code>)
                            </label>
                            <input
                                type="text"
                                value={params.medium}
                                onChange={(e) => setParams({ ...params, medium: e.target.value })}
                                placeholder="e.g. cpc, email, banner, social, referral"
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                            />
                            {/* Preset medium chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-[rgb(100,100,140)]">Quick select:</span>
                                {COMMON_MEDIUMS.map((m) => (
                                    <button
                                        key={m.val}
                                        type="button"
                                        onClick={() => setParams({ ...params, medium: m.val })}
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-md border transition-all",
                                            params.medium === m.val
                                                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                                : "bg-[rgb(22,22,34)] border-[rgb(40,40,60)] text-[rgb(130,130,170)] hover:text-white"
                                        )}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Campaign Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white">
                                Campaign Name (<code className="text-[11px] text-pink-300 font-mono">utm_campaign</code>)
                            </label>
                            <input
                                type="text"
                                value={params.campaign}
                                onChange={(e) => setParams({ ...params, campaign: e.target.value })}
                                placeholder="e.g. black_friday_2026, product_launch, free_trial"
                                className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                            />
                            <p className="text-[11px] text-[rgb(110,110,150)]">
                                Identifies the strategic promotion or launch theme.
                            </p>
                        </div>

                        {/* 5 & 6. Term & Content (2-Column Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white">
                                    Campaign Term (<code className="text-[11px] text-amber-300 font-mono">utm_term</code>)
                                </label>
                                <input
                                    type="text"
                                    value={params.term}
                                    onChange={(e) => setParams({ ...params, term: e.target.value })}
                                    placeholder="e.g. running+shoes, seo+tools"
                                    className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                                />
                                <p className="text-[10px] text-[rgb(110,110,150)]">
                                    Used mainly for paid search keyword attribution.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-white">
                                    Campaign Content (<code className="text-[11px] text-emerald-300 font-mono">utm_content</code>)
                                </label>
                                <input
                                    type="text"
                                    value={params.content}
                                    onChange={(e) => setParams({ ...params, content: e.target.value })}
                                    placeholder="e.g. blue_button, footer_link, variant_b"
                                    className="w-full px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-violet-500/60 transition-all"
                                />
                                <p className="text-[10px] text-[rgb(110,110,150)]">
                                    Differentiates ads or links pointing to the same URL (A/B testing).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar / Reference ─── */}
            <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-600/20 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 mb-3 opacity-60" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2">UTM Parameter Cheatsheet</h4>
                    <p className="text-xs text-white/90 leading-relaxed">
                        UTM (Urchin Tracking Module) codes are standard query parameters recognized by Google Analytics 4 (GA4), Mixpanel, and PostHog to attribute conversions accurately.
                    </p>
                </div>

                <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-4">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                        Tracking Best Practices
                    </h4>

                    <div className="space-y-3.5 text-xs text-[rgb(148,148,186)]">
                        <div className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span><strong>Use lowercase only:</strong> Google Analytics treats <code>Email</code> and <code>email</code> as two separate sources.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span><strong>Use underscores or hyphens:</strong> Avoid spaces; use <code>spring_launch</code> or <code>spring-launch</code>.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <span className="text-rose-400 font-bold">✕</span>
                            <span><strong>Don&apos;t use for internal links:</strong> Only use UTMs on inbound links from outside sources, not across your own site pages.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
