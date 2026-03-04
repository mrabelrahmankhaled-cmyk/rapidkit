"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Monitor,
    Circle,
    Square,
    Download,
    Trash2,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Settings,
    Clock,
    ShieldCheck,
    Info,
    Sparkles,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ScreenRecorderTool() {
    const [recording, setRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);

    // ─── Timer Logic ───
    useEffect(() => {
        if (recording) {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [recording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ─── Recording Controls ───
    const startRecording = async () => {
        setPermissionError(null);
        try {
            // Get screen stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 30 } },
                audio: audioEnabled
            });

            let finalStream = screenStream;

            // If audio is enabled but not included in displayMedia (some browsers/OS don't support it well), 
            // we might want to capture mic separately and merge.
            if (audioEnabled) {
                try {
                    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const tracks = [...screenStream.getVideoTracks(), ...micStream.getAudioTracks()];
                    finalStream = new MediaStream(tracks);
                } catch (e) {
                    console.warn("Mic access denied, continuing with screen audio/silence");
                }
            }

            setStream(finalStream);
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = finalStream;
            }

            const recorder = new MediaRecorder(finalStream, {
                mimeType: "video/webm;codecs=vp9,opus"
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const url = URL.createObjectURL(blob);
                setRecordedUrl(url);
                chunksRef.current = [];

                // Stop all tracks
                finalStream.getTracks().forEach(track => track.stop());
                setStream(null);
                setRecording(false);
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setRecording(true);
            setDuration(0);
            setRecordedUrl(null);

            // Handle accidental stream stop (e.g., user clicks "Stop Sharing" in browser bar)
            screenStream.getVideoTracks()[0].onended = () => {
                if (recorder.state !== "inactive") {
                    recorder.stop();
                }
            };

        } catch (error: any) {
            console.error("Recording error:", error);
            if (error.name === "NotAllowedError") {
                setPermissionError("Permission denied. We need access to capture your screen.");
            } else {
                setPermissionError("Failed to start recording. Please check your browser settings.");
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    const handleClear = () => {
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(null);
        setDuration(0);
    };

    const handleDownload = () => {
        if (!recordedUrl) return;
        const a = document.createElement("a");
        a.href = recordedUrl;
        a.download = `rapidkit-record-${new Date().getTime()}.webm`;
        a.click();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
            {/* ─── Main Recording Surface ─── */}
            <div className="space-y-6">
                <div className={cn(
                    "relative aspect-video rounded-[3rem] border-2 overflow-hidden transition-all duration-500 shadow-2xl bg-black flex flex-col items-center justify-center",
                    recording ? "border-rose-500 ring-4 ring-rose-500/10" : "border-[rgb(45,45,65)]"
                )}>
                    {/* Recording Overlays */}
                    {recording && (
                        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-xs font-bold text-white tracking-widest uppercase">REC</span>
                            </div>
                            <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 font-mono text-sm text-white">
                                {formatTime(duration)}
                            </div>
                        </div>
                    )}

                    {/* Pre-recording State */}
                    {!recording && !recordedUrl && (
                        <div className="text-center space-y-6 max-w-md px-6 relative z-10">
                            <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                                <Monitor className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Ready to Capture?</h3>
                            <p className="text-sm text-[rgb(120,120,160)] leading-relaxed">
                                Record your screen, selective windows, or single tabs. Perfect for demos, bug reports, and tutorials.
                            </p>

                            {permissionError && (
                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                                    {permissionError}
                                </div>
                            )}

                            <button
                                onClick={startRecording}
                                className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold flex items-center justify-center gap-3 hover:bg-rose-400 transition-all shadow-xl shadow-rose-500/20 group"
                            >
                                <Circle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                                Start Recording
                            </button>
                        </div>
                    )}

                    {/* Active Stream Preview */}
                    {recording && (
                        <video
                            ref={videoPreviewRef}
                            autoPlay
                            muted
                            className="w-full h-full object-contain"
                        />
                    )}

                    {/* Playback Finished Recording */}
                    {recordedUrl && (
                        <video
                            src={recordedUrl}
                            controls
                            className="w-full h-full object-contain"
                        />
                    )}

                    {/* Gradient Background for empty state */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent pointer-events-none" />
                </div>

                {/* Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] shadow-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            disabled={recording}
                            className={cn(
                                "p-4 rounded-2xl border transition-all flex items-center gap-3",
                                audioEnabled
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-white/5 border-white/5 text-white/40"
                            )}
                        >
                            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                                Mic {audioEnabled ? 'ON' : 'OFF'}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {recording ? (
                            <button
                                onClick={stopRecording}
                                className="px-10 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl"
                            >
                                <Square className="w-4 h-4 fill-black" />
                                Stop Capture
                            </button>
                        ) : recordedUrl ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClear}
                                    className="p-4 rounded-2xl bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 transition-all"
                                    title="Discard Recording"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-bold flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                    <Download className="w-5 h-5" />
                                    Download WebM
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-[rgb(80,80,120)]">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Ready to go</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Designer Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-600 to-pink-700 text-white shadow-xl shadow-rose-600/20 relative overflow-hidden">
                    <Video className="w-10 h-10 mb-4 opacity-50" />
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 relative">No Limits, Just Capture</h4>
                    <p className="text-xs text-white/80 leading-relaxed relative">
                        Enjoy unlimited recording time and zero watermarks. Your videos are yours, and they never leave your machine.
                    </p>
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Usage Tips
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed">
                                Use <strong>Ctrl + Tab</strong> to quickly switch between recording sources.
                            </p>
                        </li>
                        <li className="flex gap-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <p className="text-[11px] text-[rgb(120,120,160)] leading-relaxed">
                                Best results on <strong>Chrome, Edge, or Firefox</strong>. Safari may have limited tab-share support.
                            </p>
                        </li>
                    </ul>
                </div>

                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-white mb-1">Privacy First</p>
                            <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                                We Use the browser's <strong>Native API</strong>. Pixel data stays local for maximum security.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-[2rem] border border-[rgb(45,45,65)] flex gap-4 items-center">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-[rgb(100,100,140)]">
                        <strong>HD Quality:</strong> Up to 1080p supported based on your monitor resolution.
                    </p>
                </div>
            </div>
        </div>
    );
}
