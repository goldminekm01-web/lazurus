import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreakingBar from "@/components/BreakingBar";
import MarketTicker from "@/components/MarketTicker";
import TawkTracker from "@/components/TawkTracker";

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
                <TawkTracker />
                <BreakingBar />
                <Header />
                <MarketTicker />
                <main id="main-content" tabIndex={-1} className="outline-none">
                    {children}
                </main>
                <Footer />
                {/* Tawk.to live chat */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
                            (function(){
                                var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
                                s1.async = true;
                                s1.src = 'https://embed.tawk.to/6a564450940f101d53238751/1jtgflmka';
                                s1.charset = 'UTF-8';
                                s1.setAttribute('crossorigin', '*');
                                s0.parentNode.insertBefore(s1, s0);
                            })();
                        `,
                    }}
                />
            </body>
        </html>
    );
}
