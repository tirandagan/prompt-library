"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Prompt } from "@/lib/data";
import { ArrowLeft, Copy, Eye, Heart, Share2, Terminal, Check, ExternalLink, Play, AlertCircle, ChevronDown, Pencil, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Toast, useToast } from "@/components/ui/Toast";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Modal } from "@/components/ui/Modal";

interface PromptDetailClientProps {
    prompt: Prompt;
    canEdit?: boolean;
}

const TOOL_URLS: Record<string, (prompt: string) => string> = {
    "ChatGPT": (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
    "Claude": (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    "Gemini": (prompt) => `https://gemini.google.com/app?text=${encodeURIComponent(prompt)}`,
    "Midjourney": () => "https://discord.com/invite/midjourney",
    "Stable Diffusion": () => "https://stablediffusionweb.com/",
    "DALL-E": () => "https://labs.openai.com/",
};

export function PromptDetailClient({ prompt, canEdit = false }: PromptDetailClientProps) {
    const { user } = useAuth();
    const { copy, copiedText } = useCopyToClipboard();
    const { toasts, showToast, removeToast } = useToast();
    const [isLiked, setIsLiked] = useState(!!prompt.isLiked);
    const [likeCount, setLikeCount] = useState(prompt.likes);
    const [selectedTool, setSelectedTool] = useState(prompt.tools[0] || "ChatGPT");
    const [isToolDropdownOpen, setIsToolDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<string | null>(null);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);

    // Increment view count on mount
    useEffect(() => {
        fetch(`/api/prompts/${prompt.id}/view`, { method: 'POST' }).catch(console.error);
    }, [prompt.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsToolDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Extract parameters from prompt text
    const parameters = useMemo(() => {
        const regex = /\[([A-Z_/-]+)\]/g;
        const matches = new Set<string>();
        let match;
        while ((match = regex.exec(prompt.text)) !== null) {
            matches.add(match[1]);
        }
        return Array.from(matches);
    }, [prompt.text]);

    const [paramValues, setParamValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    // Initialize param values
    useEffect(() => {
        const initialValues: Record<string, string> = {};
        parameters.forEach(param => {
            initialValues[param] = "";
        });
        setParamValues(initialValues);
    }, [parameters]);

    const getFilledPrompt = () => {
        let filledText = prompt.text;
        parameters.forEach(param => {
            const value = paramValues[param] || `[${param}]`;
            // Replace all occurrences of [PARAM] with value
            filledText = filledText.replaceAll(`[${param}]`, value);
        });
        return filledText;
    };

    const validateParams = () => {
        const newErrors: Record<string, boolean> = {};
        let hasError = false;
        parameters.forEach(param => {
            if (!paramValues[param]?.trim()) {
                newErrors[param] = true;
                hasError = true;
            }
        });
        setErrors(newErrors);
        return !hasError;
    };

    const handleCopy = async () => {
        if (parameters.length > 0 && !validateParams()) {
            showToast("Please fill in all parameters before copying", "error");
            return;
        }

        const textToCopy = getFilledPrompt();
        const success = await copy(textToCopy);
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

    const handleLike = async () => {
        if (!user) {
            showToast("Please log in to like prompts", "error");
            return;
        }
        
        const previousLiked = isLiked;
        const previousCount = likeCount;
        
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);

        try {
            const res = await fetch(`/api/prompts/${prompt.id}/like`, {
                method: 'POST'
            });
            
            if (!res.ok) throw new Error();
            
            const data = await res.json();
            setIsLiked(data.liked);
            setLikeCount(data.likes);
        } catch (error) {
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            showToast("Failed to update like", "error");
        }
    };

    const handleOpenInTool = async () => {
        if (parameters.length > 0 && !validateParams()) {
            showToast("Please fill in all parameters before running", "error");
            return;
        }

        const textToCopy = getFilledPrompt();
        
        // Copy to clipboard first
        await copy(textToCopy);
        showToast("Prompt copied! Opening " + selectedTool + "...", "success");
        
        // Get URL generator or default
        const urlGenerator = TOOL_URLS[selectedTool];
        const url = urlGenerator 
            ? urlGenerator(textToCopy)
            : "https://www.google.com/search?q=" + encodeURIComponent(selectedTool + " AI");
            
        window.open(url, "_blank");
    };

    const handleExecuteInApp = async () => {
        if (!user) {
            showToast("Please log in to execute prompts in-app", "error");
            return;
        }

        if (parameters.length > 0 && !validateParams()) {
            showToast("Please fill in all parameters before running", "error");
            return;
        }

        setIsExecuting(true);
        setExecutionResult(null);

        try {
            const res = await fetch('/api/prompts/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    promptText: getFilledPrompt(),
                    provider: selectedTool,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 404) {
                    showToast(data.error || "Provider API key not found. Add it in your profile.", "error");
                } else {
                    showToast(data.error || "Execution failed", "error");
                }
                return;
            }

            setExecutionResult(data.result);
            setIsResultModalOpen(true);
        } catch (error) {
            showToast("Failed to execute prompt", "error");
        } finally {
            setIsExecuting(false);
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
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent">
                                        {prompt.category}
                                    </Badge>
                                    {prompt.tools.map((tool) => (
                                        <Badge key={tool} variant="outline" className="border-border text-muted-foreground">
                                            {tool}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className="border-border text-muted-foreground font-mono text-xs uppercase tracking-wider">
                                        {prompt.type}
                                    </Badge>
                                </div>
                                {((canEdit || user?.role === 'admin') || (process.env.NODE_ENV === 'development' && user?.email === 'tiran@tirandagan.com')) && (
                                    <Link href={`/admin/prompts/${prompt.id}/edit`}>
                                        <Button size="sm" variant="ghost" className="h-8 text-muted-foreground hover:text-foreground">
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                )}
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
                                        {copiedText === getFilledPrompt() ? (
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
                                        <span>
                                            {parameters.length > 0 
                                                ? "Fill in the parameters in the sidebar to customize the prompt." 
                                                : "Copy the prompt from the code block above."}
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">2</span>
                                        <span>Open your preferred AI tool (e.g., <span className="font-medium text-foreground">{prompt.tools.join(", ")}</span>).</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-bold text-foreground">3</span>
                                        <span>Paste the prompt into the chat window.</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                             <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Run Prompt
                            </h3>

                            {/* Parameters Form */}
                            {parameters.length > 0 && (
                                <div className="mb-6 space-y-4">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        Fill in these parameters to customize the prompt:
                                    </div>
                                    {parameters.map(param => (
                                        <div key={param}>
                                            <label className="text-xs font-medium text-foreground mb-1.5 block">
                                                {param.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={`Enter ${param.toLowerCase().replace(/_/g, ' ')}...`}
                                                value={paramValues[param] || ''}
                                                onChange={(e) => {
                                                    setParamValues(prev => ({ ...prev, [param]: e.target.value }));
                                                    if (errors[param]) {
                                                        setErrors(prev => ({ ...prev, [param]: false }));
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                                                    errors[param] 
                                                        ? "border-red-500 focus:border-red-500" 
                                                        : "border-border focus:border-primary"
                                                )}
                                            />
                                            {errors[param] && (
                                                <p className="text-[10px] text-red-500 mt-1 flex items-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Required
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    <div className="h-px bg-border my-4" />
                                </div>
                            )}
                            
                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex gap-0">
                                    <Button
                                        className="flex-1 h-11 rounded-r-none border-r-0 focus:ring-0"
                                        variant="default"
                                        onClick={handleOpenInTool}
                                    >
                                        Open in {selectedTool}
                                    </Button>
                                    <div className="relative" ref={dropdownRef}>
                                        <Button
                                            className="h-11 px-3 rounded-l-none border-l border-primary-foreground/20"
                                            variant="default"
                                            onClick={() => setIsToolDropdownOpen(!isToolDropdownOpen)}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>

                                        {isToolDropdownOpen && (
                                            <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                                                {prompt.tools.map((tool) => (
                                                    <button
                                                        key={tool}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between"
                                                        onClick={() => {
                                                            setSelectedTool(tool);
                                                            setIsToolDropdownOpen(false);
                                                        }}
                                                    >
                                                        {tool}
                                                        {selectedTool === tool && <Check className="w-3.5 h-3.5 text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {user && (
                                    <Button
                                        variant="secondary"
                                        className="w-full h-11"
                                        onClick={handleExecuteInApp}
                                        disabled={isExecuting}
                                    >
                                        {isExecuting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Run in App
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            <div className="h-px bg-border my-6" />

                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full h-11 text-base shadow-lg shadow-primary/20"
                                    onClick={handleCopy}
                                >
                                    {copiedText === getFilledPrompt() ? (
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
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "flex-1 h-11 text-base bg-background hover:bg-secondary transition-colors",
                                            isLiked && "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                        )}
                                        onClick={handleLike}
                                    >
                                        <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                                        {likeCount}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11 text-base bg-background hover:bg-secondary"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
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

                        {/* Author Card */}
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
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
                                    <p className="text-xl font-bold text-foreground">{likeCount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                title="Execution Result"
            >
                <div className="p-6 space-y-4">
                    <div className="p-4 bg-muted rounded-lg border border-border max-h-[60vh] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                        {executionResult}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsResultModalOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                if (executionResult) copy(executionResult);
                                showToast("Result copied!", "success");
                            }}
                        >
                            Copy Result
                        </Button>
                    </div>
                </div>
            </Modal>

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
