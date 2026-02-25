"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Eye, ArrowLeft, TrendingUp } from "lucide-react";

const CATEGORIES = ["Markets", "Economy", "Analysis", "Opinion", "Trading", "Crypto"];

export default function NewPostPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        deck: "",
        coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
        coverImageAlt: "",
        categories: [] as string[],
        tags: "",
        author: "alex-rivera",
        publishAt: new Date().toISOString().slice(0, 16),
        featured: false,
        symbol: "",
        metaTitle: "",
        metaDescription: "",
        content: `## Introduction\n\nWrite your article here using Markdown.\n\n> This is a pull quote — use it for impactful stats or quotes.\n\n## Analysis\n\nYour analysis goes here.\n\n## Conclusion\n\nSummarize your key points.\n`,
    });

    const update = (field: string, val: unknown) => {
        setForm((prev) => {
            const next = { ...prev, [field]: val };
            // Auto-generate slug from title
            if (field === "title" && !prev.slug) {
                next.slug = val
                    ? String(val).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                    : "";
            }
            return next;
        });
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
        } else {
            alert("Error saving post. Are you logged in?");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            {/* Admin bar */}
            <div className="bg-[#0a0a0a] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <TrendingUp className="w-4 h-4 text-[#e8a020]" />
                    <span className="font-display text-sm font-semibold">New Post</span>
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
                        <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save Post"}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                {/* Main Editor */}
                <div className="space-y-4">
                    {/* Title */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <input
                            type="text"
                            placeholder="Article title…"
                            value={form.title}
                            onChange={(e) => update("title", e.target.value)}
                            className="w-full font-display text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none border-none"
                            aria-label="Article title"
                        />
                        <div className="flex gap-3 mt-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => update("slug", e.target.value)}
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300 font-mono"
                                    placeholder="article-slug"
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

                    {/* Excerpt */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Excerpt
                        </label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => update("excerpt", e.target.value)}
                            rows={2}
                            className="w-full text-sm text-gray-700 outline-none resize-none placeholder-gray-300"
                            placeholder="Short summary shown in article cards (1–2 sentences)…"
                        />
                    </div>

                    {/* Body Editor */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Body (Markdown / MDX)
                        </label>
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
                                placeholder="Write your article in Markdown…"
                                spellCheck
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar Meta */}
                <div className="space-y-4">
                    {/* Publish */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Publish</h3>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Publish Date / Time</label>
                            <input
                                type="datetime-local"
                                value={form.publishAt}
                                onChange={(e) => update("publishAt", e.target.value)}
                                className="w-full text-sm px-3 py-2 border border-gray-100 rounded-lg outline-none focus:border-gray-300 bg-gray-50"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => update("featured", e.target.checked)}
                                className="w-4 h-4 rounded accent-[#e8a020]"
                            />
                            Featured (show in hero)
                        </label>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2 bg-[#0a0a0a] text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save Post"}
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => toggleCat(cat)}
                                    className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${form.categories.includes(cat)
                                            ? "bg-[#0a0a0a] border-[#0a0a0a] text-white"
                                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            value={form.tags}
                            onChange={(e) => update("tags", e.target.value)}
                            placeholder="bitcoin, trading, macro"
                            className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300"
                        />
                    </div>

                    {/* Cover image */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Cover Image URL
                        </label>
                        <input
                            type="url"
                            value={form.coverImage}
                            onChange={(e) => update("coverImage", e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300 font-mono"
                        />
                        {form.coverImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={form.coverImage}
                                alt="Cover preview"
                                className="mt-2 rounded-lg w-full aspect-[16/9] object-cover bg-gray-100"
                            />
                        )}
                    </div>

                    {/* TradingView Symbol */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Market Symbol (optional)
                        </label>
                        <input
                            type="text"
                            value={form.symbol}
                            onChange={(e) => update("symbol", e.target.value)}
                            placeholder="NASDAQ:AAPL"
                            className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300 font-mono"
                        />
                        <p className="text-xs text-gray-400 mt-1">Shows a TradingView chart in the sidebar</p>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO</h3>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Meta Title</label>
                            <input
                                type="text"
                                value={form.metaTitle}
                                onChange={(e) => update("metaTitle", e.target.value)}
                                placeholder={form.title || "SEO title…"}
                                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Meta Description</label>
                            <textarea
                                value={form.metaDescription}
                                onChange={(e) => update("metaDescription", e.target.value)}
                                rows={2}
                                placeholder={form.excerpt || "SEO description…"}
                                className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-gray-300 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
