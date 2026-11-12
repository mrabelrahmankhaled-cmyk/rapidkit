import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, canonicalUrl, SITE_DOMAIN } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Affiliate Disclosure",
    description:
        "Learn how RapidKit is funded through affiliate partnerships, how we evaluate recommended software, and why our online tools remain 100% free.",
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl("/affiliate-disclosure") },
    openGraph: {
        title: `Affiliate Disclosure | ${SITE_NAME}`,
        description:
            "How RapidKit uses affiliate links to keep all browser tools free, private, and unlocked.",
        url: canonicalUrl("/affiliate-disclosure"),
        siteName: SITE_NAME,
        type: "website",
    },
};

const LAST_UPDATED = "March 1, 2026";

export default function AffiliateDisclosurePage() {
    return (
        <div className="min-h-screen">
            <header className="border-b border-[rgb(30,30,46)] py-12">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-5">
                        🤝 Transparency First
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Affiliate Disclosure</h1>
                    <p className="text-[rgb(80,80,120)]">Last updated: {LAST_UPDATED}</p>
                </div>
            </header>

            <div className="container-narrow py-12 space-y-10">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                    <h2 className="text-lg font-bold text-white mb-2">TL;DR — Plain English Summary</h2>
                    <ul className="space-y-1.5 text-sm text-[rgb(140,140,180)]">
                        <li>
                            ✅ All tools on <strong className="text-white">{SITE_DOMAIN}</strong> are free to use with no paywalls or account requirements.
                        </li>
                        <li>
                            ✅ Some pages include links to third-party software or services. If you click an affiliate link and make a purchase, we may earn a commission at <strong className="text-white">zero extra cost to you</strong>.
                        </li>
                        <li>
                            ✅ Our editorial comparisons and pros/cons are written independently; partners cannot pay to hide drawbacks or fabricate ratings.
                        </li>
                    </ul>
                </div>

                <Section title="1. FTC & Regulatory Compliance">
                    <p>
                        In compliance with the Federal Trade Commission (FTC) guidelines (16 CFR Part 255) and international consumer transparency standards, RapidKit discloses that some links on <strong>{SITE_DOMAIN}</strong> are affiliate referral links.
                    </p>
                    <p>
                        When you click on a link marked with our partner disclosure (which uses <code className="text-violet-300">rel=&quot;sponsored nofollow noopener&quot;</code>) and sign up or purchase a subscription on the partner&apos;s website, RapidKit may receive a referral fee or commission from that vendor.
                    </p>
                </Section>

                <Section title="2. Does This Cost You Anything Extra?">
                    <p>
                        <strong className="text-white">No.</strong> The price you pay for any product or service is the exact same whether you use our affiliate link or navigate directly to the vendor&apos;s website. In some cases, partner links may apply a promotional discount or extended trial.
                    </p>
                </Section>

                <Section title="3. How We Choose Recommended Tools">
                    <p>
                        RapidKit provides instant, client-side browser utilities. However, some workflows — such as automated server-side image CDNs, large-scale SEO site crawls, team password vaults, or cloud hosting — require dedicated infrastructure beyond a single browser tab.
                    </p>
                    <p>When we recommend third-party software next to our tools or in comparison guides, we evaluate:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Direct relevance to the task you are performing.</li>
                        <li>Clear documentation of both strengths (<strong className="text-white">Pros</strong>) and limitations (<strong className="text-white">Cons</strong>).</li>
                        <li>Security, reliability, and developer/creator ergonomics.</li>
                    </ul>
                </Section>

                <Section title="4. Questions?">
                    <p>
                        If you have any questions regarding this disclosure or any partner mentioned on RapidKit, please reach out via our{" "}
                        <Link href="/contact" className="text-violet-400 hover:text-violet-300 underline">
                            Contact page
                        </Link>{" "}
                        or email us at{" "}
                        <a href={`mailto:hello@${SITE_DOMAIN}`} className="text-violet-400 hover:text-violet-300">
                            hello@{SITE_DOMAIN}
                        </a>
                        .
                    </p>
                </Section>

                <div className="pt-4 border-t border-[rgb(30,30,46)] flex gap-4">
                    <Link href="/privacy" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">
                        ← Privacy Policy
                    </Link>
                    <Link href="/" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">
                        Back to Home →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-white pb-2 border-b border-[rgb(30,30,46)]">{title}</h2>
            <div className="space-y-3 text-[rgb(120,120,160)] leading-relaxed text-sm">{children}</div>
        </section>
    );
}
