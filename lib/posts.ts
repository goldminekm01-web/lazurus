import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Post } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function getPostFiles(): string[] {
    if (!fs.existsSync(POSTS_DIR)) return [];
    return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
}

function calcReadTime(text: string): number {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
}

export function getAllPosts(): Post[] {
    const files = getPostFiles();
    return files
        .map((file) => {
            const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
            const { data, content } = matter(raw);
            return {
                ...data,
                slug: data.slug || file.replace(/\.(mdx|md)$/, ""),
                content,
                readTime: calcReadTime(content),
                categories: data.categories || [],
                tags: data.tags || [],
                coverImage: data.coverImage || "/images/placeholder.jpg",
                coverImageAlt: data.coverImageAlt || data.title || "",
            } as Post;
        })
        .filter((p) => {
            const publish = new Date(p.publishAt);
            return publish <= new Date();
        })
        .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
}

export function getAllPostsIncludingDrafts(): Post[] {
    const files = getPostFiles();
    return files
        .map((file) => {
            const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
            const { data, content } = matter(raw);
            return {
                ...data,
                slug: data.slug || file.replace(/\.(mdx|md)$/, ""),
                content,
                readTime: calcReadTime(content),
                categories: data.categories || [],
                tags: data.tags || [],
                coverImage: data.coverImage || "/images/placeholder.jpg",
            } as Post;
        })
        .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
}

export function getPostBySlug(slug: string): Post | null {
    const allPosts = getAllPostsIncludingDrafts();
    return allPosts.find((p) => p.slug === slug) || null;
}

export function getFeaturedPosts(count = 3): Post[] {
    return getAllPosts()
        .filter((p) => p.featured)
        .slice(0, count);
}

export function getLatestPosts(count = 12): Post[] {
    return getAllPosts().slice(0, count);
}

export function getPostsByCategory(categorySlug: string, count?: number): Post[] {
    const filtered = getAllPosts().filter((p) =>
        p.categories.map((c) => c.toLowerCase()).includes(categorySlug.toLowerCase())
    );
    return count ? filtered.slice(0, count) : filtered;
}

export function getPostsByTag(tag: string): Post[] {
    return getAllPosts().filter((p) =>
        p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    );
}

export function getPostsByAuthor(authorSlug: string): Post[] {
    return getAllPosts().filter((p) => p.author === authorSlug);
}

export function getRelatedPosts(post: Post, count = 4): Post[] {
    return getAllPosts()
        .filter(
            (p) =>
                p.slug !== post.slug &&
                p.categories.some((c) => post.categories.includes(c))
        )
        .slice(0, count);
}

export function savePost(slug: string, frontmatter: Record<string, unknown>, content: string): void {
    const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
    const fileContent = matter.stringify(content, frontmatter);
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    fs.writeFileSync(filePath, fileContent, "utf8");
}

export function deletePost(slug: string): void {
    const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
    const mdPath = path.join(POSTS_DIR, `${slug}.md`);
    if (fs.existsSync(mdxPath)) fs.unlinkSync(mdxPath);
    if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
}

export function getAllSlugs(): string[] {
    return getAllPostsIncludingDrafts().map((p) => p.slug);
}
