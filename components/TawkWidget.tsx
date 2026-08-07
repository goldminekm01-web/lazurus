"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        Tawk_API?: Record<string, any>;
        Tawk_LoadStart?: Date;
    }
}

export default function TawkWidget() {
    const injectedRef = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined" || injectedRef.current) return;
        injectedRef.current = true;

        // ── Step 1: Initialise Tawk namespace + inject script IMMEDIATELY ──
        // Do NOT wait for anything. Tawk must load as fast as possible.
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        injectTawkScript();

        // ── Step 2: Fetch geo in parallel (non-blocking) ───────────────────
        // When geo arrives, push it into Tawk via the correct API method.
        fetch("/api/geo")
            .then((r) => r.json())
            .then((geo) => {
                if (!window.Tawk_API) return;
                const attrs = {
                    country: geo.country || "Unknown",
                    city: geo.city || "Unknown",
                    ip: geo.ip || "Unknown",
                    timezone: geo.timezone || "",
                };

                // If Tawk has already fired onLoad, use setAttributes directly
                if (typeof window.Tawk_API.setAttributes === "function") {
                    try { window.Tawk_API.setAttributes(attrs, () => {}); } catch (_) {}
                } else {
                    // Otherwise register onLoad to apply when ready
                    const prev = window.Tawk_API.onLoad;
                    window.Tawk_API.onLoad = function () {
                        if (typeof prev === "function") { try { prev(); } catch (_) {} }
                        try { window.Tawk_API?.setAttributes?.(attrs, () => {}); } catch (_) {}
                    };
                }
            })
            .catch(() => {});

        // ── Step 3: Track link clicks for Tawk admin events ───────────────
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement)?.closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href") || anchor.href;
            if (!href || href.startsWith("javascript:") || href === "#") return;
            try {
                window.Tawk_API?.addEvent?.("Link Clicked", {
                    URL: href,
                    Text: (anchor.innerText?.trim() || "").slice(0, 80),
                    Page: window.location.pathname,
                });
            } catch (_) {}
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, []);

    return null;
}

function injectTawkScript() {
    if (document.getElementById("tawk-script")) return;
    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6a564450940f101d53238751/1jtgflmka";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    const s0 = document.getElementsByTagName("script")[0];
    (s0?.parentNode ?? document.head).insertBefore(s1, s0 ?? null);
}
