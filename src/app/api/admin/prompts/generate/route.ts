import { NextResponse } from 'next/server';
import { generatePromptDetails } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const { promptText } = await request.json();

        if (!promptText) {
            return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
        }

        // Default to Gemini for now, but this can be configurable
        // You could pass a 'provider' query param or env var here
        const data = await generatePromptDetails(promptText, 'gemini');

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating prompt details:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate details' }, 
            { status: 500 }
        );
    }
}
