import { getAllPosts, getFeaturedPosts, getLatestPosts, getPostsByCategory } from "@/lib/posts";
import { getAllCategories } from "@/lib/categories";
import Hero from "@/components/Hero";
import CategoryStrip from "@/components/CategoryStrip";
import ArticleCard from "@/components/ArticleCard";
import NewsletterCTA from "@/components/NewsletterCTA";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export default function HomePage() {
    const allPosts = getAllPosts();
    const featured = getFeaturedPosts(4);
    const latest = getLatestPosts(12);
    const categories = getAllCategories();

    const leadPost = featured[0] || allPosts[0];
    const secondaryPosts = featured.slice(1, 4);

    if (!leadPost) {
        return (
            <div className="max-w-8xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-400">No posts published yet. <Link href="/admin" className="text-blue-600 hover:underline">Add your first post →</Link></p>
            </div>
        );
    }

    return (
        <div>
            {/* Hero */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 pt-4">
                <Hero leadPost={leadPost} secondaryPosts={secondaryPosts} />
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6">
                {/* Category Strips */}
                <div className="divide-y divide-gray-100">
                    {categories.map((cat) => {
                        const posts = getPostsByCategory(cat.slug, 6);
                        if (!posts.length) return null;
                        return (
                            <CategoryStrip key={cat.slug} category={cat} posts={posts} />
                        );
                    })}
                </div>

                {/* Latest News Grid */}
                <section className="py-10" aria-label="Latest news">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 rounded-full bg-[#e8a020]" aria-hidden />
                            <h2 className="font-display font-bold text-xl text-gray-900">Latest News</h2>
                        </div>
                        <Link
                            href="/category/markets"
                            className="flex items-center gap-1 text-sm font-semibold text-[#0066ff] hover:text-blue-800 transition-colors"
                        >
                            All stories <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {latest.map((post) => (
                            <ArticleCard key={post.slug} post={post} showAuthor />
                        ))}
                    </div>
                </section>

                {/* Newsletter CTA */}
                <NewsletterCTA />
            </div>
        </div>
    );
}


