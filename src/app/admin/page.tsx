"use client";

import { useEffect, useState } from "react";
import { BarChart3, FileText, FolderKanban, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPrompts: 0,
        totalCategories: 0,
        publishedPrompts: 0,
        draftPrompts: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [promptsRes, categoriesRes] = await Promise.all([
                    fetch('/api/admin/prompts?includeUnpublished=true'),
                    fetch('/api/admin/categories'),
                ]);

                const prompts = await promptsRes.json();
                const categories = await categoriesRes.json();

                setStats({
                    totalPrompts: prompts.length,
                    totalCategories: categories.length,
                    publishedPrompts: prompts.filter((p: any) => p.isPublished).length,
                    draftPrompts: prompts.filter((p: any) => !p.isPublished).length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Prompts",
            value: stats.totalPrompts,
            icon: FileText,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Categories",
            value: stats.totalCategories,
            icon: FolderKanban,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            label: "Published",
            value: stats.publishedPrompts,
            icon: TrendingUp,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            label: "Drafts",
            value: stats.draftPrompts,
            icon: BarChart3,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">Welcome to the Prompt Library Admin Panel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-card rounded-xl border border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/prompts/new"
                        className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                        <FileText className="w-8 h-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Add New Prompt</h3>
                        <p className="text-sm text-muted-foreground">Create a new prompt for the library</p>
                    </a>
                    <a
                        href="/admin/categories"
                        className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                        <FolderKanban className="w-8 h-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Manage Categories</h3>
                        <p className="text-sm text-muted-foreground">Organize prompt categories</p>
                    </a>
                    <a
                        href="/admin/prompts"
                        className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                        <BarChart3 className="w-8 h-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">View All Prompts</h3>
                        <p className="text-sm text-muted-foreground">Browse and edit existing prompts</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
