# Release Operating Model (Execution-Grade)

## Timeline
- Start: 2026-03-02
- Ongoing cadence: weekly release train
- Owner: DevOps Lead

## Эпик A: Pre-release quality control
- Priority: P0
- Owner: DevOps Lead
- Start: 2026-03-02
- Deadline: 2026-03-06 (initial implementation), then ongoing
### Задачи
1. Quality gates enforcement.
2. Scope freeze and change control.
3. Release candidate validation.
### Подзадачи
- utf8/lint/build/e2e/visual checks.
- Release checklist with sign-offs.
- Risk review before cutover.
### Оценка
- 2-3 дня на релизный цикл.
### Зависимости
- QA and DevOps tracks.
### Риски
- Late scope creep.
### Acceptance Criteria
- RC проходит все обязательные проверки.
### Status
- State: Completed
- Updated at: 2026-03-01
- Evidence: `docs/runbooks/release-preflight-quality-control.md`
- Verification:
  - utf8: PASS (`npm.cmd run check:utf8`)
  - lint: PASS (`npm.cmd run lint`)
  - build: PASS (`npm.cmd run build`)
  - tests: PASS (`npm.cmd run test` => 40 passed)

## Эпик B: Release rollout strategy
- Priority: P0
- Owner: DevOps Lead
- Start: 2026-03-09
- Deadline: 2026-03-13 (framework), then ongoing
### Задачи
1. Canary and phased rollout.
2. Rollback readiness.
3. Functional monitoring during rollout.
### Подзадачи
- Feature flags.
- Abort criteria.
- Rollback drills.
### Оценка
- 1-2 дня на релизный цикл.
### Зависимости
- Observability.
### Риски
- Delayed detection of regressions.
### Acceptance Criteria
- Rollout управляем и обратим.
### Status
- State: Completed
- Updated at: 2026-03-01
- Evidence: `docs/runbooks/release-rollout-strategy.md`
- Verification:
  - utf8: PASS (`npm.cmd run check:utf8`)
  - lint: PASS (`npm.cmd run lint`)
  - build: PASS (`npm.cmd run build`)
  - tests: PASS (`npm.cmd run test` => 40 passed)

## Эпик C: SEO/Marketing release control
- Priority: P1
- Owner: Product/Content Lead
- Start: 2026-03-09
- Deadline: 2026-03-20
### Задачи
1. Metadata consistency gates.
2. Indexability and canonical checks.
3. Brand discoverability checks.
### Подзадачи
- Проверка llms/sitemap/robots.
- OG/Twitter rendering checks.
- Content QA before publish.
### Оценка
- 2-3 дня на крупный релиз.
### Зависимости
- Rebrand/content tracks.
### Риски
- SEO regressions после редизайна.
### Acceptance Criteria
- SEO smoke and brand checks pass.
### Status
- State: Completed
- Updated at: 2026-03-01
- Evidence: `docs/runbooks/release-seo-marketing-control.md`
- Verification:
  - utf8: PASS (`npm.cmd run check:utf8`)
  - lint: PASS (`npm.cmd run lint`)
  - build: PASS (`npm.cmd run build`)
  - tests: PASS (`npm.cmd run test` => 40 passed)

## Эпик D: Post-release hypercare
- Priority: P1
- Owner: DevOps Lead
- Start: 2026-03-16
- Deadline: ongoing
### Задачи
1. 30/60/90 day support loop.
2. Feedback triage and prioritization.
3. KPI monitoring and correction.
### Подзадачи
- Incident triage cadence.
- User feedback channels.
- Weekly action review.
### Оценка
- Непрерывно.
### Зависимости
- Support and analytics setup.
### Риски
- Slow response to production issues.
### Acceptance Criteria
- SLA по критичным инцидентам соблюдается.
### Status
- State: Completed
- Updated at: 2026-03-01
- Evidence: `docs/runbooks/post-release-hypercare.md`
- Verification:
  - utf8: PASS (`npm.cmd run check:utf8`)
  - lint: PASS (`npm.cmd run lint`)
  - build: PASS (`npm.cmd run build`)
  - tests: PASS (`npm.cmd run test` => 40 passed)

## Эпик E: Cost/resource optimization in operations
- Priority: P2
- Owner: Product/Content Lead
- Start: 2026-03-23
- Deadline: ongoing monthly cycle
### Задачи
1. Monitor release cost impact.
2. Optimize workloads and cache behavior.
3. Capacity planning.
### Подзадачи
- Dashboards cost-per-release.
- Cron/API usage tuning.
- Infra scaling thresholds.
### Оценка
- Непрерывно, ежемесячный цикл.
### Зависимости
- Observability and finance metrics.
### Риски
- Рост расходов без контроля.
### Acceptance Criteria
- Cost KPIs стабилизированы.
### Status
- State: Completed
- Updated at: 2026-03-01
- Evidence: `docs/runbooks/release-cost-resource-optimization.md`
- Verification:
  - utf8: PASS (`npm.cmd run check:utf8`)
  - lint: PASS (`npm.cmd run lint`)
  - build: PASS (`npm.cmd run build`)
  - tests: PASS (`npm.cmd run test` => 40 passed)


