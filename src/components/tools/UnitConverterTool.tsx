"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Unit Definitions ─────────────────────────────────────────────

type UnitDef = { label: string; factor: number; offset?: number };
type Category = { name: string; icon: string; units: Record<string, UnitDef> };

const CATEGORIES: Record<string, Category> = {
    length: {
        name: "Length",
        icon: "📏",
        units: {
            mm: { label: "Millimeter (mm)", factor: 0.001 },
            cm: { label: "Centimeter (cm)", factor: 0.01 },
            m: { label: "Meter (m)", factor: 1 },
            km: { label: "Kilometer (km)", factor: 1000 },
            in: { label: "Inch (in)", factor: 0.0254 },
            ft: { label: "Foot (ft)", factor: 0.3048 },
            yd: { label: "Yard (yd)", factor: 0.9144 },
            mi: { label: "Mile (mi)", factor: 1609.344 },
            nmi: { label: "Nautical Mile", factor: 1852 },
        },
    },
    weight: {
        name: "Weight",
        icon: "⚖️",
        units: {
            mg: { label: "Milligram (mg)", factor: 0.000001 },
            g: { label: "Gram (g)", factor: 0.001 },
            kg: { label: "Kilogram (kg)", factor: 1 },
            t: { label: "Metric Ton (t)", factor: 1000 },
            oz: { label: "Ounce (oz)", factor: 0.028349523 },
            lb: { label: "Pound (lb)", factor: 0.45359237 },
            st: { label: "Stone (st)", factor: 6.35029318 },
        },
    },
    temperature: {
        name: "Temperature",
        icon: "🌡️",
        units: {
            c: { label: "Celsius (°C)", factor: 1 },
            f: { label: "Fahrenheit (°F)", factor: 1 },
            k: { label: "Kelvin (K)", factor: 1 },
        },
    },
    area: {
        name: "Area",
        icon: "⬛",
        units: {
            mm2: { label: "mm²", factor: 0.000001 },
            cm2: { label: "cm²", factor: 0.0001 },
            m2: { label: "m² (Square Meter)", factor: 1 },
            km2: { label: "km²", factor: 1000000 },
            ha: { label: "Hectare (ha)", factor: 10000 },
            ac: { label: "Acre (ac)", factor: 4046.8564 },
            ft2: { label: "ft²", factor: 0.09290304 },
            mi2: { label: "mi²", factor: 2589988.1 },
        },
    },
    volume: {
        name: "Volume",
        icon: "🧊",
        units: {
            ml: { label: "Milliliter (ml)", factor: 0.001 },
            l: { label: "Liter (L)", factor: 1 },
            m3: { label: "Cubic Meter (m³)", factor: 1000 },
            tsp: { label: "Teaspoon (tsp)", factor: 0.00492892 },
            tbsp: { label: "Tablespoon", factor: 0.01478676 },
            floz: { label: "Fl. Ounce (fl oz)", factor: 0.02957353 },
            cup: { label: "Cup (US)", factor: 0.236588 },
            pt: { label: "Pint (US pt)", factor: 0.473176 },
            qt: { label: "Quart (US qt)", factor: 0.946353 },
            gal: { label: "Gallon (US gal)", factor: 3.785412 },
        },
    },
    speed: {
        name: "Speed",
        icon: "⚡",
        units: {
            mps: { label: "m/s", factor: 1 },
            kph: { label: "km/h", factor: 0.277778 },
            mph: { label: "mph", factor: 0.44704 },
            knot: { label: "Knot", factor: 0.514444 },
            fps: { label: "ft/s", factor: 0.3048 },
        },
    },
};

// ─── Temperature helpers ──────────────────────────────────────────

function toSI(value: number, fromUnit: string, category: string): number {
    if (category !== "temperature") {
        return value * CATEGORIES[category].units[fromUnit].factor;
    }
    if (fromUnit === "c") return value;
    if (fromUnit === "f") return (value - 32) * (5 / 9);
    return value - 273.15;
}

function fromSI(value: number, toUnit: string, category: string): number {
    if (category !== "temperature") {
        return value / CATEGORIES[category].units[toUnit].factor;
    }
    if (toUnit === "c") return value;
    if (toUnit === "f") return value * (9 / 5) + 32;
    return value + 273.15;
}

function convert(value: number, from: string, to: string, category: string): number {
    if (from === to) return value;
    const si = toSI(value, from, category);
    return fromSI(si, to, category);
}

// ─── Component ────────────────────────────────────────────────────

export function UnitConverterTool() {
    const categoryKeys = Object.keys(CATEGORIES);
    const [activeCategory, setActiveCategory] = useState("length");
    const [fromUnit, setFromUnit] = useState("m");
    const [toUnit, setToUnit] = useState("ft");
    const [inputValue, setInputValue] = useState("1");
    const [copied, setCopied] = useState(false);

    const cat = CATEGORIES[activeCategory];
    const unitKeys = Object.keys(cat.units);

    const handleCategoryChange = (key: string) => {
        setActiveCategory(key);
        const units = Object.keys(CATEGORIES[key].units);
        setFromUnit(units[0]);
        setToUnit(units[1] ?? units[0]);
        setInputValue("1");
    };

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const numInput = parseFloat(inputValue);
    const isValid = !isNaN(numInput);
    const result = isValid ? convert(numInput, fromUnit, toUnit, activeCategory) : null;

    const formattedResult =
        result !== null
            ? Math.abs(result) < 0.0001 || Math.abs(result) > 1e10
                ? result.toExponential(6)
                : parseFloat(result.toPrecision(8)).toString()
            : "";

    const handleCopy = () => {
        if (!formattedResult) return;
        navigator.clipboard.writeText(formattedResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-5">
            {/* ─── Category Picker ─────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {categoryKeys.map((key) => (
                    <button
                        key={key}
                        onClick={() => handleCategoryChange(key)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            activeCategory === key
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                : "bg-[rgb(17,17,27)] text-[rgb(80,80,120)] border border-[rgb(45,45,65)] hover:text-white hover:border-[rgb(80,80,120)]"
                        )}
                    >
                        <span>{CATEGORIES[key].icon}</span>
                        <span>{CATEGORIES[key].name}</span>
                    </button>
                ))}
            </div>

            {/* ─── Converter Card ────────────────────────────── */}
            <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    {/* From */}
                    <div className="space-y-2">
                        <label className="text-xs text-[rgb(80,80,120)] uppercase tracking-wider font-medium">From</label>
                        <select
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                        >
                            {unitKeys.map((uk) => (
                                <option key={uk} value={uk}>{cat.units[uk].label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-lg font-mono focus:outline-none focus:border-amber-500/60 transition-colors placeholder:text-[rgb(45,45,65)]"
                            placeholder="Enter value..."
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center pb-1">
                        <button
                            onClick={handleSwap}
                            className="w-10 h-10 rounded-xl bg-[rgb(30,30,46)] border border-[rgb(45,45,65)] flex items-center justify-center text-[rgb(80,80,120)] hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                            title="Swap units"
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* To */}
                    <div className="space-y-2">
                        <label className="text-xs text-[rgb(80,80,120)] uppercase tracking-wider font-medium">To</label>
                        <select
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                        >
                            {unitKeys.map((uk) => (
                                <option key={uk} value={uk}>{cat.units[uk].label}</option>
                            ))}
                        </select>
                        {/* Result Display */}
                        <div className="relative">
                            <div className={cn(
                                "w-full px-4 py-3 rounded-xl border text-lg font-mono min-h-[52px] flex items-center justify-between",
                                result !== null
                                    ? "bg-amber-500/5 border-amber-500/30 text-amber-300"
                                    : "bg-[rgb(10,10,15)] border-[rgb(45,45,65)] text-[rgb(45,45,65)]"
                            )}>
                                <span>{result !== null ? formattedResult : "—"}</span>
                                {result !== null && (
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            "ml-2 transition-colors",
                                            copied ? "text-emerald-400" : "text-[rgb(80,80,120)] hover:text-white"
                                        )}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formula Line */}
                {result !== null && (
                    <div className="text-center text-xs text-[rgb(80,80,120)] pt-2 border-t border-[rgb(30,30,46)]">
                        <span className="font-mono text-white">{numInput} {cat.units[fromUnit]?.label.split(" ")[0]}</span>
                        {" = "}
                        <span className="font-mono text-amber-300">{formattedResult} {cat.units[toUnit]?.label.split(" ")[0]}</span>
                    </div>
                )}
            </div>

            {/* ─── Quick Reference Table ─────────────────────── */}
            {isValid && result !== null && (
                <div className="rounded-xl border border-[rgb(45,45,65)] overflow-hidden">
                    <div className="px-4 py-2.5 bg-[rgb(17,17,27)] border-b border-[rgb(30,30,46)]">
                        <span className="text-xs font-medium text-[rgb(80,80,120)] uppercase tracking-wider">
                            All Conversions for {numInput} {cat.units[fromUnit]?.label.split(" ")[0]}
                        </span>
                    </div>
                    <div className="divide-y divide-[rgb(30,30,46)]">
                        {unitKeys.filter((uk) => uk !== fromUnit).map((uk, i) => {
                            const val = convert(numInput, fromUnit, uk, activeCategory);
                            const fmt =
                                Math.abs(val) < 0.00001 || Math.abs(val) > 1e9
                                    ? val.toExponential(4)
                                    : parseFloat(val.toPrecision(6)).toString();
                            return (
                                <div
                                    key={uk}
                                    className={cn(
                                        "flex justify-between items-center px-4 py-2.5 text-sm",
                                        uk === toUnit ? "bg-amber-500/5" : i % 2 === 0 ? "bg-[rgb(10,10,15)]" : ""
                                    )}
                                >
                                    <span className="text-[rgb(80,80,120)]">{cat.units[uk].label}</span>
                                    <span className={cn("font-mono font-medium", uk === toUnit ? "text-amber-300" : "text-white")}>
                                        {fmt}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
