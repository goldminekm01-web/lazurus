"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link2, Printer, Check } from "lucide-react";

interface ShareButtonsProps {
    title: string;
    url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const encoded = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* fail silently */
        }
    };

    const buttons = [
        {
            icon: Twitter,
            label: "Share on Twitter",
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
            color: "hover:text-[#1da1f2] hover:border-[#1da1f2]",
        },
        {
            icon: Linkedin,
            label: "Share on LinkedIn",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
            color: "hover:text-[#0077b5] hover:border-[#0077b5]",
        },
    ];

    return (
        <div className="flex items-center gap-2" role="group" aria-label="Share this article">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                Share
            </span>
            {buttons.map(({ icon: Icon, label, href, color }) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`p-2 border border-gray-200 rounded-lg text-gray-400 transition-colors ${color}`}
                >
                    <Icon className="w-4 h-4" />
                </a>
            ))}
            <button
                onClick={handleCopy}
                aria-label="Copy link"
                className={`p-2 border rounded-lg transition-colors ${copied
                        ? "border-green-500 text-green-500"
                        : "border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-400"
                    }`}
            >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </button>
            <button
                onClick={() => window.print()}
                aria-label="Print article"
                className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors print:hidden"
            >
                <Printer className="w-4 h-4" />
            </button>
        </div>
    );
}
