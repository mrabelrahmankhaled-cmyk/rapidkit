"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    Copy,
    RefreshCw,
    Check,
    Hash,
    Type,
    Lock,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordGeneratorTool() {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [strength, setStrength] = useState(0); // 0 to 100
    const [copied, setCopied] = useState(false);

    // ─── Password Generation Logic ──────────────────────────────────
    const generatePassword = useCallback(() => {
        let charset = "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers) charset += "0123456789";
        if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let generated = "";
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            generated += charset[array[i] % charset.length];
        }

        setPassword(generated);
    }, [length, includeUppercase, includeNumbers, includeSymbols]);

    // ─── Strength Calculation ───────────────────────────────────────
    useEffect(() => {
        let s = 0;
        if (length > 8) s += 25;
        if (length > 12) s += 15;
        if (includeUppercase) s += 20;
        if (includeNumbers) s += 20;
        if (includeSymbols) s += 20;

        // Multiplier for very long passwords
        if (length > 20) s = Math.min(100, s + 10);

        setStrength(s);
    }, [password, length, includeUppercase, includeNumbers, includeSymbols]);

    // Initial generate
    useEffect(() => {
        generatePassword();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const strengthLabel = strength <= 40 ? "Weak" : strength <= 75 ? "Strong" : "Ultra Secure";
    const strengthColor = strength <= 40 ? "bg-red-500" : strength <= 75 ? "bg-amber-500" : "bg-emerald-500";
    const strengthGlow = strength <= 40 ? "shadow-[0_0_15px_rgba(239,68,68,0.5)]" : strength <= 75 ? "shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "shadow-[0_0_15px_rgba(16,185,129,0.5)]";

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start">
            {/* ─── Main Configuration ────────────────────────── */}
            <div className="space-y-6">
                {/* Result Display (The "Cyber" Screen) */}
                <div className="relative group p-8 rounded-3xl bg-[rgb(10,10,15)] border-2 border-[rgb(45,45,65)] overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[80px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[80px] -ml-32 -mb-32" />

                    <div className="relative flex flex-col items-center gap-6">
                        <div className="w-full flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-violet-400" />
                                <span className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Encrypted Output</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-1 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px] font-bold text-emerald-400 uppercase">Local Generator</span>
                            </div>
                        </div>

                        <div className="w-full bg-[rgb(17,17,27)] p-6 rounded-2xl border border-[rgb(45,45,65)] flex items-center gap-4 group">
                            <span className="flex-1 font-mono text-xl sm:text-2xl text-white break-all tracking-wider font-medium">
                                {password}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={generatePassword}
                                    className="p-3 rounded-xl bg-[rgb(30,30,46)] border border-[rgb(45,45,65)] text-[rgb(120,120,160)] hover:text-white hover:bg-[rgb(40,40,65)] transition-all"
                                    title="Regenerate"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "p-3 rounded-xl transition-all shadow-xl",
                                        copied
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                            : "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/30"
                                    )}
                                    title="Copy Password"
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Strength Meter */}
                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-[rgb(80,80,120)] uppercase">Security Strength</span>
                                <span className={cn(
                                    "text-xs font-bold uppercase",
                                    strength <= 40 ? "text-red-400" : strength <= 75 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    {strengthLabel}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-[rgb(30,30,46)] rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-700 ease-out", strengthColor, strengthGlow)}
                                    style={{ width: `${strength}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Panel */}
                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    {/* Length Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-semibold text-white">Password Length</h3>
                            </div>
                            <span className="text-xl font-mono font-bold text-white bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20">{length}</span>
                        </div>
                        <input
                            type="range" min={6} max={50} value={length}
                            onChange={(e) => setLength(Number(e.target.value))}
                            className="w-full h-2 bg-[rgb(10,10,15)] rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                        <div className="flex justify-between text-[10px] text-[rgb(80,80,120)] font-bold uppercase">
                            <span>Too Weak (6)</span>
                            <span>Secure (16+)</span>
                            <span>Full Armor (50)</span>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setIncludeUppercase(!includeUppercase)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all group",
                                includeUppercase
                                    ? "bg-violet-500/10 border-violet-500 text-white"
                                    : "bg-transparent border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:border-[rgb(60,60,90)]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Type className={cn("w-4 h-4", includeUppercase ? "text-violet-400" : "text-[rgb(60,60,90)]")} />
                                <span className="text-xs font-semibold">Uppercase</span>
                            </div>
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                includeUppercase ? "border-violet-500 bg-violet-500" : "border-[rgb(45,45,65)]"
                            )}>
                                {includeUppercase && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </button>

                        <button
                            onClick={() => setIncludeNumbers(!includeNumbers)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all group",
                                includeNumbers
                                    ? "bg-amber-500/10 border-amber-500 text-white"
                                    : "bg-transparent border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:border-[rgb(60,60,90)]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Hash className={cn("w-4 h-4", includeNumbers ? "text-amber-400" : "text-[rgb(60,60,90)]")} />
                                <span className="text-xs font-semibold">Numbers</span>
                            </div>
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                includeNumbers ? "border-amber-500 bg-amber-500" : "border-[rgb(45,45,65)]"
                            )}>
                                {includeNumbers && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </button>

                        <button
                            onClick={() => setIncludeSymbols(!includeSymbols)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all group",
                                includeSymbols
                                    ? "bg-cyan-500/10 border-cyan-500 text-white"
                                    : "bg-transparent border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:border-[rgb(60,60,90)]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Shield className={cn("w-4 h-4", includeSymbols ? "text-cyan-400" : "text-[rgb(60,60,90)]")} />
                                <span className="text-xs font-semibold">Symbols</span>
                            </div>
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                includeSymbols ? "border-cyan-500 bg-cyan-500" : "border-[rgb(45,45,65)]"
                            )}>
                                {includeSymbols && <Check className="w-3 h-3 text-white" />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Right Sidebar Tip ─────────────────────────── */}
            <div className="space-y-5">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-600/20">
                    <ShieldAlert className="w-8 h-8 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Privacy Policy</h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                        RapidKit uses <strong>Web Crypto API</strong> to generate passwords. This means your passwords are created locally in your browser and are never sent to our servers.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Security Level</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">High Complexity</p>
                                <p className="text-[10px] text-[rgb(100,100,140)]">Mixed case, numbers, and symbols used.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-0.5">Cryptographically Secure</p>
                                <p className="text-[10px] text-[rgb(100,100,140)]">Generated via hardware-level randomness.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
