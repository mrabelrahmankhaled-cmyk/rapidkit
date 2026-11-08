import Link from "next/link";
import { Zap, Heart, ShieldCheck } from "lucide-react";
import { CATEGORIES, TOOLS } from "@/lib/tools-registry";
import { INDEXABLE_COMPARISONS, HAS_INDEXABLE_COMPARISONS } from "@/data/comparisons";
import { INDEXABLE_ALTERNATIVES, HAS_INDEXABLE_ALTERNATIVES } from "@/data/alternatives";

export function Footer() {
    const popularTools = TOOLS.filter((t) => t.isPopular).slice(0, 6);

    return (
        <footer className="border-t border-[rgb(45,45,65)]/80 bg-[rgb(10,10,15)] mt-auto pt-16 sm:pt-20">
            {/* ─── Main Footer Grid (5 Columns on Desktop) ─────── */}
            <div className="container-wide pb-12 sm:pb-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
                    {/* Column 1: Brand */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-violet-500/20">
                                    <Zap className="w-4 h-4 text-white" fill="white" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">
                                    <span className="gradient-text">Rapid</span>
                                    <span className="text-white">Kit</span>
                                </span>
                            </Link>
                            <p className="text-sm text-[rgb(120,120,155)] leading-relaxed mb-5">
                                Free, browser-native online utilities for developers, designers, and digital marketers. Fast, private, and no signup needed.
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgb(24,24,37)] border border-[rgb(45,45,65)]/60 text-xs text-[rgb(148,148,186)]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>35 Free Tools • No Sign-up</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Categories */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
                            Categories
                        </h3>
                        <ul className="space-y-2.5">
                            {CATEGORIES.slice(0, 8).map((cat) => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/tools/${cat.slug}`}
                                        className="text-sm text-[rgb(130,130,165)] hover:text-white transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/tools"
                                    className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                                >
                                    All Categories →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Popular Tools */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
                            Popular Tools
                        </h3>
                        <ul className="space-y-2.5">
                            {popularTools.map((tool) => (
                                <li key={tool.id}>
                                    <Link
                                        href={`/tools/${tool.categoryId}/${tool.slug}`}
                                        className="text-sm text-[rgb(130,130,165)] hover:text-white transition-colors"
                                    >
                                        {tool.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/tools"
                                    className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                                >
                                    Explore 35 Tools →
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Comparisons & Guides */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
                            Guides &amp; Comparisons
                        </h3>
                        <ul className="space-y-2.5">
                            {INDEXABLE_COMPARISONS.map((comp) => (
                                <li key={comp.slug}>
                                    <Link
                                        href={`/compare/${comp.slug}`}
                                        className="text-sm text-[rgb(130,130,165)] hover:text-white transition-colors"
                                    >
                                        {comp.productA.name} vs {comp.productB.name}
                                    </Link>
                                </li>
                            ))}
                            {INDEXABLE_ALTERNATIVES.map((alt) => (
                                <li key={alt.slug}>
                                    <Link
                                        href={`/alternatives/${alt.slug}`}
                                        className="text-sm text-[rgb(130,130,165)] hover:text-white transition-colors"
                                    >
                                        {alt.targetProduct} Alternatives
                                    </Link>
                                </li>
                            ))}
                            {HAS_INDEXABLE_COMPARISONS && (
                                <li>
                                    <Link
                                        href="/compare"
                                        className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                                    >
                                        All Comparisons →
                                    </Link>
                                </li>
                            )}
                            {HAS_INDEXABLE_ALTERNATIVES && (
                                <li>
                                    <Link
                                        href="/alternatives"
                                        className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                                    >
                                        All Alternatives →
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Column 5: Company & Legal */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { href: "/about", label: "About" },
                                { href: "/blog", label: "Blog" },
                                { href: "/contact", label: "Contact" },
                                { href: "/privacy", label: "Privacy Policy" },
                                { href: "/terms", label: "Terms of Service" },
                                { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-[rgb(130,130,165)] hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ─── Disclosure & Bottom Bar ──────────────────────── */}
            <div className="border-t border-[rgb(30,30,46)] py-6 bg-[rgb(7,7,11)]">
                <div className="container-wide space-y-4">
                    <p className="text-xs text-[rgb(110,110,145)] leading-relaxed text-center sm:text-left">
                        Disclosure: RapidKit is reader-supported. Some links on our site are affiliate links, meaning we may earn a small commission if you make a purchase through them — at no extra cost to you.{" "}
                        <Link href="/affiliate-disclosure" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
                            Read our full affiliate disclosure
                        </Link>
                        .
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[rgb(24,24,37)]">
                        <p className="text-xs text-[rgb(110,110,145)]">
                            © {new Date().getFullYear()} RapidKit. All rights reserved.
                        </p>
                        <p className="text-xs text-[rgb(110,110,145)] flex items-center gap-1.5">
                            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for the web community
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
