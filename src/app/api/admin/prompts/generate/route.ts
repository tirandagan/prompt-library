import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const { promptText } = await request.json();

        if (!promptText) {
            return NextResponse.json({ error: 'Prompt text is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING, description: "A short, descriptive title for the prompt" },
                        slug: { type: SchemaType.STRING, description: "URL-friendly slug based on the name" },
                        description: { type: SchemaType.STRING, description: "A concise description of what the prompt does" },
                        useCase: { type: SchemaType.STRING, description: "The primary use case (e.g., Content Creation, Coding)" },
                        industry: { type: SchemaType.STRING, description: "The target industry (e.g., Marketing, Tech)" },
                        difficultyLevel: { type: SchemaType.STRING, enum: ["beginner", "intermediate", "advanced"] },
                        promptType: { type: SchemaType.STRING, enum: ["Generator", "Direct", "Refiner"] },
                        tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of relevant tags" }
                    },
                    required: ["name", "slug", "description", "useCase", "industry", "difficultyLevel", "promptType", "tags"]
                }
            }
        });

        const systemInstruction = `You are an expert prompt engineer. Analyze the following prompt text and extract/generate metadata for it.
        
        Rules:
        1. Name: concise and descriptive.
        2. Slug: kebab-case, lowercase.
        3. Description: 1-2 sentences summarizing the purpose.
        4. Use Case: specific application.
        5. Industry: general sector.
        6. Difficulty: estimate based on complexity (beginner/intermediate/advanced).
        7. Type: infer if it generates content (Generator), gives direct answers (Direct), or refines input (Refiner).
        8. Tags: 3-5 relevant keywords.
        `;

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemInstruction + "\n\nPrompt Text:\n" + promptText }] }
            ]
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error generating prompt details:', error);
        return NextResponse.json({ error: 'Failed to generate details' }, { status: 500 });
    }
}
