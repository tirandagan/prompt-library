import { db } from './src/db/index';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrateProfile() {
    console.log('🔄 Running profile migration...');

    try {
        // Add new columns to users table
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`);
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text`);
        console.log('✅ Added new columns to users table');

        // Create api_keys table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS api_keys (
                id serial PRIMARY KEY NOT NULL,
                user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider varchar(50) NOT NULL,
                key text NOT NULL,
                label varchar(100),
                created_at timestamp DEFAULT now() NOT NULL,
                updated_at timestamp DEFAULT now() NOT NULL
            )
        `);
        console.log('✅ Created api_keys table');

        console.log('✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateProfile();

