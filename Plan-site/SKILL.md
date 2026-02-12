---
name: Plan-site
description: Use when planning or refactoring this site/repository. Enforces the Plan -> Check -> Plan -> Final verification loop with explicit hypothesis, architecture, and risk control.
metadata:
  category: discipline
  triggers: plan-site, plan, refactor, catalog, hypothesis, architecture, plan-check-plan, final verification
---

# Plan-site

Discipline for all repository work: plan first, verify facts second, refine plan third, and only then claim completion.

## When to use

- You need to plan/refactor (especially around the Catalog page).
- You need explicit hypothesis and architecture before implementation.
- You want to avoid guesswork-driven coding.
- You need a repeatable format: **Plan > Check > Plan > Final verification**.

## Mandatory loop

1. **Plan v1**
2. **Check v1** (fact-check against code/data/environment)
3. **Plan v2** (decision-complete)
4. **Final verification** (before claiming done)

If any step is skipped, the task is not complete.

## Plan v1 must include

1. **Hypothesis** — why the approach should work.
2. **Success Criteria** — measurable outcomes.
3. **Scope In/Out** — what is included/excluded.
4. **Architecture** — layers/modules/contracts affected.
5. **Implementation Steps** — ordered execution steps.
6. **Test Scenarios** — functional and regression checks.
7. **Risks + Mitigation** — key risks and controls.
8. **Rollback** — safe rollback path.

## Check v1 guidance

Verify facts, not assumptions:

- exact files/functions to edit;
- existing components/utilities to reuse;
- impacted interfaces (routes/API/types);
- side effects (cache, invalidation, auth, SEO, i18n, a11y);
- required verification commands.

If findings differ from assumptions, update **Plan v2**.

## Plan v2 must be decision-complete

After reading Plan v2, the implementer should not need to make new architectural decisions.

Include:

- exact files/modules;
- interface/type/contract changes (if any);
- concrete acceptance criteria;
- verification checklist with expected outcomes.

## Multi-side thinking

Before finalizing the plan, review at least these axes:

1. Product / User Value
2. Architecture
3. Data & Migration
4. Security
5. Performance
6. SEO / i18n / Accessibility
7. Operations / Observability
8. Delivery Risk / Rollout / Rollback

## Final verification (required)

Minimum gate:

1. `npm run check:utf8:strict`
2. `npm run lint`
3. `npm run build`
4. Browser/UI checks with Playwright/DevTools (for UI changes)

Report must include:

- executed commands;
- actual outcomes;
- any failures and reason;
- residual risks.

## Anti-patterns

- Implementing before clear hypothesis/success criteria.
- Claiming done without evidence.
- Duplicating logic instead of reusing.
- Ignoring cache/invalidation/routing impact after refactor.
- Treating assumptions as facts.

## Quick template

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
- [ ] Browser/UI checks (if applicable)

### Risks / Rollback
- Risk: ...
- Mitigation: ...
- Rollback: ...
```

## Required opening sentence

`Using Plan-site skill: Plan > Check > Plan > Final verification.`
