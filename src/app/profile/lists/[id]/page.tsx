import { getCurrentUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import ListDetailClient from './ListDetailClient';
import { getListWithPrompts, getUserLikes } from '@/db/queries';
import { Prompt } from '@/lib/data';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ListDetailPage({ params }: PageProps) {
    const { id } = await params;
    const listId = parseInt(id);
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }

    if (isNaN(listId)) {
        notFound();
    }

    const listData = await getListWithPrompts(listId, user.id);

    if (!listData) {
        notFound();
    }

    // Map to UI Prompt type
    const mappedPrompts: Prompt[] = listData.listPrompts.map(({ prompt }) => ({
        id: prompt.id.toString(),
        name: prompt.name,
        description: prompt.description,
        text: prompt.promptText,
        category: prompt.promptCategories?.[0]?.category?.name || "Uncategorized",
        tools: prompt.promptTools?.map((pt: any) => pt.tool.name) || [],
        type: prompt.promptType as "Direct" | "Generator" | "Refiner",
        author: prompt.author,
        likes: prompt.likes,
        views: prompt.views,
        tags: [], // Add promptTags if needed
    }));

    // Check likes status for these prompts
    if (mappedPrompts.length > 0) {
        const likedIds = await getUserLikes(user.id, mappedPrompts.map(p => parseInt(p.id)));
        const likedSet = new Set(likedIds);
        mappedPrompts.forEach(p => {
            if (likedSet.has(parseInt(p.id))) {
                p.isLiked = true;
            }
        });
    }

    return (
        <ListDetailClient list={listData} prompts={mappedPrompts} />
    );
}

