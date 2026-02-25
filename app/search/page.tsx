import { getAllPosts } from "@/lib/posts";
import SearchClient from "./SearchClient";

// Static export doesn't support force-dynamic
export default async function SearchPage() {
    const allPosts = await getAllPosts();
    // Strip content body to reduce payload size for the search index
    const posts = allPosts.map(({ content: _content, ...rest }) => rest);
    return <SearchClient posts={posts} />;
}
