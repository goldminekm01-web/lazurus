import type { Metadata } from "next";
import { getPostsByAuthor, getAllPosts } from "@/lib/posts";
import { getAuthorBySlug, getAllAuthors } from "@/lib/authors";
import { notFound } from "next/navigation";
import Image from "next/image";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import { Twitter, Linkedin, ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const author = getAuthorBySlug(slug);
    if (!author) return { title: "Author Not Found" };
    return { title: `${author.name} — Lazarus`, description: author.bio };
}

export async function generateStaticParams() {
    return getAllAuthors().map((a) => ({ slug: a.slug }));
}

export default async function AuthorPage({ params }: Props) {
    const { slug } = await params;
    const author = getAuthorBySlug(slug);
    if (!author) notFound();

    const posts = getPostsByAuthor(slug);

    return (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
            <Link
                href="/"
                className="inline-flex items-center gap-1 text-gray-400 text-sm hover:text-gray-700 mb-6 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>

            {/* Author header */}
            <div className="flex flex-col sm:flex-row gap-6 mb-10 p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                </div>
                <div>
                    <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">{author.name}</h1>
                    {author.role && <p className="text-sm text-gray-500 mb-2">{author.role}</p>}
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xl mb-3">{author.bio}</p>
                    <div className="flex gap-3">
                        {author.twitter && (
                            <a
                                href={`https://twitter.com/${author.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:text-[#1da1f2] hover:border-blue-200 transition-colors"
                            >
                                <Twitter className="w-3.5 h-3.5" /> @{author.twitter}
                            </a>
                        )}
                        {author.linkedin && (
                            <a
                                href={author.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:text-[#0077b5] hover:border-blue-200 transition-colors"
                            >
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="font-display font-semibold text-lg text-gray-700 mb-5">
                {posts.length} {posts.length === 1 ? "Article" : "Articles"} by {author.name}
            </h2>

            {posts.length === 0 ? (
                <p className="text-gray-400 py-12 text-center">No articles yet from this author.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post) => (
                        <ArticleCard key={post.slug} post={post} showExcerpt />
                    ))}
                </div>
            )}
        </div>
    );
}
