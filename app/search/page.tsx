import { getAllPosts } from "@/lib/posts";
import SearchClient from "./SearchClient";

// Static export doesn't support force-dynamic
export const dynamic = "force-static";

export default function SearchPage() {
    const allPosts = getAllPosts();
    // Strip content body to reduce payload size for the search index
    const posts = allPosts.map(({ content: _content, ...rest }) => rest);
    return <SearchClient posts={posts} />;
}
