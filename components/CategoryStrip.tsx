import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ArticleCard from "./ArticleCard";
import type { Post } from "@/lib/types";
import type { Category } from "@/lib/types";

interface CategoryStripProps {
    category: Category;
    posts: Post[];
}

export default function CategoryStrip({ category, posts }: CategoryStripProps) {
    if (!posts.length) return null;

    return (
        <section aria-label={`${category.name} articles`} className="py-8">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-1 h-6 rounded-full"
                        style={{ backgroundColor: category.accent || "#e8a020" }}
                        aria-hidden
                    />
                    <h2
                        className="font-display font-bold text-xl text-gray-900"
                    >
                        {category.name}
                    </h2>
                    {category.description && (
                        <span className="hidden sm:inline text-sm text-gray-400">
                            — {category.description}
                        </span>
                    )}
                </div>
                <Link
                    href={`/category/${category.slug}`}
                    className="flex items-center gap-1 text-sm font-semibold text-[#0066ff] hover:text-blue-800 transition-colors"
                >
                    See all
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
            </div>

            {/* Scrollable card row */}
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
                {posts.map((post) => (
                    <div
                        key={post.slug}
                        className="shrink-0 w-64 sm:w-72 snap-start"
                    >
                        <ArticleCard post={post} size="sm" />
                    </div>
                ))}
                {/* View all card */}
                <div className="shrink-0 w-48 snap-start">
                    <Link
                        href={`/category/${category.slug}`}
                        className="flex flex-col items-center justify-center h-full min-h-[220px] rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors gap-2"
                    >
                        <ArrowRight className="w-5 h-5" aria-hidden />
                        <span className="text-xs font-semibold text-center px-4">
                            All {category.name} articles
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
