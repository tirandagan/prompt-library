export type Prompt = {
    id: string;
    name: string;
    description: string;
    text: string;
    category: string;
    tools: string[];
    type: "Direct" | "Generator" | "Refiner";
    author: string;
    likes: number;
    views: number;
    tags: string[];
    isLiked?: boolean;
};

export const CATEGORIES = [
    { id: "marketing", name: "Marketing", count: 120, icon: "📣" },
    { id: "coding", name: "Coding", count: 85, icon: "💻" },
    { id: "writing", name: "Writing", count: 200, icon: "✍️" },
    { id: "productivity", name: "Productivity", count: 64, icon: "🚀" },
    { id: "image-gen", name: "Image Gen", count: 150, icon: "🎨" },
    { id: "seo", name: "SEO", count: 45, icon: "🔍" },
];

export const TOOLS = [
    { id: "chatgpt", name: "ChatGPT", type: "text" },
    { id: "midjourney", name: "Midjourney", type: "image" },
    { id: "claude", name: "Claude", type: "text" },
    { id: "stable-diffusion", name: "Stable Diffusion", type: "image" },
    { id: "gemini", name: "Gemini", type: "text" },
    { id: "dall-e", name: "DALL-E", type: "image" },
];

export const MOCK_PROMPTS: Prompt[] = [
    {
        id: "1",
        name: "SEO Blog Post Generator",
        description: "Create a comprehensive, SEO-optimized blog post with proper heading structure and keyword integration.",
        text: `Act as an SEO expert and content writer. Write a comprehensive blog post about [TOPIC]. 

Requirements:
1. Use a catchy title with the primary keyword.
2. Include H2 and H3 subheadings for better structure.
3. Integrate the following keywords naturally: [KEYWORDS].
4. Aim for a reading level of grade 8.
5. Include a call to action at the end.
6. Write in a conversational yet professional tone.
7. Add relevant examples and statistics where appropriate.`,
        category: "Marketing",
        tools: ["ChatGPT", "Claude"],
        type: "Generator",
        author: "Alex Chen",
        likes: 342,
        views: 1205,
        tags: ["SEO", "Blogging", "Content Marketing"],
    },
    {
        id: "2",
        name: "Midjourney Photorealistic Portrait",
        description: "Generate stunningly realistic portraits with specific lighting and camera settings.",
        text: `/imagine prompt: a close-up portrait of a [SUBJECT], [LIGHTING] lighting, shot on 85mm lens, f/1.8, bokeh background, highly detailed skin texture, 8k resolution, cinematic color grading --v 5.2 --style raw --ar 2:3`,
        category: "Image Gen",
        tools: ["Midjourney"],
        type: "Direct",
        author: "Sarah Jones",
        likes: 890,
        views: 5600,
        tags: ["Photography", "Portrait", "Realism"],
    },
    {
        id: "3",
        name: "Python Code Refactorer",
        description: "Improve the quality, readability, and performance of your Python code.",
        text: `You are a senior Python developer with expertise in clean code principles and performance optimization. Review the following code and refactor it for better readability, performance, and adherence to PEP 8 standards.

Please:
1. Identify code smells and anti-patterns
2. Suggest improvements with explanations
3. Provide the refactored version
4. Highlight performance improvements

Code:
\`\`\`python
[PASTE CODE HERE]
\`\`\``,
        category: "Coding",
        tools: ["ChatGPT", "Claude"],
        type: "Refiner",
        author: "DevMike",
        likes: 156,
        views: 430,
        tags: ["Python", "Refactoring", "Clean Code"],
    },
    {
        id: "4",
        name: "YouTube Video Script Writer",
        description: "Create engaging scripts for YouTube videos including hooks, intros, and outros.",
        text: `Write a script for a YouTube video about [TOPIC]. 

Structure:
1. Hook (0-15s): Grab attention immediately with a compelling question or statement.
2. Intro (15-30s): Briefly explain what the video is about and what viewers will learn.
3. Body (Main Content):
   - Point 1: [Main idea with examples]
   - Point 2: [Main idea with examples]
   - Point 3: [Main idea with examples]
4. Conclusion: Summarize key takeaways.
5. Outro: Call to subscribe, like, and comment.

Target audience: [AUDIENCE]
Video length: [DURATION] minutes
Tone: Energetic and engaging`,
        category: "Marketing",
        tools: ["ChatGPT"],
        type: "Generator",
        author: "CreatorPro",
        likes: 210,
        views: 890,
        tags: ["YouTube", "Video", "Script"],
    },
    {
        id: "5",
        name: "React Component Builder",
        description: "Generate modern, accessible React components with TypeScript and Tailwind CSS.",
        text: `Create a React component with the following specifications:

Component: [COMPONENT_NAME]
Description: [COMPONENT_DESCRIPTION]

Requirements:
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Make it accessible (ARIA labels, keyboard navigation)
- Include prop types and documentation
- Add error handling where appropriate
- Follow React best practices (hooks, composition)

Please provide:
1. The component code
2. Usage example
3. Props interface documentation`,
        category: "Coding",
        tools: ["ChatGPT", "Claude", "Gemini"],
        type: "Generator",
        author: "ReactMaster",
        likes: 445,
        views: 1890,
        tags: ["React", "TypeScript", "Components"],
    },
    {
        id: "6",
        name: "Email Marketing Campaign",
        description: "Design a complete email marketing campaign with subject lines and body copy.",
        text: `Create an email marketing campaign for [PRODUCT/SERVICE].

Campaign Details:
- Target Audience: [AUDIENCE]
- Campaign Goal: [GOAL - e.g., conversions, awareness, engagement]
- Number of Emails: [NUMBER]

For each email, provide:
1. Subject Line (with 2-3 variations for A/B testing)
2. Preview Text
3. Email Body (HTML-friendly format)
4. Call-to-Action
5. Send timing recommendation

Tone: [TONE - e.g., professional, casual, urgent]
Brand Voice: [BRAND_VOICE]`,
        category: "Marketing",
        tools: ["ChatGPT", "Claude"],
        type: "Generator",
        author: "MarketingGuru",
        likes: 298,
        views: 1120,
        tags: ["Email", "Marketing", "Campaigns"],
    },
    {
        id: "7",
        name: "Stable Diffusion Landscape",
        description: "Create breathtaking landscape images with detailed environmental descriptions.",
        text: `[LANDSCAPE_TYPE] landscape, [TIME_OF_DAY], [WEATHER_CONDITIONS], dramatic lighting, volumetric fog, highly detailed, 8k uhd, professional photography, golden hour, cinematic composition, depth of field, vibrant colors, masterpiece, trending on artstation --ar 16:9 --s 750`,
        category: "Image Gen",
        tools: ["Stable Diffusion", "DALL-E"],
        type: "Direct",
        author: "ArtistAI",
        likes: 567,
        views: 3240,
        tags: ["Landscape", "Nature", "Photography"],
    },
    {
        id: "8",
        name: "Meeting Notes Summarizer",
        description: "Transform lengthy meeting transcripts into actionable summaries and next steps.",
        text: `Analyze the following meeting transcript and create a structured summary.

Meeting Transcript:
[PASTE TRANSCRIPT HERE]

Please provide:
1. **Executive Summary** (2-3 sentences)
2. **Key Discussion Points** (bullet points)
3. **Decisions Made** (with who decided)
4. **Action Items** (with assigned person and deadline if mentioned)
5. **Follow-up Questions** (unresolved items)
6. **Next Meeting Agenda Items**

Format the output in a clear, scannable format suitable for sharing with stakeholders.`,
        category: "Productivity",
        tools: ["ChatGPT", "Claude", "Gemini"],
        type: "Refiner",
        author: "ProductivityPro",
        likes: 389,
        views: 1567,
        tags: ["Meetings", "Productivity", "Summaries"],
    },
];
