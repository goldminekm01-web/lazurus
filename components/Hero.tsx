import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { timeAgo, getCategoryColor } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface HeroProps {
    leadPost: Post;
    secondaryPosts: Post[];
}

export default function Hero({ leadPost, secondaryPosts }: HeroProps) {
    const catColor = leadPost.categories[0]
        ? getCategoryColor(leadPost.categories[0])
        : "#e8a020";

    return (
        <section className="w-full" aria-label="Featured stories">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-px bg-gray-200">
                {/* Lead Story */}
                <div className="lg:col-span-2 bg-white">
                    <Link href={`/post/${leadPost.slug}`} className="group block relative">
                        <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[520px] overflow-hidden bg-gray-900">
                            <Image
                                src={leadPost.coverImage}
                                alt={leadPost.coverImageAlt || leadPost.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 1024px) 100vw, 66vw"
                            />
                            <div className="hero-gradient absolute inset-0" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                {leadPost.categories[0] && (
                                    <span
                                        className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-white mb-3"
                                        style={{ backgroundColor: catColor }}
                                    >
                                        {leadPost.categories[0]}
                                    </span>
                                )}
                                <h1 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 group-hover:text-gray-200 transition-colors">
                                    {leadPost.title}
                                </h1>
                                {leadPost.deck && (
                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2 hidden sm:block">
                                        {leadPost.deck}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 text-gray-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" aria-hidden />
                                    <span>{timeAgo(leadPost.publishAt)}</span>
                                    {leadPost.readTime && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span>{leadPost.readTime} min read</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Secondary Stack */}
                <div className="bg-white flex flex-col">
                    {secondaryPosts.slice(0, 3).map((post, i) => {
                        const color = post.categories[0]
                            ? getCategoryColor(post.categories[0])
                            : "#6b7280";
                        return (
                            <Link
                                key={post.slug}
                                href={`/post/${post.slug}`}
                                className={`group flex gap-4 p-5 hover:bg-gray-50 transition-colors flex-1 ${i < 2 ? "border-b border-gray-200" : ""
                                    }`}
                            >
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                    {post.categories[0] && (
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-wider"
                                            style={{ color }}
                                        >
                                            {post.categories[0]}
                                        </span>
                                    )}
                                    <h2 className="font-display font-semibold text-sm sm:text-base leading-snug text-gray-900 group-hover:text-[#0066ff] transition-colors line-clamp-3">
                                        {post.title}
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-auto">
                                        {timeAgo(post.publishAt)}
                                    </p>
                                </div>
                                <div className="relative shrink-0 w-20 h-16 rounded-md overflow-hidden bg-gray-100">
                                    <Image
                                        src={post.coverImage}
                                        alt={post.coverImageAlt || post.title}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </div>
                            </Link>
                        );
                    })}

                    {/* View All */}
                    <Link
                        href="/category/markets"
                        className="flex items-center justify-center gap-1.5 p-4 border-t border-gray-200 text-xs font-semibold text-[#0066ff] hover:bg-blue-50 transition-colors"
                    >
                        View all stories
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                </div>
            </div>
        </section>
    );
}
