import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostsByCategory } from "@/lib/posts";
import { getAllCategories, getCategoryBySlug } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const cat = getCategoryBySlug(slug);
    if (!cat) return { title: "Category Not Found" };
    return {
        title: `${cat.name} — Markets & Trading News`,
        description: cat.description,
    };
}

export async function generateStaticParams() {
    const cats = getAllCategories();
    return cats.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const cat = getCategoryBySlug(slug);
    if (!cat) notFound();

    const posts = await getPostsByCategory(slug);

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-gray-700 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Home
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-1.5 h-8 rounded-full"
                        style={{ backgroundColor: cat.accent || cat.color }}
                        aria-hidden
                    />
                    <h1 className="font-display font-bold text-3xl text-gray-900">{cat.name}</h1>
                </div>
                {cat.description && (
                    <p className="text-gray-500 ml-5">{cat.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-1 ml-5">
                    {posts.length} {posts.length === 1 ? "article" : "articles"}
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p>No articles in this category yet.</p>
                    <Link href="/admin" className="text-blue-600 hover:underline text-sm mt-2 block">
                        Add the first one →
                    </Link>
                </div>
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
