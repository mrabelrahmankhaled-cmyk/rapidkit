export type CurlWarningSeverity = "info" | "warning";

export type CurlWarning = {
    flag: string;
    message: string;
    severity: CurlWarningSeverity;
};

export type KeyValuePair = {
    key: string;
    value: string;
};

export type FormField = {
    name: string;
    value: string;
    isFile: boolean;
    filename?: string;
};

export type ParsedCurlBody =
    | { kind: "none" }
    | { kind: "json"; raw: string; parsed: unknown }
    | { kind: "urlencoded"; entries: KeyValuePair[]; raw: string }
    | { kind: "text"; raw: string }
    | { kind: "multipart"; fields: FormField[] };

export type ParsedCurlAuth = {
    type: "basic";
    username: string;
    password: string;
};

export type ParsedCurlRequest = {
    method: string;
    url: string;
    rawUrl: string;
    queryParams: KeyValuePair[];
    headers: KeyValuePair[];
    cookies: KeyValuePair[];
    auth?: ParsedCurlAuth;
    body: ParsedCurlBody;
    warnings: CurlWarning[];
    error: string | null;
};

type TokenizeResult = {
    tokens: string[];
    warnings: CurlWarning[];
    error: string | null;
};

type FlagSpec = {
    takesValue: boolean;
    supported: boolean;
    note?: string;
};

// Complete arity table for supported and common unsupported cURL flags so
// value-taking flags never leak their arguments as positional URLs.
const LONG_FLAGS: Record<string, FlagSpec> = {
    "--request": { takesValue: true, supported: true },
    "--url": { takesValue: true, supported: true },
    "--header": { takesValue: true, supported: true },
    "--user": { takesValue: true, supported: true },
    "--data": { takesValue: true, supported: true },
    "--data-raw": { takesValue: true, supported: true },
    "--data-ascii": { takesValue: true, supported: true },
    "--data-urlencode": { takesValue: true, supported: true },
    "--data-binary": { takesValue: true, supported: true },
    "--form": { takesValue: true, supported: true },
    "--form-string": { takesValue: true, supported: true },
    "--cookie": { takesValue: true, supported: true },
    "--user-agent": { takesValue: true, supported: true },
    "--referer": { takesValue: true, supported: true },
    "--oauth2-bearer": { takesValue: true, supported: true },
    "--get": { takesValue: false, supported: true },
    "--head": { takesValue: false, supported: true },
    "--location": {
        takesValue: false,
        supported: false,
        note: "Redirect following (-L/--location) is automatic by default in fetch() and Python requests.",
    },
    "--insecure": {
        takesValue: false,
        supported: false,
        note: "-k/--insecure was detected. TLS verification is NOT disabled automatically in generated code for security.",
    },
    "--compressed": {
        takesValue: false,
        supported: false,
        note: "--compressed was omitted; fetch() and Python requests negotiate compressed responses automatically.",
    },
    "--silent": { takesValue: false, supported: false, note: "-s/--silent is a CLI output flag and was omitted." },
    "--show-error": { takesValue: false, supported: false, note: "-S/--show-error is a CLI flag and was omitted." },
    "--include": { takesValue: false, supported: false, note: "-i/--include prints response headers in CLI and was omitted." },
    "--verbose": { takesValue: false, supported: false, note: "-v/--verbose is a CLI diagnostic flag and was omitted." },
    "--fail": { takesValue: false, supported: false, note: "-f/--fail HTTP error handling must be checked explicitly in code (response.ok / raise_for_status)." },
    "--http1.1": { takesValue: false, supported: false, note: "HTTP protocol selection flags (--http1.1) are controlled by the runtime/transport." },
    "--http2": { takesValue: false, supported: false, note: "HTTP/2 negotiation (--http2) is controlled by the runtime/transport." },
    "--tlsv1.2": { takesValue: false, supported: false, note: "TLS version flags (--tlsv1.2) are not represented in portable snippets." },
    "--digest": { takesValue: false, supported: false, note: "HTTP Digest authentication (--digest) requires extra client support not generated automatically." },
    "--ntlm": { takesValue: false, supported: false, note: "NTLM authentication (--ntlm) is not supported in standard fetch()/requests snippets." },
    "--proxy": { takesValue: true, supported: false, note: "Proxy configuration (--proxy) is environment-specific and was omitted." },
    "--proxy-user": { takesValue: true, supported: false, note: "Proxy credentials (--proxy-user) were omitted." },
    "--max-time": { takesValue: true, supported: false, note: "Request timeout (--max-time) was omitted; configure AbortSignal / timeout=... manually." },
    "--connect-timeout": { takesValue: true, supported: false, note: "Connection timeout (--connect-timeout) was omitted." },
    "--retry": { takesValue: true, supported: false, note: "Retry policies (--retry) must be implemented explicitly in application code." },
    "--retry-delay": { takesValue: true, supported: false, note: "Retry delay (--retry-delay) was omitted." },
    "--output": { takesValue: true, supported: false, note: "CLI file output (-o/--output) was omitted." },
    "--cookie-jar": { takesValue: true, supported: false, note: "Cookie jar persistence (-c/--cookie-jar) is not represented automatically." },
    "--resolve": { takesValue: true, supported: false, note: "Custom DNS resolution (--resolve) is not supported in browser fetch()." },
    "--connect-to": { takesValue: true, supported: false, note: "Custom host routing (--connect-to) is not represented in generated code." },
    "--interface": { takesValue: true, supported: false, note: "Network interface binding (--interface) was omitted." },
    "--cacert": { takesValue: true, supported: false, note: "Custom CA certificate path (--cacert) cannot be read from the browser." },
    "--cert": { takesValue: true, supported: false, note: "Client TLS certificate (--cert) cannot be loaded from local disk paths automatically." },
    "--key": { takesValue: true, supported: false, note: "Client TLS private key (--key) cannot be loaded from local disk paths automatically." },
    "--capath": { takesValue: true, supported: false, note: "CA directory (--capath) was omitted." },
    "--upload-file": { takesValue: true, supported: false, note: "File upload via -T/--upload-file is not converted automatically." },
    "--unix-socket": { takesValue: true, supported: false, note: "Unix domain socket (--unix-socket) is not supported in browser fetch() or default requests." },
    "--write-out": { takesValue: true, supported: false, note: "CLI output formatting (-w/--write-out) was omitted." },
    "--dump-header": { takesValue: true, supported: false, note: "Header dump file (-D/--dump-header) was omitted." },
    "--max-redirs": { takesValue: true, supported: false, note: "Redirect cap (--max-redirs) was omitted." },
    "--limit-rate": { takesValue: true, supported: false, note: "Bandwidth throttling (--limit-rate) was omitted." },
    "--config": { takesValue: true, supported: false, note: "External cURL config files (-K/--config) cannot be read from the browser." },
    "--globoff": { takesValue: false, supported: false, note: "URL globbing disable flag (-g/--globoff) was omitted." },
};

const SHORT_FLAGS: Record<string, { longName: string; spec: FlagSpec }> = {
    X: { longName: "--request", spec: LONG_FLAGS["--request"] },
    H: { longName: "--header", spec: LONG_FLAGS["--header"] },
    u: { longName: "--user", spec: LONG_FLAGS["--user"] },
    d: { longName: "--data", spec: LONG_FLAGS["--data"] },
    F: { longName: "--form", spec: LONG_FLAGS["--form"] },
    b: { longName: "--cookie", spec: LONG_FLAGS["--cookie"] },
    A: { longName: "--user-agent", spec: LONG_FLAGS["--user-agent"] },
    e: { longName: "--referer", spec: LONG_FLAGS["--referer"] },
    G: { longName: "--get", spec: LONG_FLAGS["--get"] },
    I: { longName: "--head", spec: LONG_FLAGS["--head"] },
    L: { longName: "--location", spec: LONG_FLAGS["--location"] },
    k: { longName: "--insecure", spec: LONG_FLAGS["--insecure"] },
    s: { longName: "--silent", spec: LONG_FLAGS["--silent"] },
    S: { longName: "--show-error", spec: LONG_FLAGS["--show-error"] },
    i: { longName: "--include", spec: LONG_FLAGS["--include"] },
    v: { longName: "--verbose", spec: LONG_FLAGS["--verbose"] },
    f: { longName: "--fail", spec: LONG_FLAGS["--fail"] },
    x: { longName: "--proxy", spec: LONG_FLAGS["--proxy"] },
    U: { longName: "--proxy-user", spec: LONG_FLAGS["--proxy-user"] },
    m: { longName: "--max-time", spec: LONG_FLAGS["--max-time"] },
    o: { longName: "--output", spec: LONG_FLAGS["--output"] },
    c: { longName: "--cookie-jar", spec: LONG_FLAGS["--cookie-jar"] },
    E: { longName: "--cert", spec: LONG_FLAGS["--cert"] },
    T: { longName: "--upload-file", spec: LONG_FLAGS["--upload-file"] },
    w: { longName: "--write-out", spec: LONG_FLAGS["--write-out"] },
    D: { longName: "--dump-header", spec: LONG_FLAGS["--dump-header"] },
    K: { longName: "--config", spec: LONG_FLAGS["--config"] },
    g: { longName: "--globoff", spec: LONG_FLAGS["--globoff"] },
};

function addWarning(list: CurlWarning[], flag: string, message: string, severity: CurlWarningSeverity = "warning"): void {
    if (!list.some((w) => w.flag === flag && w.message === message)) {
        list.push({ flag, message, severity });
    }
}

function decodeAnsiEscape(input: string, index: number): { char: string; nextIndex: number } {
    const ch = input[index];
    switch (ch) {
        case "n": return { char: "\n", nextIndex: index + 1 };
        case "r": return { char: "\r", nextIndex: index + 1 };
        case "t": return { char: "\t", nextIndex: index + 1 };
        case "b": return { char: "\b", nextIndex: index + 1 };
        case "f": return { char: "\f", nextIndex: index + 1 };
        case "v": return { char: "\v", nextIndex: index + 1 };
        case "a": return { char: "\u0007", nextIndex: index + 1 };
        case "e": return { char: "\u001b", nextIndex: index + 1 };
        case "\\": return { char: "\\", nextIndex: index + 1 };
        case "'": return { char: "'", nextIndex: index + 1 };
        case '"': return { char: '"', nextIndex: index + 1 };
        case "x": {
            const hex = input.slice(index + 1, index + 3);
            if (/^[0-9a-fA-F]{2}$/.test(hex)) {
                return { char: String.fromCharCode(parseInt(hex, 16)), nextIndex: index + 3 };
            }
            return { char: "\\x", nextIndex: index + 1 };
        }
        case "u": {
            const hex = input.slice(index + 1, index + 5);
            if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                return { char: String.fromCharCode(parseInt(hex, 16)), nextIndex: index + 5 };
            }
            return { char: "\\u", nextIndex: index + 1 };
        }
        default:
            return { char: ch ?? "", nextIndex: index + 1 };
    }
}

/**
 * Tokenizes a POSIX shell cURL command safely without evaluating shell expressions.
 */
export function tokenizeCurlCommand(rawInput: string): TokenizeResult {
    const warnings: CurlWarning[] = [];
    let src = rawInput.replace(/\r\n?/g, "\n").trim();

    if (!src) {
        return { tokens: [], warnings, error: null };
    }

    // Strip optional leading shell prompt ($ curl ... or # curl ...)
    src = src.replace(/^\s*[$#]\s+(?=curl\b)/i, "");

    // Detect Windows cmd.exe caret escapes (^\n or ^") before POSIX tokenization
    const hasCmdCarets = /\^\s*\n|\^["&|<>^]/.test(src);
    if (hasCmdCarets) {
        addWarning(
            warnings,
            "cmd-syntax",
            'Windows cmd.exe caret escaping (^) was detected. Use "Copy as cURL (bash)" in DevTools for best accuracy.',
            "warning"
        );
        src = src.replace(/\^[ \t]*\n/g, " ").replace(/\^([\\"&|<>^%])/g, "$1");
    }

    const tokens: string[] = [];
    let current = "";
    let hasToken = false;
    let state: "normal" | "single" | "double" | "ansi" = "normal";
    let stoppedAtPipeline = false;

    const flush = () => {
        if (hasToken) {
            tokens.push(current);
            current = "";
            hasToken = false;
        }
    };

    let i = 0;
    while (i < src.length) {
        const ch = src[i];

        if (state === "single") {
            if (ch === "'") {
                state = "normal";
            } else {
                current += ch;
            }
            i++;
            continue;
        }

        if (state === "ansi") {
            if (ch === "'") {
                state = "normal";
                i++;
                continue;
            }
            if (ch === "\\" && i + 1 < src.length) {
                const decoded = decodeAnsiEscape(src, i + 1);
                current += decoded.char;
                i = decoded.nextIndex;
                continue;
            }
            current += ch;
            i++;
            continue;
        }

        if (state === "double") {
            if (ch === '"') {
                state = "normal";
                i++;
                continue;
            }
            if (ch === "\\") {
                const next = src[i + 1];
                if (next === "\n") {
                    i += 2;
                    continue;
                }
                if (next === '"' || next === "\\" || next === "$" || next === "`") {
                    current += next;
                    i += 2;
                    continue;
                }
                current += "\\";
                i++;
                continue;
            }
            if (ch === "$" && /[A-Za-z_{(]/.test(src[i + 1] ?? "")) {
                addWarning(
                    warnings,
                    "shell-var",
                    "Shell variable or command substitution ($...) was kept as a literal placeholder and not evaluated.",
                    "warning"
                );
            }
            current += ch;
            i++;
            continue;
        }

        // state === "normal"
        if (ch === "\\" && src[i + 1] === "\n") {
            i += 2;
            continue;
        }

        if (/\s/.test(ch)) {
            flush();
            i++;
            continue;
        }

        if (ch === "#" && !hasToken) {
            const nl = src.indexOf("\n", i);
            if (nl === -1) break;
            i = nl + 1;
            continue;
        }

        // Stop at unquoted shell pipeline or command separator
        if (ch === "|" || ch === ";" || (ch === "&" && src[i + 1] === "&")) {
            flush();
            const rest = src.slice(i).trim();
            if (rest) {
                stoppedAtPipeline = true;
            }
            break;
        }

        if (ch === "$" && src[i + 1] === "'") {
            state = "ansi";
            hasToken = true;
            i += 2;
            continue;
        }

        if (ch === "'") {
            state = "single";
            hasToken = true;
            i++;
            continue;
        }

        if (ch === '"') {
            state = "double";
            hasToken = true;
            i++;
            continue;
        }

        if (ch === "\\") {
            if (i + 1 < src.length) {
                current += src[i + 1];
                hasToken = true;
                i += 2;
                continue;
            }
        }

        if (ch === "$" && /[A-Za-z_{(]/.test(src[i + 1] ?? "")) {
            addWarning(
                warnings,
                "shell-var",
                "Shell variable or command substitution ($...) was kept as a literal placeholder and not evaluated.",
                "warning"
            );
        }

        current += ch;
        hasToken = true;
        i++;
    }

    if (state !== "normal") {
        return {
            tokens: [],
            warnings,
            error: "Unterminated quote detected in cURL command. Check matching single or double quotes.",
        };
    }

    flush();

    if (stoppedAtPipeline) {
        addWarning(
            warnings,
            "pipeline",
            "Trailing shell pipeline or chained command (|, &&, ;) was ignored; only the first curl command was parsed.",
            "warning"
        );
    }

    return { tokens, warnings, error: null };
}

function parseInlineCookies(cookieHeaderValue: string): KeyValuePair[] {
    const pairs: KeyValuePair[] = [];
    for (const part of cookieHeaderValue.split(";")) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) {
            pairs.push({ key: trimmed, value: "" });
        } else {
            pairs.push({
                key: trimmed.slice(0, eqIdx).trim(),
                value: trimmed.slice(eqIdx + 1).trim(),
            });
        }
    }
    return pairs;
}

function parseFormField(raw: string, allowFilePrefix: boolean): { field: FormField; hasTypeMeta: boolean } {
    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) {
        return { field: { name: raw.trim(), value: "", isFile: false }, hasTypeMeta: false };
    }
    const name = raw.slice(0, eqIdx).trim();
    const rawValue = raw.slice(eqIdx + 1);
    if (allowFilePrefix && rawValue.startsWith("@")) {
        const afterAt = rawValue.slice(1);
        const semiIdx = afterAt.indexOf(";");
        const filename = (semiIdx === -1 ? afterAt : afterAt.slice(0, semiIdx)).trim() || "file";
        return {
            field: { name, value: filename, isFile: true, filename },
            hasTypeMeta: semiIdx !== -1,
        };
    }
    return {
        field: { name, value: rawValue, isFile: false },
        hasTypeMeta: false,
    };
}

function parseQueryStringPairs(query: string): KeyValuePair[] {
    if (!query) return [];
    const cleaned = query.startsWith("?") ? query.slice(1) : query;
    const params = new URLSearchParams(cleaned);
    const pairs: KeyValuePair[] = [];
    params.forEach((value, key) => {
        pairs.push({ key, value });
    });
    return pairs;
}

function parseUrlencodePart(raw: string): KeyValuePair {
    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) {
        return { key: "", value: raw };
    }
    return {
        key: raw.slice(0, eqIdx),
        value: raw.slice(eqIdx + 1),
    };
}

function looksLikeFormEncoded(raw: string): boolean {
    if (!raw || raw.includes("\n") || raw.includes("\r")) return false;
    const segments = raw.split("&");
    return segments.length > 0 && segments.every((seg) => /^[^=\s]+=.*$/.test(seg));
}

function findHeaderValue(headers: KeyValuePair[], headerName: string): string | undefined {
    const target = headerName.toLowerCase();
    for (let idx = headers.length - 1; idx >= 0; idx--) {
        if (headers[idx].key.toLowerCase() === target) {
            return headers[idx].value;
        }
    }
    return undefined;
}

function createEmptyResult(warnings: CurlWarning[], error: string | null): ParsedCurlRequest {
    return {
        method: "GET",
        url: "",
        rawUrl: "",
        queryParams: [],
        headers: [],
        cookies: [],
        body: { kind: "none" },
        warnings,
        error,
    };
}

/**
 * Parses a cURL CLI string into a normalized intermediate representation (IR).
 * Never performs network calls or evaluates shell expressions.
 */
export function parseCurlCommand(rawInput: string): ParsedCurlRequest {
    const { tokens, warnings, error: tokError } = tokenizeCurlCommand(rawInput);
    if (tokError) {
        return createEmptyResult(warnings, tokError);
    }
    if (tokens.length === 0) {
        return createEmptyResult(warnings, null);
    }

    const firstBase = tokens[0].split(/[\\/]/).pop()?.toLowerCase().replace(/\.exe$/, "");
    if (firstBase !== "curl") {
        return createEmptyResult(
            warnings,
            'Input must start with "curl" (for example: curl https://api.example.com).'
        );
    }

    let explicitMethod: string | null = null;
    let useGetMode = false;
    let useHeadMode = false;
    let candidateUrl = "";
    const headers: KeyValuePair[] = [];
    const cookies: KeyValuePair[] = [];
    let auth: ParsedCurlAuth | undefined;
    const dataParts: { value: string; kind: "data" | "raw" | "urlencode" | "binary" }[] = [];
    const formFields: FormField[] = [];

    const consumeFlagValue = (inlineVal: string | undefined, idx: number, flagLabel: string): { value: string | null; nextIdx: number } => {
        if (inlineVal !== undefined) {
            return { value: inlineVal, nextIdx: idx };
        }
        if (idx + 1 < tokens.length) {
            return { value: tokens[idx + 1], nextIdx: idx + 1 };
        }
        addWarning(warnings, flagLabel, `Flag ${flagLabel} expects a value, but reached end of command.`, "warning");
        return { value: null, nextIdx: idx };
    };

    const applyFlag = (canonicalFlag: string, val: string | null) => {
        if (val === null) return;
        switch (canonicalFlag) {
            case "--request":
                explicitMethod = val.trim().toUpperCase();
                break;
            case "--url":
                if (!candidateUrl) candidateUrl = val.trim();
                else addWarning(warnings, "--url", `Multiple URLs detected; ignored extra URL "${val}".`, "warning");
                break;
            case "--header": {
                const colonIdx = val.indexOf(":");
                if (colonIdx === -1) {
                    addWarning(warnings, "--header", `Header "${val}" is missing ':' and was ignored.`, "info");
                    break;
                }
                const hKey = val.slice(0, colonIdx).trim();
                const hVal = val.slice(colonIdx + 1).trim();
                if (!hKey) break;
                if (!hVal) {
                    addWarning(warnings, hKey, `Empty header removal (-H "${hKey}:") was omitted.`, "info");
                    break;
                }
                if (hKey.toLowerCase() === "cookie") {
                    cookies.push(...parseInlineCookies(hVal));
                    break;
                }
                if (hKey.toLowerCase() === "content-length") {
                    addWarning(warnings, "Content-Length", "Explicit Content-Length header was omitted so the HTTP client computes byte length accurately.", "info");
                    break;
                }
                headers.push({ key: hKey, value: hVal });
                break;
            }
            case "--user": {
                const colonIdx = val.indexOf(":");
                if (colonIdx === -1) {
                    auth = { type: "basic", username: val, password: "" };
                    addWarning(warnings, "--user", `No ':' password separator in -u "${val}"; password left empty.`, "warning");
                } else {
                    auth = {
                        type: "basic",
                        username: val.slice(0, colonIdx),
                        password: val.slice(colonIdx + 1),
                    };
                }
                break;
            }
            case "--oauth2-bearer":
                headers.push({ key: "Authorization", value: `Bearer ${val}` });
                break;
            case "--user-agent":
                headers.push({ key: "User-Agent", value: val });
                break;
            case "--referer":
                headers.push({ key: "Referer", value: val });
                break;
            case "--cookie":
                if (!val.includes("=")) {
                    addWarning(
                        warnings,
                        "--cookie",
                        `Cookie-jar file "${val}" cannot be read from the browser; pass inline "name=value" cookies if needed.`,
                        "warning"
                    );
                } else {
                    cookies.push(...parseInlineCookies(val));
                }
                break;
            case "--data":
            case "--data-ascii":
                if (val.startsWith("@")) {
                    addWarning(
                        warnings,
                        "--data",
                        `File payload "${val}" cannot be read from disk in the browser; kept placeholder string.`,
                        "warning"
                    );
                }
                dataParts.push({ value: val, kind: "data" });
                break;
            case "--data-raw":
                dataParts.push({ value: val, kind: "raw" });
                break;
            case "--data-urlencode":
                dataParts.push({ value: val, kind: "urlencode" });
                break;
            case "--data-binary":
                if (val.startsWith("@")) {
                    addWarning(
                        warnings,
                        "--data-binary",
                        `Binary file payload "${val}" cannot be read from disk in the browser; kept placeholder string.`,
                        "warning"
                    );
                }
                dataParts.push({ value: val, kind: "binary" });
                break;
            case "--form":
            case "--form-string": {
                const { field, hasTypeMeta } = parseFormField(val, canonicalFlag === "--form");
                if (field.isFile) {
                    addWarning(
                        warnings,
                        "--form",
                        `Multipart file "${field.filename}" (@file) references a local file path that the browser cannot read; inspect the generated file upload snippet before running.`,
                        "warning"
                    );
                }
                if (hasTypeMeta) {
                    addWarning(
                        warnings,
                        "--form",
                        `Multipart MIME metadata on "${field.name}" (;type=...) may need manual adjustment in code.`,
                        "info"
                    );
                }
                formFields.push(field);
                break;
            }
        }
    };

    for (let i = 1; i < tokens.length; i++) {
        const token = tokens[i];

        if (token === "--") {
            for (let j = i + 1; j < tokens.length; j++) {
                if (!candidateUrl) candidateUrl = tokens[j];
                else addWarning(warnings, "url", `Extra argument "${tokens[j]}" was ignored.`, "warning");
            }
            break;
        }

        // Long flags (--foo or --foo=bar)
        if (token.startsWith("--")) {
            const eqIdx = token.indexOf("=");
            const flagName = eqIdx === -1 ? token : token.slice(0, eqIdx);
            const inlineVal = eqIdx === -1 ? undefined : token.slice(eqIdx + 1);
            const spec = LONG_FLAGS[flagName];

            if (!spec) {
                addWarning(warnings, flagName, `Unsupported flag ${flagName} was ignored.`, "warning");
                continue;
            }

            if (!spec.takesValue) {
                if (flagName === "--get") useGetMode = true;
                else if (flagName === "--head") useHeadMode = true;
                else if (spec.note) addWarning(warnings, flagName, spec.note, flagName === "--insecure" ? "warning" : "info");
                continue;
            }

            const { value, nextIdx } = consumeFlagValue(inlineVal, i, flagName);
            i = nextIdx;
            if (!spec.supported) {
                if (spec.note) addWarning(warnings, flagName, spec.note, "warning");
            } else {
                applyFlag(flagName, value);
            }
            continue;
        }

        // Short flags (-X, -XPOST, -sL, etc.)
        if (token.startsWith("-") && token.length > 1) {
            const chars = token.slice(1);
            let k = 0;
            while (k < chars.length) {
                const shortChar = chars[k];
                const entry = SHORT_FLAGS[shortChar];
                if (!entry) {
                    addWarning(warnings, `-${shortChar}`, `Unsupported flag -${shortChar} was ignored.`, "warning");
                    k++;
                    continue;
                }

                if (!entry.spec.takesValue) {
                    if (entry.longName === "--get") useGetMode = true;
                    else if (entry.longName === "--head") useHeadMode = true;
                    else if (entry.spec.note) {
                        addWarning(warnings, `-${shortChar}`, entry.spec.note, shortChar === "k" ? "warning" : "info");
                    }
                    k++;
                    continue;
                }

                // Value-taking short flag: remainder of token (e.g. -XPOST) or next token
                const remainder = k + 1 < chars.length ? chars.slice(k + 1) : undefined;
                const { value, nextIdx } = consumeFlagValue(remainder, i, `-${shortChar}`);
                i = nextIdx;
                if (!entry.spec.supported) {
                    if (entry.spec.note) addWarning(warnings, `-${shortChar}`, entry.spec.note, "warning");
                } else {
                    applyFlag(entry.longName, value);
                }
                break;
            }
            continue;
        }

        // Positional URL
        if (!candidateUrl) {
            candidateUrl = token;
        } else {
            addWarning(warnings, "positional", `Unexpected positional argument "${token}" was ignored.`, "warning");
        }
    }

    if (!candidateUrl) {
        return createEmptyResult(warnings, "No URL found in cURL command.");
    }

    const rawUrl = candidateUrl;
    let normalizedUrl = candidateUrl;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(normalizedUrl)) {
        normalizedUrl = `http://${normalizedUrl}`;
        addWarning(warnings, "url-scheme", "URL omitted a scheme; defaulted to http:// to match cURL.", "info");
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(normalizedUrl);
    } catch {
        return createEmptyResult(warnings, `Invalid URL in cURL command: "${rawUrl}".`);
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        addWarning(warnings, "protocol", `Protocol "${parsedUrl.protocol}" may not be supported by HTTP fetch/requests clients.`, "warning");
    }

    if (parsedUrl.username || parsedUrl.password) {
        addWarning(
            warnings,
            "url-credentials",
            "Embedded URL credentials (user:pass@) were stripped from the normalized URL and not carried into generated code; use -u user:pass for Basic Auth if intended.",
            "warning"
        );
    }

    if (parsedUrl.hash) {
        addWarning(warnings, "url-fragment", `URL fragment "${parsedUrl.hash}" is never transmitted over HTTP by cURL and was stripped.`, "info");
    }

    const cleanBaseUrl = `${parsedUrl.origin}${parsedUrl.pathname}`;
    const queryParams: KeyValuePair[] = [];
    parsedUrl.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
    });

    // Resolve HTTP method
    let method = explicitMethod ?? "GET";
    if (!explicitMethod) {
        if (useHeadMode) method = "HEAD";
        else if (useGetMode) method = "GET";
        else if (dataParts.length > 0 || formFields.length > 0) method = "POST";
    } else if (useGetMode && explicitMethod !== "GET") {
        addWarning(warnings, "--get", `Both -G/--get and -X ${explicitMethod} were provided; keeping -X ${explicitMethod}.`, "warning");
    }

    // Build body (or append data to queryParams when -G/--get is active)
    let body: ParsedCurlBody = { kind: "none" };
    if (formFields.length > 0) {
        if (dataParts.length > 0) {
            addWarning(warnings, "--form", "Both -F (--form) and -d (--data) were provided; multipart form fields take precedence.", "warning");
        }
        body = { kind: "multipart", fields: formFields };
    } else if (dataParts.length > 0) {
        if (useGetMode) {
            for (const part of dataParts) {
                if (part.kind === "urlencode") {
                    queryParams.push(parseUrlencodePart(part.value));
                } else {
                    queryParams.push(...parseQueryStringPairs(part.value));
                }
            }
        } else {
            const hasUrlencodeFlag = dataParts.some((p) => p.kind === "urlencode");
            const combinedRaw = dataParts.map((p) => p.value).join("&");
            const contentType = findHeaderValue(headers, "content-type")?.toLowerCase() ?? "";
            const isJsonHeader = contentType.includes("application/json") || contentType.includes("+json");
            const isFormHeader = contentType.includes("application/x-www-form-urlencoded");
            const hasBinaryFlag = dataParts.some((p) => p.kind === "binary");
            const trimmed = combinedRaw.trim();
            const looksLikeJson = (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"));

            if (hasUrlencodeFlag) {
                const entries = dataParts.flatMap((part) =>
                    part.kind === "urlencode" ? [parseUrlencodePart(part.value)] : parseQueryStringPairs(part.value)
                );
                body = { kind: "urlencoded", entries, raw: combinedRaw };
            } else if (!isFormHeader && (isJsonHeader || looksLikeJson)) {
                try {
                    const parsed = JSON.parse(combinedRaw);
                    body = { kind: "json", raw: combinedRaw, parsed };
                } catch {
                    if (isJsonHeader) {
                        addWarning(
                            warnings,
                            "json-body",
                            "Content-Type indicates JSON, but body could not be parsed as valid JSON; emitted raw string payload.",
                            "warning"
                        );
                    }
                    body = { kind: "text", raw: combinedRaw };
                }
            } else if (isFormHeader || (!contentType && !hasBinaryFlag && looksLikeFormEncoded(trimmed))) {
                body = { kind: "urlencoded", entries: parseQueryStringPairs(combinedRaw), raw: combinedRaw };
            } else {
                body = { kind: "text", raw: combinedRaw };
            }
        }
    }

    return {
        method,
        url: cleanBaseUrl,
        rawUrl,
        queryParams,
        headers,
        cookies,
        auth,
        body,
        warnings,
        error: null,
    };
}
