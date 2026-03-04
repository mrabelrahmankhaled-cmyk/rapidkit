"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Spinner = () => (
    <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <span className="text-sm text-[rgb(80,80,120)]">Loading tool...</span>
        </div>
    </div>
);

// ─── Lazy-loaded Tool Components ─────────────────────────────────
const YoutubeThumbnailTool = dynamic(
    () => import("@/components/tools/YoutubeThumbnailTool").then((m) => ({ default: m.YoutubeThumbnailTool })),
    { loading: Spinner, ssr: false }
);

const ImageCompressorTool = dynamic(
    () => import("@/components/tools/ImageCompressorTool").then((m) => ({ default: m.ImageCompressorTool })),
    { loading: Spinner, ssr: false }
);

const JsonFormatterTool = dynamic(
    () => import("@/components/tools/JsonFormatterTool").then((m) => ({ default: m.JsonFormatterTool })),
    { loading: Spinner, ssr: false }
);

const WordCounterTool = dynamic(
    () => import("@/components/tools/WordCounterTool").then((m) => ({ default: m.WordCounterTool })),
    { loading: Spinner, ssr: false }
);

const WebpConverterTool = dynamic(
    () => import("@/components/tools/WebpConverterTool").then((m) => ({ default: m.WebpConverterTool })),
    { loading: Spinner, ssr: false }
);

const CssGradientTool = dynamic(
    () => import("@/components/tools/CssGradientTool").then((m) => ({ default: m.CssGradientTool })),
    { loading: Spinner, ssr: false }
);

const TextCaseConverterTool = dynamic(
    () => import("@/components/tools/TextCaseConverterTool").then((m) => ({ default: m.TextCaseConverterTool })),
    { loading: Spinner, ssr: false }
);

const YoutubeTagExtractorTool = dynamic(
    () => import("@/components/tools/YoutubeTagExtractorTool").then((m) => ({ default: m.YoutubeTagExtractorTool })),
    { loading: Spinner, ssr: false }
);

const UnitConverterTool = dynamic(
    () => import("@/components/tools/UnitConverterTool").then((m) => ({ default: m.UnitConverterTool })),
    { loading: Spinner, ssr: false }
);

const ColorConverterTool = dynamic(
    () => import("@/components/tools/ColorConverterTool").then((m) => ({ default: m.ColorConverterTool })),
    { loading: Spinner, ssr: false }
);

const QrCodeGeneratorTool = dynamic(
    () => import("@/components/tools/QrCodeGeneratorTool").then((m) => ({ default: m.QrCodeGeneratorTool })),
    { loading: Spinner, ssr: false }
);

const CodeToImageTool = dynamic(
    () => import("@/components/tools/CodeToImageTool").then((m) => ({ default: m.CodeToImageTool })),
    { loading: Spinner, ssr: false }
);

const WhatsappLinkGeneratorTool = dynamic(
    () => import("@/components/tools/WhatsappLinkGeneratorTool").then((m) => ({ default: m.WhatsappLinkGeneratorTool })),
    { loading: Spinner, ssr: false }
);

const PasswordGeneratorTool = dynamic(
    () => import("@/components/tools/PasswordGeneratorTool").then((m) => ({ default: m.PasswordGeneratorTool })),
    { loading: Spinner, ssr: false }
);

const TextDiffCheckerTool = dynamic(
    () => import("@/components/tools/TextDiffCheckerTool").then((m) => ({ default: m.TextDiffCheckerTool })),
    { loading: Spinner, ssr: false }
);

const ImageMetadataRemoverTool = dynamic(
    () => import("@/components/tools/ImageMetadataRemoverTool").then((m) => ({ default: m.ImageMetadataRemoverTool })),
    { loading: Spinner, ssr: false }
);

const MetaTagGeneratorTool = dynamic(
    () => import("@/components/tools/MetaTagGeneratorTool").then((m) => ({ default: m.MetaTagGeneratorTool })),
    { loading: Spinner, ssr: false }
);

// ─── Map slug → Component ────────────────────────────────────────
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
    "youtube-thumbnail-downloader": YoutubeThumbnailTool,
    "youtube-tag-extractor": YoutubeTagExtractorTool,
    "image-compressor": ImageCompressorTool,
    "json-formatter": JsonFormatterTool,
    "word-counter": WordCounterTool,
    "webp-converter": WebpConverterTool,
    "css-gradient-generator": CssGradientTool,
    "text-case-converter": TextCaseConverterTool,
    "unit-converter": UnitConverterTool,
    "color-converter": ColorConverterTool,
    "qr-code-generator": QrCodeGeneratorTool,
    "code-to-image": CodeToImageTool,
    "whatsapp-link-generator": WhatsappLinkGeneratorTool,
    "password-generator": PasswordGeneratorTool,
    "text-diff-checker": TextDiffCheckerTool,
    "image-metadata-remover": ImageMetadataRemoverTool,
    "meta-tag-generator": MetaTagGeneratorTool,
};

type Props = {
    toolSlug: string;
    categoryId: string;
};

export function ToolPageClient({ toolSlug }: Props) {
    const Component = TOOL_COMPONENTS[toolSlug];

    if (!Component) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-3xl mb-4">🛠️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                <p className="text-sm text-[rgb(80,80,120)] max-w-sm">
                    This tool is currently under development. Check back soon!
                </p>
            </div>
        );
    }

    return <Component />;
}
