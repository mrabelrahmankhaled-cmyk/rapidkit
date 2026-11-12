import test from "node:test";
import assert from "node:assert";
import { parseCurlCommand, tokenizeCurlCommand } from "../src/lib/curlParser.ts";
import { convertCurl, encodeUtf8Base64, serializePythonString } from "../src/lib/curlToCode.ts";

test("1. Empty and invalid inputs", () => {
    const empty = convertCurl("", "fetch");
    assert.strictEqual(empty.code, "");
    assert.strictEqual(empty.error, null);

    const ws = convertCurl("   \n\t ", "requests");
    assert.strictEqual(ws.code, "");
    assert.strictEqual(ws.error, null);

    const nonCurl = convertCurl("wget https://example.com", "fetch");
    assert.ok(nonCurl.error);
    assert.strictEqual(nonCurl.code, "");

    const noUrl = convertCurl("curl -X POST -H 'Accept: application/json'", "fetch");
    assert.ok(noUrl.error?.includes("No URL"));

    const unterminated = convertCurl('curl "https://example.com', "fetch");
    assert.ok(unterminated.error?.includes("Unterminated quote"));
});

test("2. Basic GET, URL normalization, duplicate query params, and fragments", () => {
    const bare = convertCurl("curl api.example.com/status", "fetch");
    assert.strictEqual(bare.error, null);
    assert.strictEqual(bare.request.method, "GET");
    assert.strictEqual(bare.request.url, "http://api.example.com/status");
    assert.ok(bare.warnings.some((w) => w.flag === "url-scheme"));
    assert.ok(bare.code.includes('await fetch("http://api.example.com/status")'));

    const dupQuery = 'curl --url "https://api.example.com/items?tag=ts&tag=node&limit=10#top"';
    const jsRes = convertCurl(dupQuery, "fetch");
    assert.strictEqual(jsRes.error, null);
    assert.strictEqual(jsRes.request.queryParams.length, 3);
    assert.ok(jsRes.warnings.some((w) => w.flag === "url-fragment"));
    assert.ok(jsRes.code.includes('url.searchParams.append("tag", "ts")'));
    assert.ok(jsRes.code.includes('url.searchParams.append("tag", "node")'));

    const pyRes = convertCurl(dupQuery, "requests");
    assert.ok(pyRes.code.includes('    ("tag", "ts"),'));
    assert.ok(pyRes.code.includes('    ("tag", "node"),'));
    assert.ok(pyRes.code.includes("params=params"));

    const credUrl = convertCurl("curl https://alice:s3cr3t@api.example.com/private", "fetch");
    assert.strictEqual(credUrl.error, null);
    assert.strictEqual(credUrl.request.url, "https://api.example.com/private");
    assert.ok(credUrl.warnings.some((w) => w.flag === "url-credentials" && w.severity === "warning"));
});

test("3. Multiline continuations, quoting, ANSI-C escapes, and Windows CMD warning", () => {
    const multiline = `$ curl -X POST https://api.example.com/logs \\
  -H "X-Quote: \\"hello\\"" \\
  -H 'X-Literal: $NOT_EXPANDED' \\
  -d $'line1\\nline2'`;

    const tok = tokenizeCurlCommand(multiline);
    assert.strictEqual(tok.error, null);
    assert.deepStrictEqual(tok.tokens, [
        "curl",
        "-X",
        "POST",
        "https://api.example.com/logs",
        "-H",
        'X-Quote: "hello"',
        "-H",
        "X-Literal: $NOT_EXPANDED",
        "-d",
        "line1\nline2",
    ]);

    const crlfMultiline = "curl https://api.example.com/crlf \\\r\n  -H \"X-One: 1\" \\\r\n  -X POST";
    const crlfRes = convertCurl(crlfMultiline, "fetch");
    assert.strictEqual(crlfRes.error, null);
    assert.strictEqual(crlfRes.request.method, "POST");
    assert.deepStrictEqual(crlfRes.request.headers, [{ key: "X-One", value: "1" }]);

    const quotedOperators = `curl "https://api.example.com/filter?q=a|b;c" -H 'X-Expr: foo|bar;baz'`;
    const quotedRes = convertCurl(quotedOperators, "fetch");
    assert.strictEqual(quotedRes.error, null);
    assert.ok(!quotedRes.warnings.some((w) => w.flag === "pipeline"));
    assert.deepStrictEqual(quotedRes.request.queryParams, [{ key: "q", value: "a|b;c" }]);
    assert.deepStrictEqual(quotedRes.request.headers, [{ key: "X-Expr", value: "foo|bar;baz" }]);

    const largePayload = "a".repeat(12000);
    const largeCmd = `curl -X POST https://api.example.com/bulk -H "Content-Type: application/json" -d '{"payload":"${largePayload}"}'`;
    const largeRes = convertCurl(largeCmd, "fetch");
    assert.strictEqual(largeRes.error, null);
    assert.strictEqual(largeRes.request.body.kind, "json");
    assert.ok(largeRes.code.includes(largePayload));

    const cmdCurl = `curl https://api.example.com/data ^
  -H ^"Accept: application/json^"`;
    const cmdRes = convertCurl(cmdCurl, "fetch");
    assert.strictEqual(cmdRes.error, null);
    assert.ok(cmdRes.warnings.some((w) => w.flag === "cmd-syntax" && w.severity === "warning"));
    assert.ok(cmdRes.code.includes('"Accept": "application/json"'));
});

test("4. HTTP methods, multi-colon headers, duplicate headers, shorthands", () => {
    const cmd = `curl -XPUT https://api.example.com/v1/resource \\
      -H "Host: internal.example.com" \\
      -H "Authorization: Bearer part1:part2:part3" \\
      -H "Accept:" \\
      -H "X-Custom: one" \\
      -H "X-Custom: two" \\
      -A "RapidKitBot/1.0" \\
      -e "https://getrapidkit.me"`;

    const js = convertCurl(cmd, "fetch");
    assert.strictEqual(js.request.method, "PUT");
    assert.ok(js.warnings.some((w) => w.flag === "Accept"));
    assert.ok(js.warnings.some((w) => w.flag === "host-fetch" && w.severity === "info"));
    assert.ok(js.warnings.some((w) => w.flag === "referer-fetch" && w.severity === "info"));
    assert.ok(js.code.includes("new Headers(["));
    assert.ok(js.code.includes('["Host", "internal.example.com"]'));
    assert.ok(js.code.includes('["Authorization", "Bearer part1:part2:part3"]'));
    assert.ok(js.code.includes('["X-Custom", "one"]'));
    assert.ok(js.code.includes('["X-Custom", "two"]'));
    assert.ok(js.code.includes('["User-Agent", "RapidKitBot/1.0"]'));
    assert.ok(!js.code.includes('["Referer",'));
    assert.ok(js.code.includes('referrer: "https://getrapidkit.me"'));

    const py = convertCurl(cmd, "requests");
    assert.ok(py.code.includes("requests.put("));
    assert.ok(py.code.includes('"Host": "internal.example.com"'));
    assert.ok(py.code.includes('"Referer": "https://getrapidkit.me"'));
    assert.ok(py.code.includes('"X-Custom": "one, two"'));
    assert.ok(!py.warnings.some((w) => w.flag === "host-fetch" || w.flag === "referer-fetch"));

    const refererOnly = convertCurl('curl -e "https://getrapidkit.me" https://api.example.com/ping', "fetch");
    assert.ok(refererOnly.code.includes('referrer: "https://getrapidkit.me"'));

    const head = convertCurl("curl -I https://api.example.com/health", "fetch");
    assert.strictEqual(head.request.method, "HEAD");

    const bearer = convertCurl("curl --oauth2-bearer secret123 https://api.example.com/me", "fetch");
    assert.ok(bearer.code.includes('"Authorization": "Bearer secret123"'));
});

test("5. JSON bodies, implicit POST, and invalid JSON fallback", () => {
    const validJson = `curl https://api.example.com/users \\
      -H "Content-Type: application/json" \\
      --data-raw '{"name":"Alice","active":true,"meta":null}'`;

    const js = convertCurl(validJson, "fetch");
    assert.strictEqual(js.request.method, "POST");
    assert.ok(js.code.includes("JSON.stringify("));
    assert.ok(js.code.includes('"active": true'));

    const py = convertCurl(validJson, "requests");
    assert.ok(py.code.includes('"active": True'));
    assert.ok(py.code.includes('"meta": None'));
    assert.ok(py.code.includes("json=json_payload"));

    const invalidJson = `curl -X POST https://api.example.com/users -H "Content-Type: application/json" -d '{bad json}'`;
    const fallback = convertCurl(invalidJson, "requests");
    assert.strictEqual(fallback.error, null);
    assert.strictEqual(fallback.request.body.kind, "text");
    assert.ok(fallback.warnings.some((w) => w.flag === "json-body" && w.severity === "warning"));
    assert.ok(fallback.code.includes('data = "{bad json}"'));

    const binCmd = `curl https://api.example.com/bin -H "X-Greeting: مرحبا 🚀" --data-binary "raw binary payload"`;
    const jsBin = convertCurl(binCmd, "fetch");
    const pyBin = convertCurl(binCmd, "requests");
    assert.strictEqual(jsBin.request.method, "POST");
    assert.strictEqual(jsBin.request.body.kind, "text");
    assert.ok(jsBin.code.includes('body: "raw binary payload"'));
    assert.ok(jsBin.code.includes('"X-Greeting": "مرحبا 🚀"'));
    assert.ok(pyBin.code.includes('data = "raw binary payload"'));
    assert.ok(pyBin.code.includes('"X-Greeting": "مرحبا 🚀"'));

    const asciiCmd = `curl https://api.example.com/ascii --data-ascii "k=1&m=two"`;
    const jsAscii = convertCurl(asciiCmd, "fetch");
    const pyAscii = convertCurl(asciiCmd, "requests");
    assert.strictEqual(jsAscii.request.body.kind, "urlencoded");
    assert.ok(jsAscii.code.includes("new URLSearchParams(["));
    assert.ok(pyAscii.code.includes('"k": "1"'));
    assert.ok(pyAscii.code.includes("data=data"));
});

test("6. URL-encoded data, -G mode, and multipart -F with @file", () => {
    const getWithData = `curl -G https://api.example.com/search --data-urlencode "q=a & b" -d "page=2"`;
    const pyGet = convertCurl(getWithData, "requests");
    assert.strictEqual(pyGet.request.method, "GET");
    assert.strictEqual(pyGet.request.body.kind, "none");
    assert.deepStrictEqual(pyGet.request.queryParams, [
        { key: "q", value: "a & b" },
        { key: "page", value: "2" },
    ]);
    assert.ok(pyGet.code.includes('"q": "a & b"'));

    const postForm = `curl -X POST https://api.example.com/login -d "user=alice" -d "role=admin"`;
    const jsForm = convertCurl(postForm, "fetch");
    assert.strictEqual(jsForm.request.body.kind, "urlencoded");
    assert.ok(jsForm.code.includes("new URLSearchParams(["));

    const multipart = `curl -X POST https://api.example.com/upload \\
      -H "Content-Type: multipart/form-data; boundary=----WebKitFormBoundary" \\
      -F "title=Avatar" \\
      -F "file=@/tmp/avatar.png"`;

    const jsMulti = convertCurl(multipart, "fetch");
    assert.ok(!jsMulti.code.includes("multipart/form-data"));
    assert.ok(jsMulti.warnings.some((w) => w.flag === "multipart-content-type"));
    assert.ok(jsMulti.warnings.some((w) => w.flag === "--form"));
    assert.ok(jsMulti.code.includes('formData.append("title", "Avatar")'));
    assert.ok(jsMulti.code.includes('formData.append("file", new Blob([]), "/tmp/avatar.png")'));

    const pyMulti = convertCurl(multipart, "requests");
    assert.ok(pyMulti.code.includes('open("/tmp/avatar.png", "rb")'));
    assert.ok(pyMulti.code.includes('"title": "Avatar"'));
});

test("7. Basic Auth (with colons & UTF-8) and inline/file cookies", () => {
    const authAndCookie = `curl https://api.example.com/account -u "alice:p:a:s:s✓" -b "sid=abc123; theme=dark"`;

    const js = convertCurl(authAndCookie, "fetch");
    const expectedB64 = encodeUtf8Base64("alice:p:a:s:s✓");
    assert.ok(js.code.includes(`"Authorization": "Basic ${expectedB64}"`));
    assert.ok(js.code.includes('"Cookie": "sid=abc123; theme=dark"'));
    assert.ok(js.warnings.some((w) => w.flag === "cookie-fetch" && w.severity === "info"));

    const py = convertCurl(authAndCookie, "requests");
    assert.ok(py.code.includes('auth = ("alice", "p:a:s:s✓")'));
    assert.ok(py.code.includes('"sid": "abc123"'));
    assert.ok(py.code.includes("cookies=cookies"));

    const cookieFile = parseCurlCommand("curl https://api.example.com/me -b cookies.txt");
    assert.strictEqual(cookieFile.cookies.length, 0);
    assert.ok(cookieFile.warnings.some((w) => w.flag === "--cookie" && w.severity === "warning"));
});

test("8. Unknown flag arity, insecure TLS (-k), pipes, @file, and $ENV_VAR warnings", () => {
    const complex = `curl -sLk --proxy http://127.0.0.1:8888 -m 15 --connect-timeout 5 --retry 3 -H "Authorization: Bearer $API_TOKEN" -d @payload.json https://api.example.com/v2/ingest | jq .status`;

    const py = convertCurl(complex, "requests");
    assert.strictEqual(py.error, null);
    // Positional URL must not be hijacked by --proxy http://127.0.0.1:8888 or numeric timeout values
    assert.strictEqual(py.request.url, "https://api.example.com/v2/ingest");
    // -k must NEVER emit verify=False automatically
    assert.ok(!py.code.includes("verify=False"));
    assert.ok(py.warnings.some((w) => w.flag === "-k" && w.severity === "warning"));
    assert.ok(py.warnings.some((w) => w.flag === "-L" && w.severity === "info"));
    assert.ok(py.warnings.some((w) => w.flag === "--proxy"));
    assert.ok(py.warnings.some((w) => w.flag === "pipeline"));
    assert.ok(py.warnings.some((w) => w.flag === "--data"));
    assert.ok(py.warnings.some((w) => w.flag === "shell-var"));

    const compressed = convertCurl("curl --compressed https://api.example.com/zip", "fetch");
    assert.ok(compressed.warnings.some((w) => w.flag === "--compressed" && w.severity === "info"));
});

test("9. String serialization and injection safety in JS & Python output", () => {
    const malicious = `curl -X POST https://api.example.com/echo -H 'X-Evil: a"b\\"c\\nd' -d $'${"${process.exit(1)}"}\\n\\x00"\\''`;
    const js = convertCurl(malicious, "fetch");
    const py = convertCurl(malicious, "requests");

    assert.strictEqual(js.error, null);
    assert.strictEqual(py.error, null);
    // Double-quoted JSON.stringify in JS prevents unescaped quote breakouts and template interpolation
    assert.ok(js.code.includes('JSON.stringify') === false); // text body uses JSON.stringify literal safely
    assert.ok(js.code.includes('body: "${process.exit(1)}\\n\\u0000\\"\'"'));

    const serialized = serializePythonString('a\\b"c\nd\x00');
    assert.strictEqual(serialized, '"a\\\\b\\"c\\nd\\x00"');
});
