---
name: Plan-site
description: Use when planning or refactoring this site/repository. Enforces the Plan -> Check -> Plan -> Final verification loop with explicit hypothesis, architecture, and risk control.
metadata:
  category: discipline
  triggers: plan-site, план, рефакторинг, каталог, hypothesis, architecture, plan-check-plan, финальная проверка
---

# Plan-site

Дисциплина для всех задач по сайту: сначала качественный план, потом проверка фактов, затем уточнённый план и только после этого финальная проверка.

## Когда использовать

- Нужно спланировать рефакторинг (особенно страницы **Каталог**).
- Нужна явная гипотеза и архитектура до реализации.
- Нужно исключить «кодинг на догадках».
- Нужен воспроизводимый формат: **Plan > Check > Plan > Final verification**.

## Обязательный цикл (без исключений)

1. **Plan v1**
2. **Check v1** (проверка фактов в коде/данных/окружении)
3. **Plan v2** (decision-complete)
4. **Final verification** (перед заявлением «готово»)

Если хотя бы один шаг пропущен — задача не считается завершённой.

## Что обязательно включать в Plan v1

1. **Hypothesis** — почему предложенное решение должно сработать.
2. **Success Criteria** — измеримые критерии успеха.
3. **Scope In/Out** — что делаем и что сознательно не делаем.
4. **Architecture** — какие слои/модули/контракты меняются.
5. **Implementation Steps** — пошаговый порядок работ.
6. **Test Scenarios** — функциональные и регрессионные сценарии.
7. **Risks + Mitigation** — ключевые риски и меры.
8. **Rollback** — как безопасно откатить изменения.

## Check v1: проверка фактов до реализации

Проверяй факты, а не предположения:

- где реальные точки изменения в коде;
- есть ли уже готовые компоненты/утилиты для переиспользования;
- какие публичные интерфейсы (routes/API/types) затрагиваются;
- где возможны побочные эффекты (кэш, invalidation, auth, SEO, i18n, a11y);
- какие проверки обязательны для этой задачи.

Если найдено расхождение — обязательно обновить **Plan v2**.

## Plan v2 должен быть decision-complete

Исполнитель после чтения Plan v2 не должен принимать новые архитектурные решения. В плане должны быть:

- точные файлы/модули для изменений;
- изменения интерфейсов/типов/контрактов (если есть);
- точные acceptance criteria;
- список проверок и ожидаемых результатов.

## Multi-side thinking (обдумать с нескольких сторон)

Перед финализацией плана пройти минимум по 8 осям:

1. Product / User Value
2. Architecture
3. Data & Migration
4. Security
5. Performance
6. SEO / i18n / Accessibility
7. Operations / Observability
8. Delivery Risk / Rollout / Rollback

## Final verification (обязательно перед «готово»)

Минимальный gate:

1. `npm run check:utf8:strict`
2. `npm run lint`
3. `npm run build`
4. Для UI-изменений: проверка в браузере (Playwright/DevTools) ключевых сценариев

Отчёт должен содержать:

- выполненные команды;
- фактический результат каждой команды;
- что не прошло (если есть) и почему;
- остаточные риски.

## Anti-patterns (запрещено)

- Начинать реализацию без сформулированной гипотезы и критериев успеха.
- Говорить «готово» без верификации командами.
- Дублировать логику вместо переиспользования.
- Игнорировать кэш/инвалидацию/маршрутизацию после рефакторинга.
- Подменять проверенные факты предположениями.

## Быстрый шаблон

```md
### Hypothesis
...

### Success Criteria
- ...

### Plan v1
1. ...
2. ...

### Check v1 Findings
- ...

### Plan v2 (Decision-complete)
1. ...
2. ...

### Final Verification
- [ ] npm run check:utf8:strict
- [ ] npm run lint
- [ ] npm run build
- [ ] Browser/UI checks (если применимо)

### Risks / Rollback
- Risk: ...
- Mitigation: ...
- Rollback: ...
```

## Обязательная фраза в начале работы

`Использую skill Plan-site: работаем по циклу Plan > Check > Plan > Final verification.`
