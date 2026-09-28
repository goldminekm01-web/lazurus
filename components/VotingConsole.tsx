"use client";

import { useState } from "react";
import {
    Vote,
    PlusCircle,
    Edit,
    Trash2,
    Save,
    X,
    Upload,
    Users,
    BarChart3,
    RefreshCw,
    CheckCircle2,
    Clock,
} from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    active: boolean;
}

interface Candidate {
    id: string;
    name: string;
    code: string;
    categoryId: string;
    image: string;
    bio: string;
    active: boolean;
    voteCount: number;
}

interface VotePayment {
    checkoutRequestId: string;
    candidateCode: string;
    phoneNumber: string;
    amount: number;
    voteCount: number;
    status: "pending" | "completed" | "failed";
    network: "safaricom" | "airtel" | "other";
    createdAt: string;
}

interface VotingConsoleProps {
    categories: Category[];
    candidates: Candidate[];
    payments: Candidate[];
    loading: boolean;
    uploading: boolean;
    onRefresh: () => void;
    onSubmitCategory: (e: React.FormEvent) => void;
    onSubmitCandidate: (e: React.FormEvent) => void;
    onDeleteCategory: (id: string) => void;
    onDeleteCandidate: (id: string) => void;
    onEditCategory: (cat: Category) => void;
    onEditCandidate: (cand: Candidate) => void;
    onCancelEdit: () => void;
    onUploadImage: (file: File) => Promise<string>;
    categoryForm: { name: string; slug: string; description: string; color: string; active: boolean };
    setCategoryForm: (form: any) => void;
    candidateForm: { name: string; code: string; categoryId: string; image: string; bio: string; active: boolean };
    setCandidateForm: (form: any) => void;
    editingCategory: Category | null;
    editingCandidate: Candidate | null;
}

export default function VotingConsole({
    categories,
    candidates,
    payments,
    loading,
    uploading,
    onRefresh,
    onSubmitCategory,
    onSubmitCandidate,
    onDeleteCategory,
    onDeleteCandidate,
    onEditCategory,
    onEditCandidate,
    onCancelEdit,
    onUploadImage,
    categoryForm,
    setCategoryForm,
    candidateForm,
    setCandidateForm,
    editingCategory,
    editingCandidate,
}: VotingConsoleProps) {
    const [activeSubTab, setActiveSubTab] = useState("categories");
    const [imagePreview, setImagePreview] = useState("");

    type SubTab = "categories" | "candidates" | "results" | "payments";
    const [subTab, setSubTab] = useState<SubTab>("categories");

    // Helper to use useState without importing twice
    const [_, forceRender] = useState(0);

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Categories", value: categories.length, icon: Vote, color: "text-[#e8a020]" },
                    { label: "Candidates", value: candidates.length, icon: Users, color: "text-[#0066ff]" },
                    { label: "Total Votes", value: candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0), icon: BarChart3, color: "text-green-600" },
                    { label: "Completed Payments", value: payments.filter((p: any) => p.status === "completed").length, icon: CheckCircle2, color: "text-purple-600" },
                ].map(({ label, value, icon: Icon, color }) => (
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
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub-tab navigation */}
            <div className="flex border-b border-gray-200 gap-1">
                {[
                    { key: "categories", label: "🗂️ Categories" },
                    { key: "candidates", label: "👤 Candidates" },
                    { key: "results", label: "📊 Results" },
                    { key: "payments", label: "💳 Payments" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setSubTab(tab.key as SubTab)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                            subTab === tab.key
                                ? "border-[#e8a020] text-[#0a0a0a]"
                                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Control bar */}
            <div className="flex justify-end">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* ── Categories Tab ── */}
            {subTab === "categories" && (
                <div>
                    {/* Form */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                        </h3>
                        <form onSubmit={onSubmitCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm"
                                    placeholder="e.g. DJ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={categoryForm.slug}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm"
                                    placeholder="e.g. dj"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm"
                                    placeholder="What this category is about..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <input
                                    type="color"
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                    className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={categoryForm.active}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
                                        className="rounded border-gray-300 text-[#e8a020] focus:ring-[#e8a020]"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="sm:col-span-2 flex gap-2">
                                <button
                                    type="submit"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingCategory ? "Update" : "Create"}
                                </button>
                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={onCancelEdit}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-display font-semibold text-lg text-gray-900">All Categories</h3>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading categories…</div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Vote className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No categories yet. Add one above!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                                            <p className="text-xs text-gray-500">{cat.slug}</p>
                                            {cat.description && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-md">{cat.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                cat.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                            }`}>
                                                {cat.active ? "Active" : "Inactive"}
                                            </span>
                                            <button
                                                onClick={() => onEditCategory(cat)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                                aria-label="Edit category"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteCategory(cat.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                aria-label="Delete category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Candidates Tab ── */}
            {subTab === "candidates" && (
                <div>
                    {/* Form */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                        <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                            {editingCandidate ? "Edit Candidate" : "Add New Candidate"}
                        </h3>
                        <form onSubmit={onSubmitCandidate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={candidateForm.name}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm"
                                    placeholder="e.g. DJ Fresh Beats"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    required
                                    value={candidateForm.categoryId}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, categoryId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vote Code</label>
                                <input
                                    type="text"
                                    value={candidateForm.code}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm font-mono"
                                    placeholder="Auto-generated if left empty"
                                    maxLength={6}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">6 uppercase alphanumeric characters (auto-generated from name)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const url = await onUploadImage(file);
                                                setCandidateForm({ ...candidateForm, image: url });
                                                setImagePreview(url);
                                            }
                                        }}
                                        className="flex-1 text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                        disabled={uploading}
                                    />
                                    {uploading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                                </div>
                                {(candidateForm.image || imagePreview) && (
                                    <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={candidateForm.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={candidateForm.bio}
                                    onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] text-sm resize-y"
                                    placeholder="A short bio or description..."
                                    rows={3}
                                />
                            </div>
                            <div className="sm:col-span-2 flex items-center justify-between">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={candidateForm.active}
                                        onChange={(e) => setCandidateForm({ ...candidateForm, active: e.target.checked })}
                                        className="rounded border-gray-300 text-[#e8a020] focus:ring-[#e8a020]"
                                    />
                                    <span className="text-sm text-gray-700">Active (visible on voting page)</span>
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        {editingCandidate ? "Update" : "Create"}
                                    </button>
                                    {editingCandidate && (
                                        <button
                                            type="button"
                                            onClick={onCancelEdit}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-display font-semibold text-lg text-gray-900">All Candidates</h3>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">Loading candidates…</div>
                        ) : candidates.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>No candidates yet. Add one above!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {candidates.map((cand) => {
                                    const cat = categories.find((c) => c.id === cand.categoryId);
                                    return (
                                        <div key={cand.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {cand.image ? (
                                                    <img src={cand.image} alt={cand.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-6 h-6 text-gray-400 mx-auto mt-3" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm text-gray-900">{cand.name}</p>
                                                    <span className="text-xs font-mono bg-[#e8a020]/10 text-[#e8a020] px-1.5 py-0.25 rounded">
                                                        {cand.code}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {cat?.name || "Unknown category"} • {cand.voteCount || 0} votes
                                                    {cand.bio && (
                                                        <span className="mx-1">•</span>
                                                    )}
                                                    {cand.bio && <span className="truncate max-w-xs inline-block">{cand.bio}</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                    cand.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {cand.active ? "Active" : "Inactive"}
                                                </span>
                                                <button
                                                    onClick={() => onEditCandidate(cand)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                                    aria-label="Edit candidate"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteCandidate(cand.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                    aria-label="Delete candidate"
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

            {/* ── Results Tab ── */}
            {subTab === "results" && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">Vote Results</h3>
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading results…</div>
                    ) : (
                        <div className="space-y-2">
                            {[...candidates]
                                .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                                .map((cand, index) => {
                                    const cat = categories.find((c) => c.id === cand.categoryId);
                                    const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
                                    const percentage = totalVotes > 0 ? ((cand.voteCount || 0) / totalVotes) * 100 : 0;
                                    return (
                                        <div key={cand.id} className="flex items-center gap-4 py-2">
                                            <div className="w-6 text-center font-bold text-gray-400">#{index + 1}</div>
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                                {cand.image ? (
                                                    <img src={cand.image} alt={cand.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-6 h-6 text-gray-400 mx-auto mt-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900">{cand.name}</p>
                                                <p className="text-xs text-gray-500">{cat?.name}</p>
                                            </div>
                                            <div className="w-32 text-right">
                                                <p className="font-bold text-gray-900">{cand.voteCount || 0} votes</p>
                                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Payments Tab ── */}
            {subTab === "payments" && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-display font-semibold text-lg text-gray-900">Payment Records</h3>
                        <p className="text-xs text-gray-500 mt-1">All STK Push payment attempts</p>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading payments…</div>
                    ) : (payments as any[]).length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No payment records yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Candidate</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Amount</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(payments as any[]).map((p: any) => (
                                        <tr key={p.checkoutRequestId || p.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-semibold text-[#e8a020]">{p.candidateCode}</span>
                                                    <span className="text-xs text-gray-400">({p.candidateId?.slice(0, 6)}...)</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">{p.phoneNumber}</td>
                                            <td className="px-4 py-3 font-semibold">{p.amount} KSH</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                    p.status === "completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : p.status === "failed"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                                {new Date(p.createdAt).toLocaleTimeString()}
                                                <br />
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
