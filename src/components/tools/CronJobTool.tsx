"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Clock,
    Copy,
    Check,
    Calendar,
    Terminal,
    Info,
    ChevronDown,
    Zap,
    MessageCircle,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString());
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString());
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const WEEKDAYS = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

const PRESETS = [
    { label: "Every Minute", cron: "* * * * *" },
    { label: "Every Hour", cron: "0 * * * *" },
    { label: "Every Day at Midnight", cron: "0 0 * * *" },
    { label: "Every Sunday", cron: "0 0 * * 0" },
    { label: "Every 1st of Month", cron: "0 0 1 * *" }
];

export function CronJobTool() {
    const [minute, setMinute] = useState("*");
    const [hour, setHour] = useState("*");
    const [dayOfMonth, setDayOfMonth] = useState("*");
    const [month, setMonth] = useState("*");
    const [dayOfWeek, setDayOfWeek] = useState("*");

    const [cronExpression, setCronExpression] = useState("* * * * *");
    const [humanReadable, setHumanReadable] = useState("");
    const [copied, setCopied] = useState(false);

    // ─── Cron to Human Logic ───
    const translateCron = (exp: string) => {
        const parts = exp.split(' ');
        if (parts.length !== 5) return "Invalid expression";

        const [m, h, dom, mon, dow] = parts;
        let result = "At ";

        // Time part
        if (m === '*' && h === '*') result = "Every minute";
        else if (m !== '*' && h === '*') result = `At minute ${m} of every hour`;
        else if (m === '*' && h !== '*') result = `Every minute of hour ${h}`;
        else result = `At ${h.padStart(2, '0')}:${m.padStart(2, '0')}`;

        // Day part
        if (dom !== '*' && mon === '*') result += `, on day ${dom} of the month`;
        else if (dom === '*' && mon !== '*') {
            const mIndex = parseInt(mon) - 1;
            result += `, in ${MONTHS[mIndex] || mon}`;
        } else if (dom !== '*' && mon !== '*') {
            const mIndex = parseInt(mon) - 1;
            result += `, on day ${dom} of ${MONTHS[mIndex] || mon}`;
        }

        // Weekday part
        if (dow !== '*') {
            const dIndex = parseInt(dow);
            result += `, only on ${WEEKDAYS[dIndex] || dow}`;
        }

        if (exp === "* * * * *") return "Every minute, every day, every month.";
        return result + ".";
    };

    useEffect(() => {
        const exp = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        setCronExpression(exp);
        setHumanReadable(translateCron(exp));
    }, [minute, hour, dayOfMonth, month, dayOfWeek]);

    const handleCopy = () => {
        navigator.clipboard.writeText(cronExpression);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const applyPreset = (preset: string) => {
        const [m, h, dom, mon, dow] = preset.split(' ');
        setMinute(m);
        setHour(h);
        setDayOfMonth(dom);
        setMonth(mon);
        setDayOfWeek(dow);
    };

    const reset = () => applyPreset("* * * * *");

    const SelectField = ({ label, value, options, onChange, anyLabel = "Every" }: any) => (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest pl-2">{label}</label>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer pr-10"
                >
                    <option value="*">{anyLabel} {label.toLowerCase()}</option>
                    {options.map((opt: any, i: number) => (
                        <option key={i} value={typeof opt === 'string' && MONTHS.includes(opt) ? (i + 1).toString() : (WEEKDAYS.includes(opt) ? i.toString() : opt)}>
                            {opt}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(80,80,120)] pointer-events-none group-hover:text-white transition-colors" />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Main Content ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />

                    <div className="relative space-y-8">
                        {/* Output Display */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-bold text-[rgb(120,120,160)] uppercase tracking-widest flex items-center gap-2">
                                    <Terminal className="w-3.5 h-3.5" /> Cron Expression
                                </h4>
                                <button
                                    onClick={reset}
                                    className="text-[10px] font-bold text-[rgb(150,150,180)] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                                </button>
                            </div>

                            <div className="flex items-center gap-4 bg-[rgb(17,17,27)] border-2 border-emerald-500/20 rounded-3xl p-6 group transition-all hover:border-emerald-500/40 shadow-inner">
                                <span className="text-3xl md:text-4xl font-mono font-bold text-white tracking-wider flex-grow break-all selection:bg-emerald-500 selection:text-black">
                                    {cronExpression}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all shrink-0",
                                        copied ? "bg-emerald-500 text-black" : "bg-white/5 text-white hover:bg-white/10"
                                    )}
                                >
                                    {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                </button>
                            </div>

                            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
                                <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-emerald-100 leading-relaxed font-medium">
                                        "{humanReadable}"
                                    </p>
                                    <p className="text-[10px] text-[rgb(100,100,140)] uppercase tracking-widest mt-1">Human Translation</p>
                                </div>
                            </div>
                        </div>

                        {/* Editor Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                            <SelectField label="Minute" value={minute} options={MINUTES} onChange={setMinute} />
                            <SelectField label="Hour" value={hour} options={HOURS} onChange={setHour} />
                            <SelectField label="Day" value={dayOfMonth} options={DAYS} onChange={setDayOfMonth} />
                            <SelectField label="Month" value={month} options={MONTHS} onChange={setMonth} />
                            <SelectField label="Weekday" value={dayOfWeek} options={WEEKDAYS} onChange={setDayOfWeek} />
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)]">
                        <h5 className="text-xs font-bold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Quick Presets
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((p) => (
                                <button
                                    key={p.cron}
                                    onClick={() => applyPreset(p.cron)}
                                    className="px-4 py-2 rounded-xl bg-[rgb(25,25,40)] border border-[rgb(45,45,65)] text-[11px] text-[rgb(150,150,180)] hover:text-white hover:border-emerald-500/30 transition-all font-medium"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col justify-center">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Schedule Sync</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                                    Format: <code>* * * * *</code> (Min, Hr, Dom, Mon, Dow).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[rgb(30,30,46)] to-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-white shadow-xl relative overflow-hidden">
                    <Clock className="w-10 h-10 mb-4 text-emerald-400 opacity-80" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2">Automate Anything</h4>
                    <p className="text-xs text-[rgb(150,150,180)] leading-relaxed">
                        Whether it's a backup script, a cleanup task, or a database sync, just copy the expression and paste it into your <code>crontab -e</code>.
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">RapidKit Core</span>
                        <Info className="w-4 h-4 text-[rgb(80,80,120)]" />
                    </div>
                </div>

                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <h4 className="text-xs font-bold text-[rgb(100,100,140)] uppercase tracking-widest pl-1">Documentation</h4>

                    <div className="space-y-5">
                        <div className="group">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">* (Stars)</p>
                            <p className="text-[11px] text-[rgb(150,150,180)] leading-relaxed group-hover:text-white transition-colors">
                                Means "every" or "any" value for that specific position.
                            </p>
                        </div>
                        <div className="group">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Minute (0-59)</p>
                            <p className="text-[11px] text-[rgb(150,150,180)] leading-relaxed group-hover:text-white transition-colors">
                                The point in the hour when the task should trigger.
                            </p>
                        </div>
                        <div className="group">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Hour (0-23)</p>
                            <p className="text-[11px] text-[rgb(150,150,180)] leading-relaxed group-hover:text-white transition-colors">
                                Uses 24-hour format. 0 is midnight, 23 is 11 PM.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex gap-4">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed italic">
                        Tip: Cron jobs run on your server's timezone. Always double-check your local server time!
                    </p>
                </div>
            </div>
        </div>
    );
}
