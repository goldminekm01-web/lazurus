import Link from "next/link";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import { timeAgo, getCategoryColor } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface ArticleCardProps {
    post: Post;
    size?: "sm" | "md" | "lg";
    showExcerpt?: boolean;
    showAuthor?: boolean;
    horizontal?: boolean;
}

export default function ArticleCard({
    post,
    size = "md",
    showExcerpt = false,
    showAuthor = false,
    horizontal = false,
}: ArticleCardProps) {
    const catColor = post.categories[0]
        ? getCategoryColor(post.categories[0])
        : "#6b7280";

    if (horizontal) {
        return (
            <article className="article-card flex gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                {/* Thumbnail */}
                <Link
                    href={`/post/${post.slug}`}
                    className="relative shrink-0 w-24 h-16 sm:w-32 sm:h-20 rounded-md overflow-hidden bg-gray-100"
                    tabIndex={-1}
                    aria-hidden
                >
                    <Image
                        src={post.coverImage}
                        alt={post.coverImageAlt || post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                    />
                </Link>

                {/* Text */}
                <div className="flex flex-col justify-center gap-1.5 min-w-0">
                    {post.categories[0] && (
                        <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: catColor }}
                        >
                            {post.categories[0]}
                        </span>
                    )}
                    <Link href={`/post/${post.slug}`}>
                        <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 hover:text-[#0066ff] transition-colors">
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-xs text-gray-400">
                        {timeAgo(post.publishAt)}
                    </p>
                </div>
            </article>
        );
    }

    const imageAspect =
        size === "lg" ? "aspect-[16/9]" : size === "sm" ? "aspect-[4/3]" : "aspect-[16/9]";

    return (
        <article className="article-card flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-card hover:shadow-card-hover transition-all duration-200">
            {/* Thumbnail */}
            <Link
                href={`/post/${post.slug}`}
                className={`relative block ${imageAspect} bg-gray-100 overflow-hidden`}
                tabIndex={-1}
                aria-hidden
            >
                <Image
                    src={post.coverImage}
                    alt={post.coverImageAlt || post.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Category badge overlay */}
                {post.categories[0] && (
                    <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: catColor }}
                    >
                        {post.categories[0]}
                    </span>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                <Link href={`/post/${post.slug}`}>
                    <h3
                        className={`font-display font-semibold leading-snug text-gray-900 hover:text-[#0066ff] transition-colors line-clamp-2 ${size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-base"
                            }`}
                    >
                        {post.title}
                    </h3>
                </Link>

                {showExcerpt && post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 mt-auto pt-1 text-xs text-gray-400">
                    {showAuthor && post.author && (
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" aria-hidden />
                            {post.author}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden />
                        {timeAgo(post.publishAt)}
                    </span>
                    {post.readTime && (
                        <span className="ml-auto">{post.readTime} min read</span>
                    )}
                </div>
            </div>
        </article>
    );
}
