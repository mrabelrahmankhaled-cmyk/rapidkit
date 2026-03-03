import type { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";

const BASE_URL = "https://rapidkit.tools";

export default function sitemap(): MetadataRoute.Sitemap {
    const toolPages = TOOLS.map((tool) => ({
        url: `${BASE_URL}/tools/${tool.categoryId}/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: tool.isFeatured ? 0.9 : 0.8,
    }));

    const categoryPages = CATEGORIES.map((cat) => ({
        url: `${BASE_URL}/tools/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
        ...categoryPages,
        ...toolPages,
    ];
}
