"use client";
import { useEffect } from "react";

export default function TawkWidget() {
    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return;

        // Initialize Tawk_API
        (window as any).Tawk_API = (window as any).Tawk_API || {};
        (window as any).Tawk_LoadStart = new Date();

        // Create script
        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        
        s1.async = true;
        s1.src = 'https://embed.tawk.to/6a7e0f0f24451e1d49068d57/default';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            document.head.appendChild(s1);
        }
    }, []);

    return null;
}
