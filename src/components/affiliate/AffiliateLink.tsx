"use client";

import React from "react";
import { cn } from "@/lib/utils";

declare global {
    interface Window {
        gtag?: (
            command: "event" | "config" | "js",
            targetIdOrEventName: string,
            params?: Record<string, string | number | boolean | undefined>
        ) => void;
    }
}

export interface AffiliateLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel"> {
    href: string;
    affiliateId: string;
    toolSlug?: string;
    placement?: string;
    children: React.ReactNode;
}

export function AffiliateLink({
    href,
    affiliateId,
    toolSlug,
    placement = "tool_cta",
    className,
    onClick,
    children,
    ...rest
}: AffiliateLinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
            window.gtag("event", "affiliate_click", {
                affiliate_id: affiliateId,
                tool_slug: toolSlug ?? "unknown",
                placement,
                destination_url: href,
            });
        }
        onClick?.(e);
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={handleClick}
            className={cn(className)}
            {...rest}
        >
            {children}
        </a>
    );
}
