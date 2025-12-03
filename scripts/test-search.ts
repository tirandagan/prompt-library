
import { searchPrompts } from '../src/app/actions/search';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Mock the Next.js server action environment somewhat
// This is a bit hacky as server actions are usually run in a specific context, 
// but for this DB logic it should work if we can import it.
// Actually, importing server actions directly in a standalone script can be tricky 
// because of "use server" directive processing. 
// Better to replicate the logic here for testing.

import { db } from '../src/db';
import { prompts } from '../src/db/schema';
import { generateEmbedding } from '../src/lib/ai';
import { desc, gt, sql } from 'drizzle-orm';

async function testSearch(query: string) {
  console.log(`🔎 Testing search for: "${query}"`);
  
  try {
    const embedding = await generateEmbedding(query);
    const similarity = sql<number>`1 - (${prompts.embedding} <=> ${JSON.stringify(embedding)}::vector)`;
    
    const results = await db
      .select({
        id: prompts.id,
        name: prompts.name,
        similarity,
      })
      .from(prompts)
      .orderBy(desc(similarity))
      .limit(5);

    console.log('Results:');
    results.forEach(r => {
        console.log(`- ${r.name} (Similarity: ${r.similarity})`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testSearch("blog posts");

