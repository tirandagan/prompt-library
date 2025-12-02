import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('🔄 Running database migration...');

    try {
        // Create prompt_relationships table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS prompt_relationships (
                id serial PRIMARY KEY NOT NULL,
                source_prompt_id integer NOT NULL,
                target_prompt_id integer NOT NULL,
                relationship_type varchar(50) NOT NULL,
                description text,
                created_at timestamp DEFAULT now() NOT NULL
            )
        `);
        console.log('✅ Created prompt_relationships table');

        // Add new columns to prompts table
        await db.execute(sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS difficulty_level varchar(20)`);
        await db.execute(sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS use_case text`);
        await db.execute(sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS industry varchar(100)`);
        await db.execute(sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false`);
        await db.execute(sql`ALTER TABLE prompts ADD COLUMN IF NOT EXISTS published_at timestamp`);
        console.log('✅ Added new columns to prompts table');

        // Add foreign key constraints
        await db.execute(sql`
            ALTER TABLE prompt_relationships 
            DROP CONSTRAINT IF EXISTS prompt_relationships_source_prompt_id_prompts_id_fk
        `);
        await db.execute(sql`
            ALTER TABLE prompt_relationships 
            ADD CONSTRAINT prompt_relationships_source_prompt_id_prompts_id_fk 
            FOREIGN KEY (source_prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
        `);
        
        await db.execute(sql`
            ALTER TABLE prompt_relationships 
            DROP CONSTRAINT IF EXISTS prompt_relationships_target_prompt_id_prompts_id_fk
        `);
        await db.execute(sql`
            ALTER TABLE prompt_relationships 
            ADD CONSTRAINT prompt_relationships_target_prompt_id_prompts_id_fk 
            FOREIGN KEY (target_prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
        `);
        console.log('✅ Added foreign key constraints');

        // Update existing prompts to be published
        await db.execute(sql`UPDATE prompts SET is_published = true WHERE is_published IS NULL`);
        console.log('✅ Updated existing prompts to published status');

        // Make is_published NOT NULL after setting defaults
        await db.execute(sql`ALTER TABLE prompts ALTER COLUMN is_published SET NOT NULL`);
        console.log('✅ Set is_published to NOT NULL');

        console.log('✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
