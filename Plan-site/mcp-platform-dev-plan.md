---

### 2. Файл: `mcp-platform-dev-plan.md`
**Назначение:** План действий (Roadmap) для разработчика. Списки задач, разбитые по фазам.

```markdown
# MCP Platform Development Plan
**Target Launch:** Q1 2025

## Phase 1: Foundation (Days 1-3)
Цель: Развернуть базовую инфраструктуру и БД.

- [ ] **Setup Project**
    - [ ] `npx create-next-app@latest` (TypeScript, Tailwind, App Router).
    - [ ] Initialize Shadcn/ui (`npx shadcn-ui@latest init`).
    - [ ] Install icons (`lucide-react`).
- [ ] **Supabase Config**
    - [ ] Create Project.
    - [ ] Run SQL migrations for `servers` table.
    - [ ] Setup RLS policies (Public Read, Anon Insert).
    - [ ] Generate Types (`npx supabase gen types`).
- [ ] **Layouting**
    - [ ] Create `MainLayout` (Navbar, Footer).
    - [ ] Implement Dark Mode theme provider.

## Phase 2: Core Features (Days 4-7)
Цель: Реализовать просмотр и поиск серверов.

- [ ] **UI Components**
    - [ ] Create `ServerCard` (match design: dark bg, border, badges).
    - [ ] Create `Badge` variants (OAuth, Open, API Key).
    - [ ] Implement "Copy to Clipboard" functionality.
- [ ] **Data Fetching**
    - [ ] Implement Server Actions to fetch active servers.
    - [ ] Implement Client-side search (Fuse.js or simple `.filter()`).
- [ ] **Catalog Page**
    - [ ] Grid layout implementation (Responsive).
    - [ ] Empty states ("No servers found").

## Phase 3: Submission Flow (Days 8-10)
Цель: Позволить сообществу добавлять свои серверы.

- [ ] **Submission Form**
    - [ ] Design form (Name, URL, Auth, Description).
    - [ ] Zod schema validation.
    - [ ] Server Action for `INSERT` into DB.
    - [ ] Success/Error Toasts (Sonner/Hot-toast).
- [ ] **Admin Dashboard (Minimal)**
    - [ ] Hidden route `/admin` (protected by middleware).
    - [ ] List `pending` servers.
    - [ ] Approve/Reject buttons.

## Phase 4: Polish & SEO (Days 11-14)
Цель: Подготовка к релизу.

- [ ] **SEO**
    - [ ] Metadata generation (Open Graph images).
    - [ ] `sitemap.xml` dynamic generation.
    - [ ] JSON-LD schema for "SoftwareApplication".
- [ ] **Content**
    - [ ] Manually populate DB with top 20 popular MCP servers (e.g., Brave Search, Google Drive, Slack).
    - [ ] Write "How to use" guide on landing page.
- [ ] **Deployment**
    - [ ] Deploy to Vercel.
    - [ ] Connect custom domain.
    - [ ] Post-launch monitoring (Vercel Analytics).
```
