"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Globe, Star, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatProps {
    icon: React.ReactNode;
    value: number;
    suffix: string;
    prefix?: string;
    label: string;
    sublabel: string;
    accent: string;
    bg: string;
    started: boolean;
}

function StatCard({ icon, value, suffix, prefix = "", label, sublabel, accent, bg, started }: StatProps) {
    const count = useCounter(value, 1800, started);
    return (
        <div
            className="relative flex flex-col items-start p-6 sm:p-8 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: bg, border: `1.5px solid ${accent}22` }}
        >
            {/* Glow blob */}
            <div
                className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
                style={{ background: accent }}
            />
            {/* Icon pill */}
            <div
                className="flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                style={{ background: `${accent}20` }}
            >
                <span style={{ color: accent }}>{icon}</span>
            </div>
            {/* Number */}
            <div
                className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-1"
                style={{ color: accent }}
            >
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            {/* Label */}
            <div className="text-[#0a0a0a] font-bold text-sm sm:text-base mt-2 leading-snug">
                {label}
            </div>
            <div className="text-gray-400 text-xs mt-1 leading-relaxed">
                {sublabel}
            </div>
        </div>
    );
}

// ── Testimonial card ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        quote: "Huge shoutout to LazurusGroup. I thought my compromised wallet was a total loss, but they ran a full trace and showed me exactly where the funds went. Incredibly professional team.",
        name: "u/CryptoDefend",
        subreddit: "r/CryptoCurrency",
        platform: "Reddit",
        stars: 5,
    },
    {
        quote: "Was about to invest in a presale, but asked Lazurus to check it first. Their scam checker found the contract was hardcoded to prevent withdrawals. Saved me from a massive mistake.",
        name: "u/Web3_Watchman",
        subreddit: "r/Scams",
        platform: "Reddit",
        stars: 5,
    },
    {
        quote: "The best blockchain forensics team out there. Most places ask for fees upfront with no proof. Lazurus provided concrete evidence and a full trace report before anything else.",
        name: "u/BitcoinMaxi99",
        subreddit: "r/Bitcoin",
        platform: "Reddit",
        stars: 5,
    },
    {
        quote: "Got targeted by a sophisticated phishing scam. LazurusGroup helped secure my remaining assets and provided a detailed report I could take to the authorities. Highly recommend.",
        name: "u/AltcoinTrader",
        subreddit: "r/CryptoScams",
        platform: "Reddit",
        stars: 5,
    },
];

// ── Media mentions ─────────────────────────────────────────────────────────────
const MEDIA = [
    { name: "Forbes", style: "font-serif font-bold tracking-tight" },
    { name: "CoinDesk", style: "font-bold tracking-wide" },
    { name: "Reuters", style: "font-serif italic font-bold" },
    { name: "BBC News", style: "font-bold tracking-widest" },
    { name: "Bloomberg", style: "font-bold tracking-tight" },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function TrustSignals() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    // Trigger counter animation when section is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const t = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <section
            ref={sectionRef}
            className="w-full bg-white border-t border-gray-100"
            aria-label="Trust signals and social proof"
            id="trust-signals"
        >
            {/* ── Stats Bar ─────────────────────────────────────────────────── */}
            <div className="py-14 sm:py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8a020]/10 text-[#e8a020] text-xs font-bold uppercase tracking-widest mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Proven Track Record
                        </span>
                        <h2 className="font-display text-[#0a0a0a] text-2xl sm:text-3xl font-bold">
                            The numbers don&apos;t lie
                        </h2>
                        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                            Real results from real clients — verified and independently audited.
                        </p>
                    </div>

                    {/* Stat cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <StatCard
                            icon={<ShieldCheck className="w-6 h-6" />}
                            value={847}
                            suffix="+"
                            label="Forensic Audits"
                            sublabel="Comprehensive wallet and contract investigations"
                            accent="#00c47a"
                            bg="#f0fdf8"
                            started={started}
                        />
                        <StatCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            value={250}
                            suffix="M+"
                            prefix="$"
                            label="Assets Traced"
                            sublabel="Total funds tracked across blockchains for authorities"
                            accent="#e8a020"
                            bg="#fffbeb"
                            started={started}
                        />
                        <StatCard
                            icon={<Globe className="w-6 h-6" />}
                            value={47}
                            suffix="+"
                            label="Countries Served"
                            sublabel="Global reach across all major continents"
                            accent="#0066ff"
                            bg="#eff6ff"
                            started={started}
                        />
                        <StatCard
                            icon={<Star className="w-6 h-6" />}
                            value={98}
                            suffix="%"
                            label="Satisfaction Rate"
                            sublabel="Clients who rated their experience 5 stars"
                            accent="#8b5cf6"
                            bg="#f5f3ff"
                            started={started}
                        />
                    </div>
                </div>
            </div>

            {/* ── Testimonials ──────────────────────────────────────────────── */}
            <div className="py-14 sm:py-20 bg-[#f8f8f8]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest mb-3">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Community Feedback
                        </span>
                        <h2 className="font-display text-[#0a0a0a] text-2xl sm:text-3xl font-bold">
                            Real Feedback. Verified Clients.
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Real comments from the Reddit community.
                        </p>
                    </div>

                    {/* Active testimonial */}
                    <div className="max-w-3xl mx-auto mb-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-500">
                            {/* Quote mark */}
                            <div className="absolute top-6 right-8 text-7xl font-serif text-gray-100 select-none leading-none">
                                "
                            </div>
                            {/* Stars */}
                            <div className="flex gap-1 mb-5">
                                {Array.from({ length: TESTIMONIALS[activeTestimonial].stars }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#e8a020] text-[#e8a020]" />
                                ))}
                            </div>
                            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 relative z-10">
                                &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
                            </p>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">
                                        {TESTIMONIALS[activeTestimonial].name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {TESTIMONIALS[activeTestimonial].subreddit}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4500]/10 text-[#ff4500] text-xs font-bold rounded-full">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {TESTIMONIALS[activeTestimonial].platform}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dot nav */}
                    <div className="flex justify-center gap-2 mb-10">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTestimonial(i)}
                                aria-label={`Testimonial ${i + 1}`}
                                className={`rounded-full transition-all duration-300 ${
                                    i === activeTestimonial
                                        ? "w-6 h-2 bg-[#e8a020]"
                                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                            />
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (typeof window !== "undefined" && (window as any).Tawk_API) {
                                        (window as any).Tawk_API.maximize();
                                    }
                                }}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 hover:shadow-lg text-sm"
                            >
                                Start Free Consultation
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <Link
                                href="/scam-checker"
                                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0a0a0a] text-[#0a0a0a] font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm"
                            >
                                🛡️ Free Scam Checker
                            </Link>
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                            No upfront fees · Confidential · Blockchain-verified evidence provided first
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Media Mentions ────────────────────────────────────────────── */}
            <div className="py-8 border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6 font-medium">
                        As featured in
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
                        {MEDIA.map((m) => (
                            <span
                                key={m.name}
                                className={`text-gray-300 text-lg sm:text-xl hover:text-gray-500 transition-colors duration-200 cursor-default ${m.style}`}
                            >
                                {m.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
