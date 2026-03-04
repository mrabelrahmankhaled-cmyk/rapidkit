"use client";

import { useState, useEffect } from "react";
import {
    Globe,
    MapPin,
    Monitor,
    Copy,
    Check,
    ExternalLink,
    Shield,
    Zap,
    Navigation,
    Cpu,
    Network,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type IpData = {
    ip: string;
    city: string;
    region: string;
    country_name: string;
    org: string;
    postal: string;
    latitude: number;
    longitude: number;
    version: string;
};

export function WhatIsMyIpTool() {
    const [data, setData] = useState<IpData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [userAgent, setUserAgent] = useState("");

    useEffect(() => {
        setUserAgent(navigator.userAgent);
        fetchIpData();
    }, []);

    const fetchIpData = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://ipapi.co/json/");
            if (!res.ok) throw new Error("Failed to fetch IP data");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError("Unable to retrieve IP information. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (data?.ip) {
            navigator.clipboard.writeText(data.ip);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getBrowserInfo = () => {
        if (!userAgent) return "Detecting...";
        if (userAgent.includes("Firefox")) return "Mozilla Firefox";
        if (userAgent.includes("Chrome")) return "Google Chrome";
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Apple Safari";
        if (userAgent.includes("Edge")) return "Microsoft Edge";
        return "Standard Browser";
    };

    const getOsInfo = () => {
        if (!userAgent) return "Detecting...";
        if (userAgent.includes("Win")) return "Windows";
        if (userAgent.includes("Mac")) return "macOS";
        if (userAgent.includes("Linux")) return "Linux";
        if (userAgent.includes("Android")) return "Android";
        if (userAgent.includes("like Mac")) return "iOS";
        return "Unknown OS";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ─── IP Display Zone ─── */}
            <div className="space-y-6">
                <div className="p-12 rounded-[4rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

                    {loading ? (
                        <div className="space-y-6 flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-[rgb(100,100,140)] uppercase tracking-[0.2em] animate-pulse">Scanning Network...</p>
                        </div>
                    ) : error ? (
                        <div className="space-y-4">
                            <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <p className="text-rose-400 font-medium">{error}</p>
                            <button onClick={fetchIpData} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all">Try Again</button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-10">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                    <Globe className="w-3.5 h-3.5" /> Public IPv4 Address
                                </span>
                                <h2 className="text-5xl md:text-7xl font-mono font-bold text-white tracking-tighter break-all">
                                    {data?.ip}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex items-center gap-3 px-8 py-4 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all shadow-xl",
                                        copied ? "bg-emerald-500 text-black scale-95" : "bg-white text-black hover:scale-105"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "IP Copied" : "Copy IP Address"}
                                </button>
                                <a
                                    href={`https://www.google.com/maps?q=${data?.latitude},${data?.longitude}`}
                                    target="_blank"
                                    className="flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-[rgb(25,25,35)] border border-[rgb(45,45,65)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[rgb(35,35,45)] transition-all shadow-xl"
                                >
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    Show on Map
                                </a>
                            </div>
                        </>
                    )}
                </div>

                {/* Geolocation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <MapPin className="w-6 h-6 text-rose-500" />
                        <div>
                            <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">Location</p>
                            <p className="text-sm font-bold text-white">{data?.city}, {data?.country_name}</p>
                        </div>
                    </div>
                    <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <Zap className="w-6 h-6 text-amber-500" />
                        <div>
                            <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">ISP / Provider</p>
                            <p className="text-sm font-bold text-white max-w-[150px] truncate">{data?.org || "Unknown"}</p>
                        </div>
                    </div>
                    <div className="p-7 rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        <div>
                            <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">Region</p>
                            <p className="text-sm font-bold text-white">{data?.region || "Unknown"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-8 rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-8">
                    <div className="space-y-6">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> System Details
                        </label>

                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Browser</p>
                                <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                    {getBrowserInfo()}
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">Operating System</p>
                                <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                    {getOsOsInfo()}
                                    <Cpu className="w-3 h-3 text-indigo-400" />
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[rgb(35,35,55)]">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Note</span>
                        </div>
                        <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                            Your IP is only used to retrieve location data via a secure API request. RapidKit does not store or log your personal network identity.
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-600/20 text-white flex items-center justify-between px-6 py-5 group cursor-default">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Network className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Network Secure</span>
                    </div>
                    <Check className="w-4 h-4" />
                </div>
            </div>
        </div>
    );

    // Minor typo fix in the internal call
    function getOsOsInfo() {
        return getOsInfo();
    }
}
