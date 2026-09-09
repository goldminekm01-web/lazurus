"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, formatChangePercent } from "@/lib/utils";
import type { MarketQuote } from "@/lib/types";

const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

// Stock / index / forex symbols to fetch from Finnhub
const FINNHUB_SYMBOLS: { symbol: string; name: string; finnhub: string }[] = [
    { symbol: "SPX",     name: "S&P 500",    finnhub: "^GSPC" },
    { symbol: "NDX",     name: "Nasdaq 100", finnhub: "^NDX" },
    { symbol: "DJI",     name: "Dow Jones",  finnhub: "^DJI" },
    { symbol: "AAPL",    name: "Apple",      finnhub: "AAPL" },
    { symbol: "NVDA",    name: "Nvidia",     finnhub: "NVDA" },
    { symbol: "TSLA",    name: "Tesla",      finnhub: "TSLA" },
    { symbol: "GLD",     name: "Gold",       finnhub: "GLD" },
    { symbol: "EUR/USD", name: "EUR/USD",    finnhub: "OANDA:EUR_USD" },
];

// Crypto pairs from Binance (no key needed)
const BINANCE_PAIRS: { pair: string; symbol: string; name: string }[] = [
    { pair: "BTCUSDT",  symbol: "BTC",  name: "Bitcoin" },
    { pair: "ETHUSDT",  symbol: "ETH",  name: "Ethereum" },
    { pair: "SOLUSDT",  symbol: "SOL",  name: "Solana" },
    { pair: "BNBUSDT",  symbol: "BNB",  name: "BNB" },
    { pair: "XRPUSDT",  symbol: "XRP",  name: "XRP" },
    { pair: "DOGEUSDT", symbol: "DOGE", name: "Dogecoin" },
];

// Static fallback in case both APIs are unavailable
const STATIC_QUOTES: MarketQuote[] = [
    { symbol: "SPX",     name: "S&P 500",    price: 5432.18,  change: 38.22,    changePercent: 0.71 },
    { symbol: "NDX",     name: "Nasdaq 100", price: 18721.34, change: 142.87,   changePercent: 0.77 },
    { symbol: "DJI",     name: "Dow Jones",  price: 39845.62, change: -54.12,   changePercent: -0.14 },
    { symbol: "BTC",     name: "Bitcoin",    price: 91240.50, change: 2310.40,  changePercent: 2.60 },
    { symbol: "ETH",     name: "Ethereum",   price: 3412.80,  change: 45.20,    changePercent: 1.34 },
    { symbol: "GLD",     name: "Gold",       price: 2321.40,  change: 12.30,    changePercent: 0.53 },
    { symbol: "EUR/USD", name: "EUR/USD",    price: 1.0821,   change: -0.0032,  changePercent: -0.30 },
    { symbol: "AAPL",    name: "Apple",      price: 187.42,   change: 3.21,     changePercent: 1.74 },
    { symbol: "NVDA",    name: "Nvidia",     price: 621.80,   change: 41.20,    changePercent: 7.10 },
    { symbol: "TSLA",    name: "Tesla",      price: 245.30,   change: -8.40,    changePercent: -3.31 },
];

async function fetchFinnhubQuotes(): Promise<MarketQuote[]> {
    if (!FINNHUB_KEY) return [];
    const results: MarketQuote[] = [];

    await Promise.all(
        FINNHUB_SYMBOLS.map(async ({ symbol, name, finnhub }) => {
            try {
                const res = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(finnhub)}&token=${FINNHUB_KEY}`
                );
                if (!res.ok) return;
                const data = await res.json();
                // data: { c: current price, d: change, dp: changePercent }
                if (!data.c) return;
                results.push({
                    symbol,
                    name,
                    price: data.c,
                    change: data.d ?? 0,
                    changePercent: data.dp ?? 0,
                });
            } catch {
                // skip on error
            }
        })
    );

    return results;
}

async function fetchBinanceQuotes(): Promise<MarketQuote[]> {
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        if (!res.ok) return [];
        const data: any[] = await res.json();
        const pairs = BINANCE_PAIRS.map((p) => p.pair);
        return data
            .filter((item) => pairs.includes(item.symbol))
            .map((item) => {
                const meta = BINANCE_PAIRS.find((p) => p.pair === item.symbol)!;
                return {
                    symbol: meta.symbol,
                    name: meta.name,
                    price: parseFloat(item.lastPrice),
                    change: parseFloat(item.priceChange),
                    changePercent: parseFloat(item.priceChangePercent),
                };
            })
            .sort((a, b) => pairs.indexOf(a.symbol + "USDT") - pairs.indexOf(b.symbol + "USDT"));
    } catch {
        return [];
    }
}

export default function MarketTicker() {
    const [quotes, setQuotes] = useState<MarketQuote[]>(STATIC_QUOTES);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        let active = true;

        const refresh = async () => {
            const [stocks, crypto] = await Promise.all([
                fetchFinnhubQuotes(),
                fetchBinanceQuotes(),
            ]);

            if (!active) return;

            const merged: MarketQuote[] = [
                ...(stocks.length > 0 ? stocks : STATIC_QUOTES.filter((q) =>
                    FINNHUB_SYMBOLS.some((s) => s.symbol === q.symbol)
                )),
                ...(crypto.length > 0 ? crypto : STATIC_QUOTES.filter((q) =>
                    BINANCE_PAIRS.some((p) => p.symbol === q.symbol)
                )),
            ];

            if (merged.length > 0) setQuotes(merged);
        };

        refresh();
        const interval = setInterval(refresh, 15000); // refresh every 15 s
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

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
                    style={{ animationPlayState: isPaused ? "paused" : "running" }}
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


