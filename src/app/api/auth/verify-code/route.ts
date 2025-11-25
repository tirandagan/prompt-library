import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    getVerificationCode,
    markCodeAsVerified,
    incrementCodeAttempts,
    getUserByEmail,
    createUser,
    updateUserLogin,
    createSession
} from '@/db/auth-queries';
import { signToken } from '@/lib/auth/jwt';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { success: false, message: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Verify code
        const verificationRecord = await getVerificationCode(email, code);

        if (!verificationRecord) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired code' },
                { status: 400 }
            );
        }

        // Check attempts
        if (verificationRecord.attempts >= (parseInt(process.env.MAX_VERIFICATION_ATTEMPTS || '3'))) {
            return NextResponse.json(
                { success: false, message: 'Too many attempts. Please request a new code.' },
                { status: 400 }
            );
        }

        // Mark as verified
        await markCodeAsVerified(verificationRecord.id);

        // Get or create user
        let user = await getUserByEmail(email);

        if (!user) {
            user = await createUser(email);
        } else {
            await updateUserLogin(user.id);
        }

        // Create session
        const sessionToken = nanoid(32);
        const sessionDuration = parseInt(process.env.SESSION_DURATION_HOURS || '96');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + sessionDuration);

        // Get IP and User Agent (basic extraction)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await createSession(user.id, sessionToken, expiresAt, ip, userAgent);

        // Sign JWT for the cookie
        const token = await signToken({
            userId: user.id,
            email: user.email,
            sessionId: sessionToken
        });

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Verify code error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
