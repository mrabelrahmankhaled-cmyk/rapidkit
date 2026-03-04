"use client";

import { useState, useCallback, useRef } from "react";
import {
    FileCode,
    Upload,
    Trash2,
    Copy,
    Check,
    Image as ImageIcon,
    Type,
    ArrowRightLeft,
    RefreshCw,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "image-to-base64" | "text-base64";

export function Base64ConverterTool() {
    const [mode, setMode] = useState<Mode>("image-to-base64");

    // Image Mode States
    const [image, setImage] = useState<string | null>(null);
    const [base64, setBase64] = useState("");
    const [fileName, setFileName] = useState("");
    const [imageCopied, setImageCopied] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Text Mode States
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [textCopied, setTextCopied] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Image Conversion ───────────────────────────────────────────
    const handleImageFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImage(result);
            setBase64(result);
        };
        reader.readAsDataURL(file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageFile(file);
    };

    // ─── Text Conversion ────────────────────────────────────────────
    const processText = useCallback((input: string, decode: boolean) => {
        setInputText(input);
        if (!input) {
            setOutputText("");
            return;
        }
        try {
            if (decode) {
                setOutputText(atob(input));
            } else {
                setOutputText(btoa(input));
            }
        } catch (e) {
            setOutputText("Error: Invalid input for transformation.");
        }
    }, []);

    const toggleTextMode = () => {
        setIsDecoding(!isDecoding);
        processText(inputText, !isDecoding);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Tab Switcher */}
            <div className="flex p-1.5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] w-fit">
                <button
                    onClick={() => setMode("image-to-base64")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                        mode === "image-to-base64" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                    )}
                >
                    <ImageIcon className="w-4 h-4" />
                    Image to Base64
                </button>
                <button
                    onClick={() => setMode("text-base64")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all",
                        mode === "text-base64" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                    )}
                >
                    <Type className="w-4 h-4" />
                    Text ↔ Base64
                </button>
            </div>

            {/* ─── Mode: Image to Base64 ───────────────────────────── */}
            {mode === "image-to-base64" && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in duration-500">
                    <div className="space-y-6">
                        {!image ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500 cursor-pointer",
                                    dragActive ? "border-violet-500 bg-violet-500/10 scale-[0.99]" : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-violet-500/50"
                                )}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center justify-center shadow-xl">
                                    <Upload className="w-6 h-6 text-violet-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white">Select or drop an image</p>
                                    <p className="text-[10px] text-[rgb(80,80,120)] uppercase tracking-widest mt-1">Supports JPG, PNG, WEBP, SVG</p>
                                </div>
                                <input
                                    ref={fileInputRef} type="file" className="hidden" accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-6 rounded-3xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon className="w-3.5 h-3.5" /> preview
                                        </span>
                                        <button
                                            onClick={() => { setImage(null); setBase64(""); }}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-6 items-center">
                                        <img src={image} alt="Preview" className="w-32 h-32 object-contain rounded-xl bg-black/40 border border-white/5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</h4>
                                            <p className="text-[10px] text-[rgb(80,80,120)] mt-1">Format: Base64 Data URI</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Base64 Output</h4>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(base64);
                                                setImageCopied(true);
                                                setTimeout(() => setImageCopied(false), 2000);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                                                imageCopied ? "bg-emerald-500 text-white" : "bg-violet-600 text-white hover:bg-violet-500"
                                            )}
                                        >
                                            {imageCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {imageCopied ? "Copied" : "Copy String"}
                                        </button>
                                    </div>
                                    <textarea
                                        readOnly value={base64}
                                        className="w-full h-48 p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-600/20">
                            <FileCode className="w-8 h-8 mb-4 opacity-50" />
                            <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Developer Note</h4>
                            <p className="text-xs text-white/80 leading-relaxed">
                                Use Base64 strings for small icons to reduce HTTP requests. For larger images, traditional file hosting is recommended to maintain page speed.
                            </p>
                        </div>
                        <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                            <h4 className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Typical Usage</h4>
                            <code className="block p-3 rounded-xl bg-black/40 text-[10px] text-violet-300 font-mono">
                                .icon &#123;<br />
                                &nbsp;&nbsp;background: url('data:image/png;base64,...');<br />
                                &#125;
                            </code>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Mode: Text ↔ Base64 ───────────────────────────── */}
            {mode === "text-base64" && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1">
                                {isDecoding ? "Base64 String" : "Plain Text"}
                            </label>
                            <textarea
                                value={inputText}
                                onChange={(e) => processText(e.target.value, isDecoding)}
                                placeholder={isDecoding ? "SGVsbG8gV29ybGQh" : "Hello World!"}
                                className="w-full h-48 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={toggleTextMode}
                            className="p-4 rounded-2xl bg-[rgb(30,30,46)] border border-[rgb(45,45,65)] text-violet-400 hover:text-white hover:bg-violet-600 transition-all shadow-xl group"
                            title="Reverse Conversion"
                        >
                            <ArrowRightLeft className="w-6 h-6 group-active:rotate-180 transition-transform duration-500" />
                        </button>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center pl-1">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    {isDecoding ? "Plain Text" : "Base64 String"}
                                </label>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(outputText);
                                        setTextCopied(true);
                                        setTimeout(() => setTextCopied(false), 2000);
                                    }}
                                    className="p-1 px-2 rounded-lg bg-white/5 text-[10px] text-violet-400 hover:text-white transition-all flex items-center gap-1"
                                >
                                    {textCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {textCopied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <textarea
                                readOnly value={outputText}
                                className="w-full h-48 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none resize-none shadow-inner leading-relaxed opacity-80"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-600/5 border border-violet-500/10">
                        <RefreshCw className="w-4 h-4 text-violet-400" />
                        <p className="text-[11px] text-[rgb(100,100,140)]">
                            <strong>Note:</strong> Transformation happens in real-time as you type. Base64 is not encryption, it is encoding.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
