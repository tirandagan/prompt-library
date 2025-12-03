import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prompts, promptCategories, promptTools, promptTags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/ai';

// GET single prompt with all relationships
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const prompt = await db.query.prompts.findFirst({
            where: eq(prompts.id, parseInt(id)),
            with: {
                promptCategories: {
                    with: { category: true }
                },
                promptTools: {
                    with: { tool: true }
                },
                promptTags: {
                    with: { tag: true }
                },
                sourceRelationships: {
                    with: { targetPrompt: true }
                },
                targetRelationships: {
                    with: { sourcePrompt: true }
                }
            },
        });
        
        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }
        
        return NextResponse.json(prompt);
    } catch (error) {
        console.error('Error fetching prompt:', error);
        return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
    }
}

// PATCH update prompt
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { categories: categoryIds, tools: toolIds, tags: tagIds, ...promptData } = body;
        
        let embedding = undefined;
        if (promptData.name || promptData.description || promptData.promptText) {
            const existing = await db.query.prompts.findFirst({ where: eq(prompts.id, parseInt(id)) });
            if (existing) {
                const name = promptData.name || existing.name;
                const description = promptData.description || existing.description;
                const text = promptData.promptText || existing.promptText;
                const embeddingText = `${name}\n${description}\n${text}`;
                embedding = await generateEmbedding(embeddingText);
            }
        }

        const updateData = { ...promptData, updatedAt: new Date() };
        if (embedding) {
            updateData.embedding = embedding;
        }

        // Update prompt
        const [updatedPrompt] = await db.update(prompts)
            .set(updateData)
            .where(eq(prompts.id, parseInt(id)))
            .returning();
        
        if (!updatedPrompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }
        
        // Update relationships if provided
        if (categoryIds !== undefined) {
            await db.delete(promptCategories).where(eq(promptCategories.promptId, parseInt(id)));
            if (categoryIds.length) {
                await db.insert(promptCategories).values(
                    categoryIds.map((catId: number) => ({ 
                        promptId: parseInt(id), 
                        categoryId: catId 
                    }))
                );
            }
        }
        
        if (toolIds !== undefined) {
            await db.delete(promptTools).where(eq(promptTools.promptId, parseInt(id)));
            if (toolIds.length) {
                await db.insert(promptTools).values(
                    toolIds.map((toolId: number) => ({ 
                        promptId: parseInt(id), 
                        toolId 
                    }))
                );
            }
        }
        
        if (tagIds !== undefined) {
            await db.delete(promptTags).where(eq(promptTags.promptId, parseInt(id)));
            if (tagIds.length) {
                await db.insert(promptTags).values(
                    tagIds.map((tagId: number) => ({ 
                        promptId: parseInt(id), 
                        tagId 
                    }))
                );
            }
        }
        
        return NextResponse.json(updatedPrompt);
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }
}

// DELETE prompt
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.delete(prompts).where(eq(prompts.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }
}
