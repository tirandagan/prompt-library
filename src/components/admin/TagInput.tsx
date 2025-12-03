"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Tag {
    id: number;
    name: string;
}

interface TagInputProps {
    selectedTagIds: number[];
    availableTags: Tag[];
    onTagsChange: (newIds: number[]) => void;
    onCreateTag: (name: string) => Promise<Tag | null>;
}

export function TagInput({ selectedTagIds, availableTags, onTagsChange, onCreateTag }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter available tags that are not yet selected
    const filteredTags = availableTags.filter(
        (tag) => 
            !selectedTagIds.includes(tag.id) && 
            tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    const selectedTags = availableTags.filter((tag) => selectedTagIds.includes(tag.id));

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsFocused(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRemoveTag = (id: number) => {
        onTagsChange(selectedTagIds.filter((tagId) => tagId !== id));
    };

    const handleSelectTag = (tag: Tag) => {
        onTagsChange([...selectedTagIds, tag.id]);
        setInputValue("");
        setActiveIndex(-1);
        inputRef.current?.focus();
    };

    const handleCreateTag = async () => {
        if (!inputValue.trim() || isCreating) return;

        setIsCreating(true);
        try {
            const newTag = await onCreateTag(inputValue.trim());
            if (newTag) {
                handleSelectTag(newTag);
            }
        } catch (error) {
            console.error("Error creating tag:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
            handleRemoveTag(selectedTags[selectedTags.length - 1].id);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => 
                prev < filteredTags.length - 1 + (inputValue ? 1 : 0) ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < filteredTags.length) {
                handleSelectTag(filteredTags[activeIndex]);
            } else if (activeIndex === filteredTags.length && inputValue) {
                handleCreateTag();
            } else if (filteredTags.length > 0 && activeIndex === -1) {
                handleSelectTag(filteredTags[0]);
            } else if (inputValue) {
                handleCreateTag();
            }
        } else if (e.key === "Escape") {
            setIsFocused(false);
            setActiveIndex(-1);
        }
    };

    const showCreateOption = inputValue.trim().length > 0 && 
        !availableTags.some(t => t.name.toLowerCase() === inputValue.trim().toLowerCase());

    return (
        <div className="w-full space-y-2">
            <div 
                className={cn(
                    "min-h-[42px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background flex flex-wrap gap-2",
                    isFocused && "ring-2 ring-ring ring-offset-2 border-primary"
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {selectedTags.map((tag) => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground border border-border"
                    >
                        {tag.name}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag.id);
                            }}
                            className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag.name}</span>
                        </button>
                    </span>
                ))}
                
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                    placeholder={selectedTags.length === 0 ? "Select or create tags..." : ""}
                />
            </div>

            {isFocused && (filteredTags.length > 0 || showCreateOption) && (
                <div 
                    ref={dropdownRef}
                    className="absolute z-50 w-full max-w-[inherit] bg-popover text-popover-foreground shadow-md border border-border rounded-lg overflow-hidden mt-1"
                    style={{ width: inputRef.current?.parentElement?.offsetWidth }}
                >
                    <ul className="max-h-[200px] overflow-y-auto p-1">
                        {filteredTags.map((tag, index) => (
                            <li
                                key={tag.id}
                                onClick={() => handleSelectTag(tag)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                    index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {tag.name}
                            </li>
                        ))}
                        
                        {showCreateOption && (
                            <li
                                onClick={handleCreateTag}
                                onMouseEnter={() => setActiveIndex(filteredTags.length)}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors border-t border-border mt-1",
                                    filteredTags.length === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {isCreating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Create "{inputValue}"
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
