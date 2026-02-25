"use client";

import { Mail } from "lucide-react";

export default function SubscribeForm() {
    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 mb-6"
            aria-label="Subscribe to newsletter"
        >
            <input
                type="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#0a0a0a] transition-colors"
                aria-label="Email address"
            />
            <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-base"
            >
                <Mail className="w-4 h-4" />
                Subscribe Free
            </button>
        </form>
    );
}
