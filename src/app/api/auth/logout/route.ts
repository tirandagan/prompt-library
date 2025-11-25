import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { deleteSession } from '@/db/auth-queries';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (token) {
            const payload = await verifyToken(token);
            if (payload && typeof payload.sessionId === 'string') {
                await deleteSession(payload.sessionId);
            }
        }

        // Clear cookie
        cookieStore.delete('session');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
