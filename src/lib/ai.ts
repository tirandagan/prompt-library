import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";

// Create a custom Google provider instance to use the specific env var
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Validate API key presence for better error messages
if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
}

export type LLMProvider = "openai" | "claude" | "gemini";

const models: Record<LLMProvider, LanguageModel> = {
  openai: openai("gpt-4-turbo"),
  claude: anthropic("claude-3-5-sonnet-20240620"),
  gemini: google("models/gemini-2.5-flash"),
};

export const promptDetailsSchema = z.object({
  name: z.string().describe("A short, descriptive title for the prompt"),
  slug: z.string().describe("URL-friendly slug based on the name"),
  description: z.string().describe("A concise description of what the prompt does"),
  useCase: z.string().describe("The primary use case (e.g., Content Creation, Coding)"),
  industry: z.string().describe("The target industry (e.g., Marketing, Tech)"),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]).describe("The difficulty level of using the prompt"),
  promptType: z.enum(["Generator", "Direct", "Refiner"]).describe("The type of prompt"),
  tags: z.array(z.string()).describe("List of 3-5 relevant keywords"),
});

export async function generatePromptDetails(
  promptText: string,
  provider: LLMProvider = "gemini"
) {
  const model = models[provider];
  
  if (!model) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  const result = await generateObject({
    model,
    schema: promptDetailsSchema,
    system: `You are an expert prompt engineer. Analyze the prompt text and extract/generate metadata for it.
    
    Rules:
    1. Name: concise and descriptive.
    2. Slug: kebab-case, lowercase.
    3. Description: 1-2 sentences summarizing the purpose.
    4. Use Case: specific application.
    5. Industry: general sector.
    6. Difficulty: estimate based on complexity (beginner/intermediate/advanced).
    7. Type: infer if it generates content (Generator), gives direct answers (Direct), or refines input (Refiner).
    8. Tags: 3-5 relevant keywords.`,
    prompt: `Prompt Text:\n${promptText}`,
  });

  return result.object;
}

