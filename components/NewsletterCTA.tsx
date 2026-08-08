"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterCTA() {
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
        <section
            className="my-12 rounded-2xl bg-[#0a0a0a] text-white p-8 sm:p-12 text-center relative overflow-hidden"
            aria-label="Newsletter signup"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5" aria-hidden>
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[#e8a020] blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#0066ff] blur-3xl" />
            </div>

            <div className="relative">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8a020]/20 text-[#e8a020] text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                    <Mail className="w-3 h-3" />
                    Newsletter
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">
                    Markets delivered to your inbox
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                    Get the day&apos;s top trading ideas, market analysis, and breaking
                    financial news — every morning, before the bell.
                </p>
                {status === "success" ? (
                    <div className="max-w-md mx-auto py-8">
                        <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="font-bold text-white text-lg">You're subscribed!</p>
                        <p className="text-gray-400 text-sm">We'll send daily briefs to {email}</p>
                    </div>
                ) : (
                    <>
                        <form
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            aria-label="Newsletter subscription form"
                        >
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === "loading"}
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e8a020] text-sm transition-colors disabled:opacity-60"
                                aria-label="Email address"
                                required
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors text-sm shrink-0 disabled:opacity-60"
                            >
                                {status === "loading" ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</>
                                ) : (
                                    "Subscribe Free"
                                )}
                            </button>
                        </form>
                        {status === "error" && (
                            <p className="text-sm text-red-400 mt-2">Something went wrong. Please try again.</p>
                        )}
                        <p className="text-xs text-gray-600 mt-3">
                            No spam. Unsubscribe any time.
                        </p>
                    </>
                )}
            </div>
        </section>
    );
}
