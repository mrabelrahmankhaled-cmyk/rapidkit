import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RapidKit — Free Online Tools for Everyone",
    template: "%s | RapidKit",
  },
  description:
    "RapidKit is your all-in-one toolkit. Free online tools for YouTube, images, developers, text, and unit conversion. Fast, private, and no sign-up needed.",
  keywords: ["online tools", "free tools", "youtube tools", "image tools", "developer tools", "text tools"],
  authors: [{ name: "RapidKit" }],
  creator: "RapidKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rapidkit.tools",
    siteName: "RapidKit",
    title: "RapidKit — Free Online Tools for Everyone",
    description: "Your all-in-one free online toolkit. Fast, private, and no sign-up required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RapidKit — Free Online Tools for Everyone",
    description: "Your all-in-one free online toolkit. Fast, private, and no sign-up required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
