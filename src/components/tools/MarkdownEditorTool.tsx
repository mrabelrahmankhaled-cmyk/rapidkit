"use client";

import { useState, useMemo, useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
    Eye,
    Code,
    Copy,
    Check,
    Download,
    Trash2,
    Columns,
    Sparkles,
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    List,
    ListOrdered,
    ListTodo,
    Link as LinkIcon,
    Image as ImageIcon,
    Table,
    Minus,
    Maximize2,
    Minimize2,
    Sun,
    Moon,
    RotateCcw,
    Upload,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { marked } from "marked";

const DEFAULT_MARKDOWN = `# Welcome to RapidKit Markdown Editor! 🚀

A fast, browser-native Markdown editor with real-time GitHub Flavored Markdown (GFM) preview, syntax highlighting, and one-click exports.

---

## Key Features

- **Live Split-Pane Preview:** Instant updates with zero input lag.
- **GFM Compliant:** Tables, task lists, strikethrough, autolinks, and blockquotes.
- **Privacy First:** 100% client-side. Your text never leaves your browser.
- **Export Options:** Download as \`.md\` or copy clean compiled HTML.

---

### Code Blocks with Syntax

\`\`\`javascript
// Example RapidKit script
const formatText = (input) => {
    return input.trim().toLowerCase();
};

console.log("Ready to build production-grade tools!");
\`\`\`

---

### Interactive Task Lists

- [x] Create modern dark-mode Markdown editor
- [x] Fix live preview background contrast & typography
- [x] Add formatting toolbar & keyboard shortcuts
- [ ] Write awesome documentation

---

### Tables

| Syntax | Description | Status |
| :--- | :--- | :---: |
| \`# Header\` | Document Title | Active |
| \`**Bold**\` | Strong Emphasis | Supported |
| \`*Italic*\` | Soft Emphasis | Supported |
| \`> Quote\` | Blockquote | Styled |

---

### Blockquote Inspiration

> "Good documentation is like a love letter you write to your future self."
> — *Software Engineering Proverb*

---

1. Type markdown in the left pane.
2. Review the live render on the right.
3. Use the toolbar above for quick formatting.
4. Export or copy when you're done!
`;

export function MarkdownEditorTool() {
    const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
    const [view, setView] = useState<"split" | "editor" | "preview">("split");
    const [copied, setCopied] = useState<"md" | "html" | null>(null);
    const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    useEffect(() => {
        if (!isFullscreen) return;
        const origOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = origOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFullscreen]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Live HTML Parsing (Pure Derived State via useMemo) ──────────
    const html = useMemo(() => {
        try {
            return (marked.parse(markdown) as string) || "";
        } catch (err) {
            console.error("Markdown parse error:", err);
            return "";
        }
    }, [markdown]);

    // ─── Formatting Toolbar Actions ──────────────────────────────────
    const insertFormatting = (prefix: string, suffix = "", defaultText = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = markdown.substring(start, end);
        const textToWrap = selected || defaultText;
        const replacement = `${prefix}${textToWrap}${suffix}`;

        const nextVal = markdown.substring(0, start) + replacement + markdown.substring(end);
        setMarkdown(nextVal);

        setTimeout(() => {
            textarea.focus();
            if (selected) {
                textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
            } else {
                const cursor = start + prefix.length;
                textarea.setSelectionRange(cursor, cursor + defaultText.length);
            }
        }, 10);
    };

    const insertBlock = (blockText: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Ensure newline before if needed
        const prevChars = markdown.substring(0, start);
        const needsNewlineBefore = prevChars.length > 0 && !prevChars.endsWith("\n");
        const prefix = needsNewlineBefore ? "\n" : "";

        const nextVal = markdown.substring(0, start) + prefix + blockText + markdown.substring(end);
        setMarkdown(nextVal);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + prefix.length + blockText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 10);
    };

    // ─── Handle Tab Key in Editor ────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const nextVal = markdown.substring(0, start) + "  " + markdown.substring(end);
            setMarkdown(nextVal);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
        }
    };

    // ─── Copy & Download Actions ─────────────────────────────────────
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
        a.download = "document.md";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (typeof content === "string") {
                setMarkdown(content);
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        setMarkdown(DEFAULT_MARKDOWN);
    };

    const handleClear = () => {
        setMarkdown("");
        textareaRef.current?.focus();
    };

    // ─── Calculations ────────────────────────────────────────────────
    const words = markdown.trim().split(/\s+/).filter(Boolean).length;
    const chars = markdown.length;
    const lines = markdown ? markdown.split("\n").length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const editorContent = (
        <div
            className={cn(
                "flex flex-col transition-all duration-300",
                isFullscreen
                    ? "fixed inset-0 z-[99999] bg-[rgb(10,10,15)] p-4 sm:p-6 h-screen w-screen overflow-hidden"
                    : "h-[calc(100vh-220px)] min-h-[680px]"
            )}
            style={isFullscreen ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 99999 } : undefined}
        >
            {/* ─── Top Main Navigation Bar ──────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] shadow-xl mb-3">
                {/* View Switcher */}
                <div className="flex items-center gap-1 bg-[rgb(11,11,18)] p-1 rounded-xl border border-[rgb(38,38,58)]">
                    <button
                        type="button"
                        onClick={() => setView("editor")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            view === "editor"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                : "text-[rgb(148,148,186)] hover:text-white"
                        )}
                        title="Editor only"
                    >
                        <Code className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Editor</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setView("split")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            view === "split"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                : "text-[rgb(148,148,186)] hover:text-white"
                        )}
                        title="Split view (Editor + Preview)"
                    >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Split</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setView("preview")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            view === "preview"
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                                : "text-[rgb(148,148,186)] hover:text-white"
                        )}
                        title="Preview only"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                    </button>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Theme Toggle for Preview */}
                    <button
                        type="button"
                        onClick={() => setPreviewTheme(previewTheme === "dark" ? "light" : "dark")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-violet-500/50 text-xs font-medium text-[rgb(148,148,186)] hover:text-white transition-all"
                        title={`Switch preview to ${previewTheme === "dark" ? "Light" : "Dark"} mode`}
                    >
                        {previewTheme === "dark" ? (
                            <>
                                <Moon className="w-3.5 h-3.5 text-violet-400" />
                                <span className="hidden md:inline">Dark Preview</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden md:inline">Light Preview</span>
                            </>
                        )}
                    </button>

                    {/* Copy Markdown */}
                    <button
                        type="button"
                        onClick={() => handleCopy("md")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-violet-500/50 text-xs font-semibold text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Copy Markdown code"
                    >
                        {copied === "md" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied === "md" ? "Copied MD" : "Copy MD"}</span>
                    </button>

                    {/* Copy HTML */}
                    <button
                        type="button"
                        onClick={() => handleCopy("html")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] hover:border-violet-500/50 text-xs font-semibold text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Copy Rendered HTML code"
                    >
                        {copied === "html" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                        <span>{copied === "html" ? "Copied HTML" : "Copy HTML"}</span>
                    </button>

                    {/* Download .md */}
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="btn-primary inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 shadow-md shadow-violet-500/20"
                        title="Download as .md file"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-xl bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white hover:border-violet-500/50 transition-all"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* ─── Markdown Formatting Quick-Toolbar ─────────────────── */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] overflow-x-auto custom-scrollbar mb-3">
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => insertFormatting("**", "**", "bold text")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Bold (**text**)"
                    >
                        <Bold className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("*", "*", "italic text")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Italic (*text*)"
                    >
                        <Italic className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Strikethrough (~~text~~)"
                    >
                        <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[rgb(45,45,65)] mx-1" />

                    <button
                        type="button"
                        onClick={() => insertFormatting("# ", "", "Heading 1")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Heading 1 (# Heading)"
                    >
                        <Heading1 className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("## ", "", "Heading 2")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Heading 2 (## Heading)"
                    >
                        <Heading2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("### ", "", "Heading 3")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Heading 3 (### Heading)"
                    >
                        <Heading3 className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[rgb(45,45,65)] mx-1" />

                    <button
                        type="button"
                        onClick={() => insertFormatting("`", "`", "code")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Inline Code (`code`)"
                    >
                        <Code className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock("```javascript\n// Code block\nconsole.log(\"Hello world\");\n```\n")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Fenced Code Block"
                    >
                        <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("> ", "", "Quote text")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Blockquote (> quote)"
                    >
                        <Quote className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[rgb(45,45,65)] mx-1" />

                    <button
                        type="button"
                        onClick={() => insertFormatting("- ", "", "List item")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Bulleted List (- item)"
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("1. ", "", "Ordered item")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Numbered List (1. item)"
                    >
                        <ListOrdered className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("- [ ] ", "", "Task to complete")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Task Checkbox (- [ ] task)"
                    >
                        <ListTodo className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-[rgb(45,45,65)] mx-1" />

                    <button
                        type="button"
                        onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Link ([title](url))"
                    >
                        <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertFormatting("![", "](https://via.placeholder.com/400x200)", "Image description")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Image (![alt](url))"
                    >
                        <ImageIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock("| Column 1 | Column 2 |\n| :--- | :--- |\n| Item A | Item B |\n| Item C | Item D |\n")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Insert Markdown Table"
                    >
                        <Table className="w-3.5 h-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock("\n---\n")}
                        className="p-1.5 rounded-lg hover:bg-[rgb(28,28,42)] text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Horizontal Rule (---)"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Helper buttons on right */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".md,.markdown,.txt"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[rgb(20,20,30)] border border-[rgb(45,45,65)] hover:border-violet-500/40 text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Open local .md file"
                    >
                        <Upload className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[rgb(20,20,30)] border border-[rgb(45,45,65)] hover:border-violet-500/40 text-[rgb(148,148,186)] hover:text-white transition-all"
                        title="Reset to sample documentation"
                    >
                        <RotateCcw className="w-3 h-3 text-violet-400" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-all"
                        title="Clear all content"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ─── Editor & Live Preview Surfaces ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow gap-4 min-h-0 relative">
                {/* ─── Editor Pane ─── */}
                <div
                    className={cn(
                        "flex flex-col h-full rounded-2xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] overflow-hidden shadow-xl transition-all",
                        view === "preview" ? "hidden" : "flex",
                        view === "editor" ? "lg:col-span-2" : ""
                    )}
                >
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgb(30,30,46)] bg-[rgb(15,15,24)]">
                        <div className="flex items-center gap-2">
                            <Code className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(148,148,186)]">
                                Markdown Input
                            </span>
                        </div>
                        <span className="text-[11px] font-mono text-[rgb(100,100,140)]">
                            {lines} lines
                        </span>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow w-full p-4 sm:p-6 bg-transparent border-none text-[rgb(240,240,255)] font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar selection:bg-violet-500/30 selection:text-white"
                        placeholder="Type your markdown documentation here..."
                        spellCheck={false}
                    />
                </div>

                {/* ─── Preview Pane ─── */}
                <div
                    className={cn(
                        "flex flex-col h-full rounded-2xl border overflow-hidden shadow-xl transition-all",
                        view === "editor" ? "hidden" : "flex",
                        view === "preview" ? "lg:col-span-2" : "",
                        previewTheme === "dark"
                            ? "bg-[rgb(12,12,18)] border-[rgb(38,38,58)]"
                            : "bg-[#ffffff] border-gray-300"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center justify-between px-4 py-2.5 border-b transition-colors",
                            previewTheme === "dark"
                                ? "bg-[rgb(15,15,24)] border-[rgb(30,30,46)] text-[rgb(148,148,186)]"
                                : "bg-gray-100 border-gray-200 text-gray-700"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Live Render
                            </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            GFM Active
                        </span>
                    </div>

                    <div
                        className={cn(
                            "flex-grow p-6 sm:p-8 overflow-y-auto custom-scrollbar markdown-preview-body transition-colors",
                            previewTheme === "dark"
                                ? "text-[rgb(220,220,245)]"
                                : "text-[#1f2328]"
                        )}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                </div>
            </div>

            {/* ─── Footer Stats ──────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] mt-3 text-xs">
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[rgb(110,110,150)]">Words:</span>
                        <span className="font-mono font-semibold text-white">{words}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[rgb(110,110,150)]">Characters:</span>
                        <span className="font-mono font-semibold text-white">{chars}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[rgb(110,110,150)]">Reading time:</span>
                        <span className="font-mono font-semibold text-white">~{readingTime} min</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">RapidKit Markdown Engine</span>
                </div>
            </div>

            {/* ─── Scoped Markdown Preview Styles ────────────────────── */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Common Typography */
                .markdown-preview-body h1 {
                    font-size: 1.85rem;
                    font-weight: 800;
                    margin-top: 1.25rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    line-height: 1.25;
                }
                .markdown-preview-body h2 {
                    font-size: 1.45rem;
                    font-weight: 700;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.35rem;
                    line-height: 1.3;
                }
                .markdown-preview-body h3 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .markdown-preview-body p {
                    margin-bottom: 1rem;
                    line-height: 1.7;
                }
                .markdown-preview-body ul, .markdown-preview-body ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-preview-body li {
                    margin-bottom: 0.35rem;
                    line-height: 1.6;
                }
                .markdown-preview-body ul {
                    list-style-type: disc;
                }
                .markdown-preview-body ol {
                    list-style-type: decimal;
                }
                .markdown-preview-body hr {
                    margin: 1.75rem 0;
                }
                .markdown-preview-body blockquote {
                    padding: 0.75rem 1.25rem;
                    margin: 1rem 0;
                    border-radius: 0 0.75rem 0.75rem 0;
                    font-style: italic;
                }
                .markdown-preview-body pre {
                    padding: 1rem 1.25rem;
                    border-radius: 0.75rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 0.85rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                    line-height: 1.5;
                }
                .markdown-preview-body code {
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 0.825rem;
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.375rem;
                }
                .markdown-preview-body pre code {
                    padding: 0;
                    border: none;
                    background: transparent !important;
                }
                .markdown-preview-body table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.25rem 0;
                    font-size: 0.875rem;
                    border-radius: 0.5rem;
                    overflow: hidden;
                }
                .markdown-preview-body th, .markdown-preview-body td {
                    padding: 0.6rem 0.9rem;
                    text-align: left;
                }
                .markdown-preview-body a {
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .markdown-preview-body input[type="checkbox"] {
                    margin-right: 0.5rem;
                    vertical-align: middle;
                }

                /* Dark Theme Specifics */
                ${previewTheme === "dark" ? `
                    .markdown-preview-body h1 { color: #ffffff; border-bottom: 1px solid rgb(45, 45, 65); }
                    .markdown-preview-body h2 { color: #ffffff; border-bottom: 1px solid rgb(35, 35, 52); }
                    .markdown-preview-body h3 { color: rgb(240, 240, 255); }
                    .markdown-preview-body hr { border-color: rgb(45, 45, 65); }
                    .markdown-preview-body blockquote {
                        border-left: 4px solid #8b5cf6;
                        background: rgba(139, 92, 246, 0.08);
                        color: rgb(180, 180, 215);
                    }
                    .markdown-preview-body pre {
                        background: rgb(8, 8, 14);
                        border: 1px solid rgb(38, 38, 58);
                        color: #6ee7b7;
                    }
                    .markdown-preview-body code {
                        background: rgb(24, 24, 38);
                        color: #f472b6;
                        border: 1px solid rgb(45, 45, 65);
                    }
                    .markdown-preview-body table {
                        border: 1px solid rgb(45, 45, 65);
                    }
                    .markdown-preview-body th {
                        background: rgb(20, 20, 32);
                        color: #ffffff;
                        font-weight: 600;
                        border-bottom: 1px solid rgb(45, 45, 65);
                    }
                    .markdown-preview-body td {
                        border-bottom: 1px solid rgb(30, 30, 46);
                    }
                    .markdown-preview-body tr:nth-child(even) td {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .markdown-preview-body a {
                        color: #22d3ee;
                    }
                    .markdown-preview-body a:hover {
                        color: #67e8f9;
                    }
                ` : `
                    /* Light Theme Specifics */
                    .markdown-preview-body h1 { color: #1f2328; border-bottom: 1px solid #d0d7de; }
                    .markdown-preview-body h2 { color: #1f2328; border-bottom: 1px solid #d0d7de; }
                    .markdown-preview-body h3 { color: #1f2328; }
                    .markdown-preview-body hr { border-color: #d0d7de; }
                    .markdown-preview-body blockquote {
                        border-left: 4px solid #d0d7de;
                        background: #f6f8fa;
                        color: #59636e;
                    }
                    .markdown-preview-body pre {
                        background: #f6f8fa;
                        border: 1px solid #d0d7de;
                        color: #1f2328;
                    }
                    .markdown-preview-body code {
                        background: #eff1f3;
                        color: #cf222e;
                        border: 1px solid #d0d7de;
                    }
                    .markdown-preview-body table {
                        border: 1px solid #d0d7de;
                    }
                    .markdown-preview-body th {
                        background: #f6f8fa;
                        color: #1f2328;
                        font-weight: 600;
                        border-bottom: 1px solid #d0d7de;
                    }
                    .markdown-preview-body td {
                        border-bottom: 1px solid #d0d7de;
                    }
                    .markdown-preview-body tr:nth-child(even) td {
                        background: #f6f8fa;
                    }
                    .markdown-preview-body a {
                        color: #0969da;
                    }
                `}
            ` }} />
        </div>
    );

    return mounted && isFullscreen ? createPortal(editorContent, document.body) : editorContent;
}
