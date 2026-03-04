"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    Link as LinkIcon,
    Wifi,
    Palette,
    Download,
    Image as ImageIcon,
    Trash2,
    Type,
    ShieldCheck,
    Eye,
    EyeOff,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type QrType = "url" | "wifi" | "text";

export function QrCodeGeneratorTool() {
    const [qrType, setQrType] = useState<QrType>("url");
    const [url, setUrl] = useState("https://rapidkit.tools");
    const [text, setText] = useState("");

    // Wi-Fi State
    const [ssid, setSsid] = useState("");
    const [password, setPassword] = useState("");
    const [encryption, setEncryption] = useState("WPA");
    const [showPassword, setShowPassword] = useState(false);

    // Customization
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [includeLogo, setIncludeLogo] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState(40);

    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const qrRef = useRef<SVGSVGElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Computed QR Value ───────────────────────────────────────────
    const qrValue = useCallback(() => {
        if (qrType === "url") return url || "https://rapidkit.tools";
        if (qrType === "text") return text || "RapidKit";
        if (qrType === "wifi") {
            // Format: WIFI:S:SSID;T:WPA;P:PASSWORD;;
            return `WIFI:S:${ssid};T:${encryption};P:${password};;`;
        }
        return "";
    }, [qrType, url, text, ssid, password, encryption]);

    // ─── Handlers ───────────────────────────────────────────────────
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
                setIncludeLogo(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoUrl(null);
        setIncludeLogo(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const downloadQr = (format: "png" | "svg") => {
        const svg = qrRef.current;
        if (!svg) return;

        setDownloading(true);

        if (format === "svg") {
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = `rapidkit-qr-${Date.now()}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            // PNG Export using Canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const svgData = new XMLSerializer().serializeToString(svg);
            const img = new Image();
            const svgSize = 1000; // High resolution

            canvas.width = svgSize;
            canvas.height = svgSize;

            img.onload = () => {
                if (ctx) {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, svgSize, svgSize);
                    const pngUrl = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = pngUrl;
                    downloadLink.download = `rapidkit-qr-${Date.now()}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        }

        setTimeout(() => setDownloading(false), 500);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start">
            {/* ─── Left Configuration ───────────────────────── */}
            <div className="space-y-6">
                {/* Type Selector */}
                <div className="flex bg-[rgb(17,17,27)] p-1 rounded-xl border border-[rgb(45,45,65)]">
                    {[
                        { id: "url", icon: LinkIcon, label: "URL" },
                        { id: "wifi", icon: Wifi, label: "Wi-Fi" },
                        { id: "text", icon: Type, label: "Text" }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setQrType(item.id as QrType)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
                                qrType === item.id
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                    : "text-[rgb(80,80,120)] hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Dynamic Inputs */}
                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-5">
                    {qrType === "url" && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Website URL</h3>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Link</label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {qrType === "wifi" && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Wi-Fi Configuration</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">SSID (Network Name)</label>
                                    <input
                                        type="text"
                                        value={ssid}
                                        onChange={(e) => setSsid(e.target.value)}
                                        placeholder="Home_WiFi"
                                        className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Encryption</label>
                                    <select
                                        value={encryption}
                                        onChange={(e) => setEncryption(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                    >
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">None (Open)</option>
                                    </select>
                                </div>
                            </div>
                            {encryption !== "nopass" && (
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 pr-11 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(80,80,120)] hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                                <ShieldCheck className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-[rgb(120,120,160)]">
                                    Scan-to-Join: This QR code allows people to join your Wi-Fi network instantly without typing the password.
                                </p>
                            </div>
                        </div>
                    )}

                    {qrType === "text" && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Plain Text</h3>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[rgb(80,80,120)] font-medium">Content</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type anything here..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Customization Options */}
                <div className="p-6 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] space-y-6">
                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Appearance</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Colors */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs text-[rgb(80,80,120)]">Foreground Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => setFgColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                                    />
                                    <span className="font-mono text-sm text-white">{fgColor.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[rgb(80,80,120)]">Background Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer border border-[rgb(45,45,65)]"
                                    />
                                    <span className="font-mono text-sm text-white">{bgColor.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="space-y-4 border-l border-[rgb(30,30,46)] pl-6">
                            <div className="space-y-2">
                                <label className="text-xs text-[rgb(80,80,120)]">Center Logo</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                    />
                                    {!logoUrl ? (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-dashed border-[rgb(45,45,65)] text-xs text-[rgb(80,80,120)] hover:text-white hover:border-violet-500/50 transition-all"
                                        >
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            Upload Image
                                        </button>
                                    ) : (
                                        <div className="relative group w-20 h-20 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] overflow-hidden">
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                            <button
                                                onClick={removeLogo}
                                                className="absolute inset-0 bg-red-500/80 items-center justify-center hidden group-hover:flex transition-all"
                                            >
                                                <Trash2 className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {logoUrl && (
                                <div className="space-y-2">
                                    <label className="text-xs text-[rgb(80,80,120)]">Logo Size: {logoSize}px</label>
                                    <input
                                        type="range"
                                        min={20}
                                        max={80}
                                        value={logoSize}
                                        onChange={(e) => setLogoSize(Number(e.target.value))}
                                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500 bg-[rgb(10,10,15)]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right Preview ────────────────────────────── */}
            <div className="sticky top-24 space-y-5">
                <div className="p-8 rounded-3xl bg-white shadow-2xl shadow-violet-500/10 flex items-center justify-center overflow-hidden">
                    <div className="relative p-4 bg-white rounded-2xl">
                        <QRCodeSVG
                            value={qrValue()}
                            size={240}
                            fgColor={fgColor}
                            bgColor={bgColor}
                            level="H"
                            ref={qrRef}
                            includeMargin={false}
                            imageSettings={logoUrl ? {
                                src: logoUrl,
                                height: logoSize,
                                width: logoSize,
                                excavate: true,
                            } : undefined}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => downloadQr("png")}
                            disabled={downloading}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-xl shadow-violet-600/30 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            PNG
                        </button>
                        <button
                            onClick={() => downloadQr("svg")}
                            disabled={downloading}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[rgb(30,30,46)] border border-[rgb(45,45,65)] text-white text-sm font-semibold hover:bg-[rgb(40,40,60)] transition-all disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            SVG
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(qrValue());
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all",
                            copied
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-transparent border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-white"
                        )}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        {copied ? "Value Copied!" : "Copy Data Value"}
                    </button>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                    <h4 className="text-xs font-bold text-violet-300 uppercase mb-1 tracking-wider">Design Tip</h4>
                    <p className="text-xs text-[rgb(100,100,140)] leading-relaxed">
                        High-contrast colors work best for QR codes. Ensure your background is light and foreground is dark for maximum readability.
                    </p>
                </div>
            </div>
        </div>
    );
}
