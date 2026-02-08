---

### 1. Файл: `mcp-server-directory-spec.md`
**Назначение:** Технический документ для разработчиков. Описывает архитектуру, схему базы данных, API и стек.

```markdown
# MCP Server Directory — Technical Specification v1.0
**Date:** 07.02.2025
**Status:** Draft

## 1. Architecture Overview
Проект представляет собой SPA/SSG приложение, построенное на стеке Modern Web. Основной упор на SEO, производительность и Realtime-функции.

*   **Frontend:** Next.js 15 (App Router).
*   **UI Framework:** React + Tailwind CSS.
*   **Component Library:** Shadcn/ui (Radix UI primitives).
*   **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
*   **Hosting:** Vercel.

## 2. Database Schema (Supabase PostgreSQL)

### Table: `servers`
Основная таблица с данными о MCP-серверах.

| Column | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | uuid | Primary Key | `default: gen_random_uuid()` |
| `created_at` | timestamptz | Date created | `default: now()` |
| `name` | text | Server Name (e.g., "Amplitude") | `NOT NULL` |
| `slug` | text | URL-friendly name | `UNIQUE` |
| `description` | text | Short description for card | |
| `server_url` | text | Endpoint URL (SSE/Stdio instruction) | |
| `category` | text | Enum: Analytics, Dev, Productivity... | |
| `auth_type` | text | Enum: OAuth, API Key, None | |
| `tags` | text[] | Array of tags (e.g., ["official", "verified"]) | |
| `repo_url` | text | GitHub Repository URL | |
| `maintainer` | jsonb | `{name: string, email: string}` | Private (RLS protected) |
| `status` | text | Enum: `pending`, `active`, `rejected` | `default: 'pending'` |
| `verification_level`| text | `community`, `partner`, `official` | |

### Table: `tools_cache` (Optional)
Кэш инструментов, предоставляемых сервером (для поиска по функциям).

| Column | Type | Description |
| :--- | :--- | :--- |
| `server_id` | uuid | FK -> servers.id |
| `tool_name` | text | e.g., "analyze_data" |
| `tool_desc` | text | Description from MCP schema |

## 3. Security & RLS (Row Level Security)
*   **Public Access:** `SELECT` разрешен для всех, где `status = 'active'`.
*   **Submission:** `INSERT` разрешен для `anon` (неавторизованных), но статус всегда `pending`.
*   **Admin:** Полный доступ (CRUD) только для роли `service_role` или админских UUID.

## 4. Key Components (Frontend)
1.  **`ServerCard.tsx`**:
    *   Props: `Server` object.
    *   Features: Copy URL to clipboard, Status badge (Lock/Unlock), Tooltip descriptions.
2.  **`FilterBar.tsx`**:
    *   Client-side filtering for fast UX.
    *   Facets: Category, Auth Type.
3.  **`SubmissionForm.tsx`**:
    *   Library: `react-hook-form` + `zod`.
    *   Validation: URL regex check, required fields.

## 5. Integrations / External APIs
*   **GitHub API:** (Optional) Для автоматического подтягивания кол-ва звезд и последнего обновления репозитория сервера.
*   **MCP Health Check:** Edge Function, которая раз в 24ч проверяет доступность `server_url`.
```
