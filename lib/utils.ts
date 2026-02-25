import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(dateStr: string): string {
    try {
        return format(parseISO(dateStr), "MMMM d, yyyy");
    } catch {
        return dateStr;
    }
}

export function formatDateShort(dateStr: string): string {
    try {
        return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
        return dateStr;
    }
}

export function timeAgo(dateStr: string): string {
    try {
        return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
        return dateStr;
    }
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + "…";
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

export function formatChangePercent(pct: number): string {
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
}

export function getCategoryColor(slug: string): string {
    const map: Record<string, string> = {
        markets: "#0066ff",
        economy: "#8b5cf6",
        analysis: "#e8a020",
        opinion: "#ec4899",
        trading: "#00c47a",
        crypto: "#f97316",
    };
    return map[slug.toLowerCase()] || "#6b7280";
}

export function getCategoryClass(slug: string): string {
    const map: Record<string, string> = {
        markets: "cat-markets",
        economy: "cat-economy",
        analysis: "cat-analysis",
        opinion: "cat-opinion",
        trading: "cat-trading",
        crypto: "cat-crypto",
    };
    return map[slug.toLowerCase()] || "";
}
