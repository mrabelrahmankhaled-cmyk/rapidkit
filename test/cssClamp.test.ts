import test from "node:test";
import assert from "node:assert";
import {
    CLAMP_PRESETS,
    computeCssClamp,
    convertRawSizeInput,
    evaluateClampPx,
    evaluateClampRem,
    formatNumber,
    parseStrictFiniteNumber,
} from "../src/lib/cssClamp.ts";

test("1. Formula accuracy at endpoints, clamped extremes, and midpoint", () => {
    const ref = computeCssClamp({
        minVw: "320",
        maxVw: "1120",
        minSize: "1",
        maxSize: "2",
        unit: "rem",
        rootFontSize: "16",
    });

    assert.strictEqual(ref.ok, true);
    assert.strictEqual(ref.cssClamp, "clamp(1rem, 0.6rem + 2vw, 2rem)");
    assert.strictEqual(ref.tailwindClass, "text-[clamp(1rem,0.6rem_+_2vw,2rem)]");
    assert.ok(Math.abs(ref.slope - 0.02) < 1e-12);
    assert.ok(Math.abs(ref.vwCoefficient - 2) < 1e-12);
    assert.ok(Math.abs(ref.interceptPx - 9.6) < 1e-12);

    // Below minVw, at minVw, midpoint (720px -> 24px / 1.5rem), maxVw, above maxVw
    assert.strictEqual(evaluateClampPx(ref, 200), 16);
    assert.strictEqual(evaluateClampPx(ref, 320), 16);
    assert.strictEqual(evaluateClampPx(ref, 720), 24);
    assert.strictEqual(evaluateClampRem(ref, 720), 1.5);
    assert.strictEqual(evaluateClampPx(ref, 1120), 32);
    assert.strictEqual(evaluateClampPx(ref, 1920), 32);

    // Asymmetric viewport range (375 -> 1280, 1.25rem -> 2.75rem)
    const asym = computeCssClamp({
        minVw: "375",
        maxVw: "1280",
        minSize: "1.25",
        maxSize: "2.75",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(asym.ok, true);
    const midpoint = (375 + 1280) / 2;
    assert.ok(Math.abs(evaluateClampRem(asym, 375) - 1.25) < 1e-12);
    assert.ok(Math.abs(evaluateClampRem(asym, midpoint) - 2.0) < 1e-12);
    assert.ok(Math.abs(evaluateClampRem(asym, 1280) - 2.75) < 1e-12);
});

test("2. px and rem conversions and round-trips across root font-sizes", () => {
    for (const root of ["16", "10", "20"]) {
        const pxInput = {
            minVw: "375",
            maxVw: "1280",
            minSize: String(1.5 * Number(root)),
            maxSize: String(3 * Number(root)),
            unit: "px" as const,
            rootFontSize: root,
        };
        const remInput = {
            ...pxInput,
            minSize: convertRawSizeInput(pxInput.minSize, "px", "rem", root),
            maxSize: convertRawSizeInput(pxInput.maxSize, "px", "rem", root),
            unit: "rem" as const,
        };

        assert.strictEqual(remInput.minSize, "1.5");
        assert.strictEqual(remInput.maxSize, "3");
        assert.strictEqual(convertRawSizeInput(remInput.minSize, "rem", "px", root), pxInput.minSize);

        const pxRes = computeCssClamp(pxInput);
        const remRes = computeCssClamp(remInput);
        assert.strictEqual(pxRes.ok, true);
        assert.strictEqual(remRes.ok, true);

        const mid = (375 + 1280) / 2;
        assert.ok(Math.abs(evaluateClampPx(pxRes, 375) - evaluateClampPx(remRes, 375)) < 1e-12);
        assert.ok(Math.abs(evaluateClampPx(pxRes, mid) - evaluateClampPx(remRes, mid)) < 1e-12);
        assert.ok(Math.abs(evaluateClampPx(pxRes, 1280) - evaluateClampPx(remRes, 1280)) < 1e-12);
        assert.ok(pxRes.notices.some((n) => n.code === "px-unit-a11y" && n.severity === "info"));
    }

    // Invalid value / zero root leaves raw input untouched without crashing
    assert.strictEqual(convertRawSizeInput("abc", "rem", "px", "16"), "abc");
    assert.strictEqual(convertRawSizeInput("1", "rem", "px", "0"), "1");
});

test("3. Exact CSS clamp() and Tailwind arbitrary class output formatting", () => {
    // Verified presets (375 -> 1280, root 16)
    const presetOutputs = CLAMP_PRESETS.map((preset) => {
        const res = computeCssClamp(preset.input);
        assert.strictEqual(res.ok, true);
        assert.strictEqual(res.notices.filter((n) => n.severity === "warning").length, 0);
        return [preset.id, res.cssClamp, res.tailwindClass] as const;
    });

    assert.deepStrictEqual(presetOutputs, [
        ["body", "clamp(1rem, 0.8964rem + 0.442vw, 1.25rem)", "text-[clamp(1rem,0.8964rem_+_0.442vw,1.25rem)]"],
        ["h2", "clamp(1.5rem, 1.1892rem + 1.326vw, 2.25rem)", "text-[clamp(1.5rem,1.1892rem_+_1.326vw,2.25rem)]"],
        ["h1", "clamp(2rem, 1.3785rem + 2.6519vw, 3.5rem)", "text-[clamp(2rem,1.3785rem_+_2.6519vw,3.5rem)]"],
        ["spacing", "clamp(1.5rem, 0.4641rem + 4.4199vw, 4rem)", "text-[clamp(1.5rem,0.4641rem_+_4.4199vw,4rem)]"],
    ]);

    // px output formatting
    const pxRef = computeCssClamp({
        minVw: "320",
        maxVw: "1120",
        minSize: "16",
        maxSize: "32",
        unit: "px",
        rootFontSize: "16",
    });
    assert.strictEqual(pxRef.ok, true);
    assert.strictEqual(pxRef.cssClamp, "clamp(16px, 9.6px + 2vw, 32px)");
    assert.strictEqual(pxRef.tailwindClass, "text-[clamp(16px,9.6px_+_2vw,32px)]");

    // Zero intercept omits 0rem +
    const zeroIntercept = computeCssClamp({
        minVw: "320",
        maxVw: "640",
        minSize: "1",
        maxSize: "2",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(zeroIntercept.ok, true);
    assert.strictEqual(zeroIntercept.cssClamp, "clamp(1rem, 5vw, 2rem)");
    assert.strictEqual(zeroIntercept.tailwindClass, "text-[clamp(1rem,5vw,2rem)]");

    // Negative intercept formats as vw - |intercept| with required operator whitespace
    const negIntercept = computeCssClamp({
        minVw: "400",
        maxVw: "800",
        minSize: "1",
        maxSize: "2.5",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(negIntercept.ok, true);
    assert.strictEqual(negIntercept.cssClamp, "clamp(1rem, 6vw - 0.5rem, 2.5rem)");
    assert.strictEqual(negIntercept.tailwindClass, "text-[clamp(1rem,6vw_-_0.5rem,2.5rem)]");
    assert.ok(negIntercept.notices.some((n) => n.code === "zoom-slope-caution"));

    // Zero slope (minSize === maxSize)
    const zeroSlope = computeCssClamp({
        minVw: "375",
        maxVw: "1280",
        minSize: "1.25",
        maxSize: "1.25",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(zeroSlope.ok, true);
    assert.strictEqual(zeroSlope.cssClamp, "clamp(1.25rem, 1.25rem, 1.25rem)");
    assert.strictEqual(zeroSlope.tailwindClass, "text-[clamp(1.25rem,1.25rem,1.25rem)]");
    assert.ok(zeroSlope.notices.some((n) => n.code === "static-scale" && n.severity === "info"));

    // Zero minSize allowed cleanly (e.g. fluid spacing starting from 0rem)
    const zeroMin = computeCssClamp({
        minVw: "400",
        maxVw: "800",
        minSize: "0",
        maxSize: "2",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(zeroMin.ok, true);
    assert.strictEqual(zeroMin.cssClamp, "clamp(0rem, 8vw - 2rem, 2rem)");
    assert.strictEqual(zeroMin.tailwindClass, "text-[clamp(0rem,8vw_-_2rem,2rem)]");
});

test("4. Four-decimal rounding, trailing zero trimming, and -0 normalization", () => {
    assert.strictEqual(formatNumber(-0), "0");
    assert.strictEqual(formatNumber(-0.00001), "0");
    assert.strictEqual(formatNumber(1.5), "1.5");
    assert.strictEqual(formatNumber(17 / 16), "1.0625");

    // Construct near-zero negative intercept that rounds to 0: should omit - 0rem and never emit -0rem
    const nearZeroNeg = computeCssClamp({
        minVw: "100",
        maxVw: "200",
        minSize: "1",
        maxSize: "2.00001",
        unit: "rem",
        rootFontSize: "16",
    });
    assert.strictEqual(nearZeroNeg.ok, true);
    assert.ok(!nearZeroNeg.cssClamp.includes("-0"));
    assert.strictEqual(nearZeroNeg.cssClamp, "clamp(1rem, 16.0002vw, 2rem)");
});

test("5. Validation edge cases reject invalid math without silent coercion", () => {
    const base = {
        minVw: "375",
        maxVw: "1280",
        minSize: "1",
        maxSize: "2",
        unit: "rem" as const,
        rootFontSize: "16",
    };

    const equalVw = computeCssClamp({ ...base, minVw: "600", maxVw: "600" });
    assert.strictEqual(equalVw.ok, false);
    assert.ok(equalVw.fieldErrors.maxVw?.includes("equal"));

    const swappedVw = computeCssClamp({ ...base, minVw: "1280", maxVw: "375" });
    assert.strictEqual(swappedVw.ok, false);
    assert.ok(swappedVw.fieldErrors.maxVw?.includes("smaller"));

    const invertedSize = computeCssClamp({ ...base, minSize: "3", maxSize: "1" });
    assert.strictEqual(invertedSize.ok, false);
    assert.ok(invertedSize.fieldErrors.maxSize?.includes("less than or equal"));

    const zeroVw = computeCssClamp({ ...base, minVw: "0" });
    assert.strictEqual(zeroVw.ok, false);
    assert.ok(zeroVw.fieldErrors.minVw);

    const negVw = computeCssClamp({ ...base, maxVw: "-320" });
    assert.strictEqual(negVw.ok, false);
    assert.ok(negVw.fieldErrors.maxVw);

    const zeroRoot = computeCssClamp({ ...base, rootFontSize: "0" });
    assert.strictEqual(zeroRoot.ok, false);
    assert.ok(zeroRoot.fieldErrors.rootFontSize);

    const negMinSize = computeCssClamp({ ...base, minSize: "-0.5" });
    assert.strictEqual(negMinSize.ok, false);
    assert.ok(negMinSize.fieldErrors.minSize);

    const negMaxSize = computeCssClamp({ ...base, maxSize: "-1" });
    assert.strictEqual(negMaxSize.ok, false);
    assert.ok(negMaxSize.fieldErrors.maxSize);

    // Zero min and max is allowed with info notice
    const bothZero = computeCssClamp({ ...base, minSize: "0", maxSize: "0" });
    assert.strictEqual(bothZero.ok, true);
    assert.strictEqual(bothZero.cssClamp, "clamp(0rem, 0rem, 0rem)");
    assert.ok(bothZero.notices.some((n) => n.code === "zero-sizes"));

    // Extreme values within 100k produce warning notice; above 100k produce blocking error
    const largeWarn = computeCssClamp({ ...base, maxVw: "20000" });
    assert.strictEqual(largeWarn.ok, true);
    assert.ok(largeWarn.notices.some((n) => n.code === "extreme-values" && n.severity === "warning"));

    const tooLargeErr = computeCssClamp({ ...base, maxVw: "100001" });
    assert.strictEqual(tooLargeErr.ok, false);
    assert.ok(tooLargeErr.fieldErrors.maxVw);
});

test("6. Adversarial and malformed numeric string inputs", () => {
    for (const bad of ["", "   ", "abc", "16px", "1,280", "NaN", "Infinity", "-Infinity", "1e999", "..5", "1..2"]) {
        assert.strictEqual(parseStrictFiniteNumber(bad), null, `Expected null for ${JSON.stringify(bad)}`);
        const res = computeCssClamp({
            minVw: "375",
            maxVw: "1280",
            minSize: bad,
            maxSize: "2",
            unit: "rem",
            rootFontSize: "16",
        });
        assert.strictEqual(res.ok, false);
        assert.ok(res.fieldErrors.minSize);
    }

    // Valid numeric formats: whitespace-trimmed decimals, leading dot, scientific notation
    assert.strictEqual(parseStrictFiniteNumber("  .5 "), 0.5);
    assert.strictEqual(parseStrictFiniteNumber("1e3"), 1000);
    assert.strictEqual(parseStrictFiniteNumber("-0"), 0);
});
