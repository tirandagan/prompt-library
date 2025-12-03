"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast, useToast } from "@/components/ui/Toast";
import { Loader2, Plus, Trash2, Lock, Globe, FolderOpen, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface UserList {
    id: number;
    name: string;
    description: string | null;
    isPrivate: boolean;
    createdAt: Date;
    listPrompts: any[]; // Using any for simplicity as we just need length
}

interface UserListsClientProps {
    initialLists: UserList[];
    userId: number;
}

export default function UserListsClient({ initialLists, userId }: UserListsClientProps) {
    const [lists, setLists] = useState<UserList[]>(initialLists);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingList, setEditingList] = useState<UserList | null>(null);
    
    // Form states
    const [formData, setFormData] = useState({ name: "", description: "", isPrivate: true });
    
    const { showToast, toasts, removeToast } = useToast();
    const router = useRouter();

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to create list");

            const newList = await res.json();
            // Add empty listPrompts array to match type locally
            newList.listPrompts = []; 
            
            setLists([newList, ...lists]);
            showToast("List created successfully", "success");
            setIsCreateModalOpen(false);
            setFormData({ name: "", description: "", isPrivate: true });
        } catch (error) {
            showToast("Failed to create list", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !editingList) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/lists/${editingList.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to update list");

            const updatedList = await res.json();
            // Preserve existing relations if any (server returns updated fields)
            const newList = { ...editingList, ...updatedList };
            
            setLists(lists.map(l => l.id === editingList.id ? newList : l));
            showToast("List updated successfully", "success");
            setIsEditModalOpen(false);
            setEditingList(null);
        } catch (error) {
            showToast("Failed to update list", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteList = async (id: number) => {
        if (!confirm("Are you sure you want to delete this list?")) return;
        
        try {
            const res = await fetch(`/api/lists/${id}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) throw new Error("Failed to delete list");
            
            setLists(lists.filter(l => l.id !== id));
            showToast("List deleted", "success");
        } catch (error) {
            showToast("Failed to delete list", "error");
        }
    };

    const openEditModal = (list: UserList) => {
        setEditingList(list);
        setFormData({
            name: list.name,
            description: list.description || "",
            isPrivate: list.isPrivate
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">My Lists</h1>
                    <p className="text-muted-foreground mt-1">Organize your favorite prompts into collections.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create List
                </Button>
            </div>

            {lists.length === 0 ? (
                <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No lists yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first list to start organizing prompts you find useful.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        Create List
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lists.map(list => (
                        <div key={list.id} className="group relative bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.preventDefault(); openEditModal(list); }}
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleDeleteList(list.id); }}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <Link href={`/profile/lists/${list.id}`} className="block h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
                                        <FolderOpen className="w-6 h-6" />
                                    </div>
                                    <div className="pr-16"> {/* Space for actions */}
                                        {list.isPrivate ? (
                                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full w-fit">
                                                <Lock className="w-3 h-3" /> Private
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full w-fit">
                                                <Globe className="w-3 h-3" /> Public
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-foreground mb-1 truncate pr-4">{list.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                    {list.description || "No description"}
                                </p>
                                
                                <div className="flex items-center text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                                    <span className="font-medium text-foreground mr-1">{list.listPrompts?.length || 0}</span> prompts
                                    <span className="mx-2">•</span>
                                    <span>Updated {new Date(list.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New List">
                <form onSubmit={handleCreateList} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="e.g., Copywriting Prompts"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24"
                            placeholder="What's this list for?"
                        />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg flex-1 hover:bg-secondary/50 transition-colors">
                            <input 
                                type="radio" 
                                checked={formData.isPrivate} 
                                onChange={() => setFormData({ ...formData, isPrivate: true })}
                                className="accent-primary"
                            />
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 font-medium text-sm"><Lock className="w-3.5 h-3.5" /> Private</span>
                                <span className="text-xs text-muted-foreground">Only you can see this list</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg flex-1 hover:bg-secondary/50 transition-colors">
                            <input 
                                type="radio" 
                                checked={!formData.isPrivate} 
                                onChange={() => setFormData({ ...formData, isPrivate: false })}
                                className="accent-primary"
                            />
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 font-medium text-sm"><Globe className="w-3.5 h-3.5" /> Public</span>
                                <span className="text-xs text-muted-foreground">Anyone can see this list</span>
                            </div>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!formData.name.trim() || isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create List
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit List">
                <form onSubmit={handleUpdateList} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24"
                        />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg flex-1 hover:bg-secondary/50 transition-colors">
                            <input 
                                type="radio" 
                                checked={formData.isPrivate} 
                                onChange={() => setFormData({ ...formData, isPrivate: true })}
                                className="accent-primary"
                            />
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 font-medium text-sm"><Lock className="w-3.5 h-3.5" /> Private</span>
                                <span className="text-xs text-muted-foreground">Only you can see this list</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg flex-1 hover:bg-secondary/50 transition-colors">
                            <input 
                                type="radio" 
                                checked={!formData.isPrivate} 
                                onChange={() => setFormData({ ...formData, isPrivate: false })}
                                className="accent-primary"
                            />
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 font-medium text-sm"><Globe className="w-3.5 h-3.5" /> Public</span>
                                <span className="text-xs text-muted-foreground">Anyone can see this list</span>
                            </div>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!formData.name.trim() || isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

