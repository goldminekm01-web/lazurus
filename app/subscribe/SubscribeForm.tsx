"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus("loading");
        setErrorMsg("");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            setStatus("success");
        } catch (err: any) {
            setErrorMsg(err.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center gap-3 py-6 mb-6">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="font-bold text-gray-900 text-lg">You&apos;re subscribed!</p>
                <p className="text-gray-500 text-sm">We&apos;ll be in touch at <strong>{email}</strong></p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 mb-6"
            aria-label="Subscribe to newsletter"
        >
            <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="flex-1 px-5 py-3.5 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-[#0a0a0a] transition-colors disabled:opacity-60"
                aria-label="Email address"
            />
            <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-base disabled:opacity-60"
            >
                {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
                ) : (
                    <><Mail className="w-4 h-4" /> Subscribe Free</>
                )}
            </button>
            {status === "error" && (
                <p className="w-full text-sm text-red-500 text-center mt-1">{errorMsg}</p>
            )}
        </form>
    );
}
