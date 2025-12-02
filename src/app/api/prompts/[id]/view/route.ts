import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prompts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const promptId = parseInt(resolvedParams.id);
        if (isNaN(promptId)) {
            return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
        }

        await db.update(prompts)
            .set({ views: sql`${prompts.views} + 1` })
            .where(eq(prompts.id, promptId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('View count error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

