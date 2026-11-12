import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Heart, Globe, Mail } from "lucide-react";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { canonicalUrl, SITE_DOMAIN, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
    title: "About RapidKit Tools — Free Online Tools for Everyone",
    description:
        "Learn about RapidKit Tools — a collection of free, fast, and private online tools built for developers, creators, and everyday users. No sign-up. No tracking.",
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl("/about") },
    openGraph: {
        title: `About RapidKit Tools — Free Online Tools for Everyone | ${SITE_NAME}`,
        description:
            "Learn about RapidKit Tools — a collection of free, fast, and private online tools built for developers, creators, and everyday users.",
        url: canonicalUrl("/about"),
        siteName: SITE_NAME,
        type: "website",
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* ─── Hero ─────────────────────────────────────── */}
            <header className="border-b border-[rgb(30,30,46)] py-16">
                <div className="container-narrow text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                        <Zap className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">About</span>{" "}
                        <span className="text-white">RapidKit Tools</span>
                    </h1>
                    <p className="text-[rgb(120,120,160)] text-lg max-w-xl mx-auto">
                        Free, fast, private online tools — built for real people who get things done.
                    </p>
                </div>
            </header>

            <div className="container-narrow py-14 space-y-14">
                {/* ─── Mission ───────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                    <p className="text-[rgb(120,120,160)] leading-relaxed text-base">
                        The internet is full of tools that make you create an account, charge a monthly fee, or harvest your data
                        just to do a simple task. We built RapidKit Tools because <strong className="text-white">that&apos;s ridiculous</strong>.
                    </p>
                    <p className="text-[rgb(120,120,160)] leading-relaxed text-base mt-3">
                        RapidKit Tools is a growing collection of free, no-nonsense tools that work instantly in your browser. Whether
                        you&apos;re a developer, a content creator, a student, or just someone who needs to convert a unit or compress
                        an image — we&apos;ve got you.
                    </p>
                </section>

                {/* ─── Values ────────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">What We Stand For</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: "⚡", title: "Speed First", desc: "Every tool is built to be instantaneous. No loading screens, no server round-trips for client-side tasks." },
                            { icon: "🔒", title: "Privacy by Default", desc: "Files you process stay in your browser. We can't see your images or documents because they never reach our servers." },
                            { icon: "🆓", title: "Free, Always", desc: "All core tools are and will remain free. We're supported by transparent partner links and non-intrusive ads, never by selling your data." },
                            { icon: "🌍", title: "Built for Everyone", desc: "No jargon, no required expertise. Our tools are designed for developers and non-developers alike." },
                        ].map((item) => (
                            <div key={item.title} className="p-5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                                <div className="text-2xl mb-3">{item.icon}</div>
                                <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-[rgb(100,100,140)] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Tech Stack ────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">How RapidKit Tools Is Built</h2>
                    <p className="text-[rgb(120,120,160)] leading-relaxed text-base mb-5">
                        RapidKit Tools is built on modern web technologies to ensure speed, reliability, and excellent SEO:
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel"].map((tech) => (
                            <span key={tech} className="px-4 py-2 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-sm font-medium text-[rgb(140,140,180)]">
                                {tech}
                            </span>
                        ))}
                    </div>
                    <p className="text-[rgb(100,100,140)] text-sm mt-4">
                        All pages are statically generated and served from Vercel&apos;s global CDN — meaning your nearest server is always seconds away.
                    </p>
                </section>

                {/* ─── Stats ─────────────────────────────────── */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">RapidKit Tools by the Numbers</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {[
                            { number: `${TOOLS.length}`, label: "Free Tools" },
                            { number: `${CATEGORIES.length}`, label: "Categories" },
                            { number: "Browser-First", label: "Most Tools Run Locally" },
                            { number: "0", label: "Accounts Needed" },
                        ].map((stat) => (
                            <div key={stat.label} className="p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                                <div className="text-3xl font-bold gradient-text mb-1">{stat.number}</div>
                                <div className="text-xs text-[rgb(80,80,120)]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Contact ────────────────────────────────── */}
                <section className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                    <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> Get in Touch
                    </h2>
                    <p className="text-[rgb(120,120,160)] text-sm leading-relaxed mb-4">
                        Have a tool suggestion? Found a bug? Want to collaborate? We&apos;d love to hear from you.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`mailto:hello@${SITE_DOMAIN}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-sm text-[rgb(140,140,180)] hover:text-white hover:border-violet-500/40 transition-all"
                        >
                            <Mail className="w-4 h-4" /> hello@{SITE_DOMAIN}
                        </a>
                        <Link
                            href="/tools"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all"
                        >
                            <Globe className="w-4 h-4" /> Browse All Tools
                        </Link>
                    </div>
                </section>

                {/* ─── Back ───────────────────────────────────── */}
                <div className="pt-4 border-t border-[rgb(30,30,46)]">
                    <Link href="/" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
