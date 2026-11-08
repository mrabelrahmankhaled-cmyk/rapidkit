import { ImageResponse } from "next/og";
import { TOOLS } from "@/data/tools";
import { SITE_DOMAIN } from "@/lib/seo";

export const runtime = "edge";

export const alt = "RapidKit — Free Online Tools for Developers & Marketers";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "72px",
                    background: "linear-gradient(135deg, #0a0a0f 0%, #131124 55%, #0b1929 100%)",
                    color: "#f0f0ff",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="white"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                    <span
                        style={{
                            fontSize: "36px",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        RapidKit
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "960px" }}>
                    <div
                        style={{
                            fontSize: "64px",
                            fontWeight: 900,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                        }}
                    >
                        {`${TOOLS.length}+ Free Browser Tools for Developers & Marketers`}
                    </div>
                    <div
                        style={{
                            fontSize: "28px",
                            color: "#9494ba",
                            lineHeight: 1.4,
                        }}
                    >
                        Fast, client-side, and privacy-first. No sign-up required.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #2d2d41",
                        paddingTop: "28px",
                        fontSize: "22px",
                        color: "#a78bfa",
                    }}
                >
                    <span>{SITE_DOMAIN}</span>
                    <span style={{ color: "#38bdf8" }}>Free & Browser-First Utilities</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}

