# Catalog Improvement — Brainstorming Outcome (v1)

Date: 2026-02-17  
Mode: Brainstorming (design-only, no implementation)

## Understanding Summary
- Improve existing `/catalog` experience, not a rebuild.
- First iteration is **Balanced MVP** across UX, search relevance, conversion, and performance.
- Primary users are both developers/integrators and founders/PMs.
- Success metrics combine engagement, conversion, and search quality.
- Performance target: mobile interactivity <= 1.5s, filter response <= 200ms.
- Trust model: show all entries, but rank/label by trust.
- Reliability model: fail-soft using latest valid snapshot + degradation notice.

## Assumptions
- Current architecture (`CatalogSection`, query-v2, snapshot/search flow) is retained.
- Existing trust signals (verification, health, GitHub linkage) are available for scoring.
- v1 uses lightweight analytics events, no heavy BI overhaul.
- Scope focuses on catalog journey first; deep SEO/system-wide redesign is out of scope.

## Accepted Design Approach
**Option A: Intent + Trust + Speed** (recommended and approved)

### Core architecture
1. **Ranking Layer**: combines text relevance + trust score + quality signals.
2. **UX State Layer**: clear filters, stable URL-state, stronger active-filter feedback.
3. **Resilience Layer**: snapshot fallback during API/search degradation.

### Data flow
1. User updates query/filters.
2. System builds normalized query signature.
3. Ranking computes final score (`relevance*w1 + trust*w2 + quality*w3`).
4. UI renders sorted paginated results + facets.
5. Analytics events fire on key actions.

### Conversion design
- Stronger primary CTA on cards.
- Contextual “Submit server” CTA in result and empty-state paths.

### Reliability behavior
- On live-search/API failure, show latest valid snapshot.
- Show clear non-blocking degradation banner.

### Edge cases
- Zero-result state: guided “remove restrictive filters” actions.
- High-query + narrow filters: related suggestions.
- Low-trust but relevant records: visible, downgraded rank, explicit label.

## Decision Log
1. **Balanced MVP** selected over single-focus stream.
   - Why: needed broad but controlled gains across 4 priorities.
2. **Dual-audience target** (developers + founders/PMs).
   - Why: both are primary catalog users.
3. **Fail-soft reliability** selected.
   - Why: keeps catalog useful during partial outages.
4. **Evolutionary architecture** over full refactor.
   - Why: lower risk, faster delivery.
5. **Trust affects ranking/labels, not visibility**.
   - Why: preserves completeness with transparent quality cues.
6. **Performance SLA fixed** (<=1.5s mobile interactivity, <=200ms filter response).
   - Why: explicit non-functional target for v1 acceptance.

## Risks to track
- Ranking weight tuning may require iteration.
- Trust-score transparency must remain understandable to users.
- Performance targets may be sensitive to mobile hardware/network variance.

## Exit Criteria Check (Brainstorming)
- Understanding lock confirmed: ?
- Design approach accepted: ? (Option A)
- Assumptions documented: ?
- Key risks acknowledged: ?
- Decision log complete: ?

## Next Step (Implementation Handoff)
Create implementation plan with:
- file-level changes,
- interface/type updates,
- analytics event map,
- verification commands and acceptance checks,
- rollback strategy.
