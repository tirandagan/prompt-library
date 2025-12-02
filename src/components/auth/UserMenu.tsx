"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { LogOut, User as UserIcon, Settings, Shield } from "lucide-react";
import { SignInModal } from "./SignInModal";

export function UserMenu() {
    const { user, signOut, isLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />;
    }

    if (!user) {
        return (
            <>
                <Button onClick={() => setShowSignIn(true)} variant="default" size="sm">
                    Sign In
                </Button>
                <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
            </>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group focus:outline-none"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-medium shadow-md ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        (user.name || user.email).charAt(0).toUpperCase()
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                        {user.role === 'admin' && (
                            <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                            </div>
                        )}
                    </div>

                    <div className="py-1">
                        <Link 
                            href="/profile"
                            className="w-full px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="w-4 h-4 text-muted-foreground" />
                            Profile
                        </Link>
                        <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            Settings
                        </button>
                    </div>

                    <div className="border-t border-border py-1">
                        <button
                            onClick={() => {
                                signOut();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
