import test from "node:test";
import assert from "node:assert";
import { getToolBySlug, getToolsByCategory, TOOLS } from "../../data/tools.ts";
import { AFFILIATES } from "../../data/affiliates.ts";
import {
    GRADIENT_BG_PRESETS,
    MAX_FILE_SIZE_BYTES,
    MODEL_PRECISION_CONFIG,
    OUTLINE_OPTIONS,
    PROCESSING_MODE_CONFIG,
    SOLID_BG_PRESETS,
    buildOutputFilename,
    calculateConstrainedDimensions,
    computeAlphaBoundingBox,
    computeCoverDrawRect,
    computeLinearGradientCoords,
    createTelemetryState,
    detectWebGpuAvailable,
    formatFileSize,
    getDefaultModelPrecision,
    getDefaultProcessingMode,
    reduceTelemetryProgress,
    validateImageFile,
} from "../backgroundRemover.ts";

test("1. background-remover tool registry metadata, SEO constraints, and useCases", () => {
    const tool = getToolBySlug("background-remover");
    assert.ok(tool, "background-remover should be registered in TOOLS");
    assert.strictEqual(tool.categoryId, "image");
    assert.strictEqual(tool.name, "AI Background Remover");
    assert.strictEqual(tool.isNew, true);
    assert.strictEqual(tool.isFeatured, true);
    assert.strictEqual(tool.isPopular, true);

    const imageTools = getToolsByCategory("image");
    assert.ok(imageTools.some((t) => t.slug === "background-remover"));

    assert.ok(tool.seo.title.length > 0 && tool.seo.title.length < 58);
    assert.ok(!/RapidKit/i.test(tool.seo.title));
    assert.ok(tool.seo.description.length >= 145 && tool.seo.description.length <= 160);

    assert.ok(tool.seo.keywords.includes("remove bg alternative"));
    assert.ok(tool.seo.keywords.includes("free background remover no upload"));
    assert.strictEqual(tool.howToSteps.length, 4);
    assert.strictEqual(tool.faqs.length, 4);

    // Studio Pro SEO useCases verification
    assert.strictEqual(tool.useCases?.length, 4);
    assert.ok(tool.useCases?.some((u) => u.title.includes("E-Commerce")));
    assert.ok(tool.useCases?.some((u) => u.title.includes("YouTube Thumbnail")));
    assert.ok(tool.useCases?.some((u) => u.title.includes("Portrait Bokeh Blur")));
    assert.ok(tool.useCases?.some((u) => u.title.includes("ID & Passport")));

    for (const relSlug of tool.relatedToolSlugs) {
        assert.ok(
            TOOLS.some((t) => t.slug === relSlug),
            `Related tool slug "${relSlug}" must exist in TOOLS`
        );
    }
    for (const affId of tool.affiliateIds ?? []) {
        assert.ok(AFFILIATES[affId], `Affiliate ID "${affId}" must exist in AFFILIATES`);
    }
});

test("2. validateImageFile enforces supported MIME types and 15 MB limit", () => {
    assert.deepStrictEqual(
        validateImageFile({ name: "photo.png", type: "image/png", size: 1024 }),
        { ok: true }
    );
    assert.deepStrictEqual(
        validateImageFile({ name: "photo.jpg", type: "image/jpeg", size: MAX_FILE_SIZE_BYTES }),
        { ok: true }
    );
    assert.deepStrictEqual(
        validateImageFile({ name: "photo.webp", type: "image/webp", size: 512_000 }),
        { ok: true }
    );
    assert.deepStrictEqual(
        validateImageFile({ name: "camera.JPEG", type: "", size: 2048 }),
        { ok: true }
    );

    const gifRes = validateImageFile({ name: "anim.gif", type: "image/gif", size: 2048 });
    assert.strictEqual(gifRes.ok, false);
    assert.ok(gifRes.error.includes("PNG, JPG/JPEG, or WebP"));

    const emptyRes = validateImageFile({ name: "empty.png", type: "image/png", size: 0 });
    assert.strictEqual(emptyRes.ok, false);

    const oversizedRes = validateImageFile({
        name: "huge.jpg",
        type: "image/jpeg",
        size: MAX_FILE_SIZE_BYTES + 1,
    });
    assert.strictEqual(oversizedRes.ok, false);
    assert.ok(oversizedRes.error.includes("15 MB"));
});

test("3. Memory-safe preprocessing, model tier defaults, and WebGPU helper", () => {
    assert.deepStrictEqual(calculateConstrainedDimensions(800, 600, 1280), {
        width: 800,
        height: 600,
        wasDownscaled: false,
        scale: 1,
    });

    const mobileLandscape = calculateConstrainedDimensions(
        4032,
        3024,
        PROCESSING_MODE_CONFIG.balanced.maxDimension
    );
    assert.strictEqual(mobileLandscape.wasDownscaled, true);
    assert.strictEqual(mobileLandscape.width, 1280);
    assert.strictEqual(mobileLandscape.height, 960);

    const desktopPortrait = calculateConstrainedDimensions(
        3000,
        4000,
        PROCESSING_MODE_CONFIG.high.maxDimension
    );
    assert.strictEqual(desktopPortrait.wasDownscaled, true);
    assert.strictEqual(desktopPortrait.width, 1536);
    assert.strictEqual(desktopPortrait.height, 2048);

    assert.throws(() => calculateConstrainedDimensions(0, 500, 1280));

    // Responsive viewport defaults: resolution & model tier
    assert.strictEqual(getDefaultProcessingMode(360), "balanced");
    assert.strictEqual(getDefaultProcessingMode(1024), "high");
    assert.strictEqual(getDefaultModelPrecision(375), "isnet_quint8");
    assert.strictEqual(getDefaultModelPrecision(767), "isnet_quint8");
    assert.strictEqual(getDefaultModelPrecision(768), "isnet_fp16");
    assert.strictEqual(getDefaultModelPrecision(1440), "isnet_fp16");

    assert.ok(MODEL_PRECISION_CONFIG.isnet_quint8.approxSizeLabel.includes("40 MB"));
    assert.ok(MODEL_PRECISION_CONFIG.isnet_fp16.approxSizeLabel.includes("80 MB"));
    assert.strictEqual(typeof detectWebGpuAvailable(), "boolean");
});

test("4. Telemetry stage reducer stays monotonic across download, inference, and mask stages", () => {
    let state = createTelemetryState();
    assert.strictEqual(state.stage, "preprocessing");

    state = reduceTelemetryProgress(state, "fetch:/models/isnet_quint8", 20_000_000, 40_000_000);
    assert.strictEqual(state.stage, "downloading");
    assert.strictEqual(state.stageNumber, 1);
    const afterFirstFetch = state.percent;

    state = reduceTelemetryProgress(state, "fetch:/onnxruntime-web/wasm", 500_000, 10_000_000);
    assert.ok(state.percent >= afterFirstFetch);

    state = reduceTelemetryProgress(state, "compute:decode", 0, 4);
    assert.strictEqual(state.stage, "inference");
    assert.strictEqual(state.stageNumber, 2);

    state = reduceTelemetryProgress(state, "compute:inference", 1, 4);
    assert.strictEqual(state.stage, "inference");
    assert.ok(state.percent >= 80);

    state = reduceTelemetryProgress(state, "compute:mask", 2, 4);
    assert.strictEqual(state.stage, "compositing");
    assert.strictEqual(state.stageNumber, 3);

    state = reduceTelemetryProgress(state, "compute:encode", 4, 4);
    assert.strictEqual(state.percent, 99);
});

test("5. Studio compositor presets, gradient geometry, and filename formatting", () => {
    assert.strictEqual(SOLID_BG_PRESETS.length, 5);
    assert.strictEqual(GRADIENT_BG_PRESETS.length, 3);
    assert.deepStrictEqual(
        OUTLINE_OPTIONS.map((o) => o.value),
        [0, 4, 8, 14]
    );

    const diag = computeLinearGradientCoords(100, 100, 135);
    assert.ok(Math.abs(diag.x0 - 0) < 1e-6);
    assert.ok(Math.abs(diag.y0 - 0) < 1e-6);
    assert.ok(Math.abs(diag.x1 - 100) < 1e-6);
    assert.ok(Math.abs(diag.y1 - 100) < 1e-6);

    assert.strictEqual(buildOutputFilename("My Portrait (1).jpg", "png", false), "My-Portrait-1-nobg.png");
    assert.strictEqual(buildOutputFilename("product shot.webp", "webp", true), "product-shot-studio.webp");
    assert.strictEqual(formatFileSize(15 * 1024 * 1024), "15.00 MB");
});

test("6. Auto-Trim bounding-box alpha scanner & 4% margin math", () => {
    // Construct a 100x100 RGBA buffer with a centered 50x50 foreground square at [25..74, 25..74]
    const w = 100;
    const h = 100;
    const rgba = new Uint8ClampedArray(w * h * 4);

    // Paint stray near-transparent noise (alpha = 8 <= threshold 10) at corner (2, 2) -> must ignore!
    rgba[(2 * w + 2) * 4 + 3] = 8;

    // Paint solid subject square from x=25..74, y=25..74 (50x50 pixels)
    for (let y = 25; y <= 74; y += 1) {
        for (let x = 25; x <= 74; x += 1) {
            const idx = (y * w + x) * 4;
            rgba[idx] = 255;
            rgba[idx + 1] = 255;
            rgba[idx + 2] = 255;
            rgba[idx + 3] = 255;
        }
    }

    // 4% of 50px = 2px margin on every side -> [23..76] => width=54, height=54
    const trimmed = computeAlphaBoundingBox(rgba, w, h, 10, 0.04, 0);
    assert.deepStrictEqual(trimmed, {
        x: 23,
        y: 23,
        width: 54,
        height: 54,
        hasForeground: true,
    });

    // Edge clamping when foreground reaches canvas edge and extra sticker outline padding is requested
    rgba[(0 * w + 0) * 4 + 3] = 200;
    const clamped = computeAlphaBoundingBox(rgba, w, h, 10, 0.04, 14);
    assert.strictEqual(clamped.x, 0);
    assert.strictEqual(clamped.y, 0);
    assert.ok(clamped.width <= w);
    assert.ok(clamped.height <= h);
    assert.strictEqual(clamped.hasForeground, true);

    // Fully transparent mask falls back gracefully to full canvas bounds
    const emptyRgba = new Uint8ClampedArray(40 * 30 * 4);
    assert.deepStrictEqual(computeAlphaBoundingBox(emptyRgba, 40, 30), {
        x: 0,
        y: 0,
        width: 40,
        height: 30,
        hasForeground: false,
    });
});

test("7. Custom backdrop object-fit: cover coordinate calculations", () => {
    // Wide 16:9 backdrop (1600x900) drawn onto 800x800 square target
    const wideOnSquare = computeCoverDrawRect(1600, 900, 800, 800);
    assert.ok(Math.abs(wideOnSquare.height - 800) < 1e-6);
    assert.ok(Math.abs(wideOnSquare.width - (1600 * (800 / 900))) < 1e-6);
    assert.strictEqual(wideOnSquare.y, 0);
    assert.ok(wideOnSquare.x < 0, "Overflowing horizontal wings must center symmetrically");
    assert.ok(Math.abs(wideOnSquare.x * 2 + wideOnSquare.width - 800) < 1e-6);

    // Tall 1:2 portrait backdrop (600x1200) drawn onto 800x800 square target
    const tallOnSquare = computeCoverDrawRect(600, 1200, 800, 800);
    assert.strictEqual(tallOnSquare.width, 800);
    assert.strictEqual(tallOnSquare.height, 1600);
    assert.strictEqual(tallOnSquare.x, 0);
    assert.strictEqual(tallOnSquare.y, -400);

    // Matching aspect ratio scales uniformly to origin (0, 0)
    assert.deepStrictEqual(computeCoverDrawRect(1000, 500, 2000, 1000), {
        x: 0,
        y: 0,
        width: 2000,
        height: 1000,
    });

    assert.throws(() => computeCoverDrawRect(0, 100, 200, 200));
});
