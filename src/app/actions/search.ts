'use server';

import { db } from '@/db';
import { prompts } from '@/db/schema';
import { generateEmbedding } from '@/lib/ai';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

export type SearchResult = {
  id: number;
  name: string;
  description: string;
  slug: string;
  similarity: number;
};

export async function searchPrompts(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const embedding = await generateEmbedding(query);
    
    const similarity = sql<number>`1 - (${prompts.embedding} <=> ${JSON.stringify(embedding)}::vector)`;
    
    const results = await db
      .select({
        id: prompts.id,
        name: prompts.name,
        description: prompts.description,
        slug: prompts.slug,
        similarity,
      })
      .from(prompts)
      .where(gt(similarity, 0.75))
      .orderBy(desc(similarity))
      .limit(10);
      
    return results;
  } catch (error) {
    console.error('Error searching prompts:', error);
    return [];
  }
}

