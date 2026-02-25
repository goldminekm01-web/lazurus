import EditEditor from "./EditEditor";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: Props) {
    const { slug } = await params;
    return <EditEditor slug={slug} />;
}
