import { NextResponse } from "next/server";
import { getAllPostsIncludingDrafts, getPostBySlug, savePost, deletePost } from "@/lib/posts";
import { revalidatePath } from "next/cache";

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
    try {
        const body = await request.json();
        const token = request.headers.get("x-admin-token");

        if (token !== process.env.ADMIN_PASSWORD) {
            console.error(`[API] Unauthorized POST request. Token mismatch.`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const slug = body.slug;
        const content = body.content;
        
        // Extract frontmatter: either from the 'frontmatter' key, or from the root of the body
        const frontmatter = body.frontmatter || { ...body };
        if (frontmatter.content) delete (frontmatter as any).content;
        if (frontmatter.slug) delete (frontmatter as any).slug;

        await savePost(slug, frontmatter, content);

        // Instant revalidation for the homepage and the dynamic article route
        try {
            revalidatePath("/");
            revalidatePath("/post/[slug]", "page");
            console.log(`[API] Revalidated paths for slug: ${slug}`);
        } catch (revErr) {
            console.error(`[API] Revalidation error (non-fatal):`, revErr);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`[API] POST error:`, error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
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
