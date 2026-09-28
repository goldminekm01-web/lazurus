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
    authorName?: string;
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

// ─── Voting System Types ───────────────────────────────────────────

export interface VoteCategory {
    id?: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    active: boolean;
    createdAt: string;
}

export interface Candidate {
    id?: string;
    name: string;
    slug: string;
    code: string; // unique 6-char vote code (indexed in Firestore)
    categoryId: string;
    image: string; // data URI from /api/upload-image
    bio: string;
    active: boolean;
    voteCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Vote {
    id?: string;
    candidateId: string;
    candidateCode: string;
    phoneNumber: string; // normalized: 2547XXXXXXXX
    amount: number; // KSH
    voteCount: number; // how many votes purchased
    mpesaReceipt: string;
    checkoutRequestId: string;
    paymentStatus: "pending" | "completed" | "failed";
    network: "safaricom" | "airtel" | "other";
    createdAt: string;
}

export interface VotePayment {
    id?: string; // CheckoutRequestID as doc ID for idempotency
    checkoutRequestId: string;
    candidateCode: string;
    candidateId?: string;
    phoneNumber: string;
    amount: number;
    voteCount: number;
    status: "pending" | "completed" | "failed";
    mpesaReceipt?: string;
    network?: "safaricom" | "airtel" | "other";
    createdAt: string;
    updatedAt: string;
}

export type PaymentStatus = "pending" | "completed" | "failed";
export type NetworkType = "safaricom" | "airtel" | "other";
