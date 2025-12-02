import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, prompts, promptCategories } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

// GET categories with prompt counts
export async function GET() {
    try {
        const categoriesWithCounts = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                icon: categories.icon,
                description: categories.description,
                count: count(prompts.id)
            })
            .from(categories)
            .leftJoin(promptCategories, eq(categories.id, promptCategories.categoryId))
            .leftJoin(prompts, and(
                eq(promptCategories.promptId, prompts.id),
                eq(prompts.isPublished, true)
            ))
            .groupBy(categories.id, categories.name, categories.slug, categories.icon, categories.description)
            .orderBy(categories.name);

        return NextResponse.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
