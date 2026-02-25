"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save, Eye, ArrowLeft, TrendingUp } from "lucide-react";

const CATEGORIES = ["Markets", "Economy", "Analysis", "Opinion", "Trading", "Crypto"];

export function generateStaticParams() {
    return [];
}

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        deck: "",
        coverImage: "",
        coverImageAlt: "",
        categories: [] as string[],
        tags: "",
        author: "alex-rivera",
        publishAt: "",
        featured: false,
        symbol: "",
        metaTitle: "",
        metaDescription: "",
        content: "",
    });

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
            return;
        }

        fetch(`/api/posts?slug=${slug}`, {
            headers: { "x-admin-token": token },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch post");
                return res.json();
            })
            .then((data) => {
                const post = data.post;
                setForm({
                    title: post.title || "",
                    slug: post.slug || "",
                    excerpt: post.excerpt || "",
                    deck: post.deck || "",
                    coverImage: post.coverImage || "",
                    coverImageAlt: post.coverImageAlt || "",
                    categories: post.categories || [],
                    tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
                    author: post.author || "alex-rivera",
                    publishAt: post.publishAt ? new Date(post.publishAt).toISOString().slice(0, 16) : "",
                    featured: !!post.featured,
                    symbol: post.symbol || "",
                    metaTitle: post.metaTitle || "",
                    metaDescription: post.metaDescription || "",
                    content: post.content || "",
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Error loading post.");
                router.push("/admin");
            });
    }, [slug, router]);

    const update = (field: string, val: unknown) => {
        setForm((prev) => ({ ...prev, [field]: val }));
    };

    const toggleCat = (cat: string) => {
        setForm((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((c) => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.content) {
            alert("Title, slug and content are required.");
            return;
        }
        setSaving(true);
        const token = sessionStorage.getItem("admin_token") || "";
        const payload = {
            ...form,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };
        const { content, ...frontmatter } = payload;
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-token": token },
            body: JSON.stringify({ ...frontmatter, content, slug: form.slug }),
        });
        setSaving(false);
        if (res.ok) {
            router.push("/admin");
            router.refresh();
        } else {
            alert("Error saving post.");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">Loading editor...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            <div className="bg-[#0a0a0a] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <TrendingUp className="w-4 h-4 text-[#e8a020]" />
                    <span className="font-display text-sm font-semibold">Edit "{form.title}"</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPreview(!preview)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded text-sm text-gray-300 hover:text-white"
                    >
                        <Eye className="w-3.5 h-3.5" /> {preview ? "Edit" : "Preview"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#e8a020] text-[#0a0a0a] rounded text-sm font-bold hover:bg-[#d4911c] disabled:opacity-60"
                    >
                        <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <input
                            type="text"
                            placeholder="Article title…"
                            value={form.title}
                            onChange={(e) => update("title", e.target.value)}
                            className="w-full font-display text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none border-none"
                        />
                        <div className="flex gap-3 mt-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Slug (Read-only)</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    disabled
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none font-mono opacity-60"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Deck / Subtitle</label>
                                <input
                                    type="text"
                                    value={form.deck}
                                    onChange={(e) => update("deck", e.target.value)}
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300"
                                    placeholder="One-line angle…"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => update("excerpt", e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300"
                            placeholder="Short summary…"
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Body (Markdown)</label>
                        {preview ? (
                            <div className="prose prose-sm max-w-none text-gray-700 min-h-[400px] bg-gray-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-xs">
                                {form.content}
                            </div>
                        ) : (
                            <textarea
                                value={form.content}
                                onChange={(e) => update("content", e.target.value)}
                                rows={20}
                                className="w-full font-mono text-sm text-gray-700 outline-none resize-y placeholder-gray-300 bg-gray-50 p-3 rounded-lg border border-gray-100 focus:border-gray-300"
                                placeholder="Article content…"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publish</h3>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Date / Time</label>
                            <input
                                type="datetime-local"
                                value={form.publishAt}
                                onChange={(e) => update("publishAt", e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-gray-100 rounded-lg outline-none bg-gray-50"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => update("featured", e.target.checked)}
                                className="w-4 h-4 rounded accent-[#e8a020]"
                            />
                            Featured
                        </label>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2 bg-[#0a0a0a] text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => toggleCat(cat)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.categories.includes(cat) ? "bg-[#0a0a0a] text-white" : "text-gray-600"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Cover URL</label>
                        <input
                            type="text"
                            value={form.coverImage}
                            onChange={(e) => update("coverImage", e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none font-mono"
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Market Symbol</label>
                        <input
                            type="text"
                            value={form.symbol}
                            onChange={(e) => update("symbol", e.target.value)}
                            placeholder="NASDAQ:AAPL"
                            className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none font-mono"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
