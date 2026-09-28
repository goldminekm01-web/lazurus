/**
 * Firestore data access layer for the voting system.
 * All functions run server-side (API routes or server components).
 */

import { db } from "./firebase-admin";
import type { VoteCategory, Candidate, Vote, VotePayment } from "./types";
import { generateBaseCode, generateUniqueCode, isValidVoteCode } from "./vote-code";

// ─── Categories ───────────────────────────────────────────────────

export async function getAllCategories(activeOnly = false): Promise<VoteCategory[]> {
    try {
        let result: VoteCategory[] = [];

        // Try with server-side filter + ordering (requires composite index)
        if (activeOnly) {
            try {
                const snapshot = await db.collection("categories")
                    .where("active", "==", true)
                    .orderBy("createdAt", "desc")
                    .get();
                result = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<VoteCategory, "id">),
                }));
            } catch (indexError: any) {
                // Missing composite index — fall back to simple query + client-side filter
                console.warn("[VOTING] Composite index missing for categories, using client-side fallback");
                const allSnap = await db.collection("categories").get();
                result = allSnap.docs
                    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<VoteCategory, "id">) }))
                    .filter((cat) => (cat as any).active === true || (cat as any).active === "true")
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
            }
        } else {
            try {
                const snapshot = await db.collection("categories")
                    .orderBy("createdAt", "desc")
                    .get();
                result = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<VoteCategory, "id">),
                }));
            } catch (indexError: any) {
                console.warn("[VOTING] Index missing for categories ordering, using client-side sort");
                const allSnap = await db.collection("categories").get();
                result = allSnap.docs
                    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<VoteCategory, "id">) }))
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
            }
        }

        return result;
    } catch (error) {
        console.error("[VOTING] Error fetching categories:", error);
        return [];
    }
}

export async function getCategoryBySlug(slug: string): Promise<VoteCategory | null> {
    try {
        const snapshot = await db.collection("categories")
            .where("slug", "==", slug)
            .limit(1)
            .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...(doc.data() as Omit<VoteCategory, "id">) };
    } catch (error) {
        console.error(`[VOTING] Error fetching category ${slug}:`, error);
        return null;
    }
}

export async function getCategoryById(id: string): Promise<VoteCategory | null> {
    try {
        const doc = await db.collection("categories").doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...(doc.data() as Omit<VoteCategory, "id">) };
    } catch (error) {
        console.error(`[VOTING] Error fetching category ${id}:`, error);
        return null;
    }
}

export async function saveCategory(category: Partial<VoteCategory>): Promise<VoteCategory> {
    const now = new Date().toISOString();
    let docId: string | undefined;

    if (category.id) {
        // Update existing
        docId = category.id;
        await db.collection("categories").doc(docId).set({
            ...category,
            updatedAt: now,
        }, { merge: true });
    } else {
        // Create new — use slug as doc ID for idempotency
        docId = undefined;
        const payload = {
            ...category,
            createdAt: now,
            updatedAt: now,
            active: category.active ?? true,
        };
        const docRef = await db.collection("categories").add(payload);
        docId = docRef.id;
    }

    const saved = await getCategoryById(docId);
    if (!saved) throw new Error(`Failed to save category ${docId}`);
    return saved;
}

export async function deleteCategory(id: string): Promise<void> {
    // Delete the category and all candidates in it
    const docRef = db.collection("categories").doc(id);

    // Delete candidates in this category
    const candidatesSnap = await db.collection("candidates")
        .where("categoryId", "==", id)
        .get();
    const batch = db.batch();
    candidatesSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    batch.delete(docRef);
    await batch.commit();
}

// ─── Candidates ──────────────────────────────────────────────────

export async function getAllCandidates(activeOnly = false): Promise<Candidate[]> {
    try {
        let result: Candidate[] = [];

        if (activeOnly) {
            try {
                const snapshot = await db.collection("candidates")
                    .where("active", "==", true)
                    .orderBy("createdAt", "desc")
                    .get();
                result = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Candidate, "id">),
                }));
            } catch (indexError: any) {
                console.warn("[VOTING] Composite index missing for candidates, using client-side fallback");
                const allSnap = await db.collection("candidates").get();
                result = allSnap.docs
                    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }))
                    .filter((c) => (c as any).active === true || (c as any).active === "true")
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
            }
        } else {
            try {
                const snapshot = await db.collection("candidates")
                    .orderBy("createdAt", "desc")
                    .get();
                result = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Candidate, "id">),
                }));
            } catch (indexError: any) {
                console.warn("[VOTING] Index missing for candidates ordering, using client-side sort");
                const allSnap = await db.collection("candidates").get();
                result = allSnap.docs
                    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }))
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
            }
        }

        return result;
    } catch (error) {
        console.error("[VOTING] Error fetching candidates:", error);
        return [];
    }
}

export async function getCandidatesByCategory(categoryId: string, activeOnly = true): Promise<Candidate[]> {
    try {
        // Try with server-side filter + ordering (requires composite index)
        try {
            let query: FirebaseFirestore.Query = db.collection("candidates")
                .where("categoryId", "==", categoryId);
            if (activeOnly) {
                query = query.where("active", "==", true);
            }
            query = query.orderBy("createdAt", "desc");
            const snapshot = await query.get();
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Candidate, "id">),
            }));
        } catch (indexError: any) {
            // Missing composite index — fall back to simple query + client-side filter
            console.warn("[VOTING] Composite index missing for candidates by category, using client-side fallback");
            const allSnap = await db.collection("candidates")
                .where("categoryId", "==", categoryId)
                .get();
            return allSnap.docs
                .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }))
                .filter((c) => {
                    if (!activeOnly) return true;
                    const activeVal = (c as any).active;
                    return activeVal === true || activeVal === "true";
                })
                .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
        }
    } catch (error) {
        console.error(`[VOTING] Error fetching candidates for category ${categoryId}:`, error);
        return [];
    }
}

export async function getCandidateByCode(code: string): Promise<Candidate | null> {
    try {
        const snapshot = await db.collection("candidates")
            .where("code", "==", code.toUpperCase())
            .limit(1)
            .get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...(doc.data() as Omit<Candidate, "id">) };
    } catch (error) {
        console.error(`[VOTING] Error fetching candidate by code ${code}:`, error);
        return null;
    }
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
    try {
        const doc = await db.collection("candidates").doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...(doc.data() as Omit<Candidate, "id">) };
    } catch (error) {
        console.error(`[VOTING] Error fetching candidate ${id}:`, error);
        return null;
    }
}

export async function getExistingCodes(): Promise<string[]> {
    try {
        const snapshot = await db.collection("candidates").get();
        return snapshot.docs.map((doc) => (doc.data() as Candidate).code?.toUpperCase()).filter(Boolean);
    } catch (error) {
        console.error("[VOTING] Error fetching existing codes:", error);
        return [];
    }
}

export async function saveCandidate(candidate: Partial<Candidate>): Promise<Candidate> {
    const now = new Date().toISOString();

    // Auto-generate code if not provided
    let code = candidate.code;
    if (!code && candidate.name) {
        const existingCodes = await getExistingCodes();
        code = await generateUniqueCode(candidate.name, existingCodes);
    }

    // Validate code format
    if (code && !isValidVoteCode(code.toUpperCase())) {
        throw new Error(`Invalid vote code format: ${code}. Must be 6 alphanumeric chars.`);
    }

    const payload = {
        ...candidate,
        code: code ? code.toUpperCase() : undefined,
        slug: candidate.slug || (candidate.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-+$)/g, ""),
        voteCount: candidate.voteCount ?? 0,
        active: candidate.active ?? true,
        createdAt: candidate.createdAt || now,
        updatedAt: now,
    };

    if (candidate.id) {
        await db.collection("candidates").doc(candidate.id).set(payload, { merge: true });
    } else {
        const docRef = await db.collection("candidates").add(payload);
        return (await getCandidateById(docRef.id))!;
    }

    return (await getCandidateById(payload.id || candidate.id!))!;
}

export async function deleteCandidate(id: string): Promise<void> {
    await db.collection("candidates").doc(id).delete();
}

export async function incrementVoteCount(candidateId: string, amount: number): Promise<void> {
    await db.collection("candidates").doc(candidateId).update({
        voteCount: FirebaseFirestore.FieldValue.increment(amount),
    });
}

/**
 * Get all categories with their active candidates (for the public voting page).
 */
export async function getVotingData(): Promise<
    { category: VoteCategory; candidates: Candidate[] }[]
> {
    const categories = await getAllCategories(true);
    const result = [];
    for (const cat of categories) {
        const candidates = await getCandidatesByCategory(cat.id!, true);
        result.push({ category: cat, candidates });
    }
    return result;
}

/**
 * Get full voting results (all candidates sorted by vote count).
 */
export async function getVoteResults(): Promise<Candidate[]> {
    try {
        // Try with orderBy (requires composite index on active + voteCount)
        const snapshot = await db.collection("candidates")
            .where("active", "==", true)
            .orderBy("voteCount", "desc")
            .get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Candidate, "id">),
        }));
    } catch (error) {
        console.error("[VOTING] Error fetching vote results (index fallback):", error);
        // Fallback: fetch all and filter/sort client-side
        try {
            const allSnap = await db.collection("candidates").get();
            return allSnap.docs
                .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Candidate, "id">) }))
                .filter((c) => (c as any).active === true || (c as any).active === "true")
                .sort((a, b) => ((b as any).voteCount || 0) - ((a as any).voteCount || 0));
        } catch (fallbackError) {
            console.error("[VOTING] Fallback also failed:", fallbackError);
            return [];
        }
    }
}

// ─── Votes (immutable log) ─────────────────────────────────────────

export async function createVote(vote: Omit<Vote, "id">): Promise<void> {
    await db.collection("votes").add({
        ...vote,
        createdAt: new Date().toISOString(),
    });
}

// ─── Vote Payments (STK tracking) ──────────────────────────────────

export async function saveVotePayment(payment: VotePayment): Promise<void> {
    // Use checkoutRequestId as doc ID for idempotency
    const docId = payment.checkoutRequestId || undefined;
    if (docId) {
        await db.collection("vote_payments").doc(docId).set({
            ...payment,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
    } else {
        await db.collection("vote_payments").add({
            ...payment,
            updatedAt: new Date().toISOString(),
        });
    }
}

export async function getVotePayment(checkoutRequestId: string): Promise<VotePayment | null> {
    try {
        const doc = await db.collection("vote_payments").doc(checkoutRequestId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...(doc.data() as Omit<VotePayment, "id">) };
    } catch (error) {
        console.error(`[VOTING] Error fetching vote payment ${checkoutRequestId}:`, error);
        return null;
    }
}

export async function updateVotePaymentStatus(
    checkoutRequestId: string,
    status: "completed" | "failed",
    mpesaReceipt?: string,
): Promise<void> {
    const update: any = {
        status,
        updatedAt: new Date().toISOString(),
    };
    if (mpesaReceipt) {
        update.mpesaReceipt = mpesaReceipt;
    }
    await db.collection("vote_payments").doc(checkoutRequestId).update(update);
}

/**
 * Record a successful vote payment — increments candidate vote count and logs votes.
 * Uses a Firestore transaction for atomicity.
 */
export async function recordVotesFromPayment(payment: VotePayment): Promise<void> {
    const candidate = await getCandidateByCode(payment.candidateCode);
    if (!candidate) {
        throw new Error(`Candidate not found for code: ${payment.candidateCode}`);
    }

    await db.runTransaction(async (t) => {
        // Increment vote count
        const candidateRef = db.collection("candidates").doc(candidate.id!);
        t.update(candidateRef, {
            voteCount: FirebaseFirestore.FieldValue.increment(payment.voteCount),
        });

        // Log the vote(s)
        for (let i = 0; i < payment.voteCount; i++) {
            t.create(db.collection("votes").doc(), {
                candidateId: candidate.id,
                candidateCode: payment.candidateCode,
                phoneNumber: payment.phoneNumber,
                amount: payment.amount,
                voteCount: 1,
                mpesaReceipt: payment.mpesaReceipt || "",
                checkoutRequestId: payment.checkoutRequestId,
                paymentStatus: "completed" as const,
                network: (payment.network as "safaricom" | "airtel" | "other") || "safaricom",
                createdAt: new Date().toISOString(),
            });
        }
    });
}

// ─── Seed default categories ───────────────────────────────────────

const DEFAULT_CATEGORIES: Partial<VoteCategory>[] = [
    { name: "Artist", slug: "artist", description: "Best Music Artist", color: "#0066ff" },
    { name: "DJ", slug: "dj", description: "Best DJ", color: "#e8a020" },
    { name: "Photographer", slug: "photographer", description: "Best Photographer", color: "#00c47a" },
    { name: "Producer", slug: "producer", description: "Best Producer", color: "#8b5cf6" },
    { name: "Dance Crew", slug: "dance-crew", description: "Best Dance Crew", color: "#ec4899" },
];

export async function seedDefaultCategories(): Promise<void> {
    for (const cat of DEFAULT_CATEGORIES) {
        // Check if already exists
        const existing = await getCategoryBySlug(cat.slug!);
        if (!existing) {
            await saveCategory({
                ...cat,
                active: true,
                createdAt: new Date().toISOString(),
            });
            console.log(`[VOTING] Seeded category: ${cat.name}`);
        }
    }
}