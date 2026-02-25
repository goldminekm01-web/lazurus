import type { Metadata } from "next";
import { getPostsByTag, getAllPosts } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const tag = slug.replace(/-/g, " ");
    return { title: `#${tag} — Lazarus` };
}

export async function generateStaticParams() {
    const all = getAllPosts();
    const tags = new Set<string>();
    all.forEach((p) => p.tags.forEach((t) => tags.add(t.toLowerCase().replace(/\s+/g, "-"))));
    return Array.from(tags).map((slug) => ({ slug }));
}

export default async function TagPage({ params }: Props) {
    const { slug } = await params;
    const tag = slug.replace(/-/g, " ");
    const posts = getPostsByTag(tag);

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
            <Link
                href="/"
                className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-gray-700 mb-4 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <div className="flex items-center gap-2 mb-6">
                <Tag className="w-5 h-5 text-[#e8a020]" aria-hidden />
                <h1 className="font-display font-bold text-2xl text-gray-900 capitalize">#{tag}</h1>
                <span className="text-sm text-gray-400 ml-2">{posts.length} articles</span>
            </div>

            {posts.length === 0 ? (
                <p className="text-gray-400 py-16 text-center">No articles tagged &quot;{tag}&quot; yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {posts.map((post) => (
                        <ArticleCard key={post.slug} post={post} showExcerpt showAuthor />
                    ))}
                </div>
            )}
        </div>
    );
}
