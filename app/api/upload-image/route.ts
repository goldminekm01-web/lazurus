import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

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

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
        }

        // Ensure upload directory exists
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).slice(2, 8);
        const ext = path.extname(file.name).toLowerCase();
        const filename = `${timestamp}-${randomSuffix}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Convert file to buffer and save
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filepath, buffer);

        const url = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url, filename });
    } catch (error: any) {
        console.error("[upload-image] Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
