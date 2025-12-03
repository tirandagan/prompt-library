
import { db } from '../src/db';
import { prompts } from '../src/db/schema';
import { generateEmbedding } from '../src/lib/ai';
import { isNull, eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Manually set API key if not picked up from .env.local (debugging step)
if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not found in process.env, attempting to read .env.local manually');
    // Fallback manual read if needed, but dotenv usually works.
}

async function generateEmbeddingsForExistingPrompts() {
  console.log('🔄 Starting embedding generation for existing prompts...');

  try {
    // Find all prompts to update (forcing update for debugging)
    const promptsToUpdate = await db
      .select()
      .from(prompts);
      //.where(isNull(prompts.embedding));

    console.log(`Found ${promptsToUpdate.length} prompts to update.`);

    if (promptsToUpdate.length === 0) {
      console.log('✅ No prompts need embeddings.');
      process.exit(0);
    }

    for (const prompt of promptsToUpdate) {
      console.log(`Processing prompt: ${prompt.name} (ID: ${prompt.id})`);

      try {
        const embeddingText = `${prompt.name}\n${prompt.description}\n${prompt.promptText}`;
        const embedding = await generateEmbedding(embeddingText);

        await db
          .update(prompts)
          .set({ embedding })
          .where(eq(prompts.id, prompt.id));

        console.log(`✅ Updated embedding for: ${prompt.name}`);
        
        // Optional: Add a small delay to avoid rate limits if you have many prompts
        await new Promise(resolve => setTimeout(resolve, 200)); 
      } catch (err) {
        console.error(`❌ Failed to generate embedding for prompt ${prompt.id}:`, err);
      }
    }

    console.log('✨ Finished generating embeddings!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

generateEmbeddingsForExistingPrompts();

