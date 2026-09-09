"use client";

import { Crown } from "lucide-react";
import { useWallet } from "@/components/WalletContext";

export default function NewsletterCTA() {
    const { openWalletModal } = useWallet();

    return (
        <section
            className="my-12 rounded-2xl bg-[#0a0a0a] text-white p-8 sm:p-12 text-center relative overflow-hidden"
            aria-label="Membership signup"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5" aria-hidden>
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#e8a020] blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#0066ff] blur-3xl" />
            </div>

            <div className="relative">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8a020]/20 text-[#e8a020] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    <Crown className="w-3 h-3" />
                    Premium Access
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">
                    Lazarus Premium Membership
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                    Gain exclusive access to institutional-grade market intelligence, 
                    verified scam checker APIs, and deep-dive forensic case studies.
                </p>
                <button
                    onClick={() => openWalletModal("membership")}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors text-base max-w-sm mx-auto w-full"
                >
                    Connect Wallet to Join - $200
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    Secure Web3 payment. Access granted instantly.
                </p>
            </div>
        </section>
    );
}

