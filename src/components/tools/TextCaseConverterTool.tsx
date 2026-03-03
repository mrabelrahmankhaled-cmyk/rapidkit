"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseMode =
    | "uppercase"
    | "lowercase"
    | "title"
    | "sentence"
    | "camel"
    | "pascal"
    | "snake"
    | "kebab"
    | "alternating";

function convertCase(text: string, mode: CaseMode): string {
    if (!text) return "";
    switch (mode) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "title":
            return text.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
        case "sentence":
            return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        case "camel":
            return text
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        case "pascal":
            return text
                .toLowerCase()
                .replace(/(^|[^a-zA-Z0-9])(.)/g, (_, __, c) => c.toUpperCase());
        case "snake":
            return text
                .trim()
                .toLowerCase()
                .replace(/[\s\-]+/g, "_")
                .replace(/[^a-z0-9_]/g, "");
        case "kebab":
            return text
                .trim()
                .toLowerCase()
                .replace(/[\s_]+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
        case "alternating":
            return text
                .split("")
                .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
                .join("");
        default:
            return text;
    }
}

const MODES: { id: CaseMode; label: string; preview: string; color: string }[] = [
    { id: "uppercase", label: "UPPERCASE", preview: "HELLO WORLD", color: "from-red-500 to-rose-600" },
    { id: "lowercase", label: "lowercase", preview: "hello world", color: "from-blue-500 to-indigo-600" },
    { id: "title", label: "Title Case", preview: "Hello World", color: "from-violet-500 to-purple-600" },
    { id: "sentence", label: "Sentence", preview: "Hello world", color: "from-emerald-500 to-teal-600" },
    { id: "camel", label: "camelCase", preview: "helloWorld", color: "from-amber-500 to-orange-600" },
    { id: "pascal", label: "PascalCase", preview: "HelloWorld", color: "from-pink-500 to-rose-600" },
    { id: "snake", label: "snake_case", preview: "hello_world", color: "from-cyan-500 to-sky-600" },
    { id: "kebab", label: "kebab-case", preview: "hello-world", color: "from-lime-500 to-green-600" },
    { id: "alternating", label: "aLtErNaTInG", preview: "hElLo wOrLd", color: "from-fuchsia-500 to-purple-600" },
];

export function TextCaseConverterTool() {
    const [input, setInput] = useState("");
    const [active, setActive] = useState<CaseMode>("title");
    const [copied, setCopied] = useState(false);

    const output = convertCase(input, active);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeMode = MODES.find((m) => m.id === active)!;

    return (
        <div className="space-y-6">
            {/* ─── Mode Grid ──────────────────────────────── */}
            <div>
                <label className="block text-xs font-medium text-[rgb(80,80,120)] mb-3 uppercase tracking-wider">Select Case Style</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {MODES.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setActive(mode.id)}
                            className={cn(
                                "p-3 rounded-xl border text-center transition-all group",
                                active === mode.id
                                    ? "border-violet-500/50 bg-violet-500/10"
                                    : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-[rgb(80,80,120)]"
                            )}
                        >
                            <div className={cn(
                                "text-xs font-bold mb-0.5 bg-gradient-to-r bg-clip-text text-transparent",
                                active === mode.id ? mode.color : "from-gray-400 to-gray-500"
                            )}>
                                {mode.preview}
                            </div>
                            <div className="text-[10px] text-[rgb(80,80,120)]">{mode.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Input / Output ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Input Text</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="w-full h-48 p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(45,45,65)] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-sm resize-none leading-relaxed transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                            Output — <span className={`bg-gradient-to-r ${activeMode.color} bg-clip-text text-transparent font-bold`}>{activeMode.label}</span>
                        </label>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={cn(
                                "flex items-center gap-1 text-xs transition-colors disabled:opacity-30",
                                copied ? "text-emerald-400" : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                    <div
                        className="w-full h-48 p-4 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-sm leading-relaxed overflow-auto cursor-pointer hover:border-violet-500/30 transition-all"
                        onClick={handleCopy}
                    >
                        {output ? (
                            <span className="text-white">{output}</span>
                        ) : (
                            <span className="text-[rgb(45,45,65)]">Converted text will appear here...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Quick Actions ───────────────────────────── */}
            {input && (
                <div className="flex flex-wrap gap-2">
                    {MODES.filter((m) => m.id !== active).slice(0, 4).map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setActive(mode.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white hover:border-[rgb(80,80,120)] transition-all"
                        >
                            → {mode.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
