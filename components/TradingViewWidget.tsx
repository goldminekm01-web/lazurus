"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
    symbol?: string;
    height?: number;
    compact?: boolean;
}

export default function TradingViewWidget({
    symbol = "NASDAQ:AAPL",
    height = 350,
    compact = false,
}: TradingViewWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            allow_symbol_change: false,
            save_image: false,
            calendar: false,
            hide_top_toolbar: compact,
            hide_legend: compact,
            hide_side_toolbar: true,
            withdateranges: !compact,
            details: !compact,
            hotlist: false,
            studies: compact ? [] : ["STD;MACD"],
            support_host: "https://www.tradingview.com",
        });

        const widgetDiv = document.createElement("div");
        widgetDiv.className = "tradingview-widget-container__widget";
        widgetDiv.style.height = `${height - 32}px`;
        widgetDiv.style.width = "100%";

        const copyright = document.createElement("div");
        copyright.className = "tradingview-widget-copyright";
        copyright.innerHTML =
            '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text" style="font-size:11px;color:#9ca3af">Powered by TradingView</span></a>';

        containerRef.current.appendChild(widgetDiv);
        containerRef.current.appendChild(copyright);
        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = "";
        };
    }, [symbol, height, compact]);

    return (
        <div
            ref={containerRef}
            className="tradingview-widget-container rounded-xl overflow-hidden border border-gray-100"
            style={{ height }}
            aria-label={`TradingView chart for ${symbol}`}
            role="img"
        />
    );
}
