"use client";

import { useState, useRef, useCallback } from "react";
import { toPng, toBlob } from "html-to-image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as Themes from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Code2,
    Download,
    Copy,
    Palette,
    Monitor,
    Layers,
    Check,
    Languages,
    Sparkles,
    Trash2,
    FileCode,
    Sliders,
    Minus,
    Square,
    X,
    ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { id: "javascript", label: "JavaScript" },
    { id: "typescript", label: "TypeScript" },
    { id: "python", label: "Python" },
    { id: "html", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "json", label: "JSON" },
    { id: "rust", label: "Rust" },
    { id: "go", label: "Go" },
    { id: "java", label: "Java" },
    { id: "cpp", label: "C++" },
    { id: "php", label: "PHP" },
    { id: "sql", label: "SQL" }
];

const THEMES = [
    { id: "vscDarkPlus", label: "VS Code Dark+", style: Themes.vscDarkPlus },
    { id: "dracula", label: "Dracula", style: Themes.dracula },
    { id: "atomDark", label: "Atom Dark", style: Themes.atomDark },
    { id: "nightOwl", label: "Night Owl", style: Themes.nightOwl },
    { id: "oneDark", label: "One Dark", style: Themes.oneDark },
    { id: "ghcolors", label: "GitHub Light", style: Themes.ghcolors },
    { id: "vs", label: "Visual Studio Light", style: Themes.vs }
];

const BACKGROUNDS = [
    { id: "gradient-1", label: "Aura Purple", class: "bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600" },
    { id: "gradient-2", label: "Ocean Blue", class: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700" },
    { id: "gradient-3", label: "Sunset Glow", class: "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500" },
    { id: "gradient-4", label: "Emerald Mint", class: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" },
    { id: "gradient-5", label: "Minimal Obsidian", class: "bg-[rgb(10,10,15)]" },
    { id: "gradient-6", label: "Subtle Graphite", class: "bg-neutral-800 border-[rgb(45,45,65)]" },
    { id: "gradient-7", label: "Frosted Glass", class: "bg-[rgba(255,255,255,0.06)] backdrop-blur-md" }
];

const SHADOW_PRESETS = [
    { id: "black", label: "Deep Black", value: "rgba(0, 0, 0, 0.7)", preview: "bg-black" },
    { id: "violet", label: "Violet Aura", value: "rgba(139, 92, 246, 0.55)", preview: "bg-violet-500" },
    { id: "cyan", label: "Cyan Glow", value: "rgba(56, 189, 248, 0.55)", preview: "bg-cyan-400" },
    { id: "rose", label: "Rose Neon", value: "rgba(244, 63, 94, 0.55)", preview: "bg-rose-500" },
    { id: "amber", label: "Amber Glow", value: "rgba(245, 158, 11, 0.55)", preview: "bg-amber-400" },
    { id: "emerald", label: "Emerald Light", value: "rgba(16, 185, 129, 0.55)", preview: "bg-emerald-400" }
];

type WindowStyle = "mac" | "windows" | "none";

const DEFAULT_CODE = `function createServer() {
  const app = express();
  app.use(cors());

  app.get("/api/v1/health", (req, res) => {
    return res.json({ status: "healthy", uptime: process.uptime() });
  });

  return app.listen(3000, () => {
    console.log("⚡ Server running smoothly on port 3000");
  });
}`;

export function CodeToImageTool() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [language, setLanguage] = useState("javascript");
    const [themeId, setThemeId] = useState("vscDarkPlus");
    const [backgroundId, setBackgroundId] = useState("gradient-1");
    const [windowStyle, setWindowStyle] = useState<WindowStyle>("mac");
    const [filename, setFilename] = useState("server.ts");
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [padding, setPadding] = useState(48);
    const [shadowBlur, setShadowBlur] = useState(36);
    const [shadowColor, setShadowColor] = useState("rgba(0, 0, 0, 0.7)");

    const [exporting, setExporting] = useState(false);
    const [copyingImage, setCopyingImage] = useState(false);
    const [copiedImage, setCopiedImage] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const snippetRef = useRef<HTMLDivElement>(null);

    const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const currentBg = BACKGROUNDS.find((b) => b.id === backgroundId) || BACKGROUNDS[0];

    // ─── Download PNG ────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        if (!snippetRef.current) return;
        setExporting(true);
        try {
            const dataUrl = await toPng(snippetRef.current, {
                quality: 1,
                pixelRatio: 2, // Retina 2x
                cacheBust: true,
            });
            const link = document.createElement("a");
            link.download = `rapidkit-snippet-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to export image", error);
        } finally {
            setExporting(false);
        }
    }, []);

    // ─── Copy Image to Clipboard ─────────────────────────────────────
    const handleCopyImage = useCallback(async () => {
        if (!snippetRef.current) return;
        setCopyingImage(true);
        try {
            const blob = await toBlob(snippetRef.current, {
                pixelRatio: 2,
                cacheBust: true,
            });
            if (!blob) throw new Error("Image blob creation failed");

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2200);
        } catch (error) {
            console.error("Failed to copy image to clipboard", error);
            // Fallback notify or alert
        } finally {
            setCopyingImage(false);
        }
    }, []);

    // ─── Copy Code String ────────────────────────────────────────────
    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* ─── Top Main Controls Ribbon ─────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] shadow-lg">
                {/* Language */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold flex items-center gap-1">
                        <Languages className="w-3 h-3 text-violet-400" /> Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>
                </div>

                {/* Theme */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold flex items-center gap-1">
                        <Palette className="w-3 h-3 text-cyan-400" /> Syntax Theme
                    </label>
                    <select
                        value={themeId}
                        onChange={(e) => setThemeId(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {THEMES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>

                {/* Canvas Background */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-emerald-400" /> Background
                    </label>
                    <select
                        value={backgroundId}
                        onChange={(e) => setBackgroundId(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-xs text-white focus:outline-none focus:border-violet-500/50"
                    >
                        {BACKGROUNDS.map((bg) => (
                            <option key={bg.id} value={bg.id}>{bg.label}</option>
                        ))}
                    </select>
                </div>

                {/* Window Style */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-amber-400" /> Frame Style
                    </label>
                    <div className="flex h-9 p-0.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)]">
                        {(["mac", "windows", "none"] as WindowStyle[]).map((style) => (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setWindowStyle(style)}
                                className={cn(
                                    "flex-1 rounded-lg text-[11px] font-semibold capitalize transition-all",
                                    windowStyle === style
                                        ? "bg-violet-600 text-white shadow"
                                        : "text-[rgb(130,130,165)] hover:text-white"
                                )}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filename Tab */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(120,120,160)] font-bold flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-rose-400" /> Filename Tab
                    </label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="e.g. server.ts"
                        className="w-full h-9 px-2.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] text-xs text-white placeholder-[rgb(80,80,110)] focus:outline-none focus:border-violet-500/50 font-mono"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
                    {/* Copy Image Button */}
                    <button
                        type="button"
                        onClick={handleCopyImage}
                        disabled={copyingImage || exporting}
                        className={cn(
                            "flex-1 h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border shadow-md",
                            copiedImage
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-white hover:bg-[rgb(30,30,48)] hover:border-violet-500/40"
                        )}
                        title="Copy rendered image directly to clipboard"
                    >
                        {copyingImage ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : copiedImage ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span className="truncate">{copiedImage ? "Copied!" : "Copy Image"}</span>
                    </button>

                    {/* Download PNG Button */}
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={exporting || copyingImage}
                        className="flex-1 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/25"
                    >
                        {exporting ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-3.5 h-3.5" />
                        )}
                        <span className="truncate">Download</span>
                    </button>
                </div>
            </div>

            {/* ─── Aesthetics Toolbar (Padding, Glow & Shadows) ─────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] text-xs text-[rgb(140,140,175)]">
                {/* Padding slider */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Canvas Padding
                        </span>
                        <span className="font-mono text-cyan-400">{padding}px</span>
                    </div>
                    <input
                        type="range"
                        min={16}
                        max={96}
                        step={8}
                        value={padding}
                        onChange={(e) => setPadding(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1.5 bg-[rgb(24,24,36)] rounded-lg cursor-pointer"
                    />
                </div>

                {/* Glow/Shadow Blur slider */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold text-white">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Shadow / Glow Blur
                        </span>
                        <span className="font-mono text-violet-400">{shadowBlur}px</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={80}
                        step={4}
                        value={shadowBlur}
                        onChange={(e) => setShadowBlur(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-[rgb(24,24,36)] rounded-lg cursor-pointer"
                    />
                </div>

                {/* Shadow Color Presets & Picker */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Shadow / Glow Color</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {SHADOW_PRESETS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setShadowColor(p.value)}
                                className={cn(
                                    "w-6 h-6 rounded-full border transition-all hover:scale-110",
                                    p.preview,
                                    shadowColor === p.value
                                        ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-[rgb(14,14,22)] border-white"
                                        : "border-white/20"
                                )}
                                title={p.label}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Visual Canvas + Editor Workspace ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                {/* Visual Editor (Canvas to be captured) */}
                <div className="space-y-3">
                    <div className="overflow-x-auto rounded-3xl border border-[rgb(38,38,58)] bg-black/40 p-2">
                        <div
                            ref={snippetRef}
                            className={cn(
                                "w-full transition-all duration-300 rounded-2xl select-none",
                                currentBg.class
                            )}
                            style={{ padding: `${padding}px` }}
                        >
                            {/* Inner Code Window */}
                            <div
                                className="rounded-2xl overflow-hidden bg-[rgb(12,12,18)]/90 border border-white/10 backdrop-blur-md transition-shadow duration-300"
                                style={{
                                    boxShadow: `0 20px ${shadowBlur}px ${shadowColor}`,
                                }}
                            >
                                {/* Mock Window Header */}
                                {windowStyle !== "none" && (
                                    <div className="flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/5">
                                        {/* Left Side: Mac controls or Filename */}
                                        <div className="flex items-center gap-3">
                                            {windowStyle === "mac" && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20" />
                                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/20" />
                                                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20" />
                                                </div>
                                            )}

                                            {/* Filename Tab */}
                                            {filename && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white font-mono text-[11px] shadow-sm">
                                                    <Code2 className="w-3 h-3 text-cyan-400" />
                                                    <span className="font-medium">{filename}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Windows Controls or watermark */}
                                        <div className="flex items-center gap-2">
                                            {windowStyle === "windows" && (
                                                <div className="flex items-center gap-3 text-white/50 text-[11px]">
                                                    <Minus className="w-3 h-3" />
                                                    <Square className="w-2.5 h-2.5" />
                                                    <X className="w-3.5 h-3.5" />
                                                </div>
                                            )}

                                            {windowStyle !== "windows" && (
                                                <span className="text-[10px] text-white/30 font-mono tracking-wider">
                                                    RapidKit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Window Content: Syntax Highlighter */}
                                <div className="text-[13px] sm:text-sm font-mono leading-relaxed">
                                    <SyntaxHighlighter
                                        language={language}
                                        style={currentTheme.style}
                                        showLineNumbers={showLineNumbers}
                                        customStyle={{
                                            margin: 0,
                                            padding: "24px 20px",
                                            background: "transparent",
                                            fontSize: "inherit",
                                            lineHeight: "inherit",
                                        }}
                                        codeTagProps={{
                                            style: {
                                                fontFamily: '"JetBrains Mono", Consolas, Monaco, "Courier New", monospace',
                                            },
                                        }}
                                        lineNumberStyle={{
                                            minWidth: "2.5em",
                                            paddingRight: "1.5em",
                                            opacity: 0.25,
                                            textAlign: "right",
                                            userSelect: "none",
                                        }}
                                    >
                                        {code}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Canvas Footer Settings */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] text-xs">
                        <label className="flex items-center gap-2.5 cursor-pointer text-[rgb(150,150,185)] hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showLineNumbers}
                                onChange={(e) => setShowLineNumbers(e.target.checked)}
                                className="w-4 h-4 rounded accent-violet-600 cursor-pointer"
                            />
                            <span>Show Line Numbers</span>
                        </label>

                        <div className="flex items-center gap-3 text-[11px] text-[rgb(110,110,145)]">
                            <span>Retina 2x Resolution</span>
                            <span>•</span>
                            <span>Direct Clipboard PNG</span>
                        </div>
                    </div>
                </div>

                {/* Right Code Input Area */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-[rgb(120,120,160)] uppercase tracking-wider">
                            Source Code
                        </h3>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="p-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-[rgb(140,140,175)] hover:text-white transition-all"
                                title="Copy Raw Code"
                            >
                                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setCode("")}
                                className="p-1.5 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-[rgb(140,140,175)] hover:text-rose-400 transition-all"
                                title="Clear code"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste or write your code here..."
                        className="w-full h-[400px] lg:h-[480px] p-4 rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] text-white font-mono text-xs focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed shadow-inner custom-scrollbar"
                        spellCheck={false}
                    />

                    <div className="p-4 rounded-2xl bg-violet-600/5 border border-violet-500/15 text-xs text-[rgb(140,140,175)] space-y-1.5">
                        <p className="font-semibold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Pro Creator Tip
                        </p>
                        <p className="leading-relaxed text-[11px]">
                            Use <strong>&quot;Copy Image&quot;</strong> to paste your high-resolution code card directly into Twitter, LinkedIn, Slack, or Notion without downloading files to your drive!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
