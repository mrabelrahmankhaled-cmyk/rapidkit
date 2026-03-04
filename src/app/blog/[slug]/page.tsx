import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, getBlogPostBySlug, getRelatedPosts } from "@/lib/blog-registry";
import { Clock, ArrowLeft, ArrowRight, ExternalLink, Tag, BookOpen } from "lucide-react";

// ─── Static Params ────────────────────────────────────────────────

export function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);
    if (!post) return {};

    return {
        title: post.seo.title,
        description: post.seo.description,
        keywords: post.seo.keywords,
        authors: [{ name: "RapidKit" }],
        openGraph: {
            title: post.seo.title,
            description: post.seo.description,
            url: `https://rapidkit.tools/blog/${post.slug}`,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
        },
        alternates: {
            canonical: `https://rapidkit.tools/blog/${post.slug}`,
        },
    };
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const CATEGORY_COLORS: Record<string, string> = {
    YouTube: "text-red-400 bg-red-500/10 border-red-500/20",
    "Image Tools": "text-violet-400 bg-violet-500/10 border-violet-500/20",
    "Developer Tools": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "Text Tools": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Converters: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

// ─── Page ─────────────────────────────────────────────────────────

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);
    if (!post) notFound();

    const related = getRelatedPosts(post, 3);
    const allPosts = BLOG_POSTS;
    const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
    const prevPost = allPosts[currentIndex - 1] ?? null;
    const nextPost = allPosts[currentIndex + 1] ?? null;

    // JSON-LD Structured Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: { "@type": "Organization", name: "RapidKit", url: "https://rapidkit.tools" },
        publisher: {
            "@type": "Organization",
            name: "RapidKit",
            url: "https://rapidkit.tools",
            logo: { "@type": "ImageObject", url: "https://rapidkit.tools/favicon.ico" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `https://rapidkit.tools/blog/${post.slug}` },
        keywords: post.seo.keywords.join(", "),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen">
                {/* ─── Header ─────────────────────────────────── */}
                <header className="border-b border-[rgb(30,30,46)] py-8">
                    <div className="container-wide max-w-4xl">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-[rgb(60,60,90)] mb-6" aria-label="Breadcrumb">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-[rgb(100,100,140)] truncate max-w-xs">{post.title}</span>
                        </nav>

                        {/* Category badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-4 ${CATEGORY_COLORS[post.category] ?? "text-violet-400 bg-violet-500/10 border-violet-500/20"}`}>
                            <BookOpen className="w-3 h-3" /> {post.category}
                        </span>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                            {post.title}
                        </h1>
                        <p className="text-[rgb(100,100,140)] text-lg leading-relaxed mb-6">
                            {post.description}
                        </p>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(60,60,90)]">
                            <span>Published {formatDate(post.publishedAt)}</span>
                            {post.updatedAt !== post.publishedAt && (
                                <span>Updated {formatDate(post.updatedAt)}</span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                            </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 text-xs text-[rgb(60,60,90)] px-2.5 py-1 rounded-full bg-[rgb(17,17,27)] border border-[rgb(30,30,46)]">
                                    <Tag className="w-2.5 h-2.5" /> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>

                {/* ─── Main Content + Sidebar ──────────────────── */}
                <div className="container-wide max-w-4xl py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

                        {/* Article Body */}
                        <article>
                            {/* Try the Tool CTA */}
                            <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 mb-8">
                                <div>
                                    <p className="text-xs text-[rgb(100,100,140)] mb-0.5">Mentioned in this article</p>
                                    <p className="text-sm font-semibold text-white">
                                        Free Online Tool: Try it now →
                                    </p>
                                </div>
                                <Link
                                    href={`/tools/${post.relatedToolCategory}/${post.relatedToolSlug}`}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                                >
                                    Open Tool <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* HTML Content */}
                            <div
                                className="prose-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Bottom CTA */}
                            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-center">
                                <h3 className="text-lg font-bold text-white mb-2">Ready to Try It?</h3>
                                <p className="text-sm text-[rgb(100,100,140)] mb-4">
                                    Use our free online tool — no sign-up, no download, no limits.
                                </p>
                                <Link
                                    href={`/tools/${post.relatedToolCategory}/${post.relatedToolSlug}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open Free Tool
                                </Link>
                            </div>

                            {/* Prev / Next */}
                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {prevPost && (
                                    <Link
                                        href={`/blog/${prevPost.slug}`}
                                        className="group p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] hover:border-violet-500/30 transition-all"
                                    >
                                        <p className="text-xs text-[rgb(60,60,90)] mb-1 flex items-center gap-1">
                                            <ArrowLeft className="w-3 h-3" /> Previous
                                        </p>
                                        <p className="text-sm font-medium text-[rgb(140,140,180)] group-hover:text-white transition-colors line-clamp-2">
                                            {prevPost.title}
                                        </p>
                                    </Link>
                                )}
                                {nextPost && (
                                    <Link
                                        href={`/blog/${nextPost.slug}`}
                                        className="group p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)] hover:border-violet-500/30 transition-all text-right ml-auto w-full"
                                    >
                                        <p className="text-xs text-[rgb(60,60,90)] mb-1 flex items-center justify-end gap-1">
                                            Next <ArrowRight className="w-3 h-3" />
                                        </p>
                                        <p className="text-sm font-medium text-[rgb(140,140,180)] group-hover:text-white transition-colors line-clamp-2">
                                            {nextPost.title}
                                        </p>
                                    </Link>
                                )}
                            </div>
                        </article>

                        {/* ─── Sidebar ────────────────────────── */}
                        <aside className="space-y-6">
                            {/* All Tools link */}
                            <div className="p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                                <h3 className="text-sm font-semibold text-white mb-3">🛠️ Free Tools</h3>
                                <Link
                                    href="/tools"
                                    className="block text-sm text-[rgb(80,80,120)] hover:text-violet-400 transition-colors mb-2"
                                >
                                    Browse All Tools →
                                </Link>
                                <Link
                                    href={`/tools/${post.relatedToolCategory}/${post.relatedToolSlug}`}
                                    className="block text-sm text-violet-400 font-medium hover:text-violet-300 transition-colors"
                                >
                                    Try the Tool in This Guide →
                                </Link>
                            </div>

                            {/* Related Posts */}
                            {related.length > 0 && (
                                <div className="p-4 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                                    <h3 className="text-sm font-semibold text-white mb-3">📖 Related Guides</h3>
                                    <div className="space-y-3">
                                        {related.map((rp) => (
                                            <Link
                                                key={rp.slug}
                                                href={`/blog/${rp.slug}`}
                                                className="block group"
                                            >
                                                <p className="text-xs font-medium text-[rgb(100,100,140)] group-hover:text-violet-400 transition-colors leading-snug line-clamp-2">
                                                    {rp.title}
                                                </p>
                                                <p className="text-xs text-[rgb(50,50,80)] mt-0.5 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" /> {rp.readingTime} min
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Back to blog */}
                            <Link
                                href="/blog"
                                className="flex items-center gap-2 text-sm text-[rgb(60,60,90)] hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> All Blog Posts
                            </Link>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
