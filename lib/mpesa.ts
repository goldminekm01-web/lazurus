import { URL } from "url";

/**
 * Safaricom Daraja API integration for M-Pesa STK Push (Lipa Na M-Pesa Online).
 *
 * All functions run server-side only (in Next.js API routes or server components).
 * Never import this module on the client side.
 */

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const PASS_KEY = process.env.MPESA_PASS_KEY || "";
const SHORT_CODE = process.env.MPESA_SHORT_CODE || "5002399";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "https://lazurusgroup.com/api/mpesa/callback";

const BASE_URL = MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

// ── Token caching ──────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/** Get a fresh OAuth access token from Daraja, with 1-hour caching. */
export async function getMpesaToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
        return cachedToken;
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");

    const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: "GET",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`M-Pesa token request failed: ${res.status} ${body}`);
    }

    const data = await res.json();
    cachedToken = data.access_token || null;
    tokenExpiry = now + (data.expires_in || 3600) * 1000 - 60000; // 1 min buffer
    if (!cachedToken) {
        throw new Error("M-Pesa token request returned no access_token");
    }
    return cachedToken;
}

/** Build the STK Push password (base64 of shortcode + passkey + timestamp). */
function buildPassword(timestamp: string): string {
    return Buffer.from(`${SHORT_CODE}${PASS_KEY}${timestamp}`).toString("base64");
}

/** Format timestamp as yyyymmddhhiiss */
function formatTimestamp(date: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        String(date.getFullYear()) +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds())
    );
}

export interface STKPushResponse {
    success: boolean;
    checkoutRequestId: string;
    merchantRequestId: string;
    responseCode: string;
    responseDescription: string;
    customerMessage?: string;
    message?: string;
}

/**
 * Initiate an STK Push (Lipa Na M-Pesa Online).
 *
 * @param phone Normalized phone: 2547XXXXXXXX
 * @param amount Integer KES (e.g. 30 for 3 votes at 10 KSH each)
 * @param accountRef Reference shown on the STK screen (candidate code, max 12 chars)
 * @param transactionDesc Short description (max 13 chars)
 */
export async function initiateSTKPush(
    phone: string,
    amount: number,
    accountRef: string,
    transactionDesc: string,
): Promise<STKPushResponse> {
    const token = await getMpesaToken();
    const timestamp = formatTimestamp();
    const password = buildPassword(timestamp);

    // Enforce Daraja limits
    const safeAccountRef = accountRef.substring(0, 12);
    const safeDesc = transactionDesc.substring(0, 13);

    const payload = {
        BusinessShortCode: SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: SHORT_CODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: safeAccountRef,
        TransactionDesc: safeDesc,
    };

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.response_code === 0 || data.ResponseCode === "0") {
        return {
            success: true,
            checkoutRequestId: data.checkout_request_id || data.CheckoutRequestID,
            merchantRequestId: data.merchant_request_id || data.MerchantRequestID,
            responseCode: data.response_code || data.ResponseCode,
            responseDescription: data.response_description || data.ResponseDescription,
            customerMessage: data.customer_message || data.CustomerMessage,
        };
    }

    return {
        success: false,
        checkoutRequestId: "",
        merchantRequestId: data.merchant_request_id || data.MerchantRequestID || "",
        responseCode: data.response_code || data.ResponseCode || "unknown",
        responseDescription: data.response_description || data.ResponseDescription || "STK Push failed",
        message: data.customer_message || data.CustomerMessage || data.message,
    };
}

export interface STKQueryResponse {
    success: boolean;
    result_code: number;
    result_desc: string;
    mpesa_receipt?: string;
    amount?: number;
    transaction_date?: string;
    phonenumber?: string;
}

/**
 * Query the status of a previously initiated STK Push.
 * Useful as a fallback if the callback wasn't received.
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<STKQueryResponse> {
    const token = await getMpesaToken();
    const timestamp = formatTimestamp();
    const password = buildPassword(timestamp);

    const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            BusinessShortCode: SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
        }),
    });

    const data = await res.json();

    const resultCode = data.result_code ?? data.ResultCode;
    const resultDesc = data.result_desc ?? data.ResultDesc;

    // ResultCode 0 = success (in Daraja 2.0, also "0" / "Success")
    // ResultCode 1032 = transaction failed/cancelled
    return {
        success: resultCode === 0 || resultCode === "0" || resultCode === "Success",
        result_code: resultCode,
        result_desc: resultDesc,
        mpesa_receipt: data.mpesa_receipt_number || data.MpesaReceiptNumber,
        amount: data.amount || data.Amount,
        transaction_date: data.transaction_date || data.TransactionDate,
        phonenumber: data.phonenumber || data.PhoneNumber,
    };
}
