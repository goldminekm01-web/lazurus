import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/firebase-admin";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
        const results = [];

        for (const file of files) {
            const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
            const { data, content } = matter(raw);
            const slug = data.slug || file.replace(/\.(mdx|md)$/, "");

            const postData = {
                ...data,
                slug,
                content,
                categories: data.categories || [],
                tags: data.tags || [],
                coverImage: data.coverImage || "/images/placeholder.jpg",
                coverImageAlt: data.coverImageAlt || data.title || "",
                publishAt: data.publishAt ? new Date(data.publishAt).toISOString() : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection("posts").doc(slug).set(postData);
            results.push(slug);
        }

        return NextResponse.json({ success: true, migrated: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
