import Script from "next/script";

export default function TawkWidget() {
    return (
        <>
            <Script id="tawk-init" strategy="afterInteractive">
                {`var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();`}
            </Script>
            <Script
                id="tawk-script"
                strategy="afterInteractive"
                src="https://embed.tawk.to/6a564450940f101d53238751/1jtgflmka"
                crossOrigin="anonymous"
            />
        </>
    );
}
