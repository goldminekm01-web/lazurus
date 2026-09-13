import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get("x-admin-token");
        if (token !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const form = await request.formData();
        const file = form.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate file size (max 2MB — data URIs should stay reasonably small)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Max 2MB. Smaller images are recommended for cover photos." },
                { status: 400 }
            );
        }

        // Convert file to base64 data URI (works in Vercel serverless — no filesystem needed)
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const url = `data:${file.type};base64,${base64}`;

        return NextResponse.json({ success: true, url, filename: file.name });
    } catch (error: any) {
        console.error("[upload-image] Error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
