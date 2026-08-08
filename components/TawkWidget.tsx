import Script from "next/script";

export default function TawkWidget() {
    return (
        <Script
            id="tawk-widget"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
                __html: `
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/6a564450940f101d53238751/1jtgflmka';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    if (s0 && s0.parentNode) {
                        s0.parentNode.insertBefore(s1,s0);
                    } else {
                        document.head.appendChild(s1);
                    }
                    })();
                `,
            }}
        />
    );
}
