"use client";

import { Mail } from "lucide-react";

export default function ContactClient() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* ─── Contact Form ─────────────────────── */}
            <div className="p-7 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                                Your Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(40,40,60)] text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(40,40,60)] text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="subject" className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                            Subject
                        </label>
                        <select
                            id="subject"
                            className="w-full px-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(140,140,180)] text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                        >
                            <option value="">Select a topic...</option>
                            <option value="bug">🐛 Bug Report</option>
                            <option value="suggestion">💡 Tool Suggestion</option>
                            <option value="business">🤝 Business Inquiry</option>
                            <option value="other">💬 General Question</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="message" className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={6}
                            placeholder="Tell us what's on your mind..."
                            className="w-full px-4 py-3 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white placeholder:text-[rgb(40,40,60)] text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none leading-relaxed"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
                    >
                        Send Message →
                    </button>

                    <p className="text-xs text-center text-[rgb(60,60,90)]">
                        Or email us directly at{" "}
                        <a href="mailto:hello@getrapidkit.me" className="text-violet-400 hover:text-violet-300 transition-colors">
                            hello@getrapidkit.me
                        </a>
                    </p>
                </form>
            </div>

            {/* ─── Sidebar ──────────────────────────── */}
            <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                    <h3 className="text-sm font-semibold text-white mb-3">⏱️ Response Time</h3>
                    <p className="text-sm text-[rgb(100,100,140)] leading-relaxed">
                        We typically respond within <strong className="text-white">24-48 hours</strong> on business days.
                    </p>
                </div>

                <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                    <h3 className="text-sm font-semibold text-white mb-3">📬 Direct Email</h3>
                    <div className="space-y-3">
                        {[
                            { label: "General", email: "hello@getrapidkit.me" },
                            { label: "Privacy", email: "privacy@getrapidkit.me" },
                            { label: "Legal", email: "legal@getrapidkit.me" },
                        ].map((item) => (
                            <div key={item.email}>
                                <p className="text-xs text-[rgb(60,60,90)] mb-0.5">{item.label}</p>
                                <a href={`mailto:${item.email}`} className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> {item.email}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </div>
    );
}
