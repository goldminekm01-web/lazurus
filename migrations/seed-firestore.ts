import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "../lib/firebase-admin";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

async function migrate() {
    console.log("Starting migration...");
    const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

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

        console.log(`Migrating: ${slug}`);
        await db.collection("posts").doc(slug).set(postData);
    }
    console.log("Migration complete!");
}

migrate().catch(console.error);
