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

        // Exact embed code from Tawk.to dashboard — zero modifications
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

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
    }, []);

    return null;
}
