import { db } from './index';
import { categories, tools, prompts, tags, promptCategories, promptTools, promptTags, promptLikes, userLists, listPrompts } from './schema';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';

// Categories
export async function getAllCategories() {
    return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
}

// Tools
export async function getAllTools() {
    return await db.select().from(tools).orderBy(tools.name);
}

export async function getToolBySlug(slug: string) {
    const result = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
    return result[0];
}

// Prompts
export async function getAllPrompts(limit = 100) {
    return await db
        .select()
        .from(prompts)
        .orderBy(desc(prompts.createdAt))
        .limit(limit);
}

export async function getPromptBySlug(slug: string) {
    const result = await db.select().from(prompts).where(eq(prompts.slug, slug)).limit(1);
    return result[0];
}

export async function getPromptById(id: number) {
    const result = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);
    return result[0];
}

// Get prompts with related data
export async function getPromptWithRelations(slug: string) {
    const prompt = await getPromptBySlug(slug);
    if (!prompt) return null;

    // Get categories
    const promptCats = await db
        .select({ category: categories })
        .from(promptCategories)
        .innerJoin(categories, eq(promptCategories.categoryId, categories.id))
        .where(eq(promptCategories.promptId, prompt.id));

    // Get tools
    const promptToolsList = await db
        .select({ tool: tools })
        .from(promptTools)
        .innerJoin(tools, eq(promptTools.toolId, tools.id))
        .where(eq(promptTools.promptId, prompt.id));

    // Get tags
    const promptTagsList = await db
        .select({ tag: tags })
        .from(promptTags)
        .innerJoin(tags, eq(promptTags.tagId, tags.id))
        .where(eq(promptTags.promptId, prompt.id));

    return {
        ...prompt,
        categories: promptCats.map((pc) => pc.category),
        tools: promptToolsList.map((pt) => pt.tool),
        tags: promptTagsList.map((pt) => pt.tag),
    };
}


// Get all published prompts with related data
export async function getAllPromptsWithRelations() {
    return await db.query.prompts.findMany({
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
            promptImages: true,
        },
        orderBy: (prompts, { desc }) => [desc(prompts.likes)],
    });
}

// Get prompts by category
export async function getPromptsByCategory(categorySlug: string, limit = 100) {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];

    const result = await db
        .select({ prompt: prompts })
        .from(promptCategories)
        .innerJoin(prompts, eq(promptCategories.promptId, prompts.id))
        .where(eq(promptCategories.categoryId, category.id))
        .orderBy(desc(prompts.createdAt))
        .limit(limit);

    return result.map((r) => r.prompt);
}

// Get prompts by tool
export async function getPromptsByTool(toolSlug: string, limit = 100) {
    const tool = await getToolBySlug(toolSlug);
    if (!tool) return [];

    const result = await db
        .select({ prompt: prompts })
        .from(promptTools)
        .innerJoin(prompts, eq(promptTools.promptId, prompts.id))
        .where(eq(promptTools.toolId, tool.id))
        .orderBy(desc(prompts.createdAt))
        .limit(limit);

    return result.map((r) => r.prompt);
}

// Get popular prompts
export async function getPopularPrompts(limit = 10) {
    return await db
        .select()
        .from(prompts)
        .orderBy(desc(prompts.likes))
        .limit(limit);
}

// Get most viewed prompts
export async function getMostViewedPrompts(limit = 10) {
    return await db
        .select()
        .from(prompts)
        .orderBy(desc(prompts.views))
        .limit(limit);
}

// Increment view count
export async function incrementPromptViews(id: number) {
    await db
        .update(prompts)
        .set({ views: sql`${prompts.views} + 1` })
        .where(eq(prompts.id, id));
}

// Increment like count
export async function incrementPromptLikes(id: number) {
    await db
        .update(prompts)
        .set({ likes: sql`${prompts.likes} + 1` })
        .where(eq(prompts.id, id));
}

// Decrement like count
export async function decrementPromptLikes(id: number) {
    await db
        .update(prompts)
        .set({ likes: sql`${prompts.likes} - 1` })
        .where(eq(prompts.id, id));
}

// Search prompts
export async function searchPrompts(query: string, limit = 50) {
    const searchTerm = `%${query.toLowerCase()}%`;

    return await db
        .select()
        .from(prompts)
        .where(
            sql`LOWER(${prompts.name}) LIKE ${searchTerm} OR LOWER(${prompts.description}) LIKE ${searchTerm}`
        )
        .orderBy(desc(prompts.views))
        .limit(limit);
}

// Get category with prompt count
export async function getCategoriesWithCount() {
    const result = await db
        .select({
            id: categories.id,
            slug: categories.slug,
            name: categories.name,
            icon: categories.icon,
            description: categories.description,
            count: sql<number>`count(${promptCategories.promptId})::int`,
        })
        .from(categories)
        .leftJoin(promptCategories, eq(categories.id, promptCategories.categoryId))
        .groupBy(categories.id)
        .orderBy(categories.name);

    return result;
}

export async function getUserLikes(userId: number, promptIds: number[]) {
    if (promptIds.length === 0) return [];
    
    const likes = await db.select({ promptId: promptLikes.promptId })
        .from(promptLikes)
        .where(and(
            eq(promptLikes.userId, userId),
            inArray(promptLikes.promptId, promptIds)
        ));
        
    return likes.map(l => l.promptId);
}

// User Lists Queries

export async function getUserLists(userId: number) {
    return await db.query.userLists.findMany({
        where: eq(userLists.userId, userId),
        orderBy: desc(userLists.createdAt),
        with: {
            listPrompts: true // Get count efficiently if needed later
        }
    });
}

export async function getListWithPrompts(listId: number, userId: number) {
    return await db.query.userLists.findFirst({
        where: and(
            eq(userLists.id, listId),
            eq(userLists.userId, userId)
        ),
        with: {
            listPrompts: {
                with: {
                    prompt: {
                        with: {
                            promptTools: { with: { tool: true } },
                            promptCategories: { with: { category: true } }
                        }
                    }
                }
            }
        }
    });
}

export async function createUserList(userId: number, name: string, isPrivate = true, description?: string) {
    const [list] = await db.insert(userLists)
        .values({
            userId,
            name,
            isPrivate,
            description
        })
        .returning();
    return list;
}

export async function addPromptToList(listId: number, promptId: number) {
    // Check if list exists and belongs to user is handled in API
    await db.insert(listPrompts)
        .values({
            listId,
            promptId
        })
        .onConflictDoNothing(); // Ignore if already exists
}

export async function removePromptFromList(listId: number, promptId: number) {
    await db.delete(listPrompts)
        .where(and(
            eq(listPrompts.listId, listId),
            eq(listPrompts.promptId, promptId)
        ));
}

export async function getListsWithPromptStatus(userId: number, promptId: number) {
    const lists = await getUserLists(userId);
    
    // Check which lists contain the prompt
    const containingListIds = await db.select({ listId: listPrompts.listId })
        .from(listPrompts)
        .where(and(
            inArray(listPrompts.listId, lists.map(l => l.id)),
            eq(listPrompts.promptId, promptId)
        ));
        
    const containingSet = new Set(containingListIds.map(x => x.listId));
    
    return lists.map(list => ({
        ...list,
        hasPrompt: containingSet.has(list.id),
        count: list.listPrompts.length
    }));
}
