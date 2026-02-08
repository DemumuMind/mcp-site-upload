---

### 3. Файл: `demumumind-mcp-project.md`
**Назначение:** Общее описание продукта (Vision), дизайн-код и маркетинговое позиционирование. То, что читает PM или дизайнер.

```markdown
# Project: DemumuMind MCP
**Concept:** The "App Store" for AI Agents.
**Date:** 07.02.2025

## 1. Executive Summary
Централизованный, курируемый каталог MCP (Model Context Protocol) серверов.
Позволяет пользователям LLM (Claude Desktop, Zed, IDEs) и разработчикам AI-агентов быстро находить, проверять и подключать инструменты для своих моделей.

## 2. Problem Statement
*   **Фрагментация:** MCP-серверы разбросаны по GitHub, Twitter и Discord.
*   **Доверие:** Сложно понять, безопасен ли сервер, требует ли он API ключи и работает ли вообще.
*   **Сложность:** Нет единого стандарта описания возможностей (Tools) до установки.

## 3. Solution & Key Features
*   **Unified Interface:** Единый дашборд с поиском и фильтрацией.
*   **Instant Config:** Кнопка копирования готового конфига для `claude_desktop_config.json`.
*   **Verification:** Маркеры "Verified" для серверов от известных компаний (Atlassian, Linear, etc.).
*   **Open Submission:** Любой разработчик может предложить свой сервер через форму.

## 4. Design Guidelines (Visual Identity)
Основано на скриншотах референса.

*   **Atmosphere:** Deep Tech, Cyberpunk-lite, Professional.
*   **Colors:**
    *   `Background`: `#030711` (Rich Black) or `#0f172a` (Slate 900).
    *   `Card Surface`: `#1e293b` (Slate 800) with slight transparency.
    *   `Primary Accent`: `#3b82f6` (Blue 500) -> `#60a5fa` (Blue 400).
    *   `Text`: Inter font, high contrast headers, muted descriptions (`text-slate-400`).
*   **UI Patterns:**
    *   Glassmorphism (blur) на хэдере.
    *   Subtle gradients on borders (border-gradient).
    *   Micro-interactions on hover (scale up, glow).

## 5. User Personas
1.  **Power User:** Использует Claude Desktop, хочет подключить "Google Calendar" и "Linear" для управления задачами голосом.
2.  **AI Developer:** Ищет готовые MCP-серверы, чтобы не писать интеграцию с Stripe/Slack с нуля.
3.  **Server Maintainer:** Хочет трафик на свой GitHub репозиторий с MCP-сервером.

## 6. Future Expansion Ideas
*   **Reviews/Ratings:** Рейтинг серверов сообществом.
*   **One-click Install:** Десктопное приложение-компаньон для автоматической правки конфигов.
*   **Monetization:** Платное размещение ("Featured Server") или продажа Premium MCP серверов.
```
