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
import { COMPARISONS, getComparisonBySlug, type ComparisonProduct } from "@/data/comparisons";
import { getAlternativesBySlugs } from "@/data/alternatives";
import { getToolBySlug, getCategoryById } from "@/data/tools";
import { getAffiliateById, isAffiliateConfigured } from "@/data/affiliates";
import { SITE_NAME, canonicalUrl, buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { AffiliateCTA } from "@/components/affiliate/AffiliateCTA";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return COMPARISONS.map((comp) => ({
        slug: comp.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const comp = getComparisonBySlug(slug);

    if (!comp) {
        return { title: "Comparison Not Found" };
    }

    const pageUrl = canonicalUrl(`/compare/${comp.slug}`);

    return {
        title: comp.seo.title,
        description: comp.seo.description,
        keywords: comp.seo.keywords,
        robots: {
            index: comp.indexable,
            follow: comp.indexable,
        },
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${comp.seo.title} | ${SITE_NAME}`,
            description: comp.seo.description,
            url: pageUrl,
            siteName: SITE_NAME,
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${comp.seo.title} | ${SITE_NAME}`,
            description: comp.seo.description,
        },
    };
}

function ProductDetailCard({
    product,
    pageSlug,
    accentClass,
}: {
    product: ComparisonProduct;
    pageSlug: string;
    accentClass: "violet" | "cyan";
}) {
    const partner = product.affiliateId ? getAffiliateById(product.affiliateId) : undefined;
    const hasAffiliateUrl = isAffiliateConfigured(partner);

    const badgeStyle =
        accentClass === "violet"
            ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
            : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

    return (
        <div className="glass-card p-6 flex flex-col justify-between gap-6">
            <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                    <h2 className="text-xl font-bold text-white">{product.name}</h2>
                    {partner?.badge && (
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                            {partner.badge}
                        </span>
                    )}
                </div>

                <p className="text-sm text-[rgb(148,148,186)] leading-relaxed mb-4">{product.tagline}</p>

                <div className="p-3.5 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)] mb-4">
                    <div className="text-xs font-semibold text-white mb-1">Best For</div>
                    <p className="text-xs text-[rgb(130,130,170)] leading-relaxed">{product.bestFor}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)] mb-5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">Pricing Model</span>
                        <a
                            href={product.pricingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Official pricing page <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                    <p className="text-xs text-[rgb(130,130,170)] leading-relaxed">{product.pricingSummary}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                            Key Strengths
                        </div>
                        <ul className="space-y-1.5">
                            {product.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[rgb(150,150,190)]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                            Trade-offs &amp; Limitations
                        </div>
                        <ul className="space-y-1.5">
                            {product.cons.map((con, idx) => (
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
                <div className="pt-4 border-t border-[rgb(30,30,46)]">
                    <AffiliateLink
                        affiliateId={partner.id}
                        href={partner.url}
                        toolSlug={`compare_${pageSlug}`}
                        placement="comparison_product_card"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold transition-all"
                    >
                        {partner.ctaText}
                        <ExternalLink className="w-3.5 h-3.5" />
                    </AffiliateLink>
                    <p className="mt-2 text-[11px] text-[rgb(100,100,140)] text-center">
                        Partner link — we may earn a commission at no extra cost to you.{" "}
                        <Link
                            href="/affiliate-disclosure"
                            aria-label="Read our full affiliate disclosure"
                            className="text-violet-400 hover:underline"
                        >
                            Disclosure
                        </Link>
                    </p>
                </div>
            )}
        </div>
    );
}

export default async function ComparisonDetailPage({ params }: Props) {
    const { slug } = await params;
    const comp = getComparisonBySlug(slug);

    if (!comp) {
        notFound();
    }

    const relatedTools = comp.relatedToolSlugs
        .map((s) => getToolBySlug(s))
        .filter((t): t is NonNullable<typeof t> => Boolean(t));

    const relatedAlternatives = getAlternativesBySlugs(comp.relatedAlternativeSlugs);

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Comparisons", path: "/compare" },
        { name: `${comp.productA.name} vs ${comp.productB.name}`, path: `/compare/${comp.slug}` },
    ]);

    const faqJsonLd = comp.faqs.length > 0 ? buildFaqJsonLd(comp.faqs) : null;

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
                        <Link href="/compare" className="hover:text-white transition-colors">Comparisons</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">
                            {comp.productA.name} vs {comp.productB.name}
                        </span>
                    </nav>

                    {/* Header */}
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <Link
                                href="/compare"
                                className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-lg px-3 py-1.5"
                            >
                                <ArrowLeft className="w-3 h-3" /> All Comparisons
                            </Link>
                            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                                {comp.categoryLabel}
                            </span>
                            {comp.lastVerified && (
                                <span className="text-xs text-[rgb(110,110,150)]">
                                    Last reviewed: {comp.lastVerified}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                            {comp.title}
                        </h1>
                        <p className="text-base sm:text-lg text-[rgb(148,148,186)] leading-relaxed mb-6">
                            {comp.subtitle}
                        </p>

                        <div className="space-y-4 p-6 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(35,35,52)]">
                            {comp.intro.map((paragraph, idx) => (
                                <p key={idx} className="text-sm sm:text-base text-[rgb(155,155,195)] leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </header>

                    {/* Decision Guide */}
                    <section className="glass-card p-6 sm:p-8 mb-10" aria-labelledby="decision-guide-heading">
                        <div className="flex items-center gap-2 mb-5">
                            <Compass className="w-5 h-5 text-violet-400" />
                            <h2 id="decision-guide-heading" className="text-xl font-bold text-white">
                                Quick Decision Guide: Which Should You Choose?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 rounded-xl bg-[rgb(14,14,22)] border border-violet-500/25">
                                <h3 className="text-base font-bold text-violet-300 mb-3">
                                    Choose {comp.productA.name} if...
                                </h3>
                                <ul className="space-y-2.5">
                                    {comp.decisionGuide.chooseA.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(155,155,195)] leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-5 rounded-xl bg-[rgb(14,14,22)] border border-cyan-500/25">
                                <h3 className="text-base font-bold text-cyan-300 mb-3">
                                    Choose {comp.productB.name} if...
                                </h3>
                                <ul className="space-y-2.5">
                                    {comp.decisionGuide.chooseB.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[rgb(155,155,195)] leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Side-by-Side Comparison Table */}
                    <section className="glass-card p-6 sm:p-8 mb-10 overflow-hidden" aria-labelledby="comparison-table-heading">
                        <h2 id="comparison-table-heading" className="text-xl font-bold text-white mb-5">
                            Feature-by-Feature Comparison: {comp.productA.name} vs {comp.productB.name}
                        </h2>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="w-full text-left border-collapse min-w-[540px]">
                                <thead>
                                    <tr className="border-b border-[rgb(40,40,60)] text-xs uppercase tracking-wider text-[rgb(120,120,160)]">
                                        <th className="py-3.5 pr-4 font-semibold w-1/4">Feature / Dimension</th>
                                        <th className="py-3.5 px-4 font-semibold text-violet-300 w-[37.5%]">
                                            {comp.productA.name}
                                        </th>
                                        <th className="py-3.5 pl-4 font-semibold text-cyan-300 w-[37.5%]">
                                            {comp.productB.name}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgb(30,30,46)] text-xs sm:text-sm">
                                    {comp.comparisonTable.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-[rgb(18,18,28)] transition-colors">
                                            <td className="py-3.5 pr-4 font-medium text-white align-top">
                                                {row.feature}
                                            </td>
                                            <td className="py-3.5 px-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.productA}
                                            </td>
                                            <td className="py-3.5 pl-4 text-[rgb(150,150,190)] align-top leading-relaxed">
                                                {row.productB}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Detailed Product Breakdown (Pros, Cons, Pricing Link) */}
                    <section className="mb-10" aria-label="Detailed Product Profiles">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ProductDetailCard
                                product={comp.productA}
                                pageSlug={comp.slug}
                                accentClass="violet"
                            />
                            <ProductDetailCard
                                product={comp.productB}
                                pageSlug={comp.slug}
                                accentClass="cyan"
                            />
                        </div>
                    </section>

                    {/* Shared Affiliate CTA Box (renders nothing when partner URLs are unconfigured) */}
                    <AffiliateCTA
                        affiliateIds={comp.affiliateIds}
                        toolSlug={`compare_${comp.slug}`}
                        placement="comparison_bottom"
                        title="Explore Official Partner Plans"
                    />

                    {/* Free RapidKit Browser Tools Section (3+ internal links) */}
                    {relatedTools.length > 0 && (
                        <section className="glass-card p-6 sm:p-8 my-10" aria-labelledby="free-tools-heading">
                            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-cyan-400" />
                                    <h2 id="free-tools-heading" className="text-xl font-bold text-white">
                                        Free RapidKit Tools for This Workflow
                                    </h2>
                                </div>
                                <Link
                                    href="/tools"
                                    className="text-xs text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                                >
                                    Browse all tools <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <p className="text-xs sm:text-sm text-[rgb(130,130,170)] mb-5">
                                Regardless of whether you choose {comp.productA.name} or {comp.productB.name}, you can use these free RapidKit utilities right now with no sign-up:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {relatedTools.map((tool) => {
                                    const cat = getCategoryById(tool.categoryId);
                                    return (
                                        <Link
                                            key={tool.id}
                                            href={`/tools/${tool.categoryId}/${tool.slug}`}
                                            className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-violet-500/40 transition-all group block"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm shrink-0"
                                                    style={{ background: `linear-gradient(135deg, ${cat?.color}20, ${cat?.color}40)` }}
                                                >
                                                    <span style={{ color: cat?.color }}>{cat?.symbol ?? "⚡"}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1">
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
                    {comp.faqs.length > 0 && (
                        <section className="glass-card p-6 sm:p-8 mb-10" aria-labelledby="faq-heading">
                            <div className="flex items-center gap-2 mb-5">
                                <HelpCircle className="w-5 h-5 text-violet-400" />
                                <h2 id="faq-heading" className="text-xl font-bold text-white">
                                    Frequently Asked Questions
                                </h2>
                            </div>
                            <div className="divide-y divide-[rgb(30,30,46)]">
                                {comp.faqs.map((faq, idx) => (
                                    <details key={idx} className="group py-4 first:pt-0 last:pb-0">
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

                    {/* Related Alternatives */}
                    {relatedAlternatives.length > 0 && (
                        <section className="glass-card p-6" aria-labelledby="related-alternatives-heading">
                            <h2 id="related-alternatives-heading" className="text-base font-bold text-white mb-3">
                                Related Software Alternatives Guides
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {relatedAlternatives.map((alt) => (
                                    <Link
                                        key={alt.slug}
                                        href={`/alternatives/${alt.slug}`}
                                        className="p-4 rounded-xl bg-[rgb(14,14,22)] border border-[rgb(38,38,58)] hover:border-cyan-500/40 transition-all group block"
                                    >
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300 block mb-1">
                                            Alternatives • {alt.categoryLabel}
                                        </span>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                            {alt.title}
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
