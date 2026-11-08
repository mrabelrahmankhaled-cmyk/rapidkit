import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CATEGORIES, TOOLS, getCategoryById } from "@/data/tools";
import { canonicalUrl, buildBreadcrumbJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
    return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const cat = getCategoryById(category);
    if (!cat) return { title: "Category Not Found" };
    const count = TOOLS.filter((t) => t.categoryId === cat.id).length;
    const pageUrl = canonicalUrl(`/tools/${cat.slug}`);
    return {
        title: `${cat.name} — ${count} Free Online Tools`,
        description: `Discover ${count} free online ${cat.name.toLowerCase()} on RapidKit. Fast, private, and no sign-up required.`,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: `${cat.name} — ${count} Free Online Tools | RapidKit`,
            description: `Discover ${count} free online ${cat.name.toLowerCase()} on RapidKit. Fast, private, and no sign-up required.`,
            url: pageUrl,
            type: "website",
        },
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category } = await params;
    const cat = getCategoryById(category);
    if (!cat) notFound();

    const tools = TOOLS.filter((t) => t.categoryId === cat.id);
    const otherCategories = CATEGORIES.filter((c) => c.id !== cat.id);

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Tools", path: "/tools" },
        { name: cat.name, path: `/tools/${cat.slug}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <div className="pt-24 pb-16 px-4">
                <div className="container-wide">
                    {/* Header */}
                    <div className="mb-10">
                        <Link href="/tools" className="flex items-center gap-1 text-xs text-[rgb(80,80,120)] hover:text-[rgb(148,148,186)] mb-4 w-fit transition-colors">
                            <ArrowLeft className="w-3 h-3" /> All Tools
                        </Link>
                        <div className="flex items-center gap-4 mb-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)` }}
                            >
                                <span style={{ color: cat.color }}>{cat.symbol}</span>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-white">{cat.name}</h1>
                                <p className="text-[rgb(80,80,120)] text-sm">{tools.length} free tools available</p>
                            </div>
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                        {tools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={`/tools/${cat.slug}/${tool.slug}`}
                                className="glass-card p-5 group"
                            >
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h2 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors flex-1">
                                        {tool.name}
                                    </h2>
                                    {tool.isNew && <span className="pill pill-new">New</span>}
                                    {tool.isPopular && <span className="pill pill-hot">🔥</span>}
                                </div>
                                <p className="text-xs text-[rgb(80,80,120)] leading-relaxed line-clamp-3 mb-3">
                                    {tool.description}
                                </p>
                                <div className="flex items-center text-xs text-violet-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open Tool <ArrowRight className="w-3 h-3 ml-1" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Other Categories */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4">Explore Other Categories</h2>
                        <div className="flex flex-wrap gap-3">
                            {otherCategories.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/tools/${c.slug}`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgb(45,45,65)] bg-[rgb(17,17,27)] hover:border-violet-500/40 hover:text-white text-[rgb(80,80,120)] text-sm transition-all"
                                >
                                    <span style={{ color: c.color }}>{c.symbol}</span>
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
