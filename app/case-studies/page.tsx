import type { Metadata } from "next";
import { ShieldCheck, TrendingUp, ArrowRight, Star, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Case Studies & Success Stories — LazurusGroup",
    description: "Read real, verified recovery success stories from LazurusGroup clients. See how we trace blockchain transactions and recover stolen funds.",
};

const CASES = [
    {
        id: "c1",
        title: "Pig Butchering Romance Scam Recovery",
        amount: "$89,000",
        duration: "4 Weeks",
        country: "🇦🇺 Australia",
        method: "Blockchain Forensics & Exchange Freezing",
        summary: "Client lost retirement savings to a fake trading platform introduced via a dating app. We traced the funds through 4 intermediate wallets to a major Asian exchange and coordinated with local authorities to freeze the target account.",
        quote: "After a romance scam stole my retirement savings, Lazurus found the blockchain trail and helped me get back 80% of what I lost. Professional and discreet.",
        name: "James T.",
        stars: 5,
    },
    {
        id: "c2",
        title: "Fake ICO Pre-Sale Fraud",
        amount: "$41,500",
        duration: "3 Weeks",
        country: "🇬🇧 United Kingdom",
        method: "Smart Contract Analysis",
        summary: "Victim invested in a fraudulent pre-sale token contract that disabled withdrawals. Our team identified the deployer's real-world identity through gas funding analysis and negotiated a direct return of the principal.",
        quote: "I lost $47,000 to a fake trading platform. The team at Lazurus recovered $41,500 within 3 weeks. I couldn't believe it was possible.",
        name: "Sarah M.",
        stars: 5,
    },
    {
        id: "c3",
        title: "Phishing: Seed Phrase Compromise",
        amount: "$63,000",
        duration: "6 Weeks",
        country: "🇨🇦 Canada",
        method: "White-Hat Frontrunning & Tracing",
        summary: "Client's MetaMask was compromised via a malicious DApp connection. The attacker moved the funds to a mixing service. We utilized advanced cluster analysis to identify the exit nodes and worked with fiat off-ramps to intercept the cash-out.",
        quote: "My crypto was stuck in a fake yield farming contract. Lazurus forensic team traced the funds and coordinated the recovery. Exceptional service.",
        name: "Carlos R.",
        stars: 5,
    },
    {
        id: "c4",
        title: "Advance-Fee Fraud Recovery",
        amount: "$22,300",
        duration: "2 Weeks",
        country: "🇳🇬 Nigeria",
        method: "Network Analysis & AML Flagging",
        summary: "Client was promised massive returns but was constantly asked for 'withdrawal taxes'. We mapped the scam network, found their consolidation wallets, and triggered AML flags across 3 major exchanges simultaneously.",
        quote: "Contacted 4 recovery firms before Lazurus. Only they actually showed me real blockchain evidence before asking for a fee. Fully legit and they delivered.",
        name: "Amara K.",
        stars: 5,
    },
];

export default function CaseStudiesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* ── Hero ──────────────────────────────────────────────────────── */}
            <div className="bg-[#0a0a0a] pt-16 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8a020]/10 text-[#e8a020] text-xs font-bold uppercase tracking-widest mb-5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Results
                    </span>
                    <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-tight mb-6">
                        Real Clients. <span className="text-[#e8a020]">Real Recoveries.</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Read how our forensic experts have successfully traced and recovered stolen digital assets for victims worldwide.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/about"
                            className="px-6 py-3.5 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors flex items-center gap-2 text-sm"
                        >
                            Start Your Recovery <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Case Studies Grid ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
                <div className="space-y-12">
                    {CASES.map((study, idx) => (
                        <div key={study.id} className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Content */}
                            <div className="flex-1 space-y-5">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                        Case Study
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                        <GlobeIcon className="w-4 h-4" /> {study.country}
                                    </span>
                                </div>
                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                                    {study.title}
                                </h2>
                                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                    {study.summary}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Amount Recovered</p>
                                        <p className="text-xl font-bold text-[#00c47a] flex items-center gap-1">
                                            <TrendingUp className="w-5 h-5" /> {study.amount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Timeline</p>
                                        <p className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                                            <Clock className="w-5 h-5 text-[#e8a020]" /> {study.duration}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Recovery Method</p>
                                        <p className="text-sm font-medium text-gray-800 bg-gray-50 inline-block px-3 py-1 rounded-md">
                                            {study.method}
                                        </p>
                                    </div>
                                </div>
                                
                                <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0066ff] hover:text-blue-800 transition-colors group">
                                    Discuss a similar case <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Testimonial Card */}
                            <div className="w-full lg:w-[400px] shrink-0">
                                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative">
                                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#e8a020] rounded-full flex items-center justify-center text-white font-serif text-2xl leading-none pt-2">
                                        "
                                    </div>
                                    <div className="flex gap-1 mb-4">
                                        {Array.from({ length: study.stars }).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-[#e8a020] text-[#e8a020]" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed mb-6">
                                        "{study.quote}"
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            {study.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{study.name}</p>
                                            <p className="text-xs text-gray-500">Verified Client</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* ── Final CTA ─────────────────────────────────────────────────── */}
            <div className="bg-[#f8f8f8] py-20 border-t border-gray-100">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <ShieldCheck className="w-12 h-12 text-[#e8a020] mx-auto mb-6" />
                    <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                        Don't let scammers keep your funds.
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-xl mx-auto text-lg">
                        Our experts are standing by to review your case. We provide a clear assessment of recoverability before you commit to anything.
                    </p>
                    <Link
                        href="/about"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-shadow hover:shadow-xl text-base"
                    >
                        Request Free Case Evaluation <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function GlobeIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
        </svg>
    );
}
