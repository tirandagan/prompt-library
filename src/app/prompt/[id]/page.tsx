"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_PROMPTS } from "@/lib/data";
import { ArrowLeft, Copy, Eye, Heart, Share2, Terminal, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Toast, useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function PromptDetailPage({ params }: PageProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const { copy, copiedText } = useCopyToClipboard();
    const { toasts, showToast, removeToast } = useToast();
    const [isLiked, setIsLiked] = useState(false);

    // Resolve params
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return null; // Loading state
    }

    const prompt = MOCK_PROMPTS.find((p) => p.id === resolvedParams.id);

    if (!prompt) {
        notFound();
    }

    const handleCopy = async () => {
        const success = await copy(prompt.text);
        if (success) {
            showToast("Prompt copied to clipboard!", "success");
        } else {
            showToast("Failed to copy prompt", "error");
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: prompt.name,
                text: prompt.description,
                url: window.location.href,
            });
        } else {
            copy(window.location.href);
            showToast("Link copied to clipboard!", "success");
        }
    };

    return (
        <main className="min-h-screen bg-background">

            <div className="container mx-auto px-4 py-8 md:py-12">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                    Back to Browse
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent">
                                    {prompt.category}
                                </Badge>
                                {prompt.tools.map((tool) => (
                                    <Badge key={tool} variant="outline" className="border-border text-muted-foreground">
                                        {tool}
                                    </Badge>
                                ))}
                                <Badge variant="outline" className="ml-auto border-border text-muted-foreground font-mono text-xs uppercase tracking-wider">
                                    {prompt.type}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">{prompt.name}</h1>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{prompt.description}</p>

                            <div className="relative group rounded-xl overflow-hidden border border-border shadow-sm">
                                <div className="absolute top-0 right-0 p-3 flex gap-2 z-10">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 bg-background/80 backdrop-blur text-foreground hover:bg-background border border-border shadow-sm"
                                        onClick={handleCopy}
                                    >
                                        {copiedText === prompt.text ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="bg-zinc-950 p-6 pt-14 overflow-x-auto min-h-[200px]">
                                    <pre className="font-mono text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed">
                                        {prompt.text}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                How to use
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <ol className="space-y-4 text-muted-foreground list-none pl-0">
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">1</span>
                                        <span>Copy the prompt from the code block above.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">2</span>
                                        <span>Open your preferred AI tool (e.g., <span className="font-medium text-foreground">{prompt.tools.join(", ")}</span>).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">3</span>
                                        <span>Paste the prompt into the chat window.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">4</span>
                                        <span>Replace any placeholders like <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground font-mono text-sm">[TOPIC]</code> with your specific content.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">5</span>
                                        <span>Send the message and iterate as needed.</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-400 ring-2 ring-background shadow-md" />
                                    <div>
                                        <p className="text-base font-bold text-foreground">{prompt.author}</p>
                                        <p className="text-xs text-muted-foreground font-medium">Prompt Engineer</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-full">Follow</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-4 bg-secondary/30 rounded-xl border border-border/50">
                                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Views</span>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">{prompt.views.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-4 bg-secondary/30 rounded-xl border border-border/50">
                                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-xs font-medium uppercase tracking-wider">Likes</span>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">{prompt.likes.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full h-11 text-base shadow-lg shadow-primary/20"
                                    onClick={handleCopy}
                                >
                                    {copiedText === prompt.text ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Prompt
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-11 text-base bg-background hover:bg-secondary"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {prompt.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer px-3 py-1">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
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
        </main>
    );
}
