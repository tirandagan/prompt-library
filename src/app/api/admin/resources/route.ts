import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tools, tags } from '@/db/schema';

// GET all tools and tags (for selection in forms)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'tools' or 'tags'
        
        if (type === 'tools') {
            const allTools = await db.select().from(tools).orderBy(tools.name);
            return NextResponse.json(allTools);
        } else if (type === 'tags') {
            const allTags = await db.select().from(tags).orderBy(tags.name);
            return NextResponse.json(allTags);
        } else {
            // Return both
            const [allTools, allTags] = await Promise.all([
                db.select().from(tools).orderBy(tools.name),
                db.select().from(tags).orderBy(tags.name),
            ]);
            return NextResponse.json({ tools: allTools, tags: allTags });
        }
    } catch (error) {
        console.error('Error fetching tools/tags:', error);
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
}
