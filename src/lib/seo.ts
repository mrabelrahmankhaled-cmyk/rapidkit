import type { Tool, ToolFAQ } from "@/data/tools";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://getrapidkit.me").replace(/\/$/, "");
export const SITE_NAME = "RapidKit";
export const SITE_DOMAIN = "getrapidkit.me";

export function canonicalUrl(path: string): string {
    if (!path || path === "/") return SITE_URL;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${SITE_URL}${normalizedPath}`;
}

export interface BreadcrumbItem {
    name: string;
    path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: canonicalUrl(item.path),
        })),
    };
}

export function buildFaqJsonLd(faqs: ToolFAQ[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };
}

export function buildToolJsonLd(tool: Tool, categoryName: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: tool.name,
        description: tool.seo.description,
        url: canonicalUrl(`/tools/${tool.categoryId}/${tool.slug}`),
        applicationCategory: categoryName || "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript. Modern browser recommended.",
        isAccessibleForFree: true,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}
