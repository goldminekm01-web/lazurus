import { NextRequest, NextResponse } from "next/server";
import {
    getAllCandidates,
    getCandidatesByCategory,
    getCandidateByCode,
    getCandidateById,
    saveCandidate,
    deleteCandidate,
    getExistingCodes,
    getVotingData,
    getVoteResults,
} from "@/lib/voting";
import { generateUniqueCode } from "@/lib/vote-code";
import type { Candidate } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const code = searchParams.get("code");
        const categoryId = searchParams.get("categoryId");
        const activeOnly = searchParams.get("activeOnly") === "true";
        const publicView = searchParams.get("public") === "true";

        // Public endpoints (no auth)
        if (publicView) {
            // Return all active categories with their candidates
            if (categoryId) {
                const candidates = await getCandidatesByCategory(categoryId, true);
                return NextResponse.json({ candidates });
            }
            if (code) {
                const candidate = await getCandidateByCode(code);
                return candidate
                    ? NextResponse.json({ candidate })
                    : NextResponse.json({ error: "Candidate not found" }, { status: 404 });
            }
            // Full voting data (categories + candidates)
            const data = await getVotingData();
            return NextResponse.json({ data });
        }

        // Admin endpoints (require auth)
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (id) {
            const candidate = await getCandidateById(id);
            return candidate
                ? NextResponse.json({ candidate })
                : NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        if (code) {
            const candidate = await getCandidateByCode(code);
            return candidate
                ? NextResponse.json({ candidate })
                : NextResponse.json({ error: "Candidate not found" }, { status: 404 });
        }

        if (categoryId) {
            const candidates = await getCandidatesByCategory(categoryId, activeOnly);
            return NextResponse.json({ candidates });
        }

        // Public results endpoint
        if (searchParams.get("results") === "true") {
            const results = await getVoteResults();
            return NextResponse.json({ results });
        }

        const candidates = await getAllCandidates(activeOnly);
        return NextResponse.json({ candidates });
    } catch (error: any) {
        console.error("[API] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, categoryId, image, bio, active = true } = body;

        if (!name || !categoryId) {
            return NextResponse.json({ error: "Name and categoryId are required" }, { status: 400 });
        }

        // Auto-generate unique code if not provided
        let code = body.code;
        if (!code) {
            const existingCodes = await getExistingCodes();
            code = await generateUniqueCode(name, existingCodes);
        }

        const candidate = await saveCandidate({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-+$)/g, ""),
            code: code.toUpperCase(),
            categoryId,
            image: image || "",
            bio: bio || "",
            active,
            voteCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {}

        return NextResponse.json({ success: true, candidate });
    } catch (error: any) {
        console.error("[API] POST /api/vote/candidates error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });
        }

        const body = await request.json();
        const updated = await saveCandidate({ id, ...body });

        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {}

        return NextResponse.json({ success: true, candidate: updated });
    } catch (error: any) {
        console.error("[API] PUT /api/vote/candidates error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Candidate ID required" }, { status: 400 });
        }

        await deleteCandidate(id);

        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {}

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] DELETE /api/vote/candidates error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
