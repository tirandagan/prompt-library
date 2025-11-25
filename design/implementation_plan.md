# Implementation Plan - PromptForge

## Status
- [x] Setup Project & Dependencies
- [x] Design System Setup (Tailwind, Fonts, Colors)
- [x] Core Components
    - [x] Navbar
    - [x] PromptCard
    - [x] Badge
    - [x] Button
- [x] Pages
    - [x] Home Page (Search, Categories, Featured Prompts)
    - [x] Prompt Detail Page
- [x] Mock Data Integration

## Details

### 1. Setup
- Move `prompt-forge` contents to root.
- Install `lucide-react`, `clsx`, `tailwind-merge`.

### 2. Design System
- Fonts: Inter (Google Fonts).
- Colors: Slate/Zinc for neutrals, Indigo/Violet for primary.
- Dark mode support.

### 3. Components
- **Navbar**: Logo, Search Bar (global), Navigation Links.
- **PromptCard**: Title, Description, Badges (Tool, Type), Copy Button.
- **Badge**: Visual indicators for tools/types.

### 4. Pages
- **Home**: Hero section with search, Category grid, Recent/Popular prompts list.
- **Detail**: Full prompt text with syntax highlighting, copy button, metadata sidebar.
