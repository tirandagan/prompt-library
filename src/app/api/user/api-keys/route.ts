import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { encrypt } from '@/lib/crypto';

const addKeySchema = z.object({
    provider: z.string().min(1),
    key: z.string().min(1),
    label: z.string().max(100).optional(),
});

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const keys = await db
            .select({
                id: apiKeys.id,
                provider: apiKeys.provider,
                label: apiKeys.label,
                createdAt: apiKeys.createdAt,
            })
            .from(apiKeys)
            .where(eq(apiKeys.userId, user.id));

        return NextResponse.json(keys);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const result = addKeySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { provider, key, label } = result.data;

        const encryptedKey = encrypt(key);

        await db.insert(apiKeys).values({
            userId: user.id,
            provider,
            key: encryptedKey,
            label: label || provider, // Default label to provider if empty
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Add API Key error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

