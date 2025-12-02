import { NextResponse } from 'next/server';
import { db } from '@/db';
import { categories, prompts, promptCategories } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

// GET categories with prompt counts
export async function GET() {
    try {
        const allCategories = await db.select().from(categories).orderBy(categories.name);
        
        // Get counts for each category
        const categoriesWithCounts = await Promise.all(
            allCategories.map(async (cat) => {
                const result = await db
                    .select({ count: count() })
                    .from(prompts)
                    .innerJoin(promptCategories, eq(prompts.id, promptCategories.promptId))
                    .where(
                        and(
                            eq(promptCategories.categoryId, cat.id),
                            eq(prompts.isPublished, true)
                        )
                    );
                
                return {
                    ...cat,
                    count: result[0]?.count || 0,
                };
            })
        );

        return NextResponse.json(categoriesWithCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
