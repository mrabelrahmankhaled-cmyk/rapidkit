import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, canonicalUrl, SITE_DOMAIN } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "RapidKit's Privacy Policy. Learn how we handle your data — most browser tools run locally on your device, alongside anonymized Google Analytics and transparent affiliate links.",
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl("/privacy") },
    openGraph: {
        title: `Privacy Policy | ${SITE_NAME}`,
        description:
            "Learn how RapidKit handles your privacy, client-side tool execution, Google Analytics, and affiliate cookies.",
        url: canonicalUrl("/privacy"),
        siteName: SITE_NAME,
        type: "website",
    },
};

const LAST_UPDATED = "March 1, 2026";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            {/* ─── Header ─────────────────────────────────── */}
            <header className="border-b border-[rgb(30,30,46)] py-12">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium mb-5">
                        🔒 Your Privacy Matters
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
                    <p className="text-[rgb(80,80,120)]">Last updated: {LAST_UPDATED}</p>
                </div>
            </header>

            {/* ─── Content ────────────────────────────────── */}
            <div className="container-narrow py-12 space-y-10">
                {/* TL;DR Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                    <h2 className="text-lg font-bold text-white mb-2">TL;DR — The Short Version</h2>
                    <ul className="space-y-1.5 text-sm text-[rgb(140,140,180)]">
                        <li>✅ <strong className="text-white">Most tools run locally in your browser</strong> — files, images, and text you process are never uploaded to our servers.</li>
                        <li>✅ We <strong className="text-white">do not sell</strong> your personal data to anyone, ever.</li>
                        <li>✅ No account or sign-up is required to use any tool.</li>
                        <li>✅ We use Google Analytics for aggregated traffic insights and partner affiliate links to fund the site.</li>
                    </ul>
                </div>

                <Section title="1. Who We Are">
                    <p>RapidKit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website located at <strong>{SITE_DOMAIN}</strong>. We provide free online tools for productivity, image editing, developer utilities, and digital marketing.</p>
                    <p>If you have any questions about this policy, contact us at: <a href={`mailto:privacy@${SITE_DOMAIN}`} className="text-violet-400 hover:text-violet-300">privacy@{SITE_DOMAIN}</a></p>
                </Section>

                <Section title="2. Information We Collect">
                    <h3 className="text-base font-semibold text-white mb-2">2.1 Information You Provide</h3>
                    <p>We only collect information you voluntarily provide:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Newsletter subscription:</strong> If you subscribe to our newsletter, we collect your email address.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Contact form:</strong> If you contact us, we collect your name and email.</li>
                    </ul>

                    <h3 className="text-base font-semibold text-white mb-2 mt-5">2.2 Automatically Collected Information (Google Analytics)</h3>
                    <p>When you visit RapidKit, we use Google Analytics (GA4) to collect aggregated usage metrics, such as:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Browser type, device category, and operating system</li>
                        <li>Pages visited, time spent, and outbound click events</li>
                        <li>Referring website or search query</li>
                        <li>Approximate country/city-level location (IP addresses are anonymized by GA4)</li>
                    </ul>
                    <p className="mt-3">This data is collected in <strong className="text-white">aggregated, anonymized form</strong> to understand which tools are most useful and cannot be used by us to identify you personally.</p>

                    <h3 className="text-base font-semibold text-white mb-2 mt-5">2.3 Tool Execution &amp; Network Requests</h3>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Local browser tools (all other tools):</strong> Files, images, and text you process (such as image compression, WebP conversion, EXIF removal, JSON/CSV formatting, signatures, passwords, and screen recordings) run locally in your browser and <strong className="text-white">never leave your device</strong>.</li>
                        <li><strong className="text-[rgb(180,180,220)]">YouTube Tag Extractor:</strong> When you submit a video, your browser sends the 11-character YouTube video ID to our server endpoint (<code className="text-violet-300">/api/youtube-tags</code>), which fetches the public YouTube watch page metadata, and your browser loads the preview thumbnail from <code className="text-violet-300">img.youtube.com</code>.</li>
                        <li><strong className="text-[rgb(180,180,220)]">YouTube Thumbnail Downloader:</strong> Extracts the video ID in your browser and fetches public thumbnail files directly from YouTube&apos;s image CDN (<code className="text-violet-300">img.youtube.com</code>).</li>
                        <li><strong className="text-[rgb(180,180,220)]">What Is My IP Address?:</strong> On page load, your browser makes a direct request to <code className="text-violet-300">ipapi.co</code> to detect your public IP address, ISP, and approximate city/country location.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Meta Tag Generator (Social Preview):</strong> All HTML tag generation is local; if you switch to the Facebook or Twitter/X card preview tab, your browser renders the <code className="text-violet-300">Preview Image URL</code> you entered in an <code className="text-violet-300">&lt;img&gt;</code> tag.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Payment information:</strong> We do not collect any payment details because all tools on RapidKit are free.</li>
                    </ul>
                </Section>

                <Section title="3. How We Use Your Information">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Operate, maintain, and improve the RapidKit website and tools.</li>
                        <li>Send newsletters to subscribers (only with your explicit consent).</li>
                        <li>Respond to your inquiries and support requests.</li>
                        <li>Measure aggregate tool usage and outbound partner link clicks.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>
                    <p className="mt-3"><strong className="text-white">We never sell your personal data to third parties.</strong></p>
                </Section>

                <Section title="4. Cookies & Affiliate Tracking">
                    <p>RapidKit and our third-party partners use the following types of cookies:</p>
                    <ul className="list-disc pl-5 space-y-2 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Essential cookies / local storage:</strong> Used only when a tool needs to remember your local preferences in your browser.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Google Analytics cookies:</strong> First-party cookies (such as <code className="text-violet-300">_ga</code>) used by Google Analytics 4 to distinguish unique visits and measure site performance.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Affiliate referral cookies:</strong> Some pages contain affiliate links to recommended third-party products. If you click an affiliate link, the destination partner or affiliate network may place a referral cookie on your browser to attribute any resulting purchase to RapidKit (at no extra cost to you). RapidKit does not set third-party affiliate cookies until you actively click an external partner link. See our <Link href="/affiliate-disclosure" className="text-violet-400 hover:text-violet-300 underline">Affiliate Disclosure</Link> for full details.</li>
                    </ul>
                    <p className="mt-3">You can control or block cookies at any time through your browser settings or by using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Analytics Opt-out Browser Add-on</a>.</p>
                </Section>

                <Section title="5. Third-Party Services & Affiliate Links">
                    <p>We use the following third-party services, each governed by their own privacy policies:</p>
                    <ul className="list-disc pl-5 space-y-2 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Vercel:</strong> Website hosting and edge delivery. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Vercel Privacy Policy</a></li>
                        <li><strong className="text-[rgb(180,180,220)]">Google Analytics & Google AdSense:</strong> Traffic analytics and optional display advertising. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Privacy Policy</a></li>
                        <li><strong className="text-[rgb(180,180,220)]">Affiliate Partners:</strong> When you click a link marked as a partner/affiliate recommendation, you are taken to an external vendor&apos;s website governed by that vendor&apos;s privacy policy.</li>
                    </ul>
                </Section>

                <Section title="6. Data Retention">
                    <p>We retain personal data only as long as necessary:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Newsletter emails:</strong> Until you unsubscribe.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Analytics data:</strong> Up to 14 months (anonymized).</li>
                        <li><strong className="text-[rgb(180,180,220)]">Contact inquiries:</strong> Up to 2 years.</li>
                    </ul>
                </Section>

                <Section title="7. Your Rights (GDPR & CCPA)">
                    <p>If you are in the European Economic Area (EEA), UK, or California, you have the following rights:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Right to access:</strong> Request a copy of the data we hold about you.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to rectification:</strong> Request correction of inaccurate data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to erasure:</strong> Request deletion of your data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to object:</strong> Object to certain uses of your data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to withdraw consent:</strong> Unsubscribe from newsletters at any time.</li>
                    </ul>
                    <p className="mt-3">To exercise any of these rights, email us at <a href={`mailto:privacy@${SITE_DOMAIN}`} className="text-violet-400 hover:text-violet-300">privacy@{SITE_DOMAIN}</a></p>
                </Section>

                <Section title="8. Children's Privacy">
                    <p>RapidKit is not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.</p>
                </Section>

                <Section title="9. Changes to This Policy">
                    <p>We may update this Privacy Policy from time to time. We will notify newsletter subscribers of significant changes and update the &quot;Last updated&quot; date at the top of this page.</p>
                </Section>

                <Section title="10. Contact Us">
                    <p>For privacy-related questions:</p>
                    <ul className="list-none space-y-1 text-[rgb(120,120,160)]">
                        <li>📧 <a href={`mailto:privacy@${SITE_DOMAIN}`} className="text-violet-400 hover:text-violet-300">privacy@{SITE_DOMAIN}</a></li>
                        <li>🌐 <Link href="/contact" className="text-violet-400 hover:text-violet-300">Contact Form</Link></li>
                    </ul>
                </Section>

                {/* Back link */}
                <div className="pt-4 border-t border-[rgb(30,30,46)] flex gap-4">
                    <Link href="/" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">← Back to Home</Link>
                    <Link href="/terms" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">Terms of Service →</Link>
                    <Link href="/affiliate-disclosure" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">Affiliate Disclosure →</Link>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-white pb-2 border-b border-[rgb(30,30,46)]">{title}</h2>
            <div className="space-y-3 text-[rgb(120,120,160)] leading-relaxed text-sm">
                {children}
            </div>
        </section>
    );
}
