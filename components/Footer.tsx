"use client";

import Link from "next/link";
import { TrendingUp, Twitter, Linkedin, Github } from "lucide-react";
import { useWallet } from "@/components/WalletContext";

const FOOTER_LINKS = {
    Markets: [
        { label: "Stocks", href: "/category/markets" },
        { label: "Forex", href: "/tag/forex" },
        { label: "Commodities", href: "/tag/commodities" },
        { label: "Indices", href: "/tag/indices" },
    ],
    Analysis: [
        { label: "Technical Analysis", href: "/tag/technical-analysis" },
        { label: "Fundamental", href: "/tag/fundamental" },
        { label: "Trading Ideas", href: "/category/trading" },
        { label: "Crypto", href: "/category/crypto" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Subscribe", href: "/subscribe" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "CMS Editor", href: "/admin" },
    ],
};

export default function Footer() {
    const { openWalletModal } = useWallet();

    return (
        <footer className="bg-[#0a0a0a] text-gray-300 pt-16 pb-8 mt-20">
            <div className="max-w-8xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 mb-4"
                            aria-label="Lazarus Home"
                        >
                            <div className="flex items-center justify-center w-8 h-8 bg-[#e8a020] rounded-md">
                                <TrendingUp className="w-4 h-4 text-[#0a0a0a]" />
                            </div>
                            <span className="font-display font-bold text-xl text-white tracking-tight">
                                Laza<span className="text-[#e8a020]">rus</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
                            Independent market intelligence and analysis for traders and
                            investors navigating global financial markets.
                        </p>
                        {/* Newsletter */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Premium Membership
                            </p>
                            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                Join our premium tier to get real-time market intelligence, deeper on-chain analytics, and exclusive research directly from our forensics team.
                            </p>
                            <button
                                onClick={() => openWalletModal("membership")}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors text-sm"
                            >
                                Join Membership ($200)
                            </button>
                            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                                Paid via secure Web3 transaction. Access is granted instantly upon confirmation.
                            </p>
                        </div>
                        {/* Socials */}
                        <div className="flex gap-3 mt-4">
                            {[
                                { icon: Twitter, label: "Twitter/X", href: "https://twitter.com" },
                                { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
                                { icon: Github, label: "GitHub", href: "https://github.com" },
                            ].map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white border border-white/10 rounded-md hover:border-white/30 transition-colors"
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                        {/* Contact Info */}
                        <div className="mt-8 text-sm text-gray-400">
                            <p className="mb-1">Phone: <a href="tel:+17606867808" className="hover:text-white transition-colors">+1 760 686 7808</a></p>
                            <p>Email: <a href="mailto:lazurus@lazurusgroup.com" className="hover:text-white transition-colors">lazurus@lazurusgroup.com</a></p>
                        </div>
                    </div>

                    {/* Link Groups */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {group}
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            className="text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Disclaimer + Copyright */}
                <div className="border-t border-white/10 pt-8 space-y-3">
                    <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                        <strong className="text-gray-500">Disclaimer:</strong> Content on
                        Lazarus is for informational purposes only and does not
                        constitute financial advice. Trading involves risk. Past performance
                        is not indicative of future results. Always conduct your own
                        research before making investment decisions.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-gray-600">
                        <span>© {new Date().getFullYear()} Lazarus. All rights reserved.</span>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
                            <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
                            <Link href="/subscribe" className="hover:text-gray-400 transition-colors">Subscribe</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
