"use client";

import {
    Vote,
    Users,
    Phone,
    Send,
    Loader2,
    CheckCircle2,
    X,
    RefreshCw,
    BarChart3,
    ExternalLink,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
    normalizePhone,
    detectNetwork,
    formatPhoneForDisplay,
    isValidKenyanPhone,
} from "@/lib/phone-utils";

const VOTE_COST_KSH = 10;

interface Candidate {
    id: string;
    name: string;
    code: string;
    image: string;
    bio: string;
    voteCount: number;
    category: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    color: string;
    active: boolean;
}

type VotingData = {
    category: Category;
    candidates: Candidate[];
}[];

type Step = "selecting" | "payment" | "confirming" | "success" | "error";

export default function VotePage() {
    const [data, setData] = useState<VotingData>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [phone, setPhone] = useState("");
    const [voteCount, setVoteCount] = useState(1);
    const [step, setStep] = useState<Step>("selecting");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
    const [polling, setPolling] = useState(false);

    // ─── Fetch voting data on mount ───────────────────────────────────
    useEffect(() => {
        fetch("/api/vote/public")
            .then((r) => r.json())
            .then((d) => {
                setData(d.data || []);
                if (d.data?.length > 0 && !activeCategory) {
                    setActiveCategory(d.data[0].category.id);
                }
            })
            .catch((err) => {
                console.error("Failed to load voting data:", err);
                setError("Failed to load voting data.");
            })
            .finally(() => setLoadingData(false));
    }, []);

    // ─── Polls STK push status after initiation ───────────────────────
    const pollSTKStatus = useCallback(async (checkoutId: string) => {
        setPolling(true);
        let attempts = 0;
        const maxAttempts = 30; // 30 × 4s = 120s max

        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/mpesa/callback?checkoutRequestId=${checkoutId}`);
                const result = await res.json();

                if (result.success) {
                    clearInterval(interval);
                    setPolling(false);
                    setStep("success");
                    // Refresh candidate data to show updated vote count
                    fetch("/api/vote/public")
                        .then((r) => r.json())
                        .then((d) => setData(d.data || []));
                } else if (result.result_code === 1032 || attempts >= maxAttempts) {
                    // Transaction cancelled or timed out
                    clearInterval(interval);
                    setPolling(false);
                    setError("Payment was not completed. Please try again.");
                    setStep("error");
                }
                // Otherwise keep polling
            } catch (err) {
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setPolling(false);
                    setError("Payment verification timed out. Check your phone or contact support.");
                    setStep("error");
                }
            }
        }, 4000);

        return () => {
            clearInterval(interval);
            setPolling(false);
        };
    }, []);

    // ─── Form submission ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) return;
        if (!phone || !isValidKenyanPhone(phone)) {
            setError("Please enter a valid Kenyan phone number.");
            return;
        }

        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone) {
            setError("Please enter a valid Kenyan phone number.");
            return;
        }

        const network = detectNetwork(normalizedPhone);

        if (network !== "safaricom") {
            // Show SMS instructions for Airtel/other
            setError(
                `STK Push is only available for Safaricom numbers. ` +
                    `For Airtel, please send an SMS with code "${selectedCandidate.code}" to 5002399. ` +
                    `Each SMS costs ${VOTE_COST_KSH} KSH.`,
            );
            return;
        }

        setLoading(true);
        setError("");
        setStep("confirming");

        try {
            const res = await fetch("/api/mpesa/stkpush", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: normalizedPhone,
                    candidateCode: selectedCandidate.code,
                    voteCount: voteCount,
                }),
            });

            const result = await res.json();

            if (result.success) {
                setCheckoutRequestId(result.checkoutRequestId);
                setStep("payment");
                // Start polling for payment confirmation
                pollSTKStatus(result.checkoutRequestId);
            } else if (result.requiresSMS) {
                setError(result.error);
                setStep("error");
            } else {
                setError(result.error || "Payment initiation failed. Please try again.");
                setStep("error");
            }
        } catch (err: any) {
            setError(err.message || "Failed to initiate payment.");
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    // ─── UI States ────────────────────────────────────────────────────

    // Loading
    if (loadingData && data.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#e8a020] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading voting page…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f8f8]">
            {/* ── Header ── */}
            <div className="bg-[#0a0a0a] text-white px-4 py-6">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <Vote className="w-6 h-6 text-[#e8a020]" />
                    <h1 className="font-display font-bold text-2xl">
                        Laza<span className="text-[#e8a020]">Votes</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* ── Hero text ── */}
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-3xl text-gray-900 mb-2">
                        Vote for Your Favorite Artist, DJ, Photographer, Producer & Dance Crew
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Each vote costs <strong>{VOTE_COST_KSH} KSH</strong>. Pay via M-Pesa STK Push
                        (Safaricom) or send an SMS with your candidate code (Airtel).
                        Your vote supports Kenya's creative community! 🎵📸🕺
                    </p>
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                        {selectedCandidate && error.includes("Airtel") && (
                            <a
                                href={`sms:5002399?&body=${selectedCandidate.code}`}
                                className="ml-auto text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
                            >
                                <Send className="w-3 h-3" /> Open SMS
                            </a>
                        )}
                    </div>
                )}

                {/* ── Payment in progress ── */}
                {step === "confirming" && loading && (
                    <div className="mb-6 p-4 bg-[#e8a020]/10 border border-[#e8a020]/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-[#e8a020] animate-spin" />
                            <p className="text-sm text-gray-800">Initiating M-Pesa STK Push… please wait.</p>
                        </div>
                    </div>
                )}

                {step === "payment" && (
                    <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Send className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">STK Push Sent</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                            Enter your M-Pesa PIN to complete payment of{" "}
                            <strong>{voteCount * VOTE_COST_KSH} KSH</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                            Checkout Request: <span className="font-mono">{checkoutRequestId}</span>
                        </p>
                        {selectedCandidate && (
                            <p className="text-xs text-gray-500 mt-1">
                                Voting for: <strong>{selectedCandidate.name}</strong> (Code: {selectedCandidate.code})
                            </p>
                        )}
                        {polling && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Waiting for payment confirmation…
                            </p>
                        )}
                    </div>
                )}

                {step === "success" && (
                    <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-bold text-lg text-green-800 mb-1">Vote Recorded! 🎉</h3>
                        <p className="text-sm text-gray-700">
                            Your payment has been confirmed and your votes for{" "}
                            <strong>{selectedCandidate?.name}</strong> have been recorded.
                        </p>
                        <button
                            onClick={() => {
                                setStep("selecting");
                                setSelectedCandidate(null);
                                setPhone("");
                                setVoteCount(1);
                                setError("");
                                setCheckoutRequestId(null);
                            }}
                            className="mt-3 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Vote for Another Candidate
                        </button>
                    </div>
                )}

                {/* ── Category Tabs ── */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {data.map((item) => (
                        <button
                            key={item.category.id}
                            onClick={() => {
                                setActiveCategory(item.category.id);
                                setStep("selecting");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeCategory === item.category.id
                                    ? "bg-[#0a0a0a] text-white shadow-md"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                        >
                            {item.category.name}
                        </button>
                    ))}
                </div>

                {/* ── Candidates Grid ── */}
                {data.map((item) => {
                    if (activeCategory && activeCategory !== item.category.id) return null;
                    return (
                        <div key={item.category.id} className="mb-8">
                            <h3 className="font-display font-semibold text-xl text-gray-900 mb-4 flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: item.category.color }}
                                    aria-hidden
                                />
                                {item.category.name}
                            </h3>

                            {item.candidates.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                                    <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                    <p>No candidates in this category yet. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {item.candidates.map((candidate) => (
                                        <CandidateCard
                                            key={candidate.id}
                                            candidate={candidate}
                                            isSelected={selectedCandidate?.id === candidate.id}
                                            onSelect={() => {
                                                setSelectedCandidate(candidate);
                                                setStep("selecting");
                                                setError("");
                                            }}
                                            color={item.category.color}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ── Vote Form (Sticky at bottom on mobile) ── */}
                {selectedCandidate && step === "selecting" && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 sm:p-6 z-20 animate-slide-up">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                        {selectedCandidate.image ? (
                                            <img
                                                src={selectedCandidate.image}
                                                alt={selectedCandidate.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Users className="w-6 h-6 text-gray-400 mx-auto mt-3" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{selectedCandidate.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Code:{" "}
                                            <span className="font-mono font-semibold text-[#e8a020]">
                                                {selectedCandidate.code}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="0712 345 678"
                                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] text-sm"
                                                required
                                            />
                                        </div>
                                        {phone && isValidKenyanPhone(phone) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatPhoneForDisplay(normalizePhone(phone) || "")} —{" "}
                                                <span
                                                    className={`font-semibold ${
                                                        detectNetwork(normalizePhone(phone) || "") === "safaricom"
                                                            ? "text-green-600"
                                                            : detectNetwork(normalizePhone(phone) || "") === "airtel"
                                                            ? "text-blue-600"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {detectNetwork(normalizePhone(phone) || "") === "safaricom"
                                                        ? "Safaricom ✓"
                                                        : detectNetwork(normalizePhone(phone) || "") === "airtel"
                                                        ? "Airtel — use SMS"
                                                        : "Unknown"}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Number of Votes
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={voteCount}
                                            onChange={(e) =>
                                                setVoteCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
                                            }
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <div className="w-full text-center p-3 bg-[#0a0a0a] rounded-lg text-white">
                                            <p className="text-xs opacity-70">Total Cost</p>
                                            <p className="font-display font-bold text-2xl">{voteCount * VOTE_COST_KSH} KSH</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !phone || !isValidKenyanPhone(phone)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    Vote with M-Pesa
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Candidate Card Component ──────────────────────────────────────
function CandidateCard({
    candidate,
    isSelected,
    onSelect,
    color,
}: {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void;
    color: string;
}) {
    return (
        <div
            className={`rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                isSelected
                    ? "border-[#e8a020] shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
            onClick={onSelect}
        >
            <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
                {candidate.image ? (
                    <img
                        src={candidate.image}
                        alt={candidate.name}
                        className="w-full h-full object-cover object-center"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Users className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 truncate">{candidate.name}</h4>
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ml-2"
                        style={{ backgroundColor: `${color}20`, color: color }}
                    >
                        {candidate.code}
                    </span>
                </div>
                {candidate.bio && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{candidate.bio}</p>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                        {candidate.voteCount} {candidate.voteCount === 1 ? "vote" : "votes"}
                    </span>
                </div>
            </div>
        </div>
    );
}
