import { NextRequest, NextResponse } from "next/server";
import {
    normalizePhone,
    detectNetwork,
} from "@/lib/phone-utils";
import {
    getCandidateByCode,
    saveVotePayment,
    recordVotesFromPayment,
    getExistingCodes,
} from "@/lib/voting";
import { parseInboundSMS, extractVoteCodeFromSMS } from "@/lib/sms";
import type { VotePayment } from "@/lib/types";

const VOTE_COST_KSH = 10;

/**
 * POST /api/sms/receive
 * Africa's Talking inbound SMS webhook.
 *
 * Africa's Talking sends a POST to your callback URL with the SMS payload.
 * The user's SMS body should be the candidate's code (e.g. "FRESH01").
 * The SMS itself costs the user 10 KSH (charged by the telco premium SMS rate).
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Parse the inbound SMS
        const { phoneNumber, message, shortcode } = parseInboundSMS(body);

        if (!phoneNumber || !message) {
            console.error("[SMS] Missing phone or message:", body);
            return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
        }

        // Normalize the phone number
        const normalizedPhone = normalizePhone(phoneNumber);
        if (!normalizedPhone) {
            console.error("[SMS] Invalid phone number:", phoneNumber);
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        const network = detectNetwork(normalizedPhone);

        // Extract vote code from the SMS message
        const code = extractVoteCodeFromSMS(message);
        if (!code) {
            console.log(`[SMS] No valid vote code found in message: ${message}`);
            return NextResponse.json({
                error: "No valid vote code found. Send your candidate code via SMS.",
            }, { status: 400 });
        }

        // Look up the candidate
        const candidate = await getCandidateByCode(code);
        if (!candidate || !candidate.active) {
            console.log(`[SMS] Candidate not found for code: ${code}`);
            return NextResponse.json({
                error: `Candidate with code ${code} not found.`,
            }, { status: 404 });
        }

        // Record the vote (1 vote per SMS — 10 KSH charged by telco)
        const paymentId = `sms_${normalizedPhone}_${Date.now()}`;
        const votePayment: VotePayment = {
            checkoutRequestId: paymentId,
            candidateCode: code.toUpperCase(),
            candidateId: candidate.id,
            phoneNumber: normalizedPhone,
            amount: VOTE_COST_KSH,
            voteCount: 1,
            status: "completed",
            mpesaReceipt: `SMS_${shortcode || "UNKNOWN"}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            network: network,
        };

        // Save payment record (idempotency check via checkoutRequestId)
        const existing = await saveVotePayment(votePayment);

        // Record the votes
        await recordVotesFromPayment(votePayment);

        console.log(`[SMS] Recorded 1 vote for candidate ${candidate.name} (${code}) from ${normalizedPhone}`);

        return NextResponse.json({
            success: true,
            message: `Vote recorded for ${candidate.name}!`,
            candidate: candidate.name,
            candidateCode: code,
            phone: normalizedPhone,
        });
    } catch (error: any) {
        console.error("[SMS] Error processing inbound SMS:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

/**
 * GET /api/sms/receive
 * Returns instructions for the Africa's Talking webhook setup.
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: "ok",
        message: "SMS receive endpoint for Africa's Talking inbound webhooks.",
        expectedFields: ["SMSMessageData.Message", "SMSMessageData.PhoneNumber"],
        format: "Send candidate code (e.g. 'FRESH01') via SMS to the shortcode.",
    });
}
