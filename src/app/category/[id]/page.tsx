import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { categories, prompts, promptCategories, tools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/CategoryPageClient";
import { Prompt } from "@/lib/data";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { id: slug } = await params;
    const user = await getCurrentUser();

    // 1. Fetch category
    const category = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
    });

    if (!category) {
        notFound();
    }

    // 2. Fetch prompts for this category
    const promptCategoryRecords = await db.query.promptCategories.findMany({
        where: eq(promptCategories.categoryId, category.id),
        with: {
            prompt: {
                where: eq(prompts.isPublished, true),
                with: {
                    promptTools: {
                        with: {
                            tool: true,
                        }
                    },
                    promptTags: {
                        with: {
                            tag: true,
                        }
                    }
                }
            }
        }
    });

    // Filter out records where prompt is null (due to isPublished filter)
    // and map to Prompt type
    const mappedPrompts: Prompt[] = promptCategoryRecords
        .filter(pc => pc.prompt)
        .map(pc => {
            const p = pc.prompt;
            return {
                id: p.id.toString(),
                name: p.name,
                description: p.description,
                text: p.promptText,
                category: category.name,
                tools: p.promptTools.map((pt: any) => pt.tool.name),
                type: p.promptType as "Direct" | "Generator" | "Refiner",
                author: p.author,
                likes: p.likes,
                views: p.views,
                tags: p.promptTags.map((pt: any) => pt.tag.name),
            };
        });

    if (user && mappedPrompts.length > 0) {
        const promptIds = mappedPrompts.map(p => parseInt(p.id));
        const likedIds = await getUserLikes(user.id, promptIds);
        const likedSet = new Set(likedIds);
        
        mappedPrompts.forEach(p => {
            if (likedSet.has(parseInt(p.id))) {
                p.isLiked = true;
            }
        });
    }

    // 3. Fetch all tools for the filter sidebar
    const allTools = await db.select().from(tools);

    return (
        <CategoryPageClient 
            category={category} 
            initialPrompts={mappedPrompts} 
            allTools={allTools} 
        />
    );
}
