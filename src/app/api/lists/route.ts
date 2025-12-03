import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';
import { getUserLists, createUserList, getListsWithPromptStatus } from '@/db/queries';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const promptIdParam = searchParams.get('promptId');

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

        const userId = session.user.id;

        if (promptIdParam) {
            const promptId = parseInt(promptIdParam);
            if (!isNaN(promptId)) {
                const lists = await getListsWithPromptStatus(userId, promptId);
                return NextResponse.json(lists);
            }
        }

        const lists = await getUserLists(userId);
        return NextResponse.json(lists);

    } catch (error) {
        console.error('Get lists error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
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

        const body = await request.json();
        const { name, description, isPrivate } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const newList = await createUserList(session.user.id, name, isPrivate !== false, description);

        return NextResponse.json(newList);

    } catch (error) {
        console.error('Create list error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

