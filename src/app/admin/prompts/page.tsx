"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Link as LinkIcon, FileText, X, LayoutGrid, List, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { PromptForm, PromptFormData } from "@/components/admin/PromptForm";
import { cn } from "@/lib/utils";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Prompt {
    id: number;
    name: string;
    description: string;
    whatItDoes?: string;
    tips?: string;
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
    promptImages?: { url: string; altText: string; position: number }[];
}

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState({
        published: 'all',
        search: '',
        category: 'all',
    });
    const [sort, setSort] = useState('createdAt_desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // ... (fetchData and other handlers remain same)

    const handleSort = (field: string) => {
        if (sort === `${field}_asc`) {
            setSort(`${field}_desc`);
        } else {
            setSort(`${field}_asc`);
        }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sort === `${field}_asc`) return <ArrowUp className="w-4 h-4 ml-1" />;
        if (sort === `${field}_desc`) return <ArrowDown className="w-4 h-4 ml-1" />;
        return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    };

    const fetchData = useCallback(async () => {
        const includeUnpublished = filters.published === 'all' || filters.published === 'draft';
        
        // Fetch prompts and categories in parallel
        const [promptsRes, categoriesRes] = await Promise.all([
            fetch(`/api/admin/prompts?includeUnpublished=${includeUnpublished}`),
            fetch('/api/admin/categories')
        ]);

        const promptsData = await promptsRes.json();
        const categoriesData = await categoriesRes.json();

        setPrompts(promptsData);
        setCategories(categoriesData);
    }, [filters.published]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this prompt?')) return;

        try {
            await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
            fetchData();
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
            fetchData();
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
                fetchData();
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

    const filteredPrompts = prompts
        .filter((prompt) => {
            // Search filter
            if (filters.search && !prompt.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            // Published status filter
            if (filters.published === 'published' && !prompt.isPublished) return false;
            if (filters.published === 'draft' && prompt.isPublished) return false;
            
            // Category filter
            if (filters.category !== 'all') {
                const categoryId = parseInt(filters.category);
                if (!prompt.promptCategories?.some(pc => pc.categoryId === categoryId)) {
                    return false;
                }
            }
            
            return true;
        })
        .sort((a, b) => {
            // Sort
            switch (sort) {
                case 'createdAt_desc':
                case 'newest': // legacy support
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'createdAt_asc':
                case 'oldest': // legacy support
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name_asc':
                case 'az': // legacy support
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                case 'za': // legacy support
                    return b.name.localeCompare(a.name);
                case 'isPublished_asc':
                    return Number(a.isPublished) - Number(b.isPublished);
                case 'isPublished_desc':
                    return Number(b.isPublished) - Number(a.isPublished);
                case 'promptType_asc':
                    return a.promptType.localeCompare(b.promptType);
                case 'promptType_desc':
                    return b.promptType.localeCompare(a.promptType);
                default:
                    return 0;
            }
        });

    // Transform API data to form data format
    const getInitialFormData = (prompt: Prompt): PromptFormData => ({
        name: prompt.name,
        slug: prompt.slug,
        description: prompt.description,
        whatItDoes: prompt.whatItDoes || '',
        tips: prompt.tips || '',
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
        images: prompt.promptImages?.sort((a, b) => a.position - b.position) || [],
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

            {/* Controls Bar */}
            <div className="bg-card rounded-xl border border-border p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 flex-1 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        />
                    </div>

                    <select
                        value={filters.published}
                        onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                    </select>

                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm max-w-[200px]"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                        <option value="createdAt_desc">Newest First</option>
                        <option value="createdAt_asc">Oldest First</option>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                        <option value="isPublished_asc">Status (Draft First)</option>
                        <option value="isPublished_desc">Status (Published First)</option>
                        <option value="promptType_asc">Type (A-Z)</option>
                        <option value="promptType_desc">Type (Z-A)</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 border-l pl-4 border-border">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''}
            </div>

            {/* Prompts View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <div key={prompt.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-lg line-clamp-2" title={prompt.name}>{prompt.name}</h3>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                {prompt.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded border",
                                    prompt.isPublished
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                )}>
                                    {prompt.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <span className="text-xs bg-secondary px-2 py-1 rounded border border-border">
                                    {prompt.promptType}
                                </span>
                                {prompt.promptCategories.slice(0, 2).map((pc) => (
                                    <span key={pc.categoryId} className="text-xs bg-secondary px-2 py-1 rounded border border-border">
                                        {pc.category.name}
                                    </span>
                                ))}
                                {prompt.promptCategories.length > 2 && (
                                    <span className="text-xs text-muted-foreground px-1 self-center">+{prompt.promptCategories.length - 2}</span>
                                )}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-border mt-auto">
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
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 font-medium">
                                        <button onClick={() => handleSort('name')} className="flex items-center hover:text-foreground transition-colors">
                                            Name <SortIcon field="name" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        <button onClick={() => handleSort('isPublished')} className="flex items-center hover:text-foreground transition-colors">
                                            Status <SortIcon field="isPublished" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">
                                        <button onClick={() => handleSort('promptType')} className="flex items-center hover:text-foreground transition-colors">
                                            Type <SortIcon field="promptType" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 font-medium">Categories</th>
                                    <th className="px-6 py-3 font-medium">
                                        <button onClick={() => handleSort('createdAt')} className="flex items-center hover:text-foreground transition-colors">
                                            Created <SortIcon field="createdAt" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredPrompts.map((prompt) => (
                                    <tr key={prompt.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            <div className="font-semibold">{prompt.name}</div>
                                            <div className="text-muted-foreground text-xs truncate max-w-[300px]">{prompt.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded border inline-flex items-center",
                                                prompt.isPublished
                                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                    : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                            )}>
                                                {prompt.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs bg-secondary px-2 py-1 rounded border border-border">
                                                {prompt.promptType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {prompt.promptCategories.map((pc) => (
                                                    <span key={pc.categoryId} className="text-xs bg-secondary px-2 py-1 rounded border border-border">
                                                        {pc.category.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(prompt.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8"
                                                    onClick={() => openEditModal(prompt.id)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Link href={`/admin/prompts/${prompt.id}/relationships`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Manage relationships">
                                                        <LinkIcon className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleTogglePublish(prompt.id, prompt.isPublished)}
                                                    title={prompt.isPublished ? 'Unpublish' : 'Publish'}
                                                >
                                                    {prompt.isPublished ? '📤' : '📥'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleDelete(prompt.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredPrompts.length === 0 && (
                <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No prompts found</p>
                    <p className="text-sm">
                        {filters.search || filters.published !== 'all' || filters.category !== 'all'
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
