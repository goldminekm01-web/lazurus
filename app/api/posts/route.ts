import { NextResponse } from "next/server";
import { getAllPostsIncludingDrafts, getPostBySlug, savePost, deletePost } from "@/lib/posts";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const token = request.headers.get("x-admin-token");

    // Strictly verify token for all GET requests to /api/posts
    if (token !== process.env.ADMIN_PASSWORD) {
        console.error(`[API] Unauthorized GET request. Token mismatch. Expected: ${process.env.ADMIN_PASSWORD ? "SET" : "NOT SET"}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (slug) {
        const post = await getPostBySlug(slug);
        return NextResponse.json({ post });
    }

    const posts = await getAllPostsIncludingDrafts();
    return NextResponse.json({ posts });
}

export async function POST(request: Request) {
    const { slug, frontmatter, content } = await request.json();
    const token = request.headers.get("x-admin-token");

    if (token !== process.env.ADMIN_PASSWORD) {
        console.error(`[API] Unauthorized POST request. Token mismatch.`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await savePost(slug, frontmatter, content);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const token = request.headers.get("x-admin-token");

    if (token !== process.env.ADMIN_PASSWORD) {
        console.error(`[API] Unauthorized DELETE request. Token mismatch.`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (slug) {
        await deletePost(slug);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Slug required" }, { status: 400 });
}
