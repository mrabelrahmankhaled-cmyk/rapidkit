"use client";

import { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Eye,
    Code,
    Copy,
    Check,
    Download,
    Trash2,
    Monitor,
    Smartphone,
    Info,
    Sparkles,
    Columns,
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { marked } from "marked";

const DEFAULT_MARKDOWN = `# Welcome to RapidKit Markdown Editor! 🚀

## Features:
- **Live Preview:** See changes as you type.
- **GFM Support:** GitHub Flavored Markdown.
- **Responsive:** Build documentation anywhere.

### Code Blocks:
\`\`\`javascript
const rapidKit = () => {
    console.log("Building pro tools!");
};
\`\`\`

> "Good documentation is the backbone of great software."

1. Write on the left.
2. Preview on the right.
3. Export and ship it!
`;

export function MarkdownEditorTool() {
    const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
    const [html, setHtml] = useState("");
    const [view, setView] = useState<"split" | "editor" | "preview">("split");
    const [copied, setCopied] = useState<"md" | "html" | null>(null);

    const updatePreview = useCallback(async () => {
        const rendered = await marked.parse(markdown);
        setHtml(rendered);
    }, [markdown]);

    useEffect(() => {
        updatePreview();
    }, [updatePreview]);

    const handleCopy = (type: "md" | "html") => {
        navigator.clipboard.writeText(type === "md" ? markdown : html);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "README.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all content?")) {
            setMarkdown("");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] space-y-4">
            {/* ─── Toolbar ─── */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] shadow-xl">
                <div className="flex items-center gap-2 bg-[rgb(10,10,15)] p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setView("editor")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            view === "editor" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-[rgb(100,100,140)] hover:text-white"
                        )}
                    >
                        <Code className="w-3.5 h-3.5" /> Editor
                    </button>
                    <button
                        onClick={() => setView("split")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            view === "split" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-[rgb(100,100,140)] hover:text-white"
                        )}
                    >
                        <Columns className="w-3.5 h-3.5" /> Split
                    </button>
                    <button
                        onClick={() => setView("preview")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            view === "preview" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-[rgb(100,100,140)] hover:text-white"
                        )}
                    >
                        <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleCopy("md")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[rgb(120,120,160)] hover:text-white hover:bg-white/10 transition-all"
                    >
                        {copied === "md" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy MD
                    </button>
                    <button
                        onClick={() => handleCopy("html")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-[rgb(120,120,160)] hover:text-white hover:bg-white/10 transition-all"
                    >
                        {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                        Copy HTML
                    </button>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="Clear Editor"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ─── Editor Surface ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow gap-4 relative">
                {/* Editor Pane */}
                <div className={cn(
                    "flex flex-col h-full rounded-[2.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden transition-all duration-300",
                    view === "preview" ? "hidden" : "block",
                    view === "editor" ? "lg:col-span-2" : "block"
                )}>
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-white/5">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(120,120,160)]">Markdown Editor</span>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="flex-grow p-8 bg-transparent border-none text-indigo-100 font-mono text-sm leading-relaxed focus:ring-0 resize-none custom-scrollbar"
                        placeholder="# Start writing your documentation here..."
                    />
                </div>

                {/* Preview Pane */}
                <div className={cn(
                    "flex flex-col h-full rounded-[2.5rem] bg-white border border-[rgb(45,45,65)] overflow-hidden transition-all duration-300",
                    view === "editor" ? "hidden" : "block",
                    view === "preview" ? "lg:col-span-2" : "block"
                )}>
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-black/5 bg-gray-50">
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Render</span>
                    </div>
                    <div
                        className="flex-grow p-8 overflow-y-auto prose prose-slate max-w-none custom-scrollbar markdown-preview"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            </div>

            {/* ─── Footer Stats ─── */}
            <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Characters</span>
                        <span className="text-[10px] font-mono text-white">{markdown.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Words</span>
                        <span className="text-[10px] font-mono text-white">{markdown.split(/\s+/).filter(Boolean).length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" /> GitHub Flavored Documentation
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .markdown-preview h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; font-weight: 800; font-size: 2.25rem; }
                .markdown-preview h2 { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; font-weight: 700; }
                .markdown-preview pre { background: #f6f8fa; padding: 16px; border-radius: 12px; font-family: monospace; overflow-x: auto; }
                .markdown-preview blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; color: #6a737d; font-style: italic; }
                .markdown-preview code { background: #f1f3f5; padding: 2px 5px; border-radius: 4px; color: #d63384; }
                .markdown-preview table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .markdown-preview th, .markdown-preview td { border: 1px solid #dfe2e5; padding: 8px 13px; }
                .markdown-preview th { background: #f6f8fa; }
                .markdown-preview ul, .markdown-preview ol { padding-left: 20px; margin-bottom: 16px; }
                .markdown-preview li { margin-bottom: 4px; }
            ` }} />
        </div>
    );
}
