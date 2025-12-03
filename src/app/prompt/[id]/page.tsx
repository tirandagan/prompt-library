import { db } from "@/db";
import { prompts, promptTools, promptTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PromptDetailClient } from "@/components/PromptDetailClient";
import { Prompt } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserLikes } from "@/db/queries";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function PromptDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await getCurrentUser();
    
    // Try to find prompt by slug first, then by ID
    let promptData = await db.query.prompts.findFirst({
        where: eq(prompts.slug, id),
        with: {
            promptTools: {
                with: { tool: true }
            },
            promptTags: {
                with: { tag: true }
            },
            promptCategories: {
                with: { category: true }
            },
            promptImages: true
        }
    });

    // If not found by slug, try ID (if it's a number)
    if (!promptData && !isNaN(parseInt(id))) {
        promptData = await db.query.prompts.findFirst({
            where: eq(prompts.id, parseInt(id)),
            with: {
                promptTools: {
                    with: { tool: true }
                },
                promptTags: {
                    with: { tag: true }
                },
                promptCategories: {
                    with: { category: true }
                },
                promptImages: true
            }
        });
    }

    if (!promptData) {
        notFound();
    }

    // Map to UI Prompt type
    const mappedPrompt: Prompt = {
        id: promptData.id.toString(),
        name: promptData.name,
        description: promptData.description,
        whatItDoes: promptData.whatItDoes || undefined,
        tips: promptData.tips || undefined,
        text: promptData.promptText,
        category: promptData.promptCategories[0]?.category.name || "Uncategorized", // Use first category for badge
        tools: promptData.promptTools.map(pt => pt.tool.name),
        type: promptData.promptType as "Direct" | "Generator" | "Refiner",
        author: promptData.author,
        likes: promptData.likes,
        views: promptData.views,
        tags: promptData.promptTags.map(pt => pt.tag.name),
        useCase: promptData.useCase || undefined,
        industry: promptData.industry || undefined,
        difficultyLevel: promptData.difficultyLevel || undefined,
        images: promptData.promptImages?.sort((a, b) => a.position - b.position).map(img => ({
            url: img.url,
            altText: img.altText || undefined,
            position: img.position
        }))
    };

    if (user) {
        const likedIds = await getUserLikes(user.id, [promptData.id]);
        if (likedIds.length > 0) {
            mappedPrompt.isLiked = true;
        }
    }

    const canEdit = user?.role === 'admin';

    return <PromptDetailClient prompt={mappedPrompt} canEdit={canEdit} />;
}
