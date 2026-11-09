"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Play,
    Pause,
    RotateCcw,
    FastForward,
    Coffee,
    Brain,
    Bell,
    Settings2,
    Sparkles,
    Check,
    Volume2,
    VolumeX,
    Plus,
    Trash2,
    Maximize2,
    Minimize2,
    Flame,
    Headphones,
    CloudRain,
    Waves,
    CheckCircle2,
    Circle,
    X,
    Sliders
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "work" | "short" | "long";
type AmbientSound = "none" | "rain" | "brown" | "waves";

interface TimerSettings {
    work: number; // minutes
    short: number;
    long: number;
    longInterval: number; // after how many pomodoros
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
}

interface TaskItem {
    id: string;
    text: string;
    completed: boolean;
    pomodorosRequired: number;
    pomodorosCompleted: number;
}

interface FocusStats {
    todayPomodoros: number;
    todayMinutes: number;
    totalPomodoros: number;
    streakDays: number;
    lastActiveDate: string; // YYYY-MM-DD
}

const DEFAULT_SETTINGS: TimerSettings = {
    work: 25,
    short: 5,
    long: 15,
    longInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
};

const MODE_CONFIG = {
    work: {
        label: "Focus Session",
        color: "text-rose-400",
        bg: "bg-rose-500",
        ring: "stroke-rose-500",
        glow: "shadow-rose-500/25",
        badge: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    },
    short: {
        label: "Quick Rest",
        color: "text-emerald-400",
        bg: "bg-emerald-500",
        ring: "stroke-emerald-500",
        glow: "shadow-emerald-500/25",
        badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    },
    long: {
        label: "Long Break",
        color: "text-cyan-400",
        bg: "bg-cyan-500",
        ring: "stroke-cyan-500",
        glow: "shadow-cyan-500/25",
        badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    },
};

function getTodayString(): string {
    return new Date().toISOString().split("T")[0];
}

export function PomodoroTimerTool() {
    // ─── Settings & State ────────────────────────────────────────────
    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [mode, setMode] = useState<Mode>("work");
    const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_SETTINGS.work * 60);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [volume, setVolume] = useState<boolean>(true);
    const [ambientSound, setAmbientSound] = useState<AmbientSound>("none");
    const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
    const [notifications, setNotifications] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    // ─── Task & Goal State ───────────────────────────────────────────
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskEst, setNewTaskEst] = useState(1);

    // ─── Productivity Stats ──────────────────────────────────────────
    const [stats, setStats] = useState<FocusStats>({
        todayPomodoros: 0,
        todayMinutes: 0,
        totalPomodoros: 0,
        streakDays: 1,
        lastActiveDate: getTodayString(),
    });

    const [completedCycles, setCompletedCycles] = useState<number>(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const ambientGainRef = useRef<GainNode | null>(null);
    const ambientOsc1Ref = useRef<OscillatorNode | null>(null);
    const ambientOsc2Ref = useRef<OscillatorNode | null>(null);

    // ─── LocalStorage Persistence ────────────────────────────────────
    useEffect(() => {
        queueMicrotask(() => {
            try {
                const savedTasks = localStorage.getItem("rapidkit_pomodoro_tasks");
                if (savedTasks) setTasks(JSON.parse(savedTasks));

                const savedSettings = localStorage.getItem("rapidkit_pomodoro_settings");
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    setSettings(parsed);
                    setTimeLeft(parsed.work * 60);
                }

                const savedStats = localStorage.getItem("rapidkit_pomodoro_stats");
                if (savedStats) {
                    const parsed: FocusStats = JSON.parse(savedStats);
                    const today = getTodayString();
                    if (parsed.lastActiveDate === today) {
                        setStats(parsed);
                    } else {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split("T")[0];
                        const isStreak = parsed.lastActiveDate === yesterdayStr;

                        setStats({
                            ...parsed,
                            todayPomodoros: 0,
                            todayMinutes: 0,
                            streakDays: isStreak ? parsed.streakDays : 1,
                            lastActiveDate: today,
                        });
                    }
                }

                if ("Notification" in window && Notification.permission === "granted") {
                    setNotifications(true);
                }
            } catch (e) {
                console.error("Failed to load pomodoro data", e);
            }
        });
    }, []);

    const saveStats = useCallback((newStats: FocusStats) => {
        setStats(newStats);
        try {
            localStorage.setItem("rapidkit_pomodoro_stats", JSON.stringify(newStats));
        } catch {
            // ignore
        }
    }, []);

    const saveTasks = useCallback((newTasks: TaskItem[]) => {
        setTasks(newTasks);
        try {
            localStorage.setItem("rapidkit_pomodoro_tasks", JSON.stringify(newTasks));
        } catch {
            // ignore
        }
    }, []);

    const saveSettings = (newSettings: TimerSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem("rapidkit_pomodoro_settings", JSON.stringify(newSettings));
        } catch {
            // ignore
        }
    };

    // ─── Audio Context & Sound Synthesis ─────────────────────────────
    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // ─── Stop Ambient Sound ──────────────────────────────────────────
    const stopAmbientSound = useCallback(() => {
        try {
            if (ambientSourceRef.current) {
                ambientSourceRef.current.stop();
                ambientSourceRef.current.disconnect();
                ambientSourceRef.current = null;
            }
            if (ambientOsc1Ref.current) {
                ambientOsc1Ref.current.stop();
                ambientOsc1Ref.current.disconnect();
                ambientOsc1Ref.current = null;
            }
            if (ambientOsc2Ref.current) {
                ambientOsc2Ref.current.stop();
                ambientOsc2Ref.current.disconnect();
                ambientOsc2Ref.current = null;
            }
        } catch {
            // ignore
        }
    }, []);

    // ─── Start Ambient Sound (100% Client-Side Web Audio API) ────────
    const startAmbientSound = useCallback((type: AmbientSound, vol: number) => {
        stopAmbientSound();
        if (type === "none") return;

        try {
            const ctx = getAudioContext();
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(Math.max(0.01, Math.min(1, vol)), ctx.currentTime);
            gain.connect(ctx.destination);
            ambientGainRef.current = gain;

            if (type === "rain" || type === "brown") {
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);

                if (type === "brown") {
                    let lastOut = 0.0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        data[i] = (lastOut + 0.02 * white) / 1.02;
                        lastOut = data[i];
                        data[i] *= 3.5;
                    }
                } else {
                    // Rain simulation: pink noise with random drops
                    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                    for (let i = 0; i < bufferSize; i++) {
                        const white = Math.random() * 2 - 1;
                        b0 = 0.99886 * b0 + white * 0.0555179;
                        b1 = 0.99332 * b1 + white * 0.0750759;
                        b2 = 0.96900 * b2 + white * 0.1538520;
                        b3 = 0.86650 * b3 + white * 0.3104856;
                        b4 = 0.55000 * b4 + white * 0.5329522;
                        b5 = -0.7616 * b5 - white * 0.0168980;
                        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
                        b6 = white * 0.115926;
                    }
                }

                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = ctx.createBiquadFilter();
                if (type === "brown") {
                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(320, ctx.currentTime);
                } else {
                    filter.type = "lowpass";
                    filter.frequency.setValueAtTime(1400, ctx.currentTime);
                }

                noise.connect(filter);
                filter.connect(gain);
                noise.start();
                ambientSourceRef.current = noise;
            } else if (type === "waves") {
                // Alpha Flow binaural waves (10Hz difference)
                const oscL = ctx.createOscillator();
                const oscR = ctx.createOscillator();
                oscL.type = "sine";
                oscR.type = "sine";
                oscL.frequency.setValueAtTime(196, ctx.currentTime);
                oscR.frequency.setValueAtTime(206, ctx.currentTime);

                const merger = ctx.createChannelMerger(2);
                oscL.connect(merger, 0, 0);
                oscR.connect(merger, 0, 1);
                merger.connect(gain);

                oscL.start();
                oscR.start();
                ambientOsc1Ref.current = oscL;
                ambientOsc2Ref.current = oscR;
            }
        } catch (e) {
            console.error("Ambient audio error", e);
        }
    }, [getAudioContext, stopAmbientSound]);

    // Handle Ambient Sound state changes
    useEffect(() => {
        if (isActive && ambientSound !== "none") {
            startAmbientSound(ambientSound, ambientVolume);
        } else {
            stopAmbientSound();
        }
        return () => stopAmbientSound();
    }, [isActive, ambientSound, ambientVolume, startAmbientSound, stopAmbientSound]);

    // ─── Completion Chime ────────────────────────────────────────────
    const playChime = useCallback(() => {
        if (!volume) return;
        try {
            const ctx = getAudioContext();
            const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
                gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.9);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.12);
                osc.stop(ctx.currentTime + idx * 0.12 + 1.0);
            });
        } catch (e) {
            console.error("Chime audio failed", e);
        }
    }, [volume, getAudioContext]);

    // ─── Desktop Notifications ───────────────────────────────────────
    const requestNotification = () => {
        if (!("Notification" in window)) return;
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") setNotifications(true);
        });
    };

    const notify = useCallback((title: string, body: string) => {
        if (notifications && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
                new Notification(title, { body, icon: "/icon" });
            } catch {
                // ignore
            }
        }
    }, [notifications]);

    // ─── Mode Switching Logic ────────────────────────────────────────
    const switchMode = useCallback((newMode: Mode, autoStart = false) => {
        setMode(newMode);
        const durationMinutes = settings[newMode];
        setTimeLeft(durationMinutes * 60);
        setIsActive(autoStart);
    }, [settings]);

    // ─── Complete Session Handler ────────────────────────────────────
    const handleSessionComplete = useCallback(() => {
        setIsActive(false);
        playChime();

        if (mode === "work") {
            const minutesFocused = settings.work;
            const today = getTodayString();
            const isSameDay = stats.lastActiveDate === today;

            const newStats: FocusStats = {
                todayPomodoros: isSameDay ? stats.todayPomodoros + 1 : 1,
                todayMinutes: isSameDay ? stats.todayMinutes + minutesFocused : minutesFocused,
                totalPomodoros: stats.totalPomodoros + 1,
                streakDays: isSameDay ? stats.streakDays : stats.streakDays + 1,
                lastActiveDate: today,
            };
            saveStats(newStats);

            // Increment task if active
            if (activeTaskId) {
                const updatedTasks = tasks.map((t) =>
                    t.id === activeTaskId
                        ? { ...t, pomodorosCompleted: t.pomodorosCompleted + 1 }
                        : t
                );
                saveTasks(updatedTasks);
            }

            const newCycleCount = completedCycles + 1;
            setCompletedCycles(newCycleCount);

            notify("Focus Session Complete! 🍅", "Great job! Time to take a refreshing break.");

            // Decide whether short or long break
            if (newCycleCount % settings.longInterval === 0) {
                switchMode("long", settings.autoStartBreaks);
            } else {
                switchMode("short", settings.autoStartBreaks);
            }
        } else {
            notify("Break is Over! 🚀", "Ready to jump back into flow state?");
            switchMode("work", settings.autoStartPomodoros);
        }
    }, [
        mode,
        settings,
        stats,
        activeTaskId,
        tasks,
        completedCycles,
        playChime,
        notify,
        saveStats,
        saveTasks,
        switchMode,
    ]);

    // ─── Main Timer Interval ─────────────────────────────────────────
    useEffect(() => {
        if (!isActive) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setTimeout(() => handleSessionComplete(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, handleSessionComplete]);

    // ─── Dynamic Browser Title Sync ──────────────────────────────────
    useEffect(() => {
        const formatTitleTime = (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        };

        if (isActive) {
            const prefix = mode === "work" ? "🎯 Focus" : "☕ Break";
            document.title = `(${formatTitleTime(timeLeft)}) ${prefix} | RapidKit`;
        } else {
            document.title = "Online Pomodoro Timer — Focus & Study Productivity Tool | RapidKit";
        }

        return () => {
            document.title = "Online Pomodoro Timer — Focus & Study Productivity Tool | RapidKit";
        };
    }, [isActive, timeLeft, mode]);

    // ─── Keyboard Shortcuts ──────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Do not trigger if typing in an input
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea") return;

            if (e.code === "Space") {
                e.preventDefault();
                setIsActive((prev) => !prev);
            } else if (e.key === "r" || e.key === "R") {
                switchMode(mode, false);
            } else if (e.key === "f" || e.key === "F") {
                setIsFullscreen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mode, switchMode]);

    // ─── Task Handlers ───────────────────────────────────────────────
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        const newTask: TaskItem = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false,
            pomodorosRequired: Math.max(1, newTaskEst),
            pomodorosCompleted: 0,
        };

        const updated = [...tasks, newTask];
        saveTasks(updated);
        if (!activeTaskId) setActiveTaskId(newTask.id);
        setNewTaskText("");
    };

    const toggleTaskCompleted = (id: string) => {
        const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        saveTasks(updated);
    };

    const deleteTask = (id: string) => {
        const updated = tasks.filter((t) => t.id !== id);
        saveTasks(updated);
        if (activeTaskId === id) setActiveTaskId(null);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // SVG Progress calculation (radius = 90, circumference = 2 * PI * 90 ≈ 565.48)
    const totalDurationSeconds = settings[mode] * 60;
    const progress = totalDurationSeconds > 0 ? (timeLeft / totalDurationSeconds) * 100 : 0;
    const circumference = 565.48;
    const strokeDashoffset = circumference - (circumference * progress) / 100;

    const activeTask = tasks.find((t) => t.id === activeTaskId);

    return (
        <div
            className={cn(
                "transition-all duration-300",
                isFullscreen
                    ? "fixed inset-0 z-50 bg-[rgb(10,10,15)] p-6 flex flex-col justify-center items-center h-screen w-screen overflow-y-auto"
                    : "space-y-8"
            )}
        >
            {/* ─── Top Zen / Fullscreen Exit Button ──────────────────── */}
            {isFullscreen && (
                <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="px-4 py-2 rounded-xl bg-[rgb(20,20,30)] border border-[rgb(45,45,65)] text-xs font-semibold text-white hover:bg-[rgb(30,30,45)] transition-all flex items-center gap-2 shadow-xl"
                    >
                        <Minimize2 className="w-4 h-4" />
                        <span>Exit Zen Mode</span>
                    </button>
                </div>
            )}

            <div
                className={cn(
                    "grid gap-8 items-start w-full",
                    isFullscreen ? "max-w-3xl" : "grid-cols-1 lg:grid-cols-[1fr_380px]"
                )}
            >
                {/* ─── Main Focus Chamber ───────────────────────────── */}
                <div className="space-y-6">
                    <div className="p-8 sm:p-12 rounded-[3.5rem] bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[520px]">
                        {/* Ambient glow matching active mode */}
                        <div
                            className={cn(
                                "absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-colors duration-700",
                                mode === "work" && "bg-rose-500",
                                mode === "short" && "bg-emerald-500",
                                mode === "long" && "bg-cyan-500"
                            )}
                        />

                        <div className="relative z-10 w-full flex flex-col items-center gap-8">
                            {/* Mode Navigation Pills */}
                            <div className="flex p-1.5 bg-[rgb(17,17,27)] rounded-2xl border border-[rgb(45,45,65)] shadow-inner">
                                {(["work", "short", "long"] as Mode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => switchMode(m)}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                                            mode === m
                                                ? cn(MODE_CONFIG[m].bg, "text-white shadow-lg", MODE_CONFIG[m].glow)
                                                : "text-[rgb(148,148,186)] hover:text-white"
                                        )}
                                    >
                                        {m === "work" ? "Focus" : m === "short" ? "Quick Rest" : "Long Rest"}
                                    </button>
                                ))}
                            </div>

                            {/* Circular Timer Display */}
                            <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    {/* Background track */}
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="90"
                                        className="stroke-[rgb(24,24,36)] fill-none stroke-[8px]"
                                    />
                                    {/* Animated Progress ring */}
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="90"
                                        className={cn(
                                            "fill-none stroke-[8px] transition-all duration-1000",
                                            MODE_CONFIG[mode].ring
                                        )}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                                    <span className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight">
                                        {formatTime(timeLeft)}
                                    </span>
                                    <div
                                        className={cn(
                                            "mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-1.5",
                                            MODE_CONFIG[mode].badge
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                isActive ? "animate-ping bg-current" : "bg-current"
                                            )}
                                        />
                                        <span>{isActive ? "Flow State" : "Paused"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Task Banner */}
                            {activeTask ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] text-xs text-[rgb(160,160,200)] max-w-sm truncate">
                                    <span className="text-rose-400 font-semibold">🎯 Target:</span>
                                    <span className="text-white font-medium truncate">{activeTask.text}</span>
                                    <span className="text-[10px] text-rose-300 font-mono shrink-0 ml-1">
                                        (🍅 {activeTask.pomodorosCompleted}/{activeTask.pomodorosRequired})
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        const el = document.getElementById("task-input-field");
                                        el?.focus();
                                    }}
                                    className="text-xs text-[rgb(110,110,150)] hover:text-white transition-colors"
                                >
                                    + Attach a goal to this session
                                </button>
                            )}

                            {/* Timer Action Controls */}
                            <div className="flex items-center gap-4 sm:gap-6 pt-2">
                                <button
                                    onClick={() => switchMode(mode)}
                                    className="p-3.5 rounded-2xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white hover:border-violet-500/50 transition-all shadow-md"
                                    title="Reset Current Interval (R)"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={cn(
                                        "w-20 sm:w-24 h-20 sm:h-24 rounded-3xl flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95",
                                        isActive
                                            ? "bg-white text-black shadow-white/20"
                                            : cn(MODE_CONFIG[mode].bg, "text-white", MODE_CONFIG[mode].glow)
                                    )}
                                    title={isActive ? "Pause (Space)" : "Start (Space)"}
                                >
                                    {isActive ? (
                                        <Pause className="w-9 h-9 fill-current" />
                                    ) : (
                                        <Play className="w-9 h-9 fill-current ml-1" />
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        if (mode === "work") switchMode("short");
                                        else switchMode("work");
                                    }}
                                    className="p-3.5 rounded-2xl bg-[rgb(20,20,32)] border border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white hover:border-violet-500/50 transition-all shadow-md"
                                    title="Skip to Next Session"
                                >
                                    <FastForward className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Secondary Toolbar Buttons */}
                            <div className="flex items-center gap-3 pt-2 text-xs text-[rgb(120,120,160)]">
                                <button
                                    onClick={() => setVolume(!volume)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:text-white transition-all"
                                    title={volume ? "Mute Bell" : "Unmute Bell"}
                                >
                                    {volume ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                                    <span>{volume ? "Sound On" : "Muted"}</span>
                                </button>

                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:text-white transition-all"
                                >
                                    <Settings2 className="w-4 h-4 text-violet-400" />
                                    <span>Settings</span>
                                </button>

                                {!isFullscreen && (
                                    <button
                                        onClick={() => setIsFullscreen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(38,38,58)] hover:text-white transition-all"
                                        title="Zen Mode (F)"
                                    >
                                        <Maximize2 className="w-4 h-4 text-cyan-400" />
                                        <span>Zen</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Integrated Task & To-Do List ─────────────────── */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span>Session Tasks</span>
                                <span className="text-xs text-[rgb(120,120,160)] font-normal">
                                    ({tasks.filter((t) => t.completed).length}/{tasks.length})
                                </span>
                            </h3>

                            <span className="text-[11px] text-[rgb(110,110,150)]">
                                Select a task to link timer
                            </span>
                        </div>

                        {/* Task creation form */}
                        <form onSubmit={handleAddTask} className="flex gap-2">
                            <input
                                id="task-input-field"
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="What task are you focusing on?"
                                className="flex-grow px-4 py-2.5 rounded-xl bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] text-sm text-white placeholder-[rgb(90,90,130)] focus:outline-none focus:border-rose-500/50 transition-all"
                            />

                            <div className="flex items-center gap-1 bg-[rgb(18,18,28)] border border-[rgb(45,45,65)] rounded-xl px-2">
                                <span className="text-xs text-[rgb(120,120,160)]">🍅</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={newTaskEst}
                                    onChange={(e) => setNewTaskEst(parseInt(e.target.value) || 1)}
                                    className="w-10 bg-transparent text-center text-xs text-white focus:outline-none font-mono"
                                    title="Estimated Pomodoros"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                            </button>
                        </form>

                        {/* Task Items List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                            {tasks.length === 0 ? (
                                <p className="text-xs text-center py-6 text-[rgb(100,100,140)]">
                                    No tasks added yet. Add your first goal above to boost completion rate!
                                </p>
                            ) : (
                                tasks.map((task) => {
                                    const isCurrent = task.id === activeTaskId;
                                    return (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-2xl border transition-all group",
                                                isCurrent
                                                    ? "bg-rose-500/10 border-rose-500/40"
                                                    : "bg-[rgb(18,18,28)] border-[rgb(35,35,50)] hover:border-[rgb(60,60,85)]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 truncate mr-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTaskCompleted(task.id)}
                                                    className="text-[rgb(120,120,160)] hover:text-emerald-400 transition-colors"
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                    ) : (
                                                        <Circle className="w-4 h-4" />
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTaskId(task.id)}
                                                    className={cn(
                                                        "text-xs font-medium text-left truncate transition-colors",
                                                        task.completed
                                                            ? "line-through text-[rgb(100,100,140)]"
                                                            : isCurrent
                                                            ? "text-white font-semibold"
                                                            : "text-[rgb(180,180,210)] hover:text-white"
                                                    )}
                                                >
                                                    {task.text}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[11px] font-mono text-[rgb(130,130,170)]">
                                                    🍅 {task.pomodorosCompleted}/{task.pomodorosRequired}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteTask(task.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-[rgb(120,120,160)] hover:text-rose-400 transition-all"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Sidebar ───────────────────────────────────────── */}
                {!isFullscreen && (
                    <div className="space-y-6">
                        {/* ─── Daily Focus Stats Card ─── */}
                        <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Flame className="w-4 h-4 text-orange-400" />
                                    <span>Focus Stats</span>
                                </h4>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                                    🔥 {stats.streakDays} Day Streak
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="p-3.5 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(35,35,50)]">
                                    <span className="text-[10px] uppercase font-bold text-[rgb(110,110,150)] block mb-1">
                                        Today Focus
                                    </span>
                                    <p className="text-xl font-bold font-mono text-white">
                                        {stats.todayPomodoros} 🍅
                                    </p>
                                    <span className="text-[11px] text-[rgb(130,130,170)]">
                                        {stats.todayMinutes} mins
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-[rgb(18,18,28)] border border-[rgb(35,35,50)]">
                                    <span className="text-[10px] uppercase font-bold text-[rgb(110,110,150)] block mb-1">
                                        Total Lifetime
                                    </span>
                                    <p className="text-xl font-bold font-mono text-white">
                                        {stats.totalPomodoros} 🎯
                                    </p>
                                    <span className="text-[11px] text-[rgb(130,130,170)]">
                                        Sessions
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ─── Ambient Soundscapes Card ─── */}
                        <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                    <Headphones className="w-4 h-4" />
                                    <span>Ambient White Noise</span>
                                </h4>
                                <span className="text-[10px] text-[rgb(110,110,150)] font-medium">
                                    Web Audio API
                                </span>
                            </div>

                            <p className="text-xs text-[rgb(130,130,170)] leading-relaxed">
                                Continuous synthesized background noise to mask office distractions and lock into deep study.
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "none", label: "Mute", icon: VolumeX },
                                    { id: "rain", label: "Rainy Day", icon: CloudRain },
                                    { id: "brown", label: "Deep Focus", icon: Waves },
                                    { id: "waves", label: "Alpha Waves", icon: Brain },
                                ].map((snd) => {
                                    const IconComp = snd.icon;
                                    const isSelected = ambientSound === snd.id;
                                    return (
                                        <button
                                            key={snd.id}
                                            type="button"
                                            onClick={() => {
                                                const nextSnd = snd.id as AmbientSound;
                                                setAmbientSound(nextSnd);
                                                if (nextSnd !== "none" && !isActive) {
                                                    startAmbientSound(nextSnd, ambientVolume);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left",
                                                isSelected
                                                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                                                    : "bg-[rgb(18,18,28)] border-[rgb(35,35,50)] text-[rgb(148,148,186)] hover:text-white"
                                            )}
                                        >
                                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                                            <span>{snd.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Volume Slider */}
                            {ambientSound !== "none" && (
                                <div className="pt-2 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] text-[rgb(130,130,170)]">
                                        <span>Ambient Volume</span>
                                        <span>{Math.round(ambientVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={ambientVolume}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value);
                                            setAmbientVolume(v);
                                            if (ambientGainRef.current && audioCtxRef.current) {
                                                ambientGainRef.current.gain.setValueAtTime(v, audioCtxRef.current.currentTime);
                                            }
                                        }}
                                        className="w-full accent-cyan-400 cursor-pointer"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ─── Desktop Notifications Card (Fixed Typo) ─── */}
                        <div className="p-6 rounded-3xl bg-[rgb(12,12,18)] border border-[rgb(38,38,58)] space-y-3">
                            <button
                                onClick={requestNotification}
                                className={cn(
                                    "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left",
                                    notifications
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                        : "bg-[rgb(18,18,28)] border-[rgb(45,45,65)] text-[rgb(148,148,186)] hover:text-white"
                                )}
                            >
                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2.5">
                                    <Bell className="w-4 h-4 text-orange-400" /> Desktop Notifications
                                </span>
                                {notifications ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <span className="text-[10px] text-cyan-400">Enable</span>
                                )}
                            </button>
                            <p className="text-[10px] text-[rgb(110,110,150)] text-center leading-relaxed">
                                Alerts you when your work session ends even when in another browser tab.
                            </p>
                        </div>

                        {/* ─── Session Guide & Science ─── */}
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/15 via-[rgb(18,18,28)] to-rose-500/15 border border-[rgb(45,45,65)] space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                    The 25/5 Productivity Science
                                </h4>
                            </div>

                            <div className="space-y-3 text-xs text-[rgb(148,148,186)] leading-relaxed">
                                <div className="flex items-start gap-2.5">
                                    <Brain className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span><strong>Focus Block:</strong> Single-tasking for 25 minutes keeps prefrontal cortex fatigue at zero.</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Coffee className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span><strong>Micro-Rest:</strong> 5-minute break allows your brain to consolidate information and rest your eyes.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Settings Modal ─────────────────────────────────────── */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] shadow-2xl space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-[rgb(35,35,50)]">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Sliders className="w-4 h-4 text-violet-400" />
                                <span>Timer Settings</span>
                            </h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-1 rounded-lg text-[rgb(148,148,186)] hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Custom Intervals */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[rgb(180,180,210)] flex justify-between">
                                    <span>Focus Session Duration</span>
                                    <span className="font-mono text-rose-400">{settings.work} mins</span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="90"
                                    step="5"
                                    value={settings.work}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const updated = { ...settings, work: val };
                                        saveSettings(updated);
                                        if (mode === "work" && !isActive) setTimeLeft(val * 60);
                                    }}
                                    className="w-full accent-rose-500 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[rgb(180,180,210)] flex justify-between">
                                    <span>Quick Rest Duration</span>
                                    <span className="font-mono text-emerald-400">{settings.short} mins</span>
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="15"
                                    step="1"
                                    value={settings.short}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const updated = { ...settings, short: val };
                                        saveSettings(updated);
                                        if (mode === "short" && !isActive) setTimeLeft(val * 60);
                                    }}
                                    className="w-full accent-emerald-500 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[rgb(180,180,210)] flex justify-between">
                                    <span>Long Rest Duration</span>
                                    <span className="font-mono text-cyan-400">{settings.long} mins</span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="45"
                                    step="5"
                                    value={settings.long}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        const updated = { ...settings, long: val };
                                        saveSettings(updated);
                                        if (mode === "long" && !isActive) setTimeLeft(val * 60);
                                    }}
                                    className="w-full accent-cyan-500 cursor-pointer"
                                />
                            </div>

                            <div className="pt-2 border-t border-[rgb(35,35,50)] space-y-3">
                                <label className="flex items-center justify-between text-xs text-[rgb(180,180,210)] cursor-pointer">
                                    <span>Auto-start Breaks</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoStartBreaks}
                                        onChange={(e) => saveSettings({ ...settings, autoStartBreaks: e.target.checked })}
                                        className="w-4 h-4 accent-violet-500 rounded"
                                    />
                                </label>

                                <label className="flex items-center justify-between text-xs text-[rgb(180,180,210)] cursor-pointer">
                                    <span>Auto-start Pomodoros</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.autoStartPomodoros}
                                        onChange={(e) => saveSettings({ ...settings, autoStartPomodoros: e.target.checked })}
                                        className="w-4 h-4 accent-violet-500 rounded"
                                    />
                                </label>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSettings(false)}
                            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/25"
                        >
                            Save &amp; Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
