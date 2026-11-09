"use client";

import { useState, useMemo, useCallback } from "react";
import {
    Code2,
    Download,
    Copy,
    Trash2,
    Check,
    Sparkles,
    Eye,
    LayoutGrid,
    Layers,
    FileCode,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_HTML = `<div class="card">
  <div class="badge">Live Playground</div>
  <h1>RapidKit Web Compiler</h1>
  <p>Write HTML, CSS, and JavaScript with instant client-side rendering.</p>
  <button id="actionBtn">Click to Animate 🚀</button>
</div>`;

const SAMPLE_CSS = `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 32px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8fafc;
  color: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  max-width: 440px;
  width: 100%;
  padding: 36px 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
  color: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.45);
  text-align: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.badge {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.92;
  margin: 0 0 24px 0;
}

button {
  padding: 13px 28px;
  border: none;
  border-radius: 14px;
  background: white;
  color: #6366f1;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

button:hover {
  transform: scale(1.05);
  background: #fdfdfd;
}

button:active {
  transform: scale(0.97);
}`;

const SAMPLE_JS = `let count = 0;
const btn = document.getElementById("actionBtn");

btn.addEventListener("click", () => {
  count++;
  btn.textContent = \`Clicks: \${count} 🚀\`;
  btn.style.transform = "scale(1.15)";
  setTimeout(() => {
    btn.style.transform = "scale(1)";
  }, 150);
});`;

type EditorTab = "html" | "css" | "js";
type ViewMode = "tabs" | "grid";

export function WebCodePlaygroundTool() {
    const [html, setHtml] = useState(SAMPLE_HTML);
    const [css, setCss] = useState(SAMPLE_CSS);
    const [js, setJs] = useState(SAMPLE_JS);
    const [activeTab, setActiveTab] = useState<EditorTab>("html");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [copied, setCopied] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // ─── Combined Source Document for IFrame ─────────────────────────
    const combinedDoc = useMemo(() => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (err) {
      console.error("Playground Script Error:", err);
    }
  <\/script>
</body>
</html>`;
    }, [html, css, js]);

    // ─── Export as Standalone HTML File ──────────────────────────────
    const handleDownload = useCallback(() => {
        const blob = new Blob([combinedDoc], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rapidkit-playground-${Date.now()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [combinedDoc]);

    // ─── Copy Full HTML ──────────────────────────────────────────────
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(combinedDoc);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [combinedDoc]);

    // ─── Reset to Sample ─────────────────────────────────────────────
    const handleResetSample = () => {
        setHtml(SAMPLE_HTML);
        setCss(SAMPLE_CSS);
        setJs(SAMPLE_JS);
        setRefreshKey((k) => k + 1);
    };

    // ─── Clear All ───────────────────────────────────────────────────
    const handleClear = () => {
        setHtml("");
        setCss("");
        setJs("");
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="space-y-6">
            {/* ─── Top Control Toolbar ────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-xl">
                {/* View Mode & Preset buttons */}
                <div className="flex items-center gap-2">
                    <div className="flex p-0.5 bg-[rgb(20,20,32)] rounded-xl border border-[rgb(45,45,68)]">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                viewMode === "grid"
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                    : "text-[rgb(140,140,175)] hover:text-white"
                            )}
                            title="3-Panel Grid View"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Grid View</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode("tabs")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                viewMode === "tabs"
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                    : "text-[rgb(140,140,175)] hover:text-white"
                            )}
                            title="Tabbed Editor View"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tabbed</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetSample}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-xs font-medium text-[rgb(140,140,175)] hover:text-white hover:border-violet-500/40 transition-all"
                        title="Load interactive sample demo"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Load Sample</span>
                    </button>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setRefreshKey((k) => k + 1)}
                        className="p-2 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-[rgb(140,140,175)] hover:text-cyan-400 transition-all"
                        title="Re-run / Refresh Preview"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={handleClear}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-xs font-medium text-[rgb(140,140,175)] hover:text-rose-400 hover:border-rose-500/30 transition-all"
                        title="Clear all code editors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear All</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm",
                            copied
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-white hover:bg-[rgb(28,28,44)] hover:border-violet-500/40"
                        )}
                        title="Copy full runnable HTML to clipboard"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-violet-400" />}
                        <span>{copied ? "Copied!" : "Copy Code"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all shadow-md shadow-violet-600/25"
                        title="Download standalone HTML file"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .html</span>
                    </button>
                </div>
            </div>

            {/* ─── Main Playground Workspace ──────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* ─── Left: Code Editors ───────────────────────────── */}
                <div className="space-y-4">
                    {viewMode === "tabs" ? (
                        /* Tabbed Editor Mode */
                        <div className="rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-xl overflow-hidden">
                            {/* Tab Headers */}
                            <div className="flex items-center justify-between px-4 pt-3 border-b border-[rgb(30,30,46)] bg-black/20">
                                <div className="flex gap-2">
                                    {[
                                        { id: "html", label: "HTML", color: "text-orange-400", badge: "HTML5" },
                                        { id: "css", label: "CSS", color: "text-cyan-400", badge: "CSS3" },
                                        { id: "js", label: "JS", color: "text-amber-400", badge: "ES6" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id as EditorTab)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-t-xl text-xs font-bold font-mono transition-all border-b-2",
                                                activeTab === tab.id
                                                    ? cn("border-violet-500 bg-[rgb(20,20,32)] text-white")
                                                    : "border-transparent text-[rgb(120,120,160)] hover:text-white"
                                            )}
                                        >
                                            <span className={tab.color}>{tab.label}</span>
                                            <span className="text-[10px] text-[rgb(90,90,130)] bg-black/30 px-1 rounded">
                                                {tab.badge}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Active Tab Textarea */}
                            <div className="p-4">
                                {activeTab === "html" && (
                                    <textarea
                                        value={html}
                                        onChange={(e) => setHtml(e.target.value)}
                                        placeholder="Write HTML here..."
                                        className="w-full h-[460px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-white font-mono text-xs focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed shadow-inner custom-scrollbar"
                                        spellCheck={false}
                                    />
                                )}
                                {activeTab === "css" && (
                                    <textarea
                                        value={css}
                                        onChange={(e) => setCss(e.target.value)}
                                        placeholder="Write CSS here..."
                                        className="w-full h-[460px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-cyan-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed shadow-inner custom-scrollbar"
                                        spellCheck={false}
                                    />
                                )}
                                {activeTab === "js" && (
                                    <textarea
                                        value={js}
                                        onChange={(e) => setJs(e.target.value)}
                                        placeholder="Write JavaScript here..."
                                        className="w-full h-[460px] p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(35,35,50)] text-amber-200 font-mono text-xs focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed shadow-inner custom-scrollbar"
                                        spellCheck={false}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        /* 3-Panel Stacked Grid View */
                        <div className="space-y-4">
                            {/* HTML Editor Panel */}
                            <div className="rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3.5 py-2 bg-black/25 border-b border-[rgb(30,30,46)]">
                                    <span className="text-xs font-bold font-mono text-orange-400 flex items-center gap-1.5">
                                        <Code2 className="w-3.5 h-3.5" /> HTML5
                                    </span>
                                    <span className="text-[10px] text-[rgb(100,100,140)] font-mono">
                                        {html.length} chars
                                    </span>
                                </div>
                                <textarea
                                    value={html}
                                    onChange={(e) => setHtml(e.target.value)}
                                    placeholder="<!-- Write HTML markup here -->"
                                    className="w-full h-36 p-3 bg-[rgb(10,10,15)] text-white font-mono text-xs focus:outline-none resize-none leading-relaxed custom-scrollbar border-0"
                                    spellCheck={false}
                                />
                            </div>

                            {/* CSS Editor Panel */}
                            <div className="rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3.5 py-2 bg-black/25 border-b border-[rgb(30,30,46)]">
                                    <span className="text-xs font-bold font-mono text-cyan-400 flex items-center gap-1.5">
                                        <FileCode className="w-3.5 h-3.5" /> CSS3
                                    </span>
                                    <span className="text-[10px] text-[rgb(100,100,140)] font-mono">
                                        {css.length} chars
                                    </span>
                                </div>
                                <textarea
                                    value={css}
                                    onChange={(e) => setCss(e.target.value)}
                                    placeholder="/* Write CSS styles here */"
                                    className="w-full h-36 p-3 bg-[rgb(10,10,15)] text-cyan-100 font-mono text-xs focus:outline-none resize-none leading-relaxed custom-scrollbar border-0"
                                    spellCheck={false}
                                />
                            </div>

                            {/* JS Editor Panel */}
                            <div className="rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3.5 py-2 bg-black/25 border-b border-[rgb(30,30,46)]">
                                    <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" /> JavaScript (ES6+)
                                    </span>
                                    <span className="text-[10px] text-[rgb(100,100,140)] font-mono">
                                        {js.length} chars
                                    </span>
                                </div>
                                <textarea
                                    value={js}
                                    onChange={(e) => setJs(e.target.value)}
                                    placeholder="// Write JavaScript code here"
                                    className="w-full h-36 p-3 bg-[rgb(10,10,15)] text-amber-100 font-mono text-xs focus:outline-none resize-none leading-relaxed custom-scrollbar border-0"
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Right: Live Preview IFrame ───────────────────── */}
                <div className="space-y-3 sticky top-24">
                    <div className="rounded-3xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-2xl overflow-hidden flex flex-col">
                        {/* Browser Window Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[rgb(10,10,16)] border-b border-[rgb(30,30,46)]">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                </div>
                                <span className="ml-2 text-[11px] text-[rgb(130,130,165)] font-mono flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>sandbox://preview</span>
                                </span>
                            </div>

                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                                Live Execution
                            </span>
                        </div>

                        {/* Sandboxed IFrame Preview Container */}
                        <div className="relative w-full h-[500px] bg-white overflow-hidden">
                            <iframe
                                key={refreshKey}
                                srcDoc={combinedDoc}
                                title="Live Code Preview"
                                sandbox="allow-scripts allow-modals"
                                className="w-full h-full border-0 bg-white"
                            />
                        </div>
                    </div>

                    {/* Quick Security & Architecture Info */}
                    <div className="flex items-center justify-between px-3 text-[11px] text-[rgb(110,110,145)]">
                        <span>⚡ 100% Client-Side In-Memory Execution</span>
                        <span>•</span>
                        <span>Sandboxed srcDoc iframe</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
