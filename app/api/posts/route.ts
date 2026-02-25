import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
    return NextResponse.json({ posts: [] });
}

export async function POST() {
    return NextResponse.json({ success: true });
}

export async function DELETE() {
    return NextResponse.json({ success: true });
}
