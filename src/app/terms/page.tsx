import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl, SITE_DOMAIN } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Read RapidKit's Terms of Service. Free tools, fair terms. No account required, no hidden fees, no data selling.",
    robots: { index: true, follow: true },
    alternates: { canonical: canonicalUrl("/terms") },
    openGraph: {
        title: "Terms of Service | RapidKit",
        description: "Read RapidKit's Terms of Service. Free tools, fair terms.",
        url: canonicalUrl("/terms"),
        type: "website",
    },
};

const LAST_UPDATED = "March 1, 2026";

export default function TermsPage() {
    return (
        <div className="min-h-screen">
            <header className="border-b border-[rgb(30,30,46)] py-12">
                <div className="container-narrow text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-5">
                        📄 Plain Language Terms
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
                    <p className="text-[rgb(80,80,120)]">Last updated: {LAST_UPDATED}</p>
                </div>
            </header>

            <div className="container-narrow py-12 space-y-10">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <h2 className="text-lg font-bold text-white mb-2">The Short Version</h2>
                    <ul className="space-y-1.5 text-sm text-[rgb(140,140,180)]">
                        <li>✅ RapidKit is <strong className="text-white">free to use</strong> — no payment, no subscription.</li>
                        <li>✅ Use our tools for personal and commercial projects.</li>
                        <li>⚠️ Don&apos;t abuse the service or try to harm other users.</li>
                        <li>⚠️ We provide tools &quot;as-is&quot; — we&apos;re not liable for how you use them.</li>
                    </ul>
                </div>

                <Section title="1. Acceptance of Terms">
                    <p>By accessing or using RapidKit (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, do not use our service.</p>
                </Section>

                <Section title="2. Description of Service">
                    <p>RapidKit provides a collection of free online tools including but not limited to: YouTube tools, image tools, developer utilities, text tools, and unit/color converters.</p>
                    <p>All tools are provided free of charge. No registration or account is required to use the tools.</p>
                </Section>

                <Section title="3. Acceptable Use">
                    <p>You agree not to use RapidKit to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Violate any applicable local, national, or international laws.</li>
                        <li>Infringe on intellectual property rights of others.</li>
                        <li>Attempt to gain unauthorized access to our systems.</li>
                        <li>Transmit any malicious code, viruses, or harmful software.</li>
                        <li>Scrape or automate excessive requests that overload our servers.</li>
                        <li>Use our tools to process content that is illegal or harmful.</li>
                    </ul>
                </Section>

                <Section title="4. Intellectual Property">
                    <h3 className="text-base font-semibold text-white mb-2">Our Content</h3>
                    <p>The RapidKit website, its design, code, and content (excluding user-processed files) are owned by RapidKit and protected by copyright laws.</p>

                    <h3 className="text-base font-semibold text-white mb-2 mt-4">Your Content</h3>
                    <p>Files you process with our tools remain your property. We do not claim any ownership over your images, text, or other content processed through our tools.</p>
                    <p>Since all tools run client-side in your browser, your files are never transmitted to or stored on our servers.</p>
                </Section>

                <Section title="5. Third-Party Services & Affiliate Links">
                    <p>RapidKit uses third-party services (Vercel for hosting, Google Analytics for traffic metrics) and includes affiliate referral links to recommended third-party products. These services and vendors have their own terms and privacy policies which you should review.</p>
                    <p>Our YouTube Tag Extractor tool fetches publicly available data from YouTube. Use of this tool must comply with <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">YouTube&apos;s Terms of Service</a>.</p>
                </Section>

                <Section title="6. Disclaimer of Warranties">
                    <p>RapidKit is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied, including but not limited to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[rgb(120,120,160)]">
                        <li>Warranties of merchantability or fitness for a particular purpose.</li>
                        <li>Warranties that the service will be uninterrupted or error-free.</li>
                        <li>Warranties regarding the accuracy of tool outputs.</li>
                    </ul>
                </Section>

                <Section title="7. Limitation of Liability">
                    <p>To the fullest extent permitted by law, RapidKit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
                    <p>This includes but is not limited to data loss, loss of profits, or any harm resulting from relying on tool outputs for critical decisions.</p>
                </Section>

                <Section title="8. Advertising & Affiliate Partnerships">
                    <p>RapidKit may display advertisements or affiliate links to support the free service. Please refer to our <Link href="/privacy" className="text-violet-400 hover:text-violet-300">Privacy Policy</Link> and <Link href="/affiliate-disclosure" className="text-violet-400 hover:text-violet-300">Affiliate Disclosure</Link> for full details.</p>
                </Section>

                <Section title="9. Changes to Terms">
                    <p>We reserve the right to modify these terms at any time. We will update the &quot;Last updated&quot; date when changes are made. Continued use of the service after changes constitutes acceptance of the new terms.</p>
                </Section>

                <Section title="10. Governing Law">
                    <p>These Terms shall be governed and construed in accordance with applicable laws, without regard to conflict of law provisions.</p>
                </Section>

                <Section title="11. Contact">
                    <p>For questions about these Terms of Service, contact us at <a href={`mailto:legal@${SITE_DOMAIN}`} className="text-violet-400 hover:text-violet-300">legal@{SITE_DOMAIN}</a></p>
                </Section>

                <div className="pt-4 border-t border-[rgb(30,30,46)] flex gap-4">
                    <Link href="/privacy" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">← Privacy Policy</Link>
                    <Link href="/" className="text-sm text-[rgb(60,60,90)] hover:text-white transition-colors">Back to Home →</Link>
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
