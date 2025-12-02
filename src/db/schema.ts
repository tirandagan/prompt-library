import { pgTable, serial, varchar, text, integer, timestamp, primaryKey, boolean, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Categories table
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    icon: varchar('icon', { length: 10 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tools table
export const tools = pgTable('tools', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'text', 'image', 'video', 'code'
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Prompts table
export const prompts = pgTable('prompts', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),
    promptText: text('prompt_text').notNull(),
    promptType: varchar('prompt_type', { length: 50 }).notNull(), // 'Direct', 'Generator', 'Refiner'
    author: varchar('author', { length: 100 }).notNull(),
    likes: integer('likes').default(0).notNull(),
    views: integer('views').default(0).notNull(),
    difficultyLevel: varchar('difficulty_level', { length: 20 }), // 'beginner', 'intermediate', 'advanced'
    useCase: text('use_case'), // Specific use case description
    industry: varchar('industry', { length: 100 }), // Target industry (optional)
    isPublished: boolean('is_published').default(false).notNull(), // Draft vs published
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    isPublishedIdx: index('prompts_is_published_idx').on(table.isPublished),
}));

// Tags table
export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table: prompts <-> categories (many-to-many)
export const promptCategories = pgTable('prompt_categories', {
    promptId: integer('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.promptId, table.categoryId] }),
    categoryIdIdx: index('prompt_categories_category_id_idx').on(table.categoryId),
}));

// Junction table: prompts <-> tools (many-to-many)
export const promptTools = pgTable('prompt_tools', {
    promptId: integer('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    toolId: integer('tool_id').notNull().references(() => tools.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.promptId, table.toolId] }),
}));

// Junction table: prompts <-> tags (many-to-many)
export const promptTags = pgTable('prompt_tags', {
    promptId: integer('prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: primaryKey({ columns: [table.promptId, table.tagId] }),
}));

// Prompt relationships table (self-referential for related prompts)
export const promptRelationships = pgTable('prompt_relationships', {
    id: serial('id').primaryKey(),
    sourcePromptId: integer('source_prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    targetPromptId: integer('target_prompt_id').notNull().references(() => prompts.id, { onDelete: 'cascade' }),
    relationshipType: varchar('relationship_type', { length: 50 }).notNull(), 
    // Types: 'variation', 'inspired_by', 'follow_up', 'alternative', 'prerequisite'
    description: text('description'), // Optional description of the relationship
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ===== AUTHENTICATION TABLES =====

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' or 'admin'
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at'),
});

// Sessions table
export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
});

// Verification codes table
export const verificationCodes = pgTable('verification_codes', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    code: varchar('code', { length: 6 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    attempts: integer('attempts').default(0).notNull(),
    verified: boolean('verified').default(false).notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
    promptCategories: many(promptCategories),
}));

export const toolsRelations = relations(tools, ({ many }) => ({
    promptTools: many(promptTools),
}));

export const promptsRelations = relations(prompts, ({ many }) => ({
    promptCategories: many(promptCategories),
    promptTools: many(promptTools),
    promptTags: many(promptTags),
    sourceRelationships: many(promptRelationships, {
        relationName: 'sourcePrompt'
    }),
    targetRelationships: many(promptRelationships, {
        relationName: 'targetPrompt'
    }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    promptTags: many(promptTags),
}));

export const promptCategoriesRelations = relations(promptCategories, ({ one }) => ({
    prompt: one(prompts, {
        fields: [promptCategories.promptId],
        references: [prompts.id],
    }),
    category: one(categories, {
        fields: [promptCategories.categoryId],
        references: [categories.id],
    }),
}));

export const promptToolsRelations = relations(promptTools, ({ one }) => ({
    prompt: one(prompts, {
        fields: [promptTools.promptId],
        references: [prompts.id],
    }),
    tool: one(tools, {
        fields: [promptTools.toolId],
        references: [tools.id],
    }),
}));

export const promptTagsRelations = relations(promptTags, ({ one }) => ({
    prompt: one(prompts, {
        fields: [promptTags.promptId],
        references: [prompts.id],
    }),
    tag: one(tags, {
        fields: [promptTags.tagId],
        references: [tags.id],
    }),
}));

export const promptRelationshipsRelations = relations(promptRelationships, ({ one }) => ({
    sourcePrompt: one(prompts, {
        fields: [promptRelationships.sourcePromptId],
        references: [prompts.id],
        relationName: 'sourcePrompt',
    }),
    targetPrompt: one(prompts, {
        fields: [promptRelationships.targetPromptId],
        references: [prompts.id],
        relationName: 'targetPrompt',
    }),
}));

// Authentication Relations
export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
