import type { Metadata } from "next";
import { ShieldCheck, ArrowRight, Star, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Security Investigations & Research — LazurusGroup",
    description: "Explore our security research on crypto scams, blockchain threat analysis, and fraud investigation techniques.",
};

const CASES = [
    {
        id: "c1",
        title: "Pig Butchering Romance Scam Analysis",
        amount: "$89,000",
        duration: "4 Weeks",
        country: "🇦🇺 Australia",
        method: "Blockchain Forensics & Exchange Coordination",
        summary: "Client lost retirement savings to a fake trading platform introduced via a dating app. We traced the funds through 4 intermediate wallets to a major Asian exchange and identified the operators behind the scheme.",
        quote: "After a romance scam stole my retirement savings, Lazurus helped me understand the blockchain trail and how the fraud was orchestrated. The analysis was thorough and professional.",
        name: "James T.",
        stars: 5,
    },
    {
        id: "c2",
        title: "Fake ICO Pre-Sale Fraud Investigation",
        amount: "$47,000",
        duration: "3 Weeks",
        country: "🇬🇧 United Kingdom",
        method: "Smart Contract Analysis",
        summary: "Victim invested in a fraudulent pre-sale token contract that disabled withdrawals. Our team identified the deployer's real-world identity through gas funding analysis and documented the findings for reporting to authorities.",
        quote: "I lost $47,000 to a fake trading platform. The team at Lazurus provided a detailed technical analysis showing exactly how the scam worked. Very educational.",
        name: "Sarah M.",
        stars: 5,
    },
    {
        id: "c3",
        title: "Phishing: Seed Phrase Compromise",
        amount: "$63,000",
        duration: "6 Weeks",
        country: "🇨🇦 Canada",
        method: "White-Hat Tracing & Analysis",
        summary: "Client's MetaMask was compromised via a malicious DApp connection. The attacker moved the funds to a mixing service. We utilized advanced cluster analysis to identify the exit nodes and documented the wallet network for law enforcement.",
        quote: "The Lazurus team traced the funds and explained the wallet network structure. Their analysis helped me file a comprehensive report.",
        name: "Carlos R.",
        stars: 5,
    },
    {
        id: "c4",
        title: "Advance-Fee Fraud Investigation",
        amount: "$22,300",
        duration: "2 Weeks",
        country: "🇺🇸 United States",
        method: "Network Analysis & AML Flagging",
        summary: "Client was promised massive returns but was constantly asked for 'withdrawal fees'. We mapped the scam network, found their consolidation wallets, and filed AML reports with 3 major exchanges simultaneously.",
        quote: "Lazurus provided real blockchain evidence before I filed my police report. The technical analysis was exactly what I needed.",
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
                        <ShieldCheck className="w-3.5 h-3.5" /> Investigations
                    </span>
                    <h1 className="font-display text-white text-4xl sm:text-5xl font-bold leading-tight mb-6">
                        Security Investigations. <span className="text-[#e8a020]">Research-Driven.</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Detailed analyses of crypto scams, blockchain threat investigations, and the techniques used to expose fraud in the decentralized space.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/about"
                            className="px-6 py-3.5 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors flex items-center gap-2 text-sm"
                        >
                            Learn About Our Methods <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Investigations Grid ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
                <div className="space-y-12">
                    {CASES.map((study, idx) => (
                        <div key={study.id} className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                            {/* Content */}
                            <div className="flex-1 space-y-5">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                        Investigation
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
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Loss Amount Involved</p>
                                        <p className="text-xl font-bold text-[#ff3b3b] flex items-center gap-1">
                                            {study.amount}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Timeline</p>
                                        <p className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                                            <Clock className="w-5 h-5 text-[#e8a020]" /> {study.duration}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Investigation Method</p>
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
                                            <p className="text-xs text-gray-500">Security Research Participant</p>
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
                        Have you identified a crypto scam?
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-xl mx-auto text-lg">
                        Use our free Scam Checker to verify wallets and websites for fraud indicators.
                        Our research helps protect the community from emerging threats.
                    </p>
                    <Link
                        href="/scam-checker"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-shadow hover:shadow-xl text-base"
                    >
                        Check a Wallet or Website →
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
