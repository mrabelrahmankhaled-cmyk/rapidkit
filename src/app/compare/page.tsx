import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowRight, ChevronRight, Wrench } from "lucide-react";
import { INDEXABLE_COMPARISONS, HAS_INDEXABLE_COMPARISONS } from "@/data/comparisons";
import { INDEXABLE_ALTERNATIVES, HAS_INDEXABLE_ALTERNATIVES } from "@/data/alternatives";
import { getToolBySlug } from "@/data/tools";
import { canonicalUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Software Comparisons for Developers & Creators",
    description:
        "Side-by-side informational comparisons of hosting platforms, creator newsletter tools, and YouTube SEO suites — paired with free RapidKit browser utilities.",
    robots: {
        index: HAS_INDEXABLE_COMPARISONS,
        follow: HAS_INDEXABLE_COMPARISONS,
    },
    alternates: {
        canonical: canonicalUrl("/compare"),
    },
    openGraph: {
        title: "Software Comparisons for Developers & Creators | RapidKit",
        description:
            "Side-by-side informational comparisons of hosting platforms, creator newsletter tools, and YouTube SEO suites.",
        url: canonicalUrl("/compare"),
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Software Comparisons for Developers & Creators | RapidKit",
        description:
            "Side-by-side informational comparisons of hosting platforms, creator newsletter tools, and YouTube SEO suites.",
    },
};

export default function CompareIndexPage() {
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Comparisons", path: "/compare" },
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
                        <span className="text-[rgb(148,148,186)]">Comparisons</span>
                    </nav>

                    {/* Hero */}
                    <header className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
                            <Scale className="w-3.5 h-3.5" /> Side-by-Side Technical Guides
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
                            Software <span className="gradient-text">Comparisons</span>
                        </h1>
                        <p className="text-[rgb(148,148,186)] max-w-2xl text-base sm:text-lg leading-relaxed">
                            Objective, feature-by-feature breakdowns of developer hosting, newsletter platforms, and creator SEO software based on publicly documented capabilities — plus free RapidKit browser tools you can use right away.
                        </p>
                    </header>

                    {/* Comparison Cards */}
                    <div className="grid grid-cols-1 gap-6 mb-14">
                        {INDEXABLE_COMPARISONS.map((comp) => {
                            const linkedTools = comp.relatedToolSlugs
                                .map((s) => getToolBySlug(s))
                                .filter((t): t is NonNullable<typeof t> => Boolean(t));

                            return (
                                <article
                                    key={comp.slug}
                                    className="glass-card p-6 sm:p-8 flex flex-col justify-between gap-5"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                                            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                                                {comp.categoryLabel}
                                            </span>
                                            {comp.lastVerified && (
                                                <span className="text-xs text-[rgb(100,100,140)]">
                                                    Last reviewed: {comp.lastVerified}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                            <Link
                                                href={`/compare/${comp.slug}`}
                                                className="hover:text-violet-300 transition-colors"
                                            >
                                                {comp.title}
                                            </Link>
                                        </h2>
                                        <p className="text-sm text-[rgb(140,140,180)] leading-relaxed mb-4">
                                            {comp.subtitle}
                                        </p>

                                        {linkedTools.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap text-xs text-[rgb(100,100,140)]">
                                                <span className="inline-flex items-center gap-1 font-medium text-[rgb(148,148,186)]">
                                                    <Wrench className="w-3 h-3 text-cyan-400" /> Paired free tools:
                                                </span>
                                                {linkedTools.map((tool) => (
                                                    <Link
                                                        key={tool.slug}
                                                        href={`/tools/${tool.categoryId}/${tool.slug}`}
                                                        className="px-2 py-0.5 rounded bg-[rgb(20,20,32)] border border-[rgb(40,40,60)] text-[rgb(160,160,200)] hover:text-white hover:border-violet-500/40 transition-colors"
                                                    >
                                                        {tool.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-[rgb(30,30,46)] flex items-center justify-between">
                                        <span className="text-xs text-[rgb(100,100,140)]">
                                            {comp.productA.name} vs {comp.productB.name}
                                        </span>
                                        <Link
                                            href={`/compare/${comp.slug}`}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                                        >
                                            Read full comparison <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Cross-link to Alternatives */}
                    {HAS_INDEXABLE_ALTERNATIVES && (
                        <section className="glass-card p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Looking for Software Alternatives?</h2>
                                    <p className="text-xs text-[rgb(110,110,150)] mt-0.5">
                                        Explore curated alternatives to popular image optimizers, design apps, and SEO suites.
                                    </p>
                                </div>
                                <Link
                                    href="/alternatives"
                                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
                                >
                                    View all alternatives <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {INDEXABLE_ALTERNATIVES.map((alt) => (
                                    <Link
                                        key={alt.slug}
                                        href={`/alternatives/${alt.slug}`}
                                        className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-cyan-500/40 transition-all group block"
                                    >
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300 block mb-1">
                                            {alt.categoryLabel}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                            {alt.targetProduct} Alternatives
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

