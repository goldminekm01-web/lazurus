"use client";

import { BarChart3, Trophy, Users, RefreshCw, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Candidate {
    id: string;
    name: string;
    code: string;
    image: string;
    bio: string;
    voteCount: number;
    category: string;
}

export default function VoteResultsPage() {
    const [results, setResults] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchResults = async () => {
        try {
            const res = await fetch("/api/vote/public?type=results");
            const data = await res.json();
            setResults(data.results || []);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to load results:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchResults();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchResults, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchResults();
    };

    const maxVotes = results.length > 0 ? Math.max(...results.map((r) => r.voteCount), 1) : 1;

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            {/* Header */}
            <div className="bg-[#0a0a0a] text-white px-4 py-6">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-[#e8a020]" />
                    <h1 className="font-display font-bold text-2xl">
                        Laza<span className="text-[#e8a020]">Votes</span> Results
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Hero */}
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
                        Live Voting Results
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Real-time results for all categories. Vote at{" "}
                        <Link href="/vote" className="text-[#0066ff] hover:underline font-semibold">
                            /vote
                        </Link>
                    </p>
                    {lastUpdated && (
                        <p className="text-xs text-gray-500 mt-2">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* Refresh button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        {refreshing ? "Refreshing…" : "Refresh Now"}
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-[#e8a020] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading results…</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
                        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">No votes yet</h3>
                        <p className="text-sm">Be the first to vote! Head to the voting page.</p>
                        <Link
                            href="/vote"
                            className="mt-4 inline-flex items-center gap-1 text-[#0066ff] hover:underline text-sm font-semibold"
                        >
                            Go to voting page <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {results.map((candidate, index) => (
                            <ResultRow
                                key={candidate.id}
                                candidate={candidate}
                                rank={index + 1}
                                maxVotes={maxVotes}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ResultRow({
    candidate,
    rank,
    maxVotes,
}: {
    candidate: Candidate;
    rank: number;
    maxVotes: number;
}) {
    const percentage = maxVotes > 0 ? (candidate.voteCount / maxVotes) * 100 : 0;

    const rankColors = [
        "bg-[#e8a020] text-[#0a0a0a]", // gold
        "bg-gray-300 text-gray-700",   // silver
        "bg-amber-700 text-white",    // bronze
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center gap-4">
                {/* Rank badge */}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        rankColors[rank - 1] || "bg-gray-100 text-gray-600"
                    }`}
                >
                    {rank <= 3 ? <Trophy className="w-5 h-5" /> : rank}
                </div>

                {/* Candidate image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {candidate.image ? (
                        <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Users className="w-8 h-8 text-gray-400 mx-auto mt-4" />
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {candidate.code}
                        </span>
                    </div>
                    {candidate.bio && (
                        <p className="text-sm text-gray-500 line-clamp-1 mb-1">{candidate.bio}</p>
                    )}
                    <p className="text-xs text-gray-400">{candidate.category}</p>
                </div>

                {/* Vote bar */}
                <div className="w-32 flex-shrink-0">
                    <p className="text-right font-bold text-lg text-gray-900 mb-1">
                        {candidate.voteCount}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-full bg-[#e8a020] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
