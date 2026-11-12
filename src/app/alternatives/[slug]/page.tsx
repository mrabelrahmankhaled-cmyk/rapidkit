import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ChevronDown,
    ExternalLink,
    Wrench,
    Compass,
} from "lucide-react";
import { ALTERNATIVES, getAlternativesBySlug, type AlternativeProduct } from "@/data/alternatives";
import { getComparisonsBySlugs } from "@/data/comparisons";
import { getToolBySlug, getCategoryById } from "@/data/tools";
import { getAffiliateById, isAffiliateConfigured } from "@/data/affiliates";
import { SITE_NAME, canonicalUrl, buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { AffiliateCTA } from "@/components/affiliate/AffiliateCTA";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return ALTERNATIVES.map((alt) => ({
        slug: alt.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const alt = getAlternativesBySlug(slug);

    if (!alt) {
        return { title: "Alternatives Guide Not Found" };
    }

    const pageUrl = canonicalUrl(`/alternatives/${alt.slug}`);

    return {
        title: alt.seo.title,
        description: alt.seo.description,
        keywords: alt.seo.keywords,
        robots: {
            index: alt.indexable,
            follow: alt.indexable,
        },
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${alt.seo.title} | ${SITE_NAME}`,
            description: alt.seo.description,
            url: pageUrl,
            siteName: SITE_NAME,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${alt.seo.title} | ${SITE_NAME}`,
            description: alt.seo.description,
        },
    };
}

function AlternativeCard({
    item,
    index,
    pageSlug,
}: {
    item: AlternativeProduct;
    index: number;
    pageSlug: string;
}) {
    const partner = item.affiliateId ? getAffiliateById(item.affiliateId) : undefined;
    const hasAffiliateUrl = isAffiliateConfigured(partner);

    return (
        <article className="glass-card p-6 sm:p-7 flex flex-col justify-between gap-6">
            <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white">{item.name}</h3>
                    </div>
                    {partner?.badge && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {partner.badge}
                        </span>
                    )}
                    {item.internalToolUrl && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Free RapidKit Utility
                        </span>
                    )}
                </div>

                <p className="text-sm text-[rgb(148,148,186)] leading-relaxed mb-4">{item.tagline}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <div className="p-3.5 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)]">
                        <div className="text-xs font-semibold text-white mb-1">Best For</div>
                        <p className="text-xs text-[rgb(130,130,170)] leading-relaxed">{item.bestFor}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-white">Pricing Model</span>
                            {item.pricingUrl && (
                                <a
                                    href={item.pricingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Official pricing <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-[rgb(130,130,170)] leading-relaxed">{item.pricingSummary}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                            Pros
                        </div>
                        <ul className="space-y-1.5">
                            {item.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[rgb(150,150,190)]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                            Cons
                        </div>
                        <ul className="space-y-1.5">
                            {item.cons.map((con, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[rgb(130,130,170)]">
                                    <XCircle className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {hasAffiliateUrl && partner && (
                <div className="pt-4 border-t border-[rgb(30,30,46)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-[rgb(100,100,140)]">
                        Partner link — we may earn a commission at no extra cost to you.{" "}
                        <Link href="/affiliate-disclosure" className="text-violet-400 hover:underline">
                            Affiliate Disclosure
                        </Link>
                    </p>
                    <AffiliateLink
                        affiliateId={partner.id}
                        href={partner.url}
                        toolSlug={`alternatives_${pageSlug}`}
                        placement="alternative_card"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all shrink-0"
                    >
                        {partner.ctaText}
                        <ExternalLink className="w-3.5 h-3.5" />
                    </AffiliateLink>
                </div>
            )}

            {item.internalToolUrl && (
                <div className="pt-4 border-t border-[rgb(30,30,46)] flex justify-end">
                    <Link
                        href={item.internalToolUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgb(20,20,32)] border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400 text-xs font-semibold transition-all"
                    >
                        Open Free RapidKit Tool <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </article>
    );
}

export default async function AlternativesDetailPage({ params }: Props) {
    const { slug } = await params;
    const alt = getAlternativesBySlug(slug);

    if (!alt) {
        notFound();
    }

    const relatedTools = alt.relatedToolSlugs
        .map((s) => getToolBySlug(s))
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

    const relatedComparisons = getComparisonsBySlugs(alt.relatedComparisonSlugs);

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Alternatives", path: "/alternatives" },
        { name: `${alt.targetProduct} Alternatives`, path: `/alternatives/${alt.slug}` },
    ]);

    const faqJsonLd = alt.faqs.length > 0 ? buildFaqJsonLd(alt.faqs) : null;

    return (
        <>
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
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] mb-6 flex-wrap">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/alternatives" className="hover:text-white transition-colors">Alternatives</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">{alt.targetProduct} Alternatives</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <Link
                                href="/alternatives"
                                className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-lg px-3 py-1.5"
                            >
                                <ArrowLeft className="w-3 h-3" /> All Alternatives
                            </Link>
                            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                                {alt.categoryLabel}
                            </span>
                            {alt.lastVerified && (
                                <span className="text-xs text-[rgb(110,110,150)]">
                                    Last reviewed: {alt.lastVerified}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                            {alt.title}
                        </h1>
                        <p className="text-base sm:text-lg text-[rgb(148,148,186)] leading-relaxed mb-6">
                            {alt.subtitle}
                        </p>

                        <div className="space-y-4 p-6 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)]">
                            {alt.intro.map((paragraph, idx) => (
                                <p key={idx} className="text-sm sm:text-base text-[rgb(155,155,195)] leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}

                            {alt.whyLookForAlternatives.length > 0 && (
                                <div className="pt-4 border-t border-[rgb(30,30,46)]">
                                    <h2 className="text-sm font-bold text-white mb-2.5">
                                        Why Teams Look for {alt.targetProduct} Alternatives
                                    </h2>
                                    <ul className="space-y-1.5">
                                        {alt.whyLookForAlternatives.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[rgb(140,140,180)]">
                                                <span className="text-cyan-400 font-bold">•</span>
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Decision Guide */}
                    <section className="glass-card p-6 sm:p-8 mb-10" aria-labelledby="decision-guide-heading">
                        <div className="flex items-center gap-2 mb-5">
                            <Compass className="w-5 h-5 text-cyan-400" />
                            <h2 id="decision-guide-heading" className="text-xl font-bold text-white">
                                Decision Guide: Matching the Right Tool to Your Workflow
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {alt.decisionGuide.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] flex flex-col justify-between gap-3"
                                >
                                    <p className="text-xs sm:text-sm text-[rgb(148,148,186)] leading-relaxed">
                                        <strong className="text-white">If:</strong> {item.scenario}
                                    </p>
                                    <div className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2">
                                        → {item.recommendation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary Comparison Table */}
                    <section className="glass-card p-6 sm:p-8 mb-10 overflow-hidden" aria-labelledby="comparison-table-heading">
                        <h2 id="comparison-table-heading" className="text-xl font-bold text-white mb-5">
                            {alt.targetProduct} Alternatives Comparison Table
                        </h2>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-[rgb(40,40,60)] text-xs uppercase tracking-wider text-[rgb(120,120,160)]">
                                        <th className="py-3.5 pr-4 font-semibold">Option</th>
                                        <th className="py-3.5 px-4 font-semibold">Primary Use Case</th>
                                        <th className="py-3.5 px-4 font-semibold">Execution Model</th>
                                        <th className="py-3.5 px-4 font-semibold">Automation / Integration</th>
                                        <th className="py-3.5 pl-4 font-semibold">Pricing Structure</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(30,30,46)] text-xs sm:text-sm">
                                    {alt.comparisonTable.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-[rgb(18,18,28)] transition-colors">
                                            <td className="py-3.5 pr-4 font-semibold text-white align-top">
                                                {row.name}
                                            </td>
                                            <td className="py-3.5 px-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.primaryUseCase}
                                            </td>
                                            <td className="py-3.5 px-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.processingModel}
                                            </td>
                                            <td className="py-3.5 px-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.automationAndApi}
                                            </td>
                                            <td className="py-3.5 pl-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.pricingModel}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Detailed Breakdown per Alternative */}
                    <section className="space-y-6 mb-10" aria-labelledby="detailed-options-heading">
                        <h2 id="detailed-options-heading" className="text-2xl font-bold text-white">
                            Detailed Breakdown of Top {alt.targetProduct} Alternatives
                        </h2>
                        {alt.alternatives.map((item, idx) => (
                            <AlternativeCard
                                key={item.name}
                                item={item}
                                index={idx}
                                pageSlug={alt.slug}
                            />
                        ))}
                    </section>

                    {/* Shared Affiliate CTA Box (renders nothing when partner URLs are unconfigured) */}
                    <AffiliateCTA
                        affiliateIds={alt.affiliateIds}
                        toolSlug={`alternatives_${alt.slug}`}
                        placement="alternatives_bottom"
                        title={`Recommended ${alt.targetProduct} Alternatives`}
                    />

                    {/* Free RapidKit Browser Tools Section (3+ internal links) */}
                    {relatedTools.length > 0 && (
                        <section className="glass-card p-6 sm:p-8 my-10" aria-labelledby="free-tools-heading">
                            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-violet-400" />
                                    <h2 id="free-tools-heading" className="text-xl font-bold text-white">
                                        Free RapidKit Browser Tools You Can Use Right Now
                                    </h2>
                                </div>
                                <Link
                                    href="/tools"
                                    className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                                >
                                    All {relatedTools.length}+ tools <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-xs sm:text-sm text-[rgb(130,130,170)] mb-5">
                                Need to complete a quick task without signing up for a new subscription? Try these free RapidKit tools:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {relatedTools.map((tool) => {
                                    const cat = getCategoryById(tool.categoryId);
                                    return (
                                        <Link
                                            key={tool.id}
                                            href={`/tools/${tool.categoryId}/${tool.slug}`}
                                            className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-cyan-500/40 transition-all group block"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                                                    style={{ background: `linear-gradient(135deg, ${cat?.color}20, ${cat?.color}40)` }}
                                                >
                                                    <span style={{ color: cat?.color }}>{cat?.symbol ?? "⚡"}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
                                                        {tool.name}
                                                    </h3>
                                                    <p className="text-xs text-[rgb(110,110,150)] line-clamp-2 leading-relaxed">
                                                        {tool.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Frequently Asked Questions */}
                    {alt.faqs.length > 0 && (
                        <section className="glass-card p-6 sm:p-8 mb-10" aria-labelledby="faq-heading">
                            <div className="flex items-center gap-2 mb-5">
                                <HelpCircle className="w-5 h-5 text-cyan-400" />
                                <h2 id="faq-heading" className="text-xl font-bold text-white">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                            <div className="divide-y divide-[rgb(30,30,46)]">
                                {alt.faqs.map((faq, idx) => (
                                    <details key={idx} className="group py-4 first:pt-0 last:pb-0">
                                        <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm font-semibold text-white hover:text-cyan-300 transition-colors">
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

                    {/* Related Comparisons */}
                    {relatedComparisons.length > 0 && (
                        <section className="glass-card p-6" aria-labelledby="related-comparisons-heading">
                            <h2 id="related-comparisons-heading" className="text-base font-bold text-white mb-3">
                                Related Head-to-Head Comparisons
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {relatedComparisons.map((comp) => (
                                    <Link
                                        key={comp.slug}
                                        href={`/compare/${comp.slug}`}
                                        className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-violet-500/40 transition-all group block"
                                    >
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 block mb-1">
                                            Comparison • {comp.categoryLabel}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                                            {comp.title}
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
