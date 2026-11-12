import {
    parseCurlCommand,
    type CurlWarning,
    type FormField,
    type KeyValuePair,
    type ParsedCurlRequest,
} from "./curlParser.ts";

export type CurlTargetLanguage = "fetch" | "requests";

export type CurlConversionResult = {
    request: ParsedCurlRequest;
    code: string;
    warnings: CurlWarning[];
    error: string | null;
};

function appendWarning(list: CurlWarning[], warning: CurlWarning): void {
    if (!list.some((w) => w.flag === warning.flag && w.message === warning.message)) {
        list.push(warning);
    }
}

function hasDuplicateKeys(pairs: KeyValuePair[], caseInsensitive = false): boolean {
    const seen = new Set<string>();
    for (const pair of pairs) {
        const key = caseInsensitive ? pair.key.toLowerCase() : pair.key;
        if (seen.has(key)) return true;
        seen.add(key);
    }
    return false;
}

/**
 * Encodes a UTF-8 string into Base64 cleanly in both browsers and Node without Buffer.
 */
export function encodeUtf8Base64(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

/**
 * Safely serializes an arbitrary string as a Python double-quoted string literal.
 */
export function serializePythonString(value: string): string {
    let out = '"';
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        const ch = value[i];
        switch (ch) {
            case "\\":
                out += "\\\\";
                break;
            case '"':
                out += '\\"';
                break;
            case "\n":
                out += "\\n";
                break;
            case "\r":
                out += "\\r";
                break;
            case "\t":
                out += "\\t";
                break;
            case "\b":
                out += "\\b";
                break;
            case "\f":
                out += "\\f";
                break;
            default:
                if (code < 0x20 || code === 0x7f) {
                    out += `\\x${code.toString(16).padStart(2, "0")}`;
                } else {
                    out += ch;
                }
        }
    }
    out += '"';
    return out;
}

function serializePythonValue(val: unknown, level = 0): string {
    if (val === null || val === undefined) return "None";
    if (typeof val === "boolean") return val ? "True" : "False";
    if (typeof val === "number") return Number.isFinite(val) ? String(val) : "None";
    if (typeof val === "string") return serializePythonString(val);

    const indent = "    ".repeat(level);
    const childIndent = "    ".repeat(level + 1);

    if (Array.isArray(val)) {
        if (val.length === 0) return "[]";
        const items = val.map((item) => `${childIndent}${serializePythonValue(item, level + 1)}`);
        return `[\n${items.join(",\n")},\n${indent}]`;
    }

    if (typeof val === "object") {
        const entries = Object.entries(val as Record<string, unknown>);
        if (entries.length === 0) return "{}";
        const lines = entries.map(
            ([k, v]) => `${childIndent}${serializePythonString(k)}: ${serializePythonValue(v, level + 1)}`
        );
        return `{\n${lines.join(",\n")},\n${indent}}`;
    }

    return serializePythonString(String(val));
}

function serializePythonDictPairs(pairs: KeyValuePair[]): string {
    if (pairs.length === 0) return "{}";
    const lines = pairs.map((p) => `    ${serializePythonString(p.key)}: ${serializePythonString(p.value)},`);
    return `{\n${lines.join("\n")}\n}`;
}

function serializePythonTupleList(pairs: KeyValuePair[]): string {
    const lines = pairs.map((p) => `    (${serializePythonString(p.key)}, ${serializePythonString(p.value)}),`);
    return `[\n${lines.join("\n")}\n]`;
}

function serializeJsPairObject(pairs: KeyValuePair[], baseIndent = "  "): string {
    if (pairs.length === 0) return "{}";
    const inner = "  " + baseIndent;
    const lines = pairs.map((p) => `${inner}${JSON.stringify(p.key)}: ${JSON.stringify(p.value)},`);
    return `{\n${lines.join("\n")}\n${baseIndent}}`;
}

function mergeDuplicateHeadersForPython(
    headers: KeyValuePair[],
    warnings: CurlWarning[]
): KeyValuePair[] {
    const merged: KeyValuePair[] = [];
    const indexByLowerKey = new Map<string, number>();

    for (const h of headers) {
        const lower = h.key.toLowerCase();
        const existingIdx = indexByLowerKey.get(lower);
        if (existingIdx !== undefined) {
            appendWarning(warnings, {
                flag: "duplicate-header",
                message: `Duplicate header "${h.key}" was combined with ', ' for Python dict syntax.`,
                severity: "info",
            });
            merged[existingIdx] = {
                key: merged[existingIdx].key,
                value: `${merged[existingIdx].value}, ${h.value}`,
            };
        } else {
            indexByLowerKey.set(lower, merged.length);
            merged.push({ ...h });
        }
    }

    return merged;
}

function buildCookieHeaderString(cookies: KeyValuePair[]): string {
    return cookies.map((c) => (c.value ? `${c.key}=${c.value}` : c.key)).join("; ");
}

/**
 * Generates an idiomatic JavaScript fetch() snippet from a parsed cURL request.
 */
export function generateFetchCode(req: ParsedCurlRequest, warnings: CurlWarning[]): string {
    const lines: string[] = [];
    const headers: KeyValuePair[] = [...req.headers];

    // Basic Auth -> UTF-8 safe Base64 Authorization header (unless already set explicitly)
    if (req.auth) {
        const hasAuthHeader = headers.some((h) => h.key.toLowerCase() === "authorization");
        if (!hasAuthHeader) {
            const token = encodeUtf8Base64(`${req.auth.username}:${req.auth.password}`);
            headers.push({ key: "Authorization", value: `Basic ${token}` });
        } else {
            appendWarning(warnings, {
                flag: "--user",
                message: "Both -u (--user) and an explicit Authorization header were found; kept the explicit Authorization header.",
                severity: "warning",
            });
        }
    }

    // Cookies -> Cookie header + browser vs Node info notice
    if (req.cookies.length > 0) {
        headers.push({ key: "Cookie", value: buildCookieHeaderString(req.cookies) });
        appendWarning(warnings, {
            flag: "cookie-fetch",
            message:
                "Browser fetch() ignores manually set Cookie headers (use credentials: 'include' for browser session cookies), whereas Node.js fetch() sends them.",
            severity: "info",
        });
    }

    // Forbidden browser fetch headers: Host & Referer
    if (headers.some((h) => h.key.toLowerCase() === "host")) {
        appendWarning(warnings, {
            flag: "host-fetch",
            message:
                "Browsers ignore manually set Host headers in fetch() (forbidden header name), whereas Node.js fetch() or Python requests can send custom Host headers.",
            severity: "info",
        });
    }

    let refererValue: string | undefined;
    const filteredHeaders: KeyValuePair[] = [];
    for (const h of headers) {
        const lowerKey = h.key.toLowerCase();
        if (lowerKey === "referer") {
            refererValue = h.value;
            continue;
        }
        if (req.body.kind === "multipart" && lowerKey === "content-type") {
            appendWarning(warnings, {
                flag: "multipart-content-type",
                message:
                    "Omitted manual Content-Type header for FormData so fetch() automatically attaches the multipart boundary.",
                severity: "info",
            });
            continue;
        }
        filteredHeaders.push(h);
    }

    if (refererValue !== undefined) {
        appendWarning(warnings, {
            flag: "referer-fetch",
            message:
                "Browsers ignore manual Referer headers in fetch() (forbidden header name), so it was mapped to the fetch `referrer` option; browser Referrer-Policy still governs cross-origin sending.",
            severity: "info",
        });
    }

    // URL & query parameters
    let urlExpr: string;
    if (req.queryParams.length > 0) {
        lines.push(`const url = new URL(${JSON.stringify(req.url)});`);
        for (const q of req.queryParams) {
            lines.push(`url.searchParams.append(${JSON.stringify(q.key)}, ${JSON.stringify(q.value)});`);
        }
        lines.push("");
        urlExpr = "url";
    } else {
        urlExpr = JSON.stringify(req.url);
    }

    // Body setup (when hoisted variable is clearer: urlencoded / multipart)
    let bodyExpr: string | null = null;
    if (req.body.kind === "json") {
        const formatted = JSON.stringify(req.body.parsed, null, 2);
        const indented = formatted
            .split("\n")
            .map((line, idx) => (idx === 0 ? line : `  ${line}`))
            .join("\n");
        bodyExpr = `JSON.stringify(${indented})`;
    } else if (req.body.kind === "text") {
        bodyExpr = JSON.stringify(req.body.raw);
    } else if (req.body.kind === "urlencoded") {
        const tuples = req.body.entries
            .map((e) => `  [${JSON.stringify(e.key)}, ${JSON.stringify(e.value)}],`)
            .join("\n");
        lines.push(`const formBody = new URLSearchParams([\n${tuples}\n]);`);
        lines.push("");
        bodyExpr = "formBody";
    } else if (req.body.kind === "multipart") {
        lines.push("const formData = new FormData();");
        for (const field of req.body.fields) {
            if (field.isFile) {
                const nameLit = JSON.stringify(field.name);
                const fileLit = JSON.stringify(field.filename ?? "file");
                lines.push(
                    `// Provide a browser File/Blob or Node Blob for ${fileLit}`
                );
                lines.push(`formData.append(${nameLit}, new Blob([]), ${fileLit});`);
            } else {
                lines.push(`formData.append(${JSON.stringify(field.name)}, ${JSON.stringify(field.value)});`);
            }
        }
        lines.push("");
        bodyExpr = "formData";
    }

    const needsOptions =
        req.method !== "GET" || filteredHeaders.length > 0 || bodyExpr !== null || refererValue !== undefined;

    if (!needsOptions) {
        lines.push(`const response = await fetch(${urlExpr});`);
    } else {
        const optLines: string[] = [];
        if (req.method !== "GET") {
            optLines.push(`  method: ${JSON.stringify(req.method)},`);
        }
        if (filteredHeaders.length > 0) {
            if (hasDuplicateKeys(filteredHeaders, true)) {
                const entries = filteredHeaders
                    .map((h) => `    [${JSON.stringify(h.key)}, ${JSON.stringify(h.value)}],`)
                    .join("\n");
                optLines.push(`  headers: new Headers([\n${entries}\n  ]),`);
            } else {
                optLines.push(`  headers: ${serializeJsPairObject(filteredHeaders, "  ")},`);
            }
        }
        if (refererValue !== undefined) {
            optLines.push(`  referrer: ${JSON.stringify(refererValue)},`);
        }
        if (bodyExpr !== null) {
            optLines.push(`  body: ${bodyExpr},`);
        }
        lines.push(`const response = await fetch(${urlExpr}, {\n${optLines.join("\n")}\n});`);
    }

    lines.push("const data = await response.text();");
    lines.push("console.log(response.status, data);");

    return lines.join("\n");
}

function resolveRequestsMethodCall(method: string): { fnCall: string; needsMethodArg: boolean } {
    const standard = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
    if (standard.has(method)) {
        return { fnCall: `requests.${method.toLowerCase()}`, needsMethodArg: false };
    }
    return { fnCall: "requests.request", needsMethodArg: true };
}

function buildPythonMultipartSetup(
    fields: FormField[],
    lines: string[]
): { usesData: boolean; usesFiles: boolean } {
    const textFields = fields.filter((f) => !f.isFile);
    const fileFields = fields.filter((f) => f.isFile);

    if (textFields.length > 0) {
        const entries = textFields.map(
            (f) => `    ${serializePythonString(f.name)}: ${serializePythonString(f.value)},`
        );
        lines.push(`data = {\n${entries.join("\n")}\n}`);
        lines.push("");
    }

    if (fileFields.length > 0) {
        const entries = fileFields.map((f) => {
            const pathLit = serializePythonString(f.filename ?? "file");
            return `    ${serializePythonString(f.name)}: open(${pathLit}, "rb"),`;
        });
        lines.push(`files = {\n${entries.join("\n")}\n}`);
        lines.push("");
    }

    return { usesData: textFields.length > 0, usesFiles: fileFields.length > 0 };
}

/**
 * Generates an idiomatic Python `requests` snippet from a parsed cURL request.
 */
export function generatePythonRequestsCode(req: ParsedCurlRequest, warnings: CurlWarning[]): string {
    const lines: string[] = ["import requests", ""];
    lines.push(`url = ${serializePythonString(req.url)}`);
    lines.push("");

    const callArgs: string[] = [];
    const { fnCall, needsMethodArg } = resolveRequestsMethodCall(req.method);
    if (needsMethodArg) {
        callArgs.push(serializePythonString(req.method));
    }
    callArgs.push("url");

    // Query parameters (use list of tuples when duplicate keys exist)
    if (req.queryParams.length > 0) {
        if (hasDuplicateKeys(req.queryParams)) {
            lines.push(`params = ${serializePythonTupleList(req.queryParams)}`);
        } else {
            lines.push(`params = ${serializePythonDictPairs(req.queryParams)}`);
        }
        lines.push("");
        callArgs.push("params=params");
    }

    // Headers
    let effectiveHeaders = [...req.headers];
    if (req.body.kind === "multipart") {
        effectiveHeaders = effectiveHeaders.filter((h) => {
            const isCt = h.key.toLowerCase() === "content-type";
            if (isCt) {
                appendWarning(warnings, {
                    flag: "multipart-content-type",
                    message:
                        "Omitted manual Content-Type header for multipart upload so Python requests generates the boundary automatically.",
                    severity: "info",
                });
            }
            return !isCt;
        });
    }
    const mergedHeaders = mergeDuplicateHeadersForPython(effectiveHeaders, warnings);
    if (mergedHeaders.length > 0) {
        lines.push(`headers = ${serializePythonDictPairs(mergedHeaders)}`);
        lines.push("");
        callArgs.push("headers=headers");
    }

    // Cookies
    if (req.cookies.length > 0) {
        lines.push(`cookies = ${serializePythonDictPairs(req.cookies)}`);
        lines.push("");
        callArgs.push("cookies=cookies");
    }

    // Auth
    if (req.auth) {
        lines.push(`auth = (${serializePythonString(req.auth.username)}, ${serializePythonString(req.auth.password)})`);
        lines.push("");
        callArgs.push("auth=auth");
    }

    // Body
    if (req.body.kind === "json") {
        lines.push(`json_payload = ${serializePythonValue(req.body.parsed)}`);
        lines.push("");
        callArgs.push("json=json_payload");
    } else if (req.body.kind === "urlencoded") {
        if (hasDuplicateKeys(req.body.entries)) {
            lines.push(`data = ${serializePythonTupleList(req.body.entries)}`);
        } else {
            lines.push(`data = ${serializePythonDictPairs(req.body.entries)}`);
        }
        lines.push("");
        callArgs.push("data=data");
    } else if (req.body.kind === "text") {
        lines.push(`data = ${serializePythonString(req.body.raw)}`);
        lines.push("");
        callArgs.push("data=data");
    } else if (req.body.kind === "multipart") {
        const { usesData, usesFiles } = buildPythonMultipartSetup(req.body.fields, lines);
        if (usesData) callArgs.push("data=data");
        if (usesFiles) callArgs.push("files=files");
    }

    if (callArgs.length <= 2) {
        lines.push(`response = ${fnCall}(${callArgs.join(", ")})`);
    } else {
        const formattedArgs = callArgs.map((a) => `    ${a},`).join("\n");
        lines.push(`response = ${fnCall}(\n${formattedArgs}\n)`);
    }

    lines.push("print(response.status_code)");
    lines.push("print(response.text)");

    return lines.join("\n");
}

/**
 * Parses a cURL command and emits target code alongside structured warnings.
 */
export function convertCurl(rawInput: string, target: CurlTargetLanguage): CurlConversionResult {
    const request = parseCurlCommand(rawInput);
    const warnings: CurlWarning[] = [...request.warnings];

    if (!rawInput.trim() || request.error) {
        return {
            request,
            code: "",
            warnings,
            error: request.error,
        };
    }

    const code =
        target === "fetch"
            ? generateFetchCode(request, warnings)
            : generatePythonRequestsCode(request, warnings);

    return {
        request,
        code,
        warnings,
        error: null,
    };
}
