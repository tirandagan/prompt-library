import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH update tool
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        const updatedTool = await db.update(tools)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(tools.id, parseInt(id)))
            .returning();

        if (!updatedTool.length) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedTool[0]);
    } catch (error) {
        console.error('Error updating tool:', error);
        return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
    }
}

// DELETE tool
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.delete(tools).where(eq(tools.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tool:', error);
        return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
    }
}

