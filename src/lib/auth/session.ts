import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { getSessionByToken } from '@/db/auth-queries';

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (!token) {
            return null;
        }

        const payload = await verifyToken(token);

        if (!payload || typeof payload.sessionId !== 'string') {
            return null;
        }

        const sessionData = await getSessionByToken(payload.sessionId);

        if (!sessionData) {
            return null;
        }

        // Force refresh role from database to ensure it's up to date
        // The session query already joins with user table so we get the latest role
        
        return sessionData.user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

