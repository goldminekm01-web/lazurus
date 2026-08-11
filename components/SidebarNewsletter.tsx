"use client";

import { useWallet } from "@/components/WalletContext";
import { Crown } from "lucide-react";

export default function SidebarNewsletter() {
    const { openWalletModal } = useWallet();

    return (
        <div className="bg-[#0a0a0a] rounded-xl p-5 text-white border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-[#e8a020]" />
                <p className="font-display font-bold text-base">Premium Access</p>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Join our private network for exclusive market intelligence and on-chain analytics.
            </p>
            
            <button
                onClick={openWalletModal}
                className="w-full py-2.5 bg-[#e8a020] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-[#d4911c] transition-colors flex items-center justify-center gap-2"
            >
                Join Membership ($200)
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-3">
                Paid securely via Web3 wallet.
            </p>
        </div>
    );
}
