import { NextRequest, NextResponse } from "next/server";
import {
    getAllCategories,
    getCategoryBySlug,
    getCategoryById,
    saveCategory,
    deleteCategory,
} from "@/lib/voting";
import { seedDefaultCategories } from "@/lib/voting";
import type { VoteCategory } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("activeOnly") === "true";
        const publicView = searchParams.get("public") === "true";

        // Public endpoint (no auth required) — for the voting page
        if (publicView) {
            const categories = await getAllCategories(true);
            return NextResponse.json({ categories });
        }

        const categories = await getAllCategories(activeOnly);
        return NextResponse.json({ categories });
    } catch (error: any) {
        console.error("[API] GET /api/vote/categories error:", error);
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
        const { name, slug, description, color, active = true } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const category = await saveCategory({
            name,
            slug,
            description: description || "",
            color: color || "#0066ff",
            active,
            createdAt: new Date().toISOString(),
        });

        // Revalidate the public voting page
        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {
            console.log("[API] Revalidation skipped:", e);
        }

        return NextResponse.json({ success: true, category });
    } catch (error: any) {
        console.error("[API] POST /api/vote/categories error:", error);
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
            return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }

        const body = await request.json();
        const updated = await saveCategory({ id, ...body });

        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {}

        return NextResponse.json({ success: true, category: updated });
    } catch (error: any) {
        console.error("[API] PUT /api/vote/categories error:", error);
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
            return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }

        await deleteCategory(id);

        try {
            revalidatePath("/vote");
            revalidatePath("/vote/results");
        } catch (e) {}

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API] DELETE /api/vote/categories error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/vote/categories/seed — seed default categories (dev only)
export { seedDefaultCategories };
