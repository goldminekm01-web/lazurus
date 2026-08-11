import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

const NOTIFY_EMAIL = "lazurus@lazurusgroup.com";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, email, scamDetails, amountLost, txHashes, paymentTxHash } = data;

        if (!name || !email || !scamDetails || !amountLost) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Save consultation to Firebase
        try {
            await db.collection("consultations").add({
                name,
                email,
                scamDetails,
                amountLost: Number(amountLost),
                txHashes,
                paymentTxHash: paymentTxHash || "None",
                submittedAt: new Date().toISOString(),
                status: "Pending"
            });
        } catch (dbErr) {
            console.error("[CONSULTATION] Firebase error:", dbErr);
        }

        // 2. Send notification via Resend
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
                    subject: `🚨 New Consultation Request: ${name}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:12px;">
                            <div style="background:#0a0a0a;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
                                <h2 style="color:#e8a020;margin:0;font-size:20px;">🛡️ New Paid Consultation</h2>
                            </div>
                            <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>Name:</strong> ${name}</p>
                            <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>Email:</strong> ${email}</p>
                            <p style="color:#374151;font-size:15px;margin:0 0 12px;"><strong>Amount Lost:</strong> $${amountLost}</p>
                            <p style="color:#374151;font-size:15px;margin:24px 0 8px;"><strong>How they were scammed:</strong></p>
                            <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:16px;color:#4b5563;font-size:14px;line-height:1.5;">
                                ${scamDetails}
                            </div>
                            <p style="color:#374151;font-size:15px;margin:0 0 8px;"><strong>Transaction Hashes:</strong></p>
                            <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:16px;color:#4b5563;font-size:14px;word-break:break-all;">
                                ${txHashes || "Not provided"}
                            </div>
                            <p style="color:#374151;font-size:15px;margin:0 0 24px;"><strong>Payment TxHash:</strong> ${paymentTxHash || "N/A"}</p>
                            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
                            <p style="color:#9ca3af;font-size:12px;margin:0;">LazurusGroup Consultation System — lazurusgroup.com</p>
                        </div>
                    `,
                }),
            });
        } else {
            console.log(`[CONSULTATION] New request from: ${email}`);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[CONSULTATION] Error:", err);
        return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
}
