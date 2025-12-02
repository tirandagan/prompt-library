"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, X, FolderKanban } from "lucide-react";

interface Category {
    id: number;
    slug: string;
    name: string;
    icon: string;
    description: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        icon: '',
        description: '',
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                // Update
                await fetch(`/api/admin/categories/${editingCategory.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                // Create
                await fetch('/api/admin/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            // Refresh categories
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
            
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category? This will also remove it from all associated prompts.')) return;

        try {
            await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            // Refresh categories
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                slug: category.slug,
                name: category.name,
                icon: category.icon,
                description: category.description || '',
            });
        } else {
            setEditingCategory(null);
            setFormData({ slug: '', name: '', icon: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ slug: '', name: '', icon: '', description: '' });
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Categories</h1>
                    <p className="text-muted-foreground mt-2">Manage prompt categories</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="text-left p-4 font-semibold">Icon</th>
                            <th className="text-left p-4 font-semibold">Name</th>
                            <th className="text-left p-4 font-semibold">Slug</th>
                            <th className="text-left p-4 font-semibold">Description</th>
                            <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                                <td className="p-4 text-3xl">{category.icon}</td>
                                <td className="p-4 font-medium text-foreground">{category.name}</td>
                                <td className="p-4 text-muted-foreground font-mono text-sm">{category.slug}</td>
                                <td className="p-4 text-sm text-muted-foreground max-w-md truncate">
                                    {category.description}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openModal(category)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {categories.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No categories yet. Create your first category to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={closeModal}>
                                <X className="w-6 h-6 text-muted-foreground hover:text-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm"
                                    required
                                    pattern="[a-z0-9-]+"
                                    title="Lowercase letters, numbers, and hyphens only"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-2xl"
                                    required
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingCategory ? 'Update' : 'Create'}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
