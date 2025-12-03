"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, X, Wrench } from "lucide-react";

interface Tool {
    id: number;
    slug: string;
    name: string;
    type: string;
    description: string;
}

export default function ToolsPage() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        type: 'text',
        description: '',
    });

    useEffect(() => {
        const fetchTools = async () => {
            const res = await fetch('/api/admin/tools');
            const data = await res.json();
            setTools(data);
        };
        fetchTools();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTool) {
                // Update
                await fetch(`/api/admin/tools/${editingTool.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                // Create
                await fetch('/api/admin/tools', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            // Refresh tools
            const res = await fetch('/api/admin/tools');
            const data = await res.json();
            setTools(data);
            
            closeModal();
        } catch (error) {
            console.error('Error saving tool:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tool? This will also remove it from all associated prompts.')) return;

        try {
            await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
            // Refresh tools
            const res = await fetch('/api/admin/tools');
            const data = await res.json();
            setTools(data);
        } catch (error) {
            console.error('Error deleting tool:', error);
        }
    };

    const openModal = (tool?: Tool) => {
        if (tool) {
            setEditingTool(tool);
            setFormData({
                slug: tool.slug,
                name: tool.name,
                type: tool.type,
                description: tool.description || '',
            });
        } else {
            setEditingTool(null);
            setFormData({ slug: '', name: '', type: 'text', description: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTool(null);
        setFormData({ slug: '', name: '', type: 'text', description: '' });
    };

    // Auto-generate slug from name if slug is empty and we're creating
    useEffect(() => {
        if (!editingTool && formData.name && !formData.slug) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name, editingTool]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">Tools</h1>
                    <p className="text-muted-foreground mt-2">Manage compatible tools for prompts</p>
                </div>
                <Button onClick={() => openModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/30 border-b border-border">
                        <tr>
                            <th className="text-left p-4 font-semibold">Name</th>
                            <th className="text-left p-4 font-semibold">Type</th>
                            <th className="text-left p-4 font-semibold">Slug</th>
                            <th className="text-left p-4 font-semibold">Description</th>
                            <th className="text-left p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tools.map((tool) => (
                            <tr key={tool.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                                <td className="p-4 font-medium text-foreground">{tool.name}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${tool.type === 'text' ? 'bg-blue-100 text-blue-800' : 
                                          tool.type === 'image' ? 'bg-purple-100 text-purple-800' : 
                                          tool.type === 'video' ? 'bg-pink-100 text-pink-800' : 
                                          tool.type === 'code' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {tool.type}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground font-mono text-sm">{tool.slug}</td>
                                <td className="p-4 text-sm text-muted-foreground max-w-md truncate">
                                    {tool.description}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openModal(tool)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(tool.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tools.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No tools yet. Create your first tool to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingTool ? 'Edit Tool' : 'New Tool'}
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
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                                    required
                                >
                                    <option value="text">Text</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="code">Code</option>
                                    <option value="audio">Audio</option>
                                    <option value="other">Other</option>
                                </select>
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
                                    {editingTool ? 'Update' : 'Create'}
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

