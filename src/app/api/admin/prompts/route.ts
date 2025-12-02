import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prompts, promptCategories, promptTools, promptTags } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all prompts with relationships
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
        
        const allPrompts = await db.query.prompts.findMany({
            where: includeUnpublished ? undefined : eq(prompts.isPublished, true),
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
                }
            },
            orderBy: (prompts, { desc }) => [desc(prompts.createdAt)],
        });
        
        return NextResponse.json(allPrompts);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

// POST create prompt
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categories: categoryIds, tools: toolIds, tags: tagIds, ...promptData } = body;
        
        // Insert prompt
        const [newPrompt] = await db.insert(prompts).values({
            ...promptData,
            publishedAt: promptData.publishedAt ? new Date(promptData.publishedAt) : null,
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
        console.error('Error creating prompt:', error);
        return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
    }
}
