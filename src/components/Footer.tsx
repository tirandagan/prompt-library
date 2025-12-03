"use client";

import { useState } from "react";
import Link from "next/link";
import { ContactModal } from "./ContactModal";

export function Footer() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <footer className="border-t border-border bg-slate-50 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <h3 className="font-semibold text-lg mb-2">PromptForge</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            The ultimate library for high-quality LLM prompts. 
                            Curated for developers, marketers, and creatives.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-3">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <button 
                                    onClick={() => setIsContactOpen(true)}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Contact Us
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-3">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Statement
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} 6FootMedia LLC. All rights reserved.
                    </p>
                    <p>
                        Created by Tiran Dagan
                    </p>
                </div>
            </div>

            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
        </footer>
    );
}

