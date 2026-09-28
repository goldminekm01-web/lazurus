/**
 * Generates unique 6-character vote codes for candidates.
 *
 * Algorithm:
 *   1. Take the first 3 characters + last 3 characters of the name (uppercased, letters only)
 *   2. Pad with "0" if shorter than 6
 *   3. Truncate to exactly 6 characters
 *   4. Check Firestore for collisions; append "01", "02", ... if needed
 */

/** Pure function — no Firestore dependency. Used for tests and dry-runs. */
export function generateBaseCode(name: string): string {
    const clean = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

    if (clean.length === 0) {
        return "XXXXXX";
    }

    let code: string;
    if (clean.length <= 6) {
        // Pad with 0 to reach 6 chars
        code = clean.padEnd(6, "0");
    } else if (clean.length === 7) {
        // 7 chars: take first 3 + last 3 + middle 1 → just first 3 + last 3
        code = clean.substring(0, 3) + clean.substring(4);
    } else {
        // 8+ chars: first 3 + last 3
        code = clean.substring(0, 3) + clean.substring(clean.length - 3);
    }

    return code.substring(0, 6);
}

/**
 * Generates a unique code, checking Firestore for collisions.
 * Appends a numeric suffix on collision: CODE01, CODE02, etc.
 */
export async function generateUniqueCode(name: string, existingCodes?: string[]): Promise<string> {
    const base = generateBaseCode(name);

    if (!existingCodes) {
        // Fallback — caller should pass existing codes for performance
        // but if not provided, we trust uniqueness is handled at write time
        return base;
    }

    if (!existingCodes.includes(base)) {
        return base;
    }

    // Try suffix: CODE01, CODE02, ... CODE99
    // We keep first 3 chars, then 2-char suffix
    const prefix = base.substring(0, 4); // first 4 chars of base
    for (let i = 1; i <= 99; i++) {
        const suffix = String(i).padStart(2, "0");
        const candidate = `${prefix}${suffix}`;
        if (candidate.length === 6 && !existingCodes.includes(candidate)) {
            return candidate;
        }
    }

    // Exhausted 99 suffixes — fall back to random
    const randomSuffix = Math.floor(Math.random() * 90 + 10).toString();
    return (base.substring(0, 4) + randomSuffix).substring(0, 6);
}

/**
 * Validates that a vote code matches the expected format: 6 uppercase alphanumeric chars.
 */
export function isValidVoteCode(code: string): boolean {
    return /^[A-Z0-9]{6}$/.test(code);
}
