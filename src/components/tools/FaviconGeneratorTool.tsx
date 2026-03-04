"use client";

import { useState, useCallback, useRef } from "react";
import JSZip from "jszip";
import {
    Globe,
    Upload,
    Trash2,
    Download,
    Copy,
    Check,
    FileCode,
    Maximize2,
    Info,
    Sparkles,
    ShieldCheck,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "favicon-48x48.png", size: 48 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "android-chrome-192x192.png", size: 192 },
    { name: "android-chrome-512x512.png", size: 512 },
];

export function FaviconGeneratorTool() {
    const [image, setImage] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const generateAll = async () => {
        if (!image) return;
        setGenerating(true);

        try {
            const zip = new JSZip();
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            await new Promise((resolve) => {
                img.onload = resolve;
                img.src = image;
            });

            // ─── Generate PNGs ───
            const pngBlobs: { name: string, blob: Blob, size: number }[] = [];

            for (const item of SIZES) {
                canvas.width = item.size;
                canvas.height = item.size;
                ctx?.clearRect(0, 0, item.size, item.size);

                // Draw image maintaining aspect ratio or centered
                const scale = Math.min(item.size / img.width, item.size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (item.size - w) / 2;
                const y = (item.size - h) / 2;

                ctx?.drawImage(img, x, y, w, h);

                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), "image/png");
                });

                zip.file(item.name, blob);
                pngBlobs.push({ name: item.name, blob, size: item.size });
            }

            // ─── Generate favicon.ico (Multiple PNGs inside ICO) ───
            // We'll use 16, 32, and 48 for the ico
            const icoSizes = pngBlobs.filter(p => [16, 32, 48].includes(p.size));
            const icoBuffer = await createIcoFromPngs(icoSizes);
            zip.file("favicon.ico", icoBuffer);

            // ─── Generate site.webmanifest ───
            const manifest = {
                name: "RapidKit Generated App",
                short_name: "RapidKit",
                icons: [
                    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
                ],
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone"
            };
            zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

            // Generate ZIP
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = "favicon-kit.zip";
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Favicon generation failed:", error);
        } finally {
            setGenerating(false);
        }
    };

    // Helper: Simple ICO encoder (PNG as data)
    const createIcoFromPngs = async (pngInfos: { blob: Blob, size: number }[]) => {
        const count = pngInfos.length;
        const headerSize = 6 + (count * 16);
        let totalSize = headerSize;

        const fileContents: ArrayBuffer[] = [];
        for (const info of pngInfos) {
            const buffer = await info.blob.arrayBuffer();
            fileContents.push(buffer);
            totalSize += buffer.byteLength;
        }

        const icoBuffer = new Uint8Array(totalSize);
        const view = new DataView(icoBuffer.buffer);

        // Header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // ICO type
        view.setUint16(4, count, true);

        let offset = headerSize;
        pngInfos.forEach((info, i) => {
            const imgData = fileContents[i];
            const size = info.size >= 256 ? 0 : info.size; // 0 means 256
            const entryOffset = 6 + (i * 16);

            view.setUint8(entryOffset, size); // Width
            view.setUint8(entryOffset + 1, size); // Height
            view.setUint8(entryOffset + 2, 0); // Palette
            view.setUint8(entryOffset + 3, 0); // Reserved
            view.setUint16(entryOffset + 4, 1, true); // Planes
            view.setUint16(entryOffset + 6, 32, true); // BPP
            view.setUint32(entryOffset + 8, imgData.byteLength, true); // Size
            view.setUint32(entryOffset + 12, offset, true); // Offset

            icoBuffer.set(new Uint8Array(imgData), offset);
            offset += imgData.byteLength;
        });

        return icoBuffer;
    };

    const copyCode = () => {
        const code = `<!-- Standard Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Web Manifest -->
<link rel="manifest" href="/site.webmanifest">`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* ─── Workspace ─── */}
            <div className="space-y-6">
                {!image ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "group aspect-[16/9] rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all duration-500 cursor-pointer overflow-hidden relative",
                            dragActive
                                ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                                : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-emerald-500/50 hover:bg-emerald-500/5 shadow-2xl"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />

                        <div className="w-20 h-20 rounded-[2rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl relative">
                            <Upload className="w-8 h-8 text-emerald-400 group-hover:animate-bounce" />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">Generate Favicon Kit</h3>
                            <p className="text-sm text-[rgb(80,80,120)]">Upload square logo (PNG/JPG) for best results</p>
                        </div>

                        <input
                            ref={fileInputRef} type="file" className="hidden" accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Preview Zone */}
                        <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 flex gap-2">
                                <button
                                    onClick={handleClear}
                                    className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                {/* Tab Preview Simulator */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">Browser Tab Preview</h4>
                                    <div className="bg-[rgb(30,30,40)] rounded-t-xl p-2 pb-0 border border-[rgb(45,45,65)]">
                                        <div className="flex gap-2 mb-2 px-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                        </div>
                                        <div className="bg-[rgb(45,45,60)] rounded-t-lg p-2.5 flex items-center gap-3 w-48 shadow-xl border-x border-t border-[rgb(60,60,80)]">
                                            <img src={image} className="w-4 h-4 rounded-sm shadow-sm" alt="Favicon" />
                                            <span className="text-[10px] text-white/70 font-medium truncate">My Awesome Website</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-[rgb(20,20,30)] rounded-b-xl border-x border-b border-[rgb(45,45,65)]" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">Asset Package Ready</h3>
                                        <p className="text-sm text-[rgb(100,100,140)]">Generating 7 files including .ico, .png, and webmanifest.</p>
                                    </div>

                                    <button
                                        onClick={generateAll}
                                        disabled={generating}
                                        className="w-full py-4 rounded-2xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {generating ? <div className="w-5 h-5 border-2 border-black/20 border-t-black animate-spin rounded-full" /> : <Download className="w-5 h-5" />}
                                        {generating ? "Packing Assets..." : "Download Favicon Kit (.zip)"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Implementation Guide */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                                    <FileCode className="w-3.5 h-3.5" /> HTML Implementation
                                </h4>
                                <button
                                    onClick={copyCode}
                                    className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-300"
                                >
                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copied ? "Copied" : "Copy Tags"}
                                </button>
                            </div>

                            <div className="p-6 rounded-3xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] font-mono text-[11px] leading-relaxed text-emerald-500/90 overflow-x-auto whitespace-pre">
                                {`<!-- Standard Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Web Manifest -->
<link rel="manifest" href="/site.webmanifest">`}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                    <Globe className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Why Multi-Size?</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        Modern SEO and UX require icons for various devices. We generate the 16x16 fallback, the 180x180 Apple icon, and high-res Android manifest icons automatically.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Security Note
                    </h4>
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                        All image scaling and ZIP compression happens <strong>entirely inside your browser</strong>. Your company logo is never uploaded to any server.
                    </p>
                </div>

                <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" /> Best Practices
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                            <p className="text-[10px] text-white/70">Use a square image (1:1 ratio) to avoid distortion.</p>
                        </li>
                        <li className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                            <p className="text-[10px] text-white/70">Ensure your logo has a transparent background (PNG).</p>
                        </li>
                        <li className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                            <p className="text-[10px] text-white/70">Keep fine details minimal as they vanish at 16x16.</p>
                        </li>
                    </ul>
                </div>

                <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                        RapidKit follows <strong>Google & Apple</strong> standards for icon naming and sizes to ensure perfect display on all platforms.
                    </p>
                </div>
            </div>
        </div>
    );
}
