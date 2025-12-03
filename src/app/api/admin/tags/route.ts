import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const allTags = await db.select().from(tags).orderBy(tags.name);
        return NextResponse.json(allTags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        // Check if tag already exists
        const existingTag = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
        
        if (existingTag.length > 0) {
            return NextResponse.json(existingTag[0]);
        }

        const [newTag] = await db.insert(tags).values({
            name,
            slug,
        }).returning();

        return NextResponse.json(newTag);
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}

