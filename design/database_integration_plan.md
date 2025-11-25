# Database Integration Plan - PromptForge

## Overview
Migrate from mock data to PostgreSQL database for storing prompts, categories, tools, and related metadata.

## Database Schema

### Tables

#### 1. `categories`
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `tools`
```sql
CREATE TABLE tools (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'code'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `prompts`
```sql
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_type VARCHAR(50) NOT NULL, -- 'Direct', 'Generator', 'Refiner'
  author VARCHAR(100) NOT NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `prompt_categories` (Many-to-Many)
```sql
CREATE TABLE prompt_categories (
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, category_id)
);
```

#### 5. `prompt_tools` (Many-to-Many)
```sql
CREATE TABLE prompt_tools (
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  tool_id INTEGER REFERENCES tools(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tool_id)
);
```

#### 6. `tags`
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. `prompt_tags` (Many-to-Many)
```sql
CREATE TABLE prompt_tags (
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);
```

## Implementation Steps

### Phase 1: Setup
- [x] Install dependencies (pg, drizzle-orm, drizzle-kit)
- [x] Create .env.example template
- [x] Setup database connection
- [x] Create Drizzle schema definitions

### Phase 2: Database Setup
- [ ] Create migration files
- [ ] Run migrations
- [ ] Seed initial data (categories, tools, prompts)

### Phase 3: API Layer
- [ ] Create database query functions
- [ ] Implement data fetching for pages
- [ ] Add error handling
- [ ] Add caching strategy

### Phase 4: Update Pages
- [ ] Update Home page to fetch from DB
- [ ] Update Category page to fetch from DB
- [ ] Update Prompt Detail page to fetch from DB
- [ ] Add loading states
- [ ] Add error boundaries

### Phase 5: Advanced Features
- [ ] Implement search with full-text search
- [ ] Add view counter increment
- [ ] Add like functionality (with persistence)
- [ ] Add analytics tracking

## Technology Stack
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **Database**: PostgreSQL
- **Migration Tool**: Drizzle Kit
- **Connection Pooling**: pg (node-postgres)

## Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/promptforge
```

## Notes
- Use Drizzle ORM for type safety and better DX
- Implement connection pooling for production
- Add indexes on frequently queried columns (slug, created_at)
- Use transactions for data consistency
- Implement soft deletes if needed later
