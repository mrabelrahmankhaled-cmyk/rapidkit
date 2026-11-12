import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-registry";
import { SITE_NAME, canonicalUrl } from "@/lib/seo";
import { Clock, ArrowRight, BookOpen, Tag } from "lucide-react";

export const metadata: Metadata = {
    title: "Blog — How-to Guides & Tool Tutorials",
    description:
        "Free how-to guides, tutorials, and tips for YouTube tools, image optimization, developer tools, text tools, and unit converters. Learn how to work smarter online.",
    keywords: ["how-to guides", "tool tutorials", "image optimization guide", "youtube tools guide", "developer tools tutorial"],
    alternates: {
        canonical: canonicalUrl("/blog"),
    },
    openGraph: {
        title: `${SITE_NAME} Blog — Free How-to Guides & Tutorials`,
        description: "Practical how-to guides for every tool in RapidKit's toolkit.",
        url: canonicalUrl("/blog"),
        siteName: SITE_NAME,
        type: "website",
    },
};

const CATEGORY_COLORS: Record<string, string> = {
    YouTube: "from-red-500/20 to-rose-500/10 text-red-400 border-red-500/20",
    "Image Tools": "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/20",
    "Developer Tools": "from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/20",
    "Text Tools": "from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/20",
    Converters: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20",
};

const CATEGORY_ICONS: Record<string, string> = {
    YouTube: "🎬",
    "Image Tools": "🖼️",
    "Developer Tools": "⌨️",
    "Text Tools": "📝",
    Converters: "🔄",
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function BlogPage() {
    const sortedPosts = [...BLOG_POSTS].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const featured = sortedPosts[0];
    const rest = sortedPosts.slice(1);

    return (
        <div className="min-h-screen">
            {/* ─── Hero ──────────────────────────────────────── */}
            <section className="border-b border-[rgb(30,30,46)] py-14">
                <div className="container-wide text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Free How-to Guides</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        <span className="gradient-text">Learn</span>{" "}
                        <span className="text-white">How to Work Smarter</span>
                    </h1>
                    <p className="text-[rgb(120,120,160)] text-lg max-w-2xl mx-auto">
                        Practical tutorials and guides for every tool in RapidKit. From image optimization to developer
                        workflows — written for real people, not robots.
                    </p>
                </div>
            </section>

            <div className="container-wide py-12 space-y-12">
                {/* ─── Categories Filter Row ─────────────────── */}
                <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-violet-600 text-white">
                        All ({BLOG_POSTS.length})
                    </span>
                    {BLOG_CATEGORIES.map((cat) => (
                        <span
                            key={cat}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white hover:border-[rgb(80,80,120)] transition-all cursor-default"
                        >
                            {CATEGORY_ICONS[cat]} {cat}
                        </span>
                    ))}
                </div>

                {/* ─── Featured Post ─────────────────────────── */}
                <Link
                    href={`/blog/${featured.slug}`}
                    className="group block p-7 rounded-2xl bg-gradient-to-br from-[rgb(17,17,27)] to-[rgb(10,10,15)] border border-[rgb(45,45,65)] hover:border-violet-500/40 transition-all duration-300"
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${CATEGORY_COLORS[featured.category] ?? "text-violet-400"}`}>
                            {CATEGORY_ICONS[featured.category]} {featured.category}
                        </span>
                        <span className="text-xs text-[rgb(60,60,90)] uppercase font-semibold tracking-wider">Featured</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors leading-snug">
                        {featured.title}
                    </h2>
                    <p className="text-[rgb(100,100,140)] text-base leading-relaxed mb-5 max-w-3xl">
                        {featured.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-[rgb(60,60,90)]">
                            <span>{formatDate(featured.publishedAt)}</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {featured.readingTime} min read
                            </span>
                        </div>
                        <span className="text-violet-400 text-sm font-medium flex items-center gap-1.5 group-hover:gap-3 transition-all">
                            Read guide <ArrowRight className="w-4 h-4" />
                        </span>
                    </div>
                </Link>

                {/* ─── Posts Grid ────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] hover:border-violet-500/30 hover:bg-[rgb(14,14,22)] transition-all duration-300"
                        >
                            {/* Category badge */}
                            <span className={`self-start px-2.5 py-1 rounded-full text-xs font-medium border bg-gradient-to-r mb-4 ${CATEGORY_COLORS[post.category] ?? "text-violet-400 border-violet-500/20"}`}>
                                {CATEGORY_ICONS[post.category]} {post.category}
                            </span>

                            <h3 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-violet-300 transition-colors flex-1">
                                {post.title}
                            </h3>
                            <p className="text-sm text-[rgb(80,80,120)] leading-relaxed mb-4 line-clamp-2">
                                {post.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {post.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 text-xs text-[rgb(60,60,90)] px-2 py-0.5 rounded-full bg-[rgb(17,17,27)] border border-[rgb(30,30,46)]">
                                        <Tag className="w-2.5 h-2.5" /> {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-[rgb(60,60,90)] mt-auto pt-3 border-t border-[rgb(20,20,36)]">
                                <span>{formatDate(post.publishedAt)}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {post.readingTime} min
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ─── Newsletter CTA ────────────────────────── */}
                <div className="text-center py-10 px-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
                    <h2 className="text-2xl font-bold text-white mb-2">Get New Guides — Free</h2>
                    <p className="text-[rgb(100,100,140)] mb-6 max-w-md mx-auto">
                        We publish practical tool guides and productivity tips every week. No spam, ever.
                    </p>
                    <form className="flex gap-2 max-w-sm mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(45,45,65)] text-sm focus:outline-none focus:border-violet-500/50"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
