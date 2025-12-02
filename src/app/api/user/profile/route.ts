import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(255).optional(),
    bio: z.string().max(1000).optional(),
});

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = updateProfileSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.format() },
                { status: 400 }
            );
        }

        const { name, bio } = result.data;

        await db.update(users)
            .set({
                ...(name !== undefined ? { name } : {}),
                ...(bio !== undefined ? { bio } : {}),
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

