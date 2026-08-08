import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const NOTIFY_EMAIL = "lazurus@lazurusgroup.com";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Valid email required" }, { status: 400 });
        }

        // 1. Save subscriber to Firebase so no data is ever lost
        try {
            await db.collection("subscribers").doc(email).set({
                email,
                subscribedAt: new Date().toISOString(),
                source: "Website Form"
            }, { merge: true });
        } catch (dbErr) {
            console.error("[SUBSCRIBE] Firebase error:", dbErr);
            // Continue even if DB fails, try to send email
        }

        // 2. Send notification via Resend (if key exists)
        const resendKey = process.env.RESEND_API_KEY;

        if (resendKey) {
            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendKey}`,
                },
                body: JSON.stringify({
                    from: "LazurusGroup <onboarding@resend.dev>",
                    to: [NOTIFY_EMAIL],
                    subject: `🆕 New Subscriber: ${email}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px;">
                            <div style="background:#0a0a0a;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
                                <h2 style="color:#e8a020;margin:0;font-size:20px;">📩 New Newsletter Subscriber</h2>
                            </div>
                            <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>Email:</strong> ${email}</p>
                            <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>Time:</strong> ${new Date().toUTCString()}</p>
                            <p style="color:#374151;font-size:15px;margin:0 0 24px;"><strong>Source:</strong> LazurusGroup.com newsletter form</p>
                            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
                            <p style="color:#9ca3af;font-size:12px;margin:0;">LazurusGroup Subscriber Notification — lazurusgroup.com</p>
                        </div>
                    `,
                }),
            });
        } else {
            // No API key — log to console (works locally, shows in Vercel logs)
            console.log(`[SUBSCRIBE] New subscriber: ${email} at ${new Date().toISOString()}`);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[SUBSCRIBE] Error:", err);
        return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
    }
}
