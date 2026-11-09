import type { AffiliateId } from "@/data/affiliates";

export type ToolFAQ = {
    question: string;
    answer: string;
};

export type ToolCategory = {
    id: string;
    name: string;
    slug: string;
    icon: string;
    symbol: string;
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
    howToSteps: string[];
    faqs: ToolFAQ[];
    relatedToolSlugs: string[];
    affiliateIds?: AffiliateId[];
    relatedComparisonSlugs?: string[];
    relatedAlternativeSlugs?: string[];
};

export const CATEGORIES: ToolCategory[] = [
    {
        id: "youtube",
        name: "YouTube Tools",
        slug: "youtube",
        icon: "Youtube",
        symbol: "▶",
        color: "#FF0000",
        gradient: "from-red-500 to-rose-600",
    },
    {
        id: "image",
        name: "Image Tools",
        slug: "image",
        icon: "Image",
        symbol: "🖼",
        color: "#8B5CF6",
        gradient: "from-violet-500 to-purple-600",
    },
    {
        id: "developer",
        name: "Developer Tools",
        slug: "developer",
        icon: "Code2",
        symbol: "⚡",
        color: "#06B6D4",
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        id: "text",
        name: "Text Tools",
        slug: "text",
        icon: "FileText",
        symbol: "Aa",
        color: "#10B981",
        gradient: "from-emerald-500 to-green-600",
    },
    {
        id: "converter",
        name: "Converters",
        slug: "converter",
        icon: "RefreshCw",
        symbol: "⇄",
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-600",
    },
    {
        id: "marketing",
        name: "Marketing Tools",
        slug: "marketing",
        icon: "Megaphone",
        symbol: "📣",
        color: "#EC4899",
        gradient: "from-pink-500 to-rose-600",
    },
    {
        id: "data",
        name: "Data Tools",
        slug: "data",
        icon: "Database",
        symbol: "📊",
        color: "#6366F1",
        gradient: "from-indigo-500 to-blue-600",
    },
    {
        id: "design",
        name: "Design Tools",
        slug: "design",
        icon: "Palette",
        symbol: "🎨",
        color: "#F43F5E",
        gradient: "from-rose-500 to-pink-600",
    },
    {
        id: "video",
        name: "Video Tools",
        slug: "video",
        icon: "Video",
        symbol: "🎬",
        color: "#F43F5E",
        gradient: "from-rose-500 to-red-600",
    },
    {
        id: "productivity",
        name: "Productivity",
        slug: "productivity",
        icon: "Clock",
        symbol: "⏱",
        color: "#F97316",
        gradient: "from-orange-500 to-amber-600",
    },
];

export const TOOLS: Tool[] = [
    // ─── YouTube Tools ─────────────────────────────────────────────
    {
        id: "youtube-thumbnail-downloader",
        name: "YouTube Thumbnail Downloader",
        slug: "youtube-thumbnail-downloader",
        description: "Download any YouTube video thumbnail in Max HD (1280×720), Standard, High, and Medium resolutions.",
        longDescription:
            "Grab any YouTube video thumbnail in seconds. Paste a YouTube watch, share (youtu.be), or embed URL to preview and download the thumbnail in four standard YouTube resolutions — Max Resolution (1280×720), Standard (640×480), High (480×360), and Medium (320×180) — fetched directly from YouTube's image servers.",
        categoryId: "youtube",
        icon: "Download",
        tags: ["youtube", "thumbnail", "download", "image"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "YouTube Thumbnail Downloader — Free HD Thumbnail Saver",
            description:
                "Download YouTube thumbnails in 1280×720 HD, 640×480, 480×360, and 320×180 for free. No signup needed. Works with public YouTube video URLs.",
            keywords: ["youtube thumbnail downloader", "download youtube thumbnail", "youtube thumbnail saver", "hd thumbnail"],
        },
        howToSteps: [
            "Copy a public YouTube video link (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...) or an 11-character video ID.",
            "Paste the video URL or ID into the input field above and click 'Get Thumbnails'.",
            "Preview the four available resolutions: Max Resolution (1280×720), Standard (640×480), High (480×360), and Medium (320×180).",
            "Click 'Download' under your preferred size to fetch and save the JPG image to your device.",
        ],
        faqs: [
            {
                question: "Which YouTube URL formats does this tool support?",
                answer: "The parser accepts standard watch links (youtube.com/watch?v=...), shortened share links (youtu.be/...), embed links (youtube.com/embed/... or youtube.com/v/...), or a raw 11-character YouTube video ID.",
            },
            {
                question: "How are the thumbnail images retrieved?",
                answer: "Once the 11-character video ID is extracted in your browser, your browser loads and downloads the public JPG files (maxresdefault, sddefault, hqdefault, and mqdefault) directly from YouTube's image CDN (img.youtube.com).",
            },
            {
                question: "Why is the 1280×720 (maxresdefault) image missing on some videos?",
                answer: "YouTube only provides a maxresdefault.jpg file when the video was uploaded in HD or has a high-resolution custom thumbnail. For older or lower-resolution uploads, use the 640×480 (sddefault) or 480×360 (hqdefault) option.",
            },
        ],
        relatedToolSlugs: ["youtube-tag-extractor", "image-compressor", "aspect-ratio-calculator"],
        affiliateIds: ["vidiq", "tubebuddy", "adobe_express"],
        relatedComparisonSlugs: ["vidiq-vs-tubebuddy"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "youtube-tag-extractor",
        name: "YouTube Tag Extractor",
        slug: "youtube-tag-extractor",
        description: "Extract embedded keyword tags from public YouTube videos for video SEO research.",
        longDescription:
            "Inspect the metadata tags attached to public YouTube videos. Paste a YouTube video URL or 11-character ID to query the video page's embedded keywords, then select individual tags or copy the full comma-separated list.",
        categoryId: "youtube",
        icon: "Tags",
        tags: ["youtube", "tags", "seo", "keywords"],
        isNew: true,
        seo: {
            title: "YouTube Tag Extractor — Extract Video Tags Free",
            description:
                "Extract tags from public YouTube videos instantly. Discover the metadata keywords creators embed in their videos.",
            keywords: ["youtube tag extractor", "youtube video tags", "youtube seo tags", "video keywords"],
        },
        howToSteps: [
            "Copy the URL (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...) or 11-character ID of a public YouTube video.",
            "Paste it into the input box and click 'Extract Tags'.",
            "Click individual tags to toggle selection, or use 'Copy All' to copy the comma-separated list.",
            "Paste relevant keywords into YouTube Studio when configuring your own video metadata.",
        ],
        faqs: [
            {
                question: "How does this tool extract tags from a YouTube video?",
                answer: "Your browser sends the 11-character video ID to RapidKit's server route (/api/youtube-tags), which fetches the public YouTube watch page HTML and parses the <meta name=\"keywords\"> tag and embedded player keyword fields (ytInitialData / ytInitialPlayerResponse).",
            },
            {
                question: "Why do some videos return no tags?",
                answer: "Tags are optional in YouTube Studio. If the creator did not enter any tags when publishing the video, the public watch page contains no keyword metadata to extract.",
            },
            {
                question: "Which video links work with the extractor?",
                answer: "It supports public videos using standard watch URLs (youtube.com/watch?v=...), short links (youtu.be/...), embed URLs, or a direct 11-character video ID. Private or age-restricted videos that require sign-in cannot be inspected.",
            },
        ],
        relatedToolSlugs: ["youtube-thumbnail-downloader", "word-counter", "meta-tag-generator"],
        affiliateIds: ["vidiq", "tubebuddy"],
        relatedComparisonSlugs: ["vidiq-vs-tubebuddy"],
        relatedAlternativeSlugs: ["semrush-alternatives"],
    },

    // ─── Image Tools ───────────────────────────────────────────────
    {
        id: "image-compressor",
        name: "Image Compressor",
        slug: "image-compressor",
        description: "Compress images in your browser with an adjustable quality slider and instant before/after file size comparison.",
        longDescription:
            "Reduce image file sizes locally in your browser using the HTML5 Canvas API. Drop multiple images, adjust the quality slider (10% to 100%), compare original and output byte sizes side by side, and download optimized files individually or all at once.",
        categoryId: "image",
        icon: "Minimize2",
        tags: ["image", "compress", "optimize", "jpg", "png", "webp"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "Free Image Compressor — Compress Images Online in Your Browser",
            description:
                "Compress images online for free in your browser. Adjust compression quality, compare file sizes, and download optimized images with no server upload.",
            keywords: ["image compressor", "compress image online", "reduce image size", "jpg compressor", "png compressor"],
        },
        howToSteps: [
            "Drag and drop your image files into the upload zone, or click to select one or more images from your device.",
            "Adjust the quality slider (from 10% to 100%, default 80%) to re-encode the images in real time.",
            "Review the original file size, new file size, and percentage change on each card.",
            "Click the download button on individual images or click 'Download All' to trigger downloads for every processed file.",
        ],
        faqs: [
            {
                question: "Are my images uploaded to a server during compression?",
                answer: "No. Image decoding and canvas re-encoding run locally in your browser using HTML5 Canvas (canvas.toBlob) and client-side JavaScript. Your files are not uploaded to RapidKit's servers.",
            },
            {
                question: "How does this tool handle PNG versus JPEG and other image formats?",
                answer: "In the current canvas encoder, PNG uploads are re-encoded as image/png, while JPEG and other non-PNG image inputs are re-encoded as lossy image/jpeg using your selected quality percentage (10%–100%). Because standard browser PNG encoding is lossless, adjusting the quality slider primarily affects JPEG outputs — for smaller transparent graphics, use our WebP Converter.",
            },
            {
                question: "Is there a file count limit or server queue?",
                answer: "Because processing runs in your browser tab rather than on a remote server queue, there is no server-side file limit; performance depends only on your device's available memory.",
            },
        ],
        relatedToolSlugs: ["webp-converter", "image-metadata-remover", "aspect-ratio-calculator"],
        affiliateIds: ["shortpixel", "optimole"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
        relatedAlternativeSlugs: ["tinypng-alternatives"],
    },
    {
        id: "webp-converter",
        name: "WebP Converter",
        slug: "webp-converter",
        description: "Convert JPG, PNG, GIF, and BMP images to WebP format in your browser with adjustable quality.",
        longDescription:
            "Convert JPG, PNG, GIF, and BMP images into WebP format right inside your browser. Adjust the WebP encoding quality from 10% to 100%, inspect exact byte savings for each file, and download converted .webp files with zero server uploads.",
        categoryId: "image",
        icon: "Zap",
        tags: ["image", "webp", "convert", "optimize"],
        isNew: true,
        seo: {
            title: "JPG & PNG to WebP Converter — Free Online WebP Converter",
            description:
                "Convert JPG, PNG, GIF, and BMP images to WebP format online for free. Client-side browser conversion with adjustable quality.",
            keywords: ["webp converter", "jpg to webp", "png to webp", "convert to webp online"],
        },
        howToSteps: [
            "Drop one or more JPG, PNG, GIF, or BMP files into the upload area.",
            "Set your target WebP quality slider (from 10% to 100%, default 85%).",
            "Wait a moment while your browser encodes each image into an image/webp blob.",
            "Download converted .webp files individually or click 'Download All' to save each converted file.",
        ],
        faqs: [
            {
                question: "Which input image formats does this WebP converter accept?",
                answer: "The uploader accepts JPEG (image/jpeg), PNG (image/png), GIF (image/gif), and BMP (image/bmp) files and encodes each one into a static .webp image via the HTML5 Canvas API.",
            },
            {
                question: "Does converting a PNG to WebP preserve transparency?",
                answer: "Yes. The browser canvas retains the alpha channel when drawing a transparent PNG onto a 2D canvas context and exporting to image/webp.",
            },
            {
                question: "Are my images uploaded to an external server to convert them?",
                answer: "No. All image decoding and WebP encoding happen locally in your browser using HTMLImageElement and canvas.toBlob.",
            },
        ],
        relatedToolSlugs: ["image-compressor", "favicon-generator", "image-metadata-remover"],
        affiliateIds: ["shortpixel", "optimole"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
        relatedAlternativeSlugs: ["tinypng-alternatives"],
    },
    {
        id: "image-metadata-remover",
        name: "Image Metadata (EXIF) Remover",
        slug: "image-metadata-remover",
        description: "Strip sensitive EXIF data, GPS location, and camera settings from your photos instantly.",
        longDescription:
            "Protect your privacy before sharing photos online. Our EXIF cleaner inspects embedded camera tags — including GPS coordinates, device serial numbers, timestamps, and exposure settings — and exports a clean copy with all metadata stripped locally in your browser.",
        categoryId: "image",
        icon: "ShieldCheck",
        tags: ["image", "privacy", "exif", "metadata", "security"],
        isFeatured: true,
        seo: {
            title: "Private Image Metadata Remover — Strip EXIF & GPS from Photos",
            description:
                "Quickly remove GPS location and camera data from your images. Protect your privacy with our 100% local EXIF cleaner. Supporting JPEG and PNG.",
            keywords: ["exif remover", "remove photo metadata", "strip gps from image", "clean image metadata", "private photo sharer"],
        },
        howToSteps: [
            "Select or drag a photo from your phone or camera into the upload box.",
            "Inspect the detected EXIF metadata table (camera model, date taken, and GPS coordinates if present).",
            "Click 'Remove Metadata' to re-encode the clean pixel data onto a fresh canvas without EXIF headers.",
            "Download the sanitized image file safely to your device.",
        ],
        faqs: [
            {
                question: "What sensitive data is hidden inside photo EXIF headers?",
                answer: "Smartphones and digital cameras routinely embed exact GPS latitude/longitude coordinates, altitude, the date and time the photo was taken, the phone or camera make and model, and lens settings inside JPEG headers.",
            },
            {
                question: "How does this tool remove EXIF data without uploading the photo?",
                answer: "It reads the raw EXIF tags in memory using JavaScript, draws the raw visual pixels onto an HTML5 Canvas element (which discards all file-level metadata headers), and exports a brand-new image file.",
            },
            {
                question: "Does removing EXIF data change the resolution of my photo?",
                answer: "No. The exported image keeps the exact pixel width and height of your original photo.",
            },
        ],
        relatedToolSlugs: ["image-compressor", "webp-converter", "password-generator"],
        affiliateIds: ["nordvpn", "onepassword"],
        relatedAlternativeSlugs: ["tinypng-alternatives"],
    },

    // ─── Developer Tools ───────────────────────────────────────────
    {
        id: "json-formatter",
        name: "JSON Formatter & Validator",
        slug: "json-formatter",
        description: "Format, validate, and minify JSON data with syntax highlighting and error detection.",
        longDescription:
            "Paste raw or minified JSON to pretty-print with customizable indentation, validate syntax against RFC 8259, or minify payloads for production APIs. All parsing runs locally in your browser so sensitive API payloads stay private.",
        categoryId: "developer",
        icon: "Braces",
        tags: ["json", "format", "validate", "developer", "beautify"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "JSON Formatter & Validator — Free Online JSON Beautifier",
            description:
                "Format, validate, and minify JSON online for free. Syntax highlighting, error detection, and one-click copy.",
            keywords: ["json formatter", "json validator", "json beautifier", "format json online", "json minifier"],
        },
        howToSteps: [
            "Paste your raw JSON string into the input editor on the left.",
            "Choose an indentation level (2 spaces or 4 spaces) and click 'Format' to pretty-print, or 'Minify' to strip whitespace.",
            "If your JSON has a syntax error, check the validation banner for the error message and position.",
            "Click 'Copy' to copy the formatted or minified JSON to your clipboard.",
        ],
        faqs: [
            {
                question: "Is it safe to paste API responses or configuration files here?",
                answer: "Yes. Formatting and validation use your browser's native JSON.parse and JSON.stringify methods. No payload data is ever sent over the network.",
            },
            {
                question: "Why do trailing commas or single quotes fail JSON validation?",
                answer: "The official JSON specification (RFC 8259) strictly requires double quotes around all keys and string values and forbids trailing commas after the last item in an object or array.",
            },
            {
                question: "What is the difference between formatting and minifying JSON?",
                answer: "Formatting adds line breaks and indentation so humans can read nested objects easily. Minifying removes all non-essential whitespace and newlines to reduce payload size over HTTP.",
            },
        ],
        relatedToolSlugs: ["json-csv-converter", "url-parser", "base64-converter"],
        affiliateIds: ["airtable"],
    },
    {
        id: "css-gradient-generator",
        name: "CSS Gradient Generator",
        slug: "css-gradient-generator",
        description: "Create stunning CSS gradients visually and copy the code instantly.",
        longDescription:
            "Design linear and radial CSS gradients with a live visual editor. Add or remove color stops, tweak angles, pick curated presets, and copy standard CSS background-image declarations in one click.",
        categoryId: "developer",
        icon: "Palette",
        tags: ["css", "gradient", "color", "design", "developer"],
        seo: {
            title: "CSS Gradient Generator — Create Beautiful Gradients Online",
            description:
                "Generate CSS gradients visually. Create linear, radial & conic gradients and copy the CSS code instantly. Free online tool.",
            keywords: ["css gradient generator", "gradient maker", "linear gradient css", "background gradient generator"],
        },
        howToSteps: [
            "Select a gradient type (Linear or Radial) and adjust the direction angle slider.",
            "Click any color stop to pick a new HEX color or adjust its percentage position.",
            "Preview the gradient live in the canvas area or pick from the curated preset swatches.",
            "Click 'Copy CSS' to copy the background declaration into your stylesheet.",
        ],
        faqs: [
            {
                question: "What is the difference between linear-gradient and radial-gradient in CSS?",
                answer: "A linear-gradient transitions colors along a straight line at a specified angle (such as 135deg), whereas a radial-gradient radiates colors outward from a central origin point in a circle or ellipse.",
            },
            {
                question: "Do modern browsers still need -webkit- vendor prefixes for CSS gradients?",
                answer: "No. Standard unprefixed linear-gradient() and radial-gradient() syntax has been supported across Chrome, Firefox, Safari, and Edge for over a decade.",
            },
            {
                question: "Can I use CSS gradients on text?",
                answer: "Yes. Apply the generated background gradient to your text element alongside 'background-clip: text; -webkit-background-clip: text; color: transparent;'.",
            },
        ],
        relatedToolSlugs: ["glassmorphism-generator", "box-shadow-generator", "color-converter"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "qr-code-generator",
        name: "QR Code Generator",
        slug: "qr-code-generator",
        description: "Generate customizable QR codes for URLs, Wi-Fi, and text with custom colors and logo support.",
        longDescription:
            "Create custom static QR codes in your browser. Supports website URLs, Wi-Fi credentials (WPA/WEP/None), and plain text, with customizable foreground and background colors, an optional center logo overlay (20px to 80px), and 1000×1000 PNG or vector SVG downloads.",
        categoryId: "developer",
        icon: "QrCode",
        tags: ["qr code", "generator", "marketing", "wifi", "design"],
        isFeatured: true,
        isNew: true,
        seo: {
            title: "Free QR Code Generator — Create Custom QR Codes with Logo",
            description:
                "Generate custom QR codes online for free. Support for URLs, Wi-Fi, and text. Customize colors, add a center logo, and download as 1000×1000 PNG or SVG.",
            keywords: ["qr code generator", "create qr code", "qr code with logo", "wifi qr code", "custom qr code"],
        },
        howToSteps: [
            "Select the content type: Website URL, Wi-Fi Network (SSID, password, encryption), or Plain Text.",
            "Enter your link, Wi-Fi details, or text message in the input fields.",
            "Customize the foreground color, background color, and optional center logo image (with adjustable logo size from 20px to 80px).",
            "Download your QR code as a 1000×1000 PNG image or scalable vector SVG file.",
        ],
        faqs: [
            {
                question: "Do QR codes generated here ever expire?",
                answer: "No. This tool generates static QR codes locally in your browser that encode your URL, Wi-Fi string, or text directly into the QR pattern. Because they do not route through a redirect server, they do not expire.",
            },
            {
                question: "How does a QR code still scan with a logo in the center?",
                answer: "This generator renders QR codes with Level H error correction, which allows QR scanners to read the encoded data even when a center logo overlay (20px to 80px) covers the middle of the matrix.",
            },
            {
                question: "What resolutions and file formats can I download?",
                answer: "You can export a vector SVG file (which scales to any print size) or a 1000×1000 pixel PNG file rendered via HTML5 Canvas.",
            },
        ],
        relatedToolSlugs: ["whatsapp-link-generator", "url-parser", "favicon-generator"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "cron-job-generator",
        name: "Cron Job Generator",
        slug: "cron-job-generator",
        description: "Visual editor to create Cron schedules and expressions with human-readable explanations.",
        longDescription:
            "Build standard 5-field crontab expressions visually without memorizing asterisk syntax. Pick from common server presets or customize minute, hour, day-of-month, month, and day-of-week fields with an instant human-readable translation.",
        categoryId: "developer",
        icon: "Clock",
        tags: ["developer", "cron", "backend", "sysadmin", "scheduler"],
        isNew: true,
        seo: {
            title: "Cron Job Generator — Visual Crontab Expression Builder",
            description:
                "Create Cron schedules visually. Generate cron expressions for Linux, AWS, and server tasks. Human-readable explanations included. Fast, free, and online.",
            keywords: ["cron job generator", "crontab generator", "cron expression builder", "scheduler tool", "cron syntax"],
        },
        howToSteps: [
            "Start with a quick preset (such as 'Every 5 minutes' or 'Daily at midnight') or edit individual fields.",
            "Set the Minute, Hour, Day of Month, Month, and Day of Week values.",
            "Verify the plain-English schedule summary to confirm the timing matches your requirement.",
            "Copy the 5-field cron expression or full crontab command line to paste into your server's crontab -e.",
        ],
        faqs: [
            {
                question: "What are the 5 fields in a standard cron expression?",
                answer: "From left to right, the five fields represent: Minute (0–59), Hour (0–23), Day of Month (1–31), Month (1–12), and Day of Week (0–6, where 0 is Sunday).",
            },
            {
                question: "What is the difference between '/' and ',' in cron syntax?",
                answer: "A slash (/) defines step intervals — for example, '*/15' in the minute field runs every 15 minutes. A comma (,) defines a list of specific values — for example, '1,15' runs at minute 1 and minute 15.",
            },
            {
                question: "Which timezone does a cron job use?",
                answer: "By default, cron daemons execute jobs based on the system clock timezone of the server where crond is running (often UTC on cloud servers and GitHub Actions).",
            },
        ],
        relatedToolSlugs: ["unix-timestamp-converter", "uuid-generator", "json-formatter"],
        affiliateIds: ["hostinger", "cloudways"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
    },
    {
        id: "unix-timestamp-converter",
        name: "Unix Timestamp Converter",
        slug: "unix-timestamp-converter",
        description: "Convert Unix timestamps to human-readable dates and vice versa with live epoch tracking.",
        longDescription:
            "Convert Unix epoch timestamps (in seconds or milliseconds) to ISO 8601, UTC, and local human-readable dates — or convert any calendar date back into an epoch integer. Includes a live ticking epoch clock for quick debugging.",
        categoryId: "developer",
        icon: "Hash",
        tags: ["developer", "unix", "timestamp", "epoch", "backend"],
        isNew: true,
        seo: {
            title: "Unix Timestamp Converter — Epoch Time & Date Tool",
            description:
                "Convert Unix timestamps to human-readable dates online. Real-time live epoch clock, UTC support, and date-to-timestamp conversion. Free for developers.",
            keywords: ["unix timestamp converter", "epoch converter", "unix time to date", "current unix timestamp", "timestamp to utc"],
        },
        howToSteps: [
            "Copy the current live Unix epoch timestamp from the top bar, or paste your own timestamp into the converter input.",
            "The tool automatically detects whether your timestamp is in seconds (10 digits) or milliseconds (13 digits).",
            "View the converted date in UTC, your local browser timezone, ISO 8601 format, and relative time.",
            "Use the reverse Date-to-Timestamp section to convert a specific year, month, day, and time into an epoch value.",
        ],
        faqs: [
            {
                question: "What is the Unix epoch?",
                answer: "The Unix epoch is 00:00:00 UTC on January 1, 1970. A Unix timestamp is simply the total number of seconds (or milliseconds) that have elapsed since that moment, excluding leap seconds.",
            },
            {
                question: "How do I know if a timestamp is in seconds or milliseconds?",
                answer: "Current timestamps in seconds are 10 digits long (e.g., 1762550000), while timestamps in milliseconds — such as those returned by JavaScript's Date.now() — are 13 digits long.",
            },
            {
                question: "What is the Year 2038 problem?",
                answer: "Systems that store Unix timestamps as signed 32-bit integers will overflow after 2,147,483,647 seconds (03:14:07 UTC on January 19, 2038). Modern 64-bit operating systems and databases use 64-bit integers, avoiding this limit.",
            },
        ],
        relatedToolSlugs: ["cron-job-generator", "uuid-generator", "json-formatter"],
        affiliateIds: ["cloudways", "hostinger"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
    },
    {
        id: "uuid-generator",
        name: "UUID / GUID Generator",
        slug: "uuid-generator",
        description: "Generate bulk unique IDs (v4) for your database keys and development needs.",
        longDescription:
            "Generate RFC 4122 Version 4 UUIDs (Universally Unique Identifiers) in bulk inside your browser. Toggle uppercase letters or curly braces {}, and copy or download up to 100 IDs at once.",
        categoryId: "developer",
        icon: "Fingerprint",
        tags: ["developer", "uuid", "guid", "database", "security"],
        isNew: true,
        seo: {
            title: "Online UUID / GUID Generator — Bulk V4 Unique IDs",
            description:
                "Generate unique UUID v4 identifiers online for free. Support for bulk generation, copy to clipboard, and text file export. Fast, secure, and developer-friendly.",
            keywords: ["uuid generator", "guid generator", "v4 uuid", "generate unique ids", "bulk uuid maker"],
        },
        howToSteps: [
            "Choose how many UUIDs you want to generate (from 1 up to 100).",
            "Toggle formatting options such as Uppercase letters or Curly Braces {} if needed.",
            "Click 'Generate' to produce fresh Version 4 UUIDs instantaneously.",
            "Click any single UUID to copy it, or use 'Copy All' / 'Export .txt' for database seeding.",
        ],
        faqs: [
            {
                question: "How are Version 4 UUIDs generated in this tool?",
                answer: "When supported by your browser, this tool calls the native Web Crypto API method crypto.randomUUID() (with a standard v4 pattern fallback) locally in your browser.",
            },
            {
                question: "Is there any difference between a UUID and a GUID?",
                answer: "They are 128-bit identifiers displayed as 32 hexadecimal digits in 8-4-4-4-12 format. 'UUID' is the IETF/RFC term, while 'GUID' (Globally Unique Identifier) is commonly used in Microsoft tools (which often wrap the value in curly braces {}).",
            },
            {
                question: "How many UUIDs can I generate and export at once?",
                answer: "You can generate between 1 and 100 UUIDs per batch and either copy them to your clipboard or download them as a newline-separated .txt file.",
            },
        ],
        relatedToolSlugs: ["password-generator", "unix-timestamp-converter", "json-formatter"],
        affiliateIds: ["onepassword"],
    },
    {
        id: "url-parser",
        name: "URL Parser & Debugger",
        slug: "url-parser",
        description: "Deconstruct complex URLs into readable components, including protocol, host, path, and query parameters.",
        longDescription:
            "Paste any complex tracking link, webhook callback, or API endpoint to inspect its protocol, hostname, port, pathname, hash fragment, and decoded query string parameters in a structured table.",
        categoryId: "developer",
        icon: "Link",
        tags: ["developer", "url", "parser", "debugging", "web-dev"],
        isNew: true,
        seo: {
            title: "URL Parser & Debugger — Break Down Complex Links Online",
            description:
                "Instantly parse and deconstruct URLs. See protocol, host, path, and query parameters in a clean, structured table. Free developer tool for debugging links.",
            keywords: ["url parser", "query string decoder", "url debugger", "parse url parameters", "utm tag analyzer"],
        },
        howToSteps: [
            "Paste any full URL (including query strings and hash fragments) into the input bar.",
            "Inspect the structural breakdown showing Protocol, Hostname, Port, Pathname, and Origin.",
            "Review the Query Parameters table where URL-encoded keys and values (like %20 or UTM tags) are automatically decoded.",
            "Click any parsed component or parameter value to copy it to your clipboard.",
        ],
        faqs: [
            {
                question: "Does this tool decode percent-encoded characters in query strings?",
                answer: "Yes. It uses the standard WHATWG URL and URLSearchParams APIs, automatically decoding sequences like '%20' (space), '%3A' (:), and '%2F' (/) into readable text.",
            },
            {
                question: "Are the URLs I paste logged or requested by a server?",
                answer: "No. Parsing happens strictly in your browser memory without making any HTTP request to the URL you paste, making it safe for inspecting OAuth redirect links or signed URLs.",
            },
            {
                question: "What is the difference between URL host and hostname?",
                answer: "The 'hostname' is strictly the domain name (e.g., example.com), whereas 'host' includes the port number if a non-default port is specified (e.g., example.com:8080).",
            },
        ],
        relatedToolSlugs: ["meta-tag-generator", "what-is-my-ip", "json-formatter"],
        affiliateIds: ["semrush"],
        relatedAlternativeSlugs: ["semrush-alternatives"],
    },
    {
        id: "markdown-editor",
        name: "Markdown Editor & Preview",
        slug: "markdown-editor",
        description: "Write and preview Markdown in real-time. GitHub-style styling and HTML export.",
        longDescription:
            "Draft README files, technical documentation, and blog posts in a split-screen Markdown editor with instant live HTML preview. Supports GitHub Flavored Markdown (tables, task lists, fenced code blocks) and one-click export to .md or raw HTML.",
        categoryId: "developer",
        icon: "FileText",
        tags: ["developer", "markdown", "editor", "preview", "documentation"],
        isNew: true,
        seo: {
            title: "Markdown Editor & Real-Time Preview Online",
            description:
                "Free online Markdown editor with live preview. Write GitHub-style documentation, convert Markdown to HTML, and export instantly. Fast and developer-friendly.",
            keywords: ["markdown editor", "markdown preview", "online markdown editor", "convert markdown to html", "readme editor"],
        },
        howToSteps: [
            "Type or paste your Markdown syntax in the left-hand editor pane, or use the formatting toolbar buttons.",
            "Check the live-rendered preview pane on the right to verify headings, tables, links, and code blocks.",
            "Click 'Copy HTML' if you need raw HTML markup to paste into a CMS.",
            "Click 'Download .md' to save your Markdown document locally.",
        ],
        faqs: [
            {
                question: "Does this editor support GitHub Flavored Markdown (GFM) tables and task lists?",
                answer: "Yes. You can create pipe tables, strikethrough text (~~text~~), fenced code blocks with triple backticks, and task lists (- [x] item).",
            },
            {
                question: "Can I convert Markdown directly to clean HTML code?",
                answer: "Yes. As you type Markdown, the parser compiles semantic HTML5 tags (<h2>, <p>, <ul>, <table>, <pre><code>) which you can copy with one click.",
            },
            {
                question: "Is my draft sent to a cloud server?",
                answer: "No. Everything is rendered client-side in your browser tab.",
            },
        ],
        relatedToolSlugs: ["word-counter", "text-diff-checker", "code-to-image"],
        affiliateIds: ["notion", "grammarly"],
        relatedComparisonSlugs: ["beehiiv-vs-kit"],
    },
    {
        id: "code-to-image",
        name: "Code to Image (Prettify)",
        slug: "code-to-image",
        description: "Transform your source code into beautiful, shareable images with syntax highlighting and gradients.",
        longDescription:
            "Turn source code snippets into polished, high-resolution PNG cards for technical blog posts, documentation, X/Twitter, and LinkedIn. Customize programming language syntax highlighting, window chrome, padding, and gradient backdrops.",
        categoryId: "developer",
        icon: "FileCode",
        tags: ["code", "image", "developer", "marketing", "syntax highlighting"],
        isFeatured: true,
        seo: {
            title: "Code to Image — Create Beautiful Code Snippets Online",
            description:
                "Convert your source code into elegant images with syntax highlighting. Choose from multiple themes and gradient backgrounds. Free online tool.",
            keywords: ["code to image", "code snippet generator", "pretty code", "source code screenshot", "prettify code"],
        },
        howToSteps: [
            "Paste your source code into the code editor and select the programming language for accurate syntax highlighting.",
            "Pick a background gradient, color theme, padding size, and macOS-style window header controls.",
            "Optionally enter a filename in the window title bar for context.",
            "Click 'Export PNG' to render and download a crisp retina-resolution image of your snippet.",
        ],
        faqs: [
            {
                question: "Why share code as an image on social media?",
                answer: "Social platforms like X, LinkedIn, and Instagram do not support syntax-highlighted code blocks, and long lines wrap awkwardly on mobile screens. A styled code card preserves indentation and color contrast in feeds.",
            },
            {
                question: "What resolution are exported code images?",
                answer: "Images are rendered at 2x pixel density so typography and syntax characters stay sharp on high-DPI Retina displays.",
            },
            {
                question: "Which programming languages are supported?",
                answer: "The highlighter supports JavaScript, TypeScript, Python, Rust, Go, HTML, CSS, SQL, Bash, JSON, C++, Java, and PHP.",
            },
        ],
        relatedToolSlugs: ["markdown-editor", "css-gradient-generator", "image-compressor"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "password-generator",
        name: "Secure Password Generator",
        slug: "password-generator",
        description: "Generate ultra-secure, random passwords instantly with customizable length and character types.",
        longDescription:
            "Create high-entropy random passwords locally in your browser using cryptographically strong random values. Customize length (up to 64 characters), toggle uppercase, lowercase, numbers, and symbols, and evaluate real-time crack-time strength.",
        categoryId: "developer",
        icon: "ShieldAlert",
        tags: ["password", "security", "generator", "random", "privacy"],
        isFeatured: true,
        seo: {
            title: "Secure Password Generator — Create Strong Passwords Online",
            description:
                "Generate highly secure random passwords for free. Customizable length, symbols, and numbers. 100% private and local generation.",
            keywords: ["password generator", "secure password", "random password", "strong password", "password strength"],
        },
        howToSteps: [
            "Drag the length slider to set your desired password length (16+ characters is recommended for critical accounts).",
            "Select which character sets to include: Uppercase (A–Z), Lowercase (a–z), Numbers (0–9), and Symbols (!@#$%).",
            "Check the strength indicator and click the refresh button to generate a new random string.",
            "Click 'Copy Password' and save it directly into your password manager.",
        ],
        faqs: [
            {
                question: "How are passwords generated securely in the browser?",
                answer: "Instead of using Math.random() (which is predictable), this tool uses the browser's native Web Crypto API (window.crypto.getRandomValues) backed by your operating system's entropy source.",
            },
            {
                question: "Are generated passwords ever transmitted or stored?",
                answer: "Never. Password generation happens entirely in your device's local RAM and disappears the moment you close or refresh the tab.",
            },
            {
                question: "What makes a password resistant to brute-force attacks?",
                answer: "Length is the biggest factor in password entropy. A random 16-character password mixing upper/lowercase letters, digits, and symbols has roughly 104 bits of entropy, making offline brute-force cracking infeasible.",
            },
        ],
        relatedToolSlugs: ["uuid-generator", "base64-converter", "what-is-my-ip"],
        affiliateIds: ["onepassword", "nordvpn"],
    },
    {
        id: "base64-converter",
        name: "Base64 Image/Text Converter",
        slug: "base64-converter",
        description: "Convert images to Base64 strings or decode Base64 back to text and images instantly.",
        longDescription:
            "Encode plain UTF-8 text or image files into Base64 strings and Data URIs for inline HTML/CSS embedding, or decode existing Base64 payloads back into readable text and downloadable images.",
        categoryId: "developer",
        icon: "FileCode",
        tags: ["base64", "converter", "image", "developer", "encoding"],
        isPopular: true,
        seo: {
            title: "Base64 Image/Text Converter — Encoder & Decoder Online",
            description:
                "Free online Base64 converter. Convert images to Base64 data URIs or encode/decode text strings. Fast, secure, and developer-friendly.",
            keywords: ["base64 converter", "image to base64", "base64 encoder", "base64 decoder", "data uri generator"],
        },
        howToSteps: [
            "Choose between 'Text Base64' mode and 'Image to Base64' mode.",
            "In Text mode, paste plain text to encode into Base64 or paste a Base64 string to decode back into UTF-8 text.",
            "In Image mode, drop any image file to generate both a raw Base64 string and a ready-to-use HTML <img> or CSS url() Data URI.",
            "Copy the output string to your clipboard with one click.",
        ],
        faqs: [
            {
                question: "Does Base64 encoding encrypt or secure my data?",
                answer: "No. Base64 is a binary-to-text encoding scheme, not encryption. Anyone can decode a Base64 string back to its original content without a key.",
            },
            {
                question: "Why does Base64 increase file size by about 33%?",
                answer: "Base64 represents every 3 bytes (24 bits) of binary data using 4 ASCII characters (32 bits), adding roughly 33% overhead to the payload size.",
            },
            {
                question: "When should I inline an image as a Base64 Data URI?",
                answer: "Base64 Data URIs work best for tiny icons, placeholders, or single-file HTML emails under 4 KB where eliminating an extra HTTP request outweighs the 33% size increase.",
            },
        ],
        relatedToolSlugs: ["json-formatter", "url-parser", "webp-converter"],
        affiliateIds: ["shortpixel", "optimole"],
    },
    {
        id: "favicon-generator",
        name: "Favicon Generator",
        slug: "favicon-generator",
        description: "Generate a complete favicon and web app icon ZIP kit from a single image in your browser.",
        longDescription:
            "Upload any image and generate a complete web icon package locally in your browser: favicon.ico (bundling 16×16, 32×32, and 48×48), favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png (180×180), android-chrome-192x192.png, android-chrome-512x512.png, and a site.webmanifest file — packaged into a single favicon-kit.zip.",
        categoryId: "developer",
        icon: "Globe",
        tags: ["developer", "favicon", "icon", "web-dev", "assets"],
        isNew: true,
        isFeatured: false,
        seo: {
            title: "Favicon Generator — Convert Image to .ico & Web App Icons",
            description:
                "Create a favicon kit for your website in your browser. Generates favicon.ico, PNG icons, apple-touch-icon, and site.webmanifest in a ZIP download.",
            keywords: ["favicon generator", "convert logo to ico", "create favicon", "apple touch icon generator", "web icon maker"],
        },
        howToSteps: [
            "Upload an image file (PNG, JPG, SVG, or WebP) from your device.",
            "Click 'Generate All Icons' to resize the image across all 6 standard icon dimensions on an HTML5 Canvas.",
            "Preview the generated sizes (16×16, 32×32, 48×48, 180×180, 192×192, and 512×512) or download individual PNGs.",
            "Click 'Download All (.ZIP)' to get favicon-kit.zip (including favicon.ico and site.webmanifest) and copy the HTML <link> snippet.",
        ],
        faqs: [
            {
                question: "What files are included inside the downloaded favicon-kit.zip?",
                answer: "The ZIP archive contains 8 files generated in your browser: favicon.ico (containing 16×16, 32×32, and 48×48 layers), favicon-16x16.png, favicon-32x32.png, favicon-48x48.png, apple-touch-icon.png (180×180), android-chrome-192x192.png, android-chrome-512x512.png, and a pre-configured site.webmanifest file.",
            },
            {
                question: "Is my logo uploaded to a server to build the .ico and .zip files?",
                answer: "No. Image resizing uses the browser's 2D Canvas API with high-quality smoothing, the .ico binary header is assembled in memory, and the ZIP file is packaged client-side using JSZip.",
            },
            {
                question: "Why should I start with a square image of at least 512×512 pixels?",
                answer: "The largest icon in the package is android-chrome-512x512.png. Uploading a square source image of at least 512×512 pixels prevents stretching or upscaling blur on high-res mobile screens.",
            },
        ],
        relatedToolSlugs: ["webp-converter", "image-compressor", "meta-tag-generator"],
        affiliateIds: ["adobe_express", "hostinger"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
        relatedAlternativeSlugs: ["canva-alternatives", "tinypng-alternatives"],
    },
    {
        id: "what-is-my-ip",
        name: "What Is My IP Address?",
        slug: "what-is-my-ip",
        description: "Detect your public IP address, ISP, approximate city/country location, and browser/OS details.",
        longDescription:
            "Check your public IP address, internet service provider (ISP), city, region, country, and local browser/OS details in one dashboard. Queries ipapi.co directly from your browser to display the network metadata seen by external services.",
        categoryId: "developer",
        icon: "Globe",
        tags: ["developer", "ip", "network", "geolocation", "system"],
        isNew: true,
        seo: {
            title: "What Is My IP Address? — Public IP, ISP & Location Lookup",
            description:
                "Find your public IP address instantly. View your ISP, city, region, country, and browser/OS environment.",
            keywords: ["what is my ip", "my ip address", "ip lookup", "geolocation by ip", "public ip checker"],
        },
        howToSteps: [
            "Open the page to let your browser query your current public IP address and network metadata.",
            "Click the Copy button next to your IP address to copy it to your clipboard.",
            "Review the Location (city, country), ISP / Provider, Region / State, Browser, and Operating System cards.",
            "Optionally click 'Show on Map' to view the approximate coordinates reported for your IP block on Google Maps.",
        ],
        faqs: [
            {
                question: "How does this tool detect my IP address and location?",
                answer: "When you open this page, your browser makes a direct HTTPS request to the third-party IP lookup API ipapi.co (https://ipapi.co/json/), which returns your public IP address, ISP organization name, and approximate city, region,country, and coordinates. Your browser and OS names are read locally from navigator.userAgent.",
            },
            {
                question: "Why does IP geolocation show a nearby city instead of my exact address?",
                answer: "IP addresses do not contain street-level GPS data. IP databases map address blocks to the regional routing hub or Point of Presence (PoP) operated by your internet service provider.",
            },
            {
                question: "What if the IP lookup fails to load?",
                answer: "Strict ad blockers, privacy extensions, or firewall rules that block requests to ipapi.co can prevent the client-side lookup from completing. Temporarily allowing ipapi.co and clicking 'Try Again' will resolve the issue.",
            },
        ],
        relatedToolSlugs: ["url-parser", "password-generator", "unix-timestamp-converter"],
        affiliateIds: ["nordvpn", "onepassword"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways"],
    },

    // ─── Text Tools ────────────────────────────────────────────────
    {
        id: "word-counter",
        name: "Advanced Word Counter",
        slug: "word-counter",
        description: "Analyze word count, character count, keyword density, and estimated reading/speaking time.",
        longDescription:
            "A comprehensive text analysis tool for writers, editors, students, and SEO specialists. Track live word count, character count (with and without spaces), sentence and paragraph counts, reading and speaking times, and top keyword density.",
        categoryId: "text",
        icon: "AlignLeft",
        tags: ["text", "word count", "character count", "writing", "analysis", "seo"],
        isPopular: true,
        seo: {
            title: "Advanced Word Counter — Professional Text Analysis & Time Estimation",
            description:
                "Free online word counter with advanced analysis. Track keyword density, reading time, and speaking time (WPM). Perfect for writers, scripters, and SEO.",
            keywords: ["advanced word counter", "word count with speaking time", "keyword density checker", "reading time calculator", "character counter online"],
        },
        howToSteps: [
            "Type or paste your article, essay, or video script into the main text editor.",
            "View instant totals for words, characters, characters without spaces, sentences, and paragraphs.",
            "Check the estimated Reading Time (200 WPM) and Speaking Time (130 WPM) for speeches and YouTube scripts.",
            "Inspect the Keyword Density panel to spot overused words and balance your topical vocabulary.",
        ],
        faqs: [
            {
                question: "How are reading time and speaking time calculated?",
                answer: "Reading time is calculated using the adult silent reading average of 200 words per minute (WPM), while speaking time uses the natural presentation pace of 130 words per minute.",
            },
            {
                question: "Does this word counter exclude stop words in the keyword density breakdown?",
                answer: "Yes. Common filler words (such as 'the', 'and', 'is', 'to', 'in') are filtered out of the keyword density list so you only see meaningful topical terms.",
            },
            {
                question: "What are the character limits for major social media platforms?",
                answer: "Standard posts are capped at 280 characters on X (free tier), 3,000 characters on LinkedIn posts, 2,200 characters on Instagram captions, and around 155–160 characters for Google meta descriptions.",
            },
        ],
        relatedToolSlugs: ["text-case-converter", "markdown-editor", "text-diff-checker"],
        affiliateIds: ["grammarly", "semrush"],
        relatedComparisonSlugs: ["beehiiv-vs-kit", "vidiq-vs-tubebuddy"],
        relatedAlternativeSlugs: ["semrush-alternatives"],
    },
    {
        id: "text-case-converter",
        name: "Text Case Converter",
        slug: "text-case-converter",
        description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, and more instantly.",
        longDescription:
            "Transform text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case with a single click. Built for both copywriters fixing capitalization and developers renaming variables.",
        categoryId: "text",
        icon: "CaseSensitive",
        tags: ["text", "case", "convert", "uppercase", "lowercase"],
        seo: {
            title: "Text Case Converter — UPPERCASE, lowercase & More",
            description:
                "Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case and more. Free instant text case converter.",
            keywords: ["text case converter", "uppercase converter", "lowercase converter", "title case converter", "camelcase converter"],
        },
        howToSteps: [
            "Paste or type the text you want to reformat into the input box.",
            "Click any case button — such as Sentence case, Title Case, camelCase, snake_case, or kebab-case.",
            "Review the transformed text immediately in the output area.",
            "Click 'Copy' to copy the converted string to your clipboard.",
        ],
        faqs: [
            {
                question: "What is the difference between camelCase, PascalCase, snake_case, and kebab-case?",
                answer: "camelCase starts with a lowercase letter and capitalizes subsequent words (myVariableName); PascalCase capitalizes every word (MyComponentName); snake_case separates lowercase words with underscores (my_column_name); and kebab-case separates lowercase words with hyphens (my-url-slug).",
            },
            {
                question: "When should I use Sentence case vs. Title Case?",
                answer: "Sentence case only capitalizes the first word of each sentence and proper nouns, whereas Title Case capitalizes the first letter of major words in headlines and page titles.",
            },
            {
                question: "Does converting case remove line breaks?",
                answer: "Standard case conversions (UPPERCASE, lowercase, Title Case, Sentence case) preserve your original line breaks and paragraph spacing.",
            },
        ],
        relatedToolSlugs: ["word-counter", "lorem-ipsum-generator", "text-diff-checker"],
        affiliateIds: ["grammarly"],
    },
    {
        id: "lorem-ipsum-generator",
        name: "Lorem Ipsum Generator",
        slug: "lorem-ipsum-generator",
        description: "Generate professional placeholder text with a twist: Classic, Funny, Football, or Egyptian styles.",
        longDescription:
            "Generate dummy filler text for UI wireframes, Figma mockups, and web templates. Choose between standard Latin Lorem Ipsum or themed variations, and specify the exact count of paragraphs, sentences, or words.",
        categoryId: "text",
        icon: "FileText",
        tags: ["text", "placeholder", "lorem ipsum", "generator", "design"],
        isNew: true,
        seo: {
            title: "Lorem Ipsum Generator — Professional & Theme Placeholder Text",
            description:
                "Generate custom Lorem Ipsum placeholder text for your designs. Choose from Classic, Funny, or Egyptian themes. Web-based, fast, and free.",
            keywords: ["lorem ipsum generator", "placeholder text", "filler text maker", "funny lorem ipsum", "egyptian lorem ipsum"],
        },
        howToSteps: [
            "Choose a placeholder text style (Classic Latin, Funny, Football, or Egyptian).",
            "Select whether you want to generate Paragraphs, Sentences, or Words, and enter the quantity.",
            "Click 'Generate' to create fresh filler copy.",
            "Copy the plain text or HTML-<p>-wrapped text into your design mockup or code.",
        ],
        faqs: [
            {
                question: "Where does standard Lorem Ipsum text originate?",
                answer: "Standard Lorem Ipsum is derived from sections 1.10.32 and 1.10.33 of Cicero's 45 BC philosophical treatise 'De finibus bonorum et malorum' (On the Ends of Good and Evil), used by typesetters since the 1500s.",
            },
            {
                question: "Why do designers use Lorem Ipsum instead of repeating 'Text here'?",
                answer: "Lorem Ipsum has a natural distribution of word lengths and letter frequencies similar to English prose, allowing designers to evaluate typography, line height, and visual hierarchy without readers getting distracted by the draft wording.",
            },
            {
                question: "Should I make sure all Lorem Ipsum is removed before launching a site?",
                answer: "Yes. Leaving placeholder Latin text on live production pages hurts user trust and can cause search engines to flag the page as thin or unfinished content.",
            },
        ],
        relatedToolSlugs: ["word-counter", "text-case-converter", "markdown-editor"],
        affiliateIds: ["adobe_express", "kittl"],
    },
    {
        id: "text-diff-checker",
        name: "Text Diff Checker",
        slug: "text-diff-checker",
        description: "Compare two pieces of text and find differences in lines or characters instantly.",
        longDescription:
            "Compare two blocks of text, configuration files, or code snippets side-by-side to highlight exact insertions, deletions, and modifications at the line, word, or character level — processed 100% locally in your browser.",
        categoryId: "text",
        icon: "FileSearch",
        tags: ["text", "diff", "compare", "code", "editing"],
        isPopular: true,
        seo: {
            title: "Text Diff Checker — Compare Text and Find Differences",
            description:
                "Free online text comparison tool. Highlight differences between two texts easily. Side-by-side view for additions and deletions.",
            keywords: ["text diff checker", "compare text online", "text difference finder", "diff tool", "check differences"],
        },
        howToSteps: [
            "Paste the original version of your text or code into the left ('Original Text') box.",
            "Paste the revised version into the right ('Modified Text') box.",
            "Select your comparison granularity (Lines, Words, or Characters).",
            "Inspect the color-coded diff output where green highlights additions and red highlights removals.",
        ],
        faqs: [
            {
                question: "Is it safe to compare confidential contracts or private source code here?",
                answer: "Yes. The diff algorithm runs entirely in your browser tab using client-side JavaScript. Neither text block is ever uploaded or logged.",
            },
            {
                question: "When should I use Word diff vs. Line diff?",
                answer: "Line diff works best for source code, JSON, and config files where changes happen line-by-line. Word or Character diff is better for prose, legal clauses, and paragraphs where a single word changed inside a long sentence.",
            },
            {
                question: "What do the green and red highlights mean?",
                answer: "Red (with strikethrough or minus indicators) marks text that was present in the original version but removed, while green marks new text added in the modified version.",
            },
        ],
        relatedToolSlugs: ["word-counter", "markdown-editor", "json-formatter"],
        affiliateIds: ["grammarly", "notion"],
    },

    // ─── Converters ────────────────────────────────────────────────
    {
        id: "unit-converter",
        name: "Unit Converter",
        slug: "unit-converter",
        description: "Convert between length, weight, temperature, area, and speed units instantly.",
        longDescription:
            "Convert measurements across Length, Weight/Mass, Temperature, Area, Volume, and Speed in real time. Supports both metric (SI) and imperial/US customary units with accurate conversion factors.",
        categoryId: "converter",
        icon: "ArrowLeftRight",
        tags: ["converter", "units", "length", "weight", "temperature"],
        isFeatured: true,
        seo: {
            title: "Unit Converter — Convert Length, Weight, Temperature & More",
            description:
                "Free online unit converter. Convert length, weight, temperature, area, volume and speed units instantly.",
            keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "metric converter"],
        },
        howToSteps: [
            "Select the measurement category tab (Length, Weight, Temperature, Area, Volume, or Speed).",
            "Choose your source ('From') unit and target ('To') unit, or view all converted units simultaneously.",
            "Type any numeric value into the input field to calculate the conversion immediately.",
            "Click any result to copy the converted number to your clipboard.",
        ],
        faqs: [
            {
                question: "How do you convert Celsius to Fahrenheit?",
                answer: "Multiply the Celsius temperature by 9/5 (or 1.8) and add 32. Conversely, to convert Fahrenheit to Celsius, subtract 32 and multiply by 5/9.",
            },
            {
                question: "What is the exact conversion between inches and centimeters?",
                answer: "By international agreement since 1959, 1 inch is defined as exactly 2.54 centimeters (25.4 millimeters).",
            },
            {
                question: "How many pounds are in a kilogram?",
                answer: "One kilogram equals approximately 2.20462262 avoirdupois pounds (and 1 pound equals exactly 0.45359237 kilograms).",
            },
        ],
        relatedToolSlugs: ["aspect-ratio-calculator", "color-converter", "unix-timestamp-converter"],
    },
    {
        id: "color-converter",
        name: "Color Code Converter",
        slug: "color-converter",
        description: "Convert colors between HEX, RGB, HSL, and CMYK formats with a live preview.",
        longDescription:
            "Translate color values seamlessly between HEX (#RRGGBB), RGB, HSL, HSV, and CMYK formats with a live color swatch preview. Built for UI designers, frontend developers, and print workflows.",
        categoryId: "converter",
        icon: "Droplets",
        tags: ["color", "hex", "rgb", "hsl", "converter"],
        seo: {
            title: "Color Code Converter — HEX, RGB, HSL, CMYK",
            description:
                "Convert color codes between HEX, RGB, HSL, HSV and CMYK instantly. Live color preview included. Free online color converter.",
            keywords: ["color converter", "hex to rgb", "rgb to hex", "color code converter", "hex color converter"],
        },
        howToSteps: [
            "Pick a color using the visual color picker or type a HEX, RGB, or HSL code into the input field.",
            "View the equivalent HEX, RGB, HSL, and CMYK values calculated automatically.",
            "Check the live color swatch preview and contrast appearance.",
            "Click 'Copy' next to any color notation to paste it into Figma, CSS, or Tailwind.",
        ],
        faqs: [
            {
                question: "When should I use HSL instead of HEX or RGB in CSS?",
                answer: "HSL (Hue, Saturation, Lightness) makes it easy to create consistent hover states, tints, and shades in CSS Variables — you can keep the Hue constant and simply adjust the Lightness percentage.",
            },
            {
                question: "Why do CMYK colors look slightly different from RGB/HEX on screen?",
                answer: "RGB and HEX are additive light models designed for digital screens, while CMYK (Cyan, Magenta, Yellow, Key/Black) is a subtractive ink model used for physical printing with a narrower color gamut.",
            },
            {
                question: "What is a 3-digit shorthand HEX color?",
                answer: "When each pair of digits in a 6-digit HEX code is identical (such as #FF8800), CSS allows a 3-digit shorthand (#F80), where each digit is duplicated.",
            },
        ],
        relatedToolSlugs: ["color-palette-generator", "css-gradient-generator", "box-shadow-generator"],
        affiliateIds: ["adobe_express", "kittl"],
    },

    // ─── Marketing Tools ───────────────────────────────────────────
    {
        id: "whatsapp-link-generator",
        name: "WhatsApp Link Generator",
        slug: "whatsapp-link-generator",
        description: "Generate instant chat links for WhatsApp with custom messages. Perfect for business ads and social media.",
        longDescription:
            "Create official wa.me click-to-chat WhatsApp links with a pre-filled greeting message. Customers can start a WhatsApp conversation with your business from Instagram bios, landing pages, or ads without saving your phone number first.",
        categoryId: "marketing",
        icon: "MessageCircle",
        tags: ["whatsapp", "marketing", "link generator", "business", "social media"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "WhatsApp Link Generator — Create Direct Chat Links Free",
            description:
                "Generate WhatsApp direct chat links with custom messages. Boost your business sales with easy-to-use WhatsApp links. No signup required.",
            keywords: ["whatsapp link generator", "create whatsapp link", "whatsapp direct link", "wa link", "whatsapp message link"],
        },
        howToSteps: [
            "Enter your full WhatsApp phone number including the country code (omit '+', zeroes, or dashes).",
            "Type an optional pre-filled message that will appear in the customer's chat box when they click the link.",
            "Preview how the chat bubble looks in the live simulator.",
            "Copy the generated wa.me URL to paste into your social bio, website button, or QR code.",
        ],
        faqs: [
            {
                question: "How should I format the phone number for a wa.me link?",
                answer: "Include your country code followed by the phone number using digits only — omit any leading '+', '00', parentheses, spaces, or hyphens (for example, 15551234567 for a US number).",
            },
            {
                question: "Does the recipient need to save my phone number in their contacts first?",
                answer: "No. That is the main benefit of a wa.me click-to-chat link — clicking it opens WhatsApp directly to a new chat thread with your number and pre-filled text.",
            },
            {
                question: "Do these WhatsApp links work on both mobile and WhatsApp Web?",
                answer: "Yes. On smartphones, the link opens the native WhatsApp app; on desktop computers, it opens WhatsApp Desktop or WhatsApp Web.",
            },
        ],
        relatedToolSlugs: ["qr-code-generator", "url-parser", "meta-tag-generator"],
    },
    {
        id: "meta-tag-generator",
        name: "Meta Tag Generator",
        slug: "meta-tag-generator",
        description: "Generate SEO-ready Meta Tags and Open Graph tags with real-time social media previews.",
        longDescription:
            "Generate complete HTML <head> meta tags — including title, description, robots directives, Open Graph (Facebook/LinkedIn), and X/Twitter Card tags — while previewing how your link will appear in Google search results and social feeds.",
        categoryId: "marketing",
        icon: "Search",
        tags: ["seo", "marketing", "meta tags", "open graph", "web development"],
        isFeatured: true,
        seo: {
            title: "Meta Tag Generator — SEO & Social Media Preview Tool",
            description:
                "Create perfect meta tags for your website. Preview how your site appears on Google, Facebook, and Twitter. Generate SEO-optimized code instantly.",
            keywords: ["meta tag generator", "social media preview", "og tag generator", "seo tags", "twitter card generator"],
        },
        howToSteps: [
            "Enter your page Title, Meta Description, Canonical URL, and Open Graph image URL.",
            "Watch the live Google SERP and social media card previews update as you type, keeping within recommended character counts.",
            "Configure robots indexing rules and author metadata.",
            "Copy the generated HTML <meta> tags and paste them inside the <head> of your webpage.",
        ],
        faqs: [
            {
                question: "What is the ideal length for an SEO title tag and meta description?",
                answer: "Keep title tags between 50 and 60 characters (under ~600 pixels wide) so Google doesn't truncate them in search results, and aim for 140 to 160 characters for meta descriptions.",
            },
            {
                question: "What dimensions should my Open Graph (og:image) image be?",
                answer: "The universal recommended size for og:image and summary_large_image Twitter cards is 1200×630 pixels (a 1.91:1 aspect ratio) in JPG, PNG, or WebP format under 5 MB.",
            },
            {
                question: "Does Google still use the <meta name='keywords'> tag for ranking?",
                answer: "Google officially stopped using the meta keywords tag as a ranking signal in 2009. Focus your effort on a clear <title>, a compelling <meta name='description'>, and semantic on-page headings.",
            },
        ],
        relatedToolSlugs: ["word-counter", "favicon-generator", "url-parser"],
        affiliateIds: ["semrush", "hostinger"],
        relatedComparisonSlugs: ["hostinger-vs-cloudways", "beehiiv-vs-kit"],
        relatedAlternativeSlugs: ["semrush-alternatives"],
    },

    // ─── Data Tools ────────────────────────────────────────────────
    {
        id: "json-csv-converter",
        name: "JSON to CSV / CSV to JSON",
        slug: "json-csv-converter",
        description: "Convert JSON data to CSV format or vice versa with a live editable table view.",
        longDescription:
            "Convert arrays of JSON objects into spreadsheet-ready CSV files or parse CSV files into structured JSON arrays. Includes an interactive table preview and processes files locally in your browser so sensitive datasets never touch an external server.",
        categoryId: "data",
        icon: "Table",
        tags: ["json", "csv", "data", "converter", "excel"],
        isFeatured: true,
        seo: {
            title: "JSON to CSV & CSV to JSON Converter — Editable Table View",
            description:
                "Free online JSON to CSV converter. Convert Excel/CSV to JSON instantly. Includes a live editable table preview. 100% private local processing.",
            keywords: ["json to csv", "csv to json", "excel to json", "convert json to csv", "data converter"],
        },
        howToSteps: [
            "Select conversion direction: 'JSON → CSV' or 'CSV → JSON'.",
            "Paste your data or upload a local .json / .csv file.",
            "Inspect the parsed rows and columns in the interactive table preview.",
            "Copy the converted output to your clipboard or download the resulting .csv or .json file.",
        ],
        faqs: [
            {
                question: "How are nested JSON objects handled when converting to a flat CSV table?",
                answer: "Nested keys are flattened into column headers or serialized cleanly so every row aligns with a consistent set of spreadsheet columns.",
            },
            {
                question: "Are commas or line breaks inside CSV cell values preserved?",
                answer: "Yes. Following RFC 4180 CSV rules, fields containing commas, double quotes, or newlines are automatically wrapped in escaped double quotes so columns do not shift.",
            },
            {
                question: "Is my spreadsheet or customer data uploaded anywhere?",
                answer: "No. All CSV parsing and JSON serialization execute locally in your browser using client-side JavaScript.",
            },
        ],
        relatedToolSlugs: ["json-formatter", "text-diff-checker", "uuid-generator"],
        affiliateIds: ["airtable"],
        relatedComparisonSlugs: ["beehiiv-vs-kit"],
    },

    // ─── Design Tools ──────────────────────────────────────────────
    {
        id: "color-palette-generator",
        name: "Color Palette from Image",
        slug: "color-palette-generator",
        description: "Extract beautiful color palettes and hex codes from any image or photo instantly.",
        longDescription:
            "Upload any photograph, illustration, or screenshot to automatically extract its dominant colors and complementary swatches. Click any extracted swatch to copy its HEX, RGB, or HSL code for your UI design or brand kit.",
        categoryId: "design",
        icon: "Droplets",
        tags: ["design", "color", "palette", "image", "extraction"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Color Palette Generator from Image — Extract Hex Codes",
            description:
                "Extract professional color palettes from your photos for free. Get dominant colors and hex codes instantly. 100% private and web-based tool.",
            keywords: ["color palette generator", "extract colors from image", "image color picker", "hex code extractor", "palette from photo"],
        },
        howToSteps: [
            "Upload or drag and drop any image file (JPG, PNG, or WebP) into the analyzer.",
            "Wait a fraction of a second while the color quantization algorithm identifies the dominant swatches.",
            "Browse the extracted palette showing Vibrant, Muted, Dark, and Light color tones.",
            "Click any color swatch to copy its HEX or RGB code directly to your clipboard.",
        ],
        faqs: [
            {
                question: "How does the tool pick dominant colors from a photo?",
                answer: "It samples pixel data on an HTML5 Canvas and runs a color quantization clustering algorithm to group similar pixels and isolate the most visually distinct vibrant, muted, light, and dark tones.",
            },
            {
                question: "Are uploaded inspiration images stored on a server?",
                answer: "No. Image pixel sampling happens entirely inside your browser's local memory.",
            },
            {
                question: "Can I convert the extracted HEX codes into HSL or CMYK?",
                answer: "Yes — copy any HEX code from the palette and open our Color Code Converter to get its exact HSL, HSV, and CMYK equivalents.",
            },
        ],
        relatedToolSlugs: ["color-converter", "css-gradient-generator", "image-compressor"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "svg-shape-generator",
        name: "SVG Blob & Wave Generator",
        slug: "svg-shape-generator",
        description: "Create unique SVG blobs and organic waves for your web designs and backgrounds.",
        longDescription:
            "Generate organic vector SVG blobs and section wave dividers for modern landing pages. Customize curve complexity, randomness, and colors, then copy the inline <svg> markup or download a scalable .svg file.",
        categoryId: "design",
        icon: "Shapes",
        tags: ["design", "svg", "blob", "wave", "background", "generator"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "SVG Blob & Wave Generator — Create Organic Shapes & Waves",
            description:
                "Generate custom SVG blobs and waves for free. Customize complexity and colors, then copy the SVG code or download the file. Perfect for modern web design.",
            keywords: ["svg blob generator", "svg wave maker", "organic shapes generator", "web design backgrounds", "css blobs"],
        },
        howToSteps: [
            "Switch between 'Blob' mode (organic shapes) and 'Wave' mode (horizontal section dividers).",
            "Adjust the complexity and smoothness sliders or click 'Randomize' to generate new Bezier curves.",
            "Pick a fill color or gradient to match your website's palette.",
            "Click 'Copy SVG' to paste the inline <svg> element into your HTML/React component, or download the .svg file.",
        ],
        faqs: [
            {
                question: "Why use SVG shapes instead of PNG background graphics?",
                answer: "SVGs are mathematical vector paths typically weighing less than 1 KB, and they scale to any screen size (including 4K and 5K displays) with zero pixelation.",
            },
            {
                question: "Can I animate SVG blobs in CSS or Framer Motion?",
                answer: "Yes. Because the exported SVG uses clean cubic Bezier <path> data, you can animate rotation, scale, or path morphing using CSS keyframes or Framer Motion.",
            },
            {
                question: "How do I use an SVG wave as a section divider between two page blocks?",
                answer: "Place the wave SVG at the top or bottom of a section with 'display: block; width: 100%;' and set its fill color to match the background color of the adjacent section.",
            },
        ],
        relatedToolSlugs: ["css-gradient-generator", "glassmorphism-generator", "box-shadow-generator"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "box-shadow-generator",
        name: "CSS Box Shadow Generator",
        slug: "box-shadow-generator",
        description: "Create beautiful CSS box shadows visually with real-time preview and code export.",
        longDescription:
            "Craft smooth, natural CSS box-shadow declarations visually. Adjust horizontal/vertical offsets, blur radius, spread radius, shadow opacity, and inset mode with an interactive preview card and instant CSS copy.",
        categoryId: "design",
        icon: "Box",
        tags: ["design", "css", "shadow", "frontend", "ui"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "CSS Box Shadow Generator — Visual Shadow Builder",
            description:
                "Build professional CSS box shadows visually. Adjust offsets, blur, and spread with a live preview. Copy clean CSS code for your projects. Free and online.",
            keywords: ["css box shadow generator", "box shadow maker", "css shadow builder", "ui depth tool", "frontend design"],
        },
        howToSteps: [
            "Use the sliders to adjust Horizontal Offset (X), Vertical Offset (Y), Blur Radius, and Spread Radius.",
            "Pick the shadow color, opacity, and background/card preview colors.",
            "Toggle 'Inset' if you want an inner recessed shadow instead of an outer drop shadow.",
            "Copy the generated box-shadow CSS property into your stylesheet.",
        ],
        faqs: [
            {
                question: "What is the syntax order of values in a CSS box-shadow property?",
                answer: "The order is: [inset] <offset-x> <offset-y> <blur-radius> <spread-radius> <color> — for example, 'box-shadow: 0px 10px 25px -5px rgba(0, 0, 0, 0.2);'.",
            },
            {
                question: "How do you make a CSS drop shadow look soft and natural?",
                answer: "Use a larger blur radius (20px–40px) paired with a low shadow opacity (5%–15%) and a negative spread radius (-4px to -8px) so the shadow appears cast from an overhead light source.",
            },
            {
                question: "What is the difference between CSS box-shadow and filter: drop-shadow()?",
                answer: "box-shadow always casts a rectangular shadow around the element's CSS border box, whereas filter: drop-shadow() follows the alpha transparency contour of a PNG or SVG image.",
            },
        ],
        relatedToolSlugs: ["glassmorphism-generator", "css-gradient-generator", "color-converter"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "signature-pad",
        name: "Digital Signature Pad",
        slug: "signature-pad",
        description: "Create and download professional digital signatures as transparent PNGs.",
        longDescription:
            "Draw your handwritten signature smoothly using a mouse, trackpad, stylus, or touchscreen, customize ink color and stroke width, and download a high-resolution PNG with a transparent background for PDFs and documents.",
        categoryId: "design",
        icon: "PenTool",
        tags: ["design", "signature", "office", "productivity", "png"],
        isNew: true,
        seo: {
            title: "Online Digital Signature Pad — Create Transparent Signatures",
            description:
                "Create your digital signature online for free. Draw with touch or mouse, adjust style, and download as a transparent PNG. Fast, secure, and private.",
            keywords: ["digital signature pad", "online signature maker", "draw signature online", "signature png generator", "electronic signature"],
        },
        howToSteps: [
            "Select your preferred ink color (black, navy blue, or custom) and stroke thickness.",
            "Draw your signature inside the canvas pad using your finger, stylus, trackpad, or mouse.",
            "Use 'Clear' to redraw until you are happy with the stroke.",
            "Click 'Download PNG' to save the signature with a transparent background ready to place over PDF lines.",
        ],
        faqs: [
            {
                question: "Is my drawn signature saved on any server?",
                answer: "No. Your signature is drawn directly on an HTML5 Canvas inside your browser and exported locally to your device. No stroke data or image is ever transmitted.",
            },
            {
                question: "Why is a transparent PNG better than a JPG for signatures?",
                answer: "A JPG always has a solid white rectangle background that covers up the signature line or text underneath it on a document, whereas a transparent PNG lets the document lines show cleanly through.",
            },
            {
                question: "What is the difference between an electronic signature image and a cryptographic digital signature?",
                answer: "An electronic signature image is a visual representation of your handwritten mark placed on a document. If a contract requires cryptographic certificate verification or an audit trail, you should use a dedicated e-signature platform.",
            },
        ],
        relatedToolSlugs: ["image-compressor", "webp-converter", "pomodoro-timer"],
        affiliateIds: ["notion"],
    },
    {
        id: "glassmorphism-generator",
        name: "CSS Glassmorphism Generator",
        slug: "glassmorphism-generator",
        description: "Create modern frosted-glass effects with real-time preview and clean CSS export.",
        longDescription:
            "Build frosted-glass UI cards using CSS backdrop-filter. Fine-tune blur radius, background translucency, saturation, and subtle border highlights against a vivid background preview, then copy cross-browser CSS.",
        categoryId: "design",
        icon: "Layers",
        tags: ["design", "css", "glassmorphism", "ui", "ux"],
        isNew: true,
        seo: {
            title: "CSS Glassmorphism Generator — Design Modern Glass UI Effects",
            description:
                "Build professional frosted-glass UI effects visually. Adjust blur, transparency, and borders with a live moving background preview. Copy clean CSS code instantly.",
            keywords: ["glassmorphism generator", "css glass effect", "frosted glass css", "ui design trends", "backdrop blur generator"],
        },
        howToSteps: [
            "Adjust the 'Blur' slider to control the intensity of the CSS backdrop-filter blur.",
            "Tune the 'Transparency' slider to set the alpha channel of the glass surface.",
            "Adjust border opacity and color to give the card a realistic light-catching edge.",
            "Copy the generated CSS (including -webkit-backdrop-filter for Safari compatibility) into your project.",
        ],
        faqs: [
            {
                question: "Why isn't backdrop-filter blurring what's behind my element?",
                answer: "For backdrop-filter to be visible, the element itself must have a semi-transparent background (e.g., rgba(255, 255, 255, 0.1)) and there must be colorful content or shapes positioned behind it.",
            },
            {
                question: "Do I still need -webkit-backdrop-filter in CSS?",
                answer: "Including both '-webkit-backdrop-filter' and 'backdrop-filter' ensures full compatibility across older iOS Safari versions alongside modern Chrome, Firefox, and Edge.",
            },
            {
                question: "Does heavy backdrop-filter blur affect scrolling performance?",
                answer: "Applying large blur radii (>24px) to many overlapping or full-screen elements can increase GPU compositing work on mobile devices. Keep glassmorphism focused on key cards and navigation bars.",
            },
        ],
        relatedToolSlugs: ["box-shadow-generator", "css-gradient-generator", "svg-shape-generator"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },
    {
        id: "aspect-ratio-calculator",
        name: "Aspect Ratio Calculator",
        slug: "aspect-ratio-calculator",
        description: "Calculate dimensions and ratios for video, images, and UI layouts instantly.",
        longDescription:
            "Find the simplified aspect ratio of any pixel dimensions or calculate the missing width/height needed to scale videos and images proportionally. Includes one-click presets for 16:9 (YouTube/HD), 9:16 (Shorts/Reels/TikTok), 4:5, 4:3, and 1:1.",
        categoryId: "design",
        icon: "Maximize",
        tags: ["design", "aspect ratio", "video", "image", "resolution"],
        isNew: true,
        seo: {
            title: "Aspect Ratio Calculator — Identify Ratios & Calculate Dimensions",
            description:
                "Free online aspect ratio calculator. Identify 16:9, 4:3, 9:16 ratios and calculate missing dimensions for video and images instantly.",
            keywords: ["aspect ratio calculator", "16:9 calculator", "calculate resolution", "video aspect ratio", "image ratio finder"],
        },
        howToSteps: [
            "Pick a common preset (such as 16:9 Landscape, 9:16 Vertical, or 4:5 Portrait) or enter a custom Width and Height.",
            "Lock the ratio and enter your new target Width (or Height) to calculate the exact matching dimension.",
            "Check the visual frame preview to see the proportions of your chosen aspect ratio.",
            "Copy the calculated pixel dimensions or CSS aspect-ratio rule.",
        ],
        faqs: [
            {
                question: "What are the standard pixel dimensions for 16:9 video?",
                answer: "Common 16:9 resolutions are 1280×720 (720p HD), 1920×1080 (1080p Full HD), 2560×1440 (1440p QHD), and 3840×2160 (4K UHD).",
            },
            {
                question: "What aspect ratio should I use for YouTube Shorts, TikTok, and Instagram Reels?",
                answer: "Vertical short-form videos use a 9:16 aspect ratio, most commonly exported at 1080×1920 pixels.",
            },
            {
                question: "How is the simplified aspect ratio calculated from width and height?",
                answer: "The calculator finds the Greatest Common Divisor (GCD) of the width and height using Euclid's algorithm and divides both numbers by that GCD (for example, 1920 and 1080 both divide by 120 to give 16:9).",
            },
        ],
        relatedToolSlugs: ["youtube-thumbnail-downloader", "image-compressor", "unit-converter"],
        affiliateIds: ["adobe_express", "kittl"],
        relatedComparisonSlugs: ["vidiq-vs-tubebuddy"],
        relatedAlternativeSlugs: ["canva-alternatives"],
    },

    // ─── Video Tools ───────────────────────────────────────────────
    {
        id: "screen-recorder",
        name: "Online Screen Recorder",
        slug: "screen-recorder",
        description: "Record your screen and microphone audio directly in the browser as a WebM video with no watermarks.",
        longDescription:
            "Capture your entire desktop, a specific application window, or a browser tab with optional audio using the native browser getDisplayMedia and MediaRecorder APIs. Recordings are encoded locally in your browser as WebM (VP9/Opus) at an ideal 30 fps with no watermarks.",
        categoryId: "video",
        icon: "Monitor",
        tags: ["video", "screen record", "tutorial", "presentation", "productivity"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Free Online Screen Recorder — Browser WebM Video Capture",
            description:
                "Record your screen and audio online for free in your browser. No software installation and no watermarks — download recordings directly as WebM.",
            keywords: ["screen recorder online", "free screen recorder", "no watermark screen recorder", "record screen browser", "video capture tool"],
        },
        howToSteps: [
            "Toggle 'Mic ON' or 'Muted' before starting to choose whether microphone/system audio is captured.",
            "Click 'Start Recording' and pick a Browser Tab, Window, or Entire Screen in your browser's permission prompt.",
            "Click 'Stop Recording' (or stop sharing from the browser bar) when you finish demonstrating your workflow.",
            "Preview the recorded clip in the video player and click 'Download WebM' to save it to your device, or 'Discard' to record again.",
        ],
        faqs: [
            {
                question: "Are my screen recordings uploaded to any external server?",
                answer: "No. Recording uses your browser's native navigator.mediaDevices.getDisplayMedia and MediaRecorder APIs. Video chunks are held in your browser's local memory and downloaded directly to your device.",
            },
            {
                question: "What video format and frame rate does this recorder output?",
                answer: "The recorder requests an ideal frame rate of 30 fps and encodes video using the WebM container format (video/webm;codecs=vp9,opus).",
            },
            {
                question: "Why does screen recording require a desktop browser?",
                answer: "The browser Screen Capture API (getDisplayMedia) is supported on desktop browsers that implement WebM/VP9 MediaRecorder capture (such as Chrome and Edge), whereas mobile browsers generally do not support web-based system screen capture.",
            },
        ],
        relatedToolSlugs: ["aspect-ratio-calculator", "youtube-thumbnail-downloader", "pomodoro-timer"],
    },

    // ─── Productivity ──────────────────────────────────────────────
    {
        id: "pomodoro-timer",
        name: "Pomodoro Study Timer",
        slug: "pomodoro-timer",
        description: "Boost your productivity with the classic 25/5 Pomodoro technique. Focus more, stress less.",
        longDescription:
            "Stay focused during coding, writing, or study sessions using structured 25-minute deep-work intervals followed by 5-minute short breaks and 15-minute long breaks. Includes customizable timers, session tracking, and audio notifications.",
        categoryId: "productivity",
        icon: "Timer",
        tags: ["productivity", "timer", "pomodoro", "focus", "study"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Online Pomodoro Timer — Focus & Study Productivity Tool",
            description:
                "Boost your focus with our free online Pomodoro timer. Classic 25/5 intervals, customizable settings, and break alerts. The ultimate productivity tool for deep work.",
            keywords: ["pomodoro timer", "study timer", "focus timer", "online productivity tool", "pomodoro technique website"],
        },
        howToSteps: [
            "Select 'Focus' (25 minutes), 'Short Break' (5 minutes), or 'Long Break' (15 minutes).",
            "Click 'Start' to begin the countdown timer for your current task.",
            "Work on a single task without switching tabs until the audio chime sounds.",
            "Take a 5-minute break after each focus block, and a longer 15-minute break after completing 4 focus sessions.",
        ],
        faqs: [
            {
                question: "What is the Pomodoro Technique?",
                answer: "Developed by Francesco Cirillo in the late 1980s, the Pomodoro Technique breaks work into focused 25-minute intervals ('pomodoros') separated by 5-minute breaks to prevent mental fatigue and context switching.",
            },
            {
                question: "Does the timer keep running if I switch to another browser tab?",
                answer: "Yes. The timer tracks elapsed time and plays a Web Audio chime when your focus or break session ends.",
            },
            {
                question: "Can I customize the focus and break durations?",
                answer: "Yes. While 25/5/15 is the classic cadence, many developers prefer 50-minute focus blocks with 10-minute breaks when working on complex code.",
            },
        ],
        relatedToolSlugs: ["word-counter", "markdown-editor", "screen-recorder"],
        affiliateIds: ["notion"],
    },
    // ─── Marketing: UTM Campaign Builder ─────────────────────────
    {
        id: "utm-builder",
        name: "UTM Campaign Builder",
        slug: "utm-builder",
        description: "Generate tracking-ready campaign URLs with standard Google Analytics UTM parameters.",
        longDescription:
            "Create standardized, error-free UTM tracking URLs for marketing campaigns, newsletters, ad groups, and social promotions. Easily add campaign source, medium, campaign name, term, and content parameters to track conversions accurately in Google Analytics 4 (GA4) and attribution dashboards.",
        categoryId: "marketing",
        icon: "Link2",
        tags: ["utm", "campaign", "marketing", "analytics", "tracking", "url builder"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Free UTM Campaign Builder — Generate Google Analytics Tracking URLs | RapidKit",
            description: "Easily generate UTM tracking URLs for Google Analytics, newsletters, and ad campaigns. Free, instant, and 100% client-side.",
            keywords: ["utm builder", "campaign url builder", "google analytics utm generator", "utm tracking link builder", "utm parameters creator"],
        },
        howToSteps: [
            "Enter your destination website landing page URL.",
            "Specify the campaign source (e.g. google, newsletter, twitter) and medium (e.g. cpc, email, social).",
            "Optionally add campaign name, search term keywords, and content identifier for A/B testing.",
            "Click 'Copy URL' to paste into your ads, email blasts, or social media posts.",
        ],
        faqs: [
            {
                question: "What are UTM parameters and why are they important?",
                answer: "UTM (Urchin Tracking Module) parameters are five standard query parameters added to URLs. When a visitor clicks the link, web analytics tools like Google Analytics 4 (GA4) read these parameters to pinpoint exactly which campaign, channel, and creative delivered the visitor and conversion.",
            },
            {
                question: "Which UTM parameters are strictly required?",
                answer: "At minimum, your destination URL and utm_source are required. For paid advertising and structured campaigns, Google Analytics also strongly recommends utm_medium and utm_campaign to categorize traffic into standard channel groups (e.g., Paid Search, Email, Organic Social).",
            },
            {
                question: "Should UTM codes be capitalized or lowercase?",
                answer: "Always use lowercase letters for UTM parameters. Analytics tools treat URLs case-sensitively, so 'Email', 'email', and 'EMAIL' would be reported as three separate channels, fragmenting your campaign data.",
            },
            {
                question: "Can I use UTM parameters on internal site links?",
                answer: "No. You should never use UTM codes on internal links between pages on your own website. Doing so overrides the original acquisition source and resets the user session, corrupting your analytics attribution.",
            },
        ],
        relatedToolSlugs: ["meta-tag-generator", "whatsapp-link-generator", "qr-code-generator"],
        affiliateIds: ["beehiiv", "semrush"],
    },
    // ─── Developer: Robots.txt Generator ─────────────────────────
    {
        id: "robots-txt-generator",
        name: "Robots.txt Generator",
        slug: "robots-txt-generator",
        description: "Generate standard robots.txt files with crawl directives, custom user-agents, and XML sitemaps.",
        longDescription:
            "Create a valid robots.txt file to guide search engine crawlers, manage crawl budgets, and prevent indexation of private folders. Easily configure default allow/disallow policies, set custom crawl-delays, block aggressive AI scraping bots (GPTBot, ClaudeBot, CCBot), and specify your XML sitemap URL.",
        categoryId: "developer",
        icon: "FileCode",
        tags: ["robots.txt", "seo", "crawlers", "developer", "search engines", "sitemap"],
        isNew: true,
        isPopular: true,
        seo: {
            title: "Free Robots.txt Generator — Create SEO Crawler Directives | RapidKit",
            description: "Generate clean, search-engine compliant robots.txt files in seconds. Customize allow/disallow rules, sitemap directives, and block AI bots.",
            keywords: ["robots txt generator", "create robots txt online", "seo robots file creator", "search engine crawler directives", "block ai bot robots txt"],
        },
        howToSteps: [
            "Select your default crawler access policy (Allow all or Disallow all).",
            "Optionally toggle 'Block AI Training Bots' to protect content from unauthorized LLM scrapers.",
            "Add specific paths to disallow (e.g. /admin/, /api/) or allow (e.g. /public/).",
            "Provide your XML Sitemap URL and copy or download the generated robots.txt file.",
            "Upload the file to the root directory of your web server (https://yourdomain.com/robots.txt).",
        ],
        faqs: [
            {
                question: "What is a robots.txt file?",
                answer: "A robots.txt file is a plaintext file placed in your website root directory that tells web crawlers (like Googlebot and Bingbot) which URLs they can or cannot request from your site. It is primarily used to manage crawl traffic and prevent overload on non-public pages.",
            },
            {
                question: "Does robots.txt guarantee a page won't appear in Google search results?",
                answer: "No. Robots.txt prevents search engines from crawling the page, but if other websites link to that URL with descriptive anchor text, Google can still index the URL. To guarantee a page is never indexed, use a noindex meta robots tag or require user authentication.",
            },
            {
                question: "Where should the robots.txt file be placed?",
                answer: "The robots.txt file must be uploaded to the top-level root directory of your website domain, accessible at https://yourdomain.com/robots.txt. It cannot be placed in a subdirectory.",
            },
            {
                question: "Why should I consider blocking AI scrapers in robots.txt?",
                answer: "Many webmasters block AI crawlers like GPTBot, ClaudeBot, and CCBot to prevent their proprietary written content, code, or images from being ingested into generative AI training datasets without compensation or attribution.",
            },
        ],
        relatedToolSlugs: ["meta-tag-generator", "json-formatter", "url-parser"],
        affiliateIds: ["hostinger"],
    },
    // ─── Developer: JWT Decoder ──────────────────────────────────
    {
        id: "jwt-decoder",
        name: "JSON Web Token (JWT) Decoder",
        slug: "jwt-decoder",
        description: "Decode and inspect JSON Web Tokens (JWT) client-side with expiration check and formatted claims.",
        longDescription:
            "Decode, debug, and inspect JSON Web Tokens (JWTs) client-side in real time. Instantly parse the Base64URL-encoded header, payload claims, expiration timestamps, algorithm type, and token validity without transmitting your credentials or tokens across the internet.",
        categoryId: "developer",
        icon: "KeyRound",
        tags: ["jwt", "jwt decoder", "token", "auth", "developer", "security", "base64"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Online JWT Decoder — Decode JSON Web Tokens Client-Side | RapidKit",
            description: "Fast, secure client-side JWT decoder. Inspect header and payload claims, check expiration dates, and debug auth tokens safely in your browser.",
            keywords: ["jwt decoder", "decode jwt online", "json web token inspector", "jwt payload viewer", "client side jwt debugger"],
        },
        howToSteps: [
            "Paste your JSON Web Token string into the input box.",
            "The tool automatically splits the token into Header, Payload, and Signature parts.",
            "Review formatted JSON claims, signing algorithm, and expiration status.",
            "Click 'Copy' to grab the decoded payload or header JSON for debugging.",
        ],
        faqs: [
            {
                question: "What is a JSON Web Token (JWT)?",
                answer: "A JSON Web Token (JWT) is an open industry standard (RFC 7519) for securely transmitting information between parties as a compact, self-contained JSON object. It is widely used in modern web applications for user authentication and API authorization.",
            },
            {
                question: "Is it safe to decode my JWT here?",
                answer: "Yes, 100% safe. This tool performs all Base64URL decoding and JSON formatting entirely in your local browser memory using client-side JavaScript. Your token is never uploaded, logged, or sent to any server.",
            },
            {
                question: "Does this tool verify the cryptographic signature?",
                answer: "No. Decoding a JWT reads the claims contained in the header and payload, but validating the cryptographic signature requires the server's private key or secret. For security reasons, never paste your private signing keys into web tools.",
            },
            {
                question: "What do 'iat' and 'exp' claims mean in a JWT?",
                answer: "'iat' stands for 'Issued At' and indicates the Unix epoch timestamp when the token was generated. 'exp' stands for 'Expiration Time', after which the token is invalid and must be rejected by authentication servers.",
            },
        ],
        relatedToolSlugs: ["base64-converter", "uuid-generator", "unix-timestamp-converter"],
        affiliateIds: ["hostinger"],
    },
    // ─── Developer: Web Code Playground ───────────────────────────
    {
        id: "web-code-playground",
        name: "Web Code Playground (HTML/CSS/JS Compiler)",
        slug: "web-code-playground",
        description: "Interactive real-time frontend code playground. Write and compile HTML, CSS, and JavaScript client-side with instant preview.",
        longDescription:
            "Write, compile, and preview HTML, CSS, and modern JavaScript in a high-performance, real-time client-side development playground. Featuring dual grid and tabbed layout modes, isolated sandboxed iframe execution, one-click HTML export, and zero server logging.",
        categoryId: "developer",
        icon: "Code2",
        tags: ["html", "css", "javascript", "compiler", "playground", "developer", "frontend", "editor"],
        isNew: true,
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "Online Web Code Playground — HTML, CSS & JS Compiler | RapidKit",
            description: "Run and test HTML, CSS, and JavaScript in real time with an instant sandboxed preview. 100% free, private, client-side frontend code compiler.",
            keywords: ["html compiler online", "javascript playground", "css playground", "web code editor online", "frontend compiler", "html css js runner"],
        },
        howToSteps: [
            "Write or paste your markup in the HTML editor.",
            "Add design and animation rules in the CSS editor.",
            "Write script logic or DOM interactions in the JavaScript editor.",
            "Watch your web page render instantly in the live sandboxed preview pane.",
            "Click 'Download .html' to export your runnable code as a single standalone file.",
        ],
        faqs: [
            {
                question: "What is a frontend code playground?",
                answer: "A frontend code playground is an interactive development environment that lets you write HTML markup, CSS styling, and JavaScript logic simultaneously, rendering the resulting web application live in an isolated preview frame without needing a local build setup.",
            },
            {
                question: "How does the sandboxed srcDoc ensure security?",
                answer: "The preview window executes your code inside an isolated HTML iframe configured with strict sandbox attributes ('allow-scripts allow-modals'). This isolates your script execution in a separate security context, preventing malicious code from accessing your parent browser session or cookies.",
            },
            {
                question: "Does my code run completely in the browser?",
                answer: "Yes, 100%. All compilation, concatenation, and rendering occur entirely in your local browser memory using native Web APIs. No code is transmitted to, stored on, or logged by any remote server.",
            },
            {
                question: "Can I export or save my work?",
                answer: "Absolutely. Click the 'Download .html' button to export your combined HTML, CSS, and JavaScript into a single, fully functional standalone HTML file that you can host anywhere or open locally in any browser.",
            },
        ],
        relatedToolSlugs: ["markdown-editor", "json-formatter", "code-to-image"],
        affiliateIds: ["hostinger"],
    },
    {
        id: "prompt-studio",
        name: "AI Prompt Studio",
        slug: "prompt-studio",
        description: "Build high-performance, structured AI prompts for developers and marketers using the Role-Task-Context-Format framework.",
        longDescription:
            "RapidKit AI Prompt Studio is a professional, 100% client-side prompt engineering environment. Construct precise, structured prompts for ChatGPT, Claude, Gemini, and DeepSeek using the proven Role-Task-Context-Format (RTCF) framework. Features instant live preview, multi-language prompt output, niche developer and marketer presets, and zero server logging.",
        categoryId: "productivity",
        icon: "Sparkles",
        tags: ["ai", "prompt", "prompt engineering", "productivity", "chatgpt", "claude", "developer", "marketing"],
        isNew: true,
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "AI Prompt Studio — Structured Prompt Builder for Developers & Marketers | RapidKit",
            description:
                "Generate structured, production-ready AI prompts using the Role-Task-Context-Format framework. Free, 100% client-side, no signup required.",
            keywords: [
                "ai prompt studio",
                "prompt generator",
                "prompt builder",
                "chatgpt prompt generator",
                "claude prompt framework",
                "role task context format prompt",
                "ai prompt engineering tool",
            ],
        },
        howToSteps: [
            "Choose a Quick Preset or enter a target Role / Persona for the AI model.",
            "Define the specific Task or Objective you need accomplished.",
            "Add Context and Constraints such as tech stack, tone, style rules, or edge cases to avoid.",
            "Specify your desired Output Format (Markdown table, JSON, code diff, or email draft).",
            "Select your preferred Output Language and click 'Copy Prompt to Clipboard'.",
        ],
        faqs: [
            {
                question: "What is the Role-Task-Context-Format (RTCF) prompt framework?",
                answer: "The RTCF framework is a proven prompt engineering methodology that structures instructions into four distinct pillars: defining who the AI should act as (Role), what it must achieve (Task), what boundaries and technical environment it operates within (Context & Constraints), and the exact structure of its response (Format). This structure eliminates ambiguity and consistently generates senior-level output across all major LLMs.",
            },
            {
                question: "Why do specific constraints yield better AI code and copy?",
                answer: "Large language models operate by predicting the most statistically probable continuation of your input. Without explicit constraints, models default to generic, generalized answers. Specifying exact constraints (e.g. library versions, strict TypeScript rules, word limits, or avoiding clichés) forces the model to prune irrelevant possibilities and focus its parameter attention on production-ready, highly tailored solutions.",
            },
            {
                question: "Is my prompt data processed locally or sent to external servers?",
                answer: "Your prompt construction runs 100% locally in your web browser. RapidKit never sends, stores, or logs your prompts, proprietary business context, or code on any external server. Everything stays completely private on your device.",
            },
            {
                question: "Can I use these prompts across ChatGPT, Claude, Gemini, and DeepSeek?",
                answer: "Yes. Prompts engineered with RapidKit AI Prompt Studio adhere to universally recognized LLM prompting standards and work seamlessly with OpenAI ChatGPT (GPT-4o, o1), Anthropic Claude 3.5 Sonnet, Google Gemini 1.5/2.0, DeepSeek R1/V3, and open-source models running locally on Ollama or LM Studio.",
            },
        ],
        relatedToolSlugs: ["web-code-playground", "markdown-editor", "utm-builder"],
        affiliateIds: ["beehiiv", "semrush"],
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

export function getRelatedToolsForTool(tool: Tool): Tool[] {
    const explicit = tool.relatedToolSlugs
        .map((slug) => TOOLS.find((t) => t.slug === slug))
        .filter((t): t is Tool => Boolean(t));

    if (explicit.length > 0) return explicit;

    return TOOLS.filter((t) => t.categoryId === tool.categoryId && t.id !== tool.id).slice(0, 3);
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
