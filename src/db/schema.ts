import { pgTable, serial, varchar, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
