import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy | RapidKit",
    description:
        "RapidKit's Privacy Policy. Learn how we handle your data — spoiler: we barely collect any. All tools run in your browser. No accounts, no tracking, no data sales.",
    robots: { index: true, follow: true },
    alternates: { canonical: "https://rapidkit.tools/privacy" },
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
                        <li>✅ All tools run <strong className="text-white">100% in your browser</strong> — files are never uploaded to our servers.</li>
                        <li>✅ We <strong className="text-white">do not sell</strong> your data to anyone, ever.</li>
                        <li>✅ No account or sign-up is required to use any tool.</li>
                        <li>✅ We use basic, anonymized analytics to improve the site.</li>
                    </ul>
                </div>

                <Section title="1. Who We Are">
                    <p>RapidKit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website located at <strong>rapidkit.tools</strong>. We provide free online tools for productivity, image editing, developer utilities, and more.</p>
                    <p>If you have any questions about this policy, contact us at: <a href="mailto:privacy@rapidkit.tools" className="text-violet-400 hover:text-violet-300">privacy@rapidkit.tools</a></p>
                </Section>

                <Section title="2. Information We Collect">
                    <h3 className="text-base font-semibold text-white mb-2">2.1 Information You Provide</h3>
                    <p>We only collect information you voluntarily provide:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Newsletter subscription:</strong> If you subscribe to our newsletter, we collect your email address.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Contact form:</strong> If you contact us, we collect your name and email.</li>
                    </ul>

                    <h3 className="text-base font-semibold text-white mb-2 mt-5">2.2 Automatically Collected Information</h3>
                    <p>When you visit RapidKit, we may automatically collect:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Pages visited and time spent</li>
                        <li>Referring website</li>
                        <li>Country-level location (not precise location)</li>
                    </ul>
                    <p className="mt-3">This data is collected in <strong className="text-white">aggregated, anonymized form</strong> and cannot be used to identify you personally.</p>

                    <h3 className="text-base font-semibold text-white mb-2 mt-5">2.3 What We Do NOT Collect</h3>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Files you process with our tools (images, text, JSON) — these <strong className="text-white">never leave your browser</strong>.</li>
                        <li>YouTube URLs you enter (processed client-side only, except for the Tag Extractor API which fetches publicly available data).</li>
                        <li>Payment information (all tools are free).</li>
                    </ul>
                </Section>

                <Section title="3. How We Use Your Information">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Operate and improve the RapidKit website and tools.</li>
                        <li>Send newsletters to subscribers (only with your consent).</li>
                        <li>Respond to your inquiries and support requests.</li>
                        <li>Understand which tools are most used so we can build better ones.</li>
                        <li>Comply with legal obligations.</li>
                    </ul>
                    <p className="mt-3"><strong className="text-white">We never sell your personal data to third parties.</strong></p>
                </Section>

                <Section title="4. Cookies">
                    <p>RapidKit uses minimal cookies:</p>
                    <ul className="list-disc pl-5 space-y-2 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Essential cookies:</strong> Required for the website to function. Cannot be disabled.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Analytics cookies:</strong> Help us understand how visitors use the site. Data is anonymized.</li>
                    </ul>
                    <p className="mt-3">You can control cookies through your browser settings. Disabling cookies may affect some website functionality.</p>
                </Section>

                <Section title="5. Third-Party Services">
                    <p>We use the following third-party services, each with their own privacy policies:</p>
                    <ul className="list-disc pl-5 space-y-2 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Vercel:</strong> Website hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Vercel Privacy Policy</a></li>
                        <li><strong className="text-[rgb(180,180,220)]">Google AdSense:</strong> We display ads from Google AdSense. Google may use cookies to serve relevant ads. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Privacy Policy</a></li>
                    </ul>
                </Section>

                <Section title="6. Data Retention">
                    <p>We retain personal data only as long as necessary:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Newsletter emails:</strong> Until you unsubscribe.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Analytics data:</strong> 13 months (anonymized).</li>
                        <li><strong className="text-[rgb(180,180,220)]">Contact inquiries:</strong> Up to 2 years.</li>
                    </ul>
                </Section>

                <Section title="7. Your Rights (GDPR)">
                    <p>If you are in the European Economic Area (EEA), you have the following rights:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li><strong className="text-[rgb(180,180,220)]">Right to access:</strong> Request a copy of the data we hold about you.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to rectification:</strong> Request correction of inaccurate data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to erasure:</strong> Request deletion of your data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to object:</strong> Object to certain uses of your data.</li>
                        <li><strong className="text-[rgb(180,180,220)]">Right to withdraw consent:</strong> Unsubscribe from newsletters at any time.</li>
                    </ul>
                    <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@rapidkit.tools" className="text-violet-400 hover:text-violet-300">privacy@rapidkit.tools</a></p>
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
                        <li>📧 <a href="mailto:privacy@rapidkit.tools" className="text-violet-400 hover:text-violet-300">privacy@rapidkit.tools</a></li>
                        <li>🌐 <Link href="/contact" className="text-violet-400 hover:text-violet-300">Contact Form</Link></li>
                    </ul>
                </Section>

                {/* Back link */}
                <div className="pt-4 border-t border-[rgb(30,30,46)] flex gap-4">
                    <Link href="/" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">← Back to Home</Link>
                    <Link href="/terms" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">Terms of Service →</Link>
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
