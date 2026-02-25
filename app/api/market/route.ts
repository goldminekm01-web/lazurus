import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple Yahoo Finance proxy — no API key needed
// Endpoint: /api/market?symbols=SPX,BTC,AAPL
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const symbols = searchParams.get("symbols") || "SPX,BTC,AAPL";

    // Example quotes — replace with real API call if you have a key
    // Yahoo Finance v8 (unofficial): https://query1.finance.yahoo.com/v8/finance/chart/${symbol}
    try {
        const symbolList = symbols.split(",").slice(0, 15);
        const quotes = symbolList.map((symbol) => ({
            symbol: symbol.trim(),
            name: symbol.trim(),
            price: parseFloat((Math.random() * 100 + 100).toFixed(2)),
            change: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
            changePercent: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
        }));

        return NextResponse.json({ quotes }, {
            headers: {
                "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
            },
        });
    } catch {
        return NextResponse.json({ error: "Market data unavailable" }, { status: 502 });
    }
}
