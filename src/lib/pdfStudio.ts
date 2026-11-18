export type StudioMode = "merge" | "split" | "sign" | "metadata";

export type RotationDelta = 0 | 90 | 180 | 270;

export type SignatureScale = "small" | "medium" | "large";

export type SignatureAnchor =
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"
    | "top-right"
    | "center";

export type SignaturePageTarget = "first" | "last" | "all" | "custom";

export type PageDimensions = {
    width: number;
    height: number;
};

export type PdfRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type PdfOutputOperation =
    | "merged"
    | "split"
    | "burst"
    | "signed"
    | "cleaned"
    | "sample";

export type PdfValidationResult =
    | { ok: true }
    | { ok: false; error: string };

export type PageRangeParseResult =
    | {
          ok: true;
          /** Deduplicated, ascending 1-based page numbers (e.g., [1, 2, 3, 5]). */
          pages: number[];
          /** Deduplicated, ascending 0-based indices for pdf-lib copyPages. */
          zeroBasedIndices: number[];
      }
    | {
          ok: false;
          error: string;
      };

export type PdfMetadataSnapshot = {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    creator: string;
    producer: string;
    creationDate?: string;
    modificationDate?: string;
    hasXmpMetadata: boolean;
};

export const ACCEPTED_PDF_MIME_TYPES = [
    "application/pdf",
    "application/x-pdf",
] as const;

export const MAX_PDF_FILE_SIZE_MB = 50;
export const MAX_PDF_FILE_SIZE_BYTES = MAX_PDF_FILE_SIZE_MB * 1024 * 1024;
export const MAX_MERGE_FILES = 20;

export const MAX_SIGNATURE_IMAGE_SIZE_MB = 5;
export const MAX_SIGNATURE_IMAGE_SIZE_BYTES =
    MAX_SIGNATURE_IMAGE_SIZE_MB * 1024 * 1024;

export const ROTATION_OPTIONS: readonly RotationDelta[] = [0, 90, 180, 270];

export const SIGNATURE_INK_COLORS = [
    { id: "navy-black", label: "Navy / Ink Black", value: "#0F172A" },
    { id: "royal-blue", label: "Royal Blue", value: "#1D4ED8" },
] as const;

export const SIGNATURE_SCALE_CONFIG: Record<
    SignatureScale,
    { id: SignatureScale; label: string; widthRatio: number }
> = {
    small: { id: "small", label: "Small", widthRatio: 0.16 },
    medium: { id: "medium", label: "Medium", widthRatio: 0.24 },
    large: { id: "large", label: "Large", widthRatio: 0.34 },
};

export const SIGNATURE_ANCHOR_OPTIONS: readonly {
    id: SignatureAnchor;
    label: string;
    shortLabel: string;
}[] = [
    { id: "bottom-right", label: "Bottom Right", shortLabel: "Bot. Right" },
    { id: "bottom-left", label: "Bottom Left", shortLabel: "Bot. Left" },
    { id: "bottom-center", label: "Bottom Center", shortLabel: "Bot. Center" },
    { id: "top-right", label: "Top Right", shortLabel: "Top Right" },
    { id: "center", label: "Center", shortLabel: "Center" },
];

export function formatPdfFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validates PDF MIME type (with `.pdf` extension fallback), 50 MB size limit,
 * and optional merge queue capacity (up to 20 files).
 */
export function validatePdfFile(
    file: { name?: string; type: string; size: number },
    optionsOrQueueCount?:
        | number
        | { currentQueueCount?: number; maxQueueCount?: number }
): PdfValidationResult {
    const queueOpts =
        typeof optionsOrQueueCount === "number"
            ? { currentQueueCount: optionsOrQueueCount, maxQueueCount: MAX_MERGE_FILES }
            : optionsOrQueueCount;

    if (queueOpts && typeof queueOpts.currentQueueCount === "number") {
        const maxAllowed = queueOpts.maxQueueCount ?? MAX_MERGE_FILES;
        if (queueOpts.currentQueueCount >= maxAllowed) {
            return {
                ok: false,
                error: `Merge queue is limited to ${maxAllowed} PDF files. Remove a file before adding another.`,
            };
        }
    }

    const normalizedType = file.type.trim().toLowerCase();
    const isMimeAllowed = (ACCEPTED_PDF_MIME_TYPES as readonly string[]).includes(
        normalizedType
    );
    const lowerName = (file.name ?? "").trim().toLowerCase();
    const hasPdfExtension = lowerName.endsWith(".pdf");

    if (!isMimeAllowed) {
        const allowExtensionFallback =
            normalizedType === "" || normalizedType === "application/octet-stream";
        if (!(allowExtensionFallback && hasPdfExtension)) {
            return {
                ok: false,
                error: `Unsupported file format${
                    normalizedType ? ` (${normalizedType})` : ""
                }. Please upload a PDF (.pdf) document.`,
            };
        }
    }

    if (!Number.isFinite(file.size) || file.size <= 0) {
        return {
            ok: false,
            error: "The selected PDF file is empty. Please choose a valid document.",
        };
    }

    if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
        return {
            ok: false,
            error: `PDF exceeds the ${MAX_PDF_FILE_SIZE_MB} MB limit (${formatPdfFileSize(
                file.size
            )}). Please choose a smaller document.`,
        };
    }

    return { ok: true };
}

/**
 * Validates an uploaded PNG signature/stamp image up to 5 MB.
 */
export function validateSignaturePngFile(file: {
    name?: string;
    type: string;
    size: number;
}): PdfValidationResult {
    const normalizedType = file.type.trim().toLowerCase();
    const lowerName = (file.name ?? "").trim().toLowerCase();
    const isPng =
        normalizedType === "image/png" ||
        ((normalizedType === "" || normalizedType === "application/octet-stream") &&
            lowerName.endsWith(".png"));

    if (!isPng) {
        return {
            ok: false,
            error: `Unsupported signature stamp format${
                normalizedType ? ` (${normalizedType})` : ""
            }. Please upload a transparent PNG (.png) image.`,
        };
    }

    if (!Number.isFinite(file.size) || file.size <= 0) {
        return {
            ok: false,
            error: "The selected PNG stamp is empty.",
        };
    }

    if (file.size > MAX_SIGNATURE_IMAGE_SIZE_BYTES) {
        return {
            ok: false,
            error: `Signature image exceeds the ${MAX_SIGNATURE_IMAGE_SIZE_MB} MB limit (${formatPdfFileSize(
                file.size
            )}).`,
        };
    }

    return { ok: true };
}

/**
 * Parses human page range strings (e.g., "1-3, 5, 7-9") into a deduplicated,
 * sorted 1-based page array and matching 0-based indices for `pdf-lib`.
 */
export function parsePageRangeString(
    input: string,
    totalPages: number
): PageRangeParseResult {
    if (!Number.isInteger(totalPages) || totalPages < 1) {
        return {
            ok: false,
            error: "PDF must contain at least 1 page.",
        };
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return {
            ok: false,
            error: "Enter at least one page number or range (e.g., 1-3, 5).",
        };
    }

    const segments = trimmed.split(",");
    const selected = new Set<number>();

    for (const rawSegment of segments) {
        const part = rawSegment.trim();
        if (!part) {
            return {
                ok: false,
                error: 'Malformed page range near comma (,). Use formats like "1-3, 5".',
            };
        }

        if (/^\d+$/.test(part)) {
            const pageNum = Number(part);
            if (pageNum < 1) {
                return {
                    ok: false,
                    error: `Page numbers must start at 1 (received ${pageNum}).`,
                };
            }
            if (pageNum > totalPages) {
                return {
                    ok: false,
                    error: `Page ${pageNum} is out of bounds. This PDF has ${totalPages} page${
                        totalPages === 1 ? "" : "s"
                    }.`,
                };
            }
            selected.add(pageNum);
            continue;
        }

        const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
        if (rangeMatch) {
            const start = Number(rangeMatch[1]);
            const end = Number(rangeMatch[2]);

            if (start < 1 || end < 1) {
                return {
                    ok: false,
                    error: `Page range "${part}" must contain page numbers >= 1.`,
                };
            }
            if (start > end) {
                return {
                    ok: false,
                    error: `Invalid range "${part}": start page (${start}) cannot exceed end page (${end}).`,
                };
            }
            if (end > totalPages) {
                return {
                    ok: false,
                    error: `Range "${part}" exceeds total page count (${totalPages}).`,
                };
            }

            for (let p = start; p <= end; p += 1) {
                selected.add(p);
            }
            continue;
        }

        return {
            ok: false,
            error: `Malformed page token "${part}". Use numbers or ranges like "1-3, 5".`,
        };
    }

    const pages = Array.from(selected).sort((a, b) => a - b);
    return {
        ok: true,
        pages,
        zeroBasedIndices: pages.map((p) => p - 1),
    };
}

/**
 * Computes exact `{ x, y, width, height }` in PDF points using bottom-left `(0, 0)` origin.
 */
export function computeSignaturePlacementRect(
    page: PageDimensions,
    signatureAspectRatio: number,
    scale: SignatureScale,
    anchor: SignatureAnchor,
    options?: {
        marginPt?: number;
        bottomExtraMarginPt?: number;
    }
): PdfRect {
    if (
        !Number.isFinite(page.width) ||
        !Number.isFinite(page.height) ||
        page.width <= 0 ||
        page.height <= 0
    ) {
        throw new Error("Page width and height must be positive finite numbers.");
    }
    if (!Number.isFinite(signatureAspectRatio) || signatureAspectRatio <= 0) {
        throw new Error("Signature aspect ratio must be a positive finite number.");
    }

    const defaultMargin = Math.min(36, Math.min(page.width, page.height) * 0.06);
    const marginBase =
        options?.marginPt !== undefined
            ? Math.max(0, options.marginPt)
            : defaultMargin;
    const extraBottom = Math.max(0, options?.bottomExtraMarginPt ?? 0);

    const marginX = Math.min(marginBase, page.width * 0.2);
    const marginTop = Math.min(marginBase, page.height * 0.2);
    const marginBottom = Math.min(marginBase + extraBottom, page.height * 0.25);

    const maxBoxWidth = Math.max(1, page.width - marginX * 2);
    const maxBoxHeight = Math.max(1, (page.height - marginTop - marginBottom) * 0.45);

    const desiredWidth = page.width * SIGNATURE_SCALE_CONFIG[scale].widthRatio;
    const desiredHeight = desiredWidth / signatureAspectRatio;
    const fit = Math.min(1, maxBoxWidth / desiredWidth, maxBoxHeight / desiredHeight);

    const width = desiredWidth * fit;
    const height = desiredHeight * fit;

    let x = marginX;
    let y = marginBottom;

    switch (anchor) {
        case "bottom-left":
            x = marginX;
            y = marginBottom;
            break;
        case "bottom-center":
            x = (page.width - width) / 2;
            y = marginBottom;
            break;
        case "bottom-right":
            x = page.width - width - marginX;
            y = marginBottom;
            break;
        case "top-right":
            x = page.width - width - marginX;
            y = page.height - height - marginTop;
            break;
        case "center":
            x = (page.width - width) / 2;
            y = (page.height - height) / 2;
            break;
    }

    return { x, y, width, height };
}

function stripControlChars(value: string): string {
    let out = "";
    for (let i = 0; i < value.length; i += 1) {
        const code = value.charCodeAt(i);
        out += code < 32 || code === 127 ? "-" : value[i];
    }
    return out;
}

/**
 * Sanitizes an arbitrary source name into a clean `.pdf` or `.zip` filename.
 */
export function buildPdfOutputFilename(
    baseName: string,
    operation: PdfOutputOperation,
    extension: "pdf" | "zip" = "pdf"
): string {
    const rawWithoutExt = baseName
        .trim()
        .replace(/\.(pdf|zip)$/i, "")
        .trim();

    const sanitized = stripControlChars(rawWithoutExt)
        .replace(/[<>:"/\\|?*]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^[.-]+|[.-]+$/g, "")
        .slice(0, 80)
        .replace(/^[.-]+|[.-]+$/g, "");

    const stem = sanitized || "document";

    if (operation === "merged" && stem === "merged-document") {
        return `merged-document.${extension}`;
    }

    return `${stem}-${operation}.${extension}`;
}

/**
 * Builds deterministic zero-padded burst page filenames (`page-01.pdf`, `page-02.pdf`, ...).
 */
export function formatBurstPageFilename(
    pageNumber: number,
    totalPages: number
): string {
    const padWidth = Math.max(2, String(Math.max(1, totalPages)).length);
    const padded = String(Math.max(1, Math.floor(pageNumber))).padStart(
        padWidth,
        "0"
    );
    return `page-${padded}.pdf`;
}

export function normalizeRotationDelta(degreesValue: number): RotationDelta {
    const normalized = ((Math.round(degreesValue) % 360) + 360) % 360;
    if (normalized === 90) return 90;
    if (normalized === 180) return 180;
    if (normalized === 270) return 270;
    return 0;
}

export function parseKeywordsInput(raw: string): string[] {
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

export function resolveSignaturePageIndices(
    target: SignaturePageTarget,
    totalPages: number,
    customPage?: number
): { ok: true; indices: number[] } | { ok: false; error: string } {
    if (!Number.isInteger(totalPages) || totalPages < 1) {
        return { ok: false, error: "PDF must contain at least 1 page." };
    }

    if (target === "first") {
        return { ok: true, indices: [0] };
    }
    if (target === "last") {
        return { ok: true, indices: [totalPages - 1] };
    }
    if (target === "all") {
        return {
            ok: true,
            indices: Array.from({ length: totalPages }, (_, idx) => idx),
        };
    }

    if (
        customPage === undefined ||
        !Number.isInteger(customPage) ||
        customPage < 1 ||
        customPage > totalPages
    ) {
        return {
            ok: false,
            error: `Enter a valid page number between 1 and ${totalPages}.`,
        };
    }

    return { ok: true, indices: [customPage - 1] };
}
