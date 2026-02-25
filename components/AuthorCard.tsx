import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";
import type { Author } from "@/lib/types";

interface AuthorCardProps {
    author: Author;
    compact?: boolean;
}

export default function AuthorCard({ author, compact = false }: AuthorCardProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                    />
                </div>
                <div>
                    <Link
                        href={`/author/${author.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-[#0066ff] transition-colors"
                    >
                        {author.name}
                    </Link>
                    {author.role && (
                        <p className="text-xs text-gray-400">{author.role}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-5 p-5 sm:p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
                <div>
                    <Link
                        href={`/author/${author.slug}`}
                        className="font-display font-bold text-base text-gray-900 hover:text-[#0066ff] transition-colors"
                    >
                        {author.name}
                    </Link>
                    {author.role && (
                        <p className="text-xs text-gray-500 mt-0.5">{author.role}</p>
                    )}
                </div>
                {author.bio && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {author.bio}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                    {author.twitter && (
                        <a
                            href={`https://twitter.com/${author.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${author.name} on Twitter`}
                            className="text-gray-400 hover:text-[#1da1f2] transition-colors"
                        >
                            <Twitter className="w-4 h-4" />
                        </a>
                    )}
                    {author.linkedin && (
                        <a
                            href={author.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${author.name} on LinkedIn`}
                            className="text-gray-400 hover:text-[#0077b5] transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                    )}
                    <Link
                        href={`/author/${author.slug}`}
                        className="text-xs text-[#0066ff] hover:underline ml-auto"
                    >
                        More by {author.name} →
                    </Link>
                </div>
            </div>
        </div>
    );
}
