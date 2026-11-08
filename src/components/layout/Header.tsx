"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { Zap, Search, Menu, X, ChevronDown } from "lucide-react";
import { CATEGORIES, TOOLS, searchTools } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const searchResults = useMemo(() => {
        if (searchQuery.length > 1) {
            return searchTools(searchQuery).slice(0, 6);
        }
        return [];
    }, [searchQuery]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-[rgba(10,10,15,0.9)] backdrop-blur-xl border-b border-[rgb(45,45,65)]"
                    : "bg-transparent"
            )}
        >
            <div className="container-wide flex items-center justify-between h-16 gap-4">
                {/* ─── Logo ─────────────────────────────────────── */}
                <Link href="/" className="flex items-center gap-2 shrink-0 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">
                        <span className="gradient-text">Rapid</span>
                        <span className="text-white">Kit</span>
                    </span>
                </Link>

                {/* ─── Nav ──────────────────────────────────────── */}
                <nav className="hidden md:flex items-center gap-1">
                    <div className="group relative">
                        <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                            Tools <ChevronDown className="w-3 h-3" />
                        </button>
                        {/* Dropdown */}
                        <div className="absolute top-full left-0 mt-2 w-64 glass-card p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/tools/${cat.slug}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors group/item"
                                >
                                    <div
                                        className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs", cat.gradient)}
                                        style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}60)` }}
                                    >
                                        <span style={{ color: cat.color }}>{cat.symbol}</span>
                                    </div>
                                    <span className="text-sm text-[rgb(148,148,186)] group-hover/item:text-white transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link href="/tools" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                        All Tools
                    </Link>
                    <Link href="/compare" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                        Comparisons
                    </Link>
                    <Link href="/alternatives" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                        Alternatives
                    </Link>
                    <Link href="/blog" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                        Blog
                    </Link>
                </nav>

                {/* ─── Search + CTA ─────────────────────────────── */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div ref={searchRef} className="relative hidden md:block">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-sm text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] hover:border-[rgba(139,92,246,0.4)] transition-all w-44"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search tools...</span>
                            <span className="ml-auto text-xs bg-[rgb(24,24,37)] px-1.5 py-0.5 rounded font-mono">⌘K</span>
                        </button>

                        {showSearch && (
                            <div className="absolute top-full right-0 mt-2 w-80 glass-card p-2 shadow-2xl">
                                <div className="flex items-center gap-2 p-2 border-b border-[rgb(45,45,65)] mb-2">
                                    <Search className="w-4 h-4 text-[rgb(80,80,120)]" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search tools..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[rgb(80,80,120)]"
                                    />
                                </div>
                                {searchResults.length > 0 ? (
                                    <div className="space-y-1">
                                        {searchResults.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={`/tools/${tool.categoryId}/${tool.slug}`}
                                                onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                                                className="flex flex-col p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                                            >
                                                <span className="text-sm text-white font-medium">{tool.name}</span>
                                                <span className="text-xs text-[rgb(80,80,120)] truncate">{tool.description}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 1 ? (
                                    <p className="text-sm text-[rgb(80,80,120)] text-center py-4">No tools found for &quot;{searchQuery}&quot;</p>
                                ) : (
                                    <p className="text-xs text-[rgb(80,80,120)] text-center py-3">Start typing to search {TOOLS.length} tools</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-[rgb(148,148,186)] transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ─── Mobile Menu ──────────────────────────────────── */}
            {mobileOpen && (
                <div className="md:hidden bg-[rgb(10,10,15)] border-t border-[rgb(45,45,65)] p-4 space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                        <Search className="w-4 h-4 text-[rgb(80,80,120)]" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[rgb(80,80,120)]"
                        />
                    </div>
                    {searchResults.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/tools/${tool.categoryId}/${tool.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]"
                        >
                            {tool.name}
                        </Link>
                    ))}
                    <hr className="border-[rgb(45,45,65)]" />
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/tools/${cat.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]"
                        >
                            {cat.name}
                        </Link>
                    ))}
                    <Link href="/compare" onClick={() => setMobileOpen(false)} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Comparisons</Link>
                    <Link href="/alternatives" onClick={() => setMobileOpen(false)} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Alternatives</Link>
                    <Link href="/blog" onClick={() => setMobileOpen(false)} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Blog</Link>
                </div>
            )}
        </header>
    );
}
