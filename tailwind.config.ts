import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: "#0a0a0a",
                    light: "#f8f8f8",
                    accent: "#e8a020",
                    green: "#00c47a",
                    red: "#ff3b3b",
                    blue: "#0066ff",
                    muted: "#6b7280",
                    border: "#e5e7eb",
                    "dark-border": "#1f2937",
                },
                markets: {
                    up: "#00c47a",
                    down: "#ff3b3b",
                    neutral: "#6b7280",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ['"Space Grotesk"', "Inter", "sans-serif"],
                mono: ['"JetBrains Mono"', "monospace"],
            },
            fontSize: {
                "hero": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
                "hero-sm": ["2.25rem", { lineHeight: "1.15", fontWeight: "700" }],
                "headline": ["1.75rem", { lineHeight: "1.2", fontWeight: "600" }],
                "headline-sm": ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
            },
            spacing: {
                "18": "4.5rem",
                "22": "5.5rem",
            },
            maxWidth: {
                "8xl": "1280px",
                "9xl": "1440px",
            },
            animation: {
                ticker: "ticker 30s linear infinite",
                "fade-in": "fadeIn 0.4s ease-in-out",
                "slide-up": "slideUp 0.4s ease-out",
            },
            keyframes: {
                ticker: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: "none",
                        color: "#111827",
                        a: { color: "#0066ff", "&:hover": { color: "#0052cc" } },
                        "h2,h3,h4": { fontFamily: '"Space Grotesk", Inter, sans-serif' },
                        blockquote: {
                            borderLeftColor: "#e8a020",
                            fontStyle: "normal",
                            fontWeight: "500",
                        },
                        code: {
                            backgroundColor: "#f3f4f6",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            fontFamily: '"JetBrains Mono", monospace',
                        },
                    },
                },
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                "card-hover": "0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
            },
        },
    },
    plugins: [typography],
};

export default config;
