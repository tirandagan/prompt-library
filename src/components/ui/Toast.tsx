"use client";

import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Info,
    };

    const Icon = icons[type];

    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg transition-all duration-300",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                type === "success" && "border-green-500/20 bg-green-50 dark:bg-green-950/20",
                type === "error" && "border-red-500/20 bg-red-50 dark:bg-red-950/20",
                type === "info" && "border-blue-500/20 bg-blue-50 dark:bg-blue-950/20"
            )}
        >
            <Icon
                className={cn(
                    "h-5 w-5",
                    type === "success" && "text-green-600 dark:text-green-400",
                    type === "error" && "text-red-600 dark:text-red-400",
                    type === "info" && "text-blue-600 dark:text-blue-400"
                )}
            />
            <p className="text-sm font-medium text-foreground">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose?.(), 300);
                }}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Toast manager hook
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

    const showToast = (message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, showToast, removeToast };
}
