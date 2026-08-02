import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const headers = new Headers(request.headers);
        const forwardedFor = headers.get("x-forwarded-for");
        const realIp = headers.get("x-real-ip");
        const vercelCountry = headers.get("x-vercel-ip-country");
        const vercelCity = headers.get("x-vercel-ip-city");

        let ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "";

        // Default response if running locally or IP is localhost
        let result = {
            ip: ip || "Local / Development",
            country: vercelCountry || "Unknown Country",
            city: vercelCity || "Unknown City",
            region: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // If we have a valid public IP or are running on server, attempt geo lookup
        if (ip && ip !== "127.0.0.1" && ip !== "::1") {
            try {
                const res = await fetch(`https://ipwho.is/${ip}`, {
                    next: { revalidate: 3600 },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success !== false) {
                        result.country = data.country || result.country;
                        result.city = data.city || result.city;
                        result.region = data.region || result.region;
                        result.timezone = data.timezone?.id || result.timezone;
                    }
                }
            } catch {
                // Ignore external lookup failure, fallback to headers/defaults
            }
        } else {
            // For local dev, try fetching server's public IP location
            try {
                const res = await fetch("https://ipwho.is/", {
                    next: { revalidate: 3600 },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success !== false) {
                        result.ip = data.ip || result.ip;
                        result.country = data.country || result.country;
                        result.city = data.city || result.city;
                        result.region = data.region || result.region;
                        result.timezone = data.timezone?.id || result.timezone;
                    }
                }
            } catch {
                // Ignore fallback error
            }
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            ip: "Unknown",
            country: "Unknown Country",
            city: "Unknown City",
            region: "",
            timezone: "",
        });
    }
}
