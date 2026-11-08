import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ArrowRight, ChevronRight, Wrench } from "lucide-react";
import { ALTERNATIVES } from "@/data/alternatives";
import { COMPARISONS } from "@/data/comparisons";
import { getToolBySlug } from "@/data/tools";
import { canonicalUrl, buildBreadcrumbJsonLd, GUIDES_INDEXABLE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Software Alternatives for Developers, Creators & Marketers",
    description:
        "Explore curated alternatives to TinyPNG, Canva, and Semrush — comparing cloud platforms, WordPress plugins, and free browser-first RapidKit tools.",
    robots: {
        index: GUIDES_INDEXABLE,
        follow: GUIDES_INDEXABLE,
    },
    alternates: {
        canonical: canonicalUrl("/alternatives"),
    },
    openGraph: {
        title: "Software Alternatives for Developers, Creators & Marketers | RapidKit",
        description:
            "Explore curated alternatives to TinyPNG, Canva, and Semrush — comparing cloud platforms, WordPress plugins, and free browser-first RapidKit tools.",
        url: canonicalUrl("/alternatives"),
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Software Alternatives for Developers, Creators & Marketers | RapidKit",
        description:
            "Explore curated alternatives to TinyPNG, Canva, and Semrush — comparing cloud platforms, WordPress plugins, and free browser-first RapidKit tools.",
    },
};

export default function AlternativesIndexPage() {
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Alternatives", path: "/alternatives" },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <div className="pt-20 pb-16 px-4">
                <div className="container-wide max-w-5xl">
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">Alternatives</span>
                    </nav>

                    {/* Hero */}
                    <header className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
                            <Layers className="w-3.5 h-3.5" /> Curated Software Guides
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
                            Software <span className="gradient-text">Alternatives</span>
                        </h1>
                        <p className="text-[rgb(148,148,186)] max-w-2xl text-base sm:text-lg leading-relaxed">
                            Compare specialized alternatives to popular image compression, graphic design, and SEO platforms — including when a free RapidKit browser tool can handle the job immediately.
                        </p>
                    </header>

                    {/* Alternatives Cards */}
                    <div className="grid grid-cols-1 gap-6 mb-14">
                        {ALTERNATIVES.map((alt) => {
                            const linkedTools = alt.relatedToolSlugs
                                .map((s) => getToolBySlug(s))
                                .filter((t): t is NonNullable<typeof t> => Boolean(t));

                            return (
                                <article
                                    key={alt.slug}
                                    className="glass-card p-6 sm:p-8 flex flex-col justify-between gap-5"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                                            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                                                {alt.categoryLabel}
                                            </span>
                                            {alt.lastVerified && (
                                                <span className="text-xs text-[rgb(100,100,140)]">
                                                    Last reviewed: {alt.lastVerified}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                            <Link
                                                href={`/alternatives/${alt.slug}`}
                                                className="hover:text-cyan-300 transition-colors"
                                            >
                                                {alt.title}
                                            </Link>
                                        </h2>
                                        <p className="text-sm text-[rgb(140,140,180)] leading-relaxed mb-4">
                                            {alt.subtitle}
                                        </p>

                                        {linkedTools.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap text-xs text-[rgb(100,100,140)]">
                                                <span className="inline-flex items-center gap-1 font-medium text-[rgb(148,148,186)]">
                                                    <Wrench className="w-3 h-3 text-violet-400" /> Paired free tools:
                                                </span>
                                                {linkedTools.map((tool) => (
                                                    <Link
                                                        key={tool.slug}
                                                        href={`/tools/${tool.categoryId}/${tool.slug}`}
                                                        className="px-2 py-0.5 rounded bg-[rgb(20,20,32)] border border-[rgb(40,40,60)] text-[rgb(160,160,200)] hover:text-white hover:border-cyan-500/40 transition-colors"
                                                    >
                                                        {tool.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-[rgb(30,30,46)] flex items-center justify-between">
                                        <span className="text-xs text-[rgb(100,100,140)]">
                                            {alt.alternatives.length} options compared
                                        </span>
                                        <Link
                                            href={`/alternatives/${alt.slug}`}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Explore {alt.targetProduct} alternatives <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Cross-link to Head-to-Head Comparisons */}
                    <section className="glass-card p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">Head-to-Head Software Comparisons</h2>
                                <p className="text-xs text-[rgb(110,110,150)] mt-0.5">
                                    Deciding between two specific platforms? Read our side-by-side comparisons.
                                </p>
                            </div>
                            <Link
                                href="/compare"
                                className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                            >
                                View all comparisons <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {COMPARISONS.map((comp) => (
                                <Link
                                    key={comp.slug}
                                    href={`/compare/${comp.slug}`}
                                    className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-violet-500/40 transition-all group block"
                                >
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 block mb-1">
                                        {comp.categoryLabel}
                                    </span>
                                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                                        {comp.productA.name} vs {comp.productB.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

