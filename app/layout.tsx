import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingBar from "@/components/BreakingBar";
import MarketTicker from "@/components/MarketTicker";

export const metadata: Metadata = {
    title: {
        default: "Lazarus — Markets & Trading Intelligence",
        template: "%s | Lazarus",
    },
    description:
        "Independent market intelligence, trading analysis, and financial news for serious investors and traders.",
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    openGraph: {
        type: "website",
        siteName: "Lazarus",
        locale: "en_US",
        images: ["/og-default.jpg"],
    },
    twitter: {
        card: "summary_large_image",
        site: "@lazarusHQ",
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white text-gray-900 antialiased">
                <BreakingBar />
                <Header />
                <MarketTicker />
                <main id="main-content" tabIndex={-1} className="outline-none">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
