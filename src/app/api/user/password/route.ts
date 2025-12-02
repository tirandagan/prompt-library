import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const changePasswordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function PUT(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = changePasswordSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.format() },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = result.data;

        // Fetch user with password hash
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, currentUser.id));

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user has a password, verify current password
        if (user.passwordHash) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required' },
                    { status: 400 }
                );
            }
            const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Incorrect current password' },
                    { status: 400 }
                );
            }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(users)
            .set({
                passwordHash: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

