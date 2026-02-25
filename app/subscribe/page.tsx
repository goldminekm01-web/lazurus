import type { Metadata } from "next";
import { Zap, BarChart2, Bell } from "lucide-react";
import SubscribeForm from "./SubscribeForm";

export const metadata: Metadata = {
    title: "Subscribe — Lazarus Newsletter",
    description: "Get daily market intelligence and trading insights delivered to your inbox.",
};

export default function SubscribePage() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7 text-[#e8a020]" />
            </div>
            <h1 className="font-display font-bold text-4xl text-gray-900 mb-3">
                Markets in your inbox. Every morning.
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Join 10,000+ traders who start their day with the Lazarus Daily Brief — key market
                moves, top stories, and one actionable trade idea. Free, forever.
            </p>

            <SubscribeForm />

            <p className="text-xs text-gray-400 mb-10">No spam. Cancel any time. GDPR-compliant.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                    {
                        icon: BarChart2,
                        title: "Market Morning Brief",
                        desc: "Pre-market analysis every weekday at 7am EST",
                    },
                    {
                        icon: Bell,
                        title: "Breaking Alerts",
                        desc: "Instant notification for major market-moving events",
                    },
                    {
                        icon: Zap,
                        title: "Trade Ideas",
                        desc: "Weekly technical setups from our analyst team",
                    },
                ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <Icon className="w-5 h-5 text-[#e8a020] mb-2" />
                        <p className="font-semibold text-sm text-gray-900 mb-1">{title}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
