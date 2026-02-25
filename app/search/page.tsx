import { getAllPosts } from "@/lib/posts";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
    const allPosts = getAllPosts();
    // Strip content body to reduce payload size
    const posts = allPosts.map(({ content: _content, ...rest }) => rest);
    return <SearchClient posts={posts} />;
}
