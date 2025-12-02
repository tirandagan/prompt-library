"use client";

import { PromptCard } from "@/components/PromptCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_PROMPTS } from "@/lib/data";
import { ArrowRight, Sparkles, Search, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Toast, useToast } from "@/components/ui/Toast";
import { useState, useEffect } from "react";

export default function Home() {
  const { toasts, showToast, removeToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchFeaturedPrompts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedPrompts = async () => {
    try {
      const res = await fetch('/api/prompts/featured');
      const data = await res.json();
      setFeaturedPrompts(data);
    } catch (error) {
      console.error('Error fetching featured prompts:', error);
      // Fallback to mock if fetch fails (or just empty)
      setFeaturedPrompts(MOCK_PROMPTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    showToast("Prompt copied to clipboard!", "success");
  };

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-background pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/20 blur-[100px] rounded-full opacity-50 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="h-4 w-4" />
            <span>Over 10,000+ Curated Prompts</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground md:text-7xl mb-8 animate-in fade-in slide-in-from-bottom-5 duration-500 delay-100">
            Discover & Share <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">World-Class Prompts</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200 leading-relaxed">
            PromptForge is the ultimate library for developers, marketers, and creatives to find, test, and deploy high-quality LLM prompts for ChatGPT, Midjourney, and more.
          </p>

          <div className="mx-auto max-w-2xl relative mb-12 animate-in fade-in slide-in-from-bottom-7 duration-500 delay-300">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-25 group-hover:opacity-50 blur transition duration-200" />
              <div className="relative flex items-center bg-background rounded-full p-2 shadow-xl border border-border">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for 'SEO Blog Post' or 'Python Refactoring'..."
                  className="w-full h-10 px-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Trending:</span>
              <Link href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Marketing Strategy</Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">React Components</Link>
              <Link href="#" className="hover:text-primary transition-colors hover:underline underline-offset-4">Midjourney v6</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Find the perfect prompt for your specific needs.</p>
          </div>
          <Button variant="ghost" className="group text-primary hover:text-primary hover:bg-primary/5">
            View all categories <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">{category.icon}</span>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                <span className="text-xs text-muted-foreground mt-1 font-medium">{category.count} prompts</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Prompts Section */}
      <section className="py-24 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                <Zap className="h-4 w-4" />
                <span>Fresh Picks</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Featured Prompts</h2>
            </div>
            <div className="flex gap-2 bg-background p-1 rounded-lg border border-border shadow-sm">
              <Button variant="ghost" size="sm" className="bg-secondary text-foreground shadow-sm">Newest</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Popular</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Trending</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} onCopy={handleCopy} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-border bg-background hover:bg-secondary hover:text-foreground transition-all">
              Load More Prompts
            </Button>
          </div>
        </div>
      </section>

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
