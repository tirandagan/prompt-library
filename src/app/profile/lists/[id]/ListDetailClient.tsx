"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Trash2, Lock, Globe, FolderOpen, Calendar, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PromptCard } from "@/components/PromptCard";
import { Prompt } from "@/lib/data";

interface ListDetailClientProps {
    list: any; // DB type
    prompts: Prompt[]; // Mapped UI type
}

export default function ListDetailClient({ list, prompts: initialPrompts }: ListDetailClientProps) {
    const [prompts, setPrompts] = useState(initialPrompts);
    const { showToast } = useToast();
    const router = useRouter();

    const handleRemovePrompt = async (promptId: string) => {
        if (!confirm("Remove this prompt from the list?")) return;
        
        try {
            const res = await fetch(`/api/lists/${list.id}/prompts?promptId=${promptId}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) throw new Error("Failed to remove prompt");
            
            setPrompts(prompts.filter(p => p.id !== promptId));
            showToast("Prompt removed from list", "success");
        } catch (error) {
            showToast("Failed to remove prompt", "error");
        }
    };

    const handleDeleteList = async () => {
        if (!confirm("Are you sure you want to delete this list? This cannot be undone.")) return;
        
        try {
            const res = await fetch(`/api/lists/${list.id}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) throw new Error("Failed to delete list");
            
            showToast("List deleted", "success");
            router.push('/profile/lists');
        } catch (error) {
            showToast("Failed to delete list", "error");
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/profile/lists" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                    Back to My Lists
                </Link>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-foreground">{list.name}</h1>
                                    {list.isPrivate ? (
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            <Lock className="w-3 h-3" /> Private
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                            <Globe className="w-3 h-3" /> Public
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-lg mb-4">
                                    {list.description || "No description provided."}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    Created {new Date(list.createdAt).toLocaleDateString()}
                                    <span className="mx-2">•</span>
                                    {prompts.length} prompts
                                </div>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteList}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete List
                        </Button>
                    </div>
                </div>
            </div>

            {prompts.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm border-dashed">
                    <h3 className="text-xl font-semibold mb-2">This list is empty</h3>
                    <p className="text-muted-foreground mb-6">
                        Browse prompts and click the "Save" button to add them here.
                    </p>
                    <Link href="/">
                        <Button>Browse Prompts</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map(prompt => (
                        <div key={prompt.id} className="relative group">
                            <PromptCard prompt={prompt} />
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemovePrompt(prompt.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border"
                                title="Remove from list"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

