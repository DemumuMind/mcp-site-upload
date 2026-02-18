# Design System: DemumuMind MCP - Industrial Neo
**Project ID:** local-repo:mcp-site

## 1. Visual Theme & Atmosphere
The interface now follows **Industrial Neo**: forged-metal depth, controlled amber energy, and clean machine-grid structure. It is dark, technical, and premium, with clarity-first content hierarchy.

Design intent:
- Establish a high-contrast, industrial control-room baseline.
- Replace neon-plasma surfaces with metal + ember accents.
- Keep visual power without sacrificing readability or focus cues.

## 2. Color Palette & Roles
- **Coal Black** (`#080909`) - global foundation and deep backdrop.
- **Cinder Surface** (`#121414`) - primary surface and shell.
- **Forged Iron** (`#1F2527`) - secondary surfaces, controls, and blocks.
- **Steel Midtone** (`#2F383B`) - muted surfaces and separators.
- **Smoke Text** (`#AAB6BA`) - supporting copy.
- **Ivory Ink** (`#F3F6F7`) - primary content text.
- **Forge Ember** (`#F6A623`) - primary action and signal.
- **Hot Ember** (`#FFCC4D`) - focus, active glow, and highlight edge.

Functional usage:
- CTA and interactive emphasis use ember with dark foreground text.
- Panels and cards use cinder/iron surfaces with soft white border contrast.
- Dividers and strokes are semi-opaque whites tuned for dark metal surfaces.
- Alert/destructive actions remain red for semantic clarity.

## 3. Typography Rules
- **Primary family:** Inter / Space Grotesk stack.
- **Headlines:** Ivory, crisp, compact.
- **Body text:** Ivory and Smoke mix for hierarchy.
- **Emphasis:** short amber highlight spans only; avoid full gradient body text.

## 4. Component Stylings
- **Buttons:** Dense industrial geometry (rounded-lg/xl), ember emphasis for primary.
- **Cards/Containers:** Dark forged panels, subtle blur, restrained elevation.
- **Inputs/Forms:** High-contrast text, clear border states, strong focus ring.
- **Badges:** Compact metal chips with amber highlights for status.
- **Navigation:** Structural dark strip with visible keyboard focus and contrast-safe links.

## 5. Layout Principles
Layer order:
1. Coal foundation,
2. ember radial wash,
3. machine-grid texture,
4. foreground content.

Guidelines:
- Keep intense visual effects in hero/backdrop layers only.
- Preserve spacing around dense content blocks.
- Avoid decorative noise inside data-heavy modules.

## 6. Accessibility & Motion
- Maintain high contrast on all semantic roles.
- Visible keyboard focus is mandatory (`:focus-visible` ring with dual contrast layers).
- Respect `prefers-reduced-motion: reduce` by minimizing animations/transitions.

## 7. Implementation Notes (Current Repo)
- Feature flag: `NEXT_PUBLIC_REDESIGN_V3`.
- Theme switch priority: `industrial-neo` (v3) -> `blacksmith-v2` (v2) -> `cosmic-burst` (fallback).
- Token contract and compatibility aliases live in `app/globals.css`.
- Flag parsing and helpers live in `lib/design-flags.ts`.
- Global background layers are chosen in `app/layout.tsx` by active theme.
