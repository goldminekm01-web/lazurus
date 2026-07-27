"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Wallet, Copy, CheckCheck, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "select" | "connected" | "sending" | "success" | "error";
type Coin = "ETH" | "BTC";

interface WalletOption {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    detect: () => boolean;
}

// ─── Wallet Definitions ───────────────────────────────────────────────────────

const WALLETS: WalletOption[] = [
    {
        id: "metamask",
        name: "MetaMask",
        icon: "🦊",
        color: "#E2761B",
        bg: "#FFF5EC",
        detect: () =>
            typeof window !== "undefined" &&
            !!(window as any).ethereum?.isMetaMask,
    },
    {
        id: "phantom",
        name: "Phantom",
        icon: "👻",
        color: "#AB9FF2",
        bg: "#F3F0FF",
        detect: () =>
            typeof window !== "undefined" &&
            !!(window as any).phantom?.ethereum,
    },
    {
        id: "trust",
        name: "Trust Wallet",
        icon: "🛡️",
        color: "#3375BB",
        bg: "#EFF5FF",
        detect: () =>
            typeof window !== "undefined" &&
            !!(window as any).ethereum?.isTrust,
    },
    {
        id: "base",
        name: "Base Wallet",
        icon: "🔵",
        color: "#0052FF",
        bg: "#EEF3FF",
        detect: () =>
            typeof window !== "undefined" &&
            !!(window as any).ethereum?.isCoinbaseWallet,
    },
    {
        id: "browser",
        name: "Browser Wallet",
        icon: "🌐",
        color: "#666",
        bg: "#F5F5F5",
        detect: () =>
            typeof window !== "undefined" && !!(window as any).ethereum,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProvider(walletId: string): any {
    if (typeof window === "undefined") return null;
    const win = window as any;
    if (walletId === "phantom" && win.phantom?.ethereum) return win.phantom.ethereum;
    return win.ethereum ?? null;
}

function trimAddress(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function hexToEth(hex: string): string {
    const wei = parseInt(hex, 16);
    return (wei / 1e18).toFixed(5);
}

function ethToHex(eth: string): string {
    const wei = Math.floor(parseFloat(eth) * 1e18);
    return "0x" + wei.toString(16);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletModalProps {
    open: boolean;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalletModal({ open, onClose }: WalletModalProps) {
    const [step, setStep] = useState<Step>("select");
    const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
    const [address, setAddress] = useState("");
    const [ethBalance, setEthBalance] = useState("");
    const [coin, setCoin] = useState<Coin>("ETH");
    const [amount, setAmount] = useState("");
    const [txHash, setTxHash] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const ETH_ADDRESS = process.env.NEXT_PUBLIC_ETH_ADDRESS ?? "";
    const BTC_ADDRESS = process.env.NEXT_PUBLIC_BTC_ADDRESS ?? "";

    // ── Auto-connect: silently check if wallet already authorized ─────────────
    const tryAutoConnect = useCallback(async () => {
        if (typeof window === "undefined") return;
        // Find the first installed wallet
        const installed = WALLETS.find((w) => w.detect());
        if (!installed) return;
        try {
            const provider = getProvider(installed.id);
            if (!provider) return;
            // eth_accounts does NOT trigger a popup — returns [] if not yet authorized
            const accounts: string[] = await provider.request({ method: "eth_accounts" });
            if (!accounts || accounts.length === 0) return;
            const acc = accounts[0];
            const balHex: string = await provider.request({
                method: "eth_getBalance",
                params: [acc, "latest"],
            });
            setSelectedWallet(installed);
            setAddress(acc);
            setEthBalance(hexToEth(balHex));
            setStep("connected");
        } catch {
            // silently ignore — user will connect manually
        }
    }, []);

    // Run once on first mount (page load)
    useEffect(() => {
        tryAutoConnect();
    }, [tryAutoConnect]);

    // Also run when the modal opens so a returning user sees connected state immediately
    useEffect(() => {
        if (open && step === "select") {
            tryAutoConnect();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep("select");
                setSelectedWallet(null);
                setAddress("");
                setEthBalance("");
                setCoin("ETH");
                setAmount("");
                setTxHash("");
                setErrorMsg("");
                setCopied(false);
                setConnecting(false);
            }, 300);
        }
    }, [open]);

    // Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const connect = useCallback(async (wallet: WalletOption) => {
        setConnecting(true);
        setSelectedWallet(wallet);
        try {
            const provider = getProvider(wallet.id);
            if (!provider) {
                // Redirect to install page
                const urls: Record<string, string> = {
                    metamask: "https://metamask.io/download/",
                    phantom: "https://phantom.app/",
                    trust: "https://trustwallet.com/",
                    base: "https://www.coinbase.com/wallet",
                    browser: "https://metamask.io/download/",
                };
                window.open(urls[wallet.id] ?? "https://metamask.io/download/", "_blank");
                setConnecting(false);
                return;
            }
            const accounts: string[] = await provider.request({
                method: "eth_requestAccounts",
            });
            const acc = accounts[0];
            setAddress(acc);

            // Fetch balance
            const balHex: string = await provider.request({
                method: "eth_getBalance",
                params: [acc, "latest"],
            });
            setEthBalance(hexToEth(balHex));
            setStep("connected");
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Connection rejected.");
            setStep("error");
        } finally {
            setConnecting(false);
        }
    }, []);

    const sendEth = useCallback(async () => {
        if (!selectedWallet || !amount || !ETH_ADDRESS) return;
        setStep("sending");
        try {
            const provider = getProvider(selectedWallet.id);
            const txHash: string = await provider.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: address,
                        to: ETH_ADDRESS,
                        value: ethToHex(amount),
                        gas: "0x5208", // 21000
                    },
                ],
            });
            setTxHash(txHash);
            setStep("success");
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Transaction failed.");
            setStep("error");
        }
    }, [selectedWallet, amount, address, ETH_ADDRESS]);

    const sendBtc = useCallback(() => {
        if (!BTC_ADDRESS || !amount) return;
        const uri = `bitcoin:${BTC_ADDRESS}?amount=${amount}`;
        window.open(uri, "_blank");
        setStep("success");
    }, [BTC_ADDRESS, amount]);

    const copyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
                    animation: "walletSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" style={{ color: "#e8a020" }} />
                        <span className="font-bold text-white text-lg">Connect Wallet</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        aria-label="Close wallet modal"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* ── STEP: SELECT ───────────────────────────────── */}
                    {step === "select" && (
                        <div>
                            <p className="text-sm text-gray-400 mb-5">
                                Choose a wallet to connect. Funds will be transferred securely on-chain.
                            </p>
                            <div className="flex flex-col gap-3">
                                {WALLETS.map((w) => {
                                    const installed = w.detect();
                                    return (
                                        <button
                                            key={w.id}
                                            onClick={() => connect(w)}
                                            disabled={connecting}
                                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                borderColor: "rgba(255,255,255,0.08)",
                                            }}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = w.color + "66";
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                                            }}
                                        >
                                            <span className="text-2xl">{w.icon}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-white">{w.name}</p>
                                                <p className="text-xs mt-0.5" style={{ color: installed ? "#4ade80" : "#9ca3af" }}>
                                                    {installed ? "Detected" : "Not installed · click to install"}
                                                </p>
                                            </div>
                                            {connecting && selectedWallet?.id === w.id ? (
                                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                            ) : (
                                                <ArrowRight className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-center text-gray-600 mt-5">
                                By connecting you agree to our{" "}
                                <a href="/privacy" className="underline hover:text-gray-400">Privacy Policy</a>
                            </p>
                        </div>
                    )}

                    {/* ── STEP: CONNECTED ────────────────────────────── */}
                    {step === "connected" && selectedWallet && (
                        <div>
                            {/* Wallet info */}
                            <div className="rounded-xl p-4 mb-5 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{selectedWallet.icon}</span>
                                    <div>
                                        <p className="text-xs text-gray-400">{selectedWallet.name}</p>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-mono text-white">{trimAddress(address)}</p>
                                            <button onClick={() => copyAddress(address)} className="text-gray-500 hover:text-gray-300 transition-colors">
                                                {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs text-gray-400">Balance</p>
                                        <p className="text-sm font-semibold text-white">{ethBalance} ETH</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #4ade80" }} />
                                    <span className="text-xs text-green-400">Connected</span>
                                </div>
                            </div>

                            {/* Coin tabs */}
                            <div className="flex rounded-lg overflow-hidden border mb-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                {(["ETH", "BTC"] as Coin[]).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCoin(c)}
                                        className="flex-1 py-2 text-sm font-semibold transition-colors"
                                        style={{
                                            background: coin === c ? "#e8a020" : "rgba(255,255,255,0.04)",
                                            color: coin === c ? "#000" : "#9ca3af",
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {/* Recipient address */}
                            <div className="mb-3">
                                <label className="text-xs text-gray-400 mb-1 block">Recipient</label>
                                <div
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border font-mono text-xs text-gray-300 overflow-hidden"
                                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                                >
                                    <span className="truncate">{coin === "ETH" ? ETH_ADDRESS || "ETH address not configured" : BTC_ADDRESS || "BTC address not configured"}</span>
                                    <button onClick={() => copyAddress(coin === "ETH" ? ETH_ADDRESS : BTC_ADDRESS)} className="shrink-0 text-gray-500 hover:text-gray-300">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* BTC note */}
                            {coin === "BTC" && (
                                <div className="flex gap-2 p-3 rounded-lg mb-3" style={{ background: "rgba(232,160,32,0.1)", border: "1px solid rgba(232,160,32,0.25)" }}>
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#e8a020" }} />
                                    <p className="text-xs text-gray-300">
                                        BTC transfers open your wallet app via a <code>bitcoin:</code> URI. MetaMask doesn&apos;t support BTC — use Trust Wallet or Phantom mobile for best results.
                                    </p>
                                </div>
                            )}

                            {/* Amount */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 mb-1 block">Amount ({coin})</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    placeholder={`0.00 ${coin}`}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border transition-colors"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        borderColor: "rgba(255,255,255,0.12)",
                                    }}
                                    onFocus={e => (e.target.style.borderColor = "#e8a020")}
                                    onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                                />
                            </div>

                            {/* Send button */}
                            <button
                                onClick={coin === "ETH" ? sendEth : sendBtc}
                                disabled={!amount || parseFloat(amount) <= 0}
                                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                                style={{
                                    background: "linear-gradient(135deg, #e8a020, #f5c842)",
                                    color: "#000",
                                    opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1,
                                    cursor: !amount || parseFloat(amount) <= 0 ? "not-allowed" : "pointer",
                                }}
                            >
                                Send {coin} →
                            </button>

                            <button
                                onClick={() => setStep("select")}
                                className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                            >
                                ← Change wallet
                            </button>
                        </div>
                    )}

                    {/* ── STEP: SENDING ──────────────────────────────── */}
                    {step === "sending" && (
                        <div className="flex flex-col items-center py-8 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#e8a020" }} />
                            <p className="text-white font-semibold">Confirm in your wallet…</p>
                            <p className="text-xs text-gray-400 text-center">Check your wallet app or extension for a transaction prompt.</p>
                        </div>
                    )}

                    {/* ── STEP: SUCCESS ──────────────────────────────── */}
                    {step === "success" && (
                        <div className="flex flex-col items-center py-8 gap-4 text-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: "rgba(74,222,128,0.15)" }}>
                                ✅
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Transaction Submitted!</p>
                                <p className="text-xs text-gray-400 mt-1">Your transfer has been broadcast to the network.</p>
                            </div>
                            {txHash && (
                                <a
                                    href={`https://etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs underline"
                                    style={{ color: "#e8a020" }}
                                >
                                    View on Etherscan →
                                </a>
                            )}
                            <button
                                onClick={onClose}
                                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black"
                                style={{ background: "linear-gradient(135deg, #e8a020, #f5c842)" }}
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* ── STEP: ERROR ────────────────────────────────── */}
                    {step === "error" && (
                        <div className="flex flex-col items-center py-8 gap-4 text-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: "rgba(239,68,68,0.15)" }}>
                                ❌
                            </div>
                            <div>
                                <p className="text-white font-bold">Something went wrong</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs">{errorMsg}</p>
                            </div>
                            <button
                                onClick={() => setStep("select")}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black"
                                style={{ background: "linear-gradient(135deg, #e8a020, #f5c842)" }}
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes walletSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)  scale(1); }
                }
            `}</style>
        </div>
    );
}
