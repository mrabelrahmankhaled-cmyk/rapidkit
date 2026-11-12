"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
    Copy,
    Check,
    AlertCircle,
    AlertTriangle,
    Info,
    Sparkles,
    RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    CLAMP_PRESETS,
    DEFAULT_CLAMP_INPUT,
    computeCssClamp,
    convertRawSizeInput,
    evaluateClampPx,
    evaluateClampRem,
    formatNumber,
    type ClampField,
    type ClampRawInput,
    type ClampSuccess,
    type ClampUnit,
} from "@/lib/cssClamp";

type CopyStatus = "idle" | "copied" | "error";

type NumericFieldProps = {
    id: string;
    label: string;
    unitSuffix: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
};

function NumericField({ id, label, unitSuffix, value, error, onChange }: NumericFieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-[11px] font-semibold uppercase tracking-wider text-[rgb(135,135,170)] mb-1.5"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={cn(
                        "w-full h-11 rounded-xl bg-[rgb(10,10,15)] border px-3.5 pr-11 text-sm font-mono text-white focus:outline-none transition-colors",
                        error
                            ? "border-rose-500/70 focus:border-rose-400"
                            : "border-[rgb(45,45,65)] focus:border-violet-500"
                    )}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[rgb(110,110,145)]">
                    {unitSuffix}
                </span>
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1 text-[11px] text-rose-400">
                    {error}
                </p>
            )}
        </div>
    );
}

type OutputRowProps = {
    label: string;
    hint: string;
    value: string | null;
    copyState: CopyStatus;
    onCopy: () => void;
    buttonLabel: string;
};

function OutputRow({ label, hint, value, copyState, onCopy, buttonLabel }: OutputRowProps) {
    return (
        <div className="rounded-xl bg-[rgb(10,10,15)] border border-[rgb(35,35,55)] p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
                    <span className="ml-2 text-[11px] text-[rgb(110,110,150)]">{hint}</span>
                </div>
                <button
                    type="button"
                    onClick={onCopy}
                    disabled={!value}
                    className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0",
                        !value &&
                            "opacity-50 cursor-not-allowed bg-[rgb(20,20,32)] border-[rgb(35,35,55)] text-[rgb(90,90,120)]",
                        value &&
                            copyState === "idle" &&
                            "bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30",
                        copyState === "copied" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                        copyState === "error" && "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    )}
                >
                    {copyState === "copied" ? (
                        <Check className="w-3.5 h-3.5" />
                    ) : copyState === "error" ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                    {copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy Failed" : buttonLabel}
                </button>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-emerald-300 overflow-x-auto whitespace-nowrap">
                <code>{value ?? "Fix validation errors above to generate valid CSS."}</code>
            </pre>
        </div>
    );
}

type ClampCurveSvgProps = {
    result: ClampSuccess;
    previewVw: number;
    sliderMin: number;
    sliderMax: number;
    evaluatedPx: number;
};

function ClampCurveSvg({ result, previewVw, sliderMin, sliderMax, evaluatedPx }: ClampCurveSvgProps) {
    const width = 480;
    const height = 180;
    const padLeft = 48;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const vwSpan = Math.max(1, sliderMax - sliderMin);
    const minPx = result.minSizePx;
    const maxPx = result.maxSizePx;
    const isFlat = Math.abs(maxPx - minPx) < 1e-9;

    const mapX = (vw: number) => padLeft + ((vw - sliderMin) / vwSpan) * plotW;
    const mapY = (px: number) => {
        if (isFlat) return padTop + plotH / 2;
        return padTop + plotH - ((px - minPx) / (maxPx - minPx)) * plotH;
    };

    const xStart = mapX(sliderMin);
    const xMin = mapX(result.minVw);
    const xMax = mapX(result.maxVw);
    const xEnd = mapX(sliderMax);

    const yMin = mapY(minPx);
    const yMax = mapY(maxPx);

    const cx = mapX(previewVw);
    const cy = mapY(evaluatedPx);

    const pathD = `M ${xStart.toFixed(1)} ${yMin.toFixed(1)} L ${xMin.toFixed(1)} ${yMin.toFixed(1)} L ${xMax.toFixed(1)} ${yMax.toFixed(1)} L ${xEnd.toFixed(1)} ${yMax.toFixed(1)}`;
    const areaD = `${pathD} L ${xEnd.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${xStart.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

    const minLabel =
        result.unit === "rem"
            ? `${formatNumber(result.minSizeOut, 4)}rem`
            : `${formatNumber(result.minSizeOut, 2)}px`;
    const maxLabel =
        result.unit === "rem"
            ? `${formatNumber(result.maxSizeOut, 4)}rem`
            : `${formatNumber(result.maxSizeOut, 2)}px`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Fluid CSS clamp scaling curve across viewport widths"
            className="w-full h-44 select-none"
        >
            <defs>
                <linearGradient id="clampAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {/* Horizontal baseline & ceiling guides */}
            <line
                x1={padLeft}
                y1={yMin}
                x2={width - padRight}
                y2={yMin}
                stroke="rgba(148,163,184,0.16)"
                strokeDasharray="3 3"
            />
            {!isFlat && (
                <line
                    x1={padLeft}
                    y1={yMax}
                    x2={width - padRight}
                    y2={yMax}
                    stroke="rgba(148,163,184,0.16)"
                    strokeDasharray="3 3"
                />
            )}

            {/* Vertical breakpoint guides */}
            <line
                x1={xMin}
                y1={padTop}
                x2={xMin}
                y2={padTop + plotH}
                stroke="rgba(56,189,248,0.3)"
                strokeDasharray="4 4"
            />
            <line
                x1={xMax}
                y1={padTop}
                x2={xMax}
                y2={padTop + plotH}
                stroke="rgba(56,189,248,0.3)"
                strokeDasharray="4 4"
            />

            {/* Area + piecewise clamp curve */}
            <path d={areaD} fill="url(#clampAreaGrad)" />
            <path d={pathD} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Endpoint dots */}
            <circle cx={xMin} cy={yMin} r="4" fill="#38bdf8" />
            <circle cx={xMax} cy={yMax} r="4" fill="#38bdf8" />

            {/* Active viewport cursor */}
            <line
                x1={cx}
                y1={padTop}
                x2={cx}
                y2={padTop + plotH}
                stroke="rgba(52,211,153,0.55)"
                strokeWidth="1.5"
            />
            <circle
                data-testid="clamp-active-dot"
                cx={cx}
                cy={cy}
                r="6"
                fill="#34d399"
                stroke="#0a0a0f"
                strokeWidth="2"
            />

            {/* Axis labels */}
            <text x={padLeft - 6} y={yMin + 4} textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono">
                {minLabel}
            </text>
            {!isFlat && (
                <text x={padLeft - 6} y={yMax + 4} textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono">
                    {maxLabel}
                </text>
            )}
            <text x={xMin} y={height - 8} textAnchor="middle" fontSize="10" fill="#7dd3fc" className="font-mono">
                {formatNumber(result.minVw, 0)}px
            </text>
            <text x={xMax} y={height - 8} textAnchor="middle" fontSize="10" fill="#7dd3fc" className="font-mono">
                {formatNumber(result.maxVw, 0)}px
            </text>
        </svg>
    );
}

export function CssClampTool() {
    const [input, setInput] = useState<ClampRawInput>(DEFAULT_CLAMP_INPUT);
    const [previewVw, setPreviewVw] = useState<number>(768);
    const [copyCss, setCopyCss] = useState<CopyStatus>("idle");
    const [copyTailwind, setCopyTailwind] = useState<CopyStatus>("idle");
    const timersRef = useRef<{ css?: ReturnType<typeof setTimeout>; tailwind?: ReturnType<typeof setTimeout> }>({});

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            if (timers.css) clearTimeout(timers.css);
            if (timers.tailwind) clearTimeout(timers.tailwind);
        };
    }, []);

    const result = useMemo(() => computeCssClamp(input), [input]);

    const { sliderMin, sliderMax } = useMemo(() => {
        if (!result.ok) {
            return { sliderMin: 240, sliderMax: 1600 };
        }
        return {
            sliderMin: Math.max(160, Math.floor(result.minVw * 0.6)),
            sliderMax: Math.ceil(result.maxVw * 1.25),
        };
    }, [result]);

    const effectivePreviewVw = Math.min(sliderMax, Math.max(sliderMin, previewVw));

    const updateField = (field: Exclude<ClampField, never>, value: string) => {
        setInput((prev) => ({ ...prev, [field]: value }));
        setCopyCss("idle");
        setCopyTailwind("idle");
    };

    const handleUnitChange = (nextUnit: ClampUnit) => {
        if (nextUnit === input.unit) return;
        setInput((prev) => ({
            ...prev,
            unit: nextUnit,
            minSize: convertRawSizeInput(prev.minSize, prev.unit, nextUnit, prev.rootFontSize),
            maxSize: convertRawSizeInput(prev.maxSize, prev.unit, nextUnit, prev.rootFontSize),
        }));
        setCopyCss("idle");
        setCopyTailwind("idle");
    };

    const applyPreset = (presetInput: ClampRawInput) => {
        setInput(presetInput);
        const minVwNum = Number(presetInput.minVw);
        const maxVwNum = Number(presetInput.maxVw);
        if (Number.isFinite(minVwNum) && Number.isFinite(maxVwNum)) {
            setPreviewVw(Math.round((minVwNum + maxVwNum) / 2));
        }
        setCopyCss("idle");
        setCopyTailwind("idle");
    };

    const copyValue = async (text: string | null, kind: "css" | "tailwind") => {
        if (!text) return;
        const setStatus = kind === "css" ? setCopyCss : setCopyTailwind;
        if (timersRef.current[kind]) {
            clearTimeout(timersRef.current[kind]);
        }
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error("Clipboard API unavailable");
            }
            await navigator.clipboard.writeText(text);
            setStatus("copied");
            timersRef.current[kind] = setTimeout(() => setStatus("idle"), 2000);
        } catch {
            setStatus("error");
            timersRef.current[kind] = setTimeout(() => setStatus("idle"), 2500);
        }
    };

    const evaluatedPx = result.ok ? evaluateClampPx(result, effectivePreviewVw) : 16;
    const evaluatedRem = result.ok ? evaluateClampRem(result, effectivePreviewVw) : 1;

    const previewZone = !result.ok
        ? "Invalid"
        : effectivePreviewVw <= result.minVw
          ? "Clamped Min"
          : effectivePreviewVw >= result.maxVw
            ? "Clamped Max"
            : "Fluid Scaling";

    return (
        <div className="space-y-6">
            {/* ─── Top Bar: Unit Toggle & Presets ──────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                <div className="flex items-center gap-3">
                    <div
                        role="group"
                        aria-label="Size unit"
                        className="flex p-1 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]"
                    >
                        {(["rem", "px"] as ClampUnit[]).map((unit) => (
                            <button
                                key={unit}
                                type="button"
                                aria-pressed={input.unit === unit}
                                onClick={() => handleUnitChange(unit)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all",
                                    input.unit === unit
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                        : "text-[rgb(120,120,160)] hover:text-white"
                                )}
                            >
                                {unit}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => applyPreset(DEFAULT_CLAMP_INPUT)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-[rgb(150,150,185)] hover:text-white hover:border-violet-500/40 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-medium text-[rgb(100,100,140)] flex items-center gap-1 mr-1">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Presets:
                    </span>
                    {CLAMP_PRESETS.map((preset) => {
                        const isActive =
                            input.minVw === preset.input.minVw &&
                            input.maxVw === preset.input.maxVw &&
                            input.minSize === preset.input.minSize &&
                            input.maxSize === preset.input.maxSize &&
                            input.unit === preset.input.unit &&
                            input.rootFontSize === preset.input.rootFontSize;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset.input)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                    isActive
                                        ? "bg-violet-500/20 border-violet-500/50 text-violet-200"
                                        : "bg-[rgb(10,10,15)] border-[rgb(45,45,65)] text-[rgb(160,160,195)] hover:text-white hover:border-violet-500/40"
                                )}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Main Grid: Inputs + Outputs & Live Preview ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: 5 Numeric Inputs */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                        <NumericField
                            id="clamp-min-vw"
                            label="Min Viewport"
                            unitSuffix="px"
                            value={input.minVw}
                            error={!result.ok ? result.fieldErrors.minVw : undefined}
                            onChange={(val) => updateField("minVw", val)}
                        />
                        <NumericField
                            id="clamp-max-vw"
                            label="Max Viewport"
                            unitSuffix="px"
                            value={input.maxVw}
                            error={!result.ok ? result.fieldErrors.maxVw : undefined}
                            onChange={(val) => updateField("maxVw", val)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <NumericField
                            id="clamp-min-size"
                            label="Min Size"
                            unitSuffix={input.unit}
                            value={input.minSize}
                            error={!result.ok ? result.fieldErrors.minSize : undefined}
                            onChange={(val) => updateField("minSize", val)}
                        />
                        <NumericField
                            id="clamp-max-size"
                            label="Max Size"
                            unitSuffix={input.unit}
                            value={input.maxSize}
                            error={!result.ok ? result.fieldErrors.maxSize : undefined}
                            onChange={(val) => updateField("maxSize", val)}
                        />
                    </div>

                    <NumericField
                        id="clamp-root-font"
                        label="Root Font Size"
                        unitSuffix="px"
                        value={input.rootFontSize}
                        error={!result.ok ? result.fieldErrors.rootFontSize : undefined}
                        onChange={(val) => updateField("rootFontSize", val)}
                    />

                    {/* Accessibility & Browser Support Note */}
                    <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200/90 leading-relaxed space-y-1.5">
                        <p className="font-semibold text-white flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            Units, Zoom &amp; Browser Support
                        </p>
                        <p>
                            Uses <code className="text-sky-300">rem</code> by default so sizes respect root browser font
                            preferences; <code className="text-sky-300">px</code> ignores user root scaling. Very steep{" "}
                            <code className="text-sky-300">vw</code> slopes can still limit browser text zoom, so verify at
                            200% zoom.
                        </p>
                        <p className="text-[11px] text-sky-300/80">
                            CSS <code>clamp()</code> works natively in Chrome 79+, Edge 79+, Firefox 75+, and Safari 13.1+.
                        </p>
                    </div>
                </div>

                {/* Right: Generated Outputs + Viewport Slider & SVG Curve */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Outputs Card */}
                    <div className="p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-3.5">
                        {!result.ok && (
                            <div
                                role="alert"
                                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200"
                            >
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                <ul className="space-y-1">
                                    {result.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <OutputRow
                            label="CSS Value"
                            hint="font-size / padding / gap"
                            value={result.ok ? result.cssClamp : null}
                            copyState={copyCss}
                            onCopy={() => copyValue(result.ok ? result.cssClamp : null, "css")}
                            buttonLabel="Copy CSS"
                        />

                        <OutputRow
                            label="Tailwind Class"
                            hint="Swap text- for p-, gap-, etc."
                            value={result.ok ? result.tailwindClass : null}
                            copyState={copyTailwind}
                            onCopy={() => copyValue(result.ok ? result.tailwindClass : null, "tailwind")}
                            buttonLabel="Copy Tailwind"
                        />
                    </div>

                    {/* Live Preview & Curve Card */}
                    <div className="p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                                htmlFor="clamp-preview-viewport"
                                className="text-xs font-bold uppercase tracking-wider text-white"
                            >
                                Live Viewport Preview
                            </label>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                                <span className="px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-200">
                                    {effectivePreviewVw}px viewport
                                </span>
                                {result.ok && (
                                    <>
                                        <span
                                            data-testid="clamp-preview-readout"
                                            className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                                        >
                                            {formatNumber(evaluatedPx, 2)}px ({formatNumber(evaluatedRem, 4)}rem)
                                        </span>
                                        <span className="px-2 py-1 rounded-md bg-[rgb(10,10,15)] border border-[rgb(40,40,60)] text-[rgb(175,175,205)]">
                                            {previewZone}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <input
                            id="clamp-preview-viewport"
                            type="range"
                            min={sliderMin}
                            max={sliderMax}
                            step={1}
                            value={effectivePreviewVw}
                            onChange={(e) => setPreviewVw(Number(e.target.value))}
                            disabled={!result.ok}
                            className="w-full h-2 rounded-full cursor-pointer accent-violet-500 disabled:opacity-40"
                        />

                        {result.ok ? (
                            <>
                                <div className="rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] p-3">
                                    <ClampCurveSvg
                                        result={result}
                                        previewVw={effectivePreviewVw}
                                        sliderMin={sliderMin}
                                        sliderMax={sliderMax}
                                        evaluatedPx={evaluatedPx}
                                    />
                                </div>

                                <div className="rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] p-4 min-h-[110px] max-h-[200px] overflow-auto flex items-center">
                                    <p
                                        data-testid="clamp-sample-text"
                                        style={{ fontSize: `${evaluatedPx}px`, lineHeight: 1.25 }}
                                        className="font-semibold text-white transition-[font-size] duration-75 break-words"
                                    >
                                        Fluid typography scales smoothly across viewports.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] p-6 text-center text-xs text-[rgb(120,120,155)]">
                                Fix the highlighted inputs to preview the curve and computed typography size.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Dynamic Notices Banner ──────────────────── */}
            {result.ok && result.notices.length > 0 && (
                <div
                    role="region"
                    aria-label="Clamp conversion notices"
                    className={cn(
                        "p-4 rounded-2xl border space-y-2",
                        result.notices.some((n) => n.severity === "warning")
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-sky-500/10 border-sky-500/25"
                    )}
                >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                        {result.notices.some((n) => n.severity === "warning") ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                            <Info className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                        <span>Calculation Notices ({result.notices.length})</span>
                    </div>
                    <ul className="space-y-1.5 text-xs leading-relaxed">
                        {result.notices.map((n) => (
                            <li key={n.code} className="flex items-start gap-2 text-[rgb(215,215,235)]">
                                <span
                                    className={cn(
                                        "px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0 mt-0.5",
                                        n.severity === "warning"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : "bg-sky-500/20 text-sky-300"
                                    )}
                                >
                                    {n.code}
                                </span>
                                <span>{n.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
