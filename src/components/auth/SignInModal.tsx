"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { X, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, verifyCode } = useAuth();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        const result = await signIn(email);
        setIsLoading(false);

        if (result.success) {
            setStep("code");
            showToast("Verification code sent!", "success");

            // For dev mode without Resend API key
            if (result.devMode) {
                console.log("DEV MODE: Check server console for code");
            }
        } else {
            showToast(result.message || "Failed to send code", "error");
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setIsLoading(true);
        const result = await verifyCode(email, code);
        setIsLoading(false);

        if (result.success) {
            showToast("Successfully signed in!", "success");
            onClose();
        } else {
            showToast(result.message || "Invalid code", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            {step === "email" ? "Sign in to PromptForge" : "Check your inbox"}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            {step === "email"
                                ? "Enter your email to receive a verification code."
                                : `We've sent a 6-digit code to ${email}`}
                        </p>
                    </div>

                    {step === "email" ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                    autoFocus
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending code...
                                    </>
                                ) : (
                                    <>
                                        Continue with Email
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleCodeSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="sr-only">Verification Code</label>
                                <input
                                    id="code"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full h-16 text-center text-3xl font-mono tracking-[0.5em] rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                    autoFocus
                                    maxLength={6}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                                disabled={isLoading || code.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Sign In
                                        <CheckCircle2 className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep("email")}
                                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                Use a different email
                            </button>
                        </form>
                    )}
                </div>

                <div className="p-4 bg-secondary/30 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
