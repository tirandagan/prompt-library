import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all categories
export async function GET() {
    try {
        const allCategories = await db.select().from(categories).orderBy(categories.name);
        return NextResponse.json(allCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST create category
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCategory = await db.insert(categories).values({
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return NextResponse.json(newCategory[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
