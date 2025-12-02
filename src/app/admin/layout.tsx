"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, FileText, Tags, Settings, Home } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { href: "/admin/categories", icon: FolderKanban, label: "Categories" },
        { href: "/admin/prompts", icon: FileText, label: "Prompts" },
        { href: "/admin/tags", icon: Tags, label: "Tags" },
    ];
    
    return (
        <div className="flex-1 bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
                    <p className="text-sm text-muted-foreground mt-1">Prompt Library</p>
                </div>
                
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.exact 
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                            
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                
                <div className="p-4 border-t border-border">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Back to Site</span>
                    </Link>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background">
                {children}
            </main>
        </div>
    );
}
