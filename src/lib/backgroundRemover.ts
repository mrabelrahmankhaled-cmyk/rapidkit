export type ProcessingMode = "balanced" | "high";

export type ModelPrecision = "isnet_quint8" | "isnet_fp16";

export type ComputeDevice = "cpu" | "gpu";

export type BackgroundOptionType =
    | "transparent"
    | "solid"
    | "gradient"
    | "blur"
    | "image";

export type GradientStop = {
    offset: number;
    color: string;
};

export type GradientPreset = {
    id: string;
    label: string;
    angleDeg: number;
    stops: readonly [GradientStop, GradientStop];
    css: string;
};

export type SolidPreset = {
    id: string;
    label: string;
    color: string;
};

export type BackgroundSelection =
    | { type: "transparent" }
    | { type: "solid"; color: string }
    | { type: "gradient"; presetId: string }
    | { type: "blur"; blurPx: number }
    | { type: "image" };

export type OutlineThickness = 0 | 4 | 8 | 14;

export type SubjectEffects = {
    outlinePx: OutlineThickness;
    outlineColor: string;
    dropShadow: boolean;
    autoTrim: boolean;
};

export const DEFAULT_SUBJECT_EFFECTS: SubjectEffects = {
    outlinePx: 0,
    outlineColor: "#FFFFFF",
    dropShadow: false,
    autoTrim: false,
};

export const OUTLINE_OPTIONS: readonly { value: OutlineThickness; label: string }[] = [
    { value: 0, label: "None" },
    { value: 4, label: "Thin 4px" },
    { value: 8, label: "Medium 8px" },
    { value: 14, label: "Thick 14px" },
];

export const DEFAULT_PORTRAIT_BLUR_PX = 12;
export const MIN_PORTRAIT_BLUR_PX = 4;
export const MAX_PORTRAIT_BLUR_PX = 24;

export type PipelineStage =
    | "idle"
    | "preprocessing"
    | "downloading"
    | "inference"
    | "compositing"
    | "complete"
    | "error";

export const ACCEPTED_IMAGE_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
] as const;

export const MAX_FILE_SIZE_MB = 15;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MOBILE_BREAKPOINT_PX = 768;

export const PROCESSING_MODE_CONFIG: Record<
    ProcessingMode,
    {
        id: ProcessingMode;
        label: string;
        shortLabel: string;
        maxDimension: number;
        hint: string;
    }
> = {
    balanced: {
        id: "balanced",
        label: "Balanced / Mobile-Safe (Max 1280px)",
        shortLabel: "Mobile-Safe (1280px)",
        maxDimension: 1280,
        hint: "Downscales large photos before WebAssembly inference to prevent mobile out-of-memory crashes.",
    },
    high: {
        id: "high",
        label: "High Resolution (Max 2048px)",
        shortLabel: "High Res (2048px)",
        maxDimension: 2048,
        hint: "Preserves finer edge detail up to 2048px on desktop browsers with higher RAM headroom.",
    },
};

export const MODEL_PRECISION_CONFIG: Record<
    ModelPrecision,
    {
        id: ModelPrecision;
        label: string;
        shortLabel: string;
        approxSizeLabel: string;
        hint: string;
    }
> = {
    isnet_quint8: {
        id: "isnet_quint8",
        label: "Fast / Lite (~40 MB)",
        shortLabel: "Fast (~40 MB)",
        approxSizeLabel: "~40 MB",
        hint: "Quantized model for 2x faster first download and lower mobile memory usage.",
    },
    isnet_fp16: {
        id: "isnet_fp16",
        label: "High Precision (~80 MB)",
        shortLabel: "Precision (~80 MB)",
        approxSizeLabel: "~80 MB",
        hint: "Half-precision ISNet weights for sharper hair strands, fur, and fine product edges.",
    },
};

export const SOLID_BG_PRESETS: readonly SolidPreset[] = [
    { id: "white", label: "White", color: "#FFFFFF" },
    { id: "black", label: "Black", color: "#000000" },
    { id: "slate", label: "Slate", color: "#F8FAFC" },
    { id: "indigo", label: "Indigo", color: "#EEF2FF" },
    { id: "emerald", label: "Emerald", color: "#ECFDF5" },
];

export const GRADIENT_BG_PRESETS: readonly GradientPreset[] = [
    {
        id: "studio-violet",
        label: "Studio Aura",
        angleDeg: 135,
        stops: [
            { offset: 0, color: "#EDE9FE" },
            { offset: 1, color: "#CFFAFE" },
        ],
        css: "linear-gradient(135deg, #EDE9FE 0%, #CFFAFE 100%)",
    },
    {
        id: "warm-peach",
        label: "Warm Studio",
        angleDeg: 135,
        stops: [
            { offset: 0, color: "#FFE4E6" },
            { offset: 1, color: "#FEF3C7" },
        ],
        css: "linear-gradient(135deg, #FFE4E6 0%, #FEF3C7 100%)",
    },
    {
        id: "midnight-slate",
        label: "Midnight Pro",
        angleDeg: 135,
        stops: [
            { offset: 0, color: "#0F172A" },
            { offset: 1, color: "#312E81" },
        ],
        css: "linear-gradient(135deg, #0F172A 0%, #312E81 100%)",
    },
];

export function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export type FileValidationResult =
    | { ok: true }
    | { ok: false; error: string };

const EXTENSION_TO_MIME: Record<string, (typeof ACCEPTED_IMAGE_MIME_TYPES)[number]> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
};

/**
 * Validates file type (PNG, JPG/JPEG, WebP) and size (<= 15 MB) with clear errors.
 */
export function validateImageFile(file: {
    name?: string;
    type: string;
    size: number;
}): FileValidationResult {
    const normalizedType = file.type.trim().toLowerCase();
    const isMimeAllowed = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(
        normalizedType
    );

    if (!isMimeAllowed) {
        // Fallback check on file extension only when browser leaves MIME empty
        const lowerName = (file.name ?? "").trim().toLowerCase();
        const matchingExt = Object.keys(EXTENSION_TO_MIME).find((ext) =>
            lowerName.endsWith(ext)
        );
        if (!(normalizedType === "" && matchingExt)) {
            return {
                ok: false,
                error: `Unsupported file format${
                    normalizedType ? ` (${normalizedType})` : ""
                }. Please upload a PNG, JPG/JPEG, or WebP image.`,
            };
        }
    }

    if (!Number.isFinite(file.size) || file.size <= 0) {
        return {
            ok: false,
            error: "The selected file is empty. Please choose a valid image.",
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            ok: false,
            error: `Image is too large (${formatFileSize(
                file.size
            )}). Please choose a file up to ${MAX_FILE_SIZE_MB} MB.`,
        };
    }

    return { ok: true };
}

export type ConstrainedDimensions = {
    width: number;
    height: number;
    wasDownscaled: boolean;
    scale: number;
};

/**
 * Computes aspect-preserving dimensions bounded by maxDimension on the longest edge.
 */
export function calculateConstrainedDimensions(
    naturalWidth: number,
    naturalHeight: number,
    maxDimension: number
): ConstrainedDimensions {
    if (
        !Number.isFinite(naturalWidth) ||
        !Number.isFinite(naturalHeight) ||
        !Number.isFinite(maxDimension) ||
        naturalWidth <= 0 ||
        naturalHeight <= 0 ||
        maxDimension <= 0
    ) {
        throw new Error("Image dimensions and maxDimension must be positive numbers.");
    }

    const longestEdge = Math.max(naturalWidth, naturalHeight);
    if (longestEdge <= maxDimension) {
        return {
            width: Math.round(naturalWidth),
            height: Math.round(naturalHeight),
            wasDownscaled: false,
            scale: 1,
        };
    }

    const scale = maxDimension / longestEdge;
    return {
        width: Math.max(1, Math.round(naturalWidth * scale)),
        height: Math.max(1, Math.round(naturalHeight * scale)),
        wasDownscaled: true,
        scale,
    };
}

/**
 * Selects Balanced (1280px) for viewports < 768px and High Resolution (2048px) on desktop.
 */
export function getDefaultProcessingMode(viewportWidth: number): ProcessingMode {
    if (!Number.isFinite(viewportWidth) || viewportWidth < MOBILE_BREAKPOINT_PX) {
        return "balanced";
    }
    return "high";
}

/**
 * Selects Fast/Lite quantized weights (~40 MB) on mobile viewports (< 768px) and
 * High Precision FP16 weights (~80 MB) on desktop viewports.
 */
export function getDefaultModelPrecision(viewportWidth: number): ModelPrecision {
    if (!Number.isFinite(viewportWidth) || viewportWidth < MOBILE_BREAKPOINT_PX) {
        return "isnet_quint8";
    }
    return "isnet_fp16";
}

/**
 * Checks whether the current browser exposes a WebGPU navigator surface.
 */
export function detectWebGpuAvailable(): boolean {
    if (typeof navigator === "undefined") return false;
    return "gpu" in navigator && Boolean((navigator as unknown as { gpu?: unknown }).gpu);
}

/**
 * Maps CSS linear-gradient degree angle to exact HTML5 Canvas 2D linear gradient endpoints.
 */
export function computeLinearGradientCoords(
    width: number,
    height: number,
    angleDeg: number
): { x0: number; y0: number; x1: number; y1: number } {
    const rad = (angleDeg * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const halfLength = (Math.abs(width * sin) + Math.abs(height * cos)) / 2;
    const cx = width / 2;
    const cy = height / 2;

    const roundZero = (n: number) => (Math.abs(n) < 1e-9 ? 0 : n);

    return {
        x0: roundZero(cx - sin * halfLength),
        y0: roundZero(cy + cos * halfLength),
        x1: roundZero(cx + sin * halfLength),
        y1: roundZero(cy - cos * halfLength),
    };
}

export type DrawRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

/**
 * Computes object-fit: cover destination draw coordinates so a backdrop image fills
 * the target canvas cleanly without distortion, centered along both axes.
 */
export function computeCoverDrawRect(
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number
): DrawRect {
    if (
        !Number.isFinite(srcWidth) ||
        !Number.isFinite(srcHeight) ||
        !Number.isFinite(dstWidth) ||
        !Number.isFinite(dstHeight) ||
        srcWidth <= 0 ||
        srcHeight <= 0 ||
        dstWidth <= 0 ||
        dstHeight <= 0
    ) {
        throw new Error("Source and destination dimensions must be positive numbers.");
    }

    const scale = Math.max(dstWidth / srcWidth, dstHeight / srcHeight);
    const width = srcWidth * scale;
    const height = srcHeight * scale;
    const roundZero = (n: number) => (Math.abs(n) < 1e-9 ? 0 : n);

    return {
        x: roundZero((dstWidth - width) / 2),
        y: roundZero((dstHeight - height) / 2),
        width,
        height,
    };
}

export type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
    hasForeground: boolean;
};

/**
 * Scans RGBA pixel buffers for foreground pixels (alpha > alphaThreshold), computes
 * the tight bounding box, and expands uniformly by marginRatio (default 4%) + extraPaddingPx,
 * clamped safely inside [0..imgWidth, 0..imgHeight].
 */
export function computeAlphaBoundingBox(
    rgba: Uint8ClampedArray | Uint8Array,
    imgWidth: number,
    imgHeight: number,
    alphaThreshold = 10,
    marginRatio = 0.04,
    extraPaddingPx = 0
): BoundingBox {
    if (
        !Number.isFinite(imgWidth) ||
        !Number.isFinite(imgHeight) ||
        imgWidth <= 0 ||
        imgHeight <= 0
    ) {
        throw new Error("Image width and height must be positive numbers.");
    }
    const expectedLength = imgWidth * imgHeight * 4;
    if (rgba.length < expectedLength) {
        throw new Error("RGBA pixel buffer is smaller than width * height * 4.");
    }

    let minX = imgWidth;
    let minY = imgHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < imgHeight; y += 1) {
        const rowOffset = y * imgWidth * 4;
        for (let x = 0; x < imgWidth; x += 1) {
            const alpha = rgba[rowOffset + x * 4 + 3];
            if (alpha > alphaThreshold) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return {
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
            hasForeground: false,
        };
    }

    const subjectW = maxX - minX + 1;
    const subjectH = maxY - minY + 1;
    const marginPx =
        Math.round(Math.max(subjectW, subjectH) * Math.max(0, marginRatio)) +
        Math.max(0, Math.round(extraPaddingPx));

    const left = Math.max(0, minX - marginPx);
    const top = Math.max(0, minY - marginPx);
    const right = Math.min(imgWidth, maxX + 1 + marginPx);
    const bottom = Math.min(imgHeight, maxY + 1 + marginPx);

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        hasForeground: true,
    };
}

export function buildOutputFilename(
    originalName: string,
    extension: "png" | "webp",
    hasBackdropOrEffects: boolean
): string {
    const trimmed = originalName.trim();
    const base =
        trimmed.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "image";
    const cleanBase = base.replace(/^-+|-+$/g, "") || "image";
    const suffix = hasBackdropOrEffects ? "studio" : "nobg";
    return `${cleanBase}-${suffix}.${extension}`;
}

export type TelemetryState = {
    stage: PipelineStage;
    stageNumber: 1 | 2 | 3;
    title: string;
    detail: string;
    percent: number;
    seenDownload: boolean;
    fetchTotals: Record<string, { current: number; total: number }>;
};

export function createTelemetryState(): TelemetryState {
    return {
        stage: "preprocessing",
        stageNumber: 1,
        title: "Preparing image for local AI",
        detail: "Checking dimensions & preventing memory overflow...",
        percent: 4,
        seenDownload: false,
        fetchTotals: {},
    };
}

/**
 * Reduces @imgly/background-removal progress(key, current, total) callbacks into
 * deterministic stage telemetry and a monotonic 0-100 progress percentage.
 */
export function reduceTelemetryProgress(
    prev: TelemetryState,
    key: string,
    current: number,
    total: number
): TelemetryState {
    const safeTotal = total > 0 ? total : 1;
    const clampedCurrent = Math.max(0, Math.min(current, safeTotal));

    if (key.startsWith("fetch:")) {
        const nextFetchTotals = {
            ...prev.fetchTotals,
            [key]: { current: clampedCurrent, total: safeTotal },
        };

        let aggCurrent = 0;
        let aggTotal = 0;
        for (const entry of Object.values(nextFetchTotals)) {
            aggCurrent += entry.current;
            aggTotal += entry.total;
        }

        const downloadRatio = aggTotal > 0 ? Math.min(1, aggCurrent / aggTotal) : 0;
        const nextPercent = Math.max(prev.percent, Math.round(5 + downloadRatio * 55));

        return {
            stage: "downloading",
            stageNumber: 1,
            title: "Downloading AI model weights",
            detail:
                "Cached locally in your browser after the first run — future cutouts start immediately.",
            percent: nextPercent,
            seenDownload: true,
            fetchTotals: nextFetchTotals,
        };
    }

    if (key === "compute:decode" || key === "compute:inference") {
        const targetPercent = key === "compute:decode" ? 66 : 80;
        return {
            ...prev,
            stage: "inference",
            stageNumber: 2,
            title: "Running local neural network inference",
            detail: "100% in-browser — 0 bytes uploaded to any server.",
            percent: Math.max(prev.percent, targetPercent),
        };
    }

    if (key === "compute:mask" || key === "compute:encode") {
        const isDone = key === "compute:encode" && clampedCurrent >= safeTotal;
        const targetPercent = isDone ? 99 : key === "compute:mask" ? 90 : 95;
        return {
            ...prev,
            stage: "compositing",
            stageNumber: 3,
            title: "Compositing alpha mask",
            detail: "Refining transparency edges and preparing studio preview...",
            percent: Math.max(prev.percent, targetPercent),
        };
    }

    return prev;
}
