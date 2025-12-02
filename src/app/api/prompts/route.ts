import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prompts, promptCategories, promptTools, promptTags, categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET prompts by category slug
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get('category');
        
        if (!categorySlug) {
            return NextResponse.json({ error: 'Category slug required' }, { status: 400 });
        }

        // Get category
        const category = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
        
        if (!category.length) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Get prompts for this category
        const categoryPrompts = await db.query.prompts.findMany({
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
        });

        // Filter to only prompts in this category
        const filteredPrompts = categoryPrompts.filter(p =>
            p.promptCategories.some(pc => pc.categoryId === category[0].id)
        );

        return NextResponse.json({
            category: category[0],
            prompts: filteredPrompts,
        });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}
