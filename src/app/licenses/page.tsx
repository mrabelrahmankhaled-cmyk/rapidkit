import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Third-Party Open-Source Licenses",
    description:
        "Open-source license notices, copyright attributions, and license texts for active client-side libraries used in RapidKit tools.",
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl("/licenses") },
    openGraph: {
        title: `Third-Party Licenses | ${SITE_NAME}`,
        description:
            "Open-source attributions and license texts for pdf-lib, JSZip, Lucide, Papa Parse, Marked, qrcode.react, and diff.",
        url: canonicalUrl("/licenses"),
        siteName: SITE_NAME,
        type: "website",
    },
};

export default function LicensesPage() {
    return (
        <div className="min-h-screen">
            <header className="border-b border-[rgb(30,30,46)] py-12">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-5">
                        Open-Source Attributions
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Third-Party Licenses
                    </h1>
                    <p className="text-[rgb(120,120,160)] max-w-2xl mx-auto">
                        RapidKit runs privacy-first browser utilities built on permissive open-source software. Below are the attributions and license texts for core third-party libraries used in active tools.
                    </p>
                </div>
            </header>

            <div className="container-narrow py-12 space-y-10 text-sm leading-relaxed text-[rgb(148,148,186)]">
                {/* ─── 1. pdf-lib (MIT) ──────────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">1. pdf-lib</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                            MIT License
                        </span>
                    </div>
                    <p>
                        Client-side PDF creation, merging, splitting, visual signature stamping, and metadata cleaning in{" "}
                        <Link href="/tools/productivity/pdf-studio" className="text-violet-400 hover:text-violet-300 underline">
                            PDF Merge, Split &amp; Sign Studio
                        </Link>
                        . Repository:{" "}
                        <a
                            href="https://github.com/Hopding/pdf-lib"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 underline"
                        >
                            Hopding/pdf-lib
                        </a>
                        .
                    </p>
                    <pre className="p-4 rounded-xl bg-[rgb(12,12,20)] border border-[rgb(32,32,50)] text-[11px] leading-relaxed text-[rgb(160,160,195)] overflow-x-auto">{`MIT License

Copyright (c) 2019 Andrew Dillon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`}</pre>
                </section>

                {/* ─── 2. JSZip (MIT from dual MIT/GPL-3.0-or-later) ─── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">2. JSZip</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                            MIT License (Dual: MIT OR GPL-3.0-or-later)
                        </span>
                    </div>
                    <p>
                        JSZip is dual-licensed under the MIT License or GPLv3. RapidKit redistributes and uses JSZip under the{" "}
                        <strong className="text-white">MIT License</strong> option. Repository:{" "}
                        <a
                            href="https://github.com/Stuk/jszip"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 underline"
                        >
                            Stuk/jszip
                        </a>
                        .
                    </p>
                    <pre className="p-4 rounded-xl bg-[rgb(12,12,20)] border border-[rgb(32,32,50)] text-[11px] leading-relaxed text-[rgb(160,160,195)] overflow-x-auto">{`The MIT License

Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`}</pre>
                </section>

                {/* ─── 3. lucide-react (ISC / Feather MIT) ───────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">3. lucide-react</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
                            ISC License
                        </span>
                    </div>
                    <p>
                        UI vector icon library used across RapidKit interfaces. Repository:{" "}
                        <a
                            href="https://github.com/lucide-icons/lucide"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400 hover:text-violet-300 underline"
                        >
                            lucide-icons/lucide
                        </a>
                        .
                    </p>
                    <pre className="p-4 rounded-xl bg-[rgb(12,12,20)] border border-[rgb(32,32,50)] text-[11px] leading-relaxed text-[rgb(160,160,195)] overflow-x-auto">{`ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2026 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2026.

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`}</pre>
                </section>

                {/* ─── 4. Papa Parse (MIT) ───────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">4. Papa Parse (papaparse)</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                            MIT License
                        </span>
                    </div>
                    <p>
                        Browser CSV/JSON parsing and serialization in{" "}
                        <Link href="/tools/converter/json-csv-converter" className="text-violet-400 hover:text-violet-300 underline">
                            JSON &amp; CSV Converter
                        </Link>
                        . Copyright (c) 2015 Matthew Holt.
                    </p>
                </section>

                {/* ─── 5. Marked (MIT) ───────────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">5. Marked (marked)</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                            MIT License
                        </span>
                    </div>
                    <p>
                        Markdown compiler powering{" "}
                        <Link href="/tools/text/markdown-editor" className="text-violet-400 hover:text-violet-300 underline">
                            Markdown Live Preview Editor
                        </Link>
                        . Copyright (c) 2018+ MarkedJS; Copyright (c) 2011-2018 Christopher Jeffrey.
                    </p>
                </section>

                {/* ─── 6. qrcode.react (ISC) ─────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">6. qrcode.react</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
                            ISC License
                        </span>
                    </div>
                    <p>
                        Client-side QR vector/canvas rendering in{" "}
                        <Link href="/tools/developer/qr-code-generator" className="text-violet-400 hover:text-violet-300 underline">
                            QR Code Generator
                        </Link>
                        . Copyright (c) 2015 Paul O’Shannessy.
                    </p>
                </section>

                {/* ─── 7. diff (BSD-3-Clause) ────────────────────────── */}
                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(30,30,46)] pb-2">
                        <h2 className="text-xl font-bold text-white">7. diff</h2>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300">
                            BSD 3-Clause License
                        </span>
                    </div>
                    <p>
                        Text differencing engine in{" "}
                        <Link href="/tools/text/text-diff-checker" className="text-violet-400 hover:text-violet-300 underline">
                            Text Diff Checker
                        </Link>
                        .
                    </p>
                    <pre className="p-4 rounded-xl bg-[rgb(12,12,20)] border border-[rgb(32,32,50)] text-[11px] leading-relaxed text-[rgb(160,160,195)] overflow-x-auto">{`BSD 3-Clause License

Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`}</pre>
                </section>

                <div className="pt-4 border-t border-[rgb(30,30,46)] flex flex-wrap gap-4">
                    <Link href="/" className="text-sm text-[rgb(120,120,160)] hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                    <Link href="/privacy" className="text-sm text-[rgb(120,120,160)] hover:text-white transition-colors">
                        Privacy Policy →
                    </Link>
                    <Link href="/terms" className="text-sm text-[rgb(120,120,160)] hover:text-white transition-colors">
                        Terms of Service →
                    </Link>
                </div>
            </div>
        </div>
    );
}
