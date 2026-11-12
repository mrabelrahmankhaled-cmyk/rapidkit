export type ClampUnit = "rem" | "px";

export type ClampField = "minVw" | "maxVw" | "minSize" | "maxSize" | "rootFontSize";

export type ClampNoticeSeverity = "warning" | "info";

export type ClampNotice = {
    code: string;
    message: string;
    severity: ClampNoticeSeverity;
};

export type ClampRawInput = {
    minVw: string;
    maxVw: string;
    minSize: string;
    maxSize: string;
    unit: ClampUnit;
    rootFontSize: string;
};

export type ClampPreset = {
    id: string;
    label: string;
    subtitle: string;
    input: ClampRawInput;
};

export type ClampSuccess = {
    ok: true;
    unit: ClampUnit;
    rootFontSize: number;
    minVw: number;
    maxVw: number;
    minSizePx: number;
    maxSizePx: number;
    minSizeOut: number;
    maxSizeOut: number;
    slope: number;
    vwCoefficient: number;
    interceptPx: number;
    interceptOut: number;
    cssClamp: string;
    tailwindClass: string;
    notices: ClampNotice[];
};

export type ClampError = {
    ok: false;
    fieldErrors: Partial<Record<ClampField, string>>;
    errors: string[];
};

export type ClampResult = ClampSuccess | ClampError;

export const MAX_CLAMP_INPUT = 100_000;
const STRICT_NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

export const CLAMP_PRESETS: ClampPreset[] = [
    {
        id: "body",
        label: "Body",
        subtitle: "1rem → 1.25rem",
        input: {
            minVw: "375",
            maxVw: "1280",
            minSize: "1",
            maxSize: "1.25",
            unit: "rem",
            rootFontSize: "16",
        },
    },
    {
        id: "h2",
        label: "H2",
        subtitle: "1.5rem → 2.25rem",
        input: {
            minVw: "375",
            maxVw: "1280",
            minSize: "1.5",
            maxSize: "2.25",
            unit: "rem",
            rootFontSize: "16",
        },
    },
    {
        id: "h1",
        label: "H1",
        subtitle: "2rem → 3.5rem",
        input: {
            minVw: "375",
            maxVw: "1280",
            minSize: "2",
            maxSize: "3.5",
            unit: "rem",
            rootFontSize: "16",
        },
    },
    {
        id: "spacing",
        label: "Spacing",
        subtitle: "1.5rem → 4rem",
        input: {
            minVw: "375",
            maxVw: "1280",
            minSize: "1.5",
            maxSize: "4",
            unit: "rem",
            rootFontSize: "16",
        },
    },
];

export const DEFAULT_CLAMP_INPUT: ClampRawInput = CLAMP_PRESETS[2].input;

export function parseStrictFiniteNumber(raw: string): number | null {
    const trimmed = raw.trim();
    if (!trimmed || !STRICT_NUMBER_RE.test(trimmed)) {
        return null;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return parsed === 0 ? 0 : parsed;
}

export function roundTo(value: number, decimals = 4): number {
    const factor = 10 ** decimals;
    const rounded = (Math.round(Math.abs(value) * factor) / factor) * (value < 0 ? -1 : 1);
    if (Object.is(rounded, -0) || Math.abs(rounded) < 1e-12) {
        return 0;
    }
    return rounded;
}

export function formatNumber(value: number, decimals = 4): string {
    const rounded = roundTo(value, decimals);
    if (rounded === 0) return "0";
    return rounded.toFixed(decimals).replace(/\.?0+$/, "");
}

export function convertRawSizeInput(
    rawValue: string,
    fromUnit: ClampUnit,
    toUnit: ClampUnit,
    rootFontSizeRaw: string
): string {
    if (fromUnit === toUnit) return rawValue;
    const val = parseStrictFiniteNumber(rawValue);
    const root = parseStrictFiniteNumber(rootFontSizeRaw);
    if (val === null || root === null || root <= 0) {
        return rawValue;
    }
    const converted = toUnit === "px" ? val * root : val / root;
    return formatNumber(converted, 4);
}

function addFieldError(
    fieldErrors: Partial<Record<ClampField, string>>,
    errors: string[],
    field: ClampField,
    message: string
): void {
    if (!fieldErrors[field]) {
        fieldErrors[field] = message;
    }
    if (!errors.includes(message)) {
        errors.push(message);
    }
}

export function computeCssClamp(input: ClampRawInput): ClampResult {
    const fieldErrors: Partial<Record<ClampField, string>> = {};
    const errors: string[] = [];

    const minVw = parseStrictFiniteNumber(input.minVw);
    const maxVw = parseStrictFiniteNumber(input.maxVw);
    const minSize = parseStrictFiniteNumber(input.minSize);
    const maxSize = parseStrictFiniteNumber(input.maxSize);
    const rootFontSize = parseStrictFiniteNumber(input.rootFontSize);

    const parsedFields: [ClampField, number | null][] = [
        ["minVw", minVw],
        ["maxVw", maxVw],
        ["minSize", minSize],
        ["maxSize", maxSize],
        ["rootFontSize", rootFontSize],
    ];

    for (const [field, value] of parsedFields) {
        if (value === null) {
            addFieldError(fieldErrors, errors, field, "Enter a valid finite number.");
        } else if (Math.abs(value) > MAX_CLAMP_INPUT) {
            addFieldError(
                fieldErrors,
                errors,
                field,
                `Value exceeds the supported bound (${MAX_CLAMP_INPUT}).`
            );
        }
    }

    if (rootFontSize !== null && rootFontSize <= 0) {
        addFieldError(fieldErrors, errors, "rootFontSize", "Root font-size must be greater than 0px.");
    }
    if (minVw !== null && minVw <= 0) {
        addFieldError(fieldErrors, errors, "minVw", "Min viewport width must be greater than 0px.");
    }
    if (maxVw !== null && maxVw <= 0) {
        addFieldError(fieldErrors, errors, "maxVw", "Max viewport width must be greater than 0px.");
    }
    if (minVw !== null && maxVw !== null && minVw > 0 && maxVw > 0) {
        if (minVw === maxVw) {
            addFieldError(
                fieldErrors,
                errors,
                "maxVw",
                "Min and max viewport widths cannot be equal (division by zero)."
            );
        } else if (minVw > maxVw) {
            addFieldError(
                fieldErrors,
                errors,
                "maxVw",
                "Min viewport width must be smaller than max viewport width."
            );
        }
    }

    if (minSize !== null && minSize < 0) {
        addFieldError(fieldErrors, errors, "minSize", "Min size cannot be negative.");
    }
    if (maxSize !== null && maxSize < 0) {
        addFieldError(fieldErrors, errors, "maxSize", "Max size cannot be negative.");
    }
    if (minSize !== null && maxSize !== null && minSize >= 0 && maxSize >= 0 && minSize > maxSize) {
        addFieldError(
            fieldErrors,
            errors,
            "maxSize",
            "Min size must be less than or equal to max size (CSS clamp(min, val, max) locks to min when min > max)."
        );
    }

    if (errors.length > 0 || minVw === null || maxVw === null || minSize === null || maxSize === null || rootFontSize === null) {
        return { ok: false, fieldErrors, errors };
    }

    const minSizePx = input.unit === "rem" ? minSize * rootFontSize : minSize;
    const maxSizePx = input.unit === "rem" ? maxSize * rootFontSize : maxSize;

    const slope = (maxSizePx - minSizePx) / (maxVw - minVw);
    const vwCoefficient = slope * 100;
    const interceptPx = minSizePx - slope * minVw;

    const minSizeOut = input.unit === "rem" ? minSizePx / rootFontSize : minSizePx;
    const maxSizeOut = input.unit === "rem" ? maxSizePx / rootFontSize : maxSizePx;
    const interceptOut = input.unit === "rem" ? interceptPx / rootFontSize : interceptPx;

    const minStr = `${formatNumber(minSizeOut, 4)}${input.unit}`;
    const maxStr = `${formatNumber(maxSizeOut, 4)}${input.unit}`;

    const interceptRounded = roundTo(interceptOut, 4);
    const vwRounded = roundTo(vwCoefficient, 4);

    let preferredCss: string;
    if (vwRounded === 0) {
        preferredCss = minStr;
    } else if (interceptRounded === 0) {
        preferredCss = `${formatNumber(vwRounded, 4)}vw`;
    } else if (interceptRounded > 0) {
        preferredCss = `${formatNumber(interceptRounded, 4)}${input.unit} + ${formatNumber(vwRounded, 4)}vw`;
    } else {
        preferredCss = `${formatNumber(vwRounded, 4)}vw - ${formatNumber(Math.abs(interceptRounded), 4)}${input.unit}`;
    }

    const cssClamp = `clamp(${minStr}, ${preferredCss}, ${maxStr})`;
    const tailwindPreferred = preferredCss.replace(/\s+/g, "_");
    const tailwindClass = `text-[clamp(${minStr},${tailwindPreferred},${maxStr})]`;

    const notices: ClampNotice[] = [];

    if (minSizePx === 0 && maxSizePx === 0) {
        notices.push({
            code: "zero-sizes",
            severity: "info",
            message: "Both min and max sizes are 0, so the computed value stays 0 at all viewport widths.",
        });
    } else if (minSizePx === maxSizePx) {
        notices.push({
            code: "static-scale",
            severity: "info",
            message: "Min and max sizes are equal, so the value stays fixed with zero viewport slope.",
        });
    }

    if (
        minVw > 10_000 ||
        maxVw > 10_000 ||
        minSizePx > 2_000 ||
        maxSizePx > 2_000 ||
        rootFontSize < 8 ||
        rootFontSize > 64
    ) {
        notices.push({
            code: "extreme-values",
            severity: "warning",
            message: "One or more values are unusually large or small; verify rendered proportions before shipping.",
        });
    }

    if (input.unit === "px") {
        notices.push({
            code: "px-unit-a11y",
            severity: "info",
            message:
                "Pixel-based clamp() ignores the user's browser root font-size setting. Prefer rem units when sizing body copy or headings.",
        });
    } else if (slope > 0 && interceptPx <= 0 && minSizePx > 0) {
        notices.push({
            code: "zoom-slope-caution",
            severity: "info",
            message:
                "When the viewport term dominates a rem + vw expression, browser text zoom alone may scale the font less than expected; test at 200% zoom.",
        });
    }

    return {
        ok: true,
        unit: input.unit,
        rootFontSize,
        minVw,
        maxVw,
        minSizePx,
        maxSizePx,
        minSizeOut,
        maxSizeOut,
        slope,
        vwCoefficient,
        interceptPx,
        interceptOut,
        cssClamp,
        tailwindClass,
        notices,
    };
}

export function evaluateClampPx(result: ClampSuccess, viewportPx: number): number {
    if (viewportPx <= result.minVw) return result.minSizePx;
    if (viewportPx >= result.maxVw) return result.maxSizePx;
    return result.interceptPx + result.slope * viewportPx;
}

export function evaluateClampRem(result: ClampSuccess, viewportPx: number): number {
    return evaluateClampPx(result, viewportPx) / result.rootFontSize;
}
