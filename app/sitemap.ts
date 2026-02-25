import { getAllPosts } from "@/lib/posts";
import { getAllCategories } from "@/lib/categories";

export default function sitemap() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antigravity.vercel.app";
    const posts = getAllPosts();
    const categories = getAllCategories();

    const staticPages = [
        { url: siteUrl, lastModified: new Date(), priority: 1.0 },
        { url: `${siteUrl}/about`, lastModified: new Date(), priority: 0.7 },
        { url: `${siteUrl}/subscribe`, lastModified: new Date(), priority: 0.8 },
        { url: `${siteUrl}/privacy`, lastModified: new Date(), priority: 0.3 },
    ];

    const postPages = posts.map((post) => ({
        url: `${siteUrl}/post/${post.slug}`,
        lastModified: new Date(post.publishAt),
        priority: post.featured ? 0.9 : 0.8,
    }));

    const categoryPages = categories.map((cat) => ({
        url: `${siteUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        priority: 0.7,
    }));

    return [...staticPages, ...postPages, ...categoryPages];
}
