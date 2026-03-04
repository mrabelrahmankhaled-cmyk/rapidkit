"use client";

import { useState, useCallback } from "react";
import {
    FileText,
    Settings,
    Copy,
    Check,
    RefreshCw,
    Laugh,
    Trophy,
    Crown,
    Info,
    Sparkles,
    Type
} from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "classic" | "funny" | "football" | "egyptian";

const THEMES: Record<Theme, { label: string, icon: any, color: string }> = {
    classic: { label: "Classic", icon: FileText, color: "text-blue-400" },
    funny: { label: "Programmer", icon: Laugh, color: "text-emerald-400" },
    football: { label: "Football", icon: Trophy, color: "text-rose-400" },
    egyptian: { label: "Egyptian", icon: Crown, color: "text-amber-400" }
};

const CORPUS: Record<Theme, string[]> = {
    classic: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
        "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
        "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.",
        "Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.",
        "Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi."
    ],
    funny: [
        "It works on my machine.",
        "There is no place like 127.0.0.1.",
        "I'm not lazy, I'm just on energy saving mode.",
        "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
        "How many programmers does it take to change a light bulb? None, it's a hardware problem.",
        "If at first you don't succeed, call it version 1.0.",
        "Programming is 10% writing code and 90% understanding why it's not working.",
        "Deleted code is debugged code.",
        "Software and cathedrals are much the same — first we build them, then we pray.",
        "Real programmers count from 0."
    ],
    football: [
        "Goaaal! Mohamed Salah scores a screamer!",
        "The Egyptian King is on fire tonight at Anfield.",
        "Zamalek vs Ahly, the ultimate Cairo derby starts now.",
        "A clinical finish into the top corner. What a strike!",
        "Total football! The passing accuracy is 100%.",
        "The VAR is checking for a potential penalty.",
        "Golden Boot favorite and a true legend of the game.",
        "Stoppage time drama at the Borg El Arab Stadium.",
        "An overhead kick that will go down in history books.",
        "Champions League nights are simply magical."
    ],
    egyptian: [
        "يا راجل مكبر الموضوع ليه؟ كله في التمام.",
        "مصر أم الدنيا وهتفضل دايماً منورة بولادها.",
        "يا باشا اعتبر الموضوع خلصان، عيوني ليك.",
        "الفول والطعمية هما سر السعادة في الصباح.",
        "إيه الكلام الجميل ده؟ إحنا ملوك الجدعنة.",
        "الحياة حلوة بس إحنا اللي معقدينها، روق يا برنس.",
        "من عيوني يا صاحبي، اللي إنت عايزه هيحصل.",
        "باشا، أحلى كلام ده ولا إيه؟",
        "يا صلاة النبي أحسن، ده الرزق هيفتح أبوابه.",
        "خلينا ماشيين جنب الحيط أحسن."
    ]
};

export function LoremIpsumGeneratorTool() {
    const [theme, setTheme] = useState<Theme>("classic");
    const [count, setCount] = useState(3);
    const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
    const [result, setResult] = useState("");
    const [copied, setCopied] = useState(false);

    const generate = useCallback(() => {
        const corpus = CORPUS[theme];
        let output = "";

        if (type === "paragraphs") {
            const paragraphs = [];
            for (let i = 0; i < count; i++) {
                const pLength = 3 + Math.floor(Math.random() * 3);
                let p = "";
                for (let j = 0; j < pLength; j++) {
                    p += corpus[Math.floor(Math.random() * corpus.length)] + " ";
                }
                paragraphs.push(p.trim());
            }
            output = paragraphs.join("\n\n");
        } else if (type === "sentences") {
            const sentences = [];
            for (let i = 0; i < count; i++) {
                sentences.push(corpus[Math.floor(Math.random() * corpus.length)]);
            }
            output = sentences.join(" ");
        } else {
            const allWords = corpus.join(" ").split(" ");
            const words = [];
            for (let i = 0; i < count; i++) {
                words.push(allWords[Math.floor(Math.random() * allWords.length)]);
            }
            output = words.join(" ");
        }

        setResult(output);
    }, [theme, count, type]);

    // Initial generation
    useState(() => {
        generate();
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Controls & Output ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />

                    <div className="relative space-y-8">
                        {/* Theme Switcher */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">Select Corpus Spirit</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {(Object.entries(THEMES) as [Theme, any][]).map(([key, data]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTheme(key)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all duration-300",
                                            theme === key
                                                ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                                                : "bg-[rgb(17,17,27)] border-[rgb(45,45,65)] hover:border-emerald-500/30"
                                        )}
                                    >
                                        <data.icon className={cn("w-6 h-6", theme === key ? data.color : "text-[rgb(80,80,120)]")} />
                                        <span className={cn("text-[10px] font-bold uppercase tracking-tight", theme === key ? "text-white" : "text-[rgb(100,100,140)]")}>
                                            {data.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Config */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">Quantity</label>
                                <div className="flex items-center gap-3 p-2 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                                    <input
                                        type="number"
                                        value={count}
                                        min={1}
                                        max={100}
                                        onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="bg-transparent border-none text-white font-bold text-center w-full focus:ring-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">Unit</label>
                                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                                    {(["paragraphs", "sentences", "words"] as const).map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => setType(u)}
                                            className={cn(
                                                "py-2 rounded-xl text-[10px] font-bold capitalize transition-all",
                                                type === u ? "bg-emerald-500 text-black" : "text-[rgb(100,100,140)] hover:text-white"
                                            )}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={generate}
                            className="w-full py-4 rounded-3xl bg-emerald-500 text-black font-bold flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Regenerate Magic Text
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            <Type className="w-3.5 h-3.5" /> Generated Preview
                        </h4>
                        <button
                            onClick={handleCopy}
                            className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-300"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy All"}
                        </button>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-lg leading-relaxed text-white/80 whitespace-pre-wrap font-serif min-h-[300px]">
                        {result}
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                    <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">Funny Filler</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        Why use standard Latin when you can test your layouts with programmer jokes or Egyptian vibes? It makes debugging a lot more joyful!
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest pl-1">Themes Explained</h4>

                    <div className="space-y-5">
                        <div className="flex gap-4">
                            <Settings className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Classic</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">The original Lorem Ipsum derived from Cicero's work.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Laugh className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Programmer</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">Coding memes and internal developer struggles.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Trophy className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Football</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">Egyptian and Global football vibes, goals, and legends.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Egyptian</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">Witty Egyptian slang and street wisdom for local projects.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex gap-4">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        "Good design doesn't just need text, it needs context."
                    </p>
                </div>
            </div>
        </div>
    );
}
