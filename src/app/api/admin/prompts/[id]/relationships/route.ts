import { NextResponse } from 'next/server';
import { db } from '@/db';
import { promptRelationships } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

// GET relationships for a prompt
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const promptId = parseInt(id);
        
        const relationships = await db.query.promptRelationships.findMany({
            where: or(
                eq(promptRelationships.sourcePromptId, promptId),
                eq(promptRelationships.targetPromptId, promptId)
            ),
            with: {
                sourcePrompt: true,
                targetPrompt: true,
            },
            orderBy: (promptRelationships, { desc }) => [desc(promptRelationships.createdAt)],
        });
        
        return NextResponse.json(relationships);
    } catch (error) {
        console.error('Error fetching relationships:', error);
        return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
    }
}

// POST create relationship
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const newRelationship = await db.insert(promptRelationships).values({
            sourcePromptId: parseInt(id),
            targetPromptId: body.targetPromptId,
            relationshipType: body.relationshipType,
            description: body.description,
            createdAt: new Date(),
        }).returning();
        
        return NextResponse.json(newRelationship[0]);
    } catch (error) {
        console.error('Error creating relationship:', error);
        return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
    }
}

// DELETE relationship
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const relationshipId = searchParams.get('relationshipId');
        
        if (!relationshipId) {
            return NextResponse.json({ error: 'relationshipId required' }, { status: 400 });
        }
        
        await db.delete(promptRelationships)
            .where(eq(promptRelationships.id, parseInt(relationshipId)));
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting relationship:', error);
        return NextResponse.json({ error: 'Failed to delete relationship' }, { status: 500 });
    }
}
