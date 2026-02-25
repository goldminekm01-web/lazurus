import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllPostsIncludingDrafts, savePost, deletePost } from "@/lib/posts";

export const dynamic = "force-static";

function checkAuth(req: NextRequest): boolean {
    const token = req.headers.get("x-admin-token") || req.cookies.get("admin_token")?.value;
    return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
        const post = getAllPostsIncludingDrafts().find((p) => p.slug === slug);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        return NextResponse.json({ post });
    }

    const posts = getAllPostsIncludingDrafts();
    return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        const { slug, content, ...frontmatter } = body;
        if (!slug || !content) {
            return NextResponse.json({ error: "slug and content are required" }, { status: 400 });
        }
        savePost(slug, frontmatter, content);
        return NextResponse.json({ success: true, slug });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    deletePost(slug);
    return NextResponse.json({ success: true });
}
