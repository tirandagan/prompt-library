"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Link as LinkIcon, FileText, X } from "lucide-react";
import Link from "next/link";
import { PromptForm, PromptFormData } from "@/components/admin/PromptForm";

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
    promptCategories: { categoryId: number }[];
    promptTools: { toolId: number }[];
    promptTags: { tagId: number }[];
}

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [filters, setFilters] = useState({
        published: 'all',
        search: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    const fetchPrompts = useCallback(async () => {
        const includeUnpublished = filters.published === 'all' || filters.published === 'draft';
        const res = await fetch(`/api/admin/prompts?includeUnpublished=${includeUnpublished}`);
        const data = await res.json();
        setPrompts(data);
    }, [filters.published]);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;

        try {
            await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
            fetchPrompts();
        } catch (error) {
            console.error('Error deleting prompt:', error);
        }
    };

    const handleTogglePublish = async (id: number, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/prompts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isPublished: !currentStatus,
                    publishedAt: !currentStatus ? new Date() : null,
                }),
            });
            fetchPrompts();
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    const openEditModal = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/prompts/${id}`);
            const data = await res.json();
            setEditingPrompt(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching prompt details:', error);
        }
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setEditingPrompt(null);
    };

    const handleUpdatePrompt = async (data: PromptFormData) => {
        if (!editingPrompt) return;

        try {
            const res = await fetch(`/api/admin/prompts/${editingPrompt.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    publishedAt: data.isPublished && !editingPrompt.isPublished ? new Date() : undefined,
                }),
            });

            if (res.ok) {
                fetchPrompts();
                closeEditModal();
            } else {
                const error = await res.json();
                alert('Error updating prompt: ' + error.error);
            }
        } catch (error) {
            console.error('Error updating prompt:', error);
            alert('Failed to update prompt');
        }
    };

    const filteredPrompts = prompts.filter((prompt) => {
        if (filters.search && !prompt.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.published === 'published' && !prompt.isPublished) return false;
        if (filters.published === 'draft' && prompt.isPublished) return false;
        return true;
    });

    // Transform API data to form data format
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

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Prompts</h1>
                    <p className="text-muted-foreground mt-2">Manage your prompt library</p>
                </div>
                <Link href="/admin/prompts/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prompt
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl border border-border p-4 mb-6 flex gap-4 flex-wrap">
                <select
                    value={filters.published}
                    onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Drafts Only</option>
                </select>

                <input
                    type="text"
                    placeholder="Search prompts..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                />

                <div className="text-sm text-muted-foreground flex items-center">
                    {filteredPrompts.length} prompt(s)
                </div>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                    <div key={prompt.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-lg line-clamp-2">{prompt.name}</h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {prompt.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`text-xs px-2 py-1 rounded ${
                                prompt.isPublished
                                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                                    : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                            }`}>
                                {prompt.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded border border-border">
                                {prompt.promptType}
                            </span>
                            {prompt.difficultyLevel && (
                                <span className="text-xs bg-secondary px-2 py-1 rounded border border-border capitalize">
                                    {prompt.difficultyLevel}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-border">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => openEditModal(prompt.id)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                            <Link href={`/admin/prompts/${prompt.id}/relationships`}>
                                <Button variant="ghost" size="sm" title="Manage relationships">
                                    <LinkIcon className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(prompt.id, prompt.isPublished)}
                                title={prompt.isPublished ? 'Unpublish' : 'Publish'}
                            >
                                {prompt.isPublished ? '📤' : '📥'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(prompt.id)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No prompts found</p>
                    <p className="text-sm">
                        {filters.search || filters.published !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first prompt to get started'}
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            {isModalOpen && editingPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-background rounded-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold">Edit Prompt</h2>
                            <button onClick={closeEditModal} className="p-2 hover:bg-secondary rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PromptForm
                                initialData={getInitialFormData(editingPrompt)}
                                onSubmit={handleUpdatePrompt}
                                onCancel={closeEditModal}
                                submitLabel="Update Prompt"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
