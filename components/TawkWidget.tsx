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
            minimize?: () => void;
            toggle?: () => void;
            onLoad?: () => void;
            onChatMinimized?: () => void;
            onChatMaximized?: () => void;
            isChatMinimized?: () => boolean;
            isChatMaximized?: () => boolean;
            [key: string]: any;
        };
        Tawk_LoadStart?: Date;
    }
}

export default function TawkWidget() {
    const geoRef = useRef<GeoInfo>({});
    const loadedRef = useRef(false);
    const keepOpenRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Re-maximize if the chat gets minimized
    const ensureChatOpen = () => {
        try {
            const api = window.Tawk_API;
            if (!api) return;
            if (typeof api.isChatMinimized === "function" && api.isChatMinimized()) {
                api.maximize?.();
            } else if (typeof api.maximize === "function") {
                api.maximize();
            }
        } catch (e) {
            // Ignore if api not ready
        }
    };

    useEffect(() => {
        if (typeof window === "undefined" || loadedRef.current) return;
        loadedRef.current = true;

        // Fetch visitor location data
        fetch("/api/geo")
            .then((res) => res.json())
            .then((data) => {
                geoRef.current = data;
                if (window.Tawk_API && typeof window.Tawk_API.setAttributes === "function") {
                    window.Tawk_API.setAttributes({
                        country: data.country || "Unknown",
                        city: data.city || "Unknown",
                        ip: data.ip || "Unknown",
                        timezone: data.timezone || "",
                    });
                }
            })
            .catch(() => {});

        // Pre-configure Tawk_API before script loads
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        const previousOnLoad = window.Tawk_API.onLoad;

        window.Tawk_API.onLoad = function () {
            // Run any existing onLoad hook
            if (typeof previousOnLoad === "function") {
                try { previousOnLoad(); } catch (e) {}
            }

            // Show and maximize chat immediately
            try { window.Tawk_API?.showWidget?.(); } catch (e) {}
            try { window.Tawk_API?.maximize?.(); } catch (e) {}

            // Sync geo attributes
            if (geoRef.current.country && window.Tawk_API?.setAttributes) {
                try {
                    window.Tawk_API.setAttributes({
                        country: geoRef.current.country,
                        city: geoRef.current.city,
                        ip: geoRef.current.ip,
                    });
                } catch (e) {}
            }

            // Re-maximize whenever the user minimizes the chat
            if (window.Tawk_API) {
                window.Tawk_API.onChatMinimized = function () {
                    // Small delay to let Tawk finish its own animation, then re-open
                    setTimeout(() => {
                        try { window.Tawk_API?.maximize?.(); } catch (e) {}
                    }, 200);
                };
            }

            // Heartbeat: every 2 seconds check if minimized and re-open
            if (keepOpenRef.current) clearInterval(keepOpenRef.current);
            keepOpenRef.current = setInterval(ensureChatOpen, 2000);
        };

        // Inject Tawk script if not already present
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

        // Global link click listener — sends notification to Tawk admin
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

            if (window.Tawk_API && typeof window.Tawk_API.addEvent === "function") {
                try {
                    window.Tawk_API.setAttributes?.({
                        lastClickedLink: href,
                        lastClickedText: linkText.slice(0, 100),
                    });
                    window.Tawk_API.addEvent("Link Clicked", payload);
                } catch (e) {
                    console.error("Tawk addEvent error:", e);
                }
            }
        };

        document.addEventListener("click", handleGlobalClick, true);

        return () => {
            document.removeEventListener("click", handleGlobalClick, true);
            if (keepOpenRef.current) clearInterval(keepOpenRef.current);
        };
    }, []);

    return null;
}
