"use client";

import { useState, useMemo } from "react";
import {
    Link,
    Search,
    Globe,
    Folder,
    Hash,
    Table,
    Copy,
    Check,
    RefreshCw,
    ExternalLink,
    Shield,
    Info,
    Braces,
    Zap,
    Network
} from "lucide-react";
import { cn } from "@/lib/utils";

type ParsedUrl = {
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    queryParams: { key: string; value: string }[];
};

export function UrlParserTool() {
    const [urlInput, setUrlInput] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const parsed = useMemo((): ParsedUrl | null => {
        if (!urlInput.trim()) return null;
        try {
            // Add protocol if missing for parsing
            let normalizedUrl = urlInput.trim();
            if (!/^https?:\/\//i.test(normalizedUrl)) {
                normalizedUrl = "https://" + normalizedUrl;
            }

            const url = new URL(normalizedUrl);
            const queryParams: { key: string; value: string }[] = [];
            url.searchParams.forEach((value, key) => {
                queryParams.push({ key, value });
            });

            return {
                protocol: url.protocol.replace(":", ""),
                host: url.host,
                hostname: url.hostname,
                port: url.port || (url.protocol === "https:" ? "443" : "80"),
                pathname: url.pathname,
                search: url.search,
                hash: url.hash,
                origin: url.origin,
                queryParams
            };
        } catch (e) {
            return null;
        }
    }, [urlInput]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const InfoCard = ({ icon: Icon, title, value, id, color }: any) => (
        <div className="p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] group hover:border-indigo-500/30 transition-all relative">
            <div className="flex items-center gap-4 mb-3">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">{title}</span>
                {value && (
                    <button
                        onClick={() => handleCopy(value, id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-xl"
                    >
                        {copied === id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[rgb(80,80,120)]" />}
                    </button>
                )}
            </div>
            <p className="text-sm font-mono font-bold text-white break-all leading-relaxed bg-[rgb(10,10,15)] p-3 rounded-2xl border border-white/5">
                {value || "-"}
            </p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* ─── Main Parser Zone ─── */}
            <div className="space-y-8">
                {/* Input Area */}
                <div className="p-10 rounded-[4rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Link className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">URL Debugger</h2>
                                <p className="text-xs text-[rgb(100,100,140)] font-medium">Paste your complex link for deep inspection</p>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/api/v1/users?id=123&ref=google#profile"
                                className="w-full h-18 bg-[rgb(17,17,27)] border-2 border-[rgb(45,45,65)] rounded-[2rem] pl-16 pr-8 text-white font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-[rgb(40,40,60)]"
                            />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[rgb(60,60,80)]" />
                        </div>

                        {urlInput && !parsed && (
                            <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase tracking-widest pl-4">
                                <Shield className="w-3.5 h-3.5" /> Invalid URL Format
                            </div>
                        )}
                    </div>
                </div>

                {parsed && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard title="Protocol" value={parsed.protocol} id="proto" icon={Zap} color="bg-amber-500/10 text-amber-500" />
                            <InfoCard title="Hostname" value={parsed.hostname} id="host" icon={Globe} color="bg-indigo-500/10 text-indigo-400" />
                            <InfoCard title="Pathname" value={parsed.pathname} id="path" icon={Folder} color="bg-emerald-500/10 text-emerald-400" />
                            <InfoCard title="Origin" value={parsed.origin} id="origin" icon={Network} color="bg-rose-500/10 text-rose-400" />
                        </div>

                        {/* Query Parameters Table */}
                        <div className="p-10 rounded-[3.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <Table className="w-4 h-4 text-indigo-400" />
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Query Parameters ({parsed.queryParams.length})</h3>
                                </div>
                                {parsed.queryParams.length > 0 && (
                                    <button
                                        onClick={() => handleCopy(JSON.stringify(Object.fromEntries(parsed.queryParams.map(p => [p.key, p.value])), null, 2), "json")}
                                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Braces className="w-3.5 h-3.5" /> {copied === "json" ? "JSON Copied!" : "Export as JSON"}
                                    </button>
                                )}
                            </div>

                            {parsed.queryParams.length > 0 ? (
                                <div className="overflow-hidden rounded-3xl border border-white/5 bg-[rgb(10,10,15)]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5">
                                                <th className="px-6 py-4 text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest border-b border-white/5">Key</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest border-b border-white/5">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsed.queryParams.map((param, idx) => (
                                                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-300 border-b border-white/5 w-1/3 break-all">{param.key}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-white/70 border-b border-white/5 break-all">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span>{param.value}</span>
                                                            <button
                                                                onClick={() => handleCopy(param.value, `val-${idx}`)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg shrink-0"
                                                            >
                                                                {copied === `val-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[rgb(60,60,80)]" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center rounded-3xl border border-dashed border-[rgb(45,45,65)]">
                                    <Info className="w-8 h-8 text-[rgb(45,45,65)] mx-auto mb-4" />
                                    <p className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest">No Query Parameters Found</p>
                                </div>
                            )}

                            {parsed.hash && (
                                <div className="pt-4 flex items-center gap-3">
                                    <Hash className="w-4 h-4 text-rose-400" />
                                    <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Fragment (#):</span>
                                    <code className="text-xs font-mono text-rose-300 bg-rose-500/5 px-3 py-1 rounded-lg border border-rose-500/10">{parsed.hash}</code>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Sidebar Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Security Audit</span>
                    </div>

                    <div className="space-y-4">
                        <div className={cn(
                            "p-5 rounded-2xl border flex items-center gap-4 transition-all",
                            parsed?.protocol === "https" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"
                        )}>
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                parsed?.protocol === "https" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                                {parsed?.protocol === "https" ? <Shield className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white uppercase tracking-widest">SSL Status</p>
                                <p className="text-[9px] text-[rgb(120,120,160)] uppercase tracking-widest font-bold">
                                    {parsed?.protocol === "https" ? "Secure Connection" : "Unencrypted"}
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Quick Navigation</p>
                            <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed font-medium italic">
                                "A well-structured URL is the foundation of good SEO and robust API design."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-rose-500/5 border border-rose-500/10">
                    <div className="flex items-center gap-3 text-rose-400 mb-3">
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Smart Mapping</span>
                    </div>
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                        We automatically detect UTM tags, tracking IDs, and state fragments. Great for audit trails and marketing link verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
