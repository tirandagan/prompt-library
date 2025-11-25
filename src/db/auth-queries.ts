import { db } from './index';
import { users, sessions, verificationCodes } from './schema';
import { eq, and, gt, lt, desc, sql } from 'drizzle-orm';

// User Queries
export async function getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
}

export async function createUser(email: string, name?: string) {
    const result = await db
        .insert(users)
        .values({
            email,
            name: name || email.split('@')[0],
            isEmailVerified: true, // Auto-verified since we use email code
            lastLoginAt: new Date(),
        })
        .returning();
    return result[0];
}

export async function updateUserLogin(id: number) {
    await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, id));
}

// Session Queries
export async function createSession(userId: number, token: string, expiresAt: Date, ipAddress?: string, userAgent?: string) {
    const result = await db
        .insert(sessions)
        .values({
            userId,
            token,
            expiresAt,
            ipAddress,
            userAgent,
        })
        .returning();
    return result[0];
}

export async function getSessionByToken(token: string) {
    const result = await db
        .select({
            session: sessions,
            user: users,
        })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(
            and(
                eq(sessions.token, token),
                gt(sessions.expiresAt, new Date())
            )
        )
        .limit(1);

    return result[0];
}

export async function deleteSession(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
}

export async function deleteExpiredSessions() {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

// Verification Code Queries
export async function createVerificationCode(email: string, code: string) {
    // Delete any existing codes for this email
    await db.delete(verificationCodes).where(eq(verificationCodes.email, email));

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    const result = await db
        .insert(verificationCodes)
        .values({
            email,
            code,
            expiresAt,
        })
        .returning();
    return result[0];
}

export async function getVerificationCode(email: string, code: string) {
    const result = await db
        .select()
        .from(verificationCodes)
        .where(
            and(
                eq(verificationCodes.email, email),
                eq(verificationCodes.code, code),
                gt(verificationCodes.expiresAt, new Date()),
                eq(verificationCodes.verified, false)
            )
        )
        .orderBy(desc(verificationCodes.createdAt))
        .limit(1);

    return result[0];
}

export async function markCodeAsVerified(id: number) {
    await db
        .update(verificationCodes)
        .set({ verified: true })
        .where(eq(verificationCodes.id, id));
}

export async function incrementCodeAttempts(id: number) {
    await db
        .update(verificationCodes)
        .set({ attempts: sql`${verificationCodes.attempts} + 1` })
        .where(eq(verificationCodes.id, id));
}
