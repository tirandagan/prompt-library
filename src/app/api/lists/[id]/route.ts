import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';
import { db } from '@/db';
import { userLists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Get single list details (optional if needed)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const listId = parseInt(id);
        if (isNaN(listId)) {
            return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
        }

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

        const list = await db.query.userLists.findFirst({
            where: and(
                eq(userLists.id, listId),
                eq(userLists.userId, session.user.id)
            ),
            with: {
                listPrompts: {
                    with: {
                        prompt: true
                    }
                }
            }
        });

        if (!list) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        return NextResponse.json(list);
    } catch (error) {
        console.error('Get list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Delete list
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

        // Verify ownership and delete
        const result = await db.delete(userLists)
            .where(and(
                eq(userLists.id, listId),
                eq(userLists.userId, session.user.id)
            ))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update list
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const listId = parseInt(id);
        if (isNaN(listId)) {
            return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
        }

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

        const body = await request.json();
        const { name, description, isPrivate } = body;

        const result = await db.update(userLists)
            .set({
                name,
                description,
                isPrivate,
                updatedAt: new Date(),
            })
            .where(and(
                eq(userLists.id, listId),
                eq(userLists.userId, session.user.id)
            ))
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error('Update list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

