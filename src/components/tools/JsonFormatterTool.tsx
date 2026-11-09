"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Copy,
    Check,
    Trash2,
    Minimize2,
    Maximize2,
    AlertCircle,
    FileCode,
    ListTree,
    ChevronDown,
    ChevronRight,
    Sparkles,
    FolderPlus,
    FolderMinus
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "format" | "minify" | "validate";
type OutputTab = "raw" | "tree" | "typescript";

// ─── JSON Formatting & Minifying ─────────────────────────────────────
function formatJSON(raw: string): { result: string; error: string | null; parsed: unknown | null } {
    try {
        const parsed = JSON.parse(raw);
        return { result: JSON.stringify(parsed, null, 2), error: null, parsed };
    } catch (e) {
        return { result: "", error: (e as Error).message, parsed: null };
    }
}

function minifyJSON(raw: string): { result: string; error: string | null; parsed: unknown | null } {
    try {
        const parsed = JSON.parse(raw);
        return { result: JSON.stringify(parsed), error: null, parsed };
    } catch (e) {
        return { result: "", error: (e as Error).message, parsed: null };
    }
}

// ─── Native TypeScript Interface Generator ───────────────────────────
function jsonToTypeScript(jsonVal: unknown, rootName = "RootObject"): string {
    const interfaces: string[] = [];
    const generatedNames = new Set<string>();

    function sanitizeInterfaceName(name: string): string {
        let clean = name.replace(/[^a-zA-Z0-9_$]/g, "_");
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!clean) clean = "Item";
        let unique = clean;
        let counter = 1;
        while (generatedNames.has(unique)) {
            unique = `${clean}${counter++}`;
        }
        generatedNames.add(unique);
        return unique;
    }

    function formatKey(key: string): string {
        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
    }

    function inferType(val: unknown, keyHint = ""): string {
        if (val === null) return "null | any";
        if (val === undefined) return "undefined";
        const t = typeof val;
        if (t === "string") return "string";
        if (t === "number") return "number";
        if (t === "boolean") return "boolean";

        if (Array.isArray(val)) {
            if (val.length === 0) return "any[]";
            const types = new Set<string>();
            let hasObject = false;
            const objectItems: Record<string, unknown>[] = [];

            for (const item of val.slice(0, 15)) {
                if (item !== null && typeof item === "object" && !Array.isArray(item)) {
                    hasObject = true;
                    objectItems.push(item as Record<string, unknown>);
                } else {
                    types.add(inferType(item, keyHint));
                }
            }

            if (hasObject) {
                const merged = Object.assign({}, ...objectItems);
                const singularHint = keyHint.endsWith("s") && keyHint.length > 2
                    ? keyHint.slice(0, -1)
                    : keyHint || "Item";
                const ifaceName = sanitizeInterfaceName(singularHint);
                buildInterface(merged, ifaceName);
                types.add(ifaceName);
            }

            const union = Array.from(types).join(" | ") || "any";
            return types.size > 1 ? `(${union})[]` : `${union}[]`;
        }

        if (t === "object") {
            const ifaceName = sanitizeInterfaceName(keyHint || "Item");
            buildInterface(val as Record<string, unknown>, ifaceName);
            return ifaceName;
        }

        return "any";
    }

    function buildInterface(obj: Record<string, unknown>, name: string) {
        const lines: string[] = [];
        const entries = Object.entries(obj);
        if (entries.length === 0) {
            interfaces.push(`export interface ${name} {\n  [key: string]: any;\n}`);
            return;
        }
        for (const [k, v] of entries) {
            const typeStr = inferType(v, k);
            lines.push(`  ${formatKey(k)}: ${typeStr};`);
        }
        interfaces.push(`export interface ${name} {\n${lines.join("\n")}\n}`);
    }

    if (Array.isArray(jsonVal)) {
        generatedNames.add(rootName);
        const elemType = inferType(jsonVal, rootName);
        const ifaces = interfaces.join("\n\n");
        return `${ifaces}${ifaces ? "\n\n" : ""}export type ${rootName} = ${elemType};`;
    } else if (jsonVal !== null && typeof jsonVal === "object") {
        generatedNames.add(rootName);
        buildInterface(jsonVal as Record<string, unknown>, rootName);
        return interfaces.reverse().join("\n\n");
    } else {
        return `export type ${rootName} = ${typeof jsonVal};`;
    }
}

// ─── Syntax Highlighter for JSON / TypeScript ────────────────────────
function getSyntaxHighlight(code: string, isTypeScript = false): string {
    const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    if (isTypeScript) {
        return escaped
            .replace(/\b(export|interface|type)\b/g, '<span class="text-violet-400 font-bold">$1</span>')
            .replace(/\b(string|number|boolean|any|null|undefined|Record)\b/g, '<span class="text-cyan-300 font-semibold">$1</span>')
            .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*:)/g, '<span class="text-indigo-200">$1</span>');
    }

    return escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
            let cls = "text-amber-300"; // number
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? "text-cyan-300" : "text-emerald-300";
            } else if (/true|false/.test(match)) {
                cls = "text-violet-400";
            } else if (/null/.test(match)) {
                cls = "text-rose-400";
            }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}

// ─── Interactive Tree Node Component ─────────────────────────────────
interface TreeNodeProps {
    keyName?: string;
    value: unknown;
    isLast: boolean;
    allExpanded: boolean;
}

function JsonTreeNode({ keyName, value, isLast, allExpanded }: TreeNodeProps) {
    const isObject = value !== null && typeof value === "object";
    const isArray = Array.isArray(value);
    const [collapsed, setCollapsed] = useState(!allExpanded);

    // Sync with global toggle
    const isCurrentlyCollapsed = allExpanded ? false : collapsed;

    if (!isObject) {
        let valueDisplay = String(value);
        let colorClass = "text-amber-300";

        if (typeof value === "string") {
            valueDisplay = `"${value}"`;
            colorClass = "text-emerald-300";
        } else if (typeof value === "boolean") {
            colorClass = "text-violet-400";
        } else if (value === null) {
            valueDisplay = "null";
            colorClass = "text-rose-400";
        }

        return (
            <div className="flex items-center gap-1.5 py-0.5 hover:bg-white/[0.03] rounded px-1 group font-mono text-xs">
                {keyName !== undefined && (
                    <span className="text-cyan-300 font-medium">&quot;{keyName}&quot;:</span>
                )}
                <span className={cn(colorClass, "break-all")}>{valueDisplay}</span>
                {!isLast && <span className="text-[rgb(80,80,120)]">,</span>}
            </div>
        );
    }

    const entries = isArray
        ? (value as unknown[]).map((v, i) => [i.toString(), v] as [string, unknown])
        : Object.entries(value as Record<string, unknown>);

    const openBracket = isArray ? "[" : "{";
    const closeBracket = isArray ? "]" : "}";
    const countLabel = isArray ? `${entries.length} items` : `${entries.length} keys`;

    return (
        <div className="py-0.5 font-mono text-xs">
            <div
                onClick={() => setCollapsed(!isCurrentlyCollapsed)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04] rounded px-1 py-0.5 select-none w-fit"
            >
                {isCurrentlyCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                )}

                {keyName !== undefined && (
                    <span className="text-cyan-300 font-medium">&quot;{keyName}&quot;:</span>
                )}

                <span className="text-white font-bold">{openBracket}</span>

                {isCurrentlyCollapsed ? (
                    <span className="text-[10px] text-[rgb(120,120,160)] bg-[rgb(24,24,36)] px-1.5 py-0.5 rounded border border-[rgb(45,45,65)]">
                        {countLabel}
                    </span>
                ) : null}

                {isCurrentlyCollapsed && (
                    <span className="text-white font-bold">{closeBracket}</span>
                )}
                {isCurrentlyCollapsed && !isLast && (
                    <span className="text-[rgb(80,80,120)]">,</span>
                )}
            </div>

            {!isCurrentlyCollapsed && (
                <div className="pl-5 border-l border-[rgb(35,35,50)] ml-2 space-y-0.5 my-0.5">
                    {entries.map(([k, v], idx) => (
                        <JsonTreeNode
                            key={k}
                            keyName={isArray ? undefined : k}
                            value={v}
                            isLast={idx === entries.length - 1}
                            allExpanded={allExpanded}
                        />
                    ))}
                </div>
            )}

            {!isCurrentlyCollapsed && (
                <div className="pl-1">
                    <span className="text-white font-bold">{closeBracket}</span>
                    {!isLast && <span className="text-[rgb(80,80,120)]">,</span>}
                </div>
            )}
        </div>
    );
}

const SAMPLE_JSON = `{
  "projectName": "RapidKit",
  "version": "2.4.0",
  "openSource": true,
  "stats": {
    "totalTools": 38,
    "activeUsers": 15400,
    "rating": 4.9
  },
  "categories": [
    "developer",
    "design",
    "seo",
    "marketing"
  ],
  "creator": {
    "name": "Abdelkhalek Elsaeed",
    "role": "Full-Stack Developer",
    "availableForHire": true
  }
}`;

// ─── Main Component ──────────────────────────────────────────────────
export function JsonFormatterTool() {
    const [input, setInput] = useState(SAMPLE_JSON);
    const [mode, setMode] = useState<Mode>("format");
    const [outputTab, setOutputTab] = useState<OutputTab>("raw");
    const [copied, setCopied] = useState(false);
    const [treeExpanded, setTreeExpanded] = useState(true);

    const { result, error, parsed } = useMemo(() => {
        if (!input.trim()) return { result: "", error: null, parsed: null };
        if (mode === "format" || mode === "validate") return formatJSON(input);
        return minifyJSON(input);
    }, [input, mode]);

    const typeScriptCode = useMemo(() => {
        if (!parsed) return "";
        try {
            return jsonToTypeScript(parsed, "ApiResponse");
        } catch (e) {
            console.error("TS inference error:", e);
            return "// Failed to infer TypeScript types";
        }
    }, [parsed]);

    const activeCopyContent = outputTab === "typescript" ? typeScriptCode : result;

    const handleCopy = useCallback(() => {
        if (!activeCopyContent) return;
        navigator.clipboard.writeText(activeCopyContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [activeCopyContent]);

    const lineCount = (result || input).split("\n").length;
    const charCount = (result || input).length;

    return (
        <div className="space-y-4">
            {/* ─── Top Control Toolbar ────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)]">
                {/* Format Modes */}
                <div className="flex gap-1 bg-[rgb(20,20,32)] p-1 rounded-xl">
                    {(["format", "minify", "validate"] as Mode[]).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                                mode === m
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                    : "text-[rgb(140,140,175)] hover:text-white"
                            )}
                        >
                            {m === "format" && <Maximize2 className="w-3 h-3 inline mr-1" />}
                            {m === "minify" && <Minimize2 className="w-3 h-3 inline mr-1" />}
                            {m === "validate" && <Check className="w-3 h-3 inline mr-1" />}
                            {m}
                        </button>
                    ))}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setInput(SAMPLE_JSON)}
                        className="px-3 py-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-xs text-[rgb(140,140,175)] hover:text-white hover:border-violet-500/40 transition-all flex items-center gap-1.5"
                    >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Sample</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setInput("")}
                        className="px-3 py-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-xs text-[rgb(140,140,175)] hover:text-rose-400 hover:border-rose-500/30 transition-all flex items-center gap-1.5"
                    >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* ─── Editor & Output Split ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Column */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] font-bold text-[rgb(120,120,160)] uppercase tracking-wider">
                            Input JSON
                        </label>
                        <span className="text-[10px] text-[rgb(100,100,140)] font-mono">
                            {input.length.toLocaleString()} chars
                        </span>
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={'{\n  "name": "RapidKit",\n  "type": "awesome"\n}'}
                        className="w-full h-[450px] p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] text-white placeholder:text-[rgb(60,60,85)] focus:outline-none focus:border-violet-500/50 text-xs font-mono resize-none leading-relaxed shadow-inner"
                        spellCheck={false}
                    />
                </div>

                {/* Output Column */}
                <div className="space-y-2">
                    {/* Output Tabs & Copy */}
                    <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-1 bg-[rgb(20,20,32)] p-0.5 rounded-xl border border-[rgb(38,38,58)]">
                            <button
                                type="button"
                                onClick={() => setOutputTab("raw")}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                                    outputTab === "raw"
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(140,140,175)] hover:text-white"
                                )}
                            >
                                <Maximize2 className="w-3 h-3" />
                                <span>JSON</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setOutputTab("tree")}
                                disabled={Boolean(error) || !parsed}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                                    outputTab === "tree"
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(140,140,175)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                )}
                            >
                                <ListTree className="w-3 h-3 text-cyan-400" />
                                <span>Tree View</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setOutputTab("typescript")}
                                disabled={Boolean(error) || !parsed}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                                    outputTab === "typescript"
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(140,140,175)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                )}
                            >
                                <FileCode className="w-3 h-3 text-indigo-400" />
                                <span>TypeScript</span>
                            </button>
                        </div>

                        {/* Top Right: Tree Toggle or Copy */}
                        <div className="flex items-center gap-2">
                            {outputTab === "tree" && Boolean(parsed) && (
                                <button
                                    type="button"
                                    onClick={() => setTreeExpanded(!treeExpanded)}
                                    className="text-xs text-[rgb(140,140,175)] hover:text-white px-2 py-1 rounded-lg bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] flex items-center gap-1"
                                    title={treeExpanded ? "Collapse All" : "Expand All"}
                                >
                                    {treeExpanded ? <FolderMinus className="w-3 h-3" /> : <FolderPlus className="w-3 h-3" />}
                                    <span>{treeExpanded ? "Collapse" : "Expand"}</span>
                                </button>
                            )}

                            {result && !error && (
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className={cn(
                                        "px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border",
                                        copied
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                            : "bg-[rgb(20,20,32)] border-[rgb(38,38,58)] text-[rgb(140,140,175)] hover:text-white hover:border-violet-500/40"
                                    )}
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    <span>{copied ? "Copied!" : outputTab === "typescript" ? "Copy TS" : "Copy JSON"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Output Content Card */}
                    <div
                        className={cn(
                            "w-full h-[450px] p-4 rounded-2xl border text-xs font-mono overflow-auto relative shadow-inner custom-scrollbar",
                            error
                                ? "bg-red-500/5 border-red-500/30"
                                : "bg-[rgb(12,12,18)] border-[rgb(38,38,58)]"
                        )}
                    >
                        {error ? (
                            <div className="flex items-start gap-3 text-red-400 p-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                                <div>
                                    <p className="font-bold text-sm mb-1 text-red-300">JSON Syntax Error</p>
                                    <p className="text-xs leading-relaxed font-mono opacity-90">{error}</p>
                                </div>
                            </div>
                        ) : outputTab === "tree" && parsed ? (
                            <div className="p-1">
                                <JsonTreeNode
                                    value={parsed}
                                    isLast={true}
                                    allExpanded={treeExpanded}
                                />
                            </div>
                        ) : outputTab === "typescript" && typeScriptCode ? (
                            <pre
                                className="text-white leading-relaxed whitespace-pre-wrap break-all font-mono"
                                dangerouslySetInnerHTML={{ __html: getSyntaxHighlight(typeScriptCode, true) }}
                            />
                        ) : result ? (
                            <pre
                                className="text-white leading-relaxed whitespace-pre-wrap break-all font-mono"
                                dangerouslySetInnerHTML={{ __html: getSyntaxHighlight(result) }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-[rgb(90,90,120)]">
                                <span>Output will appear here...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Bottom Stats Bar ───────────────────────────────── */}
            {(input || result) && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[rgb(120,120,160)] py-2.5 px-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)]">
                    <div className="flex items-center gap-4">
                        <span>Lines: <strong className="text-white font-mono">{lineCount}</strong></span>
                        <span>Chars: <strong className="text-white font-mono">{charCount.toLocaleString()}</strong></span>
                        {result && input && mode === "minify" && (
                            <span className="text-emerald-400 font-medium">
                                Saved: {(((input.length - result.length) / input.length) * 100).toFixed(1)}%
                            </span>
                        )}
                        {outputTab === "typescript" && typeScriptCode && (
                            <span className="text-indigo-400 font-medium">
                                Inferred Interfaces Ready
                            </span>
                        )}
                    </div>

                    <div>
                        {!error && input ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Valid JSON
                            </span>
                        ) : error ? (
                            <span className="text-rose-400 font-medium flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Invalid JSON
                            </span>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
