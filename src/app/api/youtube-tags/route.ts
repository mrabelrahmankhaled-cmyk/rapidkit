import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return NextResponse.json({ error: "Invalid video ID." }, { status: 400 });
    }

    try {
        // Fetch the YouTube watch page HTML
        const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Could not reach YouTube." }, { status: 502 });
        }

        const html = await res.text();

        // Extract video title
        let title = "Unknown Title";
        const titleMatch = html.match(/<title>(.+?)<\/title>/);
        if (titleMatch) {
            title = titleMatch[1].replace(" - YouTube", "").trim();
        }

        // Extract tags from ytInitialData
        const tags: string[] = [];

        // Method 1: keywords meta tag
        const keywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
        if (keywordsMatch) {
            const raw = keywordsMatch[1];
            raw.split(",").forEach((tag) => {
                const t = tag.trim();
                if (t) tags.push(t);
            });
        }

        // Method 2: ytInitialData tags array
        if (tags.length === 0) {
            const jsonMatch = html.match(/ytInitialData\s*=\s*(\{[\s\S]+?\});\s*(?:var|let|const|window)\s/);
            if (jsonMatch) {
                try {
                    const data = JSON.parse(jsonMatch[1]);
                    const videoDetails = data?.playerOverlays?.playerOverlayRenderer?.videoDetails;
                    // navigate through the JSON to find tags if available
                    const keywords = data?.microformat?.playerMicroformatRenderer?.keywords;
                    if (Array.isArray(keywords)) {
                        tags.push(...keywords);
                    }
                    void videoDetails;
                } catch {
                    // Parsing failed, that's OK
                }
            }
        }

        // Method 3: ytInitialPlayerResponse
        if (tags.length === 0) {
            const playerMatch = html.match(/"keywords":\s*(\[[^\]]+\])/);
            if (playerMatch) {
                try {
                    const parsed = JSON.parse(playerMatch[1]);
                    if (Array.isArray(parsed)) tags.push(...parsed);
                } catch {
                    // ignore
                }
            }
        }

        // Deduplicate
        const uniqueTags = [...new Set(tags)];

        return NextResponse.json({ title, tags: uniqueTags, videoId });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch video information." },
            { status: 500 }
        );
    }
}
