"use client";

import { Navbar } from "@/components/Navbar";
import { PromptCard } from "@/components/PromptCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, MOCK_PROMPTS, TOOLS } from "@/lib/data";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Toast, useToast } from "@/components/ui/Toast";
import { useState } from "react";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function CategoryPage({ params }: PageProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"newest" | "popular" | "views">("popular");
    const { toasts, showToast, removeToast } = useToast();

    // Resolve params
    useState(() => {
        params.then(setResolvedParams);
    });

    if (!resolvedParams) {
        return null;
    }

    const category = CATEGORIES.find((c) => c.id === resolvedParams.id);

    if (!category) {
        notFound();
    }

    // Filter prompts by category
    let filteredPrompts = MOCK_PROMPTS.filter((p) => p.category === category.name);

    // Filter by selected tools
    if (selectedTools.length > 0) {
        filteredPrompts = filteredPrompts.filter((p) =>
            p.tools.some((tool) => selectedTools.includes(tool))
        );
    }

    // Sort prompts
    const sortedPrompts = [...filteredPrompts].sort((a, b) => {
        if (sortBy === "popular") return b.likes - a.likes;
        if (sortBy === "views") return b.views - a.views;
        return 0; // newest would use timestamp if we had it
    });

    const toggleTool = (tool: string) => {
        setSelectedTools((prev) =>
            prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
        );
    };

    const handleCopy = () => {
        showToast("Prompt copied to clipboard!", "success");
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8 md:py-12">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                            <div className="flex items-center gap-2 mb-6">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-bold text-foreground">Filters</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                                        Tools
                                    </h3>
                                    <div className="space-y-2">
                                        {TOOLS.map((tool) => (
                                            <label
                                                key={tool.id}
                                                className="flex items-center gap-2 cursor-pointer group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTools.includes(tool.name)}
                                                    onChange={() => toggleTool(tool.name)}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {tool.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {selectedTools.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setSelectedTools([])}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-5xl">{category.icon}</span>
                                <div>
                                    <h1 className="text-4xl font-bold text-foreground tracking-tight">
                                        {category.name}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        {sortedPrompts.length} prompts available
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-6">
                                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                                <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg border border-border">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={sortBy === "popular" ? "bg-background shadow-sm" : ""}
                                        onClick={() => setSortBy("popular")}
                                    >
                                        Popular
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={sortBy === "views" ? "bg-background shadow-sm" : ""}
                                        onClick={() => setSortBy("views")}
                                    >
                                        Most Viewed
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={sortBy === "newest" ? "bg-background shadow-sm" : ""}
                                        onClick={() => setSortBy("newest")}
                                    >
                                        Newest
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {sortedPrompts.length === 0 ? (
                            <div className="text-center py-16">
                                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No prompts found
                                </h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your filters to see more results.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedPrompts.map((prompt) => (
                                    <PromptCard key={prompt.id} prompt={prompt} onCopy={handleCopy} />
                                ))}
                            </div>
                        )}
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
