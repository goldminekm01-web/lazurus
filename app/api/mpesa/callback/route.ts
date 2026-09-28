import { NextRequest, NextResponse } from "next/server";
import {
    getVotePayment,
    updateVotePaymentStatus,
    recordVotesFromPayment,
    getCandidateByCode,
} from "@/lib/voting";
import { querySTKPushStatus } from "@/lib/mpesa";

/**
 * POST /api/mpesa/callback
 * Public webhook — called by Safaricom Daraja after STK Push completes.
 * Must respond with HTTP 200 within 2 seconds.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Parse the STK callback payload
        // Structure: { Body: { stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } } }
        const stkCallback = body?.Body?.stkCallback;
        if (!stkCallback) {
            console.error("[MPESA CALLBACK] No stkCallback in payload:", body);
            return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid payload" });
        }

        const {
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata,
        } = stkCallback;

        console.log(`[MPESA CALLBACK] CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);

        // Acknowledge immediately — Safaricom expects 200 OK
        const response = NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

        // Process asynchronously (don't await — we already sent the ack)
        processPaymentCallback(
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata,
        ).catch((err) => {
            console.error("[MPESA CALLBACK] Error processing payment:", err);
        });

        return response;
    } catch (error: any) {
        console.error("[MPESA CALLBACK] Error:", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: error.message });
    }
}

/**
 * Process the payment callback result.
 * ResultCode 0 = success, anything else = failure.
 */
async function processPaymentCallback(
    checkoutRequestId: string,
    resultCode: number,
    resultDesc: string,
    callbackMetadata: any,
): Promise<void> {
    if (!checkoutRequestId) {
        console.error("[MPESA CALLBACK] No CheckoutRequestID provided");
        return;
    }

    const payment = await getVotePayment(checkoutRequestId);
    if (!payment) {
        console.error(`[MPESA CALLBACK] Payment not found for CheckoutRequestID: ${checkoutRequestId}`);
        return;
    }

    // Idempotency: skip if already processed
    if (payment.status === "completed") {
        console.log(`[MPESA CALLBACK] Payment already completed for ${checkoutRequestId}`);
        return;
    }

    if (resultCode !== 0) {
        console.log(`[MPESA CALLBACK] Payment failed (${resultDesc}) for ${checkoutRequestId}`);
        await updateVotePaymentStatus(checkoutRequestId, "failed");
        return;
    }

    // Extract metadata from successful payment
    // Structure: CallbackMetadata: { Item: [ { Name, Value } ] }
    let amount = payment.amount;
    let mpesaReceipt = "";
    let phoneNumber = payment.phoneNumber;

    if (callbackMetadata?.Item) {
        for (const item of callbackMetadata.Item) {
            if (item.Name === "Amount") amount = item.Value;
            if (item.Name === "MpesaReceiptNumber") mpesaReceipt = item.Value;
            if (item.Name === "PhoneNumber") phoneNumber = String(item.Value);
        }
    }

    // Cross-verify via STK query (fallback verification)
    const queryResult = await querySTKPushStatus(checkoutRequestId);
    if (!queryResult.success) {
        console.warn(`[MPESA CALLBACK] STK query verification failed for ${checkoutRequestId}, using callback data only`);
    }

    // Update payment status
    await updateVotePaymentStatus(
        checkoutRequestId,
        "completed",
        mpesaReceipt || queryResult.mpesa_receipt,
    );

    // Record the votes (atomic transaction)
    await recordVotesFromPayment({
        ...payment,
        status: "completed",
        mpesaReceipt: mpesaReceipt || queryResult.mpesa_receipt || "",
        network: payment.network || (detectNetwork(phoneNumber) as any),
        amount: amount || payment.amount,
    });

    console.log(`[MPESA CALLBACK] Successfully recorded ${payment.voteCount} votes for candidate ${payment.candidateCode} from ${phoneNumber}`);
}

function detectNetwork(phone: string): "safaricom" | "airtel" | "other" {
    if (phone.startsWith("2547") && phone.length === 12) return "safaricom";
    if (phone.startsWith("2541") && phone.length === 11) return "airtel";
    return "other";
}

/**
 * GET /api/mpesa/callback
 * Health check / verification endpoint for webhook setup.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (checkoutRequestId) {
        const result = await querySTKPushStatus(checkoutRequestId);
        return NextResponse.json(result);
    }

    return NextResponse.json({
        status: "ok",
        message: "M-Pesa callback endpoint. POST the STK callback payload here.",
        endpoint: "/api/mpesa/callback",
    });
}
