import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tools } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all tools
export async function GET() {
    try {
        const allTools = await db.select().from(tools).orderBy(tools.name);
        return NextResponse.json(allTools);
    } catch (error) {
        console.error('Error fetching tools:', error);
        return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
    }
}

// POST create tool
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newTool = await db.insert(tools).values({
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return NextResponse.json(newTool[0]);
    } catch (error) {
        console.error('Error creating tool:', error);
        return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
    }
}

