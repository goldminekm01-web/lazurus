import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Lazarus — Markets & Trading Intelligence",
    description:
        "Lazarus is an independent trading and financial news platform delivering market intelligence for serious investors.",
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
            <h1 className="font-display font-bold text-4xl text-gray-900 mb-4">About Lazarus</h1>
            <p className="text-gray-400 text-sm mb-8">Independent. Analytical. Trader-first.</p>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                <p>
                    <strong>Lazarus</strong> is an independent financial media platform built for traders,
                    investors, and market professionals who demand clarity over noise.
                </p>
                <p>
                    We cover global equity markets, macro economics, crypto assets, forex, and commodities —
                    with a focus on actionable analysis rather than hype.
                </p>
                <h2 className="font-display font-bold text-2xl text-gray-900 mt-8 mb-3">Our Mission</h2>
                <p>
                    Markets move fast. We cut through the noise with concise, well-researched reporting that
                    helps you understand <em>why</em> prices move — not just that they did.
                </p>
                <h2 className="font-display font-bold text-2xl text-gray-900 mt-8 mb-3">Disclaimer</h2>
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    Content on Lazarus is for informational and educational purposes only. Nothing
                    published here constitutes financial advice. Always do your own research and consult a
                    qualified financial advisor before making investment decisions. Trading involves
                    substantial risk of loss.
                </p>
            </div>
        </div>
    );
}
