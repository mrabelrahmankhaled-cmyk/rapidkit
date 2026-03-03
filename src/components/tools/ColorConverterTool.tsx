"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Droplets, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Color Conversion Math ─────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
    const clean = hex.replace("#", "");
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
    return [
        parseInt(full.slice(0, 2), 16),
        parseInt(full.slice(2, 4), 16),
        parseInt(full.slice(4, 6), 16),
    ];
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
            case gn: h = ((bn - rn) / d + 2) / 6; break;
            case bn: h = ((rn - gn) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    const hn = h / 360, sn = s / 100, ln = l / 100;
    if (sn === 0) {
        const v = Math.round(ln * 255);
        return [v, v, v];
    }
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    return [
        Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
        Math.round(hue2rgb(p, q, hn) * 255),
        Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
    ];
}

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return [0, 0, 0, 100];
    return [
        Math.round(((1 - rn - k) / (1 - k)) * 100),
        Math.round(((1 - gn - k) / (1 - k)) * 100),
        Math.round(((1 - bn - k) / (1 - k)) * 100),
        Math.round(k * 100),
    ];
}

// ─── Curated Palette ──────────────────────────────────────────────

const PALETTE = [
    "#FF6B6B", "#FF8E53", "#FFC947", "#52D726", "#00C9FF",
    "#7B2FFF", "#FF2D78", "#0F2027", "#667EEA", "#F7971E",
    "#C471ED", "#12C2E9", "#1a1a2e", "#E96C4C", "#43E97B",
    "#4FACFE", "#FA709A", "#30CFD0", "#A8EDEA", "#FED6E3",
];

// ─── Component ────────────────────────────────────────────────────

type CopiedKey = string | null;

export function ColorConverterTool() {
    const [hex, setHex] = useState("#8B5CF6");
    const [hexInput, setHexInput] = useState("#8B5CF6");
    const [copied, setCopied] = useState<CopiedKey>(null);

    const rgb = hexToRgb(hex) ?? [139, 92, 246];
    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    const [c, m, y, k] = rgbToCmyk(r, g, b);

    const setColor = useCallback((newHex: string) => {
        const upper = newHex.toUpperCase();
        const parsed = hexToRgb(upper);
        if (parsed) {
            setHex(upper);
            setHexInput(upper);
        } else {
            setHexInput(newHex);
        }
    }, []);

    const handleHexInput = (val: string) => {
        setHexInput(val);
        const withHash = val.startsWith("#") ? val : "#" + val;
        const parsed = hexToRgb(withHash);
        if (parsed) setHex(withHash.toUpperCase());
    };

    const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
        const nr = channel === "r" ? val : r;
        const ng = channel === "g" ? val : g;
        const nb = channel === "b" ? val : b;
        const newHex = rgbToHex(nr, ng, nb).toUpperCase();
        setHex(newHex);
        setHexInput(newHex);
    };

    const handleHslChange = (channel: "h" | "s" | "l", val: number) => {
        const nh = channel === "h" ? val : h;
        const ns = channel === "s" ? val : s;
        const nl = channel === "l" ? val : l;
        const [nr2, ng2, nb2] = hslToRgb(nh, ns, nl);
        const newHex = rgbToHex(nr2, ng2, nb2).toUpperCase();
        setHex(newHex);
        setHexInput(newHex);
    };

    const handleCopy = (key: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 1800);
    };

    const randomColor = () => {
        const random = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
        setColor(random);
    };

    const outputs = [
        { key: "hex", label: "HEX", value: hex },
        { key: "rgb", label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
        { key: "hsl", label: "HSL", value: `hsl(${h}, ${s}%, ${l}%)` },
        { key: "cmyk", label: "CMYK", value: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` },
    ];

    const sliders = [
        { label: "R", value: r, max: 255, color: "bg-red-500", onChange: (v: number) => handleRgbChange("r", v) },
        { label: "G", value: g, max: 255, color: "bg-green-500", onChange: (v: number) => handleRgbChange("g", v) },
        { label: "B", value: b, max: 255, color: "bg-blue-500", onChange: (v: number) => handleRgbChange("b", v) },
        { label: "H", value: h, max: 360, color: "bg-violet-500", onChange: (v: number) => handleHslChange("h", v) },
        { label: "S", value: s, max: 100, color: "bg-pink-500", onChange: (v: number) => handleHslChange("s", v) },
        { label: "L", value: l, max: 100, color: "bg-cyan-500", onChange: (v: number) => handleHslChange("l", v) },
    ];

    return (
        <div className="space-y-5">
            {/* ─── Color Preview + HEX Input ───────────────── */}
            <div className="flex gap-4 items-center p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                {/* Color Picker Native */}
                <label className="relative cursor-pointer group">
                    <div
                        className="w-20 h-20 rounded-xl border-2 border-white/10 shadow-lg transition-transform group-hover:scale-105"
                        style={{ backgroundColor: hex }}
                    />
                    <input
                        type="color"
                        value={hex}
                        onChange={(e) => setColor(e.target.value)}
                        className="sr-only"
                    />
                </label>

                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(80,80,120)]" />
                            <input
                                type="text"
                                value={hexInput}
                                onChange={(e) => handleHexInput(e.target.value)}
                                maxLength={7}
                                placeholder="#000000"
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white font-mono text-sm focus:outline-none focus:border-violet-500/50 transition-colors uppercase"
                            />
                        </div>
                        <button
                            onClick={randomColor}
                            title="Random color"
                            className="px-3 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white hover:border-[rgb(80,80,120)] transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Luminosity bar */}
                    <div
                        className="h-3 rounded-full"
                        style={{ background: `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))` }}
                    />
                </div>
            </div>

            {/* ─── Output Formats ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outputs.map(({ key, label, value }) => (
                    <div key={key} className="flex items-center gap-3 p-3.5 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                        <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: hex }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-[rgb(80,80,120)] mb-0.5">{label}</p>
                            <p className="font-mono text-sm text-white truncate">{value}</p>
                        </div>
                        <button
                            onClick={() => handleCopy(key, value)}
                            className={cn(
                                "shrink-0 p-1.5 rounded-lg transition-all",
                                copied === key
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-[rgb(80,80,120)] hover:text-white hover:bg-white/5"
                            )}
                        >
                            {copied === key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                ))}
            </div>

            {/* ─── Sliders ─────────────────────────────────── */}
            <div className="p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                <p className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Adjust Channels</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sliders.map(({ label, value, max, color, onChange }) => (
                        <div key={label} className="flex items-center gap-3">
                            <span className={cn("text-xs font-bold font-mono w-5 text-center", color.replace("bg-", "text-"))}>{label}</span>
                            <input
                                type="range"
                                min={0}
                                max={max}
                                value={value}
                                onChange={(e) => onChange(Number(e.target.value))}
                                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
                            />
                            <span className="text-xs font-mono text-white w-8 text-right">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Palette ─────────────────────────────────── */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">Curated Palette</p>
                <div className="flex flex-wrap gap-2">
                    {PALETTE.map((color) => (
                        <button
                            key={color}
                            onClick={() => setColor(color)}
                            title={color}
                            className={cn(
                                "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                                hex === color.toUpperCase()
                                    ? "border-white scale-110"
                                    : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
