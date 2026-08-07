"use client";

import { useState, useRef } from "react";
import {
    ShieldCheck, ShieldAlert, ShieldX, Search, AlertTriangle,
    CheckCircle2, Info, ArrowRight, Loader2, X, Globe, Wallet,
    ChevronRight, Clock,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CheckResult {
    input: string;
    type: "wallet" | "url" | "unknown";
    score: number;
    risk: { level: string; color: string; advice: string };
    flags: string[];
    info: string[];
    checkedAt: string;
}

// ── Risk meter arc ─────────────────────────────────────────────────────────────
function RiskMeter({ score }: { score: number }) {
    const pct = Math.min(score, 100) / 100;
    const r = 54;
    const circ = Math.PI * r; // half circle
    const dash = circ * pct;

    const color =
        score >= 70 ? "#ef4444" :
        score >= 40 ? "#f97316" :
        score >= 15 ? "#eab308" :
        "#22c55e";

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 130 70" className="w-44 h-24">
                {/* Track */}
                <path
                    d="M 10 65 A 54 54 0 0 1 120 65"
                    fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round"
                />
                {/* Fill */}
                <path
                    d="M 10 65 A 54 54 0 0 1 120 65"
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ}`}
                    style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)" }}
                />
                {/* Score */}
                <text x="65" y="62" textAnchor="middle" fontSize="22" fontWeight="bold" fill={color} fontFamily="system-ui">
                    {score}
                </text>
                <text x="65" y="75" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="system-ui">
                    RISK SCORE
                </text>
            </svg>
            <div className="flex gap-4 text-[10px] text-gray-400 mt-1">
                <span className="text-green-500 font-semibold">Safe</span>
                <span className="text-yellow-500 font-semibold">Caution</span>
                <span className="text-orange-500 font-semibold">Suspicious</span>
                <span className="text-red-500 font-semibold">Danger</span>
            </div>
        </div>
    );
}

// ── Recent checks (demo) ───────────────────────────────────────────────────────
const RECENT = [
    { label: "www.binance-secure-login.xyz", type: "url", risk: "HIGH RISK", color: "red" },
    { label: "0x7f268357a8c2552623316e2562d90e642bb538e5", type: "wallet", risk: "HIGH RISK", color: "red" },
    { label: "cryptodoubler.top", type: "url", risk: "HIGH RISK", color: "red" },
    { label: "elon-btc-giveaway.click", type: "url", risk: "HIGH RISK", color: "red" },
];

const EXAMPLE_CHECKS = [
    { label: "Paste a wallet address", value: "e.g. 0xAbC1234...", icon: <Wallet className="w-4 h-4" /> },
    { label: "Check a suspicious website", value: "e.g. crypto-doubler.xyz", icon: <Globe className="w-4 h-4" /> },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ScamCheckerPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleCheck = async (val?: string) => {
        const query = (val ?? input).trim();
        if (!query) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/check-scam", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: query }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Check failed");
            setResult(data);
            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        } catch (e: any) {
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const riskConfig = {
        red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    icon: <ShieldX className="w-6 h-6 text-red-600" />,    badge: "bg-red-100 text-red-700" },
        orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: <ShieldAlert className="w-6 h-6 text-orange-500" />, badge: "bg-orange-100 text-orange-700" },
        yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, badge: "bg-yellow-100 text-yellow-700" },
        green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  icon: <ShieldCheck className="w-6 h-6 text-green-600" />, badge: "bg-green-100 text-green-700" },
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0a0a0a] pt-16 pb-20 px-4 relative overflow-hidden">
                {/* Grid bg */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }}
                />
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#e8a020] opacity-5 blur-3xl pointer-events-none" />

                <div className="max-w-3xl mx-auto text-center relative">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest mb-5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Free Tool · No Signup Required
                    </span>
                    <h1 className="font-display text-white text-3xl sm:text-5xl font-bold leading-tight mb-4">
                        Free Crypto <span className="text-[#e8a020]">Scam Checker</span>
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-10">
                        Instantly check if a wallet address or website is associated with crypto fraud.
                        Powered by our forensic intelligence database.
                    </p>

                    {/* ── Input box ──────────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
                        <div className="p-2">
                            <div className="flex gap-2">
                                <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 border border-gray-200 focus-within:border-[#e8a020] focus-within:bg-white transition-all">
                                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                    <input
                                        ref={inputRef}
                                        id="scam-checker-input"
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                                        placeholder="Paste wallet address or website URL…"
                                        className="flex-1 py-4 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    {input && (
                                        <button onClick={() => { setInput(""); setResult(null); inputRef.current?.focus(); }}>
                                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleCheck()}
                                    disabled={loading || !input.trim()}
                                    id="scam-check-btn"
                                    className="px-6 py-3 bg-[#e8a020] hover:bg-[#d4911c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg flex items-center gap-2 shrink-0"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    {loading ? "Checking…" : "Check Now"}
                                </button>
                            </div>
                        </div>
                        {/* Quick examples */}
                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                            <span className="text-xs text-gray-400 self-center">Try:</span>
                            {["binance-secure.xyz", "0x7f268357a8c2552623316e2562d90e642bb538e5"].map((ex) => (
                                <button
                                    key={ex}
                                    onClick={() => { setInput(ex); handleCheck(ex); }}
                                    className="text-xs text-[#0066ff] hover:underline font-mono truncate max-w-[200px]"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 max-w-2xl mx-auto">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Results ───────────────────────────────────────────────────── */}
            <div className="max-w-3xl mx-auto px-4 py-10">
                {loading && (
                    <div className="flex flex-col items-center gap-4 py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#e8a020]" />
                        <p className="text-sm">Analysing against fraud database…</p>
                        <div className="flex gap-2 text-xs">
                            {["Checking known scam wallets", "Scanning domain patterns", "Analysing risk signals"].map((s, i) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" /> {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {result && !loading && (() => {
                    const cfg = riskConfig[result.risk.color as keyof typeof riskConfig] ?? riskConfig.green;
                    return (
                        <div ref={resultRef} className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
                            {/* Result header */}
                            <div className={`px-6 py-5 border-b ${cfg.border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                                <div className="flex items-center gap-3">
                                    {cfg.icon}
                                    <div>
                                        <span className={`text-xs font-bold uppercase tracking-widest ${cfg.text}`}>
                                            {result.type === "wallet" ? "Wallet Address" : result.type === "url" ? "Website URL" : "Input"} Analysis
                                        </span>
                                        <p className={`font-mono text-sm font-bold ${cfg.text} break-all`}>
                                            {result.input.length > 50 ? result.input.slice(0, 48) + "…" : result.input}
                                        </p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider ${cfg.badge} shrink-0`}>
                                    {result.risk.level}
                                </span>
                            </div>

                            {/* Meter + flags */}
                            <div className="p-6 grid sm:grid-cols-[auto_1fr] gap-8 items-start">
                                <RiskMeter score={result.score} />

                                <div className="space-y-3">
                                    {/* Advice */}
                                    <div className={`rounded-xl p-4 ${cfg.bg} border ${cfg.border}`}>
                                        <p className={`text-sm font-medium ${cfg.text} leading-relaxed`}>
                                            {result.risk.advice}
                                        </p>
                                    </div>

                                    {/* Flags */}
                                    {result.flags.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fraud Indicators</p>
                                            {result.flags.map((f, i) => (
                                                <div key={i} className="flex gap-2 items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                                    <span className="text-sm text-gray-700">{f.replace(/^[⚠️🚨]\s*/, "")}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Info */}
                                    {result.info.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Analysis Notes</p>
                                            {result.info.map((f, i) => (
                                                <div key={i} className="flex gap-2 items-start p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                                    <span className="text-sm text-gray-600">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        Checked {new Date(result.checkedAt).toLocaleTimeString()} — {new Date(result.checkedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            {result.score >= 30 && (
                                <div className="px-6 pb-6">
                                    <div className="bg-[#0a0a0a] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="text-white font-bold text-sm">Think you&apos;ve been scammed?</p>
                                            <p className="text-gray-400 text-xs mt-0.5">
                                                Our forensic team has recovered over $14M for victims. Free consultation, no upfront fees.
                                            </p>
                                        </div>
                                        <Link
                                            href="/about"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors text-sm shrink-0"
                                        >
                                            Start Recovery <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* ── How it works ──────────────────────────────────────────── */}
                {!result && !loading && (
                    <div className="space-y-10">
                        {/* Recent flagged */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Recently Flagged by Our System</p>
                            <div className="space-y-2">
                                {RECENT.map((r, i) => {
                                    const color = r.color === "red" ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50";
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(r.label); handleCheck(r.label); }}
                                            className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {r.type === "url" ? <Globe className="w-4 h-4 text-gray-400 shrink-0" /> : <Wallet className="w-4 h-4 text-gray-400 shrink-0" />}
                                                <span className="font-mono text-sm text-gray-700 truncate">{r.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{r.risk}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { icon: <Wallet className="w-5 h-5 text-[#0066ff]" />, title: "Wallet Lookup", desc: "Cross-references against known scam addresses from major fraud cases worldwide." },
                                { icon: <Globe className="w-5 h-5 text-[#00c47a]" />, title: "Domain Analysis", desc: "Detects impersonation patterns, suspicious TLDs, and fake crypto exchange sites." },
                                { icon: <ShieldCheck className="w-5 h-5 text-[#e8a020]" />, title: "Risk Scoring", desc: "Produces a 0–100 risk score with specific fraud indicators and actionable advice." },
                            ].map((step, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                                        {step.icon}
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm mb-1">{step.title}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-xs text-gray-400">
                            Already lost funds? <Link href="/about" className="text-[#0066ff] hover:underline font-medium">Start a free recovery consultation →</Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
