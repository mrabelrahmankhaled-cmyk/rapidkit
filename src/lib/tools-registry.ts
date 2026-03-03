export type ToolCategory = {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    gradient: string;
};

export type Tool = {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription: string;
    categoryId: string;
    icon: string;
    tags: string[];
    isNew?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
};

export const CATEGORIES: ToolCategory[] = [
    {
        id: "youtube",
        name: "YouTube Tools",
        slug: "youtube",
        icon: "Youtube",
        color: "#FF0000",
        gradient: "from-red-500 to-rose-600",
    },
    {
        id: "image",
        name: "Image Tools",
        slug: "image",
        icon: "Image",
        color: "#8B5CF6",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        id: "developer",
        name: "Developer Tools",
        slug: "developer",
        icon: "Code2",
        color: "#06B6D4",
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        id: "text",
        name: "Text Tools",
        slug: "text",
        icon: "FileText",
        color: "#10B981",
        gradient: "from-emerald-500 to-green-600",
    },
    {
        id: "converter",
        name: "Converters",
        slug: "converter",
        icon: "RefreshCw",
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-600",
    },
];

export const TOOLS: Tool[] = [
    // ─── YouTube Tools ─────────────────────────────────────────────
    {
        id: "youtube-thumbnail-downloader",
        name: "YouTube Thumbnail Downloader",
        slug: "youtube-thumbnail-downloader",
        description: "Download any YouTube video thumbnail in HD, Full HD, and 4K quality instantly.",
        longDescription:
            "Grab any YouTube video thumbnail in seconds. Simply paste the video URL and download the thumbnail in multiple resolutions — from standard quality all the way up to maxresdefault (4K). Perfect for content creators, designers, and marketers.",
        categoryId: "youtube",
        icon: "Download",
        tags: ["youtube", "thumbnail", "download", "image"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "YouTube Thumbnail Downloader — Free HD Thumbnail Saver | RapidKit",
            description:
                "Download YouTube thumbnails in HD, Full HD & 4K for free. No signup needed. Works with any public YouTube video URL.",
            keywords: ["youtube thumbnail downloader", "download youtube thumbnail", "youtube thumbnail saver", "hd thumbnail"],
        },
    },
    {
        id: "youtube-tag-extractor",
        name: "YouTube Tag Extractor",
        slug: "youtube-tag-extractor",
        description: "Extract all tags and keywords from any YouTube video to boost your SEO strategy.",
        longDescription:
            "Uncover the exact tags top YouTubers use to rank their videos. Paste any YouTube video URL and get a complete list of its hidden tags instantly. Use them to improve your own video SEO.",
        categoryId: "youtube",
        icon: "Tags",
        tags: ["youtube", "tags", "seo", "keywords"],
        isNew: true,
        seo: {
            title: "YouTube Tag Extractor — Extract Video Tags Free | RapidKit",
            description:
                "Extract tags from any YouTube video instantly. Boost your video SEO by discovering the keywords top creators use.",
            keywords: ["youtube tag extractor", "youtube video tags", "youtube seo tags", "video keywords"],
        },
    },
    // ─── Image Tools ───────────────────────────────────────────────
    {
        id: "image-compressor",
        name: "Image Compressor",
        slug: "image-compressor",
        description: "Compress JPG, PNG, and WebP images up to 90% without losing visible quality.",
        longDescription:
            "Reduce your image file sizes dramatically without sacrificing quality. Our smart compression engine supports JPG, PNG, and WebP formats. No uploads to servers — everything processes right in your browser for maximum privacy.",
        categoryId: "image",
        icon: "Minimize2",
        tags: ["image", "compress", "optimize", "jpg", "png", "webp"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "Free Image Compressor — Compress JPG PNG WebP Online | RapidKit",
            description:
                "Compress images online for free. Reduce JPG, PNG & WebP file sizes by up to 90% with no quality loss. No upload required.",
            keywords: ["image compressor", "compress image online", "reduce image size", "jpg compressor", "png compressor"],
        },
    },
    {
        id: "webp-converter",
        name: "WebP Converter",
        slug: "webp-converter",
        description: "Convert JPG and PNG images to WebP format for faster websites and better Core Web Vitals.",
        longDescription:
            "WebP images are 25-34% smaller than comparable JPEG or PNG images. Convert your images to WebP format instantly in your browser. Boost your website performance and Google PageSpeed score.",
        categoryId: "image",
        icon: "Zap",
        tags: ["image", "webp", "convert", "optimize"],
        isNew: true,
        seo: {
            title: "JPG to WebP Converter — Free Online WebP Converter | RapidKit",
            description:
                "Convert JPG and PNG images to WebP format online for free. Smaller files, faster websites, better SEO.",
            keywords: ["webp converter", "jpg to webp", "png to webp", "convert to webp online"],
        },
    },
    // ─── Developer Tools ───────────────────────────────────────────
    {
        id: "json-formatter",
        name: "JSON Formatter & Validator",
        slug: "json-formatter",
        description: "Format, validate, and minify JSON data with syntax highlighting and error detection.",
        longDescription:
            "The ultimate JSON tool for developers. Paste your raw JSON and instantly get a beautifully formatted, syntax-highlighted, and validated output. Also supports minification for production use. Detects and highlights errors with line numbers.",
        categoryId: "developer",
        icon: "Braces",
        tags: ["json", "format", "validate", "developer", "beautify"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "JSON Formatter & Validator — Free Online JSON Beautifier | RapidKit",
            description:
                "Format, validate, and minify JSON online for free. Syntax highlighting, error detection, and one-click copy.",
            keywords: ["json formatter", "json validator", "json beautifier", "format json online", "json minifier"],
        },
    },
    {
        id: "css-gradient-generator",
        name: "CSS Gradient Generator",
        slug: "css-gradient-generator",
        description: "Create stunning CSS gradients visually and copy the code instantly.",
        longDescription:
            "Design beautiful linear, radial, and conic CSS gradients with a live visual editor. Add multiple color stops, adjust angles, and copy the generated CSS code with one click. Supports all modern browsers.",
        categoryId: "developer",
        icon: "Palette",
        tags: ["css", "gradient", "color", "design", "developer"],
        seo: {
            title: "CSS Gradient Generator — Create Beautiful Gradients Online | RapidKit",
            description:
                "Generate CSS gradients visually. Create linear, radial & conic gradients and copy the CSS code instantly. Free online tool.",
            keywords: ["css gradient generator", "gradient maker", "linear gradient css", "background gradient generator"],
        },
    },
    // ─── Text Tools ────────────────────────────────────────────────
    {
        id: "word-counter",
        name: "Word & Character Counter",
        slug: "word-counter",
        description: "Count words, characters, sentences, and paragraphs. Estimate reading time instantly.",
        longDescription:
            "A comprehensive text analysis tool. Get real-time word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time. Perfect for writers, students, and content creators.",
        categoryId: "text",
        icon: "AlignLeft",
        tags: ["text", "word count", "character count", "writing"],
        isPopular: true,
        seo: {
            title: "Word Counter — Free Online Word & Character Count Tool | RapidKit",
            description:
                "Count words, characters, sentences & paragraphs instantly. Get reading time estimates. Free online word counter.",
            keywords: ["word counter", "character counter", "word count online", "text character counter"],
        },
    },
    {
        id: "text-case-converter",
        name: "Text Case Converter",
        slug: "text-case-converter",
        description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, and more instantly.",
        longDescription:
            "Transform your text between different cases with one click. Supports UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. Great for developers and writers.",
        categoryId: "text",
        icon: "CaseSensitive",
        tags: ["text", "case", "convert", "uppercase", "lowercase"],
        seo: {
            title: "Text Case Converter — UPPERCASE, lowercase & More | RapidKit",
            description:
                "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case and more. Free instant text case converter.",
            keywords: ["text case converter", "uppercase converter", "lowercase converter", "title case converter", "camelcase converter"],
        },
    },
    // ─── Converters ────────────────────────────────────────────────
    {
        id: "unit-converter",
        name: "Unit Converter",
        slug: "unit-converter",
        description: "Convert between length, weight, temperature, area, and speed units instantly.",
        longDescription:
            "A comprehensive unit converter supporting 50+ units across 6 categories: Length, Weight, Temperature, Area, Volume, and Speed. Get instant conversions as you type with no page reloads.",
        categoryId: "converter",
        icon: "ArrowLeftRight",
        tags: ["converter", "units", "length", "weight", "temperature"],
        isFeatured: true,
        seo: {
            title: "Unit Converter — Convert Length, Weight, Temperature & More | RapidKit",
            description:
                "Free online unit converter. Convert length, weight, temperature, area, volume and speed units instantly.",
            keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric converter"],
        },
    },
    {
        id: "color-converter",
        name: "Color Code Converter",
        slug: "color-converter",
        description: "Convert colors between HEX, RGB, HSL, and CMYK formats with a live preview.",
        longDescription:
            "Seamlessly convert color codes between HEX, RGB, HSL, HSV, and CMYK. Features a live color preview and a curated color palette. Perfect for designers and developers who work with colors daily.",
        categoryId: "converter",
        icon: "Droplets",
        tags: ["color", "hex", "rgb", "hsl", "converter"],
        seo: {
            title: "Color Code Converter — HEX, RGB, HSL, CMYK | RapidKit",
            description:
                "Convert color codes between HEX, RGB, HSL, HSV and CMYK instantly. Live color preview included. Free online color converter.",
            keywords: ["color converter", "hex to rgb", "rgb to hex", "color code converter", "hex color converter"],
        },
    },
];

// ─── Helper Functions ────────────────────────────────────────────

export function getToolBySlug(slug: string): Tool | undefined {
    return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(categoryId: string): Tool[] {
    return TOOLS.filter((t) => t.categoryId === categoryId);
}

export function getCategoryById(id: string): ToolCategory | undefined {
    return CATEGORIES.find((c) => c.id === id);
}

export function getFeaturedTools(): Tool[] {
    return TOOLS.filter((t) => t.isFeatured);
}

export function getPopularTools(): Tool[] {
    return TOOLS.filter((t) => t.isPopular);
}

export function getNewTools(): Tool[] {
    return TOOLS.filter((t) => t.isNew);
}

export function searchTools(query: string): Tool[] {
    const q = query.toLowerCase();
    return TOOLS.filter(
        (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q))
    );
}
