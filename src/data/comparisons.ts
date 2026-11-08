import type { ToolFAQ } from "@/data/tools";

/**
 * CONTENT POLICY (fact-checked 2026-11-08 against vendor pages):
 * Only claims that were confirmed on the vendor's own public pages are rendered.
 * Anything that could not be confirmed was removed. See REVIEW.md for the audit trail.
 * Pricing is never stated here; each product links to the vendor's pricing page.
 */

export type ComparisonProduct = {
    name: string;
    affiliateId?: string;
    tagline: string;
    pricingSummary: string;
    pricingUrl: string;
    bestFor: string;
    pros: string[];
    cons: string[];
};

export type ComparisonRow = {
    feature: string;
    productA: string;
    productB: string;
};

export type ComparisonPage = {
    slug: string;
    title: string;
    subtitle: string;
    categoryLabel: string;
    lastVerified: string | null;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
    intro: string[];
    productA: ComparisonProduct;
    productB: ComparisonProduct;
    decisionGuide: {
        chooseA: string[];
        chooseB: string[];
    };
    comparisonTable: ComparisonRow[];
    faqs: ToolFAQ[];
    relatedToolSlugs: string[];
    relatedAlternativeSlugs?: string[];
    affiliateIds: string[];
};

export const COMPARISONS: ComparisonPage[] = [
    // ─── 1. Hostinger vs Cloudways ─────────────────────────────────
    // lastVerified stays null: Cloudways' site blocks automated access (bot challenge), so none of its
    // product claims could be confirmed. Only Hostinger claims below are verified.
    // TODO verify (Cloudways): hosting model, staging, Git/SSH, cron manager, SSL, caching stack, support, domain/email handling
    // TODO verify (Hostinger): hPanel feature list (cron/DNS/email), phone-support policy, shared-plan staging availability
    {
        slug: "hostinger-vs-cloudways",
        title: "Hostinger vs Cloudways: Which Hosting Approach Fits Your Project?",
        subtitle:
            "A short, source-checked look at Hostinger's hosting lineup next to Cloudways, with pointers to verify the rest on the vendors' own pages.",
        categoryLabel: "Web & Cloud Hosting",
        lastVerified: null,
        seo: {
            title: "Hostinger vs Cloudways — Hosting Comparison",
            description:
                "Compare Hostinger's shared, WordPress and VPS hosting with Cloudways managed cloud hosting, plus free RapidKit tools for server tasks.",
            keywords: ["hostinger vs cloudways", "cloudways vs hostinger", "hosting comparison"],
        },
        intro: [
            "Hostinger and Cloudways are often shortlisted together, but they are sold differently. Hostinger's site lists shared web hosting, WordPress hosting, and VPS hosting, while Cloudways describes itself as a managed cloud hosting provider.",
            "This page only states facts that were confirmed on vendor pages. Cloudways' website blocks automated reading, so its details are intentionally left for you to check on its own feature and pricing pages rather than repeated here from memory.",
        ],
        productA: {
            name: "Hostinger",
            affiliateId: "hostinger",
            tagline: "Shared, WordPress, and VPS hosting from one provider.",
            pricingSummary:
                "Plans are sold per product line (web, WordPress, VPS). Hostinger's VPS page states that all plans are paid upfront; compare term lengths and renewal terms on the official pricing page.",
            pricingUrl: "https://www.hostinger.com/pricing",
            bestFor:
                "People who want to choose between shared, WordPress, or VPS hosting within one provider, including a VPS with full root access and Docker.",
            pros: [
                "Offers shared web hosting, WordPress hosting, and VPS hosting",
                "VPS hosting page lists full root access and Docker",
                "WordPress hosting page lists LiteSpeed servers with caching and a one-click staging tool",
                "Uses its own hPanel control panel",
            ],
            cons: [
                "VPS pricing page states all plans are paid upfront",
            ],
        },
        productB: {
            name: "Cloudways",
            affiliateId: "cloudways",
            tagline: "Describes itself as a managed cloud hosting provider.",
            pricingSummary: "See Cloudways' official pricing page for current plans and billing terms.",
            pricingUrl: "https://www.cloudways.com/en/pricing.php",
            bestFor:
                "Anyone specifically looking for a managed cloud hosting provider; confirm features and limits on the vendor's site.",
            pros: [
                "Positioned by the vendor as managed cloud hosting",
            ],
            cons: [
                "Features, limits, and trade-offs are not repeated here because they could not be confirmed from the vendor's site; review Cloudways' official pages before deciding",
            ],
        },
        decisionGuide: {
            chooseA: [
                "You want a VPS with full root access and Docker from the same provider that sells shared and WordPress hosting.",
                "You are running WordPress and want a hosting plan that lists a one-click staging tool and LiteSpeed caching.",
                "You prefer to compare shared, WordPress, and VPS tiers within a single vendor's pricing page.",
            ],
            chooseB: [
                "You specifically want a managed cloud hosting provider rather than shared or self-run VPS hosting.",
                "You have confirmed on Cloudways' own feature pages that it covers the tools your project needs (staging, deployment, caching, scheduling).",
                "You have compared Cloudways' billing terms against Hostinger's upfront-paid plans on both pricing pages.",
            ],
        },
        comparisonTable: [
            {
                feature: "Hosting types listed",
                productA: "Shared web hosting, WordPress hosting, VPS hosting",
                productB: "Managed cloud hosting (per the vendor's own description)",
            },
            {
                feature: "VPS root access & Docker",
                productA: "Listed on Hostinger's VPS hosting page",
                productB: "Check Cloudways' official feature pages",
            },
            {
                feature: "WordPress staging",
                productA: "One-click staging tool listed on WordPress hosting page",
                productB: "Check Cloudways' official feature pages",
            },
            {
                feature: "Control panel",
                productA: "hPanel",
                productB: "Check Cloudways' official feature pages",
            },
            {
                feature: "Billing terms",
                productA: "VPS plans are stated as paid upfront; see pricing page",
                productB: "See Cloudways' official pricing page",
            },
        ],
        faqs: [
            {
                question: "Does Hostinger's VPS hosting include root access?",
                answer: "Yes. Hostinger's VPS hosting page lists AMD EPYC CPUs, NVMe SSDs, Docker, and full root access.",
            },
            {
                question: "Does Hostinger offer a staging tool for WordPress sites?",
                answer: "Hostinger's WordPress hosting page lists a one-click staging tool for testing changes before you publish.",
            },
            {
                question: "How do I write the schedule for a recurring server task?",
                answer: "Cron schedules use a standard five-field expression regardless of host. RapidKit's Cron Job Generator builds that expression and explains it in plain English; check your host's documentation for where to enter it.",
            },
            {
                question: "Where can I check current pricing and billing terms?",
                answer: "Pricing and renewal terms change, so this page does not quote them. Use the official pricing links on each product card above to compare plans and billing periods.",
            },
        ],
        relatedToolSlugs: [
            "cron-job-generator",
            "what-is-my-ip",
            "unix-timestamp-converter",
            "meta-tag-generator",
        ],
        relatedAlternativeSlugs: ["semrush-alternatives"],
        affiliateIds: ["hostinger", "cloudways"],
    },

    // ─── 2. beehiiv vs Kit (ConvertKit) ────────────────────────────
    // Verified 2026-11-08 against beehiiv.com/features, beehiiv.com/pricing, kit.com/features, kit.com/pricing.
    // Removed (not found on vendor pages): beehiiv "Boosts", custom-domain/SEO-control claims, CSV import claims;
    // Kit integrations with Teachable/Kajabi/Gumroad (App Store page lists Shopify, Stripe, Thinkific, Canva, Circle, Linktree).
    {
        slug: "beehiiv-vs-kit",
        title: "beehiiv vs Kit (ConvertKit): Newsletter Platform Comparison",
        subtitle:
            "How beehiiv's newsletter-plus-website approach compares with Kit's tag-based email automation and creator commerce, based on each vendor's own site.",
        categoryLabel: "Email & Newsletter Platforms",
        lastVerified: "2026-11-08",
        seo: {
            title: "beehiiv vs Kit (ConvertKit) — Newsletter & Email Platform Comparison",
            description:
                "Compare beehiiv and Kit (formerly ConvertKit) on website features, automations, monetization tools, and free plans, based on vendor pages.",
            keywords: ["beehiiv vs kit", "beehiiv vs convertkit", "kit vs beehiiv", "newsletter platform comparison"],
        },
        intro: [
            "beehiiv and Kit both serve independent writers and creators, but their homepages lead with different strengths. beehiiv presents itself as a newsletter platform with a website, growth tools, and monetization options such as paid subscriptions and an ad network.",
            "Kit (formerly ConvertKit) leads with email marketing built for creators: one subscriber list organized with tags and segments, Visual Automations, landing pages, and Commerce for selling digital products. The details below come from each vendor's own features and pricing pages.",
        ],
        productA: {
            name: "beehiiv",
            affiliateId: "beehiiv",
            tagline: "Newsletter platform with a website, growth tools, and built-in monetization.",
            pricingSummary:
                "beehiiv's pricing page lists a Free plan alongside paid tiers. Check the official page for current plan contents and limits.",
            pricingUrl: "https://www.beehiiv.com/pricing",
            bestFor:
                "Writers who want a newsletter and a website on the same platform, with referral, recommendation, and sponsorship tools nearby.",
            pros: [
                "Features page lists a website builder and says every plan includes a newsletter website",
                "Growth tools listed include a referral program, Recommendations, pop-ups, and email gates",
                "Monetization options listed include paid subscriptions, an ad network, digital products, and direct sponsorships",
                "Editor features listed include polls, magic links, A/B testing, and segmentation",
            ],
            cons: [
                "Paid subscriptions, automations, polls, and A/B testing are listed starting at the Lite plan, not the Free plan",
            ],
        },
        productB: {
            name: "Kit (formerly ConvertKit)",
            affiliateId: "kit",
            tagline: "Email marketing for creators, organized around tags, segments, and automations.",
            pricingSummary:
                "Kit's pricing page references a Free plan and paid Creator and Pro plans. Check the official page for current plan contents and limits.",
            pricingUrl: "https://kit.com/pricing",
            bestFor:
                "Creators who sell products or services and want email sequences driven by tags, segments, and purchases.",
            pros: [
                "Organizes subscribers on one list using tags and segments",
                "Landing pages are listed on all plans, including Free",
                "Commerce feature sells ebooks, courses, coaching, digital products, and subscriptions",
                "Kit App Store connects tools such as Shopify, Stripe, Thinkific, Canva, Circle, and Linktree",
                "Lists free migrations from other platforms",
            ],
            cons: [
                "Unlimited Visual Automations and email sequences are listed under the Creator plan rather than Free",
                "Kit App Store integrations are listed for the Creator and Pro plans",
            ],
        },
        decisionGuide: {
            chooseA: [
                "Your newsletter is the product and you want a website, recommendations, and referral tools on the same platform.",
                "You want to explore paid subscriptions, an ad network, or direct sponsorships from within one dashboard.",
                "You want to start on a Free plan that already includes landing pages and a recommendation network.",
            ],
            chooseB: [
                "You sell ebooks, courses, coaching, or other digital products and want checkout tied to your email list.",
                "You want one subscriber list organized with tags and segments, plus a Visual Automations builder.",
                "You rely on connected tools like Shopify, Stripe, Thinkific, or Circle and want purchases to sync to subscribers.",
            ],
        },
        comparisonTable: [
            {
                feature: "Core focus",
                productA: "Newsletter platform with website, growth, and monetization tools",
                productB: "Creator email marketing with automations and commerce",
            },
            {
                feature: "Subscriber organization",
                productA: "Segmentation listed under its Analyze features",
                productB: "One list organized with tags and segments",
            },
            {
                feature: "Website / pages",
                productA: "Website builder; newsletter website included on all plans",
                productB: "Landing pages on all plans, including Free",
            },
            {
                feature: "Automations",
                productA: "Automations listed starting at the Lite plan",
                productB: "Visual Automations; unlimited listed under Creator",
            },
            {
                feature: "Monetization tools",
                productA: "Paid subscriptions, ad network, Recommendations, digital products, sponsorships",
                productB: "Commerce, paid newsletter, newsletter sponsorships",
            },
            {
                feature: "Free plan",
                productA: "Yes (pricing page lists a Free plan)",
                productB: "Yes (pricing page references a Free plan)",
            },
        ],
        faqs: [
            {
                question: "Is Kit the same product as ConvertKit?",
                answer: "Kit's own site states that ConvertKit is now Kit and refers to itself as formerly ConvertKit.",
            },
            {
                question: "Do both platforms have a free plan?",
                answer: "beehiiv's pricing page lists a Free plan, and Kit's pricing page references a Free plan with its paid Creator and Pro plans. Plan contents change, so confirm details on each vendor's pricing page.",
            },
            {
                question: "Which platform includes a website for my newsletter?",
                answer: "beehiiv's pricing page says every plan includes a newsletter website and lists a website builder. Kit lists landing pages on all plans. Before publishing, you can preview your title and description with RapidKit's Meta Tag Generator and check length with the Advanced Word Counter.",
            },
            {
                question: "Can I move my subscribers from another platform?",
                answer: "Kit lists free migrations as a support service, and beehiiv's site links to a migration guide. If you export subscriber data as CSV, RapidKit's JSON/CSV Converter lets you inspect and reshape it in your browser first.",
            },
        ],
        relatedToolSlugs: [
            "word-counter",
            "markdown-editor",
            "meta-tag-generator",
            "json-csv-converter",
        ],
        relatedAlternativeSlugs: ["canva-alternatives", "semrush-alternatives"],
        affiliateIds: ["beehiiv", "kit"],
    },

    // ─── 3. vidIQ vs TubeBuddy ─────────────────────────────────────
    // Verified 2026-11-08 against vidiq.com and tubebuddy.com home pages.
    // Removed (not found on vendor pages): "YouTube Certified Partner", "weighted/unweighted keyword scores",
    // tier names/gating of A/B testing, and the claim that vidIQ has no A/B tooling (its homepage mentions A/B testing).
    {
        slug: "vidiq-vs-tubebuddy",
        title: "vidIQ vs TubeBuddy: YouTube SEO & Channel Tools Compared",
        subtitle:
            "What vidIQ and TubeBuddy each list on their own sites for keyword research, video ideas, bulk editing, and A/B testing.",
        categoryLabel: "YouTube Creator Tools",
        lastVerified: "2026-11-08",
        seo: {
            title: "vidIQ vs TubeBuddy — YouTube SEO & Creator Toolkit Comparison",
            description:
                "Compare vidIQ and TubeBuddy on keyword research, video ideas, bulk editing, and A/B testing, based on each vendor's own pages.",
            keywords: ["vidiq vs tubebuddy", "tubebuddy vs vidiq", "youtube seo tool comparison"],
        },
        intro: [
            "vidIQ and TubeBuddy are both browser-extension-based tools for YouTube creators, and both advertise a way to start for free. Their homepages emphasize different things: vidIQ highlights keyword research, daily ideas, outlier videos, competitors, and a channel audit, while TubeBuddy highlights SEO tools, content management with bulk editors, and A/B testing.",
            "The comparison below only repeats features each vendor lists publicly. Plan-by-plan availability changes often, so use the official plans and pricing links to see which features sit in which tier.",
        ],
        productA: {
            name: "vidIQ",
            affiliateId: "vidiq",
            tagline: "Keyword research, daily ideas, outliers, and channel analysis for YouTube creators.",
            pricingSummary:
                "vidIQ offers free sign-up and a free browser extension. Paid plans exist; see the official plans page for what each includes.",
            pricingUrl: "https://vidiq.com/plans/",
            bestFor:
                "Creators who want idea discovery, keyword research, and competitor insight alongside a browser extension.",
            pros: [
                "Free sign-up and a free browser extension",
                "Extension shows view velocity, SEO scores, and tags on YouTube videos and channels",
                "Keyword research lists real search volume and competition scores",
                "Features listed include Daily Ideas, Most Viewed, Outliers, Competitors, and Channel Audit",
                "Homepage mentions thumbnail templates and A/B testing",
            ],
            cons: [
                "Plan-level availability of individual features varies; check the plans page",
            ],
        },
        productB: {
            name: "TubeBuddy",
            affiliateId: "tubebuddy",
            tagline: "YouTube SEO tools, content management, and A/B testing in a browser extension.",
            pricingSummary:
                "TubeBuddy states it is free to start and lists a forever plan. Paid plans exist; see the official pricing page for what each includes.",
            pricingUrl: "https://www.tubebuddy.com/pricing",
            bestFor:
                "Creators with a back catalog who want bulk editing tools and structured title and thumbnail testing.",
            pros: [
                "Free to start with a Chrome extension",
                "SEO tools listed include Keyword Explorer, SEO Studio, and Click Magnet",
                "Bulk tools listed include Bulk Find, Replace & Append, Bulk Card Editor, and Bulk End Screen Editor",
                "A/B testing rotates variants and measures click-through rate for titles and thumbnails",
                "Also lists Video Scheduling, Chapter Editor, and a mobile app",
            ],
            cons: [
                "Plan-level availability of individual features varies; check the pricing page",
            ],
        },
        decisionGuide: {
            chooseA: [
                "Your biggest question is what to make next and you want daily ideas and outlier videos in your niche.",
                "You want search volume and competition scores shown in a keyword research view.",
                "You like seeing view velocity and SEO scores directly on YouTube pages.",
            ],
            chooseB: [
                "You have many published videos and want bulk tools to find and replace text, edit cards, or edit end screens.",
                "You want built-in A/B testing that rotates variants and measures click-through rate.",
                "You want scheduling and chapter editing tools next to your SEO tools.",
            ],
        },
        comparisonTable: [
            {
                feature: "Free way to start",
                productA: "Free sign-up and free browser extension",
                productB: "Free to start; forever plan listed",
            },
            {
                feature: "Browser extension",
                productA: "Yes (shows view velocity, SEO scores, tags)",
                productB: "Yes (Chrome extension)",
            },
            {
                feature: "Keyword research",
                productA: "Keyword Research with search volume and competition scores",
                productB: "Keyword Explorer, SEO Studio, Click Magnet",
            },
            {
                feature: "Idea discovery",
                productA: "Daily Ideas, Most Viewed, Outliers",
                productB: "Next Video Ideas, Niche Leaderboard, Topical Analysis",
            },
            {
                feature: "Bulk editing",
                productA: "Not highlighted on vidIQ's homepage; check its features page",
                productB: "Bulk Find, Replace & Append; Bulk Card Editor; Bulk End Screen Editor",
            },
            {
                feature: "A/B testing",
                productA: "Homepage mentions thumbnail templates and A/B testing",
                productB: "A/B testing for titles and thumbnails rotates variants and measures click-through rate",
            },
        ],
        faqs: [
            {
                question: "Do both tools have a free way to start?",
                answer: "Yes. vidIQ offers free sign-up and a free extension, and TubeBuddy states it is free to start with a forever plan. Which features are included changes over time, so check each vendor's plans page.",
            },
            {
                question: "Can I look at one video's tags or thumbnail without installing an extension?",
                answer: "Yes. RapidKit's YouTube Tag Extractor and YouTube Thumbnail Downloader work on a single public video directly in your browser, with no extension required.",
            },
            {
                question: "Which tool lists bulk editing for existing videos?",
                answer: "TubeBuddy's homepage lists Bulk Find, Replace & Append, a Bulk Card Editor, and a Bulk End Screen Editor. vidIQ's homepage does not highlight bulk editors, so check its features page if you need them.",
            },
            {
                question: "Do both mention A/B testing?",
                answer: "Yes. vidIQ's homepage mentions thumbnail templates with A/B testing, and TubeBuddy describes A/B testing that rotates variants, measures click-through rate, and declares a winner for titles and thumbnails.",
            },
        ],
        relatedToolSlugs: [
            "youtube-tag-extractor",
            "youtube-thumbnail-downloader",
            "aspect-ratio-calculator",
            "word-counter",
        ],
        relatedAlternativeSlugs: ["canva-alternatives", "semrush-alternatives"],
        affiliateIds: ["vidiq", "tubebuddy"],
    },
];

export function getComparisonBySlug(slug: string): ComparisonPage | undefined {
    return COMPARISONS.find((c) => c.slug === slug);
}

export function getComparisonsBySlugs(slugs?: string[]): ComparisonPage[] {
    if (!slugs || slugs.length === 0) return [];
    return slugs
        .map((slug) => COMPARISONS.find((c) => c.slug === slug))
        .filter((c): c is ComparisonPage => Boolean(c));
}
