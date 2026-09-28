import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/mpesa";
import { saveVotePayment, getCandidateByCode, getCandidateById } from "@/lib/voting";
import { normalizePhone, detectNetwork } from "@/lib/phone-utils";
import type { VotePayment } from "@/lib/types";

const VOTE_COST_KSH = 10;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone, candidateCode, voteCount } = body;
        const rawPhone = phone;
        if (!rawPhone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }
        if (!candidateCode) {
            return NextResponse.json({ error: "Candidate code is required" }, { status: 400 });
        }

        const votes = parseInt(voteCount, 10);
        if (isNaN(votes) || votes < 1 || votes > 100) {
            return NextResponse.json({ error: "Vote count must be between 1 and 100" }, { status: 400 });
        }

        // ── Normalize phone number ────────────────────────────────────
        const normalizedPhone = normalizePhone(rawPhone);
        if (!normalizedPhone) {
            return NextResponse.json({ error: "Invalid Kenyan phone number" }, { status: 400 });
        }

        // ── Verify candidate exists ────────────────────────────────────
        const candidate = await getCandidateByCode(candidateCode);
        if (!candidate || !candidate.active) {
            return NextResponse.json({ error: "Candidate not found or inactive" }, { status: 404 });
        }

        // ── Calculate amount ───────────────────────────────────────────
        const amount = VOTE_COST_KSH * votes;

        // ── Detect network ────────────────────────────────────────────
        const network = detectNetwork(normalizedPhone);

        // Only Safaricom supports STK Push
        if (network !== "safaricom") {
            return NextResponse.json({
                error: `STK Push is only available for Safaricom numbers. For Airtel, please send SMS with code ${candidateCode} to 5002399.`,
                requiresSMS: true,
                candidateCode,
                network,
            }, { status: 400 });
        }

        // ── Initiate STK Push ─────────────────────────────────────────
        const accountRef = candidateCode.substring(0, 12);
        const transactionDesc = `Vote${candidateCode.substring(0, 2)}`;

        const stkResult = await initiateSTKPush(
            normalizedPhone,
            amount,
            accountRef,
            transactionDesc,
        );

        if (!stkResult.success) {
            console.error("[API] STK Push failed:", stkResult);
            return NextResponse.json(
                { error: stkResult.responseDescription || "Payment initiation failed" },
                { status: 500 },
            );
        }

        // ── Save pending payment record for callback matching ─────────
        const payment: VotePayment = {
            checkoutRequestId: stkResult.checkoutRequestId,
            candidateCode: candidateCode.toUpperCase(),
            candidateId: candidate.id,
            phoneNumber: normalizedPhone,
            amount,
            voteCount: votes,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            network: "safaricom",
        };

        await saveVotePayment(payment);

        return NextResponse.json({
            success: true,
            checkoutRequestId: stkResult.checkoutRequestId,
            message: "STK Push initiated. Enter your M-Pesa PIN on your phone to complete the payment.",
            amount,
            candidate: candidate.name,
            candidateCode,
        });
    } catch (error: any) {
        console.error("[API] POST /api/mpesa/stkpush error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
