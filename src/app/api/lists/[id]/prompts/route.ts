import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';
import { addPromptToList, removePromptFromList } from '@/db/queries';
import { db } from '@/db';
import { userLists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Add prompt to list
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const listId = parseInt(id);
        if (isNaN(listId)) {
            return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
        }

        // Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload.sessionId !== 'string') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await getSessionByToken(payload.sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const list = await db.query.userLists.findFirst({
            where: and(
                eq(userLists.id, listId),
                eq(userLists.userId, session.user.id)
            )
        });

        if (!list) {
            return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
        }

        const body = await request.json();
        const { promptId } = body;

        if (!promptId) {
            return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
        }

        await addPromptToList(listId, parseInt(promptId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Add to list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Remove prompt from list
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const listId = parseInt(id);
        if (isNaN(listId)) {
            return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
        }

        // Auth check
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload.sessionId !== 'string') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await getSessionByToken(payload.sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const list = await db.query.userLists.findFirst({
            where: and(
                eq(userLists.id, listId),
                eq(userLists.userId, session.user.id)
            )
        });

        if (!list) {
            return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const promptId = searchParams.get('promptId');

        if (!promptId) {
            return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
        }

        await removePromptFromList(listId, parseInt(promptId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Remove from list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

