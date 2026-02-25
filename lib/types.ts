export interface Post {
    title: string;
    slug: string;
    excerpt: string;
    deck?: string;
    coverImage: string;
    coverImageAlt?: string;
    categories: string[];
    tags: string[];
    author: string;
    publishAt: string;
    featured?: boolean;
    symbol?: string; // e.g. "NASDAQ:AAPL" for TradingView
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    readTime?: number;
    content: string; // raw MDX/markdown
}

export interface Author {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
    twitter?: string;
    linkedin?: string;
    role?: string;
}

export interface Category {
    name: string;
    slug: string;
    description: string;
    color: string;
    accent: string;
}

export interface MarketQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    currency?: string;
}

export interface BreakingItem {
    id: string;
    text: string;
    href?: string;
    type: "breaking" | "market" | "update";
}

export type PostStatus = "draft" | "published" | "scheduled";
