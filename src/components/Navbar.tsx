"use client";

import Link from "next/link";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";
import { searchPrompts, SearchResult } from "@/app/actions/search";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);
        try {
            const results = await searchPrompts(query);
            setSearchResults(results);
        } catch (error) {
            console.error("Search failed:", error);
            showToast("Search failed", "error");
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery);
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">PromptForge</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
                        <Link href="/tools" className="hover:text-primary transition-colors">Tools</Link>
                        <Link href="/popular" className="hover:text-primary transition-colors">Popular</Link>
                        <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
                            <span className="text-xs">⚙️</span>
                            Admin
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search prompts..."
                            className="h-10 w-64 rounded-full border border-input bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {showResults && (searchQuery.length > 0) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 p-2 w-[350px] -left-1/2">
                                {isSearching ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="flex flex-col max-h-[400px] overflow-y-auto">
                                        {searchResults.map((result) => (
                                            <Link 
                                                key={result.id} 
                                                href={`/prompt/${result.slug}`}
                                                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors group"
                                                onClick={() => setShowResults(false)}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">{result.name}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{result.description}</p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">{Math.round(result.similarity * 100)}%</Badge>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-muted-foreground text-sm">No results found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <UserMenu />
                        <Button className="rounded-full shadow-lg shadow-primary/20">Submit Prompt</Button>
                    </div>

                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-4 animate-in slide-in-from-top-5 fade-in duration-200">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search prompts..."
                            className="h-10 w-full rounded-full border border-input bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex flex-col gap-4 text-base font-medium text-muted-foreground">
                        <Link href="/categories" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Categories</Link>
                        <Link href="/tools" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Tools</Link>
                        <Link href="/popular" className="hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Popular</Link>
                        <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                            <span className="text-xs">⚙️</span>
                            Admin
                        </Link>
                    </div>
                    <div className="pt-4 border-t border-border flex flex-col gap-3">
                        <div className="flex justify-center">
                            <UserMenu />
                        </div>
                        <Button className="w-full justify-center shadow-lg shadow-primary/20">Submit Prompt</Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
