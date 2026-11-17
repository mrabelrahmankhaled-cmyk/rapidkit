"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { Zap, Search, Menu, X, ChevronDown } from "lucide-react";
import { CATEGORIES, TOOLS, searchTools } from "@/lib/tools-registry";
import { HAS_INDEXABLE_COMPARISONS } from "@/data/comparisons";
import { HAS_INDEXABLE_ALTERNATIVES } from "@/data/alternatives";
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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [mobileOpen]);

    // Close desktop search on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showSearch && searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showSearch]);

    // Keyboard shortcut for Cmd+K / Ctrl+K and Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setShowSearch((prev) => !prev);
            } else if (e.key === "Escape") {
                setShowSearch(false);
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
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
                        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(45,45,65)] p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
                    {HAS_INDEXABLE_COMPARISONS && (
                        <Link href="/compare" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                            Comparisons
                        </Link>
                    )}
                    {HAS_INDEXABLE_ALTERNATIVES && (
                        <Link href="/alternatives" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                            Alternatives
                        </Link>
                    )}
                    <Link href="/blog" className="px-3 py-2 rounded-lg text-sm text-[rgb(148,148,186)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all">
                        Blog
                    </Link>
                </nav>

                {/* ─── Search + CTA ─────────────────────────────── */}
                <div className="flex items-center gap-3">
                    {/* Hire Me CTA */}
                    <Link
                        href="/hire-me"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-xs font-semibold text-white hover:border-violet-500/80 hover:from-violet-500/20 hover:to-cyan-500/20 shadow-sm shadow-violet-500/20 transition-all shrink-0"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Hire Me</span>
                    </Link>

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
                            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[rgb(14,14,22)] border border-[rgb(45,45,65)] p-2.5 shadow-2xl shadow-black/90 z-50">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,68)] mb-2">
                                    <Search className="w-4 h-4 text-violet-400 shrink-0" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search tools..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[rgb(80,80,120)]"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="p-1 text-[rgb(120,120,160)] hover:text-white"
                                            aria-label="Clear search"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                {searchResults.length > 0 ? (
                                    <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                                        {searchResults.map((tool) => (
                                            <Link
                                                key={tool.id}
                                                href={`/tools/${tool.categoryId}/${tool.slug}`}
                                                onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                                                className="flex flex-col p-2.5 rounded-xl hover:bg-[rgb(24,24,38)] border border-transparent hover:border-[rgb(45,45,68)] transition-all group"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm text-white font-semibold group-hover:text-violet-300 transition-colors">{tool.name}</span>
                                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[rgb(30,30,46)] text-[rgb(130,130,170)]">{tool.categoryId}</span>
                                                </div>
                                                <span className="text-xs text-[rgb(120,120,160)] truncate mt-0.5">{tool.description}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 1 ? (
                                    <p className="text-sm text-[rgb(120,120,160)] text-center py-6">No tools found for &quot;{searchQuery}&quot;</p>
                                ) : (
                                    <p className="text-xs text-[rgb(100,100,140)] text-center py-4">Start typing to search {TOOLS.length} tools...</p>
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
                <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-[rgb(10,10,15)] border-t border-[rgb(45,45,65)] p-4 space-y-3 overflow-y-auto overscroll-contain z-50">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] shrink-0">
                        <Search className="w-4 h-4 text-violet-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent text-base sm:text-sm text-white outline-none placeholder:text-[rgb(80,80,120)]"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="p-1 text-[rgb(120,120,160)] hover:text-white"
                                aria-label="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Search Results in Mobile Menu */}
                    {searchQuery.length > 1 && (
                        <div className="space-y-1.5 pb-2">
                            <span className="text-[10px] font-bold text-[rgb(120,120,160)] uppercase tracking-wider px-1 block">
                                Search Results ({searchResults.length})
                            </span>
                            {searchResults.length > 0 ? (
                                searchResults.map((tool) => (
                                    <Link
                                        key={tool.id}
                                        href={`/tools/${tool.categoryId}/${tool.slug}`}
                                        onClick={() => {
                                            setMobileOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex flex-col p-3 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:border-violet-500/50 text-sm text-white transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-white">{tool.name}</span>
                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[rgb(28,28,42)] text-violet-300 border border-violet-500/20">
                                                {tool.categoryId}
                                            </span>
                                        </div>
                                        <span className="text-xs text-[rgb(130,130,170)] truncate mt-1">
                                            {tool.description}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-xs text-[rgb(120,120,160)] text-center py-4 bg-[rgb(18,18,28)] rounded-xl border border-[rgb(38,38,58)]">
                                    No tools found for &quot;{searchQuery}&quot;
                                </p>
                            )}
                        </div>
                    )}

                    <hr className="border-[rgb(45,45,65)]" />
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/tools/${cat.slug}`}
                            onClick={() => {
                                setMobileOpen(false);
                                setSearchQuery("");
                            }}
                            className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]"
                        >
                            {cat.name}
                        </Link>
                    ))}
                    {HAS_INDEXABLE_COMPARISONS && (
                        <Link href="/compare" onClick={() => { setMobileOpen(false); setSearchQuery(""); }} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Comparisons</Link>
                    )}
                    {HAS_INDEXABLE_ALTERNATIVES && (
                        <Link href="/alternatives" onClick={() => { setMobileOpen(false); setSearchQuery(""); }} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Alternatives</Link>
                    )}
                    <Link href="/blog" onClick={() => { setMobileOpen(false); setSearchQuery(""); }} className="block p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] text-sm text-[rgb(148,148,186)]">Blog</Link>
                    <Link
                        href="/hire-me"
                        onClick={() => { setMobileOpen(false); setSearchQuery(""); }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-violet-500/30 text-sm font-semibold text-white hover:border-violet-500/60 transition-all mt-2"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Hire Abdelkhalek
                        </span>
                        <span className="text-xs text-violet-300">Available →</span>
                    </Link>
                </div>
            )}
        </header>
    );
}
