import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';
import { executePrompt } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { promptText, provider } = await request.json();

        if (!promptText || !provider) {
            return NextResponse.json({ error: 'Missing promptText or provider' }, { status: 400 });
        }

        // Map tool name to provider key in db
        let dbProvider = provider.toLowerCase();
        if (dbProvider.includes('gpt') || dbProvider.includes('openai')) dbProvider = 'openai';
        else if (dbProvider.includes('claude') || dbProvider.includes('anthropic')) dbProvider = 'anthropic';
        else if (dbProvider.includes('gemini') || dbProvider.includes('google')) dbProvider = 'google';
        else {
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        // Fetch user's API key
        const [keyRecord] = await db
            .select()
            .from(apiKeys)
            .where(
                and(
                    eq(apiKeys.userId, user.id),
                    eq(apiKeys.provider, dbProvider)
                )
            )
            .limit(1);

        if (!keyRecord) {
            return NextResponse.json({ 
                error: `No API key found for ${dbProvider}. Please add one in your profile.` 
            }, { status: 404 });
        }

        // Decrypt key
        let decryptedKey: string;
        try {
            decryptedKey = decrypt(keyRecord.key);
        } catch (e) {
            console.error("Decryption failed", e);
            return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
        }

        // Execute prompt
        const response = await executePrompt(promptText, dbProvider, decryptedKey);

        return NextResponse.json({ result: response });

    } catch (error: any) {
        console.error('Execute prompt error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to execute prompt' },
            { status: 500 }
        );
    }
}

