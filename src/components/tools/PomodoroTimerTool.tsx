"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Timer,
    Play,
    Pause,
    RotateCcw,
    Coffee,
    Brain,
    Bell,
    BellOff,
    Settings2,
    Info,
    Sparkles,
    Check,
    Volume2,
    VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "work" | "short" | "long";

const MODE_SETTINGS = {
    work: { label: "Focus Time", time: 25, color: "text-rose-500", bg: "bg-rose-500", ring: "stroke-rose-500" },
    short: { label: "Quick Break", time: 5, color: "text-emerald-500", bg: "bg-emerald-500", ring: "stroke-emerald-500" },
    long: { label: "Rest Cycle", time: 15, color: "text-blue-500", bg: "bg-blue-500", ring: "stroke-blue-500" }
};

export function PomodoroTimerTool() {
    const [mode, setMode] = useState<Mode>("work");
    const [timeLeft, setTimeLeft] = useState(MODE_SETTINGS.work.time * 60);
    const [isActive, setIsActive] = useState(false);
    const [volume, setVolume] = useState(true);
    const [notifications, setNotifications] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Tone Generation ───
    const playAlarm = useCallback(() => {
        if (!volume) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio failed", e);
        }
    }, [volume]);

    const requestNotification = () => {
        if (!("Notification" in window)) return;
        Notification.requestPermission().then(permission => {
            if (permission === "granted") setNotifications(true);
        });
    };

    const notify = (title: string, body: string) => {
        if (notifications && Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" });
        }
    };

    // ─── Timer Logic ───
    const switchMode = useCallback((newMode: Mode) => {
        setMode(newMode);
        setTimeLeft(MODE_SETTINGS[newMode].time * 60);
        setIsActive(false);
    }, []);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            playAlarm();
            if (mode === "work") {
                notify("Time to rest!", "Focus session completed. Take a break!");
            } else {
                notify("Back to work!", "Break is over. Ready for focus?");
            }
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, mode, playAlarm]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / (MODE_SETTINGS[mode].time * 60)) * 100;
    const strokeDashoffset = 440 - (440 * progress) / 100;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── Timer Display ─── */}
            <div className="space-y-6">
                <div className="p-12 rounded-[4rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-12 flex flex-col items-center">
                        {/* Mode Toggles */}
                        <div className="flex p-1.5 bg-[rgb(17,17,27)] rounded-[2rem] border border-[rgb(45,45,65)]">
                            {(Object.keys(MODE_SETTINGS) as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                        mode === m ? "bg-white text-black shadow-lg" : "text-[rgb(100,100,140)] hover:text-white"
                                    )}
                                >
                                    {MODE_SETTINGS[m].label.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        {/* Circular Timer */}
                        <div className="relative w-72 h-72">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="144" cy="144" r="70"
                                    className="stroke-[rgb(25,25,35)] fill-none stroke-[8px]"
                                />
                                <circle
                                    cx="144" cy="144" r="70"
                                    className={cn("fill-none stroke-[8px] transition-all duration-1000", MODE_SETTINGS[mode].ring)}
                                    strokeDasharray="440"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-mono font-bold text-white tracking-tighter">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em] mt-2", MODE_SETTINGS[mode].color)}>
                                    {isActive ? "Flow State" : "Paused"}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => switchMode(mode)}
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[rgb(120,120,160)] hover:text-white hover:bg-white/10 transition-all"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={cn(
                                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all shadow-xl",
                                    isActive ? "bg-white text-black scale-95" : cn(MODE_SETTINGS[mode].bg, "text-white hover:scale-105 shadow-2xl")
                                )}
                            >
                                {isActive ? <Pause className="w-8 h-8 fill-black" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                            </button>
                            <button
                                onClick={() => setVolume(!volume)}
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[rgb(120,120,160)] hover:text-white hover:bg-white/10 transition-all"
                            >
                                {volume ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                    <Brain className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">The Science of Break</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        Working in short sessions prevents mental fatigue and keeps your flow state levels high throughout the day.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest pl-1">Session Guide</h4>

                    <div className="space-y-5">
                        <div className="flex gap-4">
                            <Brain className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Focus Session (25m)</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">Commit 100% to a single task without any interruptions.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Coffee className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Quick Rest (5m)</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">Stretch, hydrate, or move away from your screen.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[11px] font-bold text-white mb-1">Long Break (15m)</p>
                                <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">After 4 sessions, take a longer rest to reset your brain.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] space-y-4">
                    <button
                        onClick={requestNotification}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                            notifications ? "bg-orange-500/10 border-orange-500/30 text-white" : "bg-white/5 border-white/5 text-[rgb(100,100,140)]"
                        )}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-tight flex items-center gap-3">
                            <Bell className="w-4 h-4" /> Deskop Alerts
                        </span>
                        {notifications ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-white/10" />}
                    </button>
                    <p className="text-[9px] text-[rgb(80,80,120)] uppercase tracking-widest text-center">Enable to receive browser alerts</p>
                </div>
            </div>
        </div>
    );
}
