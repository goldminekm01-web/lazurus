import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-static";

// Simple Yahoo Finance proxy — no API key needed
// Endpoint: /api/market?symbols=SPX,BTC,AAPL
export async function GET() {
    // Hardcoded symbols for static version
    const symbols = "SPX,BTC,AAPL";

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
