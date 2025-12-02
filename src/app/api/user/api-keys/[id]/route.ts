import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const keyId = parseInt(id);

        if (isNaN(keyId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await db.delete(apiKeys)
            .where(and(
                eq(apiKeys.id, keyId),
                eq(apiKeys.userId, user.id)
            ));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

