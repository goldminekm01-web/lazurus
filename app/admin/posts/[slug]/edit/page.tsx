import { getAllPosts } from "@/lib/posts";
import EditEditor from "./EditEditor";

export const dynamicParams = false;

export function generateStaticParams() {
    return [{ slug: "edit-post" }];
}

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: Props) {
    const { slug } = await params;
    return <EditEditor slug={slug} />;
}
