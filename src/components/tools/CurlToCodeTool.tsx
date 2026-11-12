"use client";

import { useState, useMemo } from "react";
import {
    Terminal,
    Copy,
    Check,
    Trash2,
    AlertTriangle,
    AlertCircle,
    Info,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { convertCurl, type CurlTargetLanguage } from "@/lib/curlToCode";

type Preset = {
    id: string;
    label: string;
    command: string;
};

const PRESETS: Preset[] = [
    {
        id: "post-json",
        label: "POST JSON",
        command: `curl -X POST https://api.example.com/v1/projects \\
  -H "Authorization: Bearer rk_test_token_123" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"RapidKit Sync","active":true,"tags":["api","dev"]}'`,
    },
    {
        id: "get-bearer-query",
        label: "GET + Bearer & Query",
        command: `curl -G "https://api.example.com/v1/search" \\
  --oauth2-bearer "rk_test_token_123" \\
  -d "q=typescript" \\
  -d "tag=web" \\
  -d "tag=tools"`,
    },
    {
        id: "basic-auth-form",
        label: "Basic Auth + Form",
        command: `curl -X POST https://auth.example.com/oauth/token \\
  -u "client_app:secret_key_99" \\
  --data-urlencode "grant_type=client_credentials" \\
  --data-urlencode "scope=read:profile"`,
    },
];

const TARGETS: { id: CurlTargetLanguage; label: string; hint: string }[] = [
    { id: "fetch", label: "JavaScript (fetch)", hint: "Web & Node.js 18+" },
    { id: "requests", label: "Python (requests)", hint: "Python 3 + requests" },
];

export function CurlToCodeTool() {
    const [curlInput, setCurlInput] = useState<string>(PRESETS[0].command);
    const [target, setTarget] = useState<CurlTargetLanguage>("fetch");
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

    const conversion = useMemo(() => convertCurl(curlInput, target), [curlInput, target]);

    const handleCopy = async () => {
        if (!conversion.code) return;
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error("Clipboard API unavailable");
            }
            await navigator.clipboard.writeText(conversion.code);
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 2000);
        } catch {
            setCopyState("error");
            setTimeout(() => setCopyState("idle"), 2500);
        }
    };

    const handleClear = () => {
        setCurlInput("");
        setCopyState("idle");
    };

    const hasInput = curlInput.trim().length > 0;
    const req = conversion.request;
    const warningCount = conversion.warnings.filter((w) => w.severity === "warning").length;

    return (
        <div className="space-y-6">
            {/* ─── Top Bar: Target Tabs & Sample Presets ─── */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <div
                    role="tablist"
                    aria-label="Target language"
                    className="flex p-1 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]"
                >
                    {TARGETS.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={target === t.id}
                            onClick={() => setTarget(t.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                                target === t.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                    : "text-[rgb(120,120,160)] hover:text-white"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-[rgb(100,100,140)] flex items-center gap-1 mr-1">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Samples:
                    </span>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => {
                                setCurlInput(preset.command);
                                setCopyState("idle");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-[rgb(160,160,195)] hover:text-white hover:border-violet-500/40 transition-colors"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Main Split Panels ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Input Panel */}
                <div className="flex flex-col rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(30,30,46)] bg-[rgb(12,12,20)]">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <label htmlFor="curl-command-input" className="text-xs font-bold uppercase tracking-wider text-white">
                                cURL Command
                            </label>
                        </div>
                        <button
                            onClick={handleClear}
                            disabled={!hasInput}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                                hasInput
                                    ? "text-[rgb(160,160,195)] hover:text-rose-400 hover:bg-rose-500/10"
                                    : "text-[rgb(70,70,100)] cursor-not-allowed"
                            )}
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                    </div>
                    <textarea
                        id="curl-command-input"
                        value={curlInput}
                        onChange={(e) => {
                            setCurlInput(e.target.value);
                            setCopyState("idle");
                        }}
                        placeholder={'Paste a cURL command here...\ne.g. curl -X POST https://api.example.com/items -H "Content-Type: application/json" -d \'{"name":"test"}\''}
                        spellCheck={false}
                        className="w-full min-h-[300px] flex-1 p-4 bg-[rgb(10,10,15)] text-sm font-mono text-[rgb(220,220,245)] placeholder:text-[rgb(80,80,115)] focus:outline-none resize-y leading-relaxed"
                    />
                    <div className="px-4 py-2.5 border-t border-[rgb(30,30,46)] bg-[rgb(12,12,20)] flex items-center gap-2 text-[11px] text-[rgb(120,120,155)]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>100% client-side text parsing — pasted tokens and commands never leave your browser.</span>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col">
                    <div className="flex-1 flex flex-col rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(30,30,46)] bg-[rgb(12,12,20)]">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                                {TARGETS.find((t) => t.id === target)?.label}
                            </span>
                            <span className="text-[11px] text-[rgb(110,110,150)]">
                                {TARGETS.find((t) => t.id === target)?.hint}
                            </span>
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!conversion.code}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                !conversion.code && "opacity-50 cursor-not-allowed bg-[rgb(20,20,32)] border-[rgb(35,35,55)] text-[rgb(90,90,120)]",
                                conversion.code && copyState === "idle" && "bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30",
                                copyState === "copied" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                                copyState === "error" && "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            )}
                        >
                            {copyState === "copied" ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : copyState === "error" ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                            {copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy Failed" : "Copy Code"}
                        </button>
                    </div>

                    <div className="flex-1 min-h-[300px] p-4 bg-[rgb(10,10,15)] overflow-x-auto">
                        {conversion.error ? (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <div className="text-xs text-rose-200 leading-relaxed">
                                    <p className="font-semibold mb-1">Could not parse cURL command</p>
                                    <p>{conversion.error}</p>
                                </div>
                            </div>
                        ) : conversion.code ? (
                            <pre className="text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed whitespace-pre">
                                <code>{conversion.code}</code>
                            </pre>
                        ) : (
                            <p className="text-xs text-[rgb(90,90,125)] font-mono">
                                Paste a cURL command on the left to generate code...
                            </p>
                        )}
                    </div>

                    {/* Request Summary Badges */}
                    <div className="px-4 py-2.5 border-t border-[rgb(30,30,46)] bg-[rgb(12,12,20)] flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/25 text-violet-300 font-semibold">
                            METHOD: {hasInput && !conversion.error ? req.method : "-"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[rgb(22,22,36)] border border-[rgb(40,40,60)] text-[rgb(175,175,205)]">
                            HEADERS: {hasInput && !conversion.error ? req.headers.length : 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[rgb(22,22,36)] border border-[rgb(40,40,60)] text-[rgb(175,175,205)]">
                            PARAMS: {hasInput && !conversion.error ? req.queryParams.length : 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[rgb(22,22,36)] border border-[rgb(40,40,60)] text-[rgb(175,175,205)] uppercase">
                            BODY: {hasInput && !conversion.error ? req.body.kind : "none"}
                        </span>
                    </div>
                    </div>
                    <p className="mt-2 px-1 text-[11px] text-[rgb(120,120,155)]">
                        Generated code contains your tokens and passwords — review before sharing.
                    </p>
                </div>
            </div>

            {/* ─── Warnings / Notes Banner ─────────────────── */}
            {conversion.warnings.length > 0 && (
                <div
                    role="region"
                    aria-label="Conversion notices and warnings"
                    className={cn(
                        "p-4 rounded-2xl border space-y-2",
                        warningCount > 0
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-sky-500/10 border-sky-500/25"
                    )}
                >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                        {warningCount > 0 ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                            <Info className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                        <span>Conversion Notices ({conversion.warnings.length})</span>
                    </div>
                    <ul className="space-y-1.5 text-xs leading-relaxed">
                        {conversion.warnings.map((w, idx) => (
                            <li key={`${w.flag}-${idx}`} className="flex items-start gap-2 text-[rgb(215,215,235)]">
                                <span
                                    className={cn(
                                        "px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 mt-0.5",
                                        w.severity === "warning"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : "bg-sky-500/20 text-sky-300"
                                    )}
                                >
                                    {w.flag}
                                </span>
                                <span>{w.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
