"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PromptForm, PromptFormData } from "@/components/admin/PromptForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Prompt {
    id: number;
    name: string;
    description: string;
    promptText: string;
    slug: string;
    promptType: string;
    author: string;
    difficultyLevel?: string;
    useCase?: string;
    industry?: string;
    isPublished: boolean;
    createdAt: string;
    promptCategories: { categoryId: number; category: Category }[];
    promptTools: { toolId: number; tool: any }[];
    promptTags: { tagId: number; tag: any }[];
}

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [prompt, setPrompt] = useState<Prompt | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchPrompt = async () => {
            try {
                const res = await fetch(`/api/admin/prompts/${id}`);
                if (!res.ok) throw new Error("Failed to fetch prompt");
                const data = await res.json();
                setPrompt(data);
            } catch (error) {
                console.error("Error fetching prompt:", error);
                setErrorMessage("Failed to load prompt details");
                setErrorModalOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPrompt();
    }, [id]);

    const getInitialFormData = (prompt: Prompt): PromptFormData => ({
        name: prompt.name,
        slug: prompt.slug,
        description: prompt.description,
        promptText: prompt.promptText,
        promptType: prompt.promptType,
        author: prompt.author,
        difficultyLevel: prompt.difficultyLevel || 'intermediate',
        useCase: prompt.useCase || '',
        industry: prompt.industry || '',
        isPublished: prompt.isPublished,
        categories: prompt.promptCategories?.map(pc => pc.categoryId) || [],
        tools: prompt.promptTools?.map(pt => pt.toolId) || [],
        tags: prompt.promptTags?.map(pt => pt.tagId) || [],
    });

    const handleSubmit = async (data: PromptFormData) => {
        if (!prompt) return;

        try {
            const res = await fetch(`/api/admin/prompts/${prompt.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    publishedAt: data.isPublished && !prompt.isPublished ? new Date() : undefined,
                }),
            });

            if (res.ok) {
                router.push('/admin/prompts');
                router.refresh();
            } else {
                const error = await res.json();
                setErrorMessage(error.error || 'Failed to update prompt');
                setErrorModalOpen(true);
            }
        } catch (error) {
            console.error('Error updating prompt:', error);
            setErrorMessage('Failed to update prompt. Please try again.');
            setErrorModalOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!prompt) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Prompt Not Found</h1>
                <Link href="/admin/prompts">
                    <Button>Back to Prompts</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            <Link href="/admin/prompts" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Prompts
            </Link>

            <h1 className="text-4xl font-bold mb-8">Edit Prompt: {prompt.name}</h1>

            <PromptForm 
                initialData={getInitialFormData(prompt)}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/admin/prompts')}
                submitLabel="Update Prompt"
            />

            <Modal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Error"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground">{errorMessage}</p>
                    <div className="flex justify-end">
                        <Button onClick={() => setErrorModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

