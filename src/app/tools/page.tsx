import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, CATEGORIES, getFeaturedTools } from "@/lib/tools-registry";
import { Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "All Free Online Tools — RapidKit",
    description: `Browse all ${TOOLS.length}+ free online tools at RapidKit. YouTube tools, image editors, developer utilities, text converters and more.`,
};

export default function AllToolsPage() {
    return (
        <div className="pt-24 pb-16 px-4">
            <div className="container-wide">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-4">
                        <Zap className="w-3 h-3" fill="currentColor" />
                        {TOOLS.length} Tools Available
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        All <span className="gradient-text">Tools</span>
                    </h1>
                    <p className="text-[rgb(80,80,120)] max-w-lg mx-auto">
                        Everything you need, organized by category. All tools are free, fast, and private.
                    </p>
                </div>

                {/* Categories + Tools */}
                <div className="space-y-14">
                    {CATEGORIES.map((cat) => {
                        const catTools = TOOLS.filter((t) => t.categoryId === cat.id);
                        if (!catTools.length) return null;
                        return (
                            <section key={cat.id}>
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}
                                        >
                                            <span style={{ color: cat.color }}>
                                                {cat.id === "youtube" && "▶"}
                                                {cat.id === "image" && "🖼"}
                                                {cat.id === "developer" && "⚡"}
                                                {cat.id === "text" && "Aa"}
                                                {cat.id === "converter" && "⇄"}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{cat.name}</h2>
                                            <p className="text-xs text-[rgb(80,80,120)]">{catTools.length} tools</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/tools/${cat.slug}`}
                                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                                    >
                                        View all <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {/* Tools Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {catTools.map((tool) => (
                                        <Link
                                            key={tool.id}
                                            href={`/tools/${cat.slug}/${tool.slug}`}
                                            className="glass-card p-4 group"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors flex-1">
                                                    {tool.name}
                                                </h3>
                                                <div className="flex gap-1">
                                                    {tool.isNew && <span className="pill pill-new">New</span>}
                                                    {tool.isPopular && <span className="pill pill-hot">🔥</span>}
                                                </div>
                                            </div>
                                            <p className="text-xs text-[rgb(80,80,120)] leading-relaxed line-clamp-2">
                                                {tool.description}
                                            </p>
                                            <div className="mt-3 text-xs text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Open tool <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
