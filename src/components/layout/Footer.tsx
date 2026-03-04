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
                    <div className="flex gap-2">
                        <a
                            href="https://github.com/Abdelkhalek2/rapidkit"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="w-8 h-8 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white hover:border-[rgba(139,92,246,0.5)] hover:bg-[rgba(139,92,246,0.05)] transition-all flex items-center justify-center"
                        >
                            {/* GitHub SVG */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                        </a>
                        <a
                            href="#"
                            aria-label="Twitter / X"
                            className="w-8 h-8 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white hover:border-[rgba(6,182,212,0.5)] hover:bg-[rgba(6,182,212,0.05)] transition-all flex items-center justify-center"
                        >
                            {/* X (Twitter) SVG */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>

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
