/**
 * Public endpoint returning all active categories with their active candidates.
 * No auth required. Supports ?type=debug for diagnostics.
 */

export const revalidate = 60;
export const dynamic = "force-dynamic";

import { getVotingData, getVoteResults } from "@/lib/voting";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "voting";

    if (type === "results") {
        const results = await getVoteResults();
        return Response.json({ results });
    }

    const data = await getVotingData();
    return Response.json({ data });
}