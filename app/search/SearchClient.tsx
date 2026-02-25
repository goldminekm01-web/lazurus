"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { Search } from "lucide-react";
import type { Post } from "@/lib/types";

type PostWithoutContent = Omit<Post, "content">;

interface SearchClientProps {
    posts: PostWithoutContent[];
}

function SearchResults({ posts }: SearchClientProps) {
    const params = useSearchParams();
    const q = params.get("q") || "";

    if (!q) {
        return (
            <div className="text-center py-20 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Enter a search term to find articles</p>
            </div>
        );
    }

    const lower = q.toLowerCase();
    const results = posts.filter(
        (p) =>
            p.title.toLowerCase().includes(lower) ||
            p.excerpt?.toLowerCase().includes(lower) ||
            p.tags?.some((t: string) => t.toLowerCase().includes(lower)) ||
            p.categories?.some((c: string) => c.toLowerCase().includes(lower))
    );

    return (
        <div>
            <p className="text-sm text-gray-500 mb-6">
                {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <strong>&quot;{q}&quot;</strong>
            </p>
            {results.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p>No articles found. Try a different keyword.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.map((post) => (
                        <ArticleCard key={post.slug} post={post as Post} showExcerpt showAuthor />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchClient({ posts }: SearchClientProps) {
    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-8 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" aria-hidden />
                Search Results
            </h1>
            <Suspense fallback={<div className="text-center py-20 text-gray-400">Searching…</div>}>
                <SearchResults posts={posts} />
            </Suspense>
        </div>
    );
}
