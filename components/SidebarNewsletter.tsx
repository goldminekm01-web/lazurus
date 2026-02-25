"use client";

export default function SidebarNewsletter() {
    return (
        <div className="bg-[#0a0a0a] rounded-xl p-5 text-white">
            <p className="font-display font-bold text-base mb-1">Daily Market Brief</p>
            <p className="text-xs text-gray-400 mb-4">Top insights before market open, free.</p>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8a020] mb-2"
                    aria-label="Email for newsletter"
                />
                <button
                    type="submit"
                    className="w-full py-2 bg-[#e8a020] text-[#0a0a0a] text-sm font-bold rounded-lg hover:bg-[#d4911c] transition-colors"
                >
                    Subscribe
                </button>
            </form>
        </div>
    );
}
