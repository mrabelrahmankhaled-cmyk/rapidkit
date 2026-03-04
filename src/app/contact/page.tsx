import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact RapidKit — Get in Touch",
    description:
        "Have a question, suggestion, or found a bug? Contact the RapidKit team. We're a small team and we actually read every message.",
    robots: { index: true, follow: true },
    alternates: { canonical: "https://rapidkit.tools/contact" },
};

export default function ContactPage() {
    return (
        <div className="min-h-screen">
            {/* ─── Hero ─────────────────────────────────────── */}
            <header className="border-b border-[rgb(30,30,46)] py-14">
                <div className="container-narrow text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/30">
                        <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Get in Touch</h1>
                    <p className="text-[rgb(120,120,160)] text-base max-w-md mx-auto">
                        We read every message. Whether it&apos;s a bug report, a tool suggestion, or just a hello —
                        we&apos;d love to hear from you.
                    </p>
                </div>
            </header>

            <div className="container-narrow py-12">
                <ContactClient />
            </div>
        </div>
    );
}
