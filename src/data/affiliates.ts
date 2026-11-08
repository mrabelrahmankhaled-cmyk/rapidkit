export type AffiliatePartner = {
    id: string;
    name: string;
    /**
     * Resolved affiliate URL. Defaults to empty string ("") as a placeholder until
     * configured via environment variable or directly in this file.
     * `<AffiliateCTA>` automatically hides any partner whose `url` is empty/placeholder.
     */
    url: string;
    envKey: string;
    category: string;
    badge?: string;
    ctaText: string;
    shortPitch: string;
    pros: string[];
    cons: string[];
    disclosureRequired: boolean;
};

export const PLACEHOLDER_URL = "";

export const AFFILIATES: Record<string, AffiliatePartner> = {
    vidiq: {
        id: "vidiq",
        name: "vidIQ",
        url: process.env.NEXT_PUBLIC_AFFILIATE_VIDIQ_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_VIDIQ_URL",
        category: "youtube",
        badge: "YouTube SEO Suite",
        ctaText: "Try vidIQ",
        shortPitch:
            "Need deeper YouTube keyword data, search volume scores, and competitor channel tracking? vidIQ integrates directly into YouTube Studio.",
        pros: [
            "Real-time keyword search volume & competition scores",
            "Browser extension overlays stats directly on YouTube",
            "Daily video ideas and channel audit tools",
        ],
        cons: [
            "Advanced historical data requires a paid tier",
            "Primarily focused on YouTube rather than multi-platform video",
        ],
        disclosureRequired: true,
    },
    tubebuddy: {
        id: "tubebuddy",
        name: "TubeBuddy",
        url: process.env.NEXT_PUBLIC_AFFILIATE_TUBEBUDDY_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_TUBEBUDDY_URL",
        category: "youtube",
        badge: "Creator Toolkit",
        ctaText: "Explore TubeBuddy",
        shortPitch:
            "Run A/B thumbnail and title split tests, bulk-update cards and descriptions across videos, and research keywords inside YouTube.",
        pros: [
            "Native A/B testing for video thumbnails and titles",
            "Bulk processing tools for cards, end screens, and descriptions",
            "Keyword Explorer and SEO Studio for video metadata",
        ],
        cons: [
            "Full A/B testing and bulk tools require a paid license",
            "Browser extension UI can feel dense on smaller screens",
        ],
        disclosureRequired: true,
    },
    cloudinary: {
        id: "cloudinary",
        name: "Cloudinary",
        url: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDINARY_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_CLOUDINARY_URL",
        category: "image",
        badge: "Image & Video CDN",
        ctaText: "Try Cloudinary",
        shortPitch:
            "Automate image compression, WebP/AVIF format selection, and responsive resizing at scale via URL parameters and SDKs.",
        pros: [
            "Automatic format selection (f_auto) and quality compression (q_auto)",
            "On-the-fly cropping and responsive resizing via URL parameters",
            "Image API, Video API, and SDKs with global CDN delivery",
        ],
        cons: [
            "Requires integration into your application or CMS",
            "Usage-based pricing scales with transformations and bandwidth",
        ],
        disclosureRequired: true,
    },
    shortpixel: {
        id: "shortpixel",
        name: "ShortPixel",
        url: process.env.NEXT_PUBLIC_AFFILIATE_SHORTPIXEL_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_SHORTPIXEL_URL",
        category: "image",
        badge: "Bulk Image Optimizer",
        ctaText: "Visit ShortPixel",
        shortPitch:
            "Compressing thousands of images on WordPress? ShortPixel automates Lossy, Glossy, and Lossless compression plus WebP and AVIF conversion.",
        pros: [
            "Supports Lossy, Glossy (near-lossless for photographers), and Lossless modes",
            "WordPress plugin with WP-CLI support and multi-site API key support",
            "One-time credit packages available alongside Unlimited monthly plans",
        ],
        cons: [
            "Server-side cloud processing rather than local browser execution",
            "Primarily focused on WordPress media library workflows",
        ],
        disclosureRequired: true,
    },
    onepassword: {
        id: "onepassword",
        name: "1Password",
        url: process.env.NEXT_PUBLIC_AFFILIATE_1PASSWORD_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_1PASSWORD_URL",
        category: "developer",
        badge: "Password & Secrets Manager",
        ctaText: "Get 1Password",
        shortPitch:
            "Generating strong passwords is step one. Store passwords, SSH keys, .env secrets, and passkeys securely across all devices with 1Password.",
        pros: [
            "End-to-end encryption with a dual-key Secret Key architecture",
            "Developer CLI (op) for injecting secrets into local .env workflows",
            "Cross-platform apps for macOS, Windows, Linux, iOS, and Android",
        ],
        cons: [
            "No permanent free tier (trial only)",
            "Requires installing desktop/browser clients for full SSH agent support",
        ],
        disclosureRequired: true,
    },
    nordvpn: {
        id: "nordvpn",
        name: "NordVPN",
        url: process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_NORDVPN_URL",
        category: "developer",
        badge: "Network Privacy",
        ctaText: "Check NordVPN",
        shortPitch:
            "Mask your public IPv4/IPv6 address, test geo-targeted web apps from 100+ countries, and encrypt traffic on public Wi-Fi.",
        pros: [
            "Fast WireGuard-based NordLynx protocol",
            "Servers across 100+ countries for geo-testing websites",
            "Meshnet feature for secure device-to-device tunneling",
        ],
        cons: [
            "Paid subscription required",
            "Some websites challenge shared VPN exit IPs with CAPTCHAs",
        ],
        disclosureRequired: true,
    },
    hostinger: {
        id: "hostinger",
        name: "Hostinger",
        url: process.env.NEXT_PUBLIC_AFFILIATE_HOSTINGER_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_HOSTINGER_URL",
        category: "developer",
        badge: "Web & VPS Hosting",
        ctaText: "Explore Hostinger",
        shortPitch:
            "Deploy websites, WordPress projects, and Linux VPS instances with NVMe SSD storage, AMD EPYC processors, and the hPanel dashboard.",
        pros: [
            "All-in-one shared, WordPress (LiteSpeed), and VPS hosting",
            "VPS plans with NVMe SSD storage, AMD EPYC CPUs, full root access, and Docker support",
            "Custom hPanel dashboard with one-click WordPress staging",
        ],
        cons: [
            "Promotional introductory rates renew at standard billing rates",
            "Root VPS administration requires Linux familiarity",
        ],
        disclosureRequired: true,
    },
    cloudways: {
        id: "cloudways",
        name: "Cloudways",
        url: process.env.NEXT_PUBLIC_AFFILIATE_CLOUDWAYS_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_CLOUDWAYS_URL",
        category: "developer",
        badge: "Managed Cloud Hosting",
        ctaText: "Try Cloudways",
        shortPitch:
            "Managed cloud hosting platform built for PHP, WordPress, and web applications.",
        pros: [
            "Managed cloud server layer with guided provisioning",
            "Built-in server monitoring and staging workflows",
            "Designed for growing WordPress, WooCommerce, and PHP applications",
        ],
        cons: [
            "Higher starting monthly cost than entry-level shared hosting",
            "Focused on managed cloud servers rather than bundled domain registrar packages",
        ],
        disclosureRequired: true,
    },
    grammarly: {
        id: "grammarly",
        name: "Grammarly",
        url: process.env.NEXT_PUBLIC_AFFILIATE_GRAMMARLY_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_GRAMMARLY_URL",
        category: "text",
        badge: "Writing Assistant",
        ctaText: "Try Grammarly",
        shortPitch:
            "Polish your copy after checking word count: catch grammar mistakes, refine tone, and improve clarity across every browser tab and document.",
        pros: [
            "Works inline across Google Docs, email, and web editors",
            "Real-time tone, conciseness, and grammar suggestions",
            "Free tier covers essential spelling and grammar checks",
        ],
        cons: [
            "Full-sentence rewrites and plagiarism checks require a paid plan",
            "Processes text via cloud API rather than offline",
        ],
        disclosureRequired: true,
    },
    semrush: {
        id: "semrush",
        name: "Semrush",
        url: process.env.NEXT_PUBLIC_AFFILIATE_SEMRUSH_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_SEMRUSH_URL",
        category: "marketing",
        badge: "SEO & Marketing Platform",
        ctaText: "Explore Semrush",
        shortPitch:
            "Audit your site's meta tags, track keyword rankings, analyze backlinks, and uncover competitor traffic strategies with Semrush.",
        pros: [
            "Comprehensive technical site audit for broken meta tags and crawl issues",
            "Deep keyword research and SERP competitor analysis",
            "Content optimization templates based on top-ranking pages",
        ],
        cons: [
            "Premium pricing aimed at serious marketers and agencies",
            "Steep learning curve due to the breadth of tools",
        ],
        disclosureRequired: true,
    },
    beehiiv: {
        id: "beehiiv",
        name: "beehiiv",
        url: process.env.NEXT_PUBLIC_AFFILIATE_BEEHIIV_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_BEEHIIV_URL",
        category: "marketing",
        badge: "Newsletter Platform",
        ctaText: "Start on beehiiv",
        shortPitch:
            "Launch a newsletter with an integrated Newsletter Website, referral program, recommendations, and built-in ad network.",
        pros: [
            "$0 Free forever plan available with Newsletter Website included on all plans",
            "Built-in Referral Program, Recommendations, Paid Subscriptions, and Ad Network on eligible tiers",
            "Includes custom Website Builder, Polls, Automations, A/B Testing, and Segmentation",
        ],
        cons: [
            "Built-in Ad Network, Referral Program, and Paid Subscriptions require upgrading to a paid plan",
            "Organized primarily around newsletter publications rather than a multi-product creator app store",
        ],
        disclosureRequired: true,
    },
    kit: {
        id: "kit",
        name: "Kit (formerly ConvertKit)",
        url: process.env.NEXT_PUBLIC_AFFILIATE_KIT_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_KIT_URL",
        category: "marketing",
        badge: "Creator Email Marketing",
        ctaText: "Explore Kit",
        shortPitch:
            "Visual Automations, subscriber tags and segments, and Kit Commerce built for creators and authors.",
        pros: [
            "Visual Automations builder with subscriber tags and dynamic segments",
            "Free plan includes email marketing and unlimited landing pages",
            "Kit Commerce for selling digital products, ebooks, courses, coaching, and paid subscriptions",
        ],
        cons: [
            "Unlimited Visual Automations and unlimited email sequences require a paid Creator or Pro plan",
            "Focused on email automations, landing pages, and creator commerce rather than a full multi-page CMS",
        ],
        disclosureRequired: true,
    },
    airtable: {
        id: "airtable",
        name: "Airtable",
        url: process.env.NEXT_PUBLIC_AFFILIATE_AIRTABLE_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_AIRTABLE_URL",
        category: "data",
        badge: "Cloud Data Platform",
        ctaText: "Try Airtable",
        shortPitch:
            "Turn flat CSV files and JSON payloads into relational databases, interactive grid views, and automated webhooks without writing backend code.",
        pros: [
            "One-click CSV import with rich field types and linked records",
            "Automatic REST API generated for every base",
            "Built-in automations, forms, and dashboard views",
        ],
        cons: [
            "Record limits per base on free and lower tiers",
            "Not designed for multi-million-row analytical workloads",
        ],
        disclosureRequired: true,
    },
    canva: {
        id: "canva",
        name: "Canva",
        url: process.env.NEXT_PUBLIC_AFFILIATE_CANVA_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_CANVA_URL",
        category: "design",
        badge: "Visual Design Suite",
        ctaText: "Design on Canva",
        shortPitch:
            "Design high-CTR YouTube thumbnails, social media banners, and brand kits using drag-and-drop templates and custom color palettes.",
        pros: [
            "Thousands of ready-made YouTube thumbnail and social templates",
            "Brand Kit support for storing custom hex palettes and fonts",
            "One-click background removal and magic resize on Pro tier",
        ],
        cons: [
            "Background remover and magic resize require Canva Pro",
            "Less granular vector path control than dedicated desktop software",
        ],
        disclosureRequired: true,
    },
    notion: {
        id: "notion",
        name: "Notion",
        url: process.env.NEXT_PUBLIC_AFFILIATE_NOTION_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_NOTION_URL",
        category: "productivity",
        badge: "Docs & Workspace",
        ctaText: "Try Notion",
        shortPitch:
            "Organize your Markdown notes, study sessions, engineering wikis, and project roadmaps in one connected workspace.",
        pros: [
            "First-class Markdown shortcuts, code blocks, and callouts",
            "Databases with Kanban, calendar, and table views",
            "Free tier available for individual use across web, desktop, and mobile",
        ],
        cons: [
            "Offline support is limited compared to local-first Markdown apps",
            "Large databases can feel slower than native desktop editors",
        ],
        disclosureRequired: true,
    },
    optimole: {
        id: "optimole",
        name: "Optimole",
        url: process.env.NEXT_PUBLIC_AFFILIATE_OPTIMOLE_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_OPTIMOLE_URL",
        category: "image",
        badge: "Real-Time Image CDN",
        ctaText: "Explore Optimole",
        shortPitch:
            "Cloud-based image optimization and CDN (450+ locations) that resizes and serves WebP/AVIF images dynamically based on each visitor's device.",
        pros: [
            "Real-time cloud resizing and WebP/AVIF conversion based on visitor device and screen size",
            "WordPress plugin with lazy loading, smart cropping, and centralized media library (DAM)",
            "Serves images via 450+ global CDN locations",
        ],
        cons: [
            "Pricing scales by monthly visits rather than one-time image credits",
            "Built specifically for WordPress sites",
        ],
        disclosureRequired: true,
    },
    adobe_express: {
        id: "adobe_express",
        name: "Adobe Express",
        url: process.env.NEXT_PUBLIC_AFFILIATE_ADOBE_EXPRESS_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_ADOBE_EXPRESS_URL",
        category: "design",
        badge: "Quick Graphic & Social Design",
        ctaText: "Try Adobe Express",
        shortPitch:
            "Create social graphics, YouTube thumbnails, flyers, and quick video edits backed by Adobe Stock templates and Creative Cloud sync.",
        pros: [
            "One-click actions to remove backgrounds, resize/crop images, and trim/caption/merge videos",
            "Integrates with Adobe Photoshop and Illustrator via shared Creative Cloud Libraries",
            "Free plan available, with expanded Adobe Stock and brand setup on Premium and Teams plans",
        ],
        cons: [
            "Full Adobe Stock collection and brand controls require a paid plan",
            "Requires signing in with an Adobe account",
        ],
        disclosureRequired: true,
    },
    kittl: {
        id: "kittl",
        name: "Kittl",
        url: process.env.NEXT_PUBLIC_AFFILIATE_KITTL_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_KITTL_URL",
        category: "design",
        badge: "Typography & Vector Design",
        ctaText: "Explore Kittl",
        shortPitch:
            "Browser-based design platform with an Infinite Canvas, Text Effects, Vector Tools, Product Mockups, and AI vector/image generators.",
        pros: [
            "Built-in Text Effects, Vector Tools, and curated fonts in the browser",
            "Templates for logos, posters, apparel (t-shirts/hoodies), labels, and packaging",
            "Infinite Canvas with real-time collaboration, Kittl Brand Studio, and Product Mockups",
        ],
        cons: [
            "Higher AI credits and workspace tiers require a paid subscription",
            "Focused on graphic design and print/merch layouts rather than corporate spreadsheets",
        ],
        disclosureRequired: true,
    },
    mangools: {
        id: "mangools",
        name: "Mangools (KWFinder)",
        url: process.env.NEXT_PUBLIC_AFFILIATE_MANGOOLS_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_MANGOOLS_URL",
        category: "marketing",
        badge: "Focused SEO Suite",
        ctaText: "Try Mangools",
        shortPitch:
            "An approachable 5-tool SEO suite (KWFinder, SERPChecker, SERPWatcher, LinkMiner, SiteProfiler) built for bloggers, affiliate marketers, and SMBs.",
        pros: [
            "KWFinder and SERPChecker provide search volumes, keyword difficulty, and 49 SEO metrics",
            "SERPWatcher tracks rankings with city-level localization and interactive shareable reports",
            "Includes free SEO tools (SERP Simulator, SEO Content Optimizer, AI Search Grader) and browser extension",
        ],
        cons: [
            "Does not include an automated technical site-audit crawler",
            "Daily rank updates require the Agency plan (standard plans update weekly)",
        ],
        disclosureRequired: true,
    },
    seranking: {
        id: "seranking",
        name: "SE Ranking",
        url: process.env.NEXT_PUBLIC_AFFILIATE_SERANKING_URL || PLACEHOLDER_URL,
        envKey: "NEXT_PUBLIC_AFFILIATE_SERANKING_URL",
        category: "marketing",
        badge: "All-in-One SEO Platform",
        ctaText: "Explore SE Ranking",
        shortPitch:
            "Full-featured Rank Tracker, Website Audit, On-Page SEO Checker, Backlink Checker, and AI Search Toolkit for teams and agencies.",
        pros: [
            "Combines Rank Tracker, Website Audit, Keyword Research, and Backlink Checker/Monitor",
            "On-Page SEO Checker calculates a Page Optimization Score and audits titles, meta descriptions, headings, and word count",
            "White Label reporting, SEO Report Generator, and Looker Studio / GA4 / GSC / Make / n8n integrations",
        ],
        cons: [
            "Broader dashboard than single-purpose keyword research tools",
            "Requires a paid subscription after the free trial for ongoing rank tracking and audits",
        ],
        disclosureRequired: true,
    },
};

/**
 * Returns true only when the affiliate partner has a real, non-placeholder HTTPS URL configured.
 */
export function isAffiliateConfigured(partner: AffiliatePartner | undefined): partner is AffiliatePartner {
    if (!partner) return false;
    const trimmed = partner.url.trim();
    if (!trimmed || trimmed === "#" || trimmed.includes("PLACEHOLDER") || trimmed.includes("example.com")) {
        return false;
    }
    return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

export function getAffiliateById(id: string): AffiliatePartner | undefined {
    return AFFILIATES[id];
}

export function getConfiguredAffiliatesByIds(ids?: string[]): AffiliatePartner[] {
    if (!ids || ids.length === 0) return [];
    return ids
        .map((id) => AFFILIATES[id])
        .filter((partner): partner is AffiliatePartner => isAffiliateConfigured(partner));
}
