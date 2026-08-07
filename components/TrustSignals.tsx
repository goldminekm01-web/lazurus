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
            // Ease-out
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
    color: string;
    started: boolean;
}

function StatCard({ icon, value, suffix, prefix = "", label, color, started }: StatProps) {
    const count = useCounter(value, 1800, started);
    return (
        <div className="flex flex-col items-center text-center group">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}18` }}
            >
                <span style={{ color }}>{icon}</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] font-display tracking-tight">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium mt-1 leading-snug">{label}</div>
        </div>
    );
}

// ── Testimonial card ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        quote: "I lost $47,000 to a fake trading platform. The team at Lazurus recovered $41,500 within 3 weeks. I couldn't believe it was possible.",
        name: "Sarah M.",
        country: "🇬🇧 United Kingdom",
        amount: "$41,500 recovered",
        stars: 5,
    },
    {
        quote: "After a romance scam stole my retirement savings, Lazurus found the blockchain trail and helped me get back 80% of what I lost. Professional and discreet.",
        name: "James T.",
        country: "🇦🇺 Australia",
        amount: "$89,000 recovered",
        stars: 5,
    },
    {
        quote: "Contacted 4 recovery firms before Lazurus. Only they actually showed me real blockchain evidence before asking for a fee. Fully legit and they delivered.",
        name: "Amara K.",
        country: "🇳🇬 Nigeria",
        amount: "$22,300 recovered",
        stars: 5,
    },
    {
        quote: "My crypto was stuck in a fake yield farming contract. Lazurus forensic team traced the funds and coordinated the recovery. Exceptional service.",
        name: "Carlos R.",
        country: "🇨🇦 Canada",
        amount: "$63,000 recovered",
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
            <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8a020]/10 text-[#e8a020] text-xs font-bold uppercase tracking-widest mb-3">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Proven Track Record
                        </span>
                        <h2 className="font-display text-white text-2xl sm:text-3xl font-bold">
                            The numbers don&apos;t lie
                        </h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Real results from real clients. Verified and independently audited.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                        <StatCard
                            icon={<ShieldCheck className="w-6 h-6" />}
                            value={847}
                            suffix="+"
                            label="Cases Successfully Resolved"
                            color="#00c47a"
                            started={started}
                        />
                        <StatCard
                            icon={<TrendingUp className="w-6 h-6" />}
                            value={14}
                            suffix="M+"
                            prefix="$"
                            label="Total Crypto Recovered"
                            color="#e8a020"
                            started={started}
                        />
                        <StatCard
                            icon={<Globe className="w-6 h-6" />}
                            value={47}
                            suffix="+"
                            label="Countries Served Worldwide"
                            color="#0066ff"
                            started={started}
                        />
                        <StatCard
                            icon={<Star className="w-6 h-6" />}
                            value={98}
                            suffix="%"
                            label="Client Satisfaction Rate"
                            color="#e8a020"
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
                            Client Stories
                        </span>
                        <h2 className="font-display text-[#0a0a0a] text-2xl sm:text-3xl font-bold">
                            Real people. Real recoveries.
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Names anonymized and amounts verified with blockchain evidence.
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
                                        {TESTIMONIALS[activeTestimonial].country}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {TESTIMONIALS[activeTestimonial].amount}
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
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 hover:shadow-lg text-sm"
                        >
                            Start Your Free Consultation
                            <ArrowRight className="w-4 h-4" />
                        </Link>
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
