
import { db } from '../src/db';
import { prompts } from '../src/db/schema';
import { generateEmbedding } from '../src/lib/ai';
import { desc, gt, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function analyzeSearch(query: string) {
  console.log(`🔎 Analyzing search for: "${query}"`);
  
  try {
    const embedding = await generateEmbedding(query);
    const similarity = sql<number>`1 - (${prompts.embedding} <=> ${JSON.stringify(embedding)}::vector)`;
    
    const results = await db
      .select({
        id: prompts.id,
        name: prompts.name,
        description: prompts.description,
        similarity,
      })
      .from(prompts)
      .orderBy(desc(similarity))
      .limit(5);

    console.log('Results:');
    results.forEach(r => {
        console.log(`- ${r.name}`);
        console.log(`  ID: ${r.id}`);
        console.log(`  Similarity: ${r.similarity}`);
        console.log(`  Contains "${query}" in name? ${r.name.toLowerCase().includes(query.toLowerCase())}`);
        console.log(`  Contains "${query}" in desc? ${r.description.toLowerCase().includes(query.toLowerCase())}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

analyzeSearch("youtube");

