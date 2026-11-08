import Link from "next/link";
import { Zap, Heart } from "lucide-react";
import { CATEGORIES, TOOLS } from "@/lib/tools-registry";

export function Footer() {
    const popularTools = TOOLS.filter((t) => t.isPopular).slice(0, 5);

    return (
        <footer className="border-t border-[rgb(45,45,65)] bg-[rgb(10,10,15)] mt-auto">
            {/* ─── Main Footer ──────────────────────────────── */}
            <div className="container-wide py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <Link href="/" className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                        </div>
                        <span className="font-bold text-base">
                            <span className="gradient-text">Rapid</span>
                            <span className="text-white">Kit</span>
                        </span>
                    </Link>
                    <p className="text-sm text-[rgb(80,80,120)] leading-relaxed mb-4">
                        Free online tools for everyone. Fast, private, and no sign-up required. Built by developers, for everyone.
                    </p>
                </div>

                {/* Categories */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
                    <ul className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <li key={cat.id}>
                                <Link
                                    href={`/tools/${cat.slug}`}
                                    className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/tools" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                All Tools →
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Popular Tools & Guides */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Popular Tools</h3>
                    <ul className="space-y-2 mb-6">
                        {popularTools.map((tool) => (
                            <li key={tool.id}>
                                <Link
                                    href={`/tools/${tool.categoryId}/${tool.slug}`}
                                    className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors"
                                >
                                    {tool.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-sm font-semibold text-white mb-3">Comparisons &amp; Guides</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/compare/hostinger-vs-cloudways" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                Hostinger vs Cloudways
                            </Link>
                        </li>
                        <li>
                            <Link href="/compare/beehiiv-vs-kit" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                beehiiv vs Kit
                            </Link>
                        </li>
                        <li>
                            <Link href="/compare/vidiq-vs-tubebuddy" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                vidIQ vs TubeBuddy
                            </Link>
                        </li>
                        <li>
                            <Link href="/alternatives/tinypng-alternatives" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                TinyPNG Alternatives
                            </Link>
                        </li>
                        <li>
                            <Link href="/alternatives/canva-alternatives" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                Canva Alternatives
                            </Link>
                        </li>
                        <li>
                            <Link href="/alternatives/semrush-alternatives" className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors">
                                Semrush Alternatives
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                    <ul className="space-y-2">
                        {[
                            { href: "/about", label: "About" },
                            { href: "/compare", label: "Software Comparisons" },
                            { href: "/alternatives", label: "Software Alternatives" },
                            { href: "/blog", label: "Blog" },
                            { href: "/privacy", label: "Privacy Policy" },
                            { href: "/terms", label: "Terms of Service" },
                            { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
                            { href: "/contact", label: "Contact" },
                        ].map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ─── Disclosure & Bottom Bar ───────────────────── */}
            <div className="border-t border-[rgb(30,30,46)] py-5">
                <div className="container-wide space-y-3">
                    <p className="text-xs text-[rgb(80,80,120)] leading-relaxed text-center sm:text-left">
                        Disclosure: RapidKit is reader-supported. Some links on our site are affiliate links, meaning we may earn a small commission if you make a purchase through them — at no extra cost to you.{" "}
                        <Link href="/affiliate-disclosure" className="text-[rgb(148,148,186)] hover:text-white underline">
                            Learn more
                        </Link>
                        .
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[rgb(24,24,37)]">
                        <p className="text-xs text-[rgb(80,80,120)]">
                            © {new Date().getFullYear()} RapidKit. All rights reserved.
                        </p>
                        <p className="text-xs text-[rgb(80,80,120)] flex items-center gap-1">
                            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for the web
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
