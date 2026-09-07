import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

interface VisitRecord {
    id: string;
    ip: string;
    country: string;
    city: string;
    region: string;
    timezone: string;
    page: string;
    userAgent: string;
    referrer: string;
    timestamp: string;
}

// In-memory store (survives within the same serverless instance)
const visitStore: VisitRecord[] = [];

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Pull real IP from Vercel / proxy headers
        const forwardedFor = request.headers.get("x-forwarded-for");
        const realIp = request.headers.get("x-real-ip");
        const vercelCountry = request.headers.get("x-vercel-ip-country") || "";
        const vercelCity = request.headers.get("x-vercel-ip-city") || "";
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || body.ip || "Unknown";

        const record: VisitRecord = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            ip,
            country: body.country || vercelCountry || "Unknown",
            city: body.city || vercelCity || "Unknown",
            region: body.region || "",
            timezone: body.timezone || "",
            page: body.page || "/",
            userAgent: body.userAgent || "",
            referrer: body.referrer || "",
            timestamp: new Date().toISOString(),
        };

        // Store in memory
        visitStore.unshift(record);
        if (visitStore.length > 1000) visitStore.pop();

        // Persist to Firestore
        try {
            if (db) {
                await db.collection("visits").doc(record.id).set(record);
            }
        } catch (dbErr) {
            console.error("Firestore visit log error:", dbErr);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to log visit" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get("x-admin-token");
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (token !== adminPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let dbRecords: VisitRecord[] = [];
        try {
            if (db) {
                const snap = await db
                    .collection("visits")
                    .orderBy("timestamp", "desc")
                    .limit(200)
                    .get();
                snap.forEach((doc) => dbRecords.push(doc.data() as VisitRecord));
            }
        } catch (err) {
            console.error("Firestore visits read error:", err);
        }

        // Merge without duplicates
        const combined = [...dbRecords, ...visitStore];
        const uniqueMap = new Map<string, VisitRecord>();
        combined.forEach((v) => uniqueMap.set(v.id, v));
        const visits = Array.from(uniqueMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return NextResponse.json({ success: true, visits, total: visits.length });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to fetch visits" }, { status: 500 });
    }
}
