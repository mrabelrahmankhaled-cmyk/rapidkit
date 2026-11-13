"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
    PenTool,
    Trash2,
    Download,
    Copy,
    Check,
    Palette,
    Info,
    Sparkles,
    MousePointer2,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
    { name: "Ink Black", value: "#000000" },
    { name: "Royal Blue", value: "#003399" },
    { name: "Dark Red", value: "#CC0000" },
    { name: "Emerald", value: "#059669" }
];

const THICKNESS = [
    { label: "Fine", value: 1.5 },
    { label: "Medium", value: 3 },
    { label: "Bold", value: 5 }
];

export function SignaturePadTool() {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const lastCanvasSize = useRef<{ width: number; height: number; ratio: number } | null>(null);
    const [penColor, setPenColor] = useState("#000000");
    const penColorRef = useRef(penColor);
    const [penWidth, setPenWidth] = useState(3);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "fallback">("idle");
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        penColorRef.current = penColor;
    }, [penColor]);

    useEffect(() => {
        const pad = sigCanvas.current;
        if (!pad) return;

        const canvas = pad.getCanvas();
        lastCanvasSize.current = {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            ratio: Math.max(window.devicePixelRatio ?? 1, 1),
        };

        const handleResize = () => {
            const currentPad = sigCanvas.current;
            if (!currentPad) return;

            const currentCanvas = currentPad.getCanvas();
            const nextWidth = currentCanvas.offsetWidth;
            const nextHeight = currentCanvas.offsetHeight;
            const nextRatio = Math.max(window.devicePixelRatio ?? 1, 1);

            if (nextWidth === 0 || nextHeight === 0) return;

            const prev = lastCanvasSize.current;
            if (
                prev &&
                prev.width === nextWidth &&
                prev.height === nextHeight &&
                prev.ratio === nextRatio
            ) {
                return;
            }

            const data = currentPad.toData();
            const scaleX = prev && prev.width > 0 ? nextWidth / prev.width : 1;
            const scaleY = prev && prev.height > 0 ? nextHeight / prev.height : 1;

            currentCanvas.width = nextWidth * nextRatio;
            currentCanvas.height = nextHeight * nextRatio;
            const ctx = currentCanvas.getContext("2d");
            if (ctx) {
                ctx.scale(nextRatio, nextRatio);
            }

            if (data.length > 0) {
                const scaledData =
                    scaleX !== 1 || scaleY !== 1
                        ? data.map((group) =>
                              group.map((point) =>
                                  Object.assign({}, point, {
                                      x: point.x * scaleX,
                                      y: point.y * scaleY,
                                  })
                              )
                          )
                        : data;
                currentPad.fromData(scaledData);
                currentPad.getSignaturePad().penColor = penColorRef.current;
            } else {
                currentPad.clear();
            }

            lastCanvasSize.current = {
                width: nextWidth,
                height: nextHeight,
                ratio: nextRatio,
            };
            setIsEmpty(currentPad.isEmpty());
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const scheduleCopyReset = (ms: number) => {
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopyState("idle"), ms);
    };

    const clear = () => {
        sigCanvas.current?.clear();
        setIsDrawing(false);
        setIsEmpty(true);
    };

    const trim = () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setIsEmpty(true);
            return null;
        }
        return sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    };

    const downloadUrl = (href: string) => {
        const link = document.createElement("a");
        link.href = href;
        link.download = `rapidkit-signature-${new Date().getTime()}.png`;
        link.click();
    };

    const download = () => {
        const dataURL = trim();
        if (!dataURL) return;
        downloadUrl(dataURL);
    };

    const fallbackDownload = (blob: Blob | null) => {
        if (blob) {
            const url = URL.createObjectURL(blob);
            downloadUrl(url);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
            download();
        }
        setCopyState("fallback");
        scheduleCopyReset(3500);
    };

    const copyToClipboard = () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setIsEmpty(true);
            return;
        }

        sigCanvas.current.getTrimmedCanvas().toBlob((blob) => {
            if (!blob || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
                fallbackDownload(blob);
                return;
            }
            try {
                navigator.clipboard
                    .write([new ClipboardItem({ "image/png": blob })])
                    .then(() => {
                        setCopyState("copied");
                        scheduleCopyReset(2000);
                    })
                    .catch(() => fallbackDownload(blob));
            } catch {
                fallbackDownload(blob);
            }
        }, "image/png");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-8 items-start">
            {/* ─── Signature Canvas Zone ─── */}
            <div className="space-y-6">
                <div className="p-2.5 sm:p-4 rounded-2xl md:rounded-[3.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex flex-col items-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent)] pointer-events-none" />

                    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-2 sm:px-4 md:px-8 py-2.5 md:py-4 mb-2">
                        <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
                            <div className="w-2 h-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-[rgb(100,100,140)] uppercase tracking-wider md:tracking-widest whitespace-nowrap">Active Canvas</span>
                        </div>
                        <button
                            onClick={clear}
                            className="py-2 px-3 md:p-2.5 md:px-4 rounded-xl md:rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider md:tracking-widest whitespace-nowrap shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" /> Clear
                        </button>
                    </div>

                    <div className="w-full aspect-[4/3] min-h-[260px] md:min-h-0 md:aspect-[2/1] bg-white rounded-xl md:rounded-[2.5rem] relative overflow-hidden cursor-crosshair group">
                        <SignatureCanvas
                            ref={sigCanvas}
                            clearOnResize={false}
                            penColor={penColor}
                            velocityFilterWeight={0.7}
                            minWidth={penWidth * 0.5}
                            maxWidth={penWidth}
                            onBegin={() => setIsDrawing(true)}
                            onEnd={() => {
                                setIsDrawing(false);
                                setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
                            }}
                            canvasProps={{
                                className: "w-full h-full",
                                style: { width: '100%', height: '100%' }
                            }}
                        />
                        {isEmpty && !isDrawing && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-gray-300">
                                <MousePointer2 className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 opacity-20" />
                                <p className="text-sm font-medium opacity-40">Start signing here...</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6 md:px-4">
                        <button
                            onClick={copyToClipboard}
                            disabled={isEmpty}
                            className={cn(
                                "w-full py-3.5 md:py-4 px-4 rounded-2xl md:rounded-3xl font-bold text-sm md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap flex items-center justify-center gap-2.5 md:gap-3 transition-all",
                                isEmpty ? "opacity-50 grayscale cursor-not-allowed bg-[rgb(17,17,27)] border border-[rgb(35,35,55)]" : "bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white hover:bg-[rgb(30,30,46)]"
                            )}
                        >
                            {copyState === "copied" ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <Copy className="w-4 h-4 shrink-0 text-indigo-400" />}
                            {copyState === "copied" ? "Copied PNG!" : "Copy to Clip"}
                        </button>
                        <button
                            onClick={download}
                            disabled={isEmpty}
                            className={cn(
                                "w-full py-3.5 md:py-4 px-4 rounded-2xl md:rounded-3xl font-bold text-sm md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap flex items-center justify-center gap-2.5 md:gap-3 transition-all shadow-xl",
                                isEmpty ? "opacity-50 grayscale cursor-not-allowed bg-[rgb(25,25,35)]" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                            )}
                        >
                            <Download className="w-4 h-4 shrink-0" />
                            Download .PNG
                        </button>
                    </div>
                    {copyState === "fallback" && (
                        <p role="status" aria-live="polite" className="mt-3 text-center text-xs text-amber-300/90">
                            Clipboard unavailable, downloaded the PNG instead.
                        </p>
                    )}
                </div>

                <div className="p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <History className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white mb-0.5">Smooth Strokes</p>
                            <p className="text-[10px] text-[rgb(120,120,160)]">Bezier curve smoothing exported as a crisp high-DPI PNG.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Controls Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-5 sm:p-8 rounded-2xl md:rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6 md:space-y-8">
                    <div className="space-y-5">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Pen Color
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setPenColor(c.value)}
                                    className={cn(
                                        "w-full aspect-square rounded-2xl border-4 transition-all scale-100 hover:scale-110",
                                        penColor === c.value ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            <PenTool className="w-4 h-4" /> Stroke Weight
                        </label>
                        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[rgb(10,10,15)] rounded-2xl border border-[rgb(35,35,50)]">
                            {THICKNESS.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setPenWidth(t.value)}
                                    className={cn(
                                        "py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all",
                                        penWidth === t.value ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-[rgb(100,100,140)] hover:text-white"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[rgb(35,35,55)] space-y-4">
                        <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                                Tip: Use the &quot;Fine&quot; pen for detailed signatures and &quot;Bold&quot; for stylistic initials.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 sm:p-8 rounded-2xl md:rounded-[3rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <Info className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Pro Usage</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        Downloaded signatures are high-DPI PNGs with a transparent background. You can drop them directly into Word, Adobe, or web forms.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>
            </div>
        </div>
    );
}
