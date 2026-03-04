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

                {/* Popular Tools */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Popular Tools</h3>
                    <ul className="space-y-2">
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
                </div>

                {/* Company */}
                <div>
                    <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
                    <ul className="space-y-2">
                        {[
                            { href: "/about", label: "About" },
                            { href: "/blog", label: "Blog" },
                            { href: "/privacy", label: "Privacy Policy" },
                            { href: "/terms", label: "Terms of Service" },
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

            {/* ─── Bottom Bar ───────────────────────────────── */}
            <div className="border-t border-[rgb(30,30,46)] py-4">
                <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-[rgb(80,80,120)]">
                        © {new Date().getFullYear()} RapidKit. All rights reserved.
                    </p>
                    <p className="text-xs text-[rgb(80,80,120)] flex items-center gap-1">
                        Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for the web
                    </p>
                </div>
            </div>
        </footer>
    );
}
