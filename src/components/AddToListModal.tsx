"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check, Plus, Loader2, Lock, Globe, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface List {
    id: number;
    name: string;
    isPrivate: boolean;
    hasPrompt: boolean;
    count: number;
}

interface AddToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    promptId: string; // ID is string in frontend Prompt type, but number in DB. backend handles conversion if needed or we parse here. 
                      // Actually Prompt.id is string in data.ts. But backend expects int. 
                      // PromptDetailClient passes prompt.id which is string.
}

export function AddToListModal({ isOpen, onClose, promptId }: AddToListModalProps) {
    const { showToast } = useToast();
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [newListPrivate, setNewListPrivate] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLists();
        }
    }, [isOpen, promptId]);

    const fetchLists = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/lists?promptId=${promptId}`);
            if (res.ok) {
                const data = await res.json();
                setLists(data);
            } else {
                // If 401, maybe show login prompt? For now just empty.
                setLists([]);
            }
        } catch (error) {
            console.error("Failed to fetch lists", error);
            showToast("Failed to load your lists", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        setCreating(true);
        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newListName,
                    isPrivate: newListPrivate
                })
            });

            if (!res.ok) throw new Error("Failed to create list");

            const newList = await res.json();
            
            // Add prompt to the new list automatically
            await fetch(`/api/lists/${newList.id}/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promptId })
            });

            showToast("List created and prompt added!", "success");
            setNewListName("");
            setCreating(false);
            fetchLists(); // Refresh
        } catch (error) {
            showToast("Failed to create list", "error");
            setCreating(false);
        }
    };

    const toggleList = async (list: List) => {
        setTogglingId(list.id);
        try {
            if (list.hasPrompt) {
                // Remove
                const res = await fetch(`/api/lists/${list.id}/prompts?promptId=${promptId}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error();
                
                setLists(lists.map(l => l.id === list.id ? { ...l, hasPrompt: false, count: l.count - 1 } : l));
                showToast("Removed from list", "success");
            } else {
                // Add
                const res = await fetch(`/api/lists/${list.id}/prompts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ promptId })
                });
                if (!res.ok) throw new Error();
                
                setLists(lists.map(l => l.id === list.id ? { ...l, hasPrompt: true, count: l.count + 1 } : l));
                showToast("Added to list", "success");
            }
        } catch (error) {
            showToast("Failed to update list", "error");
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save to List">
            <div className="p-6">
                {/* Create new list form */}
                <form onSubmit={handleCreateList} className="mb-6 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Create new list..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Button type="submit" disabled={!newListName.trim() || creating}>
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                            <input 
                                type="radio" 
                                checked={newListPrivate} 
                                onChange={() => setNewListPrivate(true)}
                                className="accent-primary"
                            />
                            <Lock className="w-3 h-3" /> Private
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors">
                            <input 
                                type="radio" 
                                checked={!newListPrivate} 
                                onChange={() => setNewListPrivate(false)}
                                className="accent-primary"
                            />
                            <Globe className="w-3 h-3" /> Public
                        </label>
                    </div>
                </form>

                <div className="space-y-1 max-h-[300px] overflow-y-auto -mx-2 px-2">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : lists.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No lists yet. Create one above!
                        </div>
                    ) : (
                        lists.map(list => (
                            <button
                                key={list.id}
                                onClick={() => toggleList(list)}
                                disabled={togglingId === list.id}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group text-left"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 font-medium text-foreground">
                                        {list.name}
                                        {list.isPrivate ? (
                                            <Lock className="w-3 h-3 text-muted-foreground" />
                                        ) : (
                                            <Globe className="w-3 h-3 text-muted-foreground" />
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{list.count} prompts</span>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                    list.hasPrompt 
                                        ? "bg-primary border-primary text-primary-foreground" 
                                        : "border-muted-foreground/30 group-hover:border-primary/50"
                                )}>
                                    {togglingId === list.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : list.hasPrompt && (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
}

