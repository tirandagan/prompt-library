import { db } from '../db/index';
import { categories, tools, prompts, tags, promptCategories, promptTools, promptTags } from '../db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await db.delete(promptTags);
        await db.delete(promptTools);
        await db.delete(promptCategories);
        await db.delete(prompts);
        await db.delete(tags);
        await db.delete(tools);
        await db.delete(categories);
        console.log('✅ Cleared existing data');

        // Seed categories
        console.log('📁 Seeding categories...');
        const categoriesData = await db.insert(categories).values([
            { slug: 'marketing', name: 'Marketing', icon: '📣', description: 'Marketing and social media prompts' },
            { slug: 'coding', name: 'Coding', icon: '💻', description: 'Programming and development prompts' },
            { slug: 'writing', name: 'Writing', icon: '✍️', description: 'Content writing and copywriting prompts' },
            { slug: 'productivity', name: 'Productivity', icon: '🚀', description: 'Productivity and workflow prompts' },
            { slug: 'image-gen', name: 'Image Gen', icon: '🎨', description: 'Image generation prompts' },
            { slug: 'seo', name: 'SEO', icon: '🔍', description: 'SEO and search optimization prompts' },
        ]).returning();
        console.log(`✅ Created ${categoriesData.length} categories`);

        // Seed tools
        console.log('🛠️  Seeding tools...');
        const toolsData = await db.insert(tools).values([
            { slug: 'chatgpt', name: 'ChatGPT', type: 'text', description: 'OpenAI ChatGPT' },
            { slug: 'claude', name: 'Claude', type: 'text', description: 'Anthropic Claude' },
            { slug: 'gemini', name: 'Gemini', type: 'text', description: 'Google Gemini' },
            { slug: 'midjourney', name: 'Midjourney', type: 'image', description: 'Midjourney AI' },
            { slug: 'stable-diffusion', name: 'Stable Diffusion', type: 'image', description: 'Stable Diffusion' },
            { slug: 'dall-e', name: 'DALL-E', type: 'image', description: 'OpenAI DALL-E' },
        ]).returning();
        console.log(`✅ Created ${toolsData.length} tools`);

        // Seed tags
        console.log('🏷️  Seeding tags...');
        const tagsData = await db.insert(tags).values([
            { slug: 'seo', name: 'SEO' },
            { slug: 'blogging', name: 'Blogging' },
            { slug: 'content-marketing', name: 'Content Marketing' },
            { slug: 'photography', name: 'Photography' },
            { slug: 'portrait', name: 'Portrait' },
            { slug: 'realism', name: 'Realism' },
            { slug: 'python', name: 'Python' },
            { slug: 'refactoring', name: 'Refactoring' },
            { slug: 'clean-code', name: 'Clean Code' },
            { slug: 'youtube', name: 'YouTube' },
            { slug: 'video', name: 'Video' },
            { slug: 'script', name: 'Script' },
            { slug: 'react', name: 'React' },
            { slug: 'typescript', name: 'TypeScript' },
            { slug: 'components', name: 'Components' },
            { slug: 'email', name: 'Email' },
            { slug: 'marketing', name: 'Marketing' },
            { slug: 'campaigns', name: 'Campaigns' },
            { slug: 'landscape', name: 'Landscape' },
            { slug: 'nature', name: 'Nature' },
            { slug: 'meetings', name: 'Meetings' },
            { slug: 'productivity', name: 'Productivity' },
            { slug: 'summaries', name: 'Summaries' },
        ]).returning();
        console.log(`✅ Created ${tagsData.length} tags`);

        // Seed prompts
        console.log('📝 Seeding prompts...');
        const promptsData = await db.insert(prompts).values([
            {
                slug: 'seo-blog-post-generator',
                name: 'SEO Blog Post Generator',
                description: 'Create a comprehensive, SEO-optimized blog post with proper heading structure and keyword integration.',
                promptText: `Act as an SEO expert and content writer. Write a comprehensive blog post about [TOPIC]. 

Requirements:
1. Use a catchy title with the primary keyword.
2. Include H2 and H3 subheadings for better structure.
3. Integrate the following keywords naturally: [KEYWORDS].
4. Aim for a reading level of grade 8.
5. Include a call to action at the end.
6. Write in a conversational yet professional tone.
7. Add relevant examples and statistics where appropriate.`,
                promptType: 'Generator',
                author: 'Alex Chen',
                likes: 342,
                views: 1205,
                isPublished: true,
            },
            {
                slug: 'midjourney-photorealistic-portrait',
                name: 'Midjourney Photorealistic Portrait',
                description: 'Generate stunningly realistic portraits with specific lighting and camera settings.',
                promptText: `/imagine prompt: a close-up portrait of a [SUBJECT], [LIGHTING] lighting, shot on 85mm lens, f/1.8, bokeh background, highly detailed skin texture, 8k resolution, cinematic color grading --v 5.2 --style raw --ar 2:3`,
                promptType: 'Direct',
                author: 'Sarah Jones',
                likes: 890,
                views: 5600,
                isPublished: true,
            },
            {
                slug: 'python-code-refactorer',
                name: 'Python Code Refactorer',
                description: 'Improve the quality, readability, and performance of your Python code.',
                promptText: `You are a senior Python developer with expertise in clean code principles and performance optimization. Review the following code and refactor it for better readability, performance, and adherence to PEP 8 standards.

Please:
1. Identify code smells and anti-patterns
2. Suggest improvements with explanations
3. Provide the refactored version
4. Highlight performance improvements

Code:
\`\`\`python
[PASTE CODE HERE]
\`\`\``,
                promptType: 'Refiner',
                author: 'DevMike',
                likes: 156,
                views: 430,
                isPublished: true,
            },
            {
                slug: 'youtube-video-script-writer',
                name: 'YouTube Video Script Writer',
                description: 'Create engaging scripts for YouTube videos including hooks, intros, and outros.',
                promptText: `Write a script for a YouTube video about [TOPIC]. 

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
                promptType: 'Generator',
                author: 'CreatorPro',
                likes: 210,
                views: 890,
                isPublished: true,
            },
            {
                slug: 'react-component-builder',
                name: 'React Component Builder',
                description: 'Generate modern, accessible React components with TypeScript and Tailwind CSS.',
                promptText: `Create a React component with the following specifications:

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
                promptType: 'Generator',
                author: 'ReactMaster',
                likes: 445,
                views: 1890,
                isPublished: true,
            },
            {
                slug: 'email-marketing-campaign',
                name: 'Email Marketing Campaign',
                description: 'Design a complete email marketing campaign with subject lines and body copy.',
                promptText: `Create an email marketing campaign for [PRODUCT/SERVICE].

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
                promptType: 'Generator',
                author: 'MarketingGuru',
                likes: 298,
                views: 1120,
                isPublished: true,
            },
            {
                slug: 'stable-diffusion-landscape',
                name: 'Stable Diffusion Landscape',
                description: 'Create breathtaking landscape images with detailed environmental descriptions.',
                promptText: `[LANDSCAPE_TYPE] landscape, [TIME_OF_DAY], [WEATHER_CONDITIONS], dramatic lighting, volumetric fog, highly detailed, 8k uhd, professional photography, golden hour, cinematic composition, depth of field, vibrant colors, masterpiece, trending on artstation --ar 16:9 --s 750`,
                promptType: 'Direct',
                author: 'ArtistAI',
                likes: 567,
                views: 3240,
                isPublished: true,
            },
            {
                slug: 'meeting-notes-summarizer',
                name: 'Meeting Notes Summarizer',
                description: 'Transform lengthy meeting transcripts into actionable summaries and next steps.',
                promptText: `Analyze the following meeting transcript and create a structured summary.

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
                promptType: 'Refiner',
                author: 'ProductivityPro',
                likes: 389,
                views: 1567,
                isPublished: true,
            },
        ]).returning();
        console.log(`✅ Created ${promptsData.length} prompts`);

        // Create relationships
        console.log('🔗 Creating relationships...');

        // Prompt 1: SEO Blog Post Generator
        await db.insert(promptCategories).values([
            { promptId: promptsData[0].id, categoryId: categoriesData[0].id }, // Marketing
            { promptId: promptsData[0].id, categoryId: categoriesData[5].id }, // SEO
            { promptId: promptsData[0].id, categoryId: categoriesData[2].id }, // Writing
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[0].id, toolId: toolsData[0].id }, // ChatGPT
            { promptId: promptsData[0].id, toolId: toolsData[1].id }, // Claude
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[0].id, tagId: tagsData[0].id }, // SEO
            { promptId: promptsData[0].id, tagId: tagsData[1].id }, // Blogging
            { promptId: promptsData[0].id, tagId: tagsData[2].id }, // Content Marketing
        ]);

        // Prompt 2: Midjourney Portrait
        await db.insert(promptCategories).values([
            { promptId: promptsData[1].id, categoryId: categoriesData[4].id }, // Image Gen
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[1].id, toolId: toolsData[3].id }, // Midjourney
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[1].id, tagId: tagsData[3].id }, // Photography
            { promptId: promptsData[1].id, tagId: tagsData[4].id }, // Portrait
            { promptId: promptsData[1].id, tagId: tagsData[5].id }, // Realism
        ]);

        // Prompt 3: Python Refactorer
        await db.insert(promptCategories).values([
            { promptId: promptsData[2].id, categoryId: categoriesData[1].id }, // Coding
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[2].id, toolId: toolsData[0].id }, // ChatGPT
            { promptId: promptsData[2].id, toolId: toolsData[1].id }, // Claude
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[2].id, tagId: tagsData[6].id }, // Python
            { promptId: promptsData[2].id, tagId: tagsData[7].id }, // Refactoring
            { promptId: promptsData[2].id, tagId: tagsData[8].id }, // Clean Code
        ]);

        // Prompt 4: YouTube Script
        await db.insert(promptCategories).values([
            { promptId: promptsData[3].id, categoryId: categoriesData[0].id }, // Marketing
            { promptId: promptsData[3].id, categoryId: categoriesData[2].id }, // Writing
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[3].id, toolId: toolsData[0].id }, // ChatGPT
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[3].id, tagId: tagsData[9].id }, // YouTube
            { promptId: promptsData[3].id, tagId: tagsData[10].id }, // Video
            { promptId: promptsData[3].id, tagId: tagsData[11].id }, // Script
        ]);

        // Prompt 5: React Component
        await db.insert(promptCategories).values([
            { promptId: promptsData[4].id, categoryId: categoriesData[1].id }, // Coding
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[4].id, toolId: toolsData[0].id }, // ChatGPT
            { promptId: promptsData[4].id, toolId: toolsData[1].id }, // Claude
            { promptId: promptsData[4].id, toolId: toolsData[2].id }, // Gemini
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[4].id, tagId: tagsData[12].id }, // React
            { promptId: promptsData[4].id, tagId: tagsData[13].id }, // TypeScript
            { promptId: promptsData[4].id, tagId: tagsData[14].id }, // Components
        ]);

        // Prompt 6: Email Marketing
        await db.insert(promptCategories).values([
            { promptId: promptsData[5].id, categoryId: categoriesData[0].id }, // Marketing
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[5].id, toolId: toolsData[0].id }, // ChatGPT
            { promptId: promptsData[5].id, toolId: toolsData[1].id }, // Claude
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[5].id, tagId: tagsData[15].id }, // Email
            { promptId: promptsData[5].id, tagId: tagsData[16].id }, // Marketing
            { promptId: promptsData[5].id, tagId: tagsData[17].id }, // Campaigns
        ]);

        // Prompt 7: Landscape
        await db.insert(promptCategories).values([
            { promptId: promptsData[6].id, categoryId: categoriesData[4].id }, // Image Gen
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[6].id, toolId: toolsData[4].id }, // Stable Diffusion
            { promptId: promptsData[6].id, toolId: toolsData[5].id }, // DALL-E
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[6].id, tagId: tagsData[18].id }, // Landscape
            { promptId: promptsData[6].id, tagId: tagsData[19].id }, // Nature
            { promptId: promptsData[6].id, tagId: tagsData[3].id }, // Photography
        ]);

        // Prompt 8: Meeting Summarizer
        await db.insert(promptCategories).values([
            { promptId: promptsData[7].id, categoryId: categoriesData[3].id }, // Productivity
        ]);
        await db.insert(promptTools).values([
            { promptId: promptsData[7].id, toolId: toolsData[0].id }, // ChatGPT
            { promptId: promptsData[7].id, toolId: toolsData[1].id }, // Claude
            { promptId: promptsData[7].id, toolId: toolsData[2].id }, // Gemini
        ]);
        await db.insert(promptTags).values([
            { promptId: promptsData[7].id, tagId: tagsData[20].id }, // Meetings
            { promptId: promptsData[7].id, tagId: tagsData[21].id }, // Productivity
            { promptId: promptsData[7].id, tagId: tagsData[22].id }, // Summaries
        ]);

        console.log('✅ Relationships created');
        console.log('✨ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
