import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getAllSlugs, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { getAuthorBySlug } from "@/lib/authors";
import { formatDate, getCategoryColor } from "@/lib/utils";
import AuthorCard from "@/components/AuthorCard";
import ShareButtons from "@/components/ShareButtons";
import ArticleCard from "@/components/ArticleCard";
import TradingViewWidget from "@/components/TradingViewWidget";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Clock, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import SidebarNewsletter from "@/components/SidebarNewsletter";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Not Found" };
    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt,
            images: [post.ogImage || post.coverImage],
            type: "article",
            publishedTime: post.publishAt,
        },
    };
}

export async function generateStaticParams() {
    return (await getAllSlugs()).map((slug) => ({ slug }));
}

const MDXComponents = {
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="font-display font-bold text-2xl mt-10 mb-4 text-gray-900" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="font-display font-semibold text-xl mt-8 mb-3 text-gray-900" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
            className="pull-quote border-l-4 border-[#e8a020] pl-5 py-2 my-6 text-lg font-medium text-gray-700 bg-amber-50 rounded-r-lg"
            {...props}
        />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a className="text-[#0066ff] hover:underline" target="_blank" rel="noopener" {...props} />
    ),
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
            return (
                <code
                    className={`block bg-[#0a0a0a] text-green-400 text-sm font-mono p-4 rounded-lg overflow-x-auto my-4 ${className}`}
                    {...props}
                >
                    {children}
                </code>
            );
        }
        return (
            <code className="bg-gray-100 text-gray-800 font-mono text-sm px-1.5 py-0.5 rounded" {...props}>
                {children}
            </code>
        );
    },
};

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const author = post.author ? getAuthorBySlug(post.author) : null;
    const related = await getRelatedPosts(post, 3);
    const catColor = post.categories[0] ? getCategoryColor(post.categories[0]) : "#e8a020";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Schema.org JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImage,
        datePublished: post.publishAt,
        author: author
            ? { "@type": "Person", name: author.name }
            : { "@type": "Organization", name: "Lazarus" },
        publisher: {
            "@type": "Organization",
            name: "Lazarus",
            logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
        },
        url: `${siteUrl}/post/${post.slug}`,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-8xl mx-auto px-4 sm:px-6 py-6">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                    <Link href="/" className="hover:text-gray-600">Home</Link>
                    <span>/</span>
                    {post.categories[0] && (
                        <>
                            <Link href={`/category/${post.categories[0].toLowerCase()}`} className="hover:text-gray-600">
                                {post.categories[0]}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
                    {/* Main Content */}
                    <div>
                        {/* Meta */}
                        <header className="mb-6">
                            {post.categories[0] && (
                                <span
                                    className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-white mb-3"
                                    style={{ backgroundColor: catColor }}
                                >
                                    {post.categories[0]}
                                </span>
                            )}
                            <h1 className="font-display font-bold text-3xl sm:text-4xl leading-tight text-gray-900 mb-3">
                                {post.title}
                            </h1>
                            {post.deck && (
                                <p className="text-lg text-gray-600 leading-relaxed mb-4">{post.deck}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-100">
                                {author && <AuthorCard author={author} compact />}
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" aria-hidden />
                                        {formatDate(post.publishAt)}
                                    </span>
                                    {post.readTime && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" aria-hidden />
                                            {post.readTime} min read
                                        </span>
                                    )}
                                </div>
                                <div className="ml-auto">
                                    <ShareButtons
                                        title={post.title}
                                        url={`${siteUrl}/post/${post.slug}`}
                                    />
                                </div>
                            </div>
                        </header>

                        {/* Cover image */}
                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-gray-100">
                            <Image
                                src={post.coverImage}
                                alt={post.coverImageAlt || post.title}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 800px"
                            />
                        </div>

                        {/* Article body */}
                        <div className="prose prose-lg prose-antigravity max-w-none">
                            <MDXRemote source={post.content} components={MDXComponents} />
                        </div>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                                <Tag className="w-4 h-4 text-gray-400 mt-0.5" aria-hidden />
                                {post.tags.map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Author card */}
                        {author && (
                            <div className="mt-8">
                                <AuthorCard author={author} />
                            </div>
                        )}

                        {/* Bottom share */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">Found this useful? Share it.</p>
                            <ShareButtons title={post.title} url={`${siteUrl}/post/${post.slug}`} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* TradingView Chart */}
                        {post.symbol && (
                            <div>
                                <h3 className="font-display font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">
                                    {post.symbol} Chart
                                </h3>
                                <TradingViewWidget symbol={post.symbol} height={320} compact />
                            </div>
                        )}

                        {/* Related Articles */}
                        {related.length > 0 && (
                            <div>
                                <h3 className="font-display font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
                                    Related Articles
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {related.map((r) => (
                                        <ArticleCard key={r.slug} post={r} horizontal />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Newsletter sidebar CTA */}
                        <SidebarNewsletter />
                    </aside>
                </div>
            </article>
        </>
    );
}
