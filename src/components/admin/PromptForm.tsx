"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Wand2, Check, X, Loader2 } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { TagInput, Tag } from "./TagInput";
import { useAuth } from "@/contexts/AuthContext";

export interface PromptFormData {
    name: string;
    slug: string;
    description: string;
    whatItDoes: string;
    tips: string;
    promptText: string;
    promptType: string;
    author: string;
    difficultyLevel: string;
    useCase: string;
    industry: string;
    isPublished: boolean;
    categories: number[];
    tools: number[];
    tags: number[];
}

interface Category {
    id: number;
    name: string;
}

interface Tool {
    id: number;
    name: string;
}

interface PromptFormProps {
    initialData?: PromptFormData;
    onSubmit: (data: PromptFormData) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    showStatusToggle?: boolean;
}

export function PromptForm({ initialData, onSubmit, onCancel, submitLabel = "Save", showStatusToggle = true }: PromptFormProps) {
    const [formData, setFormData] = useState<PromptFormData>(initialData || {
        name: '',
        slug: '',
        description: '',
        whatItDoes: '',
        tips: '',
        promptText: '',
        promptType: 'Generator',
        author: '',
        difficultyLevel: 'intermediate',
        useCase: '',
        industry: '',
        isPublished: false,
        categories: [],
        tools: [],
        tags: [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [tools, setTools] = useState<Tool[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [pendingSuggestions, setPendingSuggestions] = useState<Partial<PromptFormData> | null>(null);
    const { toasts, showToast, removeToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchResources();
    }, []);

    // Set default author for new prompts
    useEffect(() => {
        if (!initialData && user?.name && !formData.author) {
            setFormData(prev => ({ ...prev, author: user.name || '' }));
        }
    }, [user?.name, initialData]);

    // Update form data if initialData changes (e.g. when opening modal with different prompt)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const fetchResources = async () => {
        try {
            const [categoriesRes, resourcesRes] = await Promise.all([
                fetch('/api/admin/categories'),
                fetch('/api/admin/resources'),
            ]);

            const categoriesData = await categoriesRes.json();
            const resourcesData = await resourcesRes.json();

            setCategories(categoriesData);
            setTools(resourcesData.tools);
            setTags(resourcesData.tags);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    // Auto-generate slug from name only if it's a new prompt (no initialData) or if slug is empty
    useEffect(() => {
        if (!initialData && formData.name && !formData.slug) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (field: keyof Pick<PromptFormData, 'categories' | 'tools' | 'tags'>, id: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(id)
                ? prev[field].filter(i => i !== id)
                : [...prev[field], id]
        }));
    };

    const createTag = async (name: string): Promise<Tag | null> => {
        try {
            const res = await fetch('/api/admin/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            
            if (!res.ok) throw new Error('Failed to create tag');
            
            const newTag = await res.json();
            
            // Add to local state if not already present
            setTags(prev => {
                if (prev.some(t => t.id === newTag.id)) return prev;
                return [...prev, newTag];
            });
            
            return newTag;
        } catch (error) {
            console.error('Error creating tag:', error);
            showToast('Failed to create tag', 'error');
            return null;
        }
    };

    const handleAutoPopulate = async () => {
        if (!formData.promptText) return;
        
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/prompts/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptText: formData.promptText }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate details');
            }
            
            const data = await res.json();
            
            const suggestions: Partial<PromptFormData> = {};
            const conflicts: Partial<PromptFormData> = {};
            
            // Process tags if available
            if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
                const newTagIds: number[] = [];
                
                for (const tagName of data.tags) {
                    // Check if tag exists (case insensitive)
                    const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
                    
                    if (existingTag) {
                        if (!newTagIds.includes(existingTag.id)) {
                            newTagIds.push(existingTag.id);
                        }
                    } else {
                        // Create new tag
                        const newTag = await createTag(tagName);
                        if (newTag && !newTagIds.includes(newTag.id)) {
                            newTagIds.push(newTag.id);
                        }
                    }
                }
                
                // Add existing selected tags
                const uniqueTagIds = Array.from(new Set([...formData.tags, ...newTagIds]));
                
                if (uniqueTagIds.length > formData.tags.length) {
                    // We have new tags to add
                    suggestions['tags'] = uniqueTagIds;
                }
            }

            // Helper to check if field should be updated
            const checkField = (key: keyof PromptFormData, value: unknown) => {
                if (!value) return;
                
                const currentValue = formData[key];
                
                // Check if current value is empty/falsy
                if (
                    currentValue === '' || 
                    currentValue === null || 
                    currentValue === undefined ||
                    (Array.isArray(currentValue) && currentValue.length === 0) ||
                    (key === 'difficultyLevel' && currentValue === '')
                ) {
                    // @ts-expect-error - value type is unknown but we trust the API response structure matches
                    suggestions[key] = value;
                } else if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
                    // @ts-expect-error - value type is unknown but we trust the API response structure matches
                    conflicts[key] = value;
                }
            };

            checkField('name', data.name);
            checkField('slug', data.slug);
            checkField('description', data.description);
            checkField('whatItDoes', data.whatItDoes);
            checkField('tips', data.tips);
            checkField('useCase', data.useCase);
            checkField('industry', data.industry);
            checkField('difficultyLevel', data.difficultyLevel);
            checkField('promptType', data.promptType);
            // checkField('author', 'AI Generated'); // specific requirement: keep logged in user as author

            // Apply non-conflicting changes immediately
            if (Object.keys(suggestions).length > 0) {
                setFormData(prev => ({ ...prev, ...suggestions }));
            }

            // If conflicts exist, show review UI
            if (Object.keys(conflicts).length > 0) {
                setPendingSuggestions(conflicts);
            }

        } catch (error) {
            console.error('Error auto-populating:', error);
            showToast(error instanceof Error ? error.message : 'Failed to generate details', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const acceptSuggestion = (key: keyof PromptFormData) => {
        if (!pendingSuggestions) return;
        setFormData(prev => ({ ...prev, [key]: pendingSuggestions[key] }));
        const newPending = { ...pendingSuggestions };
        delete newPending[key];
        if (Object.keys(newPending).length === 0) {
            setPendingSuggestions(null);
        } else {
            setPendingSuggestions(newPending);
        }
    };

    const rejectSuggestion = (key: keyof PromptFormData) => {
        if (!pendingSuggestions) return;
        const newPending = { ...pendingSuggestions };
        delete newPending[key];
        if (Object.keys(newPending).length === 0) {
            setPendingSuggestions(null);
        } else {
            setPendingSuggestions(newPending);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative">
            {pendingSuggestions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-xl font-semibold">Review AI Suggestions</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                Some fields already have content. Choose which AI suggestions to accept.
                            </p>
                        </div>
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {Object.entries(pendingSuggestions).map(([key, value]) => (
                                <div key={key} className="bg-secondary/30 rounded-lg p-4 border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => rejectSuggestion(key as keyof PromptFormData)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Keep Current
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => acceptSuggestion(key as keyof PromptFormData)}
                                                className="bg-primary text-primary-foreground"
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Current</span>
                                            <div className="p-2 bg-background rounded border border-border">
                                                {/* @ts-expect-error - accessing dynamic key on formData */}
                                                {String(formData[key])}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider text-primary">Suggested</span>
                                            <div className="p-2 bg-primary/10 rounded border border-primary/20 text-foreground">
                                                {String(value)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-card">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPendingSuggestions(null)}
                            >
                                Cancel Review
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, ...pendingSuggestions }));
                                    setPendingSuggestions(null);
                                }}
                            >
                                Accept All Remaining
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Slug *</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background font-mono text-sm"
                            required
                            pattern="[a-z0-9-]+"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            rows={3}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">What this prompt does</label>
                        <textarea
                            value={formData.whatItDoes}
                            onChange={(e) => setFormData({ ...formData, whatItDoes: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            rows={3}
                            placeholder="Detailed explanation of what the prompt achieves..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Tips</label>
                        <textarea
                            value={formData.tips}
                            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            rows={3}
                            placeholder="Tips for using this prompt effectively..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium">Prompt Text *</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAutoPopulate}
                                disabled={generating || !formData.promptText}
                                className="h-8 text-xs"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-3 h-3 mr-2" />
                                        Auto-populate
                                    </>
                                )}
                            </Button>
                        </div>
                        <textarea
                            value={formData.promptText}
                            onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background font-mono text-sm"
                            rows={10}
                            required
                            placeholder="Enter the prompt text..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type *</label>
                            <select
                                value={formData.promptType}
                                onChange={(e) => setFormData({ ...formData, promptType: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                                required
                            >
                                <option value="Generator">Generator</option>
                                <option value="Direct">Direct</option>
                                <option value="Refiner">Refiner</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Difficulty</label>
                            <select
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            >
                                <option value="">Not specified</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Author *</label>
                        <input
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Use Case</label>
                        <input
                            type="text"
                            value={formData.useCase}
                            onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            placeholder="e.g., Content creation, Code review, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Industry</label>
                        <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                            placeholder="e.g., Marketing, Technology, etc."
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50">
                            <input
                                type="checkbox"
                                checked={formData.categories.includes(cat.id)}
                                onChange={() => toggleSelection('categories', cat.id)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tools */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Compatible Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tools.map((tool) => (
                        <label key={tool.id} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50">
                            <input
                                type="checkbox"
                                checked={formData.tools.includes(tool.id)}
                                onChange={() => toggleSelection('tools', tool.id)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">{tool.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <TagInput
                    selectedTagIds={formData.tags}
                    availableTags={tags}
                    onTagsChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
                    onCreateTag={createTag}
                />
            </div>

            {/* Publishing */}
            {showStatusToggle && (
                <div className="bg-card rounded-xl border border-border p-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-5 h-5 rounded"
                        />
                        <div>
                            <p className="font-medium">Publish immediately</p>
                            <p className="text-sm text-muted-foreground">Make this prompt visible to users right away</p>
                        </div>
                    </label>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : submitLabel}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancel
                </Button>
            </div>

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </form>
    );
}
