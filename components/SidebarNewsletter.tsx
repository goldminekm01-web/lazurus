"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SidebarNewsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            if (!res.ok) throw new Error();
            setStatus("success");
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="bg-[#0a0a0a] rounded-xl p-5 text-white">
            <p className="font-display font-bold text-base mb-1">Daily Market Brief</p>
            <p className="text-xs text-gray-400 mb-4">Top insights before market open, free.</p>
            
            {status === "success" ? (
                <div className="bg-green-900/30 border border-green-500/20 p-3 rounded-lg text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-green-400">Subscribed!</p>
                </div>
            ) : (
                <form onSubmit={handleSubscribe}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "loading"}
                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8a020] mb-2 disabled:opacity-60 transition-colors"
                        aria-label="Email for newsletter"
                        required
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-2 bg-[#e8a020] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-[#d4911c] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {status === "loading" ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                        ) : (
                            "Subscribe"
                        )}
                    </button>
                    {status === "error" && (
                        <p className="text-xs text-red-400 text-center mt-2">Error. Please try again.</p>
                    )}
                </form>
            )}
        </div>
    );
}
