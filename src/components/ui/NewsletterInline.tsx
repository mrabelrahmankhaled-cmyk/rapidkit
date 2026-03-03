"use client";

import { Bell } from "lucide-react";

export function NewsletterInline() {
    return (
        <div className="glass-card p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/10 to-cyan-900/10 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-0.5">
                        Get notified when we launch new tools
                    </h3>
                    <p className="text-xs text-[rgb(80,80,120)]">
                        Join our newsletter. No spam, only new tool announcements.
                    </p>
                </div>
                <form
                    className="flex gap-2 w-full sm:w-auto"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.querySelector("input") as HTMLInputElement;
                        if (input?.value) {
                            alert(`Thanks! We'll notify ${input.value} when new tools launch. 🚀`);
                            input.value = "";
                        }
                    }}
                >
                    <input
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="flex-1 sm:w-52 px-3 py-2 rounded-lg bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-sm text-white placeholder:text-[rgb(80,80,120)] focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                    <button type="submit" className="btn-primary text-xs px-4 py-2 whitespace-nowrap">
                        Notify Me
                    </button>
                </form>
            </div>
        </div>
    );
}
