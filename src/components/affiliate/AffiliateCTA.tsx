import Link from "next/link";
import { ExternalLink, Check, Sparkles } from "lucide-react";
import { getConfiguredAffiliatesByIds, type AffiliateId, type AffiliatePartner } from "@/data/affiliates";
import { AffiliateLink } from "./AffiliateLink";

type AffiliateCTAProps = {
    affiliateIds?: AffiliateId[];
    toolSlug?: string;
    placement?: string;
    title?: string;
};

export function AffiliateCTA({
    affiliateIds,
    toolSlug,
    placement = "under_tool",
    title = "Recommended Pro Tools",
}: AffiliateCTAProps) {
    const partners: AffiliatePartner[] = getConfiguredAffiliatesByIds(affiliateIds);

    // Render nothing if the tool has no affiliateIds or partner URLs are still placeholders
    if (partners.length === 0) {
        return null;
    }

    return (
        <section
            aria-label={title}
            className="my-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-[rgb(17,17,27)] to-cyan-500/10 border border-violet-500/25 p-5 sm:p-6"
        >
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                        <Sparkles className="w-3 h-3" /> {title}
                    </span>
                </div>
                <span className="text-[11px] text-[rgb(100,100,140)]">
                    Partner recommendation ·{" "}
                    <Link
                        href="/affiliate-disclosure"
                        aria-label="Read our full affiliate disclosure"
                        className="underline decoration-[rgb(80,80,120)] hover:text-violet-300 transition-colors"
                    >
                        Affiliate disclosure
                    </Link>
                </span>
            </div>

            <div className={partners.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {partners.map((partner) => (
                    <div
                        key={partner.id}
                        className="rounded-xl bg-[rgb(10,10,15)]/80 border border-[rgb(45,45,65)] p-4 flex flex-col justify-between gap-4"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                <h3 className="text-base font-bold text-white">{partner.name}</h3>
                                {partner.badge && (
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-cyan-300">
                                        {partner.badge}
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm text-[rgb(148,148,186)] leading-relaxed mb-3">
                                {partner.shortPitch}
                            </p>

                            {partner.pros.length > 0 && (
                                <ul className="space-y-1.5 mb-2">
                                    {partner.pros.slice(0, 3).map((pro) => (
                                        <li
                                            key={pro}
                                            className="flex items-start gap-2 text-xs text-[rgb(140,140,180)]"
                                        >
                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[rgb(30,30,46)]">
                            <AffiliateLink
                                href={partner.url}
                                affiliateId={partner.id}
                                toolSlug={toolSlug}
                                placement={placement}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold transition-all w-full sm:w-auto"
                            >
                                <span>{partner.ctaText}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </AffiliateLink>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-3 text-[11px] text-[rgb(80,80,120)] leading-relaxed">
                Disclosure: Some links above are affiliate links. If you choose to purchase through them, RapidKit may earn a commission at no extra cost to you.{" "}
                <Link
                    href="/affiliate-disclosure"
                    aria-label="Read our full affiliate disclosure"
                    className="text-violet-400 hover:text-violet-300 underline"
                >
                    Learn more
                </Link>
                .
            </p>
        </section>
    );
}
