"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Prompt } from "@/lib/data";
import { PromptCard } from "@/components/PromptCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, SlidersHorizontal, X, Filter, ChevronDown, ArrowUpDown, Sparkles, Grid, List } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    count: number;
}

interface Tool {
    id: number;
    name: string;
    slug: string;
}

interface CategoriesPageClientProps {
    prompts: Prompt[];
    categories: Category[];
    tools: Tool[];
}

export function CategoriesPageClient({ prompts: initialPrompts, categories, tools }: CategoriesPageClientProps) {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"newest" | "popular" | "views">("popular");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Handle filtering and sorting
    const filteredPrompts = useMemo(() => {
        let result = [...initialPrompts];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.text.toLowerCase().includes(query) ||
                    p.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory) {
            result = result.filter((p) => p.category === selectedCategory);
        }

        // Tools filter
        if (selectedTools.length > 0) {
            result = result.filter((p) => 
                p.tools.some((tool) => selectedTools.includes(tool))
            );
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "popular") return b.likes - a.likes;
            if (sortBy === "views") return b.views - a.views;
            // For "newest", we assume higher ID is newer since we don't have createdAt in the mapped type yet
            // or we can rely on the initial server sort if it was by date.
            // Ideally, we'd add createdAt to the Prompt type. 
            // For now, let's assume the initial order is relevant or add createdAt to mapping.
            return 0; 
        });

        return result;
    }, [initialPrompts, searchQuery, selectedCategory, selectedTools, sortBy]);

    const handleCopy = () => {
        showToast("Prompt copied to clipboard!", "success");
    };

    const toggleTool = (toolName: string) => {
        setSelectedTools((prev) =>
            prev.includes(toolName) ? prev.filter((t) => t !== toolName) : [...prev, toolName]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setSelectedTools([]);
        setSortBy("popular");
    };

    const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedTools.length + (searchQuery ? 1 : 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-card border-b border-border sticky top-0 z-30">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse Prompts</h1>
                            <p className="text-muted-foreground mt-1">
                                Explore {initialPrompts.length} curated prompts across {categories.length} categories
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-secondary/50 p-1 rounded-xl border border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortBy("popular")}
                                className={cn(
                                    "rounded-lg transition-all", 
                                    sortBy === "popular" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Popular
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortBy("views")}
                                className={cn(
                                    "rounded-lg transition-all", 
                                    sortBy === "views" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                Most Viewed
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortBy("newest")}
                                className={cn(
                                    "rounded-lg transition-all", 
                                    sortBy === "newest" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Newest
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search prompts, tags, or descriptions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button 
                            variant="outline" 
                            className={cn(
                                "md:w-auto flex gap-2 border-border/50 bg-secondary/30",
                                (isFiltersOpen || activeFiltersCount > 0) && "border-primary/50 text-primary bg-primary/5"
                            )}
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] bg-primary text-primary-foreground">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Filters (Desktop: Sticky, Mobile: Collapsible) */}
                    <aside className={cn(
                        "lg:w-64 flex-shrink-0 space-y-8 transition-all duration-300 ease-in-out",
                        isFiltersOpen ? "block" : "hidden lg:block"
                    )}>
                        <div className="sticky top-32 space-y-8 pr-4 overflow-y-auto max-h-[calc(100vh-10rem)] custom-scrollbar">
                            
                            {/* Categories */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-foreground tracking-tight">Categories</h3>
                                    {selectedCategory && (
                                        <button 
                                            onClick={() => setSelectedCategory(null)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left",
                                            selectedCategory === null
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                        )}
                                    >
                                        <span>All Categories</span>
                                        <span className="text-xs opacity-70">{initialPrompts.length}</span>
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.name)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left group",
                                                selectedCategory === category.name
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{category.icon}</span>
                                                <span>{category.name}</span>
                                            </div>
                                            <span className={cn(
                                                "text-xs opacity-70 group-hover:opacity-100 transition-opacity",
                                                selectedCategory === category.name ? "opacity-100" : ""
                                            )}>
                                                {category.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tools */}
                            <div className="pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-foreground tracking-tight">Tools</h3>
                                    {selectedTools.length > 0 && (
                                        <button 
                                            onClick={() => setSelectedTools([])}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {tools.map((tool) => (
                                        <label
                                            key={tool.id}
                                            className="flex items-center gap-3 px-2 py-1.5 cursor-pointer group rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTools.includes(tool.name)}
                                                    onChange={() => toggleTool(tool.name)}
                                                    className="peer h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                                                />
                                                <div className="absolute inset-0 bg-primary rounded scale-0 peer-checked:scale-100 transition-transform pointer-events-none flex items-center justify-center">
                                                    <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-sm transition-colors",
                                                selectedTools.includes(tool.name) ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                                            )}>
                                                {tool.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* Main Content Grid */}
                    <div className="flex-1 min-w-0">
                        {activeFiltersCount > 0 && (
                            <div className="mb-6 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
                                {selectedCategory && (
                                    <Badge variant="secondary" className="bg-secondary hover:bg-secondary/80 pr-1">
                                        {selectedCategory}
                                        <button onClick={() => setSelectedCategory(null)} className="ml-2 hover:text-primary">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {selectedTools.map(tool => (
                                    <Badge key={tool} variant="secondary" className="bg-secondary hover:bg-secondary/80 pr-1">
                                        {tool}
                                        <button onClick={() => toggleTool(tool)} className="ml-2 hover:text-primary">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {searchQuery && (
                                    <Badge variant="secondary" className="bg-secondary hover:bg-secondary/80 pr-1">
                                        "{searchQuery}"
                                        <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-primary">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                <button 
                                    onClick={clearFilters}
                                    className="text-xs text-muted-foreground hover:text-primary ml-auto"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {filteredPrompts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-border rounded-3xl">
                                <div className="bg-secondary/50 p-4 rounded-full mb-4">
                                    <Filter className="h-8 w-8 text-muted-foreground opacity-50" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No prompts found
                                </h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                    We couldn't find any prompts matching your current filters. Try adjusting your search or clearing filters.
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredPrompts.map((prompt) => (
                                    <PromptCard 
                                        key={prompt.id} 
                                        prompt={prompt} 
                                        onCopy={handleCopy}
                                        className="h-full"
                                    />
                                ))}
                            </div>
                        )}
                        
                        {filteredPrompts.length > 0 && (
                            <div className="mt-12 text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Showing {filteredPrompts.length} of {initialPrompts.length} prompts
                                </p>
                                {/* Pagination could go here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

