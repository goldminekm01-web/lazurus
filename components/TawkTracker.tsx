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
            addTags?: (
                tags: string[],
                callback?: (error?: any) => void
            ) => void;
            showWidget?: () => void;
            onLoad?: () => void;
            [key: string]: any;
        };
    }
}

export default function TawkTracker() {
    const geoRef = useRef<GeoInfo>({});
    const pendingEventsRef = useRef<Array<{ name: string; data: Record<string, any> }>>([]);

    useEffect(() => {
        // Fetch visitor geolocation from server-side API route
        const loadGeo = async () => {
            try {
                const res = await fetch("/api/geo");
                if (res.ok) {
                    const data = await res.json();
                    geoRef.current = data;
                    syncTawkAttributes();
                }
            } catch (err) {
                geoRef.current = {
                    country: "Unknown Country",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                };
            }
        };

        loadGeo();
    }, []);

    // Safely check if Tawk.to API is ready
    const isTawkReady = () => {
        return (
            typeof window !== "undefined" &&
            window.Tawk_API !== undefined &&
            typeof window.Tawk_API.addEvent === "function"
        );
    };

    // Sync visitor attributes to Tawk dashboard
    const syncTawkAttributes = () => {
        if (!isTawkReady()) return;
        const geo = geoRef.current;
        try {
            window.Tawk_API?.showWidget?.();
            window.Tawk_API?.setAttributes?.(
                {
                    country: geo.country || "Unknown Country",
                    city: geo.city || "Unknown City",
                    ip: geo.ip || "Unknown IP",
                    timezone: geo.timezone || "",
                    userLanguage: navigator.language,
                },
                () => {}
            );
        } catch (e) {
            // Ignore if Tawk is not fully initialized
        }
    };

    // Flush any events that occurred before Tawk script finished loading
    const flushPendingEvents = () => {
        if (!isTawkReady()) return;
        try {
            window.Tawk_API?.showWidget?.();
        } catch (e) {}
        syncTawkAttributes();
        while (pendingEventsRef.current.length > 0) {
            const item = pendingEventsRef.current.shift();
            if (item) {
                try {
                    window.Tawk_API?.addEvent?.(item.name, item.data, () => {});
                } catch (e) {
                    console.error("Error firing Tawk event:", e);
                }
            }
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Poll for Tawk.to script readiness to flush initial queued events
        const pollInterval = setInterval(() => {
            if (isTawkReady()) {
                flushPendingEvents();
                clearInterval(pollInterval);
            }
        }, 300);

        // Global click listener for all links on Lazarus
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
                "Icon / Navigation Link";

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

            if (isTawkReady()) {
                try {
                    window.Tawk_API?.setAttributes?.(
                        {
                            lastClickedLink: href,
                            lastClickedText: linkText.slice(0, 100),
                        },
                        () => {}
                    );
                    window.Tawk_API?.addEvent?.("Link Clicked", payload, () => {});
                } catch (err) {
                    console.error("Tawk event error:", err);
                }
            } else {
                // Queue until Tawk script is ready
                pendingEventsRef.current.push({ name: "Link Clicked", data: payload });
            }
        };

        document.addEventListener("click", handleGlobalClick, true);

        return () => {
            clearInterval(pollInterval);
            document.removeEventListener("click", handleGlobalClick, true);
        };
    }, []);

    return null;
}
