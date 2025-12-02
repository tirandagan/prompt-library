import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// For query purposes
const queryClient = postgres(process.env.DATABASE_URL, { ssl: 'require' });
export const db = drizzle(queryClient, { schema });

// For migrations
export const migrationClient = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'require' });
