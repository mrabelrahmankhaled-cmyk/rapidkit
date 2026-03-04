"use client";

import { useState, useCallback, useRef } from "react";
import EXIF from "exif-js";
import {
    Upload,
    ShieldCheck,
    ShieldAlert,
    Info,
    Download,
    Trash2,
    MapPin,
    Camera,
    Clock,
    FileImage,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Metadata {
    Make?: string;
    Model?: string;
    DateTime?: string;
    GPSLatitude?: any[];
    GPSLongitude?: any[];
    Software?: string;
    ExposureTime?: string;
    FNumber?: string;
    ISOSpeedRatings?: string;
}

export function ImageMetadataRemoverTool() {
    const [image, setImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState("");
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [processing, setProcessing] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Handlers ───────────────────────────────────────────────────
    const processFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return;

        setFileName(file.name);
        setDownloaded(false);
        const reader = new FileReader();

        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImage(result);

            // Read Metadata
            EXIF.getData(file as any, function (this: any) {
                const allData = EXIF.getAllTags(this);
                if (Object.keys(allData).length > 0) {
                    setMetadata(allData);
                } else {
                    setMetadata(null);
                }
            });
        };
        reader.readAsDataURL(file);
    }, []);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleDownload = async () => {
        if (!image) return;
        setProcessing(true);

        const img = new Image();
        img.src = image;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (ctx) {
                // Drawing to canvas strips metadata
                ctx.drawImage(img, 0, 0);
                const cleanImage = canvas.toDataURL("image/jpeg", 0.9);

                const link = document.createElement("a");
                link.download = `rapidkit-clean-${fileName.split('.')[0]}.jpg`;
                link.href = cleanImage;
                link.click();

                setDownloaded(true);
            }
            setProcessing(false);
        };
    };

    const handleClear = () => {
        setImage(null);
        setMetadata(null);
        setFileName("");
        setDownloaded(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start">
            {/* ─── Main Workspace ────────────────────────────── */}
            <div className="space-y-6">
                {!image ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "group cursor-pointer aspect-video rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all duration-500 overflow-hidden relative",
                            dragActive
                                ? "border-violet-500 bg-violet-500/10 scale-[0.99]"
                                : "border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-violet-500/50 hover:bg-violet-500/5"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />

                        <div className="w-20 h-20 rounded-3xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                            <Upload className="w-8 h-8 text-violet-400 group-hover:animate-bounce" />
                        </div>

                        <div className="text-center space-y-2 relative">
                            <h3 className="text-xl font-bold text-white">Drag & Drop Image</h3>
                            <p className="text-sm text-[rgb(80,80,120)]">or click to browse from device</p>
                        </div>

                        <div className="flex gap-4 mt-4 relative">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(60,60,90)] px-3 py-1 rounded-full border border-[rgb(30,30,46)]">JPG</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(60,60,90)] px-3 py-1 rounded-full border border-[rgb(30,30,46)]">PNG</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(60,60,90)] px-3 py-1 rounded-full border border-[rgb(30,30,46)]">WEBP</span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                        />
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Preview Glass Card */}
                        <div className="relative group p-6 rounded-[2.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-50" />

                            <div className="relative flex flex-col sm:flex-row gap-8 items-center">
                                <div className="w-full sm:w-64 aspect-square rounded-3xl overflow-hidden border border-[rgb(45,45,65)] shadow-2xl bg-black/40">
                                    <img src={image} alt="Preview" className="w-full h-full object-contain" />
                                </div>

                                <div className="flex-1 space-y-6 w-full">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <FileImage className="w-5 h-5 text-violet-400" />
                                                {fileName}
                                            </h3>
                                            <p className="text-sm text-[rgb(80,80,120)] mt-1">Image loaded & analyzed successfully.</p>
                                        </div>
                                        <button
                                            onClick={handleClear}
                                            className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={handleDownload}
                                            disabled={processing}
                                            className={cn(
                                                "flex-1 min-w-[160px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all shadow-xl",
                                                downloaded
                                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                                    : "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/30"
                                            )}
                                        >
                                            {processing ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : downloaded ? (
                                                <><Check className="w-5 h-5" /> Downloaded Clean!</>
                                            ) : (
                                                <><ShieldCheck className="w-5 h-5" /> Strip EXIF & Download</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Information */}
                        <div className="p-6 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                            <h4 className="text-xs font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-1 mb-4">Detected Metadata</h4>

                            {!metadata ? (
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-400">Perfectly Clean</p>
                                        <p className="text-xs text-emerald-200/50">No hidden metadata or GPS location found in this file.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 animate-pulse">
                                            <ShieldAlert className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-amber-400">Privacy Warning</p>
                                            <p className="text-xs text-amber-200/50">This image contains hidden data that could reveal your location or camera details.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {metadata.Model && (
                                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center gap-3">
                                                <Camera className="w-5 h-5 text-violet-400 opacity-50" />
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-[rgb(80,80,120)] uppercase font-bold">Device</p>
                                                    <p className="text-xs text-white truncate font-mono">{metadata.Model}</p>
                                                </div>
                                            </div>
                                        )}
                                        {metadata.DateTime && (
                                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-violet-400 opacity-50" />
                                                <div>
                                                    <p className="text-[10px] text-[rgb(80,80,120)] uppercase font-bold">Captured At</p>
                                                    <p className="text-xs text-white font-mono">{metadata.DateTime}</p>
                                                </div>
                                            </div>
                                        )}
                                        {(metadata.GPSLatitude || metadata.GPSLongitude) && (
                                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.3)]" />
                                                <div>
                                                    <p className="text-[10px] text-red-300 uppercase font-bold">Location Data</p>
                                                    <p className="text-xs text-red-400 font-bold">Enabled</p>
                                                </div>
                                            </div>
                                        )}
                                        {metadata.Software && (
                                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] flex items-center gap-3">
                                                <Info className="w-5 h-5 text-violet-400 opacity-50" />
                                                <div className="overflow-hidden">
                                                    <p className="text-[10px] text-[rgb(80,80,120)] uppercase font-bold">Editing Soft</p>
                                                    <p className="text-xs text-white truncate font-mono">{metadata.Software}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Information Sidebar ────────────────────────── */}
            <div className="space-y-5">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-600/20">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Private Processing</h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                        RapidKit processes your images using <strong>Client-Side Canvas</strong> technology. Your photos are never uploaded to any server. They remain 100% on your machine.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest pl-1">Why remove EXIF?</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                            <p className="text-xs text-[rgb(100,100,140)]">Hide your exact GPS coordinates from strangers on the internet.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-[rgb(100,100,140)]">Conceal the type of camera or smartphone you are using.</p>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-[rgb(100,100,140)]">Strip technical settings like exposure, aperture, and ISO.</p>
                        </li>
                    </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3 items-start">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(100,100,140)]">Supports bulk stripping coming soon. Currently optimized for manual single-image cleaning.</p>
                </div>
            </div>
        </div>
    );
}
