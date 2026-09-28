/**
 * Africa's Talking SMS gateway integration.
 *
 * Used for:
 *  1. Sending confirmation SMS to voters (post-payment)
 *  2. Receiving inbound SMS votes (Airtel fallback path)
 *
 * All functions run server-side only.
 */

const AT_USERNAME = process.env.AT_USERNAME || "";
const AT_API_KEY = process.env.AT_API_KEY || "";
const AT_SHORTCODE = process.env.AT_SHORTCODE || "";

const AT_BASE_URL = "https://api.sandbox.africastalking.com";

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${AT_USERNAME}:${AT_API_KEY}`).toString("base64")}`,
    };
}

/**
 * Send a single SMS to a phone number.
 */
export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const res = await fetch(`${AT_BASE_URL}/v2/messaging`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            to: phone,
            message: message,
            username: AT_USERNAME,
        }),
    });

    const data = await res.json();

    if (res.ok && data.SMSMessageData?.Recipients?.length > 0) {
        const recipient = data.SMSMessageData.Recipients[0];
        return {
            success: recipient.status === "Success" || recipient.status === "Sent to carrier",
            messageId: recipient.messageId,
        };
    }

    return {
        success: false,
        error: data.SMSMessageData?.Message || data.error || "SMS send failed",
    };
}

/**
 * Send bulk SMS to multiple phone numbers.
 */
export async function sendBulkSMS(phones: string[], message: string) {
    const results = [];
    for (const phone of phones) {
        results.push(await sendSMS(phone, message));
    }
    return results;
}

export interface ATInboundSMS {
   SmsMessageData: {
        Message: string;
        SMSMessageData?: {
            Message: string;
            Recipients?: any[];
        };
    };
}

/**
 * Parse an Africa's Talking inbound SMS webhook payload.
 * AT sends SMS as: "VOTE [CODE]" or just "[CODE]"
 */
export function parseInboundSMS(body: any): {
    phoneNumber: string | null;
    message: string;
    shortcode: string | null;
} {
    // Africa's Talking sends the webhook as JSON or form data
    // The structure depends on the webhook setup
    const rawBody = typeof body === "string" ? JSON.parse(body) : body;

    // Try different payload structures
    const smsData = rawBody.SMSMessageData || rawBody.sms || rawBody;
    const message = smsData.Message || smsData.message || smsData.sms || "";
    const phone = smsData.phoneNumber || smsData.PhoneNumber || smsData.from || smsData.From || null;

    return {
        phoneNumber: phone,
        message: message.trim().toUpperCase(),
        shortcode: smsData.shortCode || smsData.ShortCode || AT_SHORTCODE,
    };
}

/**
 * Extract the vote code from an inbound SMS message.
 * Expected formats: "VOTE FRESH01" or "FRESH01"
 */
export function extractVoteCodeFromSMS(message: string): string | null {
    const upper = message.trim().toUpperCase();

    // Strip "VOTE " prefix if present
    const stripped = upper.replace(/^VOTE\s+/i, "").trim();

    // Extract 6-char alphanumeric code
    const match = stripped.match(/([A-Z0-9]{6})/);
    return match ? match[1] : null;
}
