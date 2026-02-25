"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, formatChangePercent } from "@/lib/utils";
import type { MarketQuote } from "@/lib/types";

// Fallback static data (replaced by live data when API responds)
const STATIC_QUOTES: MarketQuote[] = [
    { symbol: "SPX", name: "S&P 500", price: 5432.18, change: 38.22, changePercent: 0.71 },
    { symbol: "NDX", name: "Nasdaq 100", price: 18721.34, change: 142.87, changePercent: 0.77 },
    { symbol: "DJI", name: "Dow Jones", price: 39845.62, change: -54.12, changePercent: -0.14 },
    { symbol: "BTC", name: "Bitcoin", price: 91240.50, change: 2310.40, changePercent: 2.60 },
    { symbol: "ETH", name: "Ethereum", price: 3412.80, change: 45.20, changePercent: 1.34 },
    { symbol: "GLD", name: "Gold", price: 2321.40, change: 12.30, changePercent: 0.53 },
    { symbol: "CL", name: "Crude Oil", price: 79.42, change: -1.23, changePercent: -1.52 },
    { symbol: "DXY", name: "USD Index", price: 104.23, change: 0.34, changePercent: 0.33 },
    { symbol: "EUR/USD", name: "EUR/USD", price: 1.0821, change: -0.0032, changePercent: -0.30 },
    { symbol: "AAPL", name: "Apple", price: 187.42, change: 3.21, changePercent: 1.74 },
    { symbol: "NVDA", name: "Nvidia", price: 621.80, change: 41.20, changePercent: 7.10 },
    { symbol: "TSLA", name: "Tesla", price: 245.30, change: -8.40, changePercent: -3.31 },
];

function addJitter(quotes: MarketQuote[]): MarketQuote[] {
    return quotes.map((q) => {
        const delta = (Math.random() - 0.5) * q.price * 0.001;
        const newPrice = parseFloat((q.price + delta).toFixed(2));
        const newChange = parseFloat((q.change + delta).toFixed(2));
        const newPct = parseFloat(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        return { ...q, price: newPrice, change: newChange, changePercent: newPct };
    });
}

export default function MarketTicker() {
    const [quotes, setQuotes] = useState<MarketQuote[]>(STATIC_QUOTES);
    const [isPaused, setIsPaused] = useState(false);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isPaused) setQuotes((prev) => addJitter(prev));
        }, 3000);
        return () => clearInterval(interval);
    }, [isPaused]);

    // Create duplicate array for seamless loop
    const doubled = [...quotes, ...quotes];

    return (
        <div
            className="bg-white border-b border-t border-gray-100 py-2 overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Live market ticker"
            role="region"
        >
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div
                className="ticker-wrap"
                style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
            >
                <div
                    className="ticker-inner"
                    style={{
                        animationPlayState: isPaused ? "paused" : "running",
                    }}
                >
                    {doubled.map((q, i) => (
                        <TickerItem key={`${q.symbol}-${i}`} quote={q} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TickerItem({ quote }: { quote: MarketQuote }) {
    const isUp = quote.changePercent >= 0;
    const color = isUp ? "text-[#00c47a]" : "text-[#ff3b3b]";
    const Icon = isUp ? TrendingUp : TrendingDown;

    return (
        <div className="inline-flex items-center gap-2 px-5 border-r border-gray-100 shrink-0">
            <span className="text-xs font-bold text-gray-800 tracking-wide">
                {quote.symbol}
            </span>
            <span className="text-xs text-gray-900 font-mono">
                {formatPrice(quote.price)}
            </span>
            <span className={`text-xs font-semibold ${color} flex items-center gap-0.5`}>
                <Icon className="w-3 h-3" aria-hidden />
                {formatChangePercent(quote.changePercent)}
            </span>
        </div>
    );
}
