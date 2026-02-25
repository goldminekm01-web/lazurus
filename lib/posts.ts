import { db } from "./firebase-admin";
import matter from "gray-matter";
import type { Post } from "./types";

function calcReadTime(text: string): number {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
}

export async function getAllPosts(): Promise<Post[]> {
    try {
        const snapshot = await db.collection("posts")
            .where("publishAt", "<=", new Date().toISOString())
            .orderBy("publishAt", "desc")
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                readTime: calcReadTime(data.content || ""),
            } as Post;
        });
    } catch (error) {
        console.error("Error fetching posts from Firestore:", error);
        return [];
    }
}

export async function getAllPostsIncludingDrafts(): Promise<Post[]> {
    try {
        const snapshot = await db.collection("posts")
            .orderBy("publishAt", "desc")
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                readTime: calcReadTime(data.content || ""),
            } as Post;
        });
    } catch (error) {
        console.error("Error fetching all posts from Firestore:", error);
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const doc = await db.collection("posts").doc(slug).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
            ...data,
            readTime: calcReadTime(data?.content || ""),
        } as Post;
    } catch (error) {
        console.error(`Error fetching post by slug ${slug}:`, error);
        return null;
    }
}

export async function getFeaturedPosts(count = 3): Promise<Post[]> {
    try {
        const snapshot = await db.collection("posts")
            .where("featured", "==", true)
            .where("publishAt", "<=", new Date().toISOString())
            .orderBy("publishAt", "desc")
            .limit(count)
            .get();

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            readTime: calcReadTime(doc.data().content || ""),
        } as Post));
    } catch (error) {
        console.error("Error fetching featured posts:", error);
        return [];
    }
}

export async function getLatestPosts(count = 12): Promise<Post[]> {
    const posts = await getAllPosts();
    return posts.slice(0, count);
}

export async function getPostsByCategory(categorySlug: string, count?: number): Promise<Post[]> {
    try {
        let query = db.collection("posts")
            .where("categories", "array-contains", categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)) // Simple capitalization
            .where("publishAt", "<=", new Date().toISOString())
            .orderBy("publishAt", "desc");

        if (count) query = query.limit(count);

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            readTime: calcReadTime(doc.data().content || ""),
        } as Post));
    } catch (error) {
        console.error(`Error fetching posts for category ${categorySlug}:`, error);
        return [];
    }
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
    try {
        const snapshot = await db.collection("posts")
            .where("tags", "array-contains", tag)
            .where("publishAt", "<=", new Date().toISOString())
            .orderBy("publishAt", "desc")
            .get();

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            readTime: calcReadTime(doc.data().content || ""),
        } as Post));
    } catch (error) {
        console.error(`Error fetching posts for tag ${tag}:`, error);
        return [];
    }
}

export async function getPostsByAuthor(authorSlug: string): Promise<Post[]> {
    try {
        const snapshot = await db.collection("posts")
            .where("author", "==", authorSlug)
            .where("publishAt", "<=", new Date().toISOString())
            .orderBy("publishAt", "desc")
            .get();

        return snapshot.docs.map(doc => ({
            ...doc.data(),
            readTime: calcReadTime(doc.data().content || ""),
        } as Post));
    } catch (error) {
        console.error(`Error fetching posts for author ${authorSlug}:`, error);
        return [];
    }
}

export async function getRelatedPosts(post: Post, count = 4): Promise<Post[]> {
    const posts = await getAllPosts();
    return posts
        .filter(
            (p) =>
                p.slug !== post.slug &&
                p.categories.some((c) => post.categories.includes(c))
        )
        .slice(0, count);
}

export async function savePost(slug: string, frontmatter: Record<string, unknown>, content: string): Promise<void> {
    const postData = {
        ...frontmatter,
        slug,
        content,
        updatedAt: new Date().toISOString(),
    };
    await db.collection("posts").doc(slug).set(postData, { merge: true });
}

export async function deletePost(slug: string): Promise<void> {
    await db.collection("posts").doc(slug).delete();
}

export async function getAllSlugs(): Promise<string[]> {
    const posts = await getAllPostsIncludingDrafts();
    return posts.map((p) => p.slug);
}
