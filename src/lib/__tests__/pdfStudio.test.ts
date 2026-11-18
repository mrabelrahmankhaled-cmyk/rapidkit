import test from "node:test";
import assert from "node:assert";
import { getToolBySlug, getToolsByCategory, TOOLS } from "../../data/tools.ts";
import { AFFILIATES } from "../../data/affiliates.ts";
import {
    MAX_MERGE_FILES,
    MAX_PDF_FILE_SIZE_BYTES,
    buildPdfOutputFilename,
    computeSignaturePlacementRect,
    formatBurstPageFilename,
    normalizeRotationDelta,
    parseKeywordsInput,
    parsePageRangeString,
    resolveSignaturePageIndices,
    validatePdfFile,
    validateSignaturePngFile,
} from "../pdfStudio.ts";

test("1. pdf-studio registry entry, SEO metadata constraints, and reciprocal linking", () => {
    const tool = getToolBySlug("pdf-studio");
    assert.ok(tool, "pdf-studio should be registered in TOOLS");
    assert.strictEqual(tool.categoryId, "productivity");
    assert.strictEqual(tool.name, "PDF Merge, Split & Sign Studio");
    assert.strictEqual(tool.icon, "FileCheck");
    assert.strictEqual(tool.isNew, true);
    assert.strictEqual(tool.isFeatured, true);
    assert.strictEqual(tool.isPopular, true);

    const productivityTools = getToolsByCategory("productivity");
    assert.ok(productivityTools.some((t) => t.slug === "pdf-studio"));

    assert.ok(tool.seo.title.length > 0 && tool.seo.title.length < 58);
    assert.ok(!/RapidKit/i.test(tool.seo.title));
    assert.ok(
        tool.seo.description.length >= 145 && tool.seo.description.length <= 160,
        `SEO description length ${tool.seo.description.length} must be 145-160`
    );

    assert.ok(tool.seo.keywords.includes("merge pdf online free no upload"));
    assert.ok(tool.seo.keywords.includes("split pdf pages in browser"));
    assert.ok(tool.seo.keywords.includes("sign pdf online free without uploading"));

    assert.strictEqual(tool.howToSteps.length, 4);
    assert.strictEqual(tool.useCases?.length, 4);
    assert.strictEqual(tool.faqs.length, 4);

    assert.deepStrictEqual(tool.relatedToolSlugs, [
        "signature-pad",
        "image-compressor",
        "background-remover",
        "word-counter",
    ]);

    for (const relSlug of tool.relatedToolSlugs) {
        assert.ok(
            TOOLS.some((t) => t.slug === relSlug),
            `Related tool "${relSlug}" must exist in TOOLS`
        );
    }

    for (const affId of tool.affiliateIds ?? []) {
        assert.ok(AFFILIATES[affId], `Affiliate "${affId}" must exist`);
    }

    // Reciprocal link from signature-pad -> pdf-studio
    const sigPad = getToolBySlug("signature-pad");
    assert.ok(sigPad, "signature-pad must exist in TOOLS");
    assert.ok(
        sigPad.relatedToolSlugs.includes("pdf-studio"),
        "signature-pad should link back to pdf-studio"
    );
});

test("2. validatePdfFile & validateSignaturePngFile enforce MIME, .pdf fallback, 50 MB limit, and 20-file queue cap", () => {
    assert.deepStrictEqual(
        validatePdfFile({ name: "contract.pdf", type: "application/pdf", size: 2048 }),
        { ok: true }
    );
    assert.deepStrictEqual(
        validatePdfFile({
            name: "scan.PDF",
            type: "",
            size: MAX_PDF_FILE_SIZE_BYTES,
        }),
        { ok: true }
    );
    assert.deepStrictEqual(
        validatePdfFile({
            name: "mobile-doc.pdf",
            type: "application/octet-stream",
            size: 1024,
        }),
        { ok: true }
    );

    // Unsupported MIME / extension
    const imgErr = validatePdfFile({ name: "photo.png", type: "image/png", size: 1024 });
    assert.strictEqual(imgErr.ok, false);
    assert.ok(imgErr.error.includes("PDF"));

    const txtErr = validatePdfFile({ name: "notes.txt", type: "", size: 1024 });
    assert.strictEqual(txtErr.ok, false);

    // Empty and oversized checks
    const emptyErr = validatePdfFile({
        name: "empty.pdf",
        type: "application/pdf",
        size: 0,
    });
    assert.strictEqual(emptyErr.ok, false);

    const overErr = validatePdfFile({
        name: "giant.pdf",
        type: "application/pdf",
        size: MAX_PDF_FILE_SIZE_BYTES + 1,
    });
    assert.strictEqual(overErr.ok, false);
    assert.ok(overErr.error.includes("50 MB"));

    // Queue capacity enforcement (max 20 files)
    assert.deepStrictEqual(
        validatePdfFile(
            { name: "last.pdf", type: "application/pdf", size: 512 },
            MAX_MERGE_FILES - 1
        ),
        { ok: true }
    );
    const queueFullErr = validatePdfFile(
        { name: "overflow.pdf", type: "application/pdf", size: 512 },
        MAX_MERGE_FILES
    );
    assert.strictEqual(queueFullErr.ok, false);
    assert.ok(queueFullErr.error.includes("20"));

    // Signature PNG validation
    assert.deepStrictEqual(
        validateSignaturePngFile({ name: "sig.png", type: "image/png", size: 1024 }),
        { ok: true }
    );
    const jpgStampErr = validateSignaturePngFile({
        name: "sig.jpg",
        type: "image/jpeg",
        size: 1024,
    });
    assert.strictEqual(jpgStampErr.ok, false);
});

test("3. parsePageRangeString parses complex ranges, deduplicates, sorts, and reports structured errors", () => {
    const complex = parsePageRangeString("7-9, 1-3, 5, 2, 8-8", 10);
    assert.deepStrictEqual(complex, {
        ok: true,
        pages: [1, 2, 3, 5, 7, 8, 9],
        zeroBasedIndices: [0, 1, 2, 4, 6, 7, 8],
    });

    const spaced = parsePageRangeString(" 4 - 6 , 1 ", 6);
    assert.deepStrictEqual(spaced, {
        ok: true,
        pages: [1, 4, 5, 6],
        zeroBasedIndices: [0, 3, 4, 5],
    });

    // Edge & invalid inputs
    const emptyErr = parsePageRangeString("   ", 5);
    assert.strictEqual(emptyErr.ok, false);

    const commaHoleErr = parsePageRangeString("1,,3", 5);
    assert.strictEqual(commaHoleErr.ok, false);

    const invertedErr = parsePageRangeString("5-2", 10);
    assert.strictEqual(invertedErr.ok, false);
    assert.ok(invertedErr.error.includes("start page"));

    const outOfBoundsSingle = parsePageRangeString("1, 11", 10);
    assert.strictEqual(outOfBoundsSingle.ok, false);
    assert.ok(outOfBoundsSingle.error.includes("out of bounds"));

    const outOfBoundsRange = parsePageRangeString("8-12", 10);
    assert.strictEqual(outOfBoundsRange.ok, false);
    assert.ok(outOfBoundsRange.error.includes("exceeds total page count"));

    const zeroPage = parsePageRangeString("0-2", 5);
    assert.strictEqual(zeroPage.ok, false);

    const malformed = parsePageRangeString("1-3-5", 10);
    assert.strictEqual(malformed.ok, false);

    const alpha = parsePageRangeString("1, two", 10);
    assert.strictEqual(alpha.ok, false);

    const badTotal = parsePageRangeString("1", 0);
    assert.strictEqual(badTotal.ok, false);
});

test("4. computeSignaturePlacementRect respects bottom-left PDF coordinates, aspect ratio, scale, and anchors", () => {
    const letter = { width: 612, height: 792 };
    const sigRatio = 2.5; // wide signature (e.g., 500x200)

    const small = computeSignaturePlacementRect(letter, sigRatio, "small", "bottom-right");
    const medium = computeSignaturePlacementRect(letter, sigRatio, "medium", "bottom-right");
    const large = computeSignaturePlacementRect(letter, sigRatio, "large", "bottom-right");

    assert.ok(small.width < medium.width && medium.width < large.width);
    assert.ok(Math.abs(medium.width / medium.height - sigRatio) < 1e-9);

    const bottomLeft = computeSignaturePlacementRect(letter, sigRatio, "medium", "bottom-left");
    const bottomCenter = computeSignaturePlacementRect(letter, sigRatio, "medium", "bottom-center");
    const bottomRight = computeSignaturePlacementRect(letter, sigRatio, "medium", "bottom-right");
    const topRight = computeSignaturePlacementRect(letter, sigRatio, "medium", "top-right");
    const center = computeSignaturePlacementRect(letter, sigRatio, "medium", "center");

    // PDF coordinate system (0,0) is bottom-left:
    // Moving left -> right increases x
    assert.ok(bottomLeft.x < bottomCenter.x);
    assert.ok(bottomCenter.x < bottomRight.x);

    // Bottom anchors share bottom margin y
    assert.strictEqual(bottomLeft.y, bottomRight.y);
    assert.strictEqual(bottomCenter.y, bottomRight.y);

    // Top-right has strictly higher y than center and bottom-right
    assert.ok(topRight.y > center.y);
    assert.ok(center.y > bottomRight.y);
    assert.strictEqual(topRight.x, bottomRight.x);

    // Center sits symmetrically in the page center
    assert.ok(Math.abs(center.x + center.width / 2 - letter.width / 2) < 1e-9);
    assert.ok(Math.abs(center.y + center.height / 2 - letter.height / 2) < 1e-9);

    // Extra date-stamp bottom margin lifts y upward from bottom edge
    const withDateMargin = computeSignaturePlacementRect(
        letter,
        sigRatio,
        "medium",
        "bottom-right",
        { bottomExtraMarginPt: 14 }
    );
    assert.ok(withDateMargin.y > bottomRight.y);

    // Extreme aspect ratio tall stamp stays cleanly inside page bounds
    const tallLandscape = computeSignaturePlacementRect(
        { width: 400, height: 180 },
        0.25,
        "large",
        "top-right"
    );
    assert.ok(tallLandscape.x >= 0);
    assert.ok(tallLandscape.y >= 0);
    assert.ok(tallLandscape.x + tallLandscape.width <= 400 + 1e-9);
    assert.ok(tallLandscape.y + tallLandscape.height <= 180 + 1e-9);
    assert.ok(Math.abs(tallLandscape.width / tallLandscape.height - 0.25) < 1e-9);

    assert.throws(() => computeSignaturePlacementRect({ width: 0, height: 792 }, 2, "medium", "center"));
    assert.throws(() => computeSignaturePlacementRect(letter, 0, "medium", "center"));
});

test("5. buildPdfOutputFilename, burst naming, rotation, keywords, and page targeting helpers", () => {
    assert.strictEqual(
        buildPdfOutputFilename("My Contract (2026).PDF", "signed", "pdf"),
        "My-Contract-(2026)-signed.pdf"
    );
    assert.strictEqual(
        buildPdfOutputFilename("Client: NDA/Final?.pdf", "split", "pdf"),
        "Client-NDA-Final-split.pdf"
    );
    assert.strictEqual(
        buildPdfOutputFilename("merged-document", "merged", "pdf"),
        "merged-document.pdf"
    );
    assert.strictEqual(
        buildPdfOutputFilename("Statement 2026.pdf", "burst", "zip"),
        "Statement-2026-burst.zip"
    );
    assert.strictEqual(
        buildPdfOutputFilename("   ", "cleaned", "pdf"),
        "document-cleaned.pdf"
    );

    assert.strictEqual(formatBurstPageFilename(1, 5), "page-01.pdf");
    assert.strictEqual(formatBurstPageFilename(9, 12), "page-09.pdf");
    assert.strictEqual(formatBurstPageFilename(5, 125), "page-005.pdf");

    assert.strictEqual(normalizeRotationDelta(360), 0);
    assert.strictEqual(normalizeRotationDelta(450), 90);
    assert.strictEqual(normalizeRotationDelta(-90), 270);

    assert.deepStrictEqual(parseKeywordsInput(" nda, , contract , 2026 "), [
        "nda",
        "contract",
        "2026",
    ]);

    assert.deepStrictEqual(resolveSignaturePageIndices("first", 4), {
        ok: true,
        indices: [0],
    });
    assert.deepStrictEqual(resolveSignaturePageIndices("last", 4), {
        ok: true,
        indices: [3],
    });
    assert.deepStrictEqual(resolveSignaturePageIndices("all", 3), {
        ok: true,
        indices: [0, 1, 2],
    });
    assert.deepStrictEqual(resolveSignaturePageIndices("custom", 4, 2), {
        ok: true,
        indices: [1],
    });
    assert.strictEqual(resolveSignaturePageIndices("custom", 4, 5).ok, false);
});

test("6. End-to-end pdf-lib + jszip pipeline: merge/rotate, split/burst ZIP, sign PNG, and true metadata strip", async () => {
    const { PDFDocument, PDFDict, PDFName, degrees } = await import("pdf-lib");
    const { default: JSZip } = await import("jszip");

    // 1. Create a 3-page PDF with identifying Info tags + XMP Metadata stream
    const src = await PDFDocument.create({ updateMetadata: false });
    src.setTitle("Secret Agreement");
    src.setAuthor("Alice Example");
    src.setCreator("Desktop App 1.0");
    src.setProducer("Acme PDF Engine");
    const dummyXmp = src.context.flateStream("<x:xmpmeta/>");
    src.catalog.set(PDFName.of("Metadata"), src.context.register(dummyXmp));
    src.addPage([612, 792]);
    src.addPage([612, 792]);
    src.addPage([612, 792]);
    const srcBytes = await src.save();

    // Verify reading with updateMetadata: false preserves original tags
    const loadedForAudit = await PDFDocument.load(srcBytes, { updateMetadata: false });
    assert.strictEqual(loadedForAudit.getPageCount(), 3);
    assert.strictEqual(loadedForAudit.getAuthor(), "Alice Example");
    assert.strictEqual(loadedForAudit.getProducer(), "Acme PDF Engine");
    assert.ok(loadedForAudit.catalog.get(PDFName.of("Metadata")));

    // 2. Merge + rotate 90 deg
    const merged = await PDFDocument.create();
    const firstCopy = await merged.copyPages(loadedForAudit, loadedForAudit.getPageIndices());
    for (const p of firstCopy) {
        p.setRotation(degrees(normalizeRotationDelta(p.getRotation().angle + 90)));
        merged.addPage(p);
    }
    const secondCopy = await merged.copyPages(loadedForAudit, [0]);
    merged.addPage(secondCopy[0]);
    const mergedLoaded = await PDFDocument.load(await merged.save(), { updateMetadata: false });
    assert.strictEqual(mergedLoaded.getPageCount(), 4);
    assert.strictEqual(normalizeRotationDelta(mergedLoaded.getPage(0).getRotation().angle), 90);
    assert.strictEqual(normalizeRotationDelta(mergedLoaded.getPage(3).getRotation().angle), 0);

    // 3. Split via parsePageRangeString("1, 3", 3)
    const parsed = parsePageRangeString("1, 3", 3);
    assert.strictEqual(parsed.ok, true);
    const splitDoc = await PDFDocument.create();
    const splitPages = await splitDoc.copyPages(loadedForAudit, parsed.zeroBasedIndices);
    for (const p of splitPages) splitDoc.addPage(p);
    const splitLoaded = await PDFDocument.load(await splitDoc.save(), { updateMetadata: false });
    assert.strictEqual(splitLoaded.getPageCount(), 2);

    // 4. Burst all 3 pages to ZIP
    const zip = new JSZip();
    for (let i = 0; i < 3; i += 1) {
        const single = await PDFDocument.create();
        const [cp] = await single.copyPages(loadedForAudit, [i]);
        single.addPage(cp);
        zip.file(formatBurstPageFilename(i + 1, 3), await single.save());
    }
    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const reopenedZip = await JSZip.loadAsync(zipBuffer);
    assert.ok(reopenedZip.file("page-01.pdf"));
    assert.ok(reopenedZip.file("page-02.pdf"));
    assert.ok(reopenedZip.file("page-03.pdf"));

    // 5. Sign PDF with 1x1 PNG + computeSignaturePlacementRect
    const tinyPngBase64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2dcAAAAASUVORK5CYII=";
    const pngBytes = Uint8Array.from(Buffer.from(tinyPngBase64, "base64"));
    const signDoc = await PDFDocument.load(srcBytes, { updateMetadata: false });
    const embedded = await signDoc.embedPng(pngBytes);
    const lastPage = signDoc.getPage(2);
    const rect = computeSignaturePlacementRect(lastPage.getSize(), 2.5, "medium", "bottom-right");
    lastPage.drawImage(embedded, rect);
    const signedBytes = await signDoc.save();
    assert.ok(signedBytes.byteLength > srcBytes.byteLength);

    // 6. Strip all metadata cleanly and verify zero identifying tags remain
    const stripDoc = await PDFDocument.load(srcBytes, { updateMetadata: false });
    const infoObj = stripDoc.context.lookup(stripDoc.context.trailerInfo.Info);
    if (infoObj instanceof PDFDict) {
        for (const key of [
            "Title",
            "Author",
            "Subject",
            "Keywords",
            "Creator",
            "Producer",
            "CreationDate",
            "ModDate",
        ]) {
            infoObj.delete(PDFName.of(key));
        }
    }
    stripDoc.catalog.delete(PDFName.of("Metadata"));
    delete stripDoc.context.trailerInfo.Info;
    const cleanedBytes = await stripDoc.save();

    const verifiedClean = await PDFDocument.load(cleanedBytes, { updateMetadata: false });
    assert.strictEqual(verifiedClean.getTitle(), undefined);
    assert.strictEqual(verifiedClean.getAuthor(), undefined);
    assert.strictEqual(verifiedClean.getSubject(), undefined);
    assert.strictEqual(verifiedClean.getKeywords(), undefined);
    assert.strictEqual(verifiedClean.getCreator(), undefined);
    assert.strictEqual(verifiedClean.getProducer(), undefined);
    assert.strictEqual(verifiedClean.getCreationDate(), undefined);
    assert.strictEqual(verifiedClean.getModificationDate(), undefined);
    assert.strictEqual(verifiedClean.catalog.get(PDFName.of("Metadata")), undefined);
});
