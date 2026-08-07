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

        // Initialise Tawk_API namespace BEFORE the script — Tawk reads this at boot
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Fetch visitor geo data and set it as Tawk visitor attributes
        // We do this before injecting the script so Tawk picks it up immediately
        fetch("/api/geo")
            .then((r) => r.json())
            .then((geo) => {
                // Set visitor metadata that appears in the Tawk admin panel
                if (window.Tawk_API) {
                    window.Tawk_API.visitor = {
                        name: `Visitor — ${geo.city || "Unknown"}, ${geo.country || ""}`,
                        email: `visitor_${Date.now()}@lazurusgroup.com`,
                    };
                }
                // After geo is ready, inject the Tawk script
                injectTawkScript();
            })
            .catch(() => {
                // On geo failure, just inject without visitor data
                injectTawkScript();
            });

        // Track link clicks and report them via Tawk events
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
