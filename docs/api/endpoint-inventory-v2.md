# API Endpoint Inventory and v2 Canonical Contracts

Date: 2026-03-01  
Owner: BE Lead

## Canonical v2 (blog publishing)
- `POST /api/admin/blog-v2/generate`
- `POST /api/admin/blog-v2/preview`
- `POST /api/admin/blog-v2/publish`

## Deprecated
- `GET|POST /api/blog/auto-publish`
  - Status: Deprecated
  - Successor: `/api/admin/blog-v2/*`
  - Sunset: 2026-06-05T00:00:00.000Z
  - Deprecation headers: `Deprecation`, `Sunset`, `Link: rel="successor-version"`

## Inventory groups
- Admin: `/api/admin/*`
- Catalog: `/api/catalog/*`
- Health: `/api/health`, `/api/health-check`
- Auth/Security: `/api/auth/security`, `/api/cookie-consent`
- Tasks/Multi-agent: `/api/tasks/*`, `/api/multi-agent/*`
- Server probes: `/api/server/[slug]/probe`

Machine-readable inventory:
- `docs/api/endpoint-inventory-v2.json`
- `docs/api/openapi-lite.yaml`
- `docs/api/openapi.yaml`

## Error model baseline
- `401`: Unauthorized
- `400`: Invalid payload
- `422`: Schema validation failed
- `500`: Internal error

## Next steps
- Keep `openapi-lite.yaml` and `openapi.yaml` aligned with the route inventory.
- Add route-level smoke coverage for `/api/admin/blog-v2/*` handlers if admin API browser tests become part of CI.
- Keep new backend route changes aligned with `docs/api/backend-route-standard.md`.
