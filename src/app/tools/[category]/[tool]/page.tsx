import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ArrowRight } from "lucide-react";
import {
    TOOLS,
    CATEGORIES,
    getCategoryById,
    getToolBySlug,
    getToolsByCategory,
} from "@/lib/tools-registry";
import { ToolPageClient } from "./ToolPageClient";
import { ShareCTA } from "@/components/ui/ShareCTA";
import { NewsletterInline } from "@/components/ui/NewsletterInline";

type Props = {
    params: Promise<{ category: string; tool: string }>;
};

// ─── Cross-category Related Tools Map ─────────────────────────────
const RELATED_MAP: Record<string, string[]> = {
    "image-compressor": ["webp-converter", "youtube-thumbnail-downloader"],
    "webp-converter": ["image-compressor", "css-gradient-generator"],
    "youtube-thumbnail-downloader": ["youtube-tag-extractor", "image-compressor"],
    "youtube-tag-extractor": ["youtube-thumbnail-downloader", "word-counter"],
    "json-formatter": ["css-gradient-generator", "text-case-converter"],
    "css-gradient-generator": ["json-formatter", "color-converter"],
    "word-counter": ["text-case-converter", "json-formatter"],
    "text-case-converter": ["word-counter", "json-formatter"],
    "unit-converter": ["color-converter", "text-case-converter"],
    "color-converter": ["css-gradient-generator", "unit-converter"],
};

// ─── HowToUse steps per tool ──────────────────────────────────────
const HOW_TO: Record<string, string[]> = {
    "youtube-thumbnail-downloader": [
        "Copy the URL of any public YouTube video from your browser address bar.",
        "Paste the video URL into the input field above and press Enter or click 'Get Thumbnails'.",
        "Select your preferred quality — Max Resolution (1280×720), HD, Standard, or Medium.",
        "Click 'Download' to save the thumbnail image directly to your device.",
    ],
    "youtube-tag-extractor": [
        "Paste any public YouTube video URL into the input field.",
        "Click 'Extract Tags' to retrieve the video's hidden keywords.",
        "Browse the full tag list and copy any tags you need.",
        "Use these tags to improve your own video SEO strategy.",
    ],
    "image-compressor": [
        "Drag & drop your images into the upload zone, or click to browse your files.",
        "Adjust the quality slider — lower value = smaller file, higher value = better quality.",
        "Your images are compressed instantly inside your browser — nothing is uploaded!",
        "Click the download button next to any image or use 'Download All' for batch download.",
    ],
    "webp-converter": [
        "Drag & drop your JPG or PNG images into the upload zone, or click to browse.",
        "Adjust the quality slider to balance file size and image quality.",
        "Files convert to WebP instantly in your browser — 100% private, no server upload.",
        "Click download next to each file or 'Download All' to grab all converted images.",
    ],
    "json-formatter": [
        "Paste your raw JSON data into the left input panel.",
        "Select a mode: 'Format' to beautify, 'Minify' to compress, or 'Validate' to check for errors.",
        "The transformed output appears instantly in the right panel with syntax highlighting.",
        "Click 'Copy' to copy the output to your clipboard with one click.",
    ],
    "css-gradient-generator": [
        "Choose a gradient type: Linear, Radial, or Conic.",
        "Adjust the angle slider and add or remove color stops as needed.",
        "Watch the live preview update instantly as you tweak the values.",
        "Click 'Copy CSS' to copy the ready-to-use CSS code to your clipboard.",
    ],
    "word-counter": [
        "Paste or type your text into the text area below the stats panel.",
        "Statistics update in real-time — words, characters, sentences, paragraphs.",
        "Check the estimated Reading Time and Speaking Time for your content.",
        "Scroll down to see the most frequently used words in your text.",
    ],
    "text-case-converter": [
        "Select your desired case format from the style grid (UPPERCASE, camelCase, etc.).",
        "Type or paste your text into the left input panel.",
        "The converted result appears instantly in the right output panel.",
        "Click the output panel or the Copy button to copy the result.",
    ],
    "unit-converter": [
        "Select the unit category you need (Length, Weight, Temperature, etc.).",
        "Enter a value in any unit field — all other units update instantly.",
        "Copy any output value with a single click.",
    ],
    "color-converter": [
        "Enter a color value in any format: HEX, RGB, or HSL.",
        "All other formats update automatically in real-time.",
        "Use the color picker for visual selection.",
        "Click 'Copy' next to any format to copy the value to your clipboard.",
    ],
};

export async function generateStaticParams() {
    return TOOLS.map((tool) => ({
        category: tool.categoryId,
        tool: tool.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tool: toolSlug } = await params;
    const tool = getToolBySlug(toolSlug);
    if (!tool) return { title: "Tool Not Found" };
    return {
        title: tool.seo.title,
        description: tool.seo.description,
        keywords: tool.seo.keywords,
        openGraph: {
            title: tool.seo.title,
            description: tool.seo.description,
        },
    };
}

export default async function ToolPage({ params }: Props) {
    const { category: categorySlug, tool: toolSlug } = await params;

    const tool = getToolBySlug(toolSlug);
    const category = getCategoryById(categorySlug);

    if (!tool || !category) notFound();

    // ─── Smart Related Tools (cross-category) ─────────
    const relatedSlugs = RELATED_MAP[tool.slug] ?? [];
    const crossRelated = relatedSlugs
        .map((slug) => TOOLS.find((t) => t.slug === slug))
        .filter(Boolean) as typeof TOOLS;

    // Fallback: same category tools
    const sameCatRelated = getToolsByCategory(categorySlug)
        .filter((t) => t.id !== tool.id)
        .slice(0, 3);

    const relatedTools = crossRelated.length > 0 ? crossRelated : sameCatRelated;

    // ─── Structured Data (JSON-LD) ─────────────────────
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.seo.description,
        url: `https://rapidkit.tools/tools/${tool.categoryId}/${tool.slug}`,
        applicationCategory: "WebApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "128",
            bestRating: "5",
        },
    };

    const steps = HOW_TO[tool.slug] ?? [
        "Fill in the required input fields above.",
        "The tool processes your data instantly in your browser.",
        "Copy or download your result.",
    ];

    return (
        <>
            {/* ─── JSON-LD Structured Data ──────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="pt-20 pb-16 px-4">
                <div className="container-wide max-w-5xl">

                    {/* ─── Breadcrumb ─────────────────────────── */}
                    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link href={`/tools/${category.slug}`} className="hover:text-white transition-colors">{category.name}</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-[rgb(148,148,186)]">{tool.name}</span>
                    </nav>

                    {/* ─── Tool Header ────────────────────────── */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <Link
                                href={`/tools/${category.slug}`}
                                className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] transition-colors bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-lg px-3 py-1.5"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back to {category.name}
                            </Link>
                            {tool.isNew && <span className="pill pill-new">✨ New</span>}
                            {tool.isPopular && <span className="pill pill-hot">🔥 Popular</span>}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{tool.name}</h1>
                        <p className="text-[rgb(148,148,186)] max-w-2xl leading-relaxed">{tool.longDescription}</p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {tool.tags.map((tag) => (
                                <span key={tag} className="text-xs px-2 py-1 rounded-md bg-[rgb(24,24,37)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)]">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ─── Tool Card ──────────────────────────── */}
                    <div className="glass-card p-6 sm:p-8 mb-6">
                        <ToolPageClient toolSlug={tool.slug} categoryId={tool.categoryId} />
                    </div>

                    {/* ─── Share / Bookmark CTA ───────────────── */}
                    <ShareCTA toolName={tool.name} toolSlug={tool.slug} categoryId={tool.categoryId} />

                    {/* ─── AdSense Placeholder ────────────────── */}
                    <div className="my-6 h-24 rounded-2xl border-2 border-dashed border-[rgb(30,30,46)] flex items-center justify-center">
                        <span className="text-xs text-[rgb(45,45,65)]">Advertisement</span>
                    </div>

                    {/* ─── How to Use ─────────────────────────── */}
                    <div className="glass-card p-6 mb-6">
                        <h2 className="text-lg font-bold text-white mb-4">
                            How to Use {tool.name}
                        </h2>
                        <ol className="space-y-3">
                            {steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-[rgb(148,148,186)]">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* ─── Newsletter CTA ─────────────────────────── */}
                    <NewsletterInline />

                    {/* ─── Smart Related Tools ─────────────────── */}
                    {relatedTools.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white">You Might Also Need</h2>
                                <Link href="/tools" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                                    All tools <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {relatedTools.map((related) => {
                                    const relatedCat = getCategoryById(related.categoryId);
                                    return (
                                        <Link
                                            key={related.id}
                                            href={`/tools/${related.categoryId}/${related.slug}`}
                                            className="glass-card p-4 group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                                    style={{ background: `linear-gradient(135deg, ${relatedCat?.color}20, ${relatedCat?.color}40)` }}
                                                >
                                                    <span style={{ color: relatedCat?.color }}>
                                                        {related.categoryId === "youtube" && "▶"}
                                                        {related.categoryId === "image" && "🖼"}
                                                        {related.categoryId === "developer" && "⚡"}
                                                        {related.categoryId === "text" && "Aa"}
                                                        {related.categoryId === "converter" && "⇄"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1 truncate">
                                                        {related.name}
                                                    </h3>
                                                    <p className="text-xs text-[rgb(80,80,120)] line-clamp-2 leading-relaxed">
                                                        {related.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Try it <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
