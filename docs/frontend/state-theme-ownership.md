# State and Theme Ownership Matrix

Date: 2026-03-01  
Owner: FE Lead

## Theme ownership
- Global theme provider: `components/theme-provider.tsx` (`next-themes`).
- Theme classes and tokens: `app/globals.css`.
- Supported themes: `dark`, `light`, `high-contrast`.

## State ownership
- Route data state: server components in `app/*` and domain services in `lib/*`.
- Interaction/local UI state: client components in `components/*`.
- Auth/session state: Supabase session + route-protected server checks.

## Hydration stability rules
- Theme is resolved via class-based provider (`attribute="class"`) to avoid inline style drift.
- Avoid duplicating server-fetched route state in client local stores without explicit invalidation.
