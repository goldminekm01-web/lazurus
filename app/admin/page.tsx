"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, FileText, TrendingUp, LogOut } from "lucide-react";
import type { Post } from "@/lib/types";

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const res = await fetch("/api/posts", {
            headers: { "x-admin-token": password },
        });
        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem("admin_token", password);
            setAuthed(true);
            setPosts(data.posts);
        } else {
            setError("Incorrect password. Check your ADMIN_PASSWORD environment variable.");
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (token) {
            setLoading(true);
            fetch("/api/posts", { headers: { "x-admin-token": token } })
                .then((r) => r.json())
                .then((d) => { setPosts(d.posts || []); setAuthed(true); })
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
        const token = sessionStorage.getItem("admin_token") || "";
        await fetch(`/api/posts?slug=${slug}`, {
            method: "DELETE",
            headers: { "x-admin-token": token },
        });
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
    };

    const handleLogout = () => {
        sessionStorage.removeItem("admin_token");
        setAuthed(false);
        setPassword("");
        setPosts([]);
    };

    if (!authed) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-[#0a0a0a] rounded-md flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#e8a020]" />
                        </div>
                        <span className="font-display font-bold text-lg">Lazarus CMS</span>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter ADMIN_PASSWORD"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0a0a0a] text-sm"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit"
                            className="py-2.5 bg-[#0a0a0a] text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Sign In
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 text-center mt-4">
                        Default: <code className="bg-gray-100 px-1 rounded">antigravity2024</code>
                    </p>
                </div>
            </div>
        );
    }

    const published = posts.filter((p) => new Date(p.publishAt) <= new Date());
    const drafts = posts.filter((p) => new Date(p.publishAt) > new Date());

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            {/* Admin Header */}
            <div className="bg-[#0a0a0a] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#e8a020]" />
                    <span className="font-display font-bold">Lazarus CMS</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                    >
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total Posts", value: posts.length, icon: FileText },
                        { label: "Published", value: published.length, icon: Eye },
                        { label: "Scheduled", value: drafts.length, icon: TrendingUp },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                            <Icon className="w-5 h-5 text-[#e8a020]" />
                            <div>
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className="font-display font-bold text-xl">{value}</p>
                            </div>
                        </div>
                    ))}
                    <Link
                        href="/admin/posts/new"
                        className="bg-[#e8a020] rounded-xl p-4 flex items-center gap-3 hover:bg-[#d4911c] transition-colors"
                    >
                        <PlusCircle className="w-5 h-5 text-[#0a0a0a]" />
                        <span className="font-semibold text-[#0a0a0a] text-sm">New Post</span>
                    </Link>
                </div>

                {/* Posts Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-display font-semibold text-lg">All Posts</h2>
                        <Link
                            href="/admin/posts/new"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" /> New Post
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading posts…</div>
                    ) : posts.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="mb-2">No posts yet</p>
                            <Link href="/admin/posts/new" className="text-blue-600 text-sm hover:underline">
                                Create your first post →
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {posts.map((post) => {
                                const isPublished = new Date(post.publishAt) <= new Date();
                                return (
                                    <div
                                        key={post.slug}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">{post.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPublished
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {isPublished ? "Published" : "Scheduled"}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(post.publishAt).toLocaleDateString()}
                                                </span>
                                                {post.categories[0] && (
                                                    <span className="text-xs text-gray-400">{post.categories[0]}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={`/post/${post.slug}`}
                                                target="_blank"
                                                aria-label="Preview post"
                                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/posts/${post.slug}/edit`}
                                                aria-label="Edit post"
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.slug)}
                                                aria-label="Delete post"
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
