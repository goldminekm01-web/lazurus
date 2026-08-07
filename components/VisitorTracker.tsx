"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Fire-and-forget: log this page visit with geo data
        (async () => {
            try {
                const geo = await fetch("/api/geo").then((r) => r.json()).catch(() => ({}));
                await fetch("/api/visits", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ip: geo.ip || "",
                        country: geo.country || "",
                        city: geo.city || "",
                        region: geo.region || "",
                        timezone: geo.timezone || "",
                        page: pathname,
                        userAgent: navigator.userAgent,
                        referrer: document.referrer || "",
                    }),
                });
            } catch (_) {
                // Silently fail — never affect user experience
            }
        })();
    }, [pathname]); // Re-fires on route changes too

    return null;
}
