"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";

const BREAKING_ITEMS = [
    { id: "1", type: "breaking" as const, text: "FED holds rates steady — Powell signals no cuts before Q3 2025" },
    { id: "2", type: "market" as const, text: "S&P 500 hits all-time high on strong earnings season" },
    { id: "3", type: "update" as const, text: "Bitcoin surges past $90K as ETF inflows hit record weekly high" },
    { id: "4", type: "market" as const, text: "Nvidia Q4 revenue beats estimates by 18%, stock up 7% afterhours" },
    { id: "5", type: "update" as const, text: "Oil slips 2% on surprise OPEC+ production increase announcement" },
    { id: "6", type: "breaking" as const, text: "ECB hints at June rate cut as Eurozone inflation cools to 2.2%" },
];

const TYPE_LABEL: Record<string, string> = {
    breaking: "BREAKING",
    market: "MARKETS",
    update: "UPDATE",
};

const TYPE_COLOR: Record<string, string> = {
    breaking: "bg-red-600",
    market: "bg-[#0066ff]",
    update: "bg-[#e8a020]",
};

export default function BreakingBar() {
    const [current, setCurrent] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrent((c) => (c + 1) % BREAKING_ITEMS.length);
        }, 5000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const item = BREAKING_ITEMS[current];

    return (
        <div
            className="bg-[#0a0a0a] text-white text-xs sm:text-sm overflow-hidden"
            style={{ height: "36px" }}
            role="marquee"
            aria-live="polite"
            aria-label="Breaking news and market updates"
        >
            <div className="max-w-8xl mx-auto px-4 sm:px-6 h-full flex items-center gap-3">
                {/* Icon */}
                <AlertTriangle className="w-3.5 h-3.5 text-[#e8a020] shrink-0" aria-hidden />

                {/* Type badge */}
                <span
                    className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${TYPE_COLOR[item.type] || "bg-gray-600"
                        }`}
                >
                    {TYPE_LABEL[item.type]}
                </span>

                {/* Text */}
                <span
                    key={item.id}
                    className="truncate text-gray-200 animate-fade-in"
                >
                    {item.text}
                </span>

                {/* Dots */}
                <div className="hidden sm:flex items-center gap-1 ml-auto shrink-0">
                    {BREAKING_ITEMS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            aria-label={`News item ${i + 1}`}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-[#e8a020]" : "bg-white/30"
                                }`}
                        />
                    ))}
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 hidden sm:block" aria-hidden />
            </div>
        </div>
    );
}
