import { getAllPromptsWithRelations, getCategoriesWithCount, getAllTools } from "@/db/queries";
import { CategoriesPageClient } from "@/components/CategoriesPageClient";
import { Prompt } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    // Fetch all data in parallel
    const [promptsData, categoriesData, toolsData] = await Promise.all([
        getAllPromptsWithRelations(),
        getCategoriesWithCount(),
        getAllTools()
    ]);

    // Map database prompts to UI Prompt type
    const mappedPrompts: Prompt[] = promptsData.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        text: p.promptText,
        // Use the first category as the primary one, or "Uncategorized"
        category: p.promptCategories[0]?.category.name || "Uncategorized",
        // Map all tool names
        tools: p.promptTools.map((pt) => pt.tool.name),
        type: p.promptType as "Direct" | "Generator" | "Refiner",
        author: p.author,
        likes: p.likes,
        views: p.views,
        // Map all tag names
        tags: p.promptTags.map((pt) => pt.tag.name),
    }));

    return (
        <CategoriesPageClient 
            prompts={mappedPrompts}
            categories={categoriesData}
            tools={toolsData}
        />
    );
}

