import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "About Us | PromptForge",
    description: "About PromptForge and its creator Tiran Dagan",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">About PromptForge</h1>
            
            <div className="prose prose-slate max-w-none">
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    Building the bridge between human creativity and artificial intelligence.
                </p>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Our Story</h2>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <p className="text-muted-foreground mb-4">
                            PromptForge was born from a simple observation: as AI tools become more powerful, the art of communicating with them becomes increasingly crucial.
                        </p>
                        <p className="text-muted-foreground">
                            Created by Tiran Dagan at 6FootMedia LLC, this platform serves as a curated library of high-quality prompts designed to help developers, creators, and businesses unlock the full potential of Large Language Models.
                        </p>
                        {/* Placeholder for more story details after user input */}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">1</div>
                            <h3 className="font-medium text-lg">Discover</h3>
                            <p className="text-sm text-muted-foreground">Browse our categorized collection of verified prompts.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">2</div>
                            <h3 className="font-medium text-lg">Test & Tweak</h3>
                            <p className="text-sm text-muted-foreground">Use our playground to test prompts with different models.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">3</div>
                            <h3 className="font-medium text-lg">Deploy</h3>
                            <p className="text-sm text-muted-foreground">Integrate optimized prompts directly into your workflow.</p>
                        </div>
                    </div>
                </section>

                <section className="bg-primary/5 rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
                    <p className="text-muted-foreground mb-6">
                        Join our community and start crafting better prompts today.
                    </p>
                    <Link href="/">
                        <Button size="lg">Explore Prompts</Button>
                    </Link>
                </section>
            </div>
        </div>
    );
}

