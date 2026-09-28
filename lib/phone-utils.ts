/**
 * Kenyan phone number utilities: normalization, network detection.
 */

export type NetworkType = "safaricom" | "airtel" | "other";

// Kenyan mobile prefixes (after normalizing to 2547XXXXXXXX)
// Safaricom: 0700-0708, 0711, 0722, 0723, 0728, 0729, 0730, 0731, 0732, 0733, 0734, 0735, 0736, 0737, 0738, 0739, 0740, 0741, 0742, 0743, 0744, 0745, 0746, 0747, 0748, 0749, 0750, 0752, 0757, 0758, 0759, 0764, 0765, 0766, 0767, 0768, 0769, 0770, 0771, 0772, 0773, 0774, 0775, 0776, 0785, 0786, 0787, 0788, 0789, 0790, 0791, 0792, 0793, 0794, 0795, 0796, 0797, 0798, 0799
// Airtel: 0100-0109, 0110, 0111, 0112, 0113, 0114, 0115, 0116, 0117, 0118, 0119, 0145, 0146, 0147, 0148, 0149

const SAFARICOM_PREFIXES: string[] = [
    "0700", "0701", "0702", "0703", "0704", "0705", "0706", "0707", "0708",
    "0711", "0722", "0723", "0728", "0729", "0730", "0731", "0732", "0733",
    "0734", "0735", "0736", "0737", "0738", "0739", "0740", "0741", "0742",
    "0743", "0744", "0745", "0746", "0747", "0748", "0749", "0750", "0752",
    "0757", "0758", "0759", "0764", "0765", "0766", "0767", "0768", "0769",
    "0770", "0771", "0772", "0773", "0774", "0775", "0776", "0785", "0786",
    "0787", "0788", "0789", "0790", "0791", "0792", "0793", "0794", "0795",
    "0796", "0797", "0798", "0799",
];

const AIRTEL_PREFIXES: string[] = [
    "0100", "0101", "0102", "0103", "0104", "0105", "0106", "0107", "0108",
    "0109", "0110", "0111", "0112", "0113", "0114", "0115", "0116", "0117",
    "0118", "0119", "0145", "0146", "0147", "0148", "0149",
];

/**
 * Normalizes a Kenyan phone number to international format: 2547XXXXXXXX
 * Accepts: 07XX XXX XXX, 07XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX, 7XXXXXXXX
 * Returns null if invalid
 */
export function normalizePhone(input: string): string | null {
    if (!input) return null;

    // Strip everything except digits
    const digits = input.replace(/\D/g, "");

    // Already in international format: 254XXXXXXXXX (11-12 digits)
    if (digits.startsWith("254") && digits.length >= 11 && digits.length <= 12) {
        return digits;
    }

    // Local Safaricom: 07XXXXXXXX (10 digits)
    if (digits.startsWith("07") && digits.length === 10) {
        return "254" + digits.substring(1);
    }

    // Local Airtel: 01XXXXXXXX (10 digits, starts with 01)
    if (digits.startsWith("01") && digits.length === 10) {
        return "254" + digits.substring(1);
    }

    return null;
}

/**
 * Detects the mobile network from a normalized phone number.
 * Input should be in 254XXXXXXXXX format (from normalizePhone).
 */
export function detectNetwork(phone: string): NetworkType {
    if (!phone) return "other";

    // Extract the prefix after country code
    // Safaricom: 2547XXXXXXXX (12 digits) → check digits starting at position 2: 7XXX
    // Airtel: 2541XXXXXXXX (11 digits) → check digits starting at position 2: 1XXX

    let networkPrefix: string;

    if (phone.startsWith("2547") && phone.length === 12) {
        // Safaricom: 2547XXXXXXXX → extract 07XX (digits at positions 3-5 give XX)
        networkPrefix = "07" + phone.substring(3, 5);
    } else if (phone.startsWith("2541") && phone.length === 12) {
        // Airtel: 2541XXXXXXXXX → extract 01XX (digits at positions 3-6 give 1XX)
        networkPrefix = "0" + phone.substring(3, 6); // 01XX
    } else if (phone.startsWith("254") && phone.length >= 12) {
        // Fallback: check 4-digit prefix
        networkPrefix = "0" + phone.substring(2, 5).substring(0, 3);
    } else {
        return "other";
    }

    // Check against known prefixes
    if (SAFARICOM_PREFIXES.some((p) => networkPrefix.startsWith(p.substring(0, 4)))) {
        return "safaricom";
    }

    if (AIRTEL_PREFIXES.some((p) => networkPrefix.startsWith(p.substring(0, 4)))) {
        return "airtel";
    }

    // Broader check: first 4 digits of the network prefix
    const first4 = networkPrefix.substring(0, 4);
    if (SAFARICOM_PREFIXES.includes(first4)) {
        return "safaricom";
    }
    if (AIRTEL_PREFIXES.includes(first4)) {
        return "airtel";
    }

    return "other";
}

/**
 * Formats a phone number for display: 07XX XXX XXX
 */
export function formatPhoneForDisplay(phone: string): string {
    const normalized = normalizePhone(phone);
    if (!normalized) return phone;

    if (normalized.startsWith("2547") && normalized.length === 12) {
        const local = "0" + normalized.substring(3);
        return `${local.substring(0, 4)} ${local.substring(4, 7)} ${local.substring(7)}`;
    }

    if (normalized.startsWith("2541") && normalized.length === 11) {
        const local = "0" + normalized.substring(2);
        return `${local.substring(0, 4)} ${local.substring(4, 7)} ${local.substring(7)}`;
    }

    return phone;
}

/**
 * Validates that a phone number is a valid Kenyan mobile number.
 */
export function isValidKenyanPhone(phone: string): boolean {
    return normalizePhone(phone) !== null;
}
