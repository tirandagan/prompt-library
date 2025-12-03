import * as dotenv from 'dotenv';
import { db } from '../src/db';
import { prompts } from '../src/db/schema';
import { isNotNull, count } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

async function checkEmbeddings() {
  try {
    const totalPrompts = await db.select({ count: count() }).from(prompts);
    const promptsWithEmbeddings = await db
      .select({ count: count() })
      .from(prompts)
      .where(isNotNull(prompts.embedding));

    console.log(`Total prompts: ${totalPrompts[0].count}`);
    console.log(`Prompts with embeddings: ${promptsWithEmbeddings[0].count}`);
    
    if (promptsWithEmbeddings[0].count === 0) {
        console.log("No embeddings found. Please run the embedding generation script.");
    }
    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

checkEmbeddings();

