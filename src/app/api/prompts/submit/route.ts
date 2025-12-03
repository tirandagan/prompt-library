import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prompts, promptCategories, promptTools, promptTags } from '@/db/schema';
import { generateEmbedding } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { categories: categoryIds, tools: toolIds, tags: tagIds, ...promptData } = body;

        // Force draft status
        promptData.isPublished = false;
        promptData.publishedAt = null;

        // Generate embedding (Name + Description only)
        // Note: generateEmbedding might fail if OpenAI key is missing/invalid, 
        // but we'll assume it's configured as it's used in admin route.
        // If it's optional in admin, we should handle failure here too, but admin route doesn't try-catch it specifically.
        let embedding = null;
        try {
            const embeddingText = `${promptData.name}\n${promptData.description}`;
            embedding = await generateEmbedding(embeddingText);
        } catch (e) {
            console.error('Embedding generation failed (continuing without embedding):', e);
        }

        // Insert prompt
        const [newPrompt] = await db.insert(prompts).values({
            ...promptData,
            embedding,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Insert category relationships
        if (categoryIds?.length) {
            await db.insert(promptCategories).values(
                categoryIds.map((catId: number) => ({
                    promptId: newPrompt.id,
                    categoryId: catId
                }))
            );
        }

        // Insert tool relationships
        if (toolIds?.length) {
            await db.insert(promptTools).values(
                toolIds.map((toolId: number) => ({
                    promptId: newPrompt.id,
                    toolId
                }))
            );
        }

        // Insert tag relationships
        if (tagIds?.length) {
            await db.insert(promptTags).values(
                tagIds.map((tagId: number) => ({
                    promptId: newPrompt.id,
                    tagId
                }))
            );
        }

        return NextResponse.json(newPrompt);
    } catch (error) {
        console.error('Error submitting prompt:', error);
        return NextResponse.json({ error: 'Failed to submit prompt' }, { status: 500 });
    }
}

