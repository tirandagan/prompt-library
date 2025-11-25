import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (!token) {
            return NextResponse.json({ user: null });
        }

        const payload = await verifyToken(token);

        if (!payload || typeof payload.sessionId !== 'string') {
            return NextResponse.json({ user: null });
        }

        const sessionData = await getSessionByToken(payload.sessionId);

        if (!sessionData) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: sessionData.user.id,
                email: sessionData.user.email,
                name: sessionData.user.name,
                avatarUrl: sessionData.user.avatarUrl,
                role: sessionData.user.role,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json({ user: null });
    }
}
