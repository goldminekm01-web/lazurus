import { NextRequest, NextResponse } from "next/server";
import { seedDefaultCategories, getAllCandidates } from "@/lib/voting";

/**
 * POST /api/vote/seed
 * Seeds the Firestore with default voting categories.
 * Protected by admin token.
 */
export async function POST(request: NextRequest) {
    const token = request.headers.get("x-admin-token");
    if (token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await seedDefaultCategories();
        return NextResponse.json({ success: true, message: "Default categories seeded" });
    } catch (error: any) {
        console.error("[API] Seed error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/vote/seed
 * Returns counts of existing categories and candidates (for status check).
 */
export async function GET(request: NextRequest) {
    const token = request.headers.get("x-admin-token");
    if (token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const categories = await seedDefaultCategories; // won't actually call, just reference
        const candidates = await getAllCandidates();
        return NextResponse.json({
            message: "Use POST to seed default categories",
            candidateCount: candidates.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
