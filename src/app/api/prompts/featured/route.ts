import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { prompts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';
import { getSessionByToken } from '@/db/auth-queries';
import { getUserLikes } from '@/db/queries';

export async function GET(request: Request) {
    try {
        const featuredPrompts = await db.query.prompts.findMany({
            where: eq(prompts.isPublished, true),
            with: {
                promptCategories: {
                    with: { category: true }
                },
                promptTools: {
                    with: { tool: true }
                },
                promptTags: {
                    with: { tag: true }
                },
            },
            orderBy: (prompts, { desc }) => [desc(prompts.likes)],
            limit: 8
        });

        // Map to Prompt type
        const mappedPrompts = featuredPrompts.map(p => ({
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            text: p.promptText,
            category: p.promptCategories[0]?.category.name || "Uncategorized",
            tools: p.promptTools.map(pt => pt.tool.name),
            type: p.promptType as any,
            author: p.author,
            likes: p.likes,
            views: p.views,
            tags: p.promptTags.map(pt => pt.tag.name),
            isLiked: false
        }));

        // Auth & Likes
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        
        if (token) {
            const payload = await verifyToken(token);
            if (payload && typeof payload.sessionId === 'string') {
                const session = await getSessionByToken(payload.sessionId);
                if (session) {
                     const promptIds = mappedPrompts.map(p => parseInt(p.id));
                     const likedIds = await getUserLikes(session.user.id, promptIds);
                     const likedSet = new Set(likedIds);
                     mappedPrompts.forEach(p => {
                         if (likedSet.has(parseInt(p.id))) p.isLiked = true;
                     });
                }
            }
        }

        return NextResponse.json(mappedPrompts);

    } catch (error) {
        console.error("Featured prompts error:", error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

