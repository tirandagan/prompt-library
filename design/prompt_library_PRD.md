## 📝 Product Requirements Document (PRD): LLM Prompt Repository

### 1. Introduction

#### 1.1 Project Title and Version
* **Title:** PromptForge: Curated LLM Prompt Repository
* **Version:** 1.0 (Minimum Viable Product - MVP)

#### 1.2 Product Summary
PromptForge is an online, searchable repository designed to host, categorize, and showcase high-quality, reusable LLM prompts for various applications. The primary goal is to provide prompt engineers, developers, and general users with an easy-to-use platform to **find, view, and instantly copy** prompts tailored to specific use cases (e.g., marketing, coding, image generation) and target tools (e.g., ChatGPT, Midjourney, Sora). The focus is on robust discoverability through structured categorization and advanced filtering.

#### 1.3 Goals & Success Metrics
| Goal Category | Goal Statement | Success Metric (KPI) |
| :--- | :--- | :--- |
| **Discoverability** | Enable users to quickly find a relevant prompt. | **P90 Search Latency** < 500ms; **Filter Usage Rate** > 30% of search sessions. |
| **Engagement** | Maximize the utility and reuse of the curated prompts. | **Prompts Copied per Day (PCD)**; **Return Visit Rate** > 25%. |
| **Content Quality**| Ensure the prompt structure is clear and easily applied. | **Bounce Rate** on Prompt Detail Pages < 35%. |

---

### 2. User Stories (MVP Focus)

| ID | Priority | User Story |
| :--- | :--- | :--- |
| **US-001** | Must Have | As a user, I want to **browse prompts by Category** (e.g., 'Marketing'), so I can explore prompts relevant to my field. |
| **US-002** | Must Have | As a user, I want to **search prompts using keywords** (e.g., "Youtube Script"), so I can find prompts quickly. |
| **US-003** | Must Have | As a user, I want to **filter results by Target Tool** (e.g., 'Midjourney' or 'Sora'), so I only see prompts I can immediately use. |
| **US-004** | Must Have | As a user, I want to **view the full prompt details** with clear syntax formatting, so I know exactly what to copy. |
| **US-005** | Must Have | As a user, I want a **one-click "Copy Prompt" button**, so I can instantly transfer the prompt to my LLM application. |
| **US-006** | Should Have | As a user, I want to see **visual badges** (e.g., 🖼️, 🎬) on all listings, so I can instantly identify the prompt's Application Type. |
| **US-007** | Should Have | As a user, I want to see a **"How it Works / Insights"** section on the prompt page, so I can understand the prompt's underlying engineering structure. |

---

### 3. Functional Requirements

#### 3.1. Discoverability & Search
* **FR-3.1.1. Global Search:** Implement a single, persistent search bar that indexes all metadata fields and the full prompt text.
* **FR-3.1.2. Faceted Filtering:** Implement sidebar filters based on the Core Metadata fields (**Target Tool, Application Type, Prompt Type**). Filters must be combinable (e.g., `Target Tool: Midjourney` AND `Prompt Type: Prompt Generator`).
* **FR-3.1.3. Categorical Browsing:** The main navigation must be driven by the **Category** metadata (Marketing, Text to Image, Health, etc.).
* **FR-3.1.4. Tagging:** Implement clickable tags based on the `Usage/Goal` field (e.g., #SEO, #VR, #Iterative) displayed on detail and listing pages.

#### 3.2. User Interface (UI)
* **FR-3.2.1. Prompt Listing Card:** Each prompt card must display the **Prompt Name**, the brief **Usage/Goal**, and the relevant **Visual Badges** (Application Type, Target Tool).
* **FR-3.2.2. Prompt Detail View:**
    * Display the **Prompt Text** in a scrollable, monospace box with syntax highlighting for clarity.
    * The `[INPUTS]` sections within the prompt text should be clearly differentiated visually (e.g., highlighted background).
    * Include a highly visible "Copy Prompt" button adjacent to the prompt text box.
* **FR-3.2.3. Context Section:** Display a collapsible "Structure Analysis & Tips" section to show the deeper insights and structure breakdown of the prompt.

---

### 4. Data Schema

The following tables represent the core data structure (simplified for PRD) required to support the functional requirements.

#### 4.1. `Prompt` Table (Core Content)
| Field Name | Data Type | Description | Source Mapping |
| :--- | :--- | :--- | :--- |
| `prompt_id` | UUID/INT | Primary Key. | |
| `name` | STRING | Display name of the prompt. (e.g., "Generate a Youtube Script") | Prompt Name |
| `text_template` | TEXT | The full, reusable prompt text/template. | Prompt Text |
| `usage_goal` | STRING | A short description of what the prompt achieves. | Usage/Goal |
| `model_compatibility`| STRING | Specific model version, if relevant (e.g., "Midjourney v5"). | Compatibility |
| `source_credit` | STRING | Original creator or source (e.g., "Lifan Wang"). | Source/Credit |
| `structure_insights`| TEXT | Detailed "Structure Analysis" and "Practical Insights." | Notes/Insights |
| `created_at` | TIMESTAMP | Creation date. | |
| `view_count` | INT | For calculating popularity. | |
| `copy_count` | INT | For calculating popularity. | Success Metric |

#### 4.2. `Category` Table (Primary Browsing)
| Field Name | Data Type | Description | Source Mapping |
| :--- | :--- | :--- | :--- |
| `category_id` | UUID/INT | Primary Key. | |
| `name` | STRING | Main category name (e.g., "Marketing & Social Media"). | Category |

#### 4.3. `Tool` Table (Crucial Filter)
| Field Name | Data Type | Description | Source Mapping |
| :--- | :--- | :--- | :--- |
| `tool_id` | UUID/INT | Primary Key. | |
| `name` | STRING | LLM Application name (e.g., "Midjourney", "ChatGPT"). | Target Tool |
| `application_type` | ENUM | General type (`TEXT`, `IMAGE`, `VIDEO`, `CODE`, `DATA`). | Application Type |
| `prompt_type` | ENUM | Prompt nature (`DIRECT`, `GENERATOR`, `REFINER`). | Prompt Type |

#### 4.4. `Prompt_Category` and `Prompt_Tool` (Relationship Tables)
* **`Prompt_Category`**: Maps `prompt_id` to `category_id` (Many-to-Many).
* **`Prompt_Tool`**: Maps `prompt_id` to `tool_id` (Many-to-Many, as one prompt can target multiple tools).

---

### 5. Recommended Architecture

A modern, scalable web application architecture based on a **Serverless/Microservices approach** is recommended for high performance and cost-efficiency in content-heavy, read-dominant repositories.

#### 5.1. Front-End (Presentation Layer)
* **Technology:** **React, Vue.js, or Next.js/Gatsby** (for Static Site Generation/Server-Side Rendering for SEO).
* **Rationale:** Provides a fast, interactive Single-Page Application (SPA) experience, which is ideal for a browsing and search-heavy interface. Using Next.js/Gatsby ensures excellent SEO for prompt discovery via external search engines (Google, etc.).

#### 5.2. Back-End (Application & Data Layers)
* **Architecture Pattern:** **API Gateway + Serverless Functions (e.g., AWS Lambda/Google Cloud Functions) or Containerized Microservices (e.g., Kubernetes).**
* **API Layer:** **GraphQL or REST API** to connect the front-end to the back-end services.
* **Database:** **PostgreSQL** (Relational) for primary metadata storage, ensuring data integrity and strong relational modeling (Categories, Tools).
* **Search Engine:** **Elasticsearch or Algolia** (dedicated search service). This is **critical** for fast, complex faceted search and relevance ranking (FR-3.1.2). The main database should sync its prompt data to this specialized search index.
* **Caching:** **Content Delivery Network (CDN)** (e.g., Cloudflare, AWS CloudFront) for static assets and frequently accessed content (Prompt Detail Pages). **Redis** for in-memory caching of popular search queries and prompt counts.

#### 5.3. Architecture Diagram (Conceptual Flow)


```mermaid
graph TD
    A[User Browser/Client] -- 1. Request Page/Search --> B(CDN/Edge Cache)
    B -- 2. Cache Miss/API Call --> C(API Gateway/Load Balancer)
    C -- 3. Search Query --> D[Search Service: Elasticsearch/Algolia]
    C -- 4. Data Query/Update --> E[Application Logic: Serverless Functions/Microservices]
    E -- 5. Write/Read Data --> F[Primary DB: PostgreSQL]
    E -- 6. Read/Cache Popular Data --> G[Cache: Redis]
    D -- 7. Indexing --> E
    E -- 8. Indexing Sync (Async) --> D

    subgraph Front-End
        A
    end

    subgraph Back-End / Infrastructure
        C
        E
        D
        F
        G
    end