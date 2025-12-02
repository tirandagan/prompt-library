import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET single category
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await db.select().from(categories).where(eq(categories.id, parseInt(id)));
        
        if (!category.length) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        
        return NextResponse.json(category[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

// PATCH update category
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await db.update(categories)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(categories.id, parseInt(id)))
            .returning();
        
        if (!updated.length) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        
        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE category
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.delete(categories).where(eq(categories.id, parseInt(id)));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
