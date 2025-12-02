import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { prompts, promptLikes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const promptId = parseInt(resolvedParams.id);
        if (isNaN(promptId)) {
            return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
        }

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

        // Check if already liked
        const existingLike = await db.query.promptLikes.findFirst({
            where: and(
                eq(promptLikes.promptId, promptId),
                eq(promptLikes.userId, userId)
            ),
        });

        let isLiked = false;

        if (existingLike) {
            // Unlike
            await db.delete(promptLikes)
                .where(and(
                    eq(promptLikes.promptId, promptId),
                    eq(promptLikes.userId, userId)
                ));
            
            // Decrement count
            await db.update(prompts)
                .set({ likes: sql`${prompts.likes} - 1` })
                .where(eq(prompts.id, promptId));
            
            isLiked = false;
        } else {
            // Like
            await db.insert(promptLikes)
                .values({
                    promptId,
                    userId,
                });
            
            // Increment count
            await db.update(prompts)
                .set({ likes: sql`${prompts.likes} + 1` })
                .where(eq(prompts.id, promptId));
            
            isLiked = true;
        }

        // Fetch updated likes count
        const updatedPrompt = await db.query.prompts.findFirst({
            where: eq(prompts.id, promptId),
            columns: {
                likes: true
            }
        });

        return NextResponse.json({ 
            liked: isLiked,
            likes: updatedPrompt?.likes || 0
        });

    } catch (error) {
        console.error('Like error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

