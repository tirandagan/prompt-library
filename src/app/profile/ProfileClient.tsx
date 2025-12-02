"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Loader2, Plus, Trash2, Key, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApiKey {
    id: number;
    provider: string;
    label: string;
    createdAt: string;
}

interface UserProfile {
    name: string;
    bio: string;
    email: string;
}

export default function ProfileClient({ user }: { user: any }) {
    const [profile, setProfile] = useState<UserProfile>({
        name: user.name || "",
        bio: user.bio || "",
        email: user.email,
    });
    const [password, setPassword] = useState({ current: "", new: "" });
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [newKey, setNewKey] = useState({ provider: "openai", key: "", label: "" });
    const [isLoading, setIsLoading] = useState({ profile: false, password: false, keys: false, addKey: false });
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            const res = await fetch("/api/user/api-keys");
            if (res.ok) {
                const data = await res.json();
                setApiKeys(data);
            }
        } catch (error) {
            console.error("Failed to fetch keys", error);
        }
    };

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading({ ...isLoading, profile: true });
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: profile.name, bio: profile.bio }),
            });
            if (res.ok) {
                showToast("Profile updated successfully", "success");
                router.refresh();
            } else {
                showToast("Failed to update profile", "error");
            }
        } catch (error) {
            showToast("Error updating profile", "error");
        }
        setIsLoading({ ...isLoading, profile: false });
    };

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading({ ...isLoading, password: true });
        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: password.current,
                    newPassword: password.new
                }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast("Password updated successfully", "success");
                setPassword({ current: "", new: "" });
            } else {
                showToast(data.error || "Failed to update password", "error");
            }
        } catch (error) {
            showToast("Error updating password", "error");
        }
        setIsLoading({ ...isLoading, password: false });
    };

    const addApiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading({ ...isLoading, addKey: true });
        try {
            const res = await fetch("/api/user/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newKey),
            });
            if (res.ok) {
                showToast("API Key added successfully", "success");
                setNewKey({ provider: "openai", key: "", label: "" });
                fetchApiKeys();
            } else {
                showToast("Failed to add API key", "error");
            }
        } catch (error) {
            showToast("Error adding API key", "error");
        }
        setIsLoading({ ...isLoading, addKey: false });
    };

    const deleteApiKey = async (id: number) => {
        if (!confirm("Are you sure you want to delete this key?")) return;
        try {
            const res = await fetch(`/api/user/api-keys/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast("API Key deleted successfully", "success");
                setApiKeys(apiKeys.filter((k) => k.id !== id));
            } else {
                showToast("Failed to delete API key", "error");
            }
        } catch (error) {
            showToast("Error deleting API key", "error");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            {/* Profile Info */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                </div>
                <form onSubmit={updateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full h-10 px-3 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Bio</label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                            className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>
                    <Button type="submit" disabled={isLoading.profile}>
                        {isLoading.profile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Profile
                    </Button>
                </form>
            </section>

            {/* Password */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Password</h2>
                </div>
                <form onSubmit={updatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Password (if set)</label>
                        <input
                            type="password"
                            value={password.current}
                            onChange={(e) => setPassword({ ...password, current: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            value={password.new}
                            onChange={(e) => setPassword({ ...password, new: e.target.value })}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            minLength={8}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading.password || !password.new}>
                        {isLoading.password ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Password
                    </Button>
                </form>
            </section>

            {/* API Keys */}
            <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Key className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Service API Keys</h2>
                </div>
                
                <div className="mb-6 space-y-4">
                    {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                            <div>
                                <div className="font-medium">{key.label || key.provider}</div>
                                <div className="text-sm text-muted-foreground capitalize">{key.provider} • Added on {new Date(key.createdAt).toLocaleDateString()}</div>
                            </div>
                            <button
                                onClick={() => deleteApiKey(key.id)}
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {apiKeys.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">No API keys added yet.</div>
                    )}
                </div>

                <form onSubmit={addApiKey} className="p-4 border border-border rounded-lg bg-muted/10 space-y-4">
                    <h3 className="font-medium text-sm">Add New Key</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium mb-1">Provider</label>
                            <select
                                value={newKey.provider}
                                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic (Claude)</option>
                                <option value="google">Google (Gemini)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Label (Optional)</label>
                            <input
                                type="text"
                                value={newKey.label}
                                onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
                                placeholder="My Pro Key"
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">API Key</label>
                            <input
                                type="password"
                                value={newKey.key}
                                onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                                placeholder="sk-..."
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading.addKey}>
                            {isLoading.addKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Key
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}

