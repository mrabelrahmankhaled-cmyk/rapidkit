import test from "node:test";
import assert from "node:assert";
import { getToolBySlug, getToolsByCategory, TOOLS } from "../../data/tools.ts";
import { AFFILIATES } from "../../data/affiliates.ts";
import {
    GRADIENT_BG_PRESETS,
    MAX_FILE_SIZE_BYTES,
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
} from "../backgroundRemover.ts";

test("1. background-remover tool registry metadata & SEO constraints", () => {
    const tool = getToolBySlug("background-remover");
    assert.ok(tool, "background-remover should be registered in TOOLS");
    assert.strictEqual(tool.categoryId, "image");
    assert.strictEqual(tool.name, "AI Background Remover");
    assert.strictEqual(tool.isNew, true);
    assert.strictEqual(tool.isFeatured, true);
    assert.strictEqual(tool.isPopular, true);

    // Must appear inside image category query
    const imageTools = getToolsByCategory("image");
    assert.ok(imageTools.some((t) => t.slug === "background-remover"));

    // SEO title (< 58 chars, no brand suffix)
    assert.ok(tool.seo.title.length > 0 && tool.seo.title.length < 58, `Title length ${tool.seo.title.length} must be < 58`);
    assert.ok(!/RapidKit/i.test(tool.seo.title), "SEO title should not contain brand suffix");

    // SEO description (145-160 chars)
    assert.ok(
        tool.seo.description.length >= 145 && tool.seo.description.length <= 160,
        `Description length ${tool.seo.description.length} must be between 145 and 160`
    );

    assert.ok(tool.seo.keywords.includes("remove bg alternative"));
    assert.ok(tool.seo.keywords.includes("free background remover no upload"));
    assert.strictEqual(tool.howToSteps.length, 4);
    assert.strictEqual(tool.faqs.length, 4);

    // Every relatedToolSlug and affiliateId must reference a real record
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

    // Browser empty MIME fallback when filename extension is valid
    assert.deepStrictEqual(
        validateImageFile({ name: "camera.JPEG", type: "", size: 2048 }),
        { ok: true }
    );

    // Reject unsupported formats
    const gifRes = validateImageFile({ name: "anim.gif", type: "image/gif", size: 2048 });
    assert.strictEqual(gifRes.ok, false);
    assert.ok(gifRes.error.includes("PNG, JPG/JPEG, or WebP"));

    const svgRes = validateImageFile({ name: "icon.svg", type: "image/svg+xml", size: 1024 });
    assert.strictEqual(svgRes.ok, false);

    // Reject empty and oversized files
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

test("3. Memory-safe preprocessing downscale math & viewport default mode", () => {
    // Within bounds -> no downscale
    assert.deepStrictEqual(calculateConstrainedDimensions(800, 600, 1280), {
        width: 800,
        height: 600,
        wasDownscaled: false,
        scale: 1,
    });

    // Landscape 4032x3024 (4:3) under Balanced (1280px) -> 1280x960
    const mobileLandscape = calculateConstrainedDimensions(
        4032,
        3024,
        PROCESSING_MODE_CONFIG.balanced.maxDimension
    );
    assert.strictEqual(mobileLandscape.wasDownscaled, true);
    assert.strictEqual(mobileLandscape.width, 1280);
    assert.strictEqual(mobileLandscape.height, 960);

    // Portrait 3000x4000 under High Res (2048px) -> 1536x2048
    const desktopPortrait = calculateConstrainedDimensions(
        3000,
        4000,
        PROCESSING_MODE_CONFIG.high.maxDimension
    );
    assert.strictEqual(desktopPortrait.wasDownscaled, true);
    assert.strictEqual(desktopPortrait.width, 1536);
    assert.strictEqual(desktopPortrait.height, 2048);

    // Reject invalid dimensions
    assert.throws(() => calculateConstrainedDimensions(0, 500, 1280));
    assert.throws(() => calculateConstrainedDimensions(500, -10, 1280));

    // Viewport defaults (< 768px -> balanced, >= 768px -> high)
    assert.strictEqual(getDefaultProcessingMode(360), "balanced");
    assert.strictEqual(getDefaultProcessingMode(767), "balanced");
    assert.strictEqual(getDefaultProcessingMode(768), "high");
    assert.strictEqual(getDefaultProcessingMode(1440), "high");
});

test("4. Telemetry stage reducer stays monotonic across download, inference, and mask stages", () => {
    let state = createTelemetryState();
    assert.strictEqual(state.stage, "preprocessing");

    // First fetch chunk starts Stage 1 (Downloading weights)
    state = reduceTelemetryProgress(state, "fetch:/models/isnet_fp16", 40_000_000, 80_000_000);
    assert.strictEqual(state.stage, "downloading");
    assert.strictEqual(state.stageNumber, 1);
    const afterFirstFetch = state.percent;
    assert.ok(afterFirstFetch >= 30 && afterFirstFetch <= 60);

    // Second concurrent fetch resource shouldn't cause backward jump
    state = reduceTelemetryProgress(state, "fetch:/onnxruntime-web/wasm", 500_000, 10_000_000);
    assert.ok(state.percent >= afterFirstFetch);

    // Stage 2: Neural network decode & inference
    state = reduceTelemetryProgress(state, "compute:decode", 0, 4);
    assert.strictEqual(state.stage, "inference");
    assert.strictEqual(state.stageNumber, 2);

    state = reduceTelemetryProgress(state, "compute:inference", 1, 4);
    assert.strictEqual(state.stage, "inference");
    assert.ok(state.percent >= 80);

    // Stage 3: Alpha mask compositing & encode
    state = reduceTelemetryProgress(state, "compute:mask", 2, 4);
    assert.strictEqual(state.stage, "compositing");
    assert.strictEqual(state.stageNumber, 3);
    assert.ok(state.percent >= 90);

    state = reduceTelemetryProgress(state, "compute:encode", 4, 4);
    assert.strictEqual(state.stage, "compositing");
    assert.strictEqual(state.percent, 99);
});

test("5. Studio compositor presets, gradient geometry, and filename formatting", () => {
    assert.strictEqual(SOLID_BG_PRESETS.length, 5);
    assert.strictEqual(GRADIENT_BG_PRESETS.length, 3);

    // 135deg linear-gradient on 100x100 square goes from top-left (0,0) to bottom-right (100,100)
    const diag = computeLinearGradientCoords(100, 100, 135);
    assert.ok(Math.abs(diag.x0 - 0) < 1e-6);
    assert.ok(Math.abs(diag.y0 - 0) < 1e-6);
    assert.ok(Math.abs(diag.x1 - 100) < 1e-6);
    assert.ok(Math.abs(diag.y1 - 100) < 1e-6);

    // 90deg linear-gradient runs left-to-right at vertical midpoint
    const horiz = computeLinearGradientCoords(200, 100, 90);
    assert.ok(Math.abs(horiz.x0 - 0) < 1e-6);
    assert.ok(Math.abs(horiz.y0 - 50) < 1e-6);
    assert.ok(Math.abs(horiz.x1 - 200) < 1e-6);
    assert.ok(Math.abs(horiz.y1 - 50) < 1e-6);

    assert.strictEqual(buildOutputFilename("My Portrait (1).jpg", "png", false), "My-Portrait-1-nobg.png");
    assert.strictEqual(buildOutputFilename("product shot.webp", "webp", true), "product-shot-studio.webp");
    assert.strictEqual(formatFileSize(15 * 1024 * 1024), "15.00 MB");
});
