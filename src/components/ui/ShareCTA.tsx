"use client";

import { useState } from "react";
import { Share2, Bookmark, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { canonicalUrl } from "@/lib/seo";

type Props = {
    toolName: string;
    toolSlug: string;
    categoryId: string;
};

export function ShareCTA({ toolName, toolSlug, categoryId }: Props) {
    const [copiedLink, setCopiedLink] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const toolUrl = canonicalUrl(`/tools/${categoryId}/${toolSlug}`);
    const shareText = `I just used "${toolName}" on RapidKit — a free online tool. Check it out! 🚀`;

    const handleCopyLink = () => {
        const url = typeof window !== "undefined" ? window.location.href : toolUrl;
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleBookmark = () => {
        // Modern browsers don't allow programmatic bookmark — we show a tip instead
        setBookmarked(true);
        setTimeout(() => setBookmarked(false), 3000);
    };


    const handleNativeShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : toolUrl;
        if (navigator.share) {
            await navigator.share({ title: toolName, text: shareText, url });
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(30,30,46)] mb-0">
            {/* Label */}
            <div className="text-xs text-[rgb(80,80,120)] shrink-0">
                Found this useful?
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 sm:ml-auto">
                {/* Copy Link */}
                <button
                    onClick={handleCopyLink}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                        copiedLink
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-[rgb(24,24,37)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:border-violet-500/40 hover:text-white"
                    )}
                >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                    {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>



                {/* Native Share / More */}
                <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border bg-[rgb(24,24,37)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:border-violet-500/40 hover:text-violet-300 transition-all"
                >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                </button>

                {/* Bookmark */}
                <button
                    onClick={handleBookmark}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                        bookmarked
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-[rgb(24,24,37)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:border-amber-500/40 hover:text-amber-400"
                    )}
                    title="Press Ctrl+D (or Cmd+D on Mac) to bookmark"
                >
                    <Bookmark className={cn("w-3.5 h-3.5", bookmarked && "fill-amber-400")} />
                    {bookmarked ? "Press Ctrl+D!" : "Bookmark"}
                </button>
            </div>
        </div>
    );
}
