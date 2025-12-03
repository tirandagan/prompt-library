"use client";

import Link from "next/link";
import { Copy, Eye, Heart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Prompt } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Toast, useToast } from "@/components/ui/Toast";

interface PromptCardProps {
    prompt: Prompt;
    className?: string;
    onCopy?: (text: string) => void;
}

export function PromptCard({ prompt, className, onCopy }: PromptCardProps) {
    const { user } = useAuth();
    const { copy } = useCopyToClipboard();
    const { toasts, showToast, removeToast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(prompt.likes);

    // Sync with prop if it changes (e.g. re-fetch)
    useEffect(() => {
        setIsLiked(!!prompt.isLiked);
        setLikeCount(prompt.likes);
    }, [prompt.isLiked, prompt.likes]);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const success = await copy(prompt.text);
        if (success) {
            showToast("Prompt copied to clipboard!", "success");
            if (onCopy) {
                onCopy(prompt.text);
            }
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast("Please log in to like prompts", "error");
            return;
        }

        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likeCount;
        
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);

        try {
            const res = await fetch(`/api/prompts/${prompt.id}/like`, {
                method: 'POST'
            });
            
            if (!res.ok) {
                throw new Error('Failed to like');
            }
            
            const data = await res.json();
            // Sync with server truth
            setIsLiked(data.liked);
            setLikeCount(data.likes);
            
        } catch (error) {
            // Revert
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            showToast("Failed to update like", "error");
        }
    };

    return (
        <div className={cn(
            "group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20",
            className
        )}>
            {prompt.images && prompt.images.length > 0 && (
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl -mt-5 -mx-5 mb-5 w-[calc(100%+2.5rem)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={prompt.images[0].url} 
                        alt={prompt.images[0].altText || prompt.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                </div>
            )}
            <div className={cn(prompt.images && prompt.images.length > 0 ? "mt-0" : "")}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium">
                            {prompt.category}
                        </Badge>
                        {prompt.tools.map((tool) => (
                            <Badge key={tool} variant="outline" className="border-primary/20 text-primary bg-primary/5">
                                {tool}
                            </Badge>
                        ))}
                    </div>
                    {prompt.type === "Generator" && (
                        <div className="text-amber-500" title="Generator Prompt">
                            <Sparkles className="h-4 w-4 fill-current" />
                        </div>
                    )}
                </div>

                <Link href={`/prompt/${prompt.id}`} className="block group-hover:text-primary transition-colors">
                    <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-1 tracking-tight">{prompt.name}</h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-5 leading-relaxed">{prompt.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-400 ring-2 ring-background" />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-card-foreground">{prompt.author}</span>
                        <span className="text-[10px] text-muted-foreground">Pro User</span>
                    </div>
                </div>
                <div className="flex gap-1 items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full transition-colors",
                            isLiked
                                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        )}
                        onClick={handleLike}
                    >
                        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[2rem] text-center">{likeCount}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                        onClick={handleCopy}
                        title="Copy prompt"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Toast notifications */}
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
