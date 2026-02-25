"use client";

import { Mail } from "lucide-react";

export default function NewsletterCTA() {
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
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    aria-label="Newsletter subscription form"
                >
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e8a020] text-sm transition-colors"
                        aria-label="Email address"
                        required
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors text-sm shrink-0"
                    >
                        Subscribe Free
                    </button>
                </form>
                <p className="text-xs text-gray-600 mt-3">
                    No spam. Unsubscribe any time.
                </p>
            </div>
        </section>
    );
}
