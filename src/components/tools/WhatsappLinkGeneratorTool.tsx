"use client";

import { useState, useMemo } from "react";
import {
    Phone,
    Copy,
    ExternalLink,
    Check,
    HelpCircle,
    Send,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsappLinkGeneratorTool() {
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);

    // ─── Generate Link Logic ─────────────────────────────────────────
    const generatedLink = useMemo(() => {
        const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits
        if (cleanPhone) {
            const encodedMessage = encodeURIComponent(message);
            return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ""}`;
        }
        return "";
    }, [phone, message]);

    // ─── Handlers ───────────────────────────────────────────────────
    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpen = () => {
        if (!generatedLink) return;
        window.open(generatedLink, "_blank");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* ─── Configuration ─────────────────────────────── */}
            <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-white">Recipient Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Phone Number (International)</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 201000000000"
                                    className="w-full px-4 py-3 pl-11 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg font-bold">+</span>
                            </div>
                            <p className="text-[10px] text-[rgb(60,60,90)] flex items-center gap-1">
                                <HelpCircle className="w-3 h-3" /> Include country code. No +, 00 or spaces.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Custom Message (Optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g. Hello! I'm interested in your services."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Generated Link Display */}
                {generatedLink && (
                    <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Shareable Link</h4>
                            <span className="text-[10px] text-emerald-500 font-mono">Ready to use</span>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                            <input
                                readOnly
                                value={generatedLink}
                                className="flex-1 bg-transparent text-sm text-emerald-200/70 truncate outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all shrink-0"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                            <button
                                onClick={handleOpen}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Test Link
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Live Preview ──────────────────────────────── */}
            <div className="sticky top-24 space-y-5">
                <div className="p-1 rounded-[2.5rem] bg-[rgb(30,30,46)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden h-[540px]">
                    {/* Phone Header */}
                    <div className="bg-[#075e54] p-5 pt-10 text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight truncate">
                                {phone ? `+${phone}` : "Customer Chat"}
                            </p>
                            <p className="text-[10px] opacity-70">online</p>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="p-4 h-full bg-[#e5ddd5] relative overflow-hidden">
                        {/* WhatsApp Chat Background Pattern (pure CSS, no external asset) */}
                        <div
                            className="absolute inset-0 opacity-[0.07] pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(#075e54 1px, transparent 1px), radial-gradient(#128c7e 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                                backgroundPosition: "0 0, 12px 12px",
                            }}
                        />
                        {/* Status Tip */}
                        <div className="flex justify-center mb-6">
                            <span className="bg-[#dcf8c6]/80 text-[10px] text-gray-600 px-3 py-1 rounded-full shadow-sm">
                                Today
                            </span>
                        </div>

                        {/* Customer Message bubble */}
                        <div className="flex flex-col items-end">
                            <div className={cn(
                                "max-w-[85%] p-3 rounded-2xl rounded-tr-none shadow-sm relative animate-in zoom-in slide-in-from-right-2 duration-300",
                                message ? "bg-[#dcf8c6]" : "bg-white/60 italic text-gray-400"
                            )}>
                                <p className="text-xs text-gray-800 break-words whitespace-pre-wrap">
                                    {message || "Enter a message to see the preview..."}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[8px] text-gray-500">10:42 AM</span>
                                    <Check className="w-2.5 h-2.5 text-blue-500" strokeWidth={3} />
                                    <Check className="w-2.5 h-2.5 text-blue-500 -ml-1.5" strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2">
                            <div className="flex-1 h-10 bg-white rounded-full flex items-center px-4 shadow-sm">
                                <span className="text-xs text-gray-400">Message</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center text-white shadow-sm">
                                <Send className="w-5 h-5 ml-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <h4 className="text-xs font-bold text-violet-300 uppercase mb-1 tracking-wider">Marketing Tip</h4>
                    <p className="text-xs text-[rgb(100,100,140)] leading-relaxed">
                        Pre-filled messages help customers start a conversation faster. Use a friendly greeting like &quot;Hi, I&apos;d like to inquire about...&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}
