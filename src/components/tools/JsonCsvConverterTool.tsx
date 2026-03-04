"use client";

import { useState, useCallback, useMemo } from "react";
import Papa from "papaparse";
import {
    Table as TableIcon,
    FileJson,
    FileSpreadsheet,
    ArrowRightLeft,
    Download,
    Trash2,
    Check,
    Copy,
    AlertCircle,
    Info,
    Edit3,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "json-to-csv" | "csv-to-json";

export function JsonCsvConverterTool() {
    const [mode, setMode] = useState<Mode>("json-to-csv");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [dataPreview, setDataPreview] = useState<any[]>([]);

    // ─── Conversion Logic ───────────────────────────────────────────
    const handleConvert = useCallback(() => {
        setError(null);
        if (!input.trim()) {
            setOutput("");
            setDataPreview([]);
            return;
        }

        try {
            if (mode === "json-to-csv") {
                const parsed = JSON.parse(input);
                const dataArray = Array.isArray(parsed) ? parsed : [parsed];
                setDataPreview(dataArray);
                const csv = Papa.unparse(dataArray);
                setOutput(csv);
            } else {
                Papa.parse(input, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setDataPreview(results.data);
                        setOutput(JSON.stringify(results.data, null, 2));
                    },
                    error: (err: any) => {
                        setError(`CSV Parsing Error: ${err.message}`);
                    }
                });
            }
        } catch (e: any) {
            setError(mode === "json-to-csv" ? "Invalid JSON: Please check your format." : "Parsing error occurred.");
        }
    }, [input, mode]);

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
        setDataPreview([]);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const extension = mode === "json-to-csv" ? "csv" : "json";
        const mimeType = mode === "json-to-csv" ? "text/csv" : "application/json";
        const blob = new Blob([output], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `rapidkit-data.${extension}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // ─── Table Rendering ────────────────────────────────────────────
    const tableHeaders = useMemo(() => {
        if (dataPreview.length === 0) return [];
        return Object.keys(dataPreview[0]);
    }, [dataPreview]);

    return (
        <div className="flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] shadow-xl">
                <div className="flex p-1 rounded-xl bg-[rgb(10,10,15)] border border-[rgb(30,30,46)]">
                    <button
                        onClick={() => { setMode("json-to-csv"); handleClear(); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all",
                            mode === "json-to-csv" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                        )}
                    >
                        <FileJson className="w-4 h-4" />
                        JSON to CSV
                    </button>
                    <button
                        onClick={() => { setMode("csv-to-json"); handleClear(); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all",
                            mode === "csv-to-json" ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-[rgb(80,80,120)] hover:text-white"
                        )}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV to JSON
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleConvert}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 group shadow-lg shadow-emerald-500/10"
                    >
                        <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
                        Convert Now
                    </button>
                    <button
                        onClick={handleClear}
                        className="p-2.5 rounded-xl bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] text-[rgb(80,80,120)] hover:text-rose-400 hover:border-rose-400/30 transition-all"
                        title="Clear all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            Input {mode === "json-to-csv" ? "JSON" : "CSV"}
                        </label>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === "json-to-csv" ? '[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]' : 'id,name\n1,John\n2,Jane'}
                        className="w-full h-64 lg:h-80 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm font-mono focus:outline-none focus:border-violet-500/30 transition-all resize-none shadow-inner leading-relaxed"
                    />
                </div>

                {/* Output Area */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-[rgb(80,80,120)] uppercase tracking-widest flex items-center gap-2">
                            Output {mode === "json-to-csv" ? "CSV" : "JSON"}
                        </label>
                        <div className="flex gap-2">
                            <button onClick={handleCopy} className="p-1 px-2 rounded-lg bg-white/5 text-[10px] text-violet-400 hover:text-white transition-all flex items-center gap-1">
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                            <button onClick={handleDownload} className="p-1 px-2 rounded-lg bg-emerald-500/10 text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Download
                            </button>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        value={output}
                        className="w-full h-64 lg:h-80 p-5 rounded-2xl bg-[rgb(10,10,15)] border border-[rgb(45,45,65)] text-white text-sm font-mono focus:outline-none resize-none shadow-inner leading-relaxed opacity-80"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <p className="text-xs text-rose-400 font-medium">{error}</p>
                </div>
            )}

            {/* Table Preview */}
            {dataPreview.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <TableIcon className="w-4 h-4 text-violet-400" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live Table Preview</h3>
                        </div>
                        <span className="text-[10px] text-[rgb(80,80,120)] font-bold uppercase">{dataPreview.length} Rows Detected</span>
                    </div>

                    <div className="rounded-[2rem] bg-[rgb(17,17,27)] border border-[rgb(45,45,65)] overflow-hidden shadow-2xl overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-[rgb(45,45,65)]">
                                    {tableHeaders.map((header) => (
                                        <th key={header} className="px-6 py-4 text-left text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dataPreview.slice(0, 10).map((row, idx) => (
                                    <tr key={idx} className="border-b border-[rgb(45,45,65)] last:border-0 hover:bg-white/5 transition-colors">
                                        {tableHeaders.map((header) => (
                                            <td key={header} className="px-6 py-4 text-xs text-[rgb(150,150,180)] whitespace-nowrap bg-indigo-500/5 first:bg-indigo-500/10">
                                                {String(row[header])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {dataPreview.length > 10 && (
                            <div className="p-4 text-center bg-black/20 border-t border-[rgb(45,45,65)]">
                                <p className="text-[10px] text-[rgb(80,80,120)] font-bold uppercase italic">Viewing first 10 rows. Download to see full data.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 p-6 rounded-3xl bg-violet-600/5 border border-violet-500/10">
                <Info className="w-5 h-5 text-violet-400 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">How handles nested JSON?</h4>
                    <p className="text-[11px] text-[rgb(100,100,140)] leading-relaxed">
                        For JSON to CSV, we recommend using flat objects (key-value pairs). Nested objects will be converted to string representations in the CSV. Your data stays 100% private and is processed locally.
                    </p>
                </div>
            </div>
        </div>
    );
}
