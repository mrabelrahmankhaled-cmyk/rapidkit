import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL, SITE_NAME, canonicalUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RapidKit Tools — Free Online Tools for Developers & Marketers",
    template: "%s | RapidKit Tools",
  },
  description:
    "RapidKit Tools is your all-in-one toolkit. Free online tools for developers, digital marketers, images, YouTube, and text. Fast, private, and no sign-up needed.",
  keywords: [
    "online tools",
    "free developer tools",
    "marketing tools",
    "youtube tools",
    "image compressor",
    "json formatter",
    "text tools",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: {
    canonical: canonicalUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: canonicalUrl("/"),
    siteName: SITE_NAME,
    title: "RapidKit Tools — Free Online Tools for Developers & Marketers",
    description: "Your all-in-one free online toolkit. Fast, private, and no sign-up required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RapidKit Tools — Free Online Tools for Developers & Marketers",
    description: "Your all-in-one free online toolkit. Fast, private, and no sign-up required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "impact-site-verification": "9b7bf579-649e-4cdf-b2aa-c710bb9dcc6c",
  },
  ...(gscVerification
    ? {
        verification: {
          google: gscVerification,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Impact.com site verification (requires explicit 'value' attribute rather than 'content') */}
        <meta {...({ name: "impact-site-verification", value: "9b7bf579-649e-4cdf-b2aa-c710bb9dcc6c" } as Record<string, string>)} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  anonymize_ip: true
                });
              `}
            </Script>
          </>
        )}
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
