"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as Themes from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Code2,
    Image as ImageIcon,
    Download,
    Copy,
    Maximize2,
    Palette,
    Monitor,
    Layers,
    Check,
    Languages
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
    { id: "gradient-1", label: "Aura", class: "bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600" },
    { id: "gradient-2", label: "Ocean", class: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700" },
    { id: "gradient-3", label: "Sunset", class: "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500" },
    { id: "gradient-4", label: "Emerald", class: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" },
    { id: "gradient-5", label: "Minimal Dark", class: "bg-neutral-900" },
    { id: "gradient-6", label: "Subtle Gray", class: "bg-neutral-800 border-[rgb(45,45,65)]" },
    { id: "gradient-7", label: "Frosted", class: "bg-[rgba(255,255,255,0.05)] backdrop-blur-md" }
];

export function CodeToImageTool() {
    const [code, setCode] = useState(`function helloWorld() {
  console.log("Hello from RapidKit! 🚀");
  const tool = "Code to Image (Prettify)";
  return tool;
}`);
    const [language, setLanguage] = useState("javascript");
    const [themeId, setThemeId] = useState("vscDarkPlus");
    const [backgroundId, setBackgroundId] = useState("gradient-1");
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [padding, setPadding] = useState(64);
    const [exporting, setExporting] = useState(false);
    const [copied, setCopied] = useState(false);

    const snippetRef = useRef<HTMLDivElement>(null);

    const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const currentBg = BACKGROUNDS.find(b => b.id === backgroundId) || BACKGROUNDS[0];

    // ─── Handlers ───────────────────────────────────────────────────
    const handleDownload = useCallback(async () => {
        if (!snippetRef.current) return;
        setExporting(true);
        try {
            const dataUrl = await toPng(snippetRef.current, {
                quality: 1,
                pixelRatio: 2, // Retína quality
                cacheBust: true,
            });
            const link = document.createElement("a");
            link.download = `rapidkit-code-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to export image", error);
        } finally {
            setExporting(false);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold flex items-center gap-1.5">
                        <Languages className="w-3 h-3" /> Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-sm text-white focus:outline-none"
                    >
                        {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold flex items-center gap-1.5">
                        <Palette className="w-3 h-3" /> Code Theme
                    </label>
                    <select
                        value={themeId}
                        onChange={(e) => setThemeId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-sm text-white focus:outline-none"
                    >
                        {THEMES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold flex items-center gap-1.5">
                        <Monitor className="w-3 h-3" /> Canvas BG
                    </label>
                    <select
                        value={backgroundId}
                        onChange={(e) => setBackgroundId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-sm text-white focus:outline-none"
                    >
                        {BACKGROUNDS.map(bg => <option key={bg.id} value={bg.id}>{bg.label}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] uppercase tracking-wider text-[rgb(80,80,120)] font-bold flex items-center gap-1.5">
                        <Layers className="w-3 h-3" /> Padding
                    </label>
                    <div className="flex items-center gap-3 h-10 px-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)]">
                        <input
                            type="range" min={16} max={96} step={16}
                            value={padding} onChange={(e) => setPadding(Number(e.target.value))}
                            className="flex-1 accent-violet-500 h-1.5"
                        />
                        <span className="text-[10px] text-white opacity-60">{padding}px</span>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={exporting}
                    className="col-span-2 sm:col-span-1 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 self-end shadow-lg shadow-violet-600/20"
                >
                    {exporting ? <span className="animate-spin text-lg">◌</span> : <Download className="w-3.5 h-3.5" />}
                    Download PNG
                </button>
            </div>

            {/* Layout Main */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                {/* Visual Editor (Canvas) */}
                <div className="space-y-4">
                    <div
                        ref={snippetRef}
                        className={cn(
                            "w-full overflow-hidden transition-all duration-300",
                            currentBg.class
                        )}
                        style={{ padding: `${padding}px` }}
                    >
                        <div className="rounded-xl shadow-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-sm">
                            {/* Window Header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/5">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="ml-4 flex items-center gap-1.5 opacity-40">
                                    <Code2 className="w-3 h-3 text-white" />
                                    <span className="text-[10px] text-white font-mono tracking-wider">{language}.snippet</span>
                                </div>
                                <span className="ml-auto text-[9px] text-white opacity-20 font-mono">RapidKit PrettyCode</span>
                            </div>

                            {/* Content */}
                            <div className="text-[13px] sm:text-sm font-mono leading-relaxed">
                                <SyntaxHighlighter
                                    language={language}
                                    style={currentTheme.style}
                                    showLineNumbers={showLineNumbers}
                                    customStyle={{
                                        margin: 0,
                                        padding: '20px',
                                        background: 'transparent',
                                        fontSize: 'inherit',
                                        lineHeight: 'inherit',
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: '"JetBrains Mono", Consolas, Monaco, "Andale Mono", monospace'
                                        }
                                    }}
                                    lineNumberStyle={{
                                        minWidth: '2.5em',
                                        paddingRight: '1.5em',
                                        opacity: 0.3,
                                        textAlign: 'right',
                                        userSelect: 'none'
                                    }}
                                >
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={showLineNumbers}
                                        onChange={() => setShowLineNumbers(!showLineNumbers)}
                                    />
                                    <div className={cn(
                                        "w-8 h-4 rounded-full transition-colors",
                                        showLineNumbers ? "bg-violet-600" : "bg-[rgb(45,45,65)]"
                                    )} />
                                    <div className={cn(
                                        "absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                                        showLineNumbers ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                                <span className="text-xs text-[rgb(148,148,186)] group-hover:text-white">Show Line Numbers</span>
                            </label>
                        </div>
                        <p className="text-[10px] text-[rgb(80,80,120)] font-medium">Export quality: 2x (High Res PNG)</p>
                    </div>
                </div>

                {/* Right Editor Pane */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">Edit Code</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(100,100,140)] hover:text-white transition-all"
                                title="Copy code"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={() => setCode("")}
                                className="p-2 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(100,100,140)] hover:text-red-400 transition-all hover:border-red-400/30"
                                title="Clear"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            className="w-full h-[320px] lg:h-[480px] p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white font-mono text-sm focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner leading-relaxed"
                            placeholder="Paste your code here..."
                        />
                        <div className="absolute top-0 right-0 h-full w-4 flex flex-col items-center pointer-events-none">
                            <div className="flex-1 w-px bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-violet-500/10 bg-violet-600/5">
                        <h4 className="text-[10px] font-bold text-violet-300 uppercase mb-2">💡 Tips & Feedback</h4>
                        <ul className="space-y-2">
                            <li className="flex gap-2 text-[10px] text-[rgb(100,100,140)]">
                                <span className="text-violet-500">•</span>
                                Use high-contrast gradients for a &quot;Dark Mode&quot; aesthetic.
                            </li>
                            <li className="flex gap-2 text-[10px] text-[rgb(100,100,140)]">
                                <span className="text-violet-500">•</span>
                                Perfect size for Twitter and LinkedIn posts.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                /* Simple custom scrollbar for the code editor if needed */
                textarea::-webkit-scrollbar {
                    width: 6px;
                }
                textarea::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }
                textarea::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 10px;
                }
                textarea::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.4);
                }
            `}</style>
        </div>
    );
}

// Re-using some standard Lucide components for the textarea header
function Trash2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    )
}
