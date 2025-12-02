"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PromptForm, PromptFormData } from "@/components/admin/PromptForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function NewPromptPage() {
    const router = useRouter();
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (data: PromptFormData) => {
        try {
            const res = await fetch('/api/admin/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    publishedAt: data.isPublished ? new Date() : null,
                }),
            });

            if (res.ok) {
                router.push('/admin/prompts');
            } else {
                const error = await res.json();
                setErrorMessage(error.error || 'Failed to create prompt');
                setErrorModalOpen(true);
            }
        } catch (error) {
            console.error('Error submitting prompt:', error);
            setErrorMessage('Failed to create prompt. Please try again.');
            setErrorModalOpen(true);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <Link href="/admin/prompts" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Prompts
            </Link>

            <h1 className="text-4xl font-bold mb-8">Create New Prompt</h1>

            <PromptForm 
                onSubmit={handleSubmit}
                onCancel={() => router.push('/admin/prompts')}
                submitLabel="Create Prompt"
            />

            <Modal
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                title="Error Creating Prompt"
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
