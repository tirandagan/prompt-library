"use client";

import { useState } from "react";
import { PromptForm, PromptFormData } from "@/components/admin/PromptForm";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SignInModal } from "@/components/auth/SignInModal";

export default function SubmitPromptPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [isSignInOpen, setIsSignInOpen] = useState(false);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Sign in to Submit</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    You need to be signed in to submit a prompt. Your prompts will be reviewed by our team before being published.
                </p>
                <Button onClick={() => setIsSignInOpen(true)} size="lg">
                    Sign In
                </Button>
                <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
            </div>
        );
    }

    const handleSubmit = async (data: PromptFormData) => {
        try {
            const res = await fetch("/api/prompts/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                showToast("Prompt submitted successfully! It will be reviewed shortly.", "success");
                router.push("/"); // Redirect to home or dashboard
            } else {
                const error = await res.json();
                showToast(error.error || "Failed to submit prompt", "error");
            }
        } catch (error) {
            console.error("Error submitting prompt:", error);
            showToast("An unexpected error occurred", "error");
        }
    };

    return (
        <div className="container max-w-3xl py-12 px-4 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Submit a Prompt</h1>
                <p className="text-muted-foreground">
                    Share your best prompts with the community. All submissions are reviewed before publishing.
                </p>
            </div>

            <PromptForm
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                submitLabel="Submit for Review"
                showStatusToggle={false}
                initialData={{
                    name: '',
                    slug: '',
                    description: '',
                    whatItDoes: '',
                    tips: '',
                    promptText: '',
                    promptType: 'Generator',
                    author: user.name || '',
                    difficultyLevel: 'intermediate',
                    useCase: '',
                    industry: '',
                    isPublished: false,
                    categories: [],
                    tools: [],
                    tags: [],
                    images: [],
                }}
            />
        </div>
    );
}

