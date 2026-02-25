import { NextResponse } from "next/server";
import { getAllPostsIncludingDrafts, getPostBySlug, savePost, deletePost } from "@/lib/posts";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
        const post = await getPostBySlug(slug);
        return NextResponse.json({ post });
    }

    const posts = await getAllPostsIncludingDrafts();
    return NextResponse.json({ posts });
}

export async function POST(request: Request) {
    const { slug, frontmatter, content, password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await savePost(slug, frontmatter, content);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const password = request.headers.get("x-admin-password");

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (slug) {
        await deletePost(slug);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Slug required" }, { status: 400 });
}
