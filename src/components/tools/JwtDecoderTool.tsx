"use client";

import { useState, useMemo, useEffect } from "react";
import {
    KeyRound,
    Copy,
    Check,
    AlertTriangle,
    Sparkles,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample JWT for 1-click test
const SAMPLE_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJzdWIiOiJ1c3JfOTA4MjM0IiwibmFtZSI6IkFsZXggSm9obnNvbiIsImVtYWlsIjoiYWxleEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NzkwODAwMCwiZXhwIjoyMDgzMjY4ODAwfQ." +
    "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(str: string): string {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("Invalid base64url string length");
    }

    try {
        const decoded = atob(output);
        return decodeURIComponent(
            decoded
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
    } catch {
        return atob(output);
    }
}

export function JwtDecoderTool() {
    const [token, setToken] = useState<string>(SAMPLE_JWT);
    const [copiedPart, setCopiedPart] = useState<"header" | "payload" | "all" | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    useEffect(() => {
        queueMicrotask(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        });
    }, []);

    // ─── Token Decomposition & Decoding ──────────────────────────────
    const decodedResult = useMemo(() => {
        const clean = token.trim();
        if (!clean) {
            return {
                isValid: false,
                parts: [],
                headerJson: "",
                payloadJson: "",
                signature: "",
                headerObj: null as Record<string, unknown> | null,
                payloadObj: null as Record<string, unknown> | null,
                expTimestamp: null as number | null,
                iatTimestamp: null as number | null,
                isExpired: null as boolean | null,
                error: null as string | null,
            };
        }

        const parts = clean.split(".");
        if (parts.length < 2) {
            return {
                isValid: false,
                parts,
                headerJson: "",
                payloadJson: "",
                signature: "",
                headerObj: null,
                payloadObj: null,
                expTimestamp: null,
                iatTimestamp: null,
                isExpired: null,
                error: "Invalid JWT format. A valid token must have at least 2 or 3 dot-separated parts (header.payload.signature).",
            };
        }

        try {
            const rawHeader = base64UrlDecode(parts[0]);
            const rawPayload = base64UrlDecode(parts[1]);

            const headerObj = JSON.parse(rawHeader);
            const payloadObj = JSON.parse(rawPayload);
            const expTimestamp = typeof payloadObj.exp === "number" ? payloadObj.exp : null;
            const iatTimestamp = typeof payloadObj.iat === "number" ? payloadObj.iat : null;
            const isExpired = expTimestamp !== null && currentTime > 0 ? currentTime >= expTimestamp : null;

            return {
                isValid: true,
                parts,
                headerJson: JSON.stringify(headerObj, null, 2),
                payloadJson: JSON.stringify(payloadObj, null, 2),
                signature: parts[2] || "",
                headerObj,
                payloadObj,
                expTimestamp,
                iatTimestamp,
                isExpired,
                error: null,
            };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to decode base64 or parse JSON";
            return {
                isValid: false,
                parts,
                headerJson: "",
                payloadJson: "",
                signature: parts[2] || "",
                headerObj: null,
                payloadObj: null,
                expTimestamp: null,
                iatTimestamp: null,
                isExpired: null,
                error: `Decoding error: ${msg}`,
            };
        }
    }, [token, currentTime]);

    const handleCopy = (content: string, type: "header" | "payload" | "all") => {
        navigator.clipboard.writeText(content);
        setCopiedPart(type);
        setTimeout(() => setCopiedPart(null), 2000);
    };

    const formatDate = (unixSeconds: number) => {
        return new Date(unixSeconds * 1000).toUTCString();
    };

    return (
        <div className="space-y-8">
            {/* ─── Security Warning Banner ──────────────────────────── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed space-y-1">
                    <p className="font-semibold text-white">
                        Warning: Signature validation is not performed. Tokens are decoded client-side only.
                    </p>
                    <p className="text-amber-200/80 text-xs">
                        Never paste sensitive private keys. All decoding executes 100% locally in your browser memory — no data is ever sent across the network.
                    </p>
                </div>
            </div>

            {/* ─── Main Input & Output Split ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left: Encoded Token Input */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" /> Encoded JWT Token
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setToken(SAMPLE_JWT)}
                                className="text-xs text-[rgb(130,130,170)] hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Sparkles className="w-3 h-3 text-cyan-400" /> Sample
                            </button>
                            <button
                                type="button"
                                onClick={() => setToken("")}
                                className="text-xs text-[rgb(130,130,170)] hover:text-rose-400 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your JSON Web Token here (header.payload.signature)..."
                        className="w-full h-80 p-4 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm font-mono text-[rgb(230,230,250)] placeholder-[rgb(80,80,120)] focus:outline-none focus:border-violet-500/60 leading-relaxed resize-none custom-scrollbar selection:bg-violet-500/30 break-all"
                        spellCheck={false}
                    />

                    {/* JWT 3-Part Color Legend */}
                    <div className="flex items-center gap-4 text-[11px] text-[rgb(120,120,160)] font-medium pt-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span>Header</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                            <span>Payload</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            <span>Signature</span>
                        </div>
                    </div>

                    {decodedResult.error && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                            {decodedResult.error}
                        </div>
                    )}
                </div>

                {/* Right: Decoded Header & Payload Panels */}
                <div className="space-y-6">
                    {/* Header Block */}
                    <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                                    Decoded Header
                                </h4>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopy(decodedResult.headerJson, "header")}
                                disabled={!decodedResult.isValid}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-violet-500/40 text-[rgb(148,148,186)] hover:text-white transition-all disabled:opacity-50"
                            >
                                {copiedPart === "header" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPart === "header" ? "Copied" : "Copy"}</span>
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-[rgb(8,8,14)] border border-[rgb(35,35,50)] font-mono text-xs text-rose-300/90 overflow-x-auto min-h-[90px] custom-scrollbar selection:bg-rose-500/30">
                            {decodedResult.headerJson || '{\n  /* Waiting for token... */\n}'}
                        </pre>
                    </div>

                    {/* Payload Block */}
                    <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-400" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                                    Decoded Payload
                                </h4>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleCopy(decodedResult.payloadJson, "payload")}
                                disabled={!decodedResult.isValid}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] hover:border-violet-500/40 text-[rgb(148,148,186)] hover:text-white transition-all disabled:opacity-50"
                            >
                                {copiedPart === "payload" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedPart === "payload" ? "Copied" : "Copy"}</span>
                            </button>
                        </div>

                        <pre className="p-4 rounded-xl bg-[rgb(8,8,14)] border border-[rgb(35,35,50)] font-mono text-xs text-violet-300/90 overflow-x-auto min-h-[170px] custom-scrollbar selection:bg-violet-500/30">
                            {decodedResult.payloadJson || '{\n  /* Waiting for token... */\n}'}
                        </pre>
                    </div>
                </div>
            </div>

            {/* ─── Metadata Cards (Algorithm, Expiration, Issued At) ─── */}
            {decodedResult.isValid && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                    {/* Algorithm */}
                    <div className="p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(110,110,150)]">
                            Signing Algorithm (alg)
                        </span>
                        <p className="text-lg font-bold font-mono text-white">
                            {String(decodedResult.headerObj?.alg || "None")}
                        </p>
                    </div>

                    {/* Type */}
                    <div className="p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(110,110,150)]">
                            Token Type (typ)
                        </span>
                        <p className="text-lg font-bold font-mono text-white">
                            {String(decodedResult.headerObj?.typ || "JWT")}
                        </p>
                    </div>

                    {/* Expiration Status */}
                    <div className="p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(110,110,150)]">
                            Expiration (exp)
                        </span>
                        {decodedResult.expTimestamp ? (
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                                    decodedResult.isExpired
                                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                                        : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                                )}>
                                    {decodedResult.isExpired ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    <span>{decodedResult.isExpired ? "Expired" : "Active"}</span>
                                </span>
                                <span className="text-xs font-mono text-[rgb(130,130,170)]">
                                    {new Date(decodedResult.expTimestamp * 1000).toLocaleDateString()}
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-[rgb(130,130,170)]">No exp claim</p>
                        )}
                    </div>

                    {/* Issued At */}
                    <div className="p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(110,110,150)]">
                            Issued At (iat)
                        </span>
                        <p className="text-xs font-mono text-[rgb(180,180,210)] truncate">
                            {decodedResult.iatTimestamp ? formatDate(decodedResult.iatTimestamp) : "No iat claim"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
