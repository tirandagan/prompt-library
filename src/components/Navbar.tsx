"use client";

import Link from "next/link";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/auth/UserMenu";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search prompts..."
                            className="h-10 w-64 rounded-full border border-input bg-secondary/50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                        />
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
