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
    {
        id: "marketing",
        name: "Marketing Tools",
        slug: "marketing",
        icon: "Megaphone",
        color: "#EC4899",
        gradient: "from-pink-500 to-rose-600",
    },
    {
        id: "data",
        name: "Data Tools",
        slug: "data",
        icon: "Database",
        color: "#6366F1",
        gradient: "from-indigo-500 to-blue-600",
    },
    {
        id: "design",
        name: "Design Tools",
        slug: "design",
        icon: "Palette",
        color: "#F43F5E",
        gradient: "from-rose-500 to-pink-600",
    },
    {
        id: "video",
        name: "Video Tools",
        slug: "video",
        icon: "Video",
        color: "#F43F5E",
        gradient: "from-rose-500 to-red-600",
    },
    {
        id: "productivity",
        name: "Productivity",
        slug: "productivity",
        icon: "Clock",
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
    {
        id: "lorem-ipsum-generator",
        name: "Lorem Ipsum Generator",
        slug: "lorem-ipsum-generator",
        description: "Generate professional placeholder text with a twist: Classic, Funny, Football, or Egyptian styles.",
        longDescription:
            "The ultimate placeholder text generator for developers and designers. Choose between the classic Latin Lorem Ipsum or have some fun with themed text like Funny, Football, or Egyptian styles. Customize the number of paragraphs, sentences, or words to fit your project exactly.",
        categoryId: "text",
        icon: "FileText",
        tags: ["text", "placeholder", "lorem ipsum", "generator", "design"],
        isNew: true,
        seo: {
            title: "Lorem Ipsum Generator — Professional & Theme Placeholder Text | RapidKit",
            description:
                "Generate custom Lorem Ipsum placeholder text for your designs. Choose from Classic, Funny, or Egyptian themes. Web-based, fast, and free.",
            keywords: ["lorem ipsum generator", "placeholder text", "filler text maker", "funny lorem ipsum", "egyptian lorem ipsum"],
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
    {
        id: "qr-code-generator",
        name: "QR Code Generator",
        slug: "qr-code-generator",
        description: "Generate highly customizable QR codes for URLs, Wi-Fi, and text with custom colors and logo support.",
        longDescription:
            "Create professional QR codes in seconds. Our tool supports standard URLs, Wi-Fi configuration (scan-to-join), and plain text. Fully customize your QR code with your brand colors and add a custom logo in the center. High-quality PNG and SVG export supported.",
        categoryId: "developer",
        icon: "QrCode",
        tags: ["qr code", "generator", "marketing", "wifi", "design"],
        isFeatured: true,
        isNew: true,
        seo: {
            title: "Free QR Code Generator — Create Custom QR Codes with Logo | RapidKit",
            description:
                "Generate custom QR codes online for free. Support for URLs, Wi-Fi, and text. Customize colors and add logos. High-quality downloads.",
            keywords: ["qr code generator", "create qr code", "qr code with logo", "wifi qr code", "custom qr code"],
        },
    },
    {
        id: "cron-job-generator",
        name: "Cron Job Generator",
        slug: "cron-job-generator",
        description: "Visual editor to create Cron schedules and expressions with human-readable explanations.",
        longDescription:
            "Never struggle with crontab syntax again. Our visual Cron Job Generator allows you to easily create complex schedules—from simple 'every minute' to specific times like 'every Friday at 5 PM'. Get the exact cron expression and a clear human-readable description of what your job will do. Essential for sysadmins and backend developers.",
        categoryId: "developer",
        icon: "Clock",
        tags: ["developer", "cron", "backend", "sysadmin", "scheduler"],
        isNew: true,
        seo: {
            title: "Cron Job Generator — Visual Crontab Expression Builder | RapidKit",
            description:
                "Create Cron schedules visually. Generate cron expressions for Linux, AWS, and server tasks. Human-readable explanations included. Fast, free, and online.",
            keywords: ["cron job generator", "crontab generator", "cron expression builder", "schedular tool", "cron syntax"],
        },
    },
    {
        id: "unix-timestamp-converter",
        name: "Unix Timestamp Converter",
        slug: "unix-timestamp-converter",
        description: "Convert Unix timestamps to human-readable dates and vice versa with live epoch tracking.",
        longDescription:
            "A must-have tool for backend developers and sysadmins. Effortlessly convert Unix epoch timestamps (seconds and milliseconds) to readable date formats and back. Features a real-time live timestamp clock, timezone awareness (Local and UTC), and quick copy for debugging and logging. Perfect for troubleshooting API responses and database records.",
        categoryId: "developer",
        icon: "Hash",
        tags: ["developer", "unix", "timestamp", "epoch", "backend"],
        isNew: true,
        seo: {
            title: "Unix Timestamp Converter — Epoch Time & Date Tool | RapidKit",
            description:
                "Convert Unix timestamps to human-readable dates online. Real-time live epoch clock, UTC support, and date-to-timestamp conversion. Free for developers.",
            keywords: ["unix timestamp converter", "epoch converter", "unix time to date", "current unix timestamp", "timestamp to utc"],
        },
    },
    {
        id: "uuid-generator",
        name: "UUID / GUID Generator",
        slug: "uuid-generator",
        description: "Generate bulk unique IDs (v4) for your database keys and development needs.",
        longDescription:
            "Create cryptographically strong unique identifiers instantly. Whether you need a single UUID v4 for a database record or a bulk list of 100 IDs for testing, our tool handles it with ease. Featuring copy-to-clipboard functionality and text file exports, it is the perfect companion for backend developers and database administrators.",
        categoryId: "developer",
        icon: "Fingerprint",
        tags: ["developer", "uuid", "guid", "database", "security"],
        isNew: true,
        seo: {
            title: "Online UUID / GUID Generator — Bulk V4 Unique IDs | RapidKit",
            description:
                "Generate unique UUID v4 identifiers online for free. Support for bulk generation, copy to clipboard, and text file export. Fast, secure, and developer-friendly.",
            keywords: ["uuid generator", "guid generator", "v4 uuid", "generate unique ids", "bulk uuid maker"],
        },
    },
    {
        id: "markdown-editor",
        name: "Markdown Editor & Preview",
        slug: "markdown-editor",
        description: "Write and preview Markdown in real-time. GitHub-style styling and HTML export.",
        longDescription:
            "The perfect documentation companion. Our Markdown Editor provides a professional split-screen experience where you can write Markdown on the left and see the beautifully rendered HTML on the right in real-time. Supports GitHub Flavored Markdown (GFM), including tables, task lists, and code blocks. Export your work as raw HTML or copy it to your clipboard instantly.",
        categoryId: "developer",
        icon: "FileText",
        tags: ["developer", "markdown", "editor", "preview", "documentation"],
        isNew: true,
        seo: {
            title: "Markdown Editor & Real-Time Preview Online | RapidKit",
            description:
                "Free online Markdown editor with live preview. Write GitHub-style documentation, convert Markdown to HTML, and export instantly. Fast and developer-friendly.",
            keywords: ["markdown editor", "markdown preview", "online markdown editor", "convert markdown to html", "readme editor"],
        },
    },
    {
        id: "code-to-image",
        name: "Code to Image (Prettify)",
        slug: "code-to-image",
        description: "Transform your source code into beautiful, shareable images with syntax highlighting and gradients.",
        longDescription:
            "Create professional code snippets for your social media or blog posts. Simply paste your code, select your language and theme, and customize the background with stunning gradients. Export as high-quality PNG images instantly. Perfect for developers, bloggers, and tech influencers.",
        categoryId: "developer",
        icon: "FileCode",
        tags: ["code", "image", "developer", "marketing", "syntax highlighting"],
        isFeatured: true,
        seo: {
            title: "Code to Image — Create Beautiful Code Snippets Online | RapidKit",
            description:
                "Convert your source code into elegant images with syntax highlighting. Choose from multiple themes and gradient backgrounds. Free online tool.",
            keywords: ["code to image", "code snippet generator", "pretty code", "source code screenshot", "prettify code"],
        },
    },
    {
        id: "whatsapp-link-generator",
        name: "WhatsApp Link Generator",
        slug: "whatsapp-link-generator",
        description: "Generate instant chat links for WhatsApp with custom messages. Perfect for business ads and social media.",
        longDescription:
            "Create direct WhatsApp chat links easily. Enter your phone number and an optional pre-filled message, and get a shareable link instantly. Includes a live preview of how the message will look to your customers. High-performing tool for entrepreneurs and marketers.",
        categoryId: "marketing",
        icon: "MessageCircle",
        tags: ["whatsapp", "marketing", "link generator", "business", "social media"],
        isFeatured: true,
        isPopular: true,
        seo: {
            title: "WhatsApp Link Generator — Create Direct Chat Links Free | RapidKit",
            description:
                "Generate WhatsApp direct chat links with custom messages. Boost your business sales with easy-to-use WhatsApp links. No signup required.",
            keywords: ["whatsapp link generator", "create whatsapp link", "whatsapp direct link", "wa link", "whatsapp message link"],
        },
    },
    {
        id: "password-generator",
        name: "Secure Password Generator",
        slug: "password-generator",
        description: "Generate ultra-secure, random passwords instantly with customizable length and character types.",
        longDescription:
            "Protect your accounts with strong, unpredictable passwords. Our generator allows you to include uppercase letters, numbers, and special symbols. It features a real-time strength meter and all generation happens locally in your browser for maximum privacy. Never reuse a weak password again.",
        categoryId: "developer",
        icon: "ShieldAlert",
        tags: ["password", "security", "generator", "random", "privacy"],
        isFeatured: true,
        seo: {
            title: "Secure Password Generator — Create Strong Passwords Online | RapidKit",
            description:
                "Generate highly secure random passwords for free. Customizable length, symbols, and numbers. 100% private and local generation.",
            keywords: ["password generator", "secure password", "random password", "strong password", "password strength"],
        },
    },
    {
        id: "text-diff-checker",
        name: "Text Diff Checker",
        slug: "text-diff-checker",
        description: "Compare two pieces of text and find differences in lines or characters instantly.",
        longDescription:
            "Find what changed between two versions of text. Our tool provides a side-by-side or inline view of additions and deletions. Perfect for comparing code snippets, checking document versions, or identifying plagiarism. Secure and fast character-level analysis.",
        categoryId: "text",
        icon: "FileSearch",
        tags: ["text", "diff", "compare", "code", "editing"],
        isPopular: true,
        seo: {
            title: "Text Diff Checker — Compare Text and Find Differences | RapidKit",
            description:
                "Free online text comparison tool. Highlight differences between two texts easily. Side-by-side view for additions and deletions.",
            keywords: ["text diff checker", "compare text online", "text difference finder", "diff tool", "check differences"],
        },
    },
    {
        id: "image-metadata-remover",
        name: "Image Metadata (EXIF) Remover",
        slug: "image-metadata-remover",
        description: "Strip sensitive EXIF data, GPS location, and camera settings from your photos instantly.",
        longDescription:
            "Protect your privacy before sharing photos online. Our tool removes hidden EXIF data like GPS coordinates, camera model, lens settings, and exposure details. Your image is processed entirely on your device, ensuring your original file never leaves your computer. Download a 'clean' version in seconds.",
        categoryId: "image",
        icon: "ShieldCheck",
        tags: ["image", "privacy", "exif", "metadata", "security"],
        isFeatured: true,
        seo: {
            title: "Private Image Metadata Remover — Strip EXIF & GPS from Photos | RapidKit",
            description:
                "Quickly remove GPS location and camera data from your images. Protect your privacy with our 100% local EXIF cleaner. Supporting JPEG and PNG.",
            keywords: ["exif remover", "remove photo metadata", "strip gps from image", "clean image metadata", "private photo sharer"],
        },
    },
    {
        id: "meta-tag-generator",
        name: "Meta Tag Generator",
        slug: "meta-tag-generator",
        description: "Generate SEO-ready Meta Tags and Open Graph tags with real-time social media previews.",
        longDescription:
            "Optimize your website's social sharing and SEO. This tool generates all essential meta tags, including Open Graph for Facebook and Twitter Cards. See exactly how your site will look on Google, Facebook, and Twitter as you type. Boost your click-through rates with professional link previews.",
        categoryId: "marketing",
        icon: "Search",
        tags: ["seo", "marketing", "meta tags", "open graph", "web development"],
        isFeatured: true,
        seo: {
            title: "Meta Tag Generator — SEO & Social Media Preview Tool | RapidKit",
            description:
                "Create perfect meta tags for your website. Preview how your site appears on Google, Facebook, and Twitter. Generate SEO-optimized code instantly.",
            keywords: ["meta tag generator", "social media preview", "og tag generator", "seo tags", "twitter card generator"],
        },
    },
    {
        id: "base64-converter",
        name: "Base64 Image/Text Converter",
        slug: "base64-converter",
        description: "Convert images to Base64 strings or decode Base64 back to text and images instantly.",
        longDescription:
            "A must-have tool for developers. Easily convert icons, small images, and text into Base64 format for use in CSS, HTML, or JSON. Our converter supports various image formats and provides multi-tab functionality for both encoding and decoding. All transformations happen locally for speed and privacy.",
        categoryId: "developer",
        icon: "FileCode",
        tags: ["base64", "converter", "image", "developer", "encoding"],
        isPopular: true,
        seo: {
            title: "Base64 Image/Text Converter — Encoder & Decoder Online | RapidKit",
            description:
                "Free online Base64 converter. Convert images to Base64 data URIs or encode/decode text strings. Fast, secure, and developer-friendly.",
            keywords: ["base64 converter", "image to base64", "base64 encoder", "base64 decoder", "data uri generator"],
        },
    },
    {
        id: "favicon-generator",
        name: "Favicon Generator",
        slug: "favicon-generator",
        description: "Generate professional favicons and app icons in all sizes from a single image.",
        longDescription:
            "The ultimate favicon kit for developers. Upload your logo and instantly generate all the necessary files for your website: favicon.ico, apple-touch-icon, and various PNG sizes. We even provide the HTML code to copy-paste directly into your <head> tag. 100% private and runs entirely in your browser.",
        categoryId: "developer",
        icon: "Globe",
        tags: ["developer", "favicon", "icon", "web-dev", "assets"],
        isNew: true,
        isFeatured: false,
        seo: {
            title: "Favicon Generator — Convert Logo to .ico & App Icons | RapidKit",
            description:
                "Create a professional favicon kit for your website. Generate .ico, .png, and apple-touch-icons in seconds. Free, easy, and private.",
            keywords: ["favicon generator", "convert logo to ico", "create favicon", "apple touch icon generator", "web icon maker"],
        },
    },
    {
        id: "json-csv-converter",
        name: "JSON to CSV / CSV to JSON",
        slug: "json-csv-converter",
        description: "Convert JSON data to CSV format or vice versa with a live editable table view.",
        longDescription:
            "Seamlessly transform your data between JSON and CSV formats. Perfect for developers, accountants, and data analysts. Features a live table preview where you can view and edit your data before exporting. Handles complex JSON structures and large CSV files with ease, all within your browser.",
        categoryId: "data",
        icon: "Table",
        tags: ["json", "csv", "data", "converter", "excel"],
        isFeatured: true,
        seo: {
            title: "JSON to CSV & CSV to JSON Converter — Editable Table View | RapidKit",
            description:
                "Free online JSON to CSV converter. Convert Excel/CSV to JSON instantly. Includes a live editable table preview. 100% private local processing.",
            keywords: ["json to csv", "csv to json", "excel to json", "convert json to csv", "data converter"],
        },
    },
    {
        id: "color-palette-generator",
        name: "Color Palette from Image",
        slug: "color-palette-generator",
        description: "Extract beautiful color palettes and hex codes from any image or photo instantly.",
        longDescription:
            "Designers' favorite tool. Upload any image and automatically extract its dominant colors and a full harmonious palette. Get HEX, RGB, and HSL codes for every color. Perfect for branding, UI design, and finding inspiration from photography. 100% private and runs in your browser.",
        categoryId: "design",
        icon: "Droplets",
        tags: ["design", "color", "palette", "image", "extraction"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Color Palette Generator from Image — Extract Hex Codes | RapidKit",
            description:
                "Extract professional color palettes from your photos for free. Get dominant colors and hex codes instantly. 100% private and web-based tool.",
            keywords: ["color palette generator", "extract colors from image", "image color picker", "hex code extractor", "palette from photo"],
        },
    },
    {
        id: "svg-shape-generator",
        name: "SVG Blob & Wave Generator",
        slug: "svg-shape-generator",
        description: "Create unique SVG blobs and organic waves for your web designs and backgrounds.",
        longDescription:
            "Design custom organic shapes and waves for modern website backgrounds and UI elements. Adjust complexity, contrast, and colors to generate unique SVG blobs or layered waves. Export as raw SVG code or download as an SVG file. Perfect for designers looking to add a professional, fluid aesthetic to their projects.",
        categoryId: "design",
        icon: "Shapes",
        tags: ["design", "svg", "blob", "wave", "background", "generator"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "SVG Blob & Wave Generator — Create Organic Shapes & Waves | RapidKit",
            description:
                "Generate custom SVG blobs and waves for free. Customize complexity and colors, then copy the SVG code or download the file. Perfect for modern web design.",
            keywords: ["svg blob generator", "svg wave maker", "organic shapes generator", "web design backgrounds", "css blobs"],
        },
    },
    {
        id: "box-shadow-generator",
        name: "CSS Box Shadow Generator",
        slug: "box-shadow-generator",
        description: "Create beautiful CSS box shadows visually with real-time preview and code export.",
        longDescription:
            "Design the perfect depth for your UI elements. Our CSS Box Shadow Generator provides full control over horizontal and vertical offsets, blur radius, spread, and color. Experiment with inset shadows and opacity to create professional, modern effects. Get clean, production-ready CSS code instantly.",
        categoryId: "design",
        icon: "Box",
        tags: ["design", "css", "shadow", "frontend", "ui"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "CSS Box Shadow Generator — Visual Shadow Builder | RapidKit",
            description:
                "Build professional CSS box shadows visually. Adjust offsets, blur, and spread with a live preview. Copy clean CSS code for your projects. Free and online.",
            keywords: ["css box shadow generator", "box shadow maker", "css shadow builder", "ui depth tool", "frontend design"],
        },
    },
    {
        id: "signature-pad",
        name: "Digital Signature Pad",
        slug: "signature-pad",
        description: "Create and download professional digital signatures as transparent PNGs.",
        longDescription:
            "The fastest way to sign documents digitally. Draw your signature using your mouse or touch screen, customize the pen color and thickness, and download the resulting signature as a high-quality transparent PNG. Perfect for PDF forms, electronic contracts, and professional emails. No data is stored; everything happens in your browser.",
        categoryId: "design",
        icon: "PenTool",
        tags: ["design", "signature", "office", "productivity", "png"],
        isNew: true,
        seo: {
            title: "Online Digital Signature Pad — Create Transparent Signatures | RapidKit",
            description:
                "Create your digital signature online for free. Draw with touch or mouse, adjust style, and download as a transparent PNG. Fast, secure, and private.",
            keywords: ["digital signature pad", "online signature maker", "draw signature online", "signature png generator", "electronic signature"],
        },
    },
    {
        id: "glassmorphism-generator",
        name: "CSS Glassmorphism Generator",
        slug: "glassmorphism-generator",
        description: "Create modern frosted-glass effects with real-time preview and clean CSS export.",
        longDescription:
            "Master the hottest UI trend with our Glassmorphism Generator. Effortlessly adjust backdrop blur, transparency, saturation, and border frost to create stunning glass effects for your web projects. Features an interactive preview with dynamic moving backgrounds to visualize the transparency and blur in real-time. Get production-ready CSS code instantly.",
        categoryId: "design",
        icon: "Layers",
        tags: ["design", "css", "glassmorphism", "ui", "ux"],
        isNew: true,
        seo: {
            title: "CSS Glassmorphism Generator — Design Modern Glass UI Effects | RapidKit",
            description:
                "Build professional frosted-glass UI effects visually. Adjust blur, transparency, and borders with a live moving background preview. Copy clean CSS code instantly.",
            keywords: ["glassmorphism generator", "css glass effect", "frosted glass css", "ui design trends", "backdrop blur generator"],
        },
    },
    {
        id: "screen-recorder",
        name: "Online Screen Recorder",
        slug: "screen-recorder",
        description: "Record your screen, camera, and audio directly in the browser. No installation, no watermarks.",
        longDescription:
            "The professional way to capture your screen. Whether you're creating a tutorial, reporting a bug, or recording a presentation, our online screen recorder works entirely in your browser. Record your full screen, specific windows, or browser tabs with high-quality audio. No software to install, no time limits, and absolutely no watermarks. 100% private and secure.",
        categoryId: "video",
        icon: "Monitor",
        tags: ["video", "screen record", "tutorial", "presentation", "productivity"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Free Online Screen Recorder — No Watermark & Unlimited Time | RapidKit",
            description:
                "Record your screen online for free. High-quality video capture for tutorials and presentations. No software installation, no watermarks, unlimited recording time.",
            keywords: ["screen recorder online", "free screen recorder", "no watermark screen recorder", "record screen browser", "video capture tool"],
        },
    },
    {
        id: "pomodoro-timer",
        name: "Pomodoro Study Timer",
        slug: "pomodoro-timer",
        description: "Boost your productivity with the classic 25/5 Pomodoro technique. Focus more, stress less.",
        longDescription:
            "Master your time with our professional Pomodoro Timer. Designed for students, developers, and creators, this tool uses the proven 25-minute focus followed by a 5-minute break cycle. Features customizable intervals, browser notifications, and ambient sound alerts to keep you on track without constantly checking the clock. 100% free and works in any browser.",
        categoryId: "productivity",
        icon: "Timer",
        tags: ["productivity", "timer", "pomodoro", "focus", "study"],
        isNew: true,
        isFeatured: true,
        seo: {
            title: "Online Pomodoro Timer — Focus & Study Productivity Tool | RapidKit",
            description:
                "Boost your focus with our free online Pomodoro timer. Classic 25/5 intervals, customizable settings, and break alerts. The ultimate productivity tool for deep work.",
            keywords: ["pomodoro timer", "study timer", "focus timer", "online productivity tool", "pomodoro technique website"],
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
