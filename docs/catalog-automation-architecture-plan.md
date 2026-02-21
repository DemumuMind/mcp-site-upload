# План в 1 файл: архитектура автоматизации каталога

## 1) Цель и контекст

Маршрут `http://localhost:3000/catalog` уже работает как витрина с SSR-снапшотом, фильтрами, URL-синхронизацией и API-поиском. Задача этого плана: зафиксировать целевую end-to-end архитектуру автоматизации каталога с учетом уже внедренного, снизить операционные риски и определить поэтапную реализацию.

## 2) Что уже внедрено (as-is)

### UI и чтение каталога
- Страница каталога: `app/catalog/page.tsx`.
- Клиентская логика каталога и фильтров: `components/catalog-section.tsx`, `components/catalog-filter-bar.tsx`, `components/catalog-taxonomy-panel.tsx`.
- API поиска: `app/api/catalog/search/route.ts`.
- Поисковая и фильтрационная логика: `lib/catalog/server-search.ts`, `lib/catalog/filtering.ts`, `lib/catalog/sorting.ts`, `lib/catalog/facets.ts`, `lib/catalog/query-v2.ts`.
- Чтение активных серверов из Supabase + нормализация: `lib/servers.ts`.
- Snapshot/L2 кеш: `lib/catalog/snapshot.ts`.

### Автоматизация ingest/sync
- Основной cron ingest: `app/api/catalog/auto-sync/route.ts` -> `lib/catalog/github-sync.ts`.
- Дополнительные источники: `app/api/catalog/smithery-sync/route.ts` + `lib/catalog/smithery-sync.ts`, `app/api/catalog/npm-sync/route.ts` + `lib/catalog/npm-sync.ts`.
- Агрегированный sync: `app/api/catalog/sync-all/route.ts`.
- Health и статус автоматизации: `app/api/catalog/health-check/route.ts`, `app/api/catalog/automation-status/route.ts`.
- Расписание cron: `vercel.json` (в проде регулярно запускается только `/api/catalog/auto-sync`).

### Данные и операционный контур
- Базовая схема и индексы: `supabase/migrations/20260208071000_init_mcp_catalog.sql`.
- Health-поля в БД: `supabase/migrations/20260208074000_server_health_checks.sql`.
- Seed и исправления seed-данных: `supabase/migrations/20260208080000_seed_top_mcp_servers.sql` и последующие fix migrations.
- Мониторинг в CI/GitHub Actions: `.github/workflows/catalog-automation-status.yml`, `.github/workflows/catalog-count-guard.yml`.

## 3) Основные проблемы текущей архитектуры

1. Несогласованность лимитов и поведения между кодом и документацией (часть env-переменных задокументирована, но не влияет на runtime).
2. Нет распределенного lock/idempotency ключа на запуск cron-sync, возможны гонки параллельных запусков.
3. В prod-cron регулярно синхронизируется только GitHub auto-sync; NPM/Smithery/health не встроены в единый стабильный график.
4. Неполная защита ручных правок от перезаписи внешними sync-процессами.
5. Недостаточное тестовое покрытие API-роутов автоматизации (`app/api/catalog/*` в основном без контрактных интеграционных тестов).
6. In-memory rate limiting не распределен по инстансам (ограничение размывается в горизонтальном масштабе).

## 4) Целевая архитектура (to-be)

### 4.1 Принципы
- Idempotent-by-default для каждого sync-run.
- Source-aware upsert: данные хранят происхождение и правила приоритета источников.
- Safe-by-default: защита от массовой деградации, SSRF, случайной деактивации/очистки.
- Observable-by-default: статус, метрики, аудит-runов и алерты.

### 4.2 Логические слои

1. **Ingestion Layer**
   - Коннекторы источников: GitHub, NPM, Smithery.
   - Каждый коннектор возвращает единый нормализованный контракт `CatalogCandidate`.

2. **Normalization & Scoring Layer**
   - Нормализация slug/url/title/tags/auth/transport/tools.
   - Дедупликация по `slug` + вторичный ключ (`repo_url`/нормализованный хост+путь).
   - Выставление `quality_score` и `confidence` с объяснимыми причинами.

3. **Persistence Layer**
   - Upsert в `servers` с конфликтом по `slug`.
   - Поля provenance: `source_last`, `source_updated_at`, `managed_by_automation`.
   - Политики merge, где manual-поля защищены от автоматического перезаписывания.

4. **Orchestration Layer**
   - Единая точка запуска `sync-all` как оркестратор.
   - Поэтапные run-стадии: fetch -> normalize -> validate -> upsert -> stale-policy -> revalidate/cache purge.
   - Run lock + idempotency key на запуск.

5. **Serving Layer**
   - Snapshot + Redis L2 для чтения каталога.
   - API `/api/catalog/search` использует стабильный контракт ответа и версии schema.

6. **Health/Monitoring Layer**
   - Единый health pipeline для каталога.
   - Audit-таблица запусков и ошибок по стадиям.
   - Automation-status endpoint отражает последние N run-ов и SLO.

### 4.3 Поток данных (целевой)

1. Cron/ручной вызов -> `POST /api/catalog/sync-all`.
2. Оркестратор берет distributed lock (`run_id`, `started_at`, `source_scope`).
3. Параллельный fetch из источников с ограничениями по времени и ретраями.
4. Нормализация, дедупликация, quality-gates.
5. Idempotent upsert + selective merge (manual-safe).
6. Safety checks: max stale ratio, min active baseline, failure budget.
7. Обновление snapshot/cache + revalidate.
8. Запись результатов в `catalog_sync_runs` и `catalog_sync_failures`.
9. Публикация статуса в `/api/catalog/automation-status` и алерт при деградации.

## 5) Модель данных (минимальные расширения)

### 5.1 Таблицы
- `catalog_sync_runs`
  - `id`, `started_at`, `finished_at`, `trigger`, `status`, `sources`, `fetched`, `upserted`, `failed`, `stale_marked`, `duration_ms`, `error_summary`.
- `catalog_sync_failures`
  - `id`, `run_id`, `source`, `entity_key`, `stage`, `error_code`, `error_message_sanitized`, `payload_hash`.

### 5.2 Расширение `servers`
- `source_last text`.
- `source_updated_at timestamptz`.
- `managed_by_automation boolean`.
- `manual_lock_fields jsonb` (опционально: перечень полей, которые нельзя авто-перезаписывать).

## 6) Политики merge и stale

1. При конфликте manual vs automation приоритет у manual-полей (описание, curated tags, moderation status).
2. Automation может обновлять только whitelist полей по source policy.
3. Stale-mark выполняется только при выполнении safety-гардов:
   - `active_after_sync >= min_active_baseline`.
   - `stale_mark_ratio <= max_stale_mark_ratio`.
4. Удаление/архивация записей только через grace period и только для `managed_by_automation=true`.

## 7) API-контракты автоматизации

### `POST /api/catalog/sync-all`
- Вход: `{ sources?: ["github"|"npm"|"smithery"], dryRun?: boolean, pageLimit?: number }`.
- Выход: `{ runId, status, stages, counters, warnings, failures[] }`.

### `GET /api/catalog/automation-status`
- Выход: `{ now, health, lastRun, lastSuccessAt, slo, recentRuns[] }`.

### `GET /api/catalog/search`
- Версионирование ответа: `schemaVersion`.
- Стабильные поля facet/filter/pagination для обратной совместимости UI.

## 8) Безопасность

1. Все maintenance endpoints под `CRON_SECRET`/служебной авторизацией.
2. SSRF-safe health checks (allowlist/deny private ranges/timeout/bounded redirects).
3. Санитизация ошибок в API-ответах и audit-логах.
4. Ограничение blast radius: feature flags для stale cleanup и destructive-операций.
5. Секреты только через env, без логирования чувствительных значений.

## 9) Наблюдаемость и SLO

### Метрики
- `sync_run_success_rate`.
- `sync_duration_p95`.
- `catalog_active_count`.
- `failed_entities_ratio`.
- `stale_mark_ratio`.

### SLO (предложение)
- Успешный daily sync >= 99% (скользящие 30 дней).
- `automation-status` всегда доступен (>= 99.9%).
- Доля частичных запусков (`207`) <= 5% в неделю.

### Алерты
- Нет успешного sync > 24ч.
- Падение `catalog_active_count` ниже baseline-порога.
- Рост `failed_entities_ratio` выше порога.

## 10) Тестовая стратегия (обязательная для автоматизации)

1. Unit: нормализация/дедуп/merge-policy в `lib/catalog/*`.
2. Integration: контракт и авторизация для всех `app/api/catalog/*` automation endpoints.
3. E2E: smoke для `/catalog` + сценарии URL/filter + пустые результаты.
4. Ops smoke: проверка `/api/catalog/automation-status` и count guard на целевом окружении.
5. Регрессии на safety guards (stale ratio, baseline floor, partial failures).

## 11) План внедрения (итеративно)

### Этап 1: Stabilize
- Ввести `catalog_sync_runs` + run-level аудит.
- Добавить distributed lock для `sync-all` и `auto-sync`.
- Устранить расхождения env/docs/code по лимитам и safety-переменным.

### Этап 2: Source-aware merge
- Добавить provenance-поля в `servers`.
- Реализовать whitelist merge-policy и защиту manual-полей.
- Перевести автоматические процессы на `sync-all` как единую точку оркестрации.

### Этап 3: Reliability and observability
- Встроить NPM/Smithery в регулярный график или в orchestrated run.
- Добавить алерты и SLO-дашборд.
- Закрыть integration-тестами все automation endpoints.

### Этап 4: Optimization
- Улучшить дедуп по repo identity/host normalization.
- Оптимизировать кеш-инвалидацию и latency поиска.
- Добавить controlled backfill/replay механизм.

## 12) Verification Gate для изменений этой зоны

Минимум перед merge:
1. `npm run check:utf8`
2. `npm run lint`
3. `npm run build`
4. `npm run test -- tests/catalog-filters.spec.ts`
5. `npm run verify:dashboard:metrics -- --base-url <env-url>`
6. `npm run catalog:count:guard -- --base-url <env-url> --min-total <threshold>`

## 13) Критерии готовности архитектуры

- Нет гонок при параллельных cron-запусках.
- Ручные правки не теряются из-за ingest.
- Любой sync-run воспроизводим и трассируем по `run_id`.
- Статус автоматизации показывает операционную правду (не только last ping).
- UI `/catalog` сохраняет стабильный контракт фильтров/фасетов при внутренних изменениях автоматизации.
