import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/data/tools";
import { INDEXABLE_COMPARISONS, HAS_INDEXABLE_COMPARISONS } from "@/data/comparisons";
import { INDEXABLE_ALTERNATIVES, HAS_INDEXABLE_ALTERNATIVES } from "@/data/alternatives";
import { BLOG_POSTS } from "@/lib/blog-registry";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const toolPages = TOOLS.map((tool) => ({
        url: `${SITE_URL}/tools/${tool.categoryId}/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: tool.isFeatured ? 0.9 : 0.8,
    }));

    const categoryPages = CATEGORIES.map((cat) => ({
        url: `${SITE_URL}/tools/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    const comparisonPages = INDEXABLE_COMPARISONS.map((comp) => ({
        url: `${SITE_URL}/compare/${comp.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const alternativePages = INDEXABLE_ALTERNATIVES.map((alt) => ({
        url: `${SITE_URL}/alternatives/${alt.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const blogPages = BLOG_POSTS.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    const guideIndexPages: MetadataRoute.Sitemap = [
        ...(HAS_INDEXABLE_COMPARISONS
            ? [{ url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }]
            : []),
        ...(HAS_INDEXABLE_ALTERNATIVES
            ? [{ url: `${SITE_URL}/alternatives`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }]
            : []),
    ];

    return [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${SITE_URL}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        ...guideIndexPages,
        { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
        { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        { url: `${SITE_URL}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
        ...categoryPages,
        ...toolPages,
        ...comparisonPages,
        ...alternativePages,
        ...blogPages,
    ];
}
