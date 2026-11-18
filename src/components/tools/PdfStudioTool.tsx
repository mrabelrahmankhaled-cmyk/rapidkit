"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Download,
    Eraser,
    FileArchive,
    FileCheck,
    FilePlus2,
    FileSearch,
    Layers,
    Loader2,
    PenTool,
    RotateCw,
    Scissors,
    ShieldCheck,
    Sparkles,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    type PageDimensions,
    type PdfMetadataSnapshot,
    type RotationDelta,
    type SignatureAnchor,
    type SignaturePageTarget,
    type SignatureScale,
    type StudioMode,
    MAX_MERGE_FILES,
    MAX_PDF_FILE_SIZE_MB,
    MAX_SIGNATURE_IMAGE_SIZE_MB,
    ROTATION_OPTIONS,
    SIGNATURE_ANCHOR_OPTIONS,
    SIGNATURE_INK_COLORS,
    SIGNATURE_SCALE_CONFIG,
    buildPdfOutputFilename,
    computeSignaturePlacementRect,
    formatBurstPageFilename,
    formatPdfFileSize,
    normalizeRotationDelta,
    parseKeywordsInput,
    parsePageRangeString,
    resolveSignaturePageIndices,
    validatePdfFile,
    validateSignaturePngFile,
} from "@/lib/pdfStudio";

type PdfLibModule = typeof import("pdf-lib");

type LoadedPdfDocument = {
    name: string;
    size: number;
    pageCount: number;
    firstPageSize: PageDimensions;
    bytes: Uint8Array;
    metadata: PdfMetadataSnapshot;
    isSample?: boolean;
};

type MergeQueueItem = {
    id: string;
    name: string;
    size: number;
    pageCount: number;
    firstPageSize: PageDimensions;
    bytes: Uint8Array;
    rotationDelta: RotationDelta;
};

type NormalizedPoint = {
    nx: number;
    ny: number;
};

type VectorStroke = {
    color: string;
    width: number;
    points: NormalizedPoint[];
};

type UploadedStamp = {
    name: string;
    bytes: Uint8Array;
    width: number;
    height: number;
    previewUrl: string;
};

type EditableMetadata = {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    creator: string;
    producer: string;
};

type StudioNotice = {
    title: string;
    detail: string;
};

const STUDIO_TABS: readonly {
    id: StudioMode;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    description: string;
}[] = [
    {
        id: "merge",
        label: "Merge & Organize",
        shortLabel: "Merge",
        icon: Layers,
        description: "Combine up to 20 PDFs, reorder documents, and rotate pages.",
    },
    {
        id: "split",
        label: "Split & Extract",
        shortLabel: "Split",
        icon: Scissors,
        description: "Extract custom page ranges or burst all pages into a .ZIP.",
    },
    {
        id: "sign",
        label: "Sign & Stamp",
        shortLabel: "Sign",
        icon: PenTool,
        description: "Draw or upload a transparent signature with exact placement.",
    },
    {
        id: "metadata",
        label: "Metadata Privacy",
        shortLabel: "Metadata",
        icon: ShieldCheck,
        description: "Audit and strip identifying Author, Creator, and Producer tags.",
    },
];

const CHECKERBOARD_STYLE: React.CSSProperties = {
    backgroundColor: "#14141f",
    backgroundImage:
        "linear-gradient(45deg, #222233 25%, transparent 25%), linear-gradient(-45deg, #222233 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222233 75%), linear-gradient(-45deg, transparent 75%, #222233 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
};

const INFO_DICT_KEYS_TO_STRIP = [
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
] as const;

let cachedPdfLibPromise: Promise<PdfLibModule> | null = null;
function loadPdfLib(): Promise<PdfLibModule> {
    if (!cachedPdfLibPromise) {
        cachedPdfLibPromise = import("pdf-lib");
    }
    return cachedPdfLibPromise;
}

function createQueueId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeReadText(getter: () => string | undefined): string {
    try {
        return getter() ?? "";
    } catch {
        return "";
    }
}

function safeReadDate(getter: () => Date | undefined): string | undefined {
    try {
        const dt = getter();
        return dt && !Number.isNaN(dt.getTime()) ? dt.toISOString() : undefined;
    } catch {
        return undefined;
    }
}

function extractFriendlyPdfError(err: unknown, fallback: string): string {
    const message = err instanceof Error ? err.message : String(err ?? "");
    if (/encrypted|password/i.test(message)) {
        return "This PDF is password-protected or encrypted. Remove password protection before processing it locally.";
    }
    if (/invalid|header|No PDF header/i.test(message)) {
        return "Could not parse this file as a valid PDF. Please verify it is an uncorrupted .pdf document.";
    }
    return message ? `${fallback} (${message})` : fallback;
}

async function inspectPdfBytes(
    bytes: Uint8Array,
    fileName: string,
    fileSize: number,
    isSample = false
): Promise<LoadedPdfDocument> {
    const { PDFDocument, PDFName } = await loadPdfLib();
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    const pageCount = doc.getPageCount();
    if (pageCount < 1) {
        throw new Error("The PDF contains 0 pages.");
    }

    const firstPage = doc.getPage(0).getSize();
    const hasXmpMetadata = Boolean(doc.catalog.get(PDFName.of("Metadata")));

    const metadata: PdfMetadataSnapshot = {
        title: safeReadText(() => doc.getTitle()),
        author: safeReadText(() => doc.getAuthor()),
        subject: safeReadText(() => doc.getSubject()),
        keywords: safeReadText(() => doc.getKeywords()),
        creator: safeReadText(() => doc.getCreator()),
        producer: safeReadText(() => doc.getProducer()),
        creationDate: safeReadDate(() => doc.getCreationDate()),
        modificationDate: safeReadDate(() => doc.getModificationDate()),
        hasXmpMetadata,
    };

    return {
        name: fileName,
        size: fileSize,
        pageCount,
        firstPageSize: {
            width: Math.round(firstPage.width),
            height: Math.round(firstPage.height),
        },
        bytes,
        metadata,
        isSample,
    };
}

/**
 * Generates a realistic 3-page sample PDF contract 100% locally via pdf-lib
 * with populated metadata tags and a Page 3 execution signature line.
 */
async function buildSampleContractPdfBytes(
    variantLabel = "Sample"
): Promise<Uint8Array> {
    const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
    const doc = await PDFDocument.create({ updateMetadata: false });
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    doc.setTitle(`Master Service Agreement (${variantLabel})`);
    doc.setAuthor("Alex Mercer — Legal Operations");
    doc.setSubject("Commercial Consulting & NDA Sample Document");
    doc.setKeywords(["sample", "contract", "agreement", "rapidkit"]);
    doc.setCreator("RapidKit PDF Studio");
    doc.setProducer("Client-Side Contract Generator (Sample)");
    doc.setCreationDate(new Date("2026-01-15T10:30:00Z"));
    doc.setModificationDate(new Date("2026-02-01T14:15:00Z"));

    const pageWidth = 612;
    const pageHeight = 792;
    const slate900 = rgb(0.06, 0.09, 0.16);
    const slate600 = rgb(0.28, 0.33, 0.41);
    const indigo600 = rgb(0.31, 0.27, 0.9);
    const lineGray = rgb(0.82, 0.85, 0.9);

    const drawHeader = (page: import("pdf-lib").PDFPage, subtitle: string) => {
        page.drawRectangle({
            x: 0,
            y: pageHeight - 78,
            width: pageWidth,
            height: 78,
            color: rgb(0.96, 0.97, 0.99),
        });
        page.drawLine({
            start: { x: 52, y: pageHeight - 78 },
            end: { x: pageWidth - 52, y: pageHeight - 78 },
            thickness: 1.5,
            color: indigo600,
        });
        page.drawText("MASTER SERVICE AGREEMENT", {
            x: 52,
            y: pageHeight - 40,
            size: 16,
            font: fontBold,
            color: slate900,
        });
        page.drawText(subtitle, {
            x: 52,
            y: pageHeight - 60,
            size: 10,
            font: fontRegular,
            color: indigo600,
        });
    };

    const drawFooter = (page: import("pdf-lib").PDFPage, pageNum: number) => {
        page.drawLine({
            start: { x: 52, y: 42 },
            end: { x: pageWidth - 52, y: 42 },
            thickness: 0.75,
            color: lineGray,
        });
        page.drawText(
            `RapidKit Sample Contract (${variantLabel}) — Zero-Upload Local PDF`,
            {
                x: 52,
                y: 24,
                size: 8.5,
                font: fontRegular,
                color: slate600,
            }
        );
        page.drawText(`Page ${pageNum} of 3`, {
            x: pageWidth - 104,
            y: 24,
            size: 8.5,
            font: fontBold,
            color: slate600,
        });
    };

    const drawParagraph = (
        page: import("pdf-lib").PDFPage,
        heading: string,
        lines: string[],
        startY: number
    ) => {
        page.drawText(heading, {
            x: 52,
            y: startY,
            size: 12,
            font: fontBold,
            color: slate900,
        });
        let cursor = startY - 22;
        for (const line of lines) {
            page.drawText(line, {
                x: 52,
                y: cursor,
                size: 10.5,
                font: fontRegular,
                color: slate600,
            });
            cursor -= 17;
        }
        return cursor - 18;
    };

    // Page 1
    const p1 = doc.addPage([pageWidth, pageHeight]);
    drawHeader(
        p1,
        `100% Synthetic Sample Contract (${variantLabel}) — Effective Date: Nov 18, 2026`
    );
    let y1 = pageHeight - 122;
    y1 = drawParagraph(
        p1,
        "1. PARTIES AND PURPOSE",
        [
            "This Sample Master Service Agreement ('Agreement') is generated purely for local",
            "testing inside your web browser. None of the names or terms below represent real entities.",
            "Test splitting pages (e.g., 1, 3), bursting into a ZIP, merging with another PDF,",
            "or inspecting and stripping embedded Author/Creator metadata in one click.",
        ],
        y1
    );
    drawParagraph(
        p1,
        "2. SCOPE OF DELIVERABLES",
        [
            "Consultant agrees to design client-side browser software prioritizing user privacy,",
            "zero-server document execution, responsive mobile ergonomics, and transparent exports.",
            "Each milestone is reviewed locally by the designated stakeholder before final sign-off.",
        ],
        y1
    );
    drawFooter(p1, 1);

    // Page 2
    const p2 = doc.addPage([pageWidth, pageHeight]);
    drawHeader(p2, "Confidentiality, Security & Ownership Terms");
    let y2 = pageHeight - 122;
    y2 = drawParagraph(
        p2,
        "3. DATA PRIVACY & ZERO-SERVER GUARANTEE",
        [
            "All PDF assembly, page extraction, image signature embedding, and metadata cleaning",
            "occur strictly within Client device RAM. Documents are never transmitted across networks.",
            "Hidden metadata tags such as Author, Creator, Producer, and XML streams can be audited",
            "and stripped completely via the Metadata Privacy tab prior to external distribution.",
        ],
        y2
    );
    drawParagraph(
        p2,
        "4. TERM & ACCEPTANCE",
        [
            "This sample agreement remains valid across all test workflows, including rotation (90/180/270)",
            "and selective page extraction. Proceed to Page 3 to test visual signature stamping.",
        ],
        y2
    );
    drawFooter(p2, 2);

    // Page 3 (Signature Execution Page)
    const p3 = doc.addPage([pageWidth, pageHeight]);
    drawHeader(p3, "Execution & Authorized Signatures");
    const y3 = pageHeight - 122;
    drawParagraph(
        p3,
        "5. EXECUTION BY AUTHORIZED SIGNATORIES",
        [
            "By stamping a drawn signature or transparent PNG onto the execution blocks below,",
            "you can verify PDF coordinate placement (Bottom Left, Bottom Center, Bottom Right,",
            "Top Right, or Center) across Small, Medium, and Large aspect-preserving scales.",
        ],
        y3
    );

    // Signature target boxes near bottom-left and bottom-right
    p3.drawRectangle({
        x: 52,
        y: 66,
        width: 220,
        height: 112,
        borderColor: lineGray,
        borderWidth: 1,
        color: rgb(0.985, 0.99, 1),
    });
    p3.drawText("CLIENT REPRESENTATIVE", {
        x: 64,
        y: 158,
        size: 8.5,
        font: fontBold,
        color: indigo600,
    });
    p3.drawLine({
        start: { x: 64, y: 92 },
        end: { x: 256, y: 92 },
        thickness: 1,
        color: slate600,
    });
    p3.drawText("Authorized Signature & Date", {
        x: 64,
        y: 78,
        size: 8,
        font: fontRegular,
        color: slate600,
    });

    p3.drawRectangle({
        x: 340,
        y: 66,
        width: 220,
        height: 112,
        borderColor: lineGray,
        borderWidth: 1,
        color: rgb(0.985, 0.99, 1),
    });
    p3.drawText("SERVICE PROVIDER SIGN-OFF", {
        x: 352,
        y: 158,
        size: 8.5,
        font: fontBold,
        color: indigo600,
    });
    p3.drawLine({
        start: { x: 352, y: 92 },
        end: { x: 544, y: 92 },
        thickness: 1,
        color: slate600,
    });
    p3.drawText("Signature Stamp Area", {
        x: 352,
        y: 78,
        size: 8,
        font: fontRegular,
        color: slate600,
    });

    drawFooter(p3, 3);

    return doc.save();
}

function renderStrokesOnCanvas(
    canvas: HTMLCanvasElement,
    strokes: VectorStroke[],
    activeStroke: VectorStroke | null
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const cssW = canvas.clientWidth || canvas.width / dpr;
    const cssH = canvas.clientHeight || canvas.height / dpr;
    if (cssW <= 0 || cssH <= 0) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const allStrokes = activeStroke ? [...strokes, activeStroke] : strokes;

    for (const stroke of allStrokes) {
        if (stroke.points.length === 0) continue;
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.points.length === 1) {
            const p = stroke.points[0];
            ctx.beginPath();
            ctx.arc(p.nx * cssW, p.ny * cssH, stroke.width / 2, 0, Math.PI * 2);
            ctx.fill();
            continue;
        }

        ctx.beginPath();
        const first = stroke.points[0];
        ctx.moveTo(first.nx * cssW, first.ny * cssH);

        for (let i = 1; i < stroke.points.length - 1; i += 1) {
            const curr = stroke.points[i];
            const next = stroke.points[i + 1];
            const midX = ((curr.nx + next.nx) * 0.5) * cssW;
            const midY = ((curr.ny + next.ny) * 0.5) * cssH;
            ctx.quadraticCurveTo(curr.nx * cssW, curr.ny * cssH, midX, midY);
        }

        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.nx * cssW, last.ny * cssH);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Exports drawn strokes on a tight, transparent high-DPI PNG with zero extra margin
 * so pdf-lib scales the signature cleanly into the target rectangle.
 */
async function exportTrimmedSignaturePngBytes(
    strokes: VectorStroke[]
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
    if (strokes.length === 0) return null;

    const renderW = 900;
    const renderH = 360;
    const workCanvas = document.createElement("canvas");
    workCanvas.width = renderW;
    workCanvas.height = renderH;
    const ctx = workCanvas.getContext("2d");
    if (!ctx) return null;

    for (const stroke of strokes) {
        if (stroke.points.length === 0) continue;
        const scaledWidth = stroke.width * 2;
        ctx.strokeStyle = stroke.color;
        ctx.fillStyle = stroke.color;
        ctx.lineWidth = scaledWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.points.length === 1) {
            const p = stroke.points[0];
            ctx.beginPath();
            ctx.arc(p.nx * renderW, p.ny * renderH, scaledWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].nx * renderW, stroke.points[0].ny * renderH);
        for (let i = 1; i < stroke.points.length - 1; i += 1) {
            const curr = stroke.points[i];
            const next = stroke.points[i + 1];
            const midX = ((curr.nx + next.nx) * 0.5) * renderW;
            const midY = ((curr.ny + next.ny) * 0.5) * renderH;
            ctx.quadraticCurveTo(curr.nx * renderW, curr.ny * renderH, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.nx * renderW, last.ny * renderH);
        ctx.stroke();
    }

    const imageData = ctx.getImageData(0, 0, renderW, renderH).data;
    let minX = renderW;
    let minY = renderH;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < renderH; y += 1) {
        const rowOffset = y * renderW * 4;
        for (let x = 0; x < renderW; x += 1) {
            if (imageData[rowOffset + x * 4 + 3] > 8) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < minX || maxY < minY) return null;

    const pad = 12;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(renderW - cropX, maxX - minX + 1 + pad * 2);
    const cropH = Math.min(renderH - cropY, maxY - minY + 1 + pad * 2);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = cropW;
    outCanvas.height = cropH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return null;

    outCtx.drawImage(workCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const blob = await new Promise<Blob | null>((resolve) =>
        outCanvas.toBlob(resolve, "image/png")
    );
    if (!blob) return null;

    const buf = await blob.arrayBuffer();
    return {
        bytes: new Uint8Array(buf),
        width: cropW,
        height: cropH,
    };
}

function readPngFileNormalized(file: File): Promise<{
    bytes: Uint8Array;
    width: number;
    height: number;
    previewUrl: string;
}> {
    return new Promise((resolve, reject) => {
        const tempUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx || width <= 0 || height <= 0) {
                URL.revokeObjectURL(tempUrl);
                reject(new Error("Could not decode PNG signature dimensions."));
                return;
            }
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(tempUrl);
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error("Could not prepare PNG signature stamp."));
                    return;
                }
                const bytes = new Uint8Array(await blob.arrayBuffer());
                const previewUrl = URL.createObjectURL(blob);
                resolve({ bytes, width, height, previewUrl });
            }, "image/png");
        };
        img.onerror = () => {
            URL.revokeObjectURL(tempUrl);
            reject(new Error("Failed to read PNG signature image."));
        };
        img.src = tempUrl;
    });
}

function isSignaturePadStrokeTarget(
    target: EventTarget | null
): target is HTMLElement {
    return target instanceof HTMLElement;
}

export function PdfStudioTool() {
    const [activeTab, setActiveTab] = useState<StudioMode>("merge");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<StudioNotice | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [busyLabel, setBusyLabel] = useState("Processing PDF...");

    // Single-PDF Workspace State (shared smoothly across Split, Sign, Metadata)
    const [activePdf, setActivePdf] = useState<LoadedPdfDocument | null>(null);
    const [isSingleDragOver, setIsSingleDragOver] = useState(false);
    const singleFileInputRef = useRef<HTMLInputElement>(null);

    // Tab 1: Merge Queue State
    const [mergeQueue, setMergeQueue] = useState<MergeQueueItem[]>([]);
    const [isMergeDragOver, setIsMergeDragOver] = useState(false);
    const [mergeOutputName, setMergeOutputName] = useState("merged-document");
    const mergeFileInputRef = useRef<HTMLInputElement>(null);
    const sampleCounterRef = useRef(0);

    // Tab 2: Split & Burst State
    const [splitRangeInput, setSplitRangeInput] = useState("1");
    const [burstProgress, setBurstProgress] = useState<{
        current: number;
        total: number;
    } | null>(null);

    // Tab 3: Sign & Stamp State
    const [signatureSource, setSignatureSource] = useState<"draw" | "upload">("draw");
    const [inkColor, setInkColor] = useState<string>(SIGNATURE_INK_COLORS[0].value);
    const [penWidth, setPenWidth] = useState<number>(3);
    const [strokes, setStrokes] = useState<VectorStroke[]>([]);
    const strokesRef = useRef<VectorStroke[]>([]);
    const activeStrokeRef = useRef<VectorStroke | null>(null);
    const sigCanvasRef = useRef<HTMLCanvasElement>(null);
    const sigBoxRef = useRef<HTMLDivElement>(null);

    const [uploadedStamp, setUploadedStamp] = useState<UploadedStamp | null>(null);
    const uploadedStampUrlRef = useRef<string | null>(null);
    const stampFileInputRef = useRef<HTMLInputElement>(null);

    const [sigPageTarget, setSigPageTarget] = useState<SignaturePageTarget>("last");
    const [sigCustomPage, setSigCustomPage] = useState<number>(1);
    const [sigAnchor, setSigAnchor] = useState<SignatureAnchor>("bottom-right");
    const [sigScale, setSigScale] = useState<SignatureScale>("medium");
    const [stampDateUnderneath, setStampDateUnderneath] = useState<boolean>(true);

    // Tab 4: Metadata Privacy State
    const [stripAllMetadata, setStripAllMetadata] = useState<boolean>(true);
    const [editableMeta, setEditableMeta] = useState<EditableMetadata>({
        title: "",
        author: "",
        subject: "",
        keywords: "",
        creator: "",
        producer: "",
    });

    // Tracked temporary download Blob URLs & timers for strict cleanup
    const activeObjectUrlsRef = useRef<Set<string>>(new Set());
    const activeTimersRef = useRef<Set<number>>(new Set());

    const revokeUploadedStamp = useCallback(() => {
        if (uploadedStampUrlRef.current) {
            URL.revokeObjectURL(uploadedStampUrlRef.current);
            uploadedStampUrlRef.current = null;
        }
    }, []);

    useEffect(() => {
        const urlsRef = activeObjectUrlsRef;
        const timersRef = activeTimersRef;
        return () => {
            revokeUploadedStamp();
            for (const url of urlsRef.current) {
                URL.revokeObjectURL(url);
            }
            urlsRef.current.clear();
            for (const timerId of timersRef.current) {
                window.clearTimeout(timerId);
            }
            timersRef.current.clear();
        };
    }, [revokeUploadedStamp]);

    const triggerDownloadBytes = useCallback(
        (bytes: Uint8Array | Blob, filename: string, mimeType: string) => {
            const blob =
                bytes instanceof Blob
                    ? bytes
                    : new Blob([new Uint8Array(bytes)], { type: mimeType });
            const url = URL.createObjectURL(blob);
            activeObjectUrlsRef.current.add(url);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            const timerId = window.setTimeout(() => {
                URL.revokeObjectURL(url);
                activeObjectUrlsRef.current.delete(url);
                activeTimersRef.current.delete(timerId);
            }, 1500);
            activeTimersRef.current.add(timerId);
        },
        []
    );

    const syncMetadataEditorFromPdf = useCallback((pdf: LoadedPdfDocument) => {
        setEditableMeta({
            title: pdf.metadata.title,
            author: pdf.metadata.author,
            subject: pdf.metadata.subject,
            keywords: pdf.metadata.keywords,
            creator: pdf.metadata.creator,
            producer: pdf.metadata.producer,
        });
        setSplitRangeInput(pdf.pageCount > 1 ? `1-${Math.min(2, pdf.pageCount)}` : "1");
        setSigCustomPage(pdf.pageCount);
        setSigPageTarget(pdf.pageCount >= 1 ? "last" : "first");
    }, []);

    // Keep strokesRef synchronized & canvas crisply sized on resize/tab switch
    const syncSignatureCanvasSize = useCallback(() => {
        const canvas = sigCanvasRef.current;
        const box = sigBoxRef.current;
        if (!canvas || !box) return;

        const dpr = Math.max(window.devicePixelRatio || 1, 1);
        const cssW = Math.floor(box.clientWidth);
        const cssH = Math.floor(box.clientHeight);
        if (cssW <= 0 || cssH <= 0) return;

        const targetW = Math.floor(cssW * dpr);
        const targetH = Math.floor(cssH * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
        }
        renderStrokesOnCanvas(canvas, strokesRef.current, activeStrokeRef.current);
    }, []);

    useEffect(() => {
        if (activeTab !== "sign" || signatureSource !== "draw") return;
        syncSignatureCanvasSize();

        const box = sigBoxRef.current;
        if (!box || typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", syncSignatureCanvasSize);
            return () => window.removeEventListener("resize", syncSignatureCanvasSize);
        }

        const observer = new ResizeObserver(() => {
            syncSignatureCanvasSize();
        });
        observer.observe(box);
        return () => observer.disconnect();
    }, [activeTab, signatureSource, activePdf, syncSignatureCanvasSize]);

    // ─── Single PDF Loader ──────────────────────────────────────────
    const handleSinglePdfFile = useCallback(
        async (file: File) => {
            setError(null);
            setNotice(null);
            const validation = validatePdfFile(file);
            if (!validation.ok) {
                setError(validation.error);
                return;
            }

            setIsBusy(true);
            setBusyLabel(`Reading "${file.name}" locally...`);
            try {
                const bytes = new Uint8Array(await file.arrayBuffer());
                const loaded = await inspectPdfBytes(bytes, file.name, file.size, false);
                setActivePdf(loaded);
                syncMetadataEditorFromPdf(loaded);
                setNotice({
                    title: "PDF Loaded Locally",
                    detail: `${loaded.name} (${loaded.pageCount} page${
                        loaded.pageCount === 1 ? "" : "s"
                    } · ${formatPdfFileSize(loaded.size)}) is ready in browser memory.`,
                });
            } catch (err) {
                setError(
                    extractFriendlyPdfError(err, "Unable to read the selected PDF file.")
                );
            } finally {
                setIsBusy(false);
            }
        },
        [syncMetadataEditorFromPdf]
    );

    // ─── Merge Queue Loader ─────────────────────────────────────────
    const handleMergeFilesAdd = useCallback(
        async (fileList: FileList | File[]) => {
            setError(null);
            setNotice(null);
            const incoming = Array.from(fileList);
            if (incoming.length === 0) return;

            setIsBusy(true);
            setBusyLabel(`Inspecting ${incoming.length} PDF file(s)...`);

            try {
                const nextItems: MergeQueueItem[] = [];
                let simulatedCount = mergeQueue.length;
                const errors: string[] = [];

                for (const file of incoming) {
                    const check = validatePdfFile(file, simulatedCount);
                    if (!check.ok) {
                        errors.push(`${file.name}: ${check.error}`);
                        continue;
                    }

                    try {
                        const bytes = new Uint8Array(await file.arrayBuffer());
                        const parsed = await inspectPdfBytes(
                            bytes,
                            file.name,
                            file.size,
                            false
                        );
                        nextItems.push({
                            id: createQueueId(),
                            name: parsed.name,
                            size: parsed.size,
                            pageCount: parsed.pageCount,
                            firstPageSize: parsed.firstPageSize,
                            bytes: parsed.bytes,
                            rotationDelta: 0,
                        });
                        simulatedCount += 1;
                    } catch (err) {
                        errors.push(
                            `${file.name}: ${extractFriendlyPdfError(
                                err,
                                "Invalid or encrypted PDF."
                            )}`
                        );
                    }
                }

                if (nextItems.length > 0) {
                    setMergeQueue((prev) => [...prev, ...nextItems]);
                    // Also make the first added PDF available in Split/Sign/Metadata if none loaded yet
                    if (!activePdf) {
                        const first = nextItems[0];
                        const inspected = await inspectPdfBytes(
                            first.bytes,
                            first.name,
                            first.size,
                            false
                        );
                        setActivePdf(inspected);
                        syncMetadataEditorFromPdf(inspected);
                    }
                }

                if (errors.length > 0) {
                    setError(errors.join(" "));
                } else if (nextItems.length > 0) {
                    setNotice({
                        title: `Added ${nextItems.length} PDF${
                            nextItems.length === 1 ? "" : "s"
                        } to Merge Queue`,
                        detail: "Drag-free mobile reorder arrows and page rotations are ready below.",
                    });
                }
            } finally {
                setIsBusy(false);
            }
        },
        [activePdf, mergeQueue.length, syncMetadataEditorFromPdf]
    );

    // ─── Sample 3-Page Contract PDF Generator ───────────────────────
    const handleGenerateSampleContract = useCallback(async () => {
        setError(null);
        setNotice(null);
        setIsBusy(true);
        setBusyLabel("Generating sample 3-page contract via pdf-lib...");

        try {
            sampleCounterRef.current += 1;
            const partIndex = sampleCounterRef.current;
            const variantLabel =
                partIndex === 1 ? "Sample" : `Sample Part ${partIndex}`;
            const fileName =
                partIndex === 1
                    ? "sample-3-page-contract.pdf"
                    : `sample-contract-part-${partIndex}.pdf`;

            const bytes = await buildSampleContractPdfBytes(variantLabel);
            const loaded = await inspectPdfBytes(
                bytes,
                fileName,
                bytes.byteLength,
                true
            );

            if (activeTab === "merge") {
                if (mergeQueue.length >= MAX_MERGE_FILES) {
                    setError(
                        `Merge queue is limited to ${MAX_MERGE_FILES} PDF files.`
                    );
                } else {
                    setMergeQueue((prev) => [
                        ...prev,
                        {
                            id: createQueueId(),
                            name: loaded.name,
                            size: loaded.size,
                            pageCount: loaded.pageCount,
                            firstPageSize: loaded.firstPageSize,
                            bytes: loaded.bytes,
                            rotationDelta: 0,
                        },
                    ]);
                    if (!activePdf) {
                        setActivePdf(loaded);
                        syncMetadataEditorFromPdf(loaded);
                    }
                    setNotice({
                        title: "Sample 3-Page Contract Added to Queue",
                        detail: `${loaded.name} (${formatPdfFileSize(
                            loaded.size
                        )}) created 100% locally. Click again to add a second sample PDF to merge!`,
                    });
                }
            } else {
                setActivePdf(loaded);
                syncMetadataEditorFromPdf(loaded);
                if (mergeQueue.length === 0) {
                    setMergeQueue([
                        {
                            id: createQueueId(),
                            name: loaded.name,
                            size: loaded.size,
                            pageCount: loaded.pageCount,
                            firstPageSize: loaded.firstPageSize,
                            bytes: loaded.bytes,
                            rotationDelta: 0,
                        },
                    ]);
                }
                setNotice({
                    title: "Sample 3-Page Contract Loaded",
                    detail:
                        "Created offline via pdf-lib with Page 3 signature boxes and sample Author/Creator tags for instant testing.",
                });
            }
        } catch (err) {
            setError(
                extractFriendlyPdfError(err, "Failed to generate sample contract PDF.")
            );
        } finally {
            setIsBusy(false);
        }
    }, [activePdf, activeTab, mergeQueue.length, syncMetadataEditorFromPdf]);

    // ─── Merge Handlers ─────────────────────────────────────────────
    const moveMergeItem = (index: number, direction: -1 | 1) => {
        setMergeQueue((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const copy = [...prev];
            const [item] = copy.splice(index, 1);
            copy.splice(target, 0, item);
            return copy;
        });
    };

    const setItemRotation = (id: string, rotation: RotationDelta) => {
        setMergeQueue((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, rotationDelta: rotation } : item
            )
        );
    };

    const removeMergeItem = (id: string) => {
        setMergeQueue((prev) => prev.filter((item) => item.id !== id));
    };

    const totalMergePages = useMemo(
        () => mergeQueue.reduce((sum, item) => sum + item.pageCount, 0),
        [mergeQueue]
    );

    const totalMergeBytes = useMemo(
        () => mergeQueue.reduce((sum, item) => sum + item.size, 0),
        [mergeQueue]
    );

    const handleExportMergedPdf = async () => {
        if (mergeQueue.length === 0) return;
        setError(null);
        setNotice(null);
        setIsBusy(true);
        setBusyLabel(`Merging ${totalMergePages} page(s) in browser RAM...`);

        try {
            const { PDFDocument, degrees } = await loadPdfLib();
            const mergedDoc = await PDFDocument.create();

            for (const item of mergeQueue) {
                const srcDoc = await PDFDocument.load(item.bytes, {
                    updateMetadata: false,
                });
                const copied = await mergedDoc.copyPages(
                    srcDoc,
                    srcDoc.getPageIndices()
                );

                for (const page of copied) {
                    if (item.rotationDelta !== 0) {
                        const existingAngle = normalizeRotationDelta(
                            page.getRotation().angle
                        );
                        page.setRotation(
                            degrees((existingAngle + item.rotationDelta) % 360)
                        );
                    }
                    mergedDoc.addPage(page);
                }
            }

            const outBytes = await mergedDoc.save();
            const outName = buildPdfOutputFilename(
                mergeOutputName || "merged-document",
                "merged",
                "pdf"
            );
            triggerDownloadBytes(outBytes, outName, "application/pdf");
            setNotice({
                title: "Merged PDF Downloaded",
                detail: `${outName} (${totalMergePages} pages · ${formatPdfFileSize(
                    outBytes.byteLength
                )}) compiled locally with zero server uploads.`,
            });
        } catch (err) {
            setError(extractFriendlyPdfError(err, "Failed to merge PDFs."));
        } finally {
            setIsBusy(false);
        }
    };

    // ─── Split & Burst Handlers ─────────────────────────────────────
    const parsedSplitRange = useMemo(() => {
        if (!activePdf) return null;
        return parsePageRangeString(splitRangeInput, activePdf.pageCount);
    }, [activePdf, splitRangeInput]);

    const applySplitPreset = (
        preset: "first" | "last" | "odd" | "even" | "all"
    ) => {
        if (!activePdf) return;
        const n = activePdf.pageCount;
        if (preset === "first") {
            setSplitRangeInput("1");
        } else if (preset === "last") {
            setSplitRangeInput(String(n));
        } else if (preset === "all") {
            setSplitRangeInput(n === 1 ? "1" : `1-${n}`);
        } else if (preset === "odd") {
            const list: number[] = [];
            for (let p = 1; p <= n; p += 2) list.push(p);
            setSplitRangeInput(list.join(", "));
        } else {
            const list: number[] = [];
            for (let p = 2; p <= n; p += 2) list.push(p);
            setSplitRangeInput(list.length > 0 ? list.join(", ") : "1");
        }
    };

    const handleExtractRangePdf = async () => {
        if (!activePdf) return;
        const check = parsePageRangeString(splitRangeInput, activePdf.pageCount);
        if (!check.ok) {
            setError(check.error);
            return;
        }

        setError(null);
        setNotice(null);
        setIsBusy(true);
        setBusyLabel(`Extracting ${check.pages.length} page(s)...`);

        try {
            const { PDFDocument } = await loadPdfLib();
            const srcDoc = await PDFDocument.load(activePdf.bytes, {
                updateMetadata: false,
            });
            const outDoc = await PDFDocument.create();
            const copied = await outDoc.copyPages(srcDoc, check.zeroBasedIndices);
            for (const page of copied) {
                outDoc.addPage(page);
            }

            const outBytes = await outDoc.save();
            const outName = buildPdfOutputFilename(activePdf.name, "split", "pdf");
            triggerDownloadBytes(outBytes, outName, "application/pdf");
            setNotice({
                title: "Extracted Pages Downloaded",
                detail: `${outName} (${check.pages.length} page${
                    check.pages.length === 1 ? "" : "s"
                } · ${formatPdfFileSize(outBytes.byteLength)}) saved.`,
            });
        } catch (err) {
            setError(extractFriendlyPdfError(err, "Failed to extract PDF pages."));
        } finally {
            setIsBusy(false);
        }
    };

    const handleBurstAllToZip = async () => {
        if (!activePdf) return;
        setError(null);
        setNotice(null);
        setIsBusy(true);
        setBurstProgress({ current: 0, total: activePdf.pageCount });
        setBusyLabel(`Splitting ${activePdf.pageCount} page(s) into ZIP...`);

        try {
            const [{ PDFDocument }, { default: JSZip }] = await Promise.all([
                loadPdfLib(),
                import("jszip"),
            ]);
            const srcDoc = await PDFDocument.load(activePdf.bytes, {
                updateMetadata: false,
            });
            const total = srcDoc.getPageCount();
            const zip = new JSZip();

            for (let i = 0; i < total; i += 1) {
                const singleDoc = await PDFDocument.create();
                const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
                singleDoc.addPage(copiedPage);
                const pageBytes = await singleDoc.save();
                zip.file(formatBurstPageFilename(i + 1, total), pageBytes);
                setBurstProgress({ current: i + 1, total });
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipName = buildPdfOutputFilename(activePdf.name, "burst", "zip");
            triggerDownloadBytes(zipBlob, zipName, "application/zip");
            setNotice({
                title: "All Pages Bursted to ZIP",
                detail: `${zipName} containing ${total} individual PDFs (${formatPdfFileSize(
                    zipBlob.size
                )}) is ready.`,
            });
        } catch (err) {
            setError(
                extractFriendlyPdfError(err, "Failed to burst PDF pages into ZIP.")
            );
        } finally {
            setBurstProgress(null);
            setIsBusy(false);
        }
    };

    // ─── Signature Canvas Drawing & Stamp Handlers ──────────────────
    const getNormalizedPointFromPointer = (
        e: React.PointerEvent<HTMLCanvasElement>
    ): NormalizedPoint | null => {
        const canvas = sigCanvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        return {
            nx: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
            ny: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
        };
    };

    const handleSigPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isSignaturePadStrokeTarget(e.target)) return;
        e.preventDefault();
        const pt = getNormalizedPointFromPointer(e);
        if (!pt) return;

        e.currentTarget.setPointerCapture(e.pointerId);
        const newStroke: VectorStroke = {
            color: inkColor,
            width: penWidth,
            points: [pt],
        };
        activeStrokeRef.current = newStroke;
        if (sigCanvasRef.current) {
            renderStrokesOnCanvas(
                sigCanvasRef.current,
                strokesRef.current,
                activeStrokeRef.current
            );
        }
    };

    const handleSigPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const current = activeStrokeRef.current;
        if (!current) return;
        e.preventDefault();
        const pt = getNormalizedPointFromPointer(e);
        if (!pt) return;

        current.points.push(pt);
        if (sigCanvasRef.current) {
            renderStrokesOnCanvas(
                sigCanvasRef.current,
                strokesRef.current,
                current
            );
        }
    };

    const finishActiveStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const current = activeStrokeRef.current;
        if (!current) return;
        activeStrokeRef.current = null;

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        const updated = [...strokesRef.current, current];
        strokesRef.current = updated;
        setStrokes(updated);

        if (sigCanvasRef.current) {
            renderStrokesOnCanvas(sigCanvasRef.current, updated, null);
        }
    };

    const handleClearSignaturePad = () => {
        activeStrokeRef.current = null;
        strokesRef.current = [];
        setStrokes([]);
        if (sigCanvasRef.current) {
            renderStrokesOnCanvas(sigCanvasRef.current, [], null);
        }
    };

    const handleStampUpload = async (file: File) => {
        setError(null);
        const check = validateSignaturePngFile(file);
        if (!check.ok) {
            setError(check.error);
            return;
        }
        try {
            const parsed = await readPngFileNormalized(file);
            revokeUploadedStamp();
            uploadedStampUrlRef.current = parsed.previewUrl;
            setUploadedStamp({
                name: file.name,
                bytes: parsed.bytes,
                width: parsed.width,
                height: parsed.height,
                previewUrl: parsed.previewUrl,
            });
            setSignatureSource("upload");
        } catch (err) {
            setError(
                extractFriendlyPdfError(
                    err,
                    "Unable to load PNG signature stamp image."
                )
            );
        }
    };

    const handleSignPdfDownload = async () => {
        if (!activePdf) return;
        setError(null);
        setNotice(null);

        const targetCheck = resolveSignaturePageIndices(
            sigPageTarget,
            activePdf.pageCount,
            sigCustomPage
        );
        if (!targetCheck.ok) {
            setError(targetCheck.error);
            return;
        }

        setIsBusy(true);
        setBusyLabel("Embedding signature into PDF pages...");

        try {
            let pngBytes: Uint8Array;
            let sigWidth: number;
            let sigHeight: number;

            if (signatureSource === "draw") {
                const exported = await exportTrimmedSignaturePngBytes(
                    strokesRef.current
                );
                if (!exported) {
                    setError(
                        "Please draw your signature on the pad first (or switch to Upload PNG Stamp)."
                    );
                    setIsBusy(false);
                    return;
                }
                pngBytes = exported.bytes;
                sigWidth = exported.width;
                sigHeight = exported.height;
            } else {
                if (!uploadedStamp) {
                    setError("Please upload a transparent PNG signature image first.");
                    setIsBusy(false);
                    return;
                }
                pngBytes = uploadedStamp.bytes;
                sigWidth = uploadedStamp.width;
                sigHeight = uploadedStamp.height;
            }

            const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
            const doc = await PDFDocument.load(activePdf.bytes, {
                updateMetadata: false,
            });
            const embeddedPng = await doc.embedPng(pngBytes);
            const dateFont = stampDateUnderneath
                ? await doc.embedFont(StandardFonts.Helvetica)
                : null;
            const dateLabel = `Signed ${new Date().toISOString().slice(0, 10)}`;
            const aspectRatio = sigWidth / Math.max(1, sigHeight);

            for (const pageIdx of targetCheck.indices) {
                const page = doc.getPage(pageIdx);
                const { width, height } = page.getSize();
                const rect = computeSignaturePlacementRect(
                    { width, height },
                    aspectRatio,
                    sigScale,
                    sigAnchor,
                    {
                        bottomExtraMarginPt: stampDateUnderneath ? 14 : 0,
                    }
                );

                page.drawImage(embeddedPng, rect);

                if (stampDateUnderneath && dateFont) {
                    const fontSize = Math.max(7.5, Math.min(9.5, width * 0.014));
                    const textWidth = dateFont.widthOfTextAtSize(dateLabel, fontSize);
                    const rawTextX = rect.x + (rect.width - textWidth) / 2;
                    const clampedTextX = Math.max(
                        12,
                        Math.min(width - textWidth - 12, rawTextX)
                    );
                    const textY = Math.max(8, rect.y - fontSize - 4);

                    page.drawText(dateLabel, {
                        x: clampedTextX,
                        y: textY,
                        size: fontSize,
                        font: dateFont,
                        color: rgb(0.22, 0.27, 0.36),
                    });
                }
            }

            const outBytes = await doc.save();
            const outName = buildPdfOutputFilename(activePdf.name, "signed", "pdf");
            triggerDownloadBytes(outBytes, outName, "application/pdf");
            setNotice({
                title: "Signed PDF Downloaded",
                detail: `${outName} stamped on ${
                    targetCheck.indices.length
                } page${targetCheck.indices.length === 1 ? "" : "s"} (${formatPdfFileSize(
                    outBytes.byteLength
                )}).`,
            });
        } catch (err) {
            setError(
                extractFriendlyPdfError(err, "Failed to embed signature into PDF.")
            );
        } finally {
            setIsBusy(false);
        }
    };

    // ─── Metadata Strip & Editor Handler ────────────────────────────
    const handleExportMetadataPdf = async () => {
        if (!activePdf) return;
        setError(null);
        setNotice(null);
        setIsBusy(true);
        setBusyLabel(
            stripAllMetadata
                ? "Stripping identifying metadata..."
                : "Updating PDF metadata tags..."
        );

        try {
            const { PDFDocument, PDFDict, PDFName } = await loadPdfLib();
            const doc = await PDFDocument.load(activePdf.bytes, {
                updateMetadata: false,
            });

            if (stripAllMetadata) {
                const infoObj = doc.context.lookup(doc.context.trailerInfo.Info);
                if (infoObj instanceof PDFDict) {
                    for (const key of INFO_DICT_KEYS_TO_STRIP) {
                        infoObj.delete(PDFName.of(key));
                    }
                }
                doc.catalog.delete(PDFName.of("Metadata"));
                delete doc.context.trailerInfo.Info;
            } else {
                const infoObj = doc.context.lookup(doc.context.trailerInfo.Info);
                const applyOrClear = (
                    value: string,
                    setter: (v: string) => void,
                    pdfKey: string
                ) => {
                    const trimmed = value.trim();
                    if (trimmed) {
                        setter(trimmed);
                    } else if (infoObj instanceof PDFDict) {
                        infoObj.delete(PDFName.of(pdfKey));
                    }
                };

                applyOrClear(editableMeta.title, (v) => doc.setTitle(v), "Title");
                applyOrClear(editableMeta.author, (v) => doc.setAuthor(v), "Author");
                applyOrClear(editableMeta.subject, (v) => doc.setSubject(v), "Subject");
                applyOrClear(editableMeta.creator, (v) => doc.setCreator(v), "Creator");
                applyOrClear(
                    editableMeta.producer,
                    (v) => doc.setProducer(v),
                    "Producer"
                );

                const kwList = parseKeywordsInput(editableMeta.keywords);
                if (kwList.length > 0) {
                    doc.setKeywords(kwList);
                } else if (infoObj instanceof PDFDict) {
                    infoObj.delete(PDFName.of("Keywords"));
                }
            }

            const outBytes = await doc.save();
            // Verify cleaned/updated snapshot & report exact remaining tag count
            const verified = await inspectPdfBytes(
                outBytes,
                buildPdfOutputFilename(activePdf.name, "cleaned", "pdf"),
                outBytes.byteLength,
                activePdf.isSample
            );
            const remainingCount = [
                verified.metadata.title,
                verified.metadata.author,
                verified.metadata.subject,
                verified.metadata.keywords,
                verified.metadata.creator,
                verified.metadata.producer,
                verified.metadata.creationDate ?? "",
                verified.metadata.modificationDate ?? "",
                verified.metadata.hasXmpMetadata ? "XMP" : "",
            ].filter((v) => v.trim().length > 0).length;

            triggerDownloadBytes(outBytes, verified.name, "application/pdf");

            setNotice({
                title: stripAllMetadata
                    ? "Identifying Metadata Stripped & Verified"
                    : "Custom Metadata Saved & Downloaded",
                detail: stripAllMetadata
                    ? `Downloaded ${verified.name} (${formatPdfFileSize(
                          outBytes.byteLength
                      )}). Verified ${remainingCount} identifying metadata field(s) remain.`
                    : `Downloaded ${verified.name} (${formatPdfFileSize(
                          outBytes.byteLength
                      )}) with your custom document properties.`,
            });
        } catch (err) {
            setError(
                extractFriendlyPdfError(err, "Failed to update PDF metadata.")
            );
        } finally {
            setIsBusy(false);
        }
    };

    const metadataAuditCount = useMemo(() => {
        if (!activePdf) return 0;
        const m = activePdf.metadata;
        return [
            m.title,
            m.author,
            m.subject,
            m.keywords,
            m.creator,
            m.producer,
            m.creationDate ?? "",
            m.modificationDate ?? "",
            m.hasXmpMetadata ? "XMP" : "",
        ].filter((v) => v.trim().length > 0).length;
    }, [activePdf]);

    const hasSignatureReady =
        signatureSource === "draw" ? strokes.length > 0 : Boolean(uploadedStamp);

    // Mini wireframe preview coordinates for Sign anchor & scale selector
    const miniPreviewRect = useMemo(() => {
        const rect = computeSignaturePlacementRect(
            { width: 100, height: 130 },
            2.4,
            sigScale,
            sigAnchor,
            { marginPt: 8, bottomExtraMarginPt: stampDateUnderneath ? 5 : 0 }
        );
        return {
            leftPct: (rect.x / 100) * 100,
            bottomPct: (rect.y / 130) * 100,
            widthPct: (rect.width / 100) * 100,
            heightPct: (rect.height / 130) * 100,
        };
    }, [sigAnchor, sigScale, stampDateUnderneath]);

    // ─── Shared Single-File Upload Dropzone Card ─────────────────────
    const renderSinglePdfUploadCard = (contextHint: string) => (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setIsSingleDragOver(true);
            }}
            onDragLeave={() => setIsSingleDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsSingleDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleSinglePdfFile(f);
            }}
            onClick={() => singleFileInputRef.current?.click()}
            className={cn(
                "border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center cursor-pointer transition-all",
                isSingleDragOver
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-[rgb(45,45,65)] bg-[rgb(14,14,22)] hover:border-orange-500/45 hover:bg-orange-500/[0.03]"
            )}
        >
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] flex items-center justify-center">
                    <Upload className="w-6 h-6 text-orange-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm sm:text-lg font-bold text-white">
                        Drop a PDF or tap to load locally
                    </h3>
                    <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                        {contextHint} Supports PDFs up to {MAX_PDF_FILE_SIZE_MB} MB with
                        zero server uploads.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            singleFileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-orange-600/20 min-h-[40px]"
                    >
                        Choose PDF File
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateSampleContract();
                        }}
                        className="px-4 py-2 rounded-xl bg-[rgb(22,22,34)] hover:bg-[rgb(30,30,48)] border border-[rgb(45,45,68)] hover:border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 min-h-[40px]"
                    >
                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Generate Sample 3-Page Contract PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActivePdfHeader = () => {
        if (!activePdf) return null;
        return (
            <div className="p-3 sm:p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[230px] sm:max-w-md">
                                {activePdf.name}
                            </p>
                            {activePdf.isSample && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                                    Sample PDF
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-[rgb(130,130,165)] mt-0.5">
                            {activePdf.pageCount} page
                            {activePdf.pageCount === 1 ? "" : "s"} ·{" "}
                            {formatPdfFileSize(activePdf.size)} · Page 1:{" "}
                            {activePdf.firstPageSize.width}×
                            {activePdf.firstPageSize.height} pt
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => singleFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[rgb(22,22,34)] hover:bg-[rgb(30,30,48)] border border-[rgb(45,45,68)] text-xs font-semibold text-white transition-all min-h-[34px]"
                    >
                        Replace PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActivePdf(null);
                            if (singleFileInputRef.current) {
                                singleFileInputRef.current.value = "";
                            }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold inline-flex items-center gap-1 min-h-[34px]"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Hidden shared single-file input */}
            <input
                ref={singleFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSinglePdfFile(f);
                    e.target.value = "";
                }}
                className="hidden"
            />

            {/* ─── Top Studio Navigation & Privacy Bar ─────────────── */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* 4 Responsive Mode Tabs */}
                    <div
                        role="tablist"
                        aria-label="PDF Studio Modes"
                        className="flex flex-wrap gap-1.5"
                    >
                        {STUDIO_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isSelected = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setError(null);
                                    }}
                                    className={cn(
                                        "flex-1 sm:flex-initial min-w-[78px] px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border inline-flex items-center justify-center gap-1.5 min-h-[40px]",
                                        isSelected
                                            ? "bg-orange-500/20 border-orange-500 text-white shadow-sm"
                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(145,145,180)] hover:text-white"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-3.5 h-3.5 shrink-0",
                                            isSelected ? "text-orange-400" : "text-[rgb(120,120,155)]"
                                        )}
                                    />
                                    <span className="sm:hidden">{tab.shortLabel}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Sample Generator + Local Privacy Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={isBusy}
                            onClick={handleGenerateSampleContract}
                            className="px-3 py-2 rounded-xl bg-[rgb(22,22,34)] hover:bg-[rgb(30,30,48)] border border-[rgb(45,45,68)] hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5 min-h-[38px] disabled:opacity-50"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Generate Sample 3-Page Contract PDF</span>
                        </button>
                        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium min-h-[38px]">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>In-Browser · 0 Uploads</span>
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-[rgb(125,125,160)]">
                    {STUDIO_TABS.find((t) => t.id === activeTab)?.description}
                </p>
            </div>

            {/* ─── Busy Indicator ──────────────────────────────────── */}
            {isBusy && (
                <div
                    role="status"
                    className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-2.5 text-xs sm:text-sm text-orange-200"
                >
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400 shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{busyLabel}</span>
                    {burstProgress && (
                        <span className="font-mono text-xs font-bold text-cyan-300 shrink-0">
                            {burstProgress.current}/{burstProgress.total}
                        </span>
                    )}
                </div>
            )}

            {/* ─── Error Banner ─────────────────────────────────────── */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm text-rose-300"
                >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 break-words">{error}</div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        aria-label="Dismiss error"
                        className="p-1 rounded-lg hover:bg-white/5 text-rose-300 shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ─── Success Notice Banner ────────────────────────────── */}
            {notice && !error && (
                <div
                    role="status"
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs sm:text-sm text-emerald-200"
                >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{notice.title}</p>
                        <p className="text-xs text-emerald-300/90 mt-0.5 break-words">
                            {notice.detail}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotice(null)}
                        aria-label="Dismiss notice"
                        className="p-1 rounded-lg hover:bg-white/5 text-emerald-300 shrink-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODE 1: MERGE & ORGANIZE PDFs                         */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "merge" && (
                <div className="space-y-4">
                    <input
                        ref={mergeFileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                            if (e.target.files) {
                                handleMergeFilesAdd(e.target.files);
                            }
                            e.target.value = "";
                        }}
                        className="hidden"
                    />

                    {/* Multi-file Dropzone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsMergeDragOver(true);
                        }}
                        onDragLeave={() => setIsMergeDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsMergeDragOver(false);
                            if (e.dataTransfer.files?.length) {
                                handleMergeFilesAdd(e.dataTransfer.files);
                            }
                        }}
                        onClick={() => mergeFileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all",
                            isMergeDragOver
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-[rgb(45,45,65)] bg-[rgb(14,14,22)] hover:border-orange-500/45 hover:bg-orange-500/[0.03]"
                        )}
                    >
                        <div className="flex flex-col items-center gap-2.5 max-w-md mx-auto">
                            <div className="w-11 h-11 rounded-2xl bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] flex items-center justify-center">
                                <FilePlus2 className="w-5 h-5 text-orange-400" />
                            </div>
                            <p className="text-sm sm:text-base font-bold text-white">
                                Drop PDFs here to add to Merge Queue
                            </p>
                            <p className="text-xs text-[rgb(130,130,165)]">
                                Up to {MAX_MERGE_FILES} PDFs · Max {MAX_PDF_FILE_SIZE_MB} MB each
                                · Reorder or rotate before merging.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        mergeFileInputRef.current?.click();
                                    }}
                                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all min-h-[38px]"
                                >
                                    Add PDF Files ({mergeQueue.length}/{MAX_MERGE_FILES})
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateSampleContract();
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-[rgb(22,22,34)] hover:bg-[rgb(30,30,48)] border border-[rgb(45,45,68)] text-cyan-300 text-xs font-semibold transition-all min-h-[38px]"
                                >
                                    + Add Sample PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Queue List */}
                    {mergeQueue.length > 0 && (
                        <div className="p-3 sm:p-4 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs font-semibold text-white">
                                    Queue: {mergeQueue.length} file
                                    {mergeQueue.length === 1 ? "" : "s"} · {totalMergePages} total
                                    page{totalMergePages === 1 ? "" : "s"} (
                                    {formatPdfFileSize(totalMergeBytes)})
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMergeQueue([])}
                                    className="text-xs text-rose-300 hover:text-rose-200 inline-flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Clear Queue</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {mergeQueue.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="p-3 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(40,40,60)] flex flex-col md:flex-row md:items-center justify-between gap-2.5"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-white truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] text-[rgb(125,125,160)]">
                                                    {item.pageCount} page
                                                    {item.pageCount === 1 ? "" : "s"} ·{" "}
                                                    {formatPdfFileSize(item.size)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                            {/* Rotation Selector */}
                                            <div
                                                className="inline-flex items-center rounded-lg bg-[rgb(12,12,20)] border border-[rgb(42,42,64)] p-0.5"
                                                aria-label={`Rotate pages for ${item.name}`}
                                            >
                                                <RotateCw className="w-3 h-3 text-[rgb(110,110,145)] ml-1.5 mr-1 shrink-0" />
                                                {ROTATION_OPTIONS.map((deg) => (
                                                    <button
                                                        key={deg}
                                                        type="button"
                                                        onClick={() =>
                                                            setItemRotation(item.id, deg)
                                                        }
                                                        className={cn(
                                                            "px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
                                                            item.rotationDelta === deg
                                                                ? "bg-orange-500/25 text-orange-200"
                                                                : "text-[rgb(125,125,160)] hover:text-white"
                                                        )}
                                                    >
                                                        {deg}°
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Reorder & Remove */}
                                            <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() => moveMergeItem(idx, -1)}
                                                aria-label={`Move ${item.name} up`}
                                                className="p-2 rounded-lg bg-[rgb(24,24,38)] border border-[rgb(45,45,68)] text-[rgb(165,165,200)] hover:text-white disabled:opacity-35"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={idx === mergeQueue.length - 1}
                                                onClick={() => moveMergeItem(idx, 1)}
                                                aria-label={`Move ${item.name} down`}
                                                className="p-2 rounded-lg bg-[rgb(24,24,38)] border border-[rgb(45,45,68)] text-[rgb(165,165,200)] hover:text-white disabled:opacity-35"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeMergeItem(item.id)}
                                                aria-label={`Remove ${item.name}`}
                                                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Merge Output Controls */}
                            <div className="pt-2 border-t border-[rgb(32,32,50)] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                                <div className="flex-1 min-w-0 space-y-1">
                                    <label
                                        htmlFor="merge-output-name"
                                        className="block text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]"
                                    >
                                        Output Filename
                                    </label>
                                    <input
                                        id="merge-output-name"
                                        type="text"
                                        value={mergeOutputName}
                                        onChange={(e) => setMergeOutputName(e.target.value)}
                                        placeholder="merged-document"
                                        className="w-full min-w-0 px-3 py-2 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={isBusy || mergeQueue.length === 0}
                                    onClick={handleExportMergedPdf}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-orange-600/25 inline-flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4 shrink-0" />
                                    <span>
                                        {mergeQueue.length === 1
                                            ? `Export Rotated PDF (${totalMergePages}p)`
                                            : `Merge ${mergeQueue.length} PDFs (${totalMergePages}p)`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODE 2: SPLIT & EXTRACT PAGES                         */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "split" && (
                <div className="space-y-4">
                    {!activePdf ? (
                        renderSinglePdfUploadCard(
                            "Extract custom page ranges into a new PDF or burst every page into a .ZIP."
                        )
                    ) : (
                        <>
                            {renderActivePdfHeader()}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Custom Page Range Extractor */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Scissors className="w-4 h-4 text-orange-400 shrink-0" />
                                            <h3 className="text-sm sm:text-base font-bold text-white">
                                                Extract Custom Pages
                                            </h3>
                                        </div>
                                        <p className="text-xs text-[rgb(130,130,165)]">
                                            Enter 1-based page numbers or hyphenated ranges from 1 to{" "}
                                            {activePdf.pageCount} (e.g.,{" "}
                                            <code className="text-cyan-300">1-3, 5</code>).
                                        </p>

                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="split-range-input"
                                                className="block text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]"
                                            >
                                                Pages to Extract
                                            </label>
                                            <input
                                                id="split-range-input"
                                                type="text"
                                                value={splitRangeInput}
                                                onChange={(e) =>
                                                    setSplitRangeInput(e.target.value)
                                                }
                                                placeholder="1-3, 5"
                                                className="w-full min-w-0 px-3 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                                            />
                                        </div>

                                        {/* Presets */}
                                        <div className="flex flex-wrap gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => applySplitPreset("first")}
                                                className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-[11px] font-medium text-[rgb(175,175,210)] hover:text-white"
                                            >
                                                First Page
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applySplitPreset("last")}
                                                className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-[11px] font-medium text-[rgb(175,175,210)] hover:text-white"
                                            >
                                                Last Page
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applySplitPreset("odd")}
                                                className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-[11px] font-medium text-[rgb(175,175,210)] hover:text-white"
                                            >
                                                Odd Pages
                                            </button>
                                            {activePdf.pageCount > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => applySplitPreset("even")}
                                                    className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-[11px] font-medium text-[rgb(175,175,210)] hover:text-white"
                                                >
                                                    Even Pages
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => applySplitPreset("all")}
                                                className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-[11px] font-medium text-[rgb(175,175,210)] hover:text-white"
                                            >
                                                All ({activePdf.pageCount})
                                            </button>
                                        </div>

                                        {/* Live Validation Summary */}
                                        {parsedSplitRange && (
                                            <p
                                                className={cn(
                                                    "text-xs px-3 py-2 rounded-xl border",
                                                    parsedSplitRange.ok
                                                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                                        : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                                                )}
                                            >
                                                {parsedSplitRange.ok
                                                    ? `Will extract ${
                                                          parsedSplitRange.pages.length
                                                      } page${
                                                          parsedSplitRange.pages.length === 1
                                                              ? ""
                                                              : "s"
                                                      }: ${parsedSplitRange.pages
                                                          .slice(0, 12)
                                                          .join(", ")}${
                                                          parsedSplitRange.pages.length > 12
                                                              ? "..."
                                                              : ""
                                                      }`
                                                    : parsedSplitRange.error}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isBusy || !parsedSplitRange?.ok}
                                        onClick={handleExtractRangePdf}
                                        className="w-full px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-orange-600/20 inline-flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4 shrink-0" />
                                        <span>Extract Selected Pages (.PDF)</span>
                                    </button>
                                </div>

                                {/* Burst All Pages to ZIP */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FileArchive className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <h3 className="text-sm sm:text-base font-bold text-white">
                                                Burst All Pages to ZIP
                                            </h3>
                                        </div>
                                        <p className="text-xs text-[rgb(130,130,165)] leading-relaxed">
                                            Separates every single page of{" "}
                                            <strong className="text-white">
                                                {activePdf.name}
                                            </strong>{" "}
                                            into individual PDF documents packaged into one
                                            client-side{" "}
                                            <code className="text-cyan-300">.zip</code>{" "}
                                            archive.
                                        </p>

                                        <div className="p-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(32,32,50)] space-y-1 text-xs font-mono text-[rgb(145,145,180)]">
                                            <div>
                                                Archive contents ({activePdf.pageCount} files):
                                            </div>
                                            <div className="text-cyan-300">
                                                •{" "}
                                                {formatBurstPageFilename(
                                                    1,
                                                    activePdf.pageCount
                                                )}
                                            </div>
                                            {activePdf.pageCount >= 2 && (
                                                <div className="text-cyan-300">
                                                    •{" "}
                                                    {formatBurstPageFilename(
                                                        2,
                                                        activePdf.pageCount
                                                    )}
                                                </div>
                                            )}
                                            {activePdf.pageCount >= 3 && (
                                                <div className="text-[rgb(105,105,140)]">
                                                    ... up to{" "}
                                                    {formatBurstPageFilename(
                                                        activePdf.pageCount,
                                                        activePdf.pageCount
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={handleBurstAllToZip}
                                        className="w-full px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 inline-flex items-center justify-center gap-2 min-h-[42px] disabled:opacity-50"
                                    >
                                        <FileArchive className="w-4 h-4 shrink-0" />
                                        <span>
                                            Burst All {activePdf.pageCount} Pages to .ZIP
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODE 3: SIGN & STAMP PDF                              */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "sign" && (
                <div className="space-y-4">
                    {!activePdf ? (
                        renderSinglePdfUploadCard(
                            "Draw a transparent handwritten signature or upload a PNG stamp and place it cleanly on your PDF."
                        )
                    ) : (
                        <>
                            {renderActivePdfHeader()}

                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
                                {/* Left: Draw or Upload Transparent Signature */}
                                <div className="p-3.5 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4 min-w-0">
                                    {/* Signature Source Switch */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setSignatureSource("draw")}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 min-h-[36px]",
                                                    signatureSource === "draw"
                                                        ? "bg-orange-500/20 border-orange-500 text-white"
                                                        : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(145,145,180)] hover:text-white"
                                                )}
                                            >
                                                <PenTool className="w-3.5 h-3.5" />
                                                <span>Draw Signature</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSignatureSource("upload")
                                                }
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all inline-flex items-center gap-1.5 min-h-[36px]",
                                                    signatureSource === "upload"
                                                        ? "bg-orange-500/20 border-orange-500 text-white"
                                                        : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(145,145,180)] hover:text-white"
                                                )}
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>Upload PNG Stamp</span>
                                            </button>
                                        </div>

                                        {signatureSource === "draw" && (
                                            <button
                                                type="button"
                                                onClick={handleClearSignaturePad}
                                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px]"
                                            >
                                                <Eraser className="w-3.5 h-3.5" />
                                                <span>Clear</span>
                                            </button>
                                        )}
                                    </div>

                                    {signatureSource === "draw" ? (
                                        <div className="space-y-3">
                                            {/* Ink Colors & Stroke Width */}
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(120,120,155)]">
                                                        Ink:
                                                    </span>
                                                    {SIGNATURE_INK_COLORS.map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setInkColor(c.value)
                                                            }
                                                            className={cn(
                                                                "px-2.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-all",
                                                                inkColor === c.value
                                                                    ? "bg-[rgb(28,28,44)] border-orange-500 text-white"
                                                                    : "bg-[rgb(18,18,28)] border-[rgb(42,42,64)] text-[rgb(140,140,175)] hover:text-white"
                                                            )}
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                                                                style={{
                                                                    backgroundColor: c.value,
                                                                }}
                                                            />
                                                            <span>{c.label}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="flex items-center gap-1 rounded-lg bg-[rgb(18,18,28)] border border-[rgb(42,42,64)] p-0.5">
                                                    {[
                                                        { label: "Fine", w: 2 },
                                                        { label: "Med", w: 3 },
                                                        { label: "Bold", w: 5 },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.label}
                                                            type="button"
                                                            onClick={() =>
                                                                setPenWidth(opt.w)
                                                            }
                                                            className={cn(
                                                                "px-2 py-1 rounded-md text-[11px] font-semibold",
                                                                penWidth === opt.w
                                                                    ? "bg-orange-500/25 text-orange-200"
                                                                    : "text-[rgb(125,125,160)] hover:text-white"
                                                            )}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* High-Contrast White Backing with Transparent Ink Canvas */}
                                            <div
                                                ref={sigBoxRef}
                                                className="relative w-full h-52 sm:h-60 rounded-2xl bg-white border-2 border-[rgb(60,60,85)] overflow-hidden shadow-inner cursor-crosshair"
                                            >
                                                <div className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-dashed border-slate-300" />
                                                <canvas
                                                    ref={sigCanvasRef}
                                                    onPointerDown={handleSigPointerDown}
                                                    onPointerMove={handleSigPointerMove}
                                                    onPointerUp={finishActiveStroke}
                                                    onPointerCancel={finishActiveStroke}
                                                    style={{ touchAction: "none" }}
                                                    className="w-full h-full block"
                                                />
                                                {strokes.length === 0 && (
                                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400 px-4 text-center">
                                                        <PenTool className="w-7 h-7 opacity-35 mb-1.5" />
                                                        <p className="text-xs font-medium opacity-75">
                                                            Sign inside this box (transparent
                                                            background exported automatically)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <input
                                                ref={stampFileInputRef}
                                                type="file"
                                                accept="image/png,.png"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleStampUpload(f);
                                                    e.target.value = "";
                                                }}
                                                className="hidden"
                                            />

                                            {uploadedStamp ? (
                                                <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(42,42,64)] space-y-3">
                                                    <div
                                                        style={CHECKERBOARD_STYLE}
                                                        className="rounded-xl p-4 flex items-center justify-center min-h-[150px] border border-[rgb(45,45,65)]"
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={uploadedStamp.previewUrl}
                                                            alt="Uploaded PNG signature stamp"
                                                            className="max-h-36 w-auto object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <span className="text-white font-semibold truncate">
                                                            {uploadedStamp.name} (
                                                            {uploadedStamp.width}×
                                                            {uploadedStamp.height} px)
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    stampFileInputRef.current?.click()
                                                                }
                                                                className="px-2.5 py-1 rounded-lg bg-[rgb(22,22,34)] border border-[rgb(45,45,68)] text-white"
                                                            >
                                                                Replace PNG
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    revokeUploadedStamp();
                                                                    setUploadedStamp(null);
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        stampFileInputRef.current?.click()
                                                    }
                                                    className="w-full border-2 border-dashed border-[rgb(45,45,65)] hover:border-orange-500/50 rounded-2xl p-8 text-center transition-all bg-[rgb(10,10,15)]"
                                                >
                                                    <Upload className="w-7 h-7 text-orange-400 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-white">
                                                        Choose Transparent PNG Signature /
                                                        Stamp
                                                    </p>
                                                    <p className="text-xs text-[rgb(125,125,160)] mt-1">
                                                        Max {MAX_SIGNATURE_IMAGE_SIZE_MB} MB
                                                        .png image. Transparency is preserved.
                                                    </p>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Placement, Scale, Page Target & Export */}
                                <div className="p-3.5 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4">
                                    {/* Visual Page Wireframe Preview */}
                                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(32,32,50)]">
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs font-bold text-white">
                                                Placement Preview
                                            </p>
                                            <p className="text-[11px] text-[rgb(125,125,160)]">
                                                {
                                                    SIGNATURE_ANCHOR_OPTIONS.find(
                                                        (a) => a.id === sigAnchor
                                                    )?.label
                                                }{" "}
                                                · {SIGNATURE_SCALE_CONFIG[sigScale].label}
                                            </p>
                                            {stampDateUnderneath && (
                                                <p className="text-[10px] text-cyan-300">
                                                    + Date stamped underneath
                                                </p>
                                            )}
                                        </div>
                                        <div
                                            aria-hidden="true"
                                            className="relative w-14 h-[72px] rounded bg-white/95 border border-[rgb(75,75,105)] shrink-0 shadow"
                                        >
                                            <div className="absolute inset-x-2 top-2 space-y-1">
                                                <div className="h-1 bg-slate-200 rounded w-3/4" />
                                                <div className="h-1 bg-slate-200 rounded w-full" />
                                                <div className="h-1 bg-slate-200 rounded w-5/6" />
                                            </div>
                                            <div
                                                className="absolute rounded-sm border border-orange-600 bg-orange-500/35 transition-all"
                                                style={{
                                                    left: `${miniPreviewRect.leftPct}%`,
                                                    bottom: `${miniPreviewRect.bottomPct}%`,
                                                    width: `${Math.max(
                                                        14,
                                                        miniPreviewRect.widthPct
                                                    )}%`,
                                                    height: `${Math.max(
                                                        10,
                                                        miniPreviewRect.heightPct
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Page Target */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]">
                                            Target Page(s)
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {(
                                                [
                                                    { id: "first", label: "First Page" },
                                                    { id: "last", label: "Last Page" },
                                                    { id: "all", label: "All Pages" },
                                                    { id: "custom", label: "Custom Page #" },
                                                ] as {
                                                    id: SignaturePageTarget;
                                                    label: string;
                                                }[]
                                            ).map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSigPageTarget(opt.id)
                                                    }
                                                    className={cn(
                                                        "px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                                                        sigPageTarget === opt.id
                                                            ? "bg-orange-500/20 border-orange-500 text-white"
                                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(140,140,175)] hover:text-white"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>

                                        {sigPageTarget === "custom" && (
                                            <div className="pt-1 flex items-center gap-2">
                                                <label
                                                    htmlFor="sig-custom-page"
                                                    className="text-xs text-[rgb(140,140,175)] shrink-0"
                                                >
                                                    Page # (1–{activePdf.pageCount}):
                                                </label>
                                                <input
                                                    id="sig-custom-page"
                                                    type="number"
                                                    min={1}
                                                    max={activePdf.pageCount}
                                                    value={sigCustomPage}
                                                    onChange={(e) =>
                                                        setSigCustomPage(
                                                            Math.max(
                                                                1,
                                                                Math.min(
                                                                    activePdf.pageCount,
                                                                    Number(e.target.value) ||
                                                                        1
                                                                )
                                                            )
                                                        )
                                                    }
                                                    className="w-20 px-2.5 py-1.5 rounded-lg bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-xs font-mono text-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Placement Anchor */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]">
                                            Placement Anchor
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {SIGNATURE_ANCHOR_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setSigAnchor(opt.id)}
                                                    className={cn(
                                                        "px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all",
                                                        sigAnchor === opt.id
                                                            ? "bg-orange-500/20 border-orange-500 text-white"
                                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(140,140,175)] hover:text-white"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Signature Size */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]">
                                            Signature Size
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(
                                                ["small", "medium", "large"] as SignatureScale[]
                                            ).map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setSigScale(s)}
                                                    className={cn(
                                                        "px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                                                        sigScale === s
                                                            ? "bg-orange-500/20 border-orange-500 text-white"
                                                            : "bg-[rgb(20,20,32)] border-[rgb(45,45,68)] text-[rgb(140,140,175)] hover:text-white"
                                                    )}
                                                >
                                                    {SIGNATURE_SCALE_CONFIG[s].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Date Stamp Checkbox */}
                                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(35,35,55)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={stampDateUnderneath}
                                            onChange={(e) =>
                                                setStampDateUnderneath(e.target.checked)
                                            }
                                            className="mt-0.5 accent-orange-500 w-4 h-4 shrink-0"
                                        />
                                        <div className="text-xs">
                                            <span className="font-semibold text-white block">
                                                Stamp today&apos;s date underneath
                                            </span>
                                            <span className="text-[11px] text-[rgb(125,125,160)]">
                                                Adds &quot;Signed{" "}
                                                {new Date().toISOString().slice(0, 10)}&quot; below
                                                the signature.
                                            </span>
                                        </div>
                                    </label>

                                    <button
                                        type="button"
                                        disabled={isBusy || !hasSignatureReady}
                                        onClick={handleSignPdfDownload}
                                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-orange-600/25 inline-flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-45"
                                    >
                                        <Download className="w-4 h-4 shrink-0" />
                                        <span>Sign &amp; Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════ */}
            {/* MODE 4: METADATA PRIVACY CLEANER & EDITOR             */}
            {/* ══════════════════════════════════════════════════════ */}
            {activeTab === "metadata" && (
                <div className="space-y-4">
                    {!activePdf ? (
                        renderSinglePdfUploadCard(
                            "Inspect hidden PDF Author, Creator, Producer, and XML metadata tags and scrub them 100% locally."
                        )
                    ) : (
                        <>
                            {renderActivePdfHeader()}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                {/* Left: Existing Metadata Inspection */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <FileSearch className="w-4 h-4 text-cyan-400 shrink-0" />
                                            <h3 className="text-sm sm:text-base font-bold text-white">
                                                Detected PDF Metadata
                                            </h3>
                                        </div>
                                        <span
                                            className={cn(
                                                "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                                                metadataAuditCount > 0
                                                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                            )}
                                        >
                                            {metadataAuditCount > 0
                                                ? `${metadataAuditCount} field(s) present`
                                                : "Clean — 0 tags found"}
                                        </span>
                                    </div>

                                    <div className="divide-y divide-[rgb(30,30,46)] rounded-xl bg-[rgb(10,10,15)] border border-[rgb(32,32,50)]">
                                        {[
                                            { label: "Title", value: activePdf.metadata.title },
                                            { label: "Author", value: activePdf.metadata.author },
                                            {
                                                label: "Subject",
                                                value: activePdf.metadata.subject,
                                            },
                                            {
                                                label: "Keywords",
                                                value: activePdf.metadata.keywords,
                                            },
                                            {
                                                label: "Creator",
                                                value: activePdf.metadata.creator,
                                            },
                                            {
                                                label: "Producer",
                                                value: activePdf.metadata.producer,
                                            },
                                            {
                                                label: "Created",
                                                value: activePdf.metadata.creationDate ?? "",
                                            },
                                            {
                                                label: "Modified",
                                                value:
                                                    activePdf.metadata.modificationDate ?? "",
                                            },
                                            {
                                                label: "XMP Stream",
                                                value: activePdf.metadata.hasXmpMetadata
                                                    ? "Embedded XML metadata stream detected"
                                                    : "",
                                            },
                                        ].map((row) => (
                                            <div
                                                key={row.label}
                                                className="px-3 py-2 flex items-start justify-between gap-3 text-xs"
                                            >
                                                <span className="font-semibold text-[rgb(130,130,165)] shrink-0">
                                                    {row.label}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-right break-all",
                                                        row.value
                                                            ? "text-white font-mono"
                                                            : "text-[rgb(85,85,115)] italic"
                                                    )}
                                                >
                                                    {row.value || "None"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: 1-Click Strip Toggle & Custom Tag Editor */}
                                <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] space-y-4">
                                    <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 cursor-pointer">
                                        <div className="space-y-1">
                                            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span>Strip All Identifying Metadata</span>
                                            </span>
                                            <p className="text-[11px] text-emerald-200/85 leading-relaxed">
                                                Removes Title, Author, Subject, Keywords, Creator,
                                                Producer, timestamps, and XMP streams using{" "}
                                                <code>updateMetadata: false</code>.
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={stripAllMetadata}
                                            onChange={(e) =>
                                                setStripAllMetadata(e.target.checked)
                                            }
                                            className="mt-1 w-4 h-4 accent-emerald-500 shrink-0"
                                        />
                                    </label>

                                    {!stripAllMetadata && (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(130,130,165)]">
                                                    Custom Metadata Fields
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditableMeta({
                                                            title: "",
                                                            author: "",
                                                            subject: "",
                                                            keywords: "",
                                                            creator: "",
                                                            producer: "",
                                                        })
                                                    }
                                                    className="text-[11px] text-rose-300 hover:text-rose-200"
                                                >
                                                    Clear All Fields
                                                </button>
                                            </div>

                                            {(
                                                [
                                                    { key: "title", label: "Title" },
                                                    { key: "author", label: "Author" },
                                                    { key: "subject", label: "Subject" },
                                                    {
                                                        key: "keywords",
                                                        label: "Keywords (comma-separated)",
                                                    },
                                                    { key: "creator", label: "Creator" },
                                                    { key: "producer", label: "Producer" },
                                                ] as {
                                                    key: keyof EditableMetadata;
                                                    label: string;
                                                }[]
                                            ).map((field) => (
                                                <div key={field.key} className="space-y-1">
                                                    <label
                                                        htmlFor={`meta-${field.key}`}
                                                        className="block text-[11px] text-[rgb(140,140,175)]"
                                                    >
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        id={`meta-${field.key}`}
                                                        type="text"
                                                        value={editableMeta[field.key]}
                                                        onChange={(e) =>
                                                            setEditableMeta((prev) => ({
                                                                ...prev,
                                                                [field.key]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder={`Leave blank to omit ${field.label}`}
                                                        className="w-full min-w-0 px-3 py-2 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-xs text-white focus:outline-none focus:border-cyan-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={isBusy}
                                        onClick={handleExportMetadataPdf}
                                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 inline-flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                                    >
                                        <Download className="w-4 h-4 shrink-0" />
                                        <span>
                                            {stripAllMetadata
                                                ? "Strip Metadata & Download Clean PDF"
                                                : "Save Custom Metadata & Download PDF"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
