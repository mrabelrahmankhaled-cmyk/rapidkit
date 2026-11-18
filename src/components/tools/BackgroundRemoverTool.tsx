"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Upload,
    Sparkles,
    Download,
    Copy,
    Check,
    X,
    AlertCircle,
    Trash2,
    ShieldCheck,
    SlidersHorizontal,
    Layers,
    Palette,
    ImageIcon,
    RefreshCw,
    MoveHorizontal,
    Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    type BackgroundSelection,
    type ProcessingMode,
    type TelemetryState,
    ACCEPTED_IMAGE_MIME_TYPES,
    GRADIENT_BG_PRESETS,
    MAX_FILE_SIZE_MB,
    PROCESSING_MODE_CONFIG,
    SOLID_BG_PRESETS,
    buildOutputFilename,
    calculateConstrainedDimensions,
    computeLinearGradientCoords,
    createTelemetryState,
    formatFileSize,
    getDefaultProcessingMode,
    reduceTelemetryProgress,
    validateImageFile,
} from "@/lib/backgroundRemover";

type CopyState = "idle" | "copying" | "copied" | "fallback" | "error";

const CHECKERBOARD_STYLE: React.CSSProperties = {
    backgroundColor: "#14141f",
    backgroundImage:
        "linear-gradient(45deg, #222233 25%, transparent 25%), linear-gradient(-45deg, #222233 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222233 75%), linear-gradient(-45deg, transparent 75%, #222233 75%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
};

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to decode image pixels."));
        };
        img.src = url;
    });
}

async function preprocessImageBlob(
    sourceBlob: Blob,
    maxDimension: number
): Promise<{
    blob: Blob;
    naturalWidth: number;
    naturalHeight: number;
    processedWidth: number;
    processedHeight: number;
    wasDownscaled: boolean;
}> {
    const img = await loadImageFromBlob(sourceBlob);
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const dims = calculateConstrainedDimensions(
        naturalWidth,
        naturalHeight,
        maxDimension
    );

    if (!dims.wasDownscaled) {
        return {
            blob: sourceBlob,
            naturalWidth,
            naturalHeight,
            processedWidth: dims.width,
            processedHeight: dims.height,
            wasDownscaled: false,
        };
    }

    const canvas = document.createElement("canvas");
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas 2D context is not available in this browser.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, dims.width, dims.height);

    const resizedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (b) resolve(b);
                else reject(new Error("Failed to resize image for local inference."));
            },
            "image/png"
        );
    });

    return {
        blob: resizedBlob,
        naturalWidth,
        naturalHeight,
        processedWidth: dims.width,
        processedHeight: dims.height,
        wasDownscaled: true,
    };
}

/**
 * Generates an 800x800 offline synthetic portrait over a scenic gradient sky + hills
 * backdrop so users can test background removal without uploading any file or using external URLs.
 */
async function generateSyntheticSampleBlob(): Promise<Blob> {
    const size = 800;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is unavailable.");

    // 1. Scenic golden-hour sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, size * 0.78);
    sky.addColorStop(0, "#0284c7");
    sky.addColorStop(0.55, "#7dd3fc");
    sky.addColorStop(1, "#fef08a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    // 2. Soft sun glow + bokeh circles
    const sun = ctx.createRadialGradient(180, 175, 10, 180, 175, 190);
    sun.addColorStop(0, "rgba(255, 252, 230, 0.95)");
    sun.addColorStop(0.35, "rgba(253, 224, 71, 0.45)");
    sun.addColorStop(1, "rgba(253, 224, 71, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, size, size);

    const bokehSpots = [
        { x: 640, y: 150, r: 44, a: 0.2 },
        { x: 690, y: 240, r: 28, a: 0.16 },
        { x: 120, y: 310, r: 34, a: 0.15 },
    ];
    for (const spot of bokehSpots) {
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${spot.a})`;
        ctx.fill();
    }

    // 3. Distant scenic mountains + foreground meadow
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.quadraticCurveTo(210, 420, 430, 520);
    ctx.quadraticCurveTo(640, 430, 800, 510);
    ctx.lineTo(800, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fillStyle = "#0f766e";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 625);
    ctx.quadraticCurveTo(260, 560, 510, 620);
    ctx.quadraticCurveTo(680, 585, 800, 610);
    ctx.lineTo(800, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    const meadow = ctx.createLinearGradient(0, 580, 0, 800);
    meadow.addColorStop(0, "#059669");
    meadow.addColorStop(1, "#064e3b");
    ctx.fillStyle = meadow;
    ctx.fill();

    // 4. Foreground Subject: Shaded Studio Portrait Bust (high-contrast edges)
    const cx = 400;

    // Hair back layer
    ctx.beginPath();
    ctx.ellipse(cx, 252, 114, 128, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();

    // Suit shoulders / blazer
    ctx.beginPath();
    ctx.moveTo(180, 800);
    ctx.quadraticCurveTo(195, 550, 325, 515);
    ctx.lineTo(475, 515);
    ctx.quadraticCurveTo(605, 550, 620, 800);
    ctx.closePath();
    const suitGrad = ctx.createLinearGradient(200, 515, 600, 800);
    suitGrad.addColorStop(0, "#1e293b");
    suitGrad.addColorStop(0.5, "#0f172a");
    suitGrad.addColorStop(1, "#020617");
    ctx.fillStyle = suitGrad;
    ctx.fill();

    // Crisp white inner shirt V-collar
    ctx.beginPath();
    ctx.moveTo(338, 515);
    ctx.lineTo(400, 665);
    ctx.lineTo(462, 515);
    ctx.closePath();
    ctx.fillStyle = "#f8fafc";
    ctx.fill();

    // Shirt collar lapels
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(318, 520);
    ctx.lineTo(352, 515);
    ctx.lineTo(395, 655);
    ctx.lineTo(340, 620);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(482, 520);
    ctx.lineTo(448, 515);
    ctx.lineTo(405, 655);
    ctx.lineTo(460, 620);
    ctx.closePath();
    ctx.fill();

    // Neck + chin shadow
    ctx.beginPath();
    ctx.roundRect(356, 412, 88, 120, 28);
    const neckGrad = ctx.createLinearGradient(356, 412, 356, 532);
    neckGrad.addColorStop(0, "#c68642");
    neckGrad.addColorStop(1, "#e0ac69");
    ctx.fillStyle = neckGrad;
    ctx.fill();

    // Ears
    ctx.fillStyle = "#d99b5e";
    ctx.beginPath();
    ctx.ellipse(298, 305, 16, 28, -0.1, 0, Math.PI * 2);
    ctx.ellipse(502, 305, 16, 28, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.beginPath();
    ctx.ellipse(cx, 296, 98, 122, 0, 0, Math.PI * 2);
    const faceGrad = ctx.createRadialGradient(380, 265, 20, cx, 296, 130);
    faceGrad.addColorStop(0, "#f5cba7");
    faceGrad.addColorStop(0.7, "#e0ac69");
    faceGrad.addColorStop(1, "#c68642");
    ctx.fillStyle = faceGrad;
    ctx.fill();

    // Styled hair bangs / crown
    ctx.beginPath();
    ctx.moveTo(295, 280);
    ctx.bezierCurveTo(295, 145, 505, 145, 505, 280);
    ctx.quadraticCurveTo(465, 205, 410, 222);
    ctx.quadraticCurveTo(350, 208, 295, 280);
    ctx.closePath();
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();

    // Facial details (eyebrows, eyes, subtle glasses, warm smile)
    ctx.strokeStyle = "#1e1b4b";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(340, 272);
    ctx.quadraticCurveTo(362, 263, 382, 272);
    ctx.moveTo(418, 272);
    ctx.quadraticCurveTo(438, 263, 460, 272);
    ctx.stroke();

    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.arc(361, 294, 7, 0, Math.PI * 2);
    ctx.arc(439, 294, 7, 0, Math.PI * 2);
    ctx.fill();

    // Modern eyewear frames
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(333, 277, 56, 36, 10);
    ctx.roundRect(411, 277, 56, 36, 10);
    ctx.moveTo(389, 293);
    ctx.lineTo(411, 293);
    ctx.stroke();

    // Warm smile
    ctx.strokeStyle = "#9a4a35";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(372, 355);
    ctx.quadraticCurveTo(400, 376, 428, 355);
    ctx.stroke();

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to generate sample image."));
            },
            "image/png"
        );
    });
}

/**
 * Renders the transparent cutout blob onto the selected background on an offscreen canvas.
 */
async function compositeToBlob(
    foregroundBlob: Blob,
    background: BackgroundSelection,
    mimeType: "image/png" | "image/webp"
): Promise<Blob> {
    const fgImg = await loadImageFromBlob(foregroundBlob);
    const width = fgImg.naturalWidth;
    const height = fgImg.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas 2D context is not available.");
    }

    if (background.type === "solid") {
        ctx.fillStyle = background.color;
        ctx.fillRect(0, 0, width, height);
    } else if (background.type === "gradient") {
        const preset =
            GRADIENT_BG_PRESETS.find((g) => g.id === background.presetId) ??
            GRADIENT_BG_PRESETS[0];
        const coords = computeLinearGradientCoords(width, height, preset.angleDeg);
        const grad = ctx.createLinearGradient(
            coords.x0,
            coords.y0,
            coords.x1,
            coords.y1
        );
        for (const stop of preset.stops) {
            grad.addColorStop(stop.offset, stop.color);
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(fgImg, 0, 0, width, height);

    const quality = mimeType === "image/webp" ? 0.92 : undefined;

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to encode composited output image."));
            },
            mimeType,
            quality
        );
    });
}

export function BackgroundRemoverTool() {
    const [mode, setMode] = useState<ProcessingMode>("high");
    const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
    const [sourceName, setSourceName] = useState<string>("image.png");
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

    const [dimensions, setDimensions] = useState<{
        naturalWidth: number;
        naturalHeight: number;
        processedWidth: number;
        processedHeight: number;
        wasDownscaled: boolean;
    } | null>(null);
    const [elapsedMs, setElapsedMs] = useState<number | null>(null);

    const [telemetry, setTelemetry] = useState<TelemetryState>(() =>
        createTelemetryState()
    );
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Post-processing background compositor state
    const [background, setBackground] = useState<BackgroundSelection>({
        type: "transparent",
    });
    const [customColor, setCustomColor] = useState<string>("#38BDF8");

    // Interactive Before/After slider
    const [splitPosition, setSplitPosition] = useState<number>(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);

    // Export / Clipboard states
    const [exportingType, setExportingType] = useState<"png" | "webp" | null>(null);
    const [copyState, setCopyState] = useState<CopyState>("idle");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const originalUrlRef = useRef<string | null>(null);
    const processedUrlRef = useRef<string | null>(null);
    const runIdRef = useRef<number>(0);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Stable handler ref prevents @imgly/background-removal's memoized init()
    // from capturing a stale closure on subsequent images.
    const progressHandlerRef = useRef<
        ((key: string, current: number, total: number) => void) | null
    >(null);

    // Viewport-aware default Processing Mode
    useEffect(() => {
        if (typeof window !== "undefined") {
            setMode(getDefaultProcessingMode(window.innerWidth));
        }
    }, []);

    // Cleanup object URLs and timers strictly on unmount
    useEffect(() => {
        return () => {
            if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
            if (processedUrlRef.current) URL.revokeObjectURL(processedUrlRef.current);
            if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        };
    }, []);

    const replaceOriginalUrl = useCallback((nextUrl: string | null) => {
        if (originalUrlRef.current) {
            URL.revokeObjectURL(originalUrlRef.current);
        }
        originalUrlRef.current = nextUrl;
        setOriginalUrl(nextUrl);
    }, []);

    const replaceProcessedUrl = useCallback((nextUrl: string | null) => {
        if (processedUrlRef.current) {
            URL.revokeObjectURL(processedUrlRef.current);
        }
        processedUrlRef.current = nextUrl;
        setProcessedUrl(nextUrl);
    }, []);

    const scheduleCopyReset = useCallback((ms: number) => {
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopyState("idle"), ms);
    }, []);

    const runPipeline = useCallback(
        async (blob: Blob, name: string, activeMode: ProcessingMode) => {
            const currentRunId = ++runIdRef.current;
            const startedAt = performance.now();

            setError(null);
            setElapsedMs(null);
            setSourceBlob(blob);
            setSourceName(name);
            setProcessedBlob(null);
            replaceProcessedUrl(null);
            setTelemetry(createTelemetryState());

            try {
                const modeCfg = PROCESSING_MODE_CONFIG[activeMode];
                const preprocessed = await preprocessImageBlob(
                    blob,
                    modeCfg.maxDimension
                );

                if (runIdRef.current !== currentRunId) return;

                setDimensions({
                    naturalWidth: preprocessed.naturalWidth,
                    naturalHeight: preprocessed.naturalHeight,
                    processedWidth: preprocessed.processedWidth,
                    processedHeight: preprocessed.processedHeight,
                    wasDownscaled: preprocessed.wasDownscaled,
                });

                const previewUrl = URL.createObjectURL(preprocessed.blob);
                replaceOriginalUrl(previewUrl);

                // Transition into Stage 1 (waiting for dynamic import / weights fetch)
                setTelemetry((prev) => ({
                    ...prev,
                    stage: "downloading",
                    stageNumber: 1,
                    title: "Loading local AI runtime",
                    detail:
                        "Initializing WebAssembly & ONNX weights (cached locally after first run)...",
                    percent: Math.max(prev.percent, 8),
                }));

                // Bind active telemetry reducer to stable ref before calling library
                progressHandlerRef.current = (
                    key: string,
                    current: number,
                    total: number
                ) => {
                    if (runIdRef.current !== currentRunId) return;
                    setTelemetry((prev) =>
                        reduceTelemetryProgress(prev, key, current, total)
                    );
                };

                // Zero initial bundle weight: dynamically import ONLY when processing starts
                const { removeBackground } = await import(
                    "@imgly/background-removal"
                );

                if (runIdRef.current !== currentRunId) return;

                const cutoutBlob = await removeBackground(preprocessed.blob, {
                    model: "isnet_fp16",
                    output: {
                        format: "image/png",
                        quality: 1,
                    },
                    progress: (key: string, current: number, total: number) => {
                        progressHandlerRef.current?.(key, current, total);
                    },
                });

                if (runIdRef.current !== currentRunId) return;

                const cutoutUrl = URL.createObjectURL(cutoutBlob);
                replaceProcessedUrl(cutoutUrl);
                setProcessedBlob(cutoutBlob);
                setSplitPosition(50);
                setElapsedMs(Math.round(performance.now() - startedAt));
                setTelemetry({
                    stage: "complete",
                    stageNumber: 3,
                    title: "Background removed",
                    detail: "Processed 100% locally in your browser.",
                    percent: 100,
                    seenDownload: true,
                    fetchTotals: {},
                });
            } catch (err) {
                if (runIdRef.current !== currentRunId) return;
                const message =
                    err instanceof Error && err.message
                        ? err.message
                        : "Failed to remove background. Try Balanced / Mobile-Safe mode for large photos.";
                setError(message);
                setTelemetry((prev) => ({
                    ...prev,
                    stage: "error",
                    title: "Processing interrupted",
                    detail: message,
                }));
            }
        },
        [replaceOriginalUrl, replaceProcessedUrl]
    );

    const handleFileSelect = useCallback(
        (file: File) => {
            const check = validateImageFile(file);
            if (!check.ok) {
                setError(check.error);
                return;
            }
            runPipeline(file, file.name, mode);
        },
        [mode, runPipeline]
    );

    const handleTrySample = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            setError(null);
            try {
                const sampleBlob = await generateSyntheticSampleBlob();
                runPipeline(sampleBlob, "sample-portrait.png", mode);
            } catch {
                setError("Could not generate sample portrait image.");
            }
        },
        [mode, runPipeline]
    );

    const handleModeSwitch = useCallback(
        (nextMode: ProcessingMode) => {
            setMode(nextMode);
        },
        []
    );

    const handleReRun = useCallback(() => {
        if (!sourceBlob) return;
        runPipeline(sourceBlob, sourceName, mode);
    }, [mode, runPipeline, sourceBlob, sourceName]);

    const handleClear = useCallback(() => {
        runIdRef.current += 1;
        setSourceBlob(null);
        setSourceName("image.png");
        replaceOriginalUrl(null);
        replaceProcessedUrl(null);
        setProcessedBlob(null);
        setDimensions(null);
        setElapsedMs(null);
        setError(null);
        setTelemetry(createTelemetryState());
        setBackground({ type: "transparent" });
        setCopyState("idle");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [replaceOriginalUrl, replaceProcessedUrl]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect]
    );

    // ─── Slider Pointer Scrubbing ──────────────────────────────────
    const updateSplitFromClientX = useCallback((clientX: number) => {
        const container = sliderRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0) return;
        const raw = ((clientX - rect.left) / rect.width) * 100;
        setSplitPosition(Math.max(0, Math.min(100, Math.round(raw * 10) / 10)));
    }, []);

    const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDraggingSlider(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        updateSplitFromClientX(e.clientX);
    };

    const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingSlider) return;
        updateSplitFromClientX(e.clientX);
    };

    const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingSlider) return;
        setIsDraggingSlider(false);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
    };

    // ─── Export & Safari-Safe Clipboard Copy ──────────────────────
    const triggerBlobDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleDownload = useCallback(
        async (format: "png" | "webp") => {
            if (!processedBlob) return;
            setExportingType(format);
            try {
                const mimeType = format === "webp" ? "image/webp" : "image/png";
                const outBlob = await compositeToBlob(
                    processedBlob,
                    background,
                    mimeType
                );
                const filename = buildOutputFilename(
                    sourceName,
                    format,
                    background.type !== "transparent"
                );
                triggerBlobDownload(outBlob, filename);
            } catch {
                setError(`Failed to export ${format.toUpperCase()} image.`);
            } finally {
                setExportingType(null);
            }
        },
        [background, processedBlob, sourceName]
    );

    const handleCopyPng = useCallback(async () => {
        if (!processedBlob) return;
        const filename = buildOutputFilename(
            sourceName,
            "png",
            background.type !== "transparent"
        );

        if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
            try {
                const fallbackBlob = await compositeToBlob(
                    processedBlob,
                    background,
                    "image/png"
                );
                triggerBlobDownload(fallbackBlob, filename);
                setCopyState("fallback");
                scheduleCopyReset(3200);
            } catch {
                setCopyState("error");
                scheduleCopyReset(2500);
            }
            return;
        }

        setCopyState("copying");
        try {
            // Pass Promise<Blob> synchronously inside ClipboardItem so Safari's user gesture stays valid
            const blobPromise = compositeToBlob(
                processedBlob,
                background,
                "image/png"
            );

            await navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blobPromise,
                }),
            ]);
            setCopyState("copied");
            scheduleCopyReset(2200);
        } catch {
            try {
                const fallbackBlob = await compositeToBlob(
                    processedBlob,
                    background,
                    "image/png"
                );
                triggerBlobDownload(fallbackBlob, filename);
                setCopyState("fallback");
                scheduleCopyReset(3200);
            } catch {
                setCopyState("error");
                scheduleCopyReset(2500);
            }
        }
    }, [background, processedBlob, scheduleCopyReset, sourceName]);

    const isProcessing =
        telemetry.stage === "preprocessing" ||
        telemetry.stage === "downloading" ||
        telemetry.stage === "inference" ||
        telemetry.stage === "compositing";

    const activeProcessing = Boolean(sourceBlob) && isProcessing;

    const targetDimsForMode = dimensions
        ? calculateConstrainedDimensions(
              dimensions.naturalWidth,
              dimensions.naturalHeight,
              PROCESSING_MODE_CONFIG[mode].maxDimension
          )
        : null;
    const canReRunAtSelectedMode = Boolean(
        processedBlob &&
            dimensions &&
            targetDimsForMode &&
            targetDimsForMode.width !== dimensions.processedWidth
    );

    const backdropStyle: React.CSSProperties =
        background.type === "solid"
            ? { backgroundColor: background.color }
            : background.type === "gradient"
            ? {
                  backgroundImage: (
                      GRADIENT_BG_PRESETS.find((g) => g.id === background.presetId) ??
                      GRADIENT_BG_PRESETS[0]
                  ).css,
              }
            : CHECKERBOARD_STYLE;

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* ─── Processing Mode & Privacy Ribbon ─────────────────── */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[rgb(140,140,175)]">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>Processing Mode</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(["balanced", "high"] as ProcessingMode[]).map((m) => {
                            const cfg = PROCESSING_MODE_CONFIG[m];
                            const selected = mode === m;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => handleModeSwitch(m)}
                                    disabled={activeProcessing}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-semibold transition-all border min-h-[38px] text-left",
                                        selected
                                            ? "bg-violet-600/20 border-violet-500 text-white shadow-sm"
                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(140,140,175)] hover:text-white",
                                        activeProcessing && "opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    <span className="sm:hidden">{cfg.shortLabel}</span>
                                    <span className="hidden sm:inline">{cfg.label}</span>
                                </button>
                            );
                        })}
                        {canReRunAtSelectedMode && (
                            <button
                                type="button"
                                onClick={handleReRun}
                                className="px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all inline-flex items-center gap-1.5 min-h-[38px]"
                                title="Re-run AI removal with the currently selected max resolution"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Re-run at {PROCESSING_MODE_CONFIG[mode].maxDimension}px</span>
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] text-[rgb(110,110,145)] leading-snug">
                        {PROCESSING_MODE_CONFIG[mode].hint}
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium self-start md:self-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Client-Side AI · Zero Uploads</span>
                </div>
            </div>

            {/* ─── Error Banner ─────────────────────────────────────── */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm text-rose-300"
                >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">{error}</div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        aria-label="Dismiss error"
                        className="p-1 rounded-lg hover:bg-white/5 text-rose-300"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ─── Upload Zone (When Idle / No Image Loaded) ─────────── */}
            {!originalUrl && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center cursor-pointer transition-all overflow-hidden",
                        isDragOver
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-[rgb(45,45,65)] bg-[rgb(14,14,22)] hover:border-violet-500/45 hover:bg-violet-500/[0.03]"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileSelect(f);
                        }}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                        <div
                            className={cn(
                                "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300",
                                isDragOver
                                    ? "bg-violet-500/20 border-violet-500/40 scale-105"
                                    : "bg-[rgb(22,22,34)] border-[rgb(45,45,68)]"
                            )}
                        >
                            <Upload
                                className={cn(
                                    "w-6 h-6 sm:w-7 sm:h-7",
                                    isDragOver ? "text-violet-300" : "text-violet-400"
                                )}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-base sm:text-xl font-bold text-white">
                                Drop an image or tap to upload
                            </h3>
                            <p className="text-xs sm:text-sm text-[rgb(130,130,165)]">
                                Supports PNG, JPG/JPEG, WebP up to {MAX_FILE_SIZE_MB} MB — processed privately in your browser.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-violet-600/25 min-h-[40px]"
                            >
                                Choose Image
                            </button>

                            <button
                                type="button"
                                onClick={handleTrySample}
                                className="px-4 py-2.5 rounded-xl bg-[rgb(22,22,34)] hover:bg-[rgb(30,30,48)] border border-[rgb(45,45,68)] hover:border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 min-h-[40px]"
                            >
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Try Sample Portrait / Object</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Active Workspace (Preview / Progress / Studio) ────── */}
            {originalUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 sm:gap-6 items-start">
                    {/* Left: Canvas Comparison & Progress */}
                    <div className="space-y-4 min-w-0">
                        {/* Real-time AI Telemetry Card (Visible while active) */}
                        {activeProcessing && (
                            <div className="p-4 rounded-2xl bg-[rgb(14,14,22)] border border-violet-500/30 space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-white truncate">
                                                Stage {telemetry.stageNumber}/3: {telemetry.title}
                                            </p>
                                            <p className="text-[11px] text-[rgb(130,130,165)] leading-snug">
                                                {telemetry.detail}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 shrink-0">
                                        {telemetry.percent}%
                                    </span>
                                </div>

                                <div className="h-2 rounded-full bg-[rgb(24,24,37)] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                                        style={{ width: `${telemetry.percent}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] sm:text-[11px]">
                                    <div
                                        className={cn(
                                            "px-2 py-1.5 rounded-lg border text-center font-medium truncate",
                                            telemetry.stageNumber === 1
                                                ? "bg-violet-500/15 border-violet-500/40 text-violet-200"
                                                : telemetry.stageNumber > 1
                                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                                : "bg-[rgb(18,18,28)] border-[rgb(35,35,55)] text-[rgb(110,110,145)]"
                                        )}
                                    >
                                        1. Model Cache
                                    </div>
                                    <div
                                        className={cn(
                                            "px-2 py-1.5 rounded-lg border text-center font-medium truncate",
                                            telemetry.stageNumber === 2
                                                ? "bg-violet-500/15 border-violet-500/40 text-violet-200"
                                                : telemetry.stageNumber > 2
                                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                                : "bg-[rgb(18,18,28)] border-[rgb(35,35,55)] text-[rgb(110,110,145)]"
                                        )}
                                    >
                                        2. Local Inference
                                    </div>
                                    <div
                                        className={cn(
                                            "px-2 py-1.5 rounded-lg border text-center font-medium truncate",
                                            telemetry.stageNumber === 3
                                                ? "bg-violet-500/15 border-violet-500/40 text-violet-200"
                                                : "bg-[rgb(18,18,28)] border-[rgb(35,35,55)] text-[rgb(110,110,145)]"
                                        )}
                                    >
                                        3. Alpha Mask
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interactive Before/After Preview Box */}
                        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] space-y-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap px-1">
                                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                                    {processedUrl
                                        ? "Drag slider to compare Original vs Cutout"
                                        : "Source Image Preview"}
                                </span>

                                <div className="flex items-center gap-2">
                                    {elapsedMs !== null && (
                                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                                            Done in {(elapsedMs / 1000).toFixed(1)}s
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold inline-flex items-center gap-1"
                                        title="Clear image and start over"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Clear</span>
                                    </button>
                                </div>
                            </div>

                            {processedUrl ? (
                                <>
                                    {/* Tightly Aspect-Preserved Pointer Split Container */}
                                    <div className="w-full flex justify-center bg-black/30 rounded-xl p-1 sm:p-2">
                                        <div
                                            ref={sliderRef}
                                            onPointerDown={handleSliderPointerDown}
                                            onPointerMove={handleSliderPointerMove}
                                            onPointerUp={handleSliderPointerUp}
                                            onPointerCancel={handleSliderPointerUp}
                                            style={{ touchAction: "pan-y" }}
                                            className="relative inline-block max-w-full overflow-hidden rounded-xl border border-[rgb(45,45,65)] select-none cursor-ew-resize"
                                        >
                                            {/* Base Flow Image (Original / Before, clipped left 0..split%) */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={originalUrl}
                                                alt="Original image"
                                                draggable={false}
                                                className="block max-w-full max-h-[480px] w-auto h-auto pointer-events-none"
                                                style={{
                                                    clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
                                                }}
                                            />

                                            {/* Right Side: Backdrop + Cutout (clipped split%..100%) */}
                                            <div
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    ...backdropStyle,
                                                    clipPath: `inset(0 0 0 ${splitPosition}%)`,
                                                }}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={processedUrl}
                                                    alt="Background removed cutout"
                                                    draggable={false}
                                                    className="w-full h-full object-contain pointer-events-none"
                                                />
                                            </div>

                                            {/* Labels */}
                                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 pointer-events-none">
                                                Original
                                            </span>
                                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-400/30 pointer-events-none">
                                                After
                                            </span>

                                            {/* Divider Handle */}
                                            <div
                                                aria-hidden="true"
                                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.85)] pointer-events-none"
                                                style={{ left: `${splitPosition}%` }}
                                            >
                                                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black shadow-xl border-2 border-violet-600 flex items-center justify-center">
                                                    <MoveHorizontal className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accessible Range Fallback Slider for Thumb/Keyboard Scrubbing */}
                                    <div className="flex items-center gap-3 px-1">
                                        <span className="text-[11px] font-medium text-[rgb(130,130,165)] shrink-0">
                                            Original
                                        </span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={Math.round(splitPosition)}
                                            onChange={(e) =>
                                                setSplitPosition(Number(e.target.value))
                                            }
                                            aria-label="Before and after split comparison slider"
                                            className="w-full h-2 rounded-lg cursor-pointer accent-violet-500 bg-[rgb(24,24,37)]"
                                        />
                                        <span className="text-[11px] font-medium text-emerald-300 shrink-0">
                                            After
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full flex justify-center bg-black/30 rounded-xl p-2 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={originalUrl}
                                        alt="Source image being processed"
                                        className={cn(
                                            "block max-w-full max-h-[460px] w-auto h-auto rounded-xl border border-[rgb(45,45,65)]",
                                            activeProcessing && "opacity-55"
                                        )}
                                    />
                                </div>
                            )}

                            {/* Dimension & Memory-Safety Telemetry Bar */}
                            {dimensions && (
                                <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 text-[11px] text-[rgb(120,120,160)] border-t border-[rgb(30,30,46)]">
                                    <span className="truncate font-mono">
                                        {sourceName} · {dimensions.processedWidth}×
                                        {dimensions.processedHeight}px
                                    </span>
                                    {dimensions.wasDownscaled ? (
                                        <span className="text-amber-300 font-medium">
                                            Scaled down from {dimensions.naturalWidth}×
                                            {dimensions.naturalHeight}px ({mode} mode)
                                        </span>
                                    ) : (
                                        <span className="text-emerald-300/90 font-medium">
                                            Full native resolution preserved
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Real-Time Background Compositor & Export Studio */}
                    <div className="space-y-4">
                        {/* Background Compositor Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5 text-violet-400" />
                                    <span>Background Studio</span>
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 font-semibold">
                                    Instant Canvas
                                </span>
                            </div>

                            {/* Background Mode Tabs */}
                            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(40,40,60)]">
                                {(
                                    [
                                        { id: "transparent", label: "Transparent" },
                                        { id: "solid", label: "Solid Color" },
                                        { id: "gradient", label: "Gradient" },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            if (tab.id === "transparent") {
                                                setBackground({ type: "transparent" });
                                            } else if (tab.id === "solid") {
                                                setBackground({
                                                    type: "solid",
                                                    color:
                                                        background.type === "solid"
                                                            ? background.color
                                                            : SOLID_BG_PRESETS[0].color,
                                                });
                                            } else {
                                                setBackground({
                                                    type: "gradient",
                                                    presetId: GRADIENT_BG_PRESETS[0].id,
                                                });
                                            }
                                        }}
                                        className={cn(
                                            "py-2 px-1.5 rounded-lg text-[11px] font-semibold transition-all text-center",
                                            background.type === tab.id
                                                ? "bg-violet-600 text-white shadow"
                                                : "text-[rgb(130,130,165)] hover:text-white"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Mode Specific Controls */}
                            {background.type === "transparent" && (
                                <div className="p-3 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(38,38,58)] text-xs text-[rgb(140,140,175)] flex items-center gap-3">
                                    <div
                                        className="w-9 h-9 rounded-lg border border-white/15 shrink-0"
                                        style={CHECKERBOARD_STYLE}
                                    />
                                    <p className="leading-snug text-[11px]">
                                        Pure alpha channel transparency exported as lossless PNG or WebP.
                                    </p>
                                </div>
                            )}

                            {background.type === "solid" && (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        {SOLID_BG_PRESETS.map((preset) => {
                                            const active =
                                                background.type === "solid" &&
                                                background.color.toUpperCase() ===
                                                    preset.color.toUpperCase();
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setBackground({
                                                            type: "solid",
                                                            color: preset.color,
                                                        })
                                                    }
                                                    aria-label={`Solid color ${preset.label}`}
                                                    title={preset.label}
                                                    className={cn(
                                                        "w-9 h-9 rounded-xl border transition-all",
                                                        active
                                                            ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-[rgb(14,14,22)] border-white scale-105"
                                                            : "border-white/25 hover:scale-105"
                                                    )}
                                                    style={{ backgroundColor: preset.color }}
                                                />
                                            );
                                        })}

                                        {/* Custom Native Color Picker */}
                                        <label
                                            className="flex items-center gap-2 px-2.5 h-9 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] hover:border-violet-500/40 cursor-pointer text-[11px] font-semibold text-white"
                                            title="Pick custom background color"
                                        >
                                            <input
                                                type="color"
                                                value={
                                                    background.type === "solid"
                                                        ? background.color
                                                        : customColor
                                                }
                                                onChange={(e) => {
                                                    setCustomColor(e.target.value);
                                                    setBackground({
                                                        type: "solid",
                                                        color: e.target.value,
                                                    });
                                                }}
                                                aria-label="Custom solid background color"
                                                className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer p-0"
                                            />
                                            <span className="font-mono text-[11px]">
                                                {(background.type === "solid"
                                                    ? background.color
                                                    : customColor
                                                ).toUpperCase()}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {background.type === "gradient" && (
                                <div className="grid grid-cols-1 gap-2">
                                    {GRADIENT_BG_PRESETS.map((preset) => {
                                        const active =
                                            background.type === "gradient" &&
                                            background.presetId === preset.id;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() =>
                                                    setBackground({
                                                        type: "gradient",
                                                        presetId: preset.id,
                                                    })
                                                }
                                                className={cn(
                                                    "flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left",
                                                    active
                                                        ? "bg-violet-600/15 border-violet-500 text-white"
                                                        : "bg-[rgb(20,20,32)] border-[rgb(40,40,60)] text-[rgb(150,150,185)] hover:text-white"
                                                )}
                                            >
                                                <span
                                                    className="w-9 h-9 rounded-lg border border-white/15 shrink-0"
                                                    style={{ backgroundImage: preset.css }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold truncate">
                                                        {preset.label}
                                                    </p>
                                                    <p className="text-[10px] text-[rgb(120,120,160)]">
                                                        {preset.angleDeg}° Linear Studio Gradient
                                                    </p>
                                                </div>
                                                {active && (
                                                    <Check className="w-4 h-4 text-violet-400 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Export Actions Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Export Result</span>
                            </h3>

                            {processedBlob && (
                                <p className="text-[11px] text-[rgb(130,130,165)]">
                                    Cutout mask size:{" "}
                                    <span className="font-mono text-white">
                                        {formatFileSize(processedBlob.size)}
                                    </span>{" "}
                                    (alpha PNG)
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownload("png")}
                                    disabled={!processedBlob || exportingType !== null}
                                    className={cn(
                                        "flex-1 min-w-[125px] h-10 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg",
                                        !processedBlob
                                            ? "bg-[rgb(24,24,37)] text-[rgb(100,100,140)] cursor-not-allowed"
                                            : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25"
                                    )}
                                >
                                    {exportingType === "png" ? (
                                        <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-3.5 h-3.5" />
                                    )}
                                    <span>Download PNG</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDownload("webp")}
                                    disabled={!processedBlob || exportingType !== null}
                                    className={cn(
                                        "flex-1 min-w-[125px] h-10 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-1.5 transition-all",
                                        !processedBlob
                                            ? "bg-[rgb(20,20,32)] border-[rgb(35,35,55)] text-[rgb(100,100,140)] cursor-not-allowed"
                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] hover:border-cyan-500/40 text-cyan-300 hover:bg-[rgb(28,28,44)]"
                                    )}
                                >
                                    {exportingType === "webp" ? (
                                        <span className="w-3.5 h-3.5 border-2 border-cyan-300/25 border-t-cyan-300 rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-3.5 h-3.5" />
                                    )}
                                    <span>Download WebP</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyPng}
                                disabled={!processedBlob || copyState === "copying"}
                                className={cn(
                                    "w-full h-10 px-3 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition-all",
                                    !processedBlob
                                        ? "bg-[rgb(20,20,32)] border-[rgb(35,35,55)] text-[rgb(100,100,140)] cursor-not-allowed"
                                        : copyState === "copied"
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                        : copyState === "fallback"
                                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                        : copyState === "error"
                                        ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                                        : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-white hover:border-violet-500/40 hover:bg-[rgb(28,28,44)]"
                                )}
                            >
                                {copyState === "copying" ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                                ) : copyState === "copied" ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : copyState === "error" ? (
                                    <X className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-violet-400" />
                                )}
                                <span>
                                    {copyState === "copying"
                                        ? "Copying PNG..."
                                        : copyState === "copied"
                                        ? "Copied PNG to Clipboard!"
                                        : copyState === "fallback"
                                        ? "Clipboard unavailable — Downloaded PNG"
                                        : copyState === "error"
                                        ? "Copy Failed"
                                        : "Copy PNG"}
                                </span>
                            </button>

                            {/* Upload Another */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={activeProcessing}
                                className="w-full h-9 px-3 rounded-xl text-xs font-medium text-[rgb(150,150,185)] hover:text-white bg-[rgb(18,18,28)] border border-[rgb(35,35,55)] hover:border-white/20 transition-all inline-flex items-center justify-center gap-1.5"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Another Image</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileSelect(f);
                                }}
                                className="hidden"
                            />
                        </div>

                        {/* Architecture Note */}
                        <div className="p-3.5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] text-[11px] text-[rgb(120,120,160)] flex items-start gap-2.5">
                            <Cpu className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                Background swaps render immediately on HTML5 Canvas without re-running neural network inference.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
