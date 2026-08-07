"use client";

import { useEffect, useRef } from "react";

interface GeoInfo {
    ip?: string;
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
}

declare global {
    interface Window {
        Tawk_API?: {
            addEvent?: (
                eventName: string,
                eventData?: Record<string, any>,
                callback?: (error?: any) => void
            ) => void;
            setAttributes?: (
                attributes: Record<string, any>,
                callback?: (error?: any) => void
            ) => void;
            showWidget?: () => void;
            maximize?: () => void;
            onLoad?: () => void;
            [key: string]: any;
        };
        Tawk_LoadStart?: Date;
    }
}

export default function TawkWidget() {
    const geoRef = useRef<GeoInfo>({});
    const loadedRef = useRef(false);

    useEffect(() => {
        if (typeof window === "undefined" || loadedRef.current) return;
        loadedRef.current = true;

        // Fetch visitor location data
        fetch("/api/geo")
            .then((res) => res.json())
            .then((data) => {
                geoRef.current = data;
                // Only set attributes if Tawk is already loaded & connected
                if (
                    window.Tawk_API &&
                    typeof window.Tawk_API.setAttributes === "function"
                ) {
                    try {
                        window.Tawk_API.setAttributes({
                            country: data.country || "Unknown",
                            city: data.city || "Unknown",
                            ip: data.ip || "Unknown",
                            timezone: data.timezone || "",
                        });
                    } catch (e) {}
                }
            })
            .catch(() => {});

        // Pre-configure Tawk_API BEFORE the script loads
        // (Tawk reads these at boot time — do not mutate after script loads)
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        const previousOnLoad = window.Tawk_API.onLoad;

        window.Tawk_API.onLoad = function () {
            // Preserve any existing onLoad hook
            if (typeof previousOnLoad === "function") {
                try { previousOnLoad(); } catch (e) {}
            }

            // Show widget (in case it was hidden) — called only ONCE, on initial load
            try { window.Tawk_API?.showWidget?.(); } catch (e) {}

            // Maximize the chat box so it opens fully on page load
            // We call this once and never again — no polling, no interval
            try { window.Tawk_API?.maximize?.(); } catch (e) {}

            // Push visitor geo attributes after connection is stable
            const geo = geoRef.current;
            if (geo.country && window.Tawk_API?.setAttributes) {
                try {
                    window.Tawk_API.setAttributes({
                        country: geo.country,
                        city: geo.city || "",
                        ip: geo.ip || "",
                        timezone: geo.timezone || "",
                        userLanguage: navigator.language,
                    });
                } catch (e) {}
            }
        };

        // Inject Tawk script once
        if (!document.getElementById("tawk-script")) {
            const s1 = document.createElement("script");
            s1.id = "tawk-script";
            s1.async = true;
            s1.src = "https://embed.tawk.to/6a564450940f101d53238751/1jtgflmka";
            s1.charset = "UTF-8";
            s1.setAttribute("crossorigin", "*");
            const s0 = document.getElementsByTagName("script")[0];
            if (s0 && s0.parentNode) {
                s0.parentNode.insertBefore(s1, s0);
            } else {
                document.head.appendChild(s1);
            }
        }

        // Global link click tracker — sends event to Tawk admin panel
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const anchor = target.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href") || anchor.href;
            if (!href || href.startsWith("javascript:") || href === "#") return;

            const linkText =
                anchor.innerText?.trim() ||
                anchor.getAttribute("aria-label") ||
                anchor.getAttribute("title") ||
                anchor.querySelector("img")?.alt ||
                "Navigation Link";

            const geo = geoRef.current;

            const payload = {
                "Clicked URL": href,
                "Link Text": linkText.slice(0, 100),
                "Page URL": window.location.href,
                "Visitor Country": geo.country || "Detecting...",
                "Visitor City": geo.city || "Detecting...",
                "Visitor IP": geo.ip || "Detecting...",
                "Screen Size": `${window.screen.width}x${window.screen.height}`,
                "Time": new Date().toLocaleTimeString(),
            };

            if (
                window.Tawk_API &&
                typeof window.Tawk_API.addEvent === "function"
            ) {
                try {
                    window.Tawk_API.setAttributes?.({
                        lastClickedLink: href,
                        lastClickedText: linkText.slice(0, 100),
                    });
                    window.Tawk_API.addEvent("Link Clicked", payload);
                } catch (e) {
                    // Silently ignore if Tawk is mid-connection
                }
            }
        };

        document.addEventListener("click", handleGlobalClick, true);

        return () => {
            document.removeEventListener("click", handleGlobalClick, true);
        };
    }, []);

    return null;
}
