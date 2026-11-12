import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ArrowRight, HelpCircle, ChevronDown, Scale } from "lucide-react";
import {
    TOOLS,
    getCategoryById,
    getToolBySlug,
    getRelatedToolsForTool,
} from "@/data/tools";
import { getComparisonsBySlugs, HAS_INDEXABLE_COMPARISONS } from "@/data/comparisons";
import { getAlternativesBySlugs, HAS_INDEXABLE_ALTERNATIVES } from "@/data/alternatives";
import {
    SITE_NAME,
    canonicalUrl,
    buildToolJsonLd,
    buildBreadcrumbJsonLd,
    buildFaqJsonLd,
} from "@/lib/seo";
import { ToolPageClient } from "./ToolPageClient";
import { ShareCTA } from "@/components/ui/ShareCTA";
import { NewsletterInline } from "@/components/ui/NewsletterInline";
import { AffiliateCTA } from "@/components/affiliate/AffiliateCTA";

type Props = {
    params: Promise<{ category: string; tool: string }>;
};

export async function generateStaticParams() {
    return TOOLS.map((tool) => ({
        category: tool.categoryId,
        tool: tool.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categorySlug, tool: toolSlug } = await params;
    const tool = getToolBySlug(toolSlug);
    const category = getCategoryById(categorySlug);

    if (!tool || !category || tool.categoryId !== category.id) {
        return { title: "Tool Not Found" };
    }

    const pageUrl = canonicalUrl(`/tools/${tool.categoryId}/${tool.slug}`);
    const normalizedTitle = tool.seo.title
        .replace(/\s*\|\s*RapidKit(?:\s+Tools)?\s*$/i, "")
        .trim();

    return {
        title: normalizedTitle,
        description: tool.seo.description,
        keywords: tool.seo.keywords,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${normalizedTitle} | ${SITE_NAME}`,
            description: tool.seo.description,
            url: pageUrl,
            siteName: SITE_NAME,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${normalizedTitle} | ${SITE_NAME}`,
            description: tool.seo.description,
        },
    };
}

export default async function ToolPage({ params }: Props) {
    const { category: categorySlug, tool: toolSlug } = await params;

    const tool = getToolBySlug(toolSlug);
    const category = getCategoryById(categorySlug);

    if (!tool || !category || tool.categoryId !== category.id) {
        notFound();
    }

    const relatedTools = getRelatedToolsForTool(tool);
    const relatedComparisons = getComparisonsBySlugs(tool.relatedComparisonSlugs);
    const relatedAlternatives = getAlternativesBySlugs(tool.relatedAlternativeSlugs);

    const toolJsonLd = buildToolJsonLd(tool, category.name);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Tools", path: "/tools" },
        { name: category.name, path: `/tools/${category.slug}` },
        { name: tool.name, path: `/tools/${category.slug}/${tool.slug}` },
    ]);
    const faqJsonLd = tool.faqs.length > 0 ? buildFaqJsonLd(tool.faqs) : null;

    return (
        <>
            {/* ─── JSON-LD Structured Data ──────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}

            <div className="pt-20 pb-16 px-4">
                <div className="container-wide max-w-5xl">

                    {/* ─── Breadcrumb ─────────────────────────── */}
                    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/tools/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">{tool.name}</span>
                    </nav>

                    {/* ─── Tool Header ────────────────────────── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <Link
                                href={`/tools/${category.slug}`}
                                className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-lg px-3 py-1.5"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back to {category.name}
                            </Link>
                            {tool.isNew && <span className="pill pill-new">✨ New</span>}
                            {tool.isPopular && <span className="pill pill-hot">🔥 Popular</span>}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{tool.name}</h1>
                        <p className="text-[rgb(148,148,186)] max-w-2xl leading-relaxed">{tool.longDescription}</p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {tool.tags.map((tag) => (
                                <span key={tag} className="text-xs px-2 py-1 rounded-md bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)]">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ─── Tool Card ──────────────────────────── */}
                    <div className="glass-card p-6 sm:p-8 mb-6">
                        <ToolPageClient toolSlug={tool.slug} categoryId={tool.categoryId} />
                    </div>

                    {/* ─── Share / Bookmark CTA ───────────────── */}
                    <ShareCTA toolName={tool.name} toolSlug={tool.slug} categoryId={tool.categoryId} />

                    {/* ─── Affiliate Recommendation CTA ───────── */}
                    <AffiliateCTA
                        affiliateIds={tool.affiliateIds}
                        toolSlug={tool.slug}
                        placement="under_tool"
                    />

                    {/* ─── How to Use ─────────────────────────── */}
                    <div className="glass-card p-6 mb-6 mt-6">
                        <h2 className="text-lg font-bold text-white mb-4">
                            How to Use {tool.name}
                        </h2>
                        <ol className="space-y-3">
                            {tool.howToSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[rgb(148,148,186)]">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* ─── Common Use Cases ───────────────────── */}
                    {tool.useCases && tool.useCases.length > 0 && (
                        <section className="glass-card p-6 mb-6" aria-labelledby="use-cases-heading">
                            <h2 id="use-cases-heading" className="text-lg font-bold text-white mb-4">
                                Common Use Cases
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {tool.useCases.map((useCase, idx) => (
                                    <div key={idx} className="rounded-xl bg-[rgb(17,17,27)] border border-[rgb(30,30,46)] p-4">
                                        <h3 className="text-sm font-semibold text-white mb-1.5">
                                            {useCase.title}
                                        </h3>
                                        <p className="text-sm text-[rgb(140,140,180)] leading-relaxed">
                                            {useCase.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Frequently Asked Questions ─────────── */}
                    {tool.faqs.length > 0 && (
                        <section className="glass-card p-6 mb-6" aria-labelledby="faq-heading">
                            <div className="flex items-center gap-2 mb-4">
                                <HelpCircle className="w-5 h-5 text-violet-400" />
                                <h2 id="faq-heading" className="text-lg font-bold text-white">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                            <div className="divide-y divide-[rgb(30,30,46)]">
                                {tool.faqs.map((faq, idx) => (
                                    <details key={idx} className="group py-3.5 first:pt-0 last:pb-0">
                                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm font-semibold text-white hover:text-violet-300 transition-colors">
                                            <span>{faq.question}</span>
                                            <ChevronDown className="w-4 h-4 text-[rgb(80,80,120)] shrink-0 transition-transform group-open:rotate-180" />
                                        </summary>
                                        <p className="mt-2.5 text-sm text-[rgb(140,140,180)] leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Related Comparisons & Alternatives ─── */}
                    {(relatedComparisons.length > 0 || relatedAlternatives.length > 0) && (
                        <section className="glass-card p-6 mb-6" aria-labelledby="related-guides-heading">
                            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-cyan-400" />
                                    <h2 id="related-guides-heading" className="text-lg font-bold text-white">
                                        Related Comparisons &amp; Software Guides
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    {HAS_INDEXABLE_COMPARISONS && (
                                        <Link href="/compare" className="text-violet-400 hover:text-violet-300 transition-colors">
                                            All Comparisons
                                        </Link>
                                    )}
                                    {HAS_INDEXABLE_COMPARISONS && HAS_INDEXABLE_ALTERNATIVES && (
                                        <span className="text-[rgb(60,60,90)]">•</span>
                                    )}
                                    {HAS_INDEXABLE_ALTERNATIVES && (
                                        <Link href="/alternatives" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                            All Alternatives
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {relatedComparisons.map((comp) => (
                                    <Link
                                        key={comp.slug}
                                        href={`/compare/${comp.slug}`}
                                        className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-violet-500/40 transition-all group block"
                                    >
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 mb-2">
                                            Comparison • {comp.categoryLabel}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1">
                                            {comp.title}
                                        </h3>
                                        <p className="text-xs text-[rgb(110,110,150)] line-clamp-2 leading-relaxed">
                                            {comp.subtitle}
                                        </p>
                                    </Link>
                                ))}
                                {relatedAlternatives.map((alt) => (
                                    <Link
                                        key={alt.slug}
                                        href={`/alternatives/${alt.slug}`}
                                        className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-cyan-500/40 transition-all group block"
                                    >
                                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 mb-2">
                                            Alternatives • {alt.categoryLabel}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
                                            {alt.title}
                                        </h3>
                                        <p className="text-xs text-[rgb(110,110,150)] line-clamp-2 leading-relaxed">
                                            {alt.subtitle}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Newsletter CTA ─────────────────────────── */}
                    <NewsletterInline />

                    {/* ─── Smart Related Tools ─────────────────── */}
                    {relatedTools.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white">You Might Also Need</h2>
                                <Link href="/tools" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                                    All tools <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {relatedTools.map((related) => {
                                    const relatedCat = getCategoryById(related.categoryId);
                                    return (
                                        <Link
                                            key={related.id}
                                            href={`/tools/${related.categoryId}/${related.slug}`}
                                            className="glass-card p-4 group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                                    style={{ background: `linear-gradient(135deg, ${relatedCat?.color}20, ${relatedCat?.color}40)` }}
                                                >
                                                    <span style={{ color: relatedCat?.color }}>
                                                        {relatedCat?.symbol ?? "⚡"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1 truncate">
                                                        {related.name}
                                                    </h3>
                                                    <p className="text-xs text-[rgb(80,80,120)] line-clamp-2 leading-relaxed">
                                                        {related.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Try it <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
