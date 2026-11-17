"use client";

import { useState, useEffect } from "react";
import {
    Globe,
    MapPin,
    Monitor,
    Copy,
    Check,
    Shield,
    Zap,
    Navigation,
    Cpu,
    Network,
    Sparkles,
    Info,
    Smartphone,
    Layers
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

type GpsLocation = {
    latitude: number;
    longitude: number;
    city: string;
    region: string;
    country: string;
};

export function WhatIsMyIpTool() {
    const [data, setData] = useState<IpData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [userAgent, setUserAgent] = useState("");
    const [screenResolution, setScreenResolution] = useState("");

    // Exact GPS Location
    const [gpsLocation, setGpsLocation] = useState<GpsLocation | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setUserAgent(navigator.userAgent);
            setScreenResolution(
                `${window.screen.width} × ${window.screen.height} (${window.devicePixelRatio || 1}x)`
            );
        }
        fetchIpData();
    }, []);

    const fetchIpData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Primary provider: ipapi.co
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) {
                const json = await res.json();
                if (json.ip && !json.error) {
                    setData(json);
                    return;
                }
            }

            // Fallback provider: ipwho.is
            const fallbackRes = await fetch("https://ipwho.is/");
            if (fallbackRes.ok) {
                const fb = await fallbackRes.json();
                if (fb.success !== false && fb.ip) {
                    setData({
                        ip: fb.ip,
                        city: fb.city || "Unknown City",
                        region: fb.region || "Unknown Region",
                        country_name: fb.country || "Unknown Country",
                        org: fb.connection?.isp || fb.connection?.org || "Unknown ISP",
                        postal: fb.postal || "",
                        latitude: fb.latitude || 0,
                        longitude: fb.longitude || 0,
                        version: fb.type || "IPv4",
                    });
                    return;
                }
            }

            throw new Error("Unable to retrieve IP data from network providers");
        } catch {
            setError("Unable to retrieve IP information. Please check your connection or ad blocker.");
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

    const handleGetGps = () => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setGpsError("Geolocation is not supported by your current browser.");
            return;
        }

        setGpsLoading(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&accept-language=en,ar`
                    );
                    if (res.ok) {
                        const json = await res.json();
                        const addr = json.address || {};
                        const city =
                            addr.city ||
                            addr.town ||
                            addr.village ||
                            addr.municipality ||
                            addr.suburb ||
                            addr.county ||
                            "Exact Location";
                        const region = addr.state || addr.governorate || addr.province || "Physical Region";
                        const country = addr.country || data?.country_name || "Egypt";

                        setGpsLocation({
                            latitude,
                            longitude,
                            city,
                            region,
                            country,
                        });
                    } else {
                        setGpsLocation({
                            latitude,
                            longitude,
                            city: "Exact GPS Pin",
                            region: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                            country: data?.country_name || "",
                        });
                    }
                } catch {
                    setGpsLocation({
                        latitude,
                        longitude,
                        city: "Exact GPS Pin",
                        region: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        country: data?.country_name || "",
                    });
                } finally {
                    setGpsLoading(false);
                }
            },
            (err) => {
                setGpsLoading(false);
                if (err.code === 1) {
                    setGpsError("Location permission denied. Please allow location access in your browser settings.");
                } else if (err.code === 2) {
                    setGpsError("GPS signal unavailable. Ensure your device location is enabled.");
                } else {
                    setGpsError("Location request timed out. Please try again.");
                }
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
        );
    };

    const getBrowserInfo = () => {
        if (!userAgent) return "Detecting...";
        if (/Edg|Edge/i.test(userAgent)) return "Microsoft Edge";
        if (/SamsungBrowser/i.test(userAgent)) return "Samsung Internet";
        if (/OPR|Opera/i.test(userAgent)) return "Opera";
        if (/Firefox|FxiOS/i.test(userAgent)) return "Mozilla Firefox";
        if (/Chrome|CriOS/i.test(userAgent) && !/Edg|Edge|OPR|SamsungBrowser/i.test(userAgent)) return "Google Chrome";
        if (/Safari/i.test(userAgent) && !/Chrome|CriOS|Android|Edg|Edge|OPR|SamsungBrowser/i.test(userAgent)) return "Apple Safari";
        return "Web Browser";
    };

    const getOsInfo = () => {
        if (!userAgent) return "Detecting...";

        // iOS detection (iPhone, iPad, iPod)
        const isTouchMac =
            typeof navigator !== "undefined" &&
            navigator.platform === "MacIntel" &&
            (navigator.maxTouchPoints || 0) > 1;

        const isIOS = /iPhone|iPod/.test(userAgent) || /iPad/.test(userAgent) || isTouchMac;

        if (isIOS) {
            if (/iPad/.test(userAgent) || isTouchMac) {
                return "iPadOS";
            }
            return "iOS (iPhone)";
        }

        // Android detection
        if (/Android/i.test(userAgent)) {
            return /Mobile/i.test(userAgent) ? "Android (Phone)" : "Android (Tablet)";
        }

        // Windows detection
        if (/Windows/i.test(userAgent)) {
            if (/Windows NT 10.0/i.test(userAgent)) return "Windows 10 / 11";
            return "Windows";
        }

        // macOS detection (standard Mac desktop / laptop)
        if (/Macintosh|Mac OS X/i.test(userAgent)) {
            return "macOS";
        }

        // ChromeOS detection
        if (/CrOS/i.test(userAgent)) {
            return "ChromeOS";
        }

        // Linux detection
        if (/Linux/i.test(userAgent)) {
            return "Linux";
        }

        return "Unknown OS";
    };

    const getDeviceType = () => {
        if (!userAgent) return "Detecting...";
        const isTouchMac =
            typeof navigator !== "undefined" &&
            navigator.platform === "MacIntel" &&
            (navigator.maxTouchPoints || 0) > 1;

        if (/iPad|tablet/i.test(userAgent) || isTouchMac) {
            return "Tablet";
        }
        if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) {
            return "Mobile Phone";
        }
        return "Desktop / Laptop";
    };

    const activeLat = gpsLocation ? gpsLocation.latitude : data?.latitude;
    const activeLng = gpsLocation ? gpsLocation.longitude : data?.longitude;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 md:gap-8 items-start">
            {/* ─── IP Display Zone ─── */}
            <div className="space-y-6">
                <div className="p-4 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl md:rounded-[4rem] bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

                    {loading ? (
                        <div className="space-y-6 flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-[rgb(100,100,140)] uppercase tracking-[0.2em] animate-pulse">
                                Scanning Network...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="space-y-4">
                            <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <p className="text-rose-400 font-medium">{error}</p>
                            <button
                                type="button"
                                onClick={fetchIpData}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 mb-8 md:mb-10 w-full min-w-0">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center justify-center gap-2">
                                    <Globe className="w-3.5 h-3.5 shrink-0" /> Public {data?.version || "IPv4"} Address
                                </span>
                                <h2 className="text-2xl sm:text-5xl md:text-7xl font-mono font-bold text-white tracking-tight break-all">
                                    {data?.ip}
                                </h2>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className={cn(
                                        "w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-[2rem] font-bold text-xs uppercase tracking-wider sm:tracking-widest transition-all shadow-xl whitespace-nowrap",
                                        copied ? "bg-emerald-500 text-black scale-95" : "bg-white text-black hover:scale-105"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                                    <span>{copied ? "IP Copied" : "Copy IP Address"}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleGetGps}
                                    disabled={gpsLoading}
                                    className={cn(
                                        "w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-[2rem] font-bold text-xs uppercase tracking-wider sm:tracking-widest transition-all shadow-xl whitespace-nowrap border",
                                        gpsLocation
                                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                                            : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-indigo-600/25"
                                    )}
                                    title="Detect exact physical governorate and coordinates using device GPS"
                                >
                                    {gpsLoading ? (
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                                    ) : gpsLocation ? (
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                        <Navigation className="w-4 h-4 text-white shrink-0" />
                                    )}
                                    <span>{gpsLocation ? "GPS Verified (Update)" : "Detect Exact GPS"}</span>
                                </button>

                                {activeLat && activeLng ? (
                                    <a
                                        href={`https://www.google.com/maps?q=${activeLat},${activeLng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-[2rem] bg-[rgb(25,25,35)] border border-[rgb(45,45,65)] text-white font-bold text-xs uppercase tracking-wider sm:tracking-widest hover:bg-[rgb(35,35,45)] transition-all shadow-xl whitespace-nowrap"
                                    >
                                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                                        <span>Show on Map</span>
                                    </a>
                                ) : null}
                            </div>

                            {gpsError && (
                                <p className="text-xs text-amber-400 mt-4 max-w-md bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl">
                                    {gpsError}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Geolocation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Location / City Card */}
                    <div className="p-5 sm:p-7 rounded-2xl md:rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <MapPin className={cn("w-6 h-6", gpsLocation ? "text-emerald-400" : "text-rose-500")} />
                        <div>
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    Location (City)
                                </p>
                                {gpsLocation ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                                        GPS
                                    </span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                                        ISP
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-white">
                                {gpsLocation
                                    ? `${gpsLocation.city}, ${gpsLocation.country}`
                                    : `${data?.city || "Unknown"}, ${data?.country_name || ""}`}
                            </p>
                        </div>
                    </div>

                    {/* ISP Card */}
                    <div className="p-5 sm:p-7 rounded-2xl md:rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <Zap className="w-6 h-6 text-amber-500" />
                        <div>
                            <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest mb-1">
                                ISP / Provider
                            </p>
                            <p className="text-sm font-bold text-white max-w-[220px] md:max-w-[150px] truncate" title={data?.org}>
                                {data?.org || "Unknown"}
                            </p>
                        </div>
                    </div>

                    {/* Region / Governorate Card */}
                    <div className="p-5 sm:p-7 rounded-2xl md:rounded-[2.5rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-500/30 transition-all">
                        <Globe className={cn("w-6 h-6", gpsLocation ? "text-emerald-400" : "text-indigo-500")} />
                        <div>
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    Governorate / Region
                                </p>
                                {gpsLocation ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
                                        GPS
                                    </span>
                                ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider">
                                        ISP
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-bold text-white">
                                {gpsLocation ? gpsLocation.region : (data?.region || "Unknown")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Explanatory Banner: Why IP Location differs from GPS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-xs text-[rgb(130,130,165)] flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-white text-xs">
                            Why does IP location show a different city or governorate?
                        </p>
                        <p className="leading-relaxed text-[11px] text-[rgb(140,140,175)]">
                            Public IP geolocation reflects where your telecom carrier routes network traffic (cellular CGNAT gateways or central exchanges in Cairo/Giza), rather than your phone&apos;s physical GPS chip. Tap <strong>&quot;Detect Exact GPS&quot;</strong> above to view your device&apos;s exact physical governorate and street coordinates.
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
                <div className="p-5 sm:p-8 rounded-2xl md:rounded-[3rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6 md:space-y-8">
                    <div className="space-y-6">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> System &amp; Device Details
                        </label>

                        <div className="space-y-3">
                            {/* Operating System */}
                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    Operating System
                                </p>
                                <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                    <span>{getOsInfo()}</span>
                                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                </p>
                            </div>

                            {/* Device Type */}
                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    Device Type
                                </p>
                                <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                    <span>{getDeviceType()}</span>
                                    <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                                </p>
                            </div>

                            {/* Browser */}
                            <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                    Browser
                                </p>
                                <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                    <span>{getBrowserInfo()}</span>
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                </p>
                            </div>

                            {/* Screen Resolution */}
                            {screenResolution && (
                                <div className="p-4 rounded-2xl bg-[rgb(10,10,15)] border border-white/5 space-y-1">
                                    <p className="text-[9px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest">
                                        Screen Resolution
                                    </p>
                                    <p className="text-xs font-bold text-indigo-100 flex items-center justify-between">
                                        <span className="font-mono text-[11px]">{screenResolution}</span>
                                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[rgb(35,35,55)]">
                        <div className="flex items-center gap-3 text-emerald-400 mb-2">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Note</span>
                        </div>
                        <p className="text-[10px] text-[rgb(120,120,160)] leading-relaxed">
                            Your IP and location data are queried entirely client-side. RapidKit does not store, log, or track your personal network identity or GPS coordinates.
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
}
