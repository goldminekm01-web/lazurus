import { NextResponse } from "next/server";
import { savePost } from "@/lib/posts";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || request.headers.get("Authorization")?.replace("Bearer ", "");
    
    // Validate secure cron token
    if (token !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("[CRON] Starting automated blog post generation...");

        const prompt = `
You are an expert cybersecurity analyst and blockchain forensics investigator writing for the Lazarus Group blog.
Your task is to write a highly engaging, professional, and SEO-optimized blog post about a very recent, highly current cryptocurrency scam that is currently trending on Reddit (e.g., r/CryptoCurrency, r/Scams) or other online forums. 
Focus on specific, contemporary tactics such as new phishing campaigns, fake presales, modern wallet drainers, or recent social engineering exploits affecting real users right now.
Do not output markdown code blocks. Output exactly a JSON object in this format:
{
  "title": "A catchy, SEO-friendly title covering a recent trending scam",
  "slug": "a-url-friendly-slug-of-the-title",
  "excerpt": "A short 1-2 sentence summary of the article.",
  "author": "Lazarus Forensics Team",
  "category": "security", // Choose one from: security, forensics, markets, crypto, analysis
  "tags": ["crypto", "scam", "recovery", "reddit"], // 3-4 relevant tags
  "content": "The full blog post content in HTML format. Use standard HTML tags like <h2>, <p>, <ul>, <li>, <strong>. Make it detailed, around 500-800 words."
}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: "You are a professional blog writer." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const resultText = completion.choices[0].message.content;
        if (!resultText) {
            throw new Error("No response from OpenAI");
        }

        const generatedData = JSON.parse(resultText);
        
        // Structure the frontmatter
        const frontmatter = {
            title: generatedData.title,
            date: new Date().toISOString().split("T")[0],
            publishAt: new Date().toISOString(),
            excerpt: generatedData.excerpt,
            author: generatedData.author || "Lazarus Forensics Team",
            category: generatedData.category || "security",
            tags: generatedData.tags || ["crypto", "security"],
            image: "https://images.unsplash.com/photo-1639762681485-074b7f4ec674?q=80&w=2000&auto=format&fit=crop", // Default placeholder image
            status: "published",
        };

        // Save to Firebase via the lib function
        await savePost(generatedData.slug, frontmatter, generatedData.content);

        // Revalidate the homepage and dynamic routes
        try {
            revalidatePath("/");
            revalidatePath("/post/[slug]", "page");
            console.log(`[CRON] Revalidated paths for slug: ${generatedData.slug}`);
        } catch (revErr) {
            console.error(`[CRON] Revalidation error (non-fatal):`, revErr);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Automated post generated and published successfully.",
            slug: generatedData.slug
        });

    } catch (error: any) {
        console.error("[CRON] Error generating automated post:", error);
        return NextResponse.json({ error: error.message || "Failed to generate post" }, { status: 500 });
    }
}
