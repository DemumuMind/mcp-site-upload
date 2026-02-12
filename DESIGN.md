# Design System: DemumuMind MCP — Cosmic Burst
**Project ID:** local-repo:mcp-site

## 1. Visual Theme & Atmosphere
The interface uses a **Cosmic Burst** language: deep void-like backgrounds, kinetic radial energy, and neon plasma accents. The mood is cinematic, high-contrast, and futuristic, while keeping content readability above visual spectacle.

Design intent:
- Feel like motion through a nebula core (burst center + directional streaks).
- Keep UI surfaces legible through translucent indigo panels.
- Use glow as hierarchy, not decoration noise.

## 2. Color Palette & Roles
- **Void Black** (`#05050B`) — global base background and depth anchor.
- **Deep Indigo Field** (`#10163D`) — primary panel/surface mass.
- **Electric Blue** (`#2E5BFF`) — primary actions, key interactive emphasis.
- **Plasma Violet** (`#7A4DFF`) — secondary accents, badges, active states.
- **Neon Lilac** (`#E2B6FF`) — highlight glow, high-energy decorative accents.
- **Photon White** (`#F5F7FF`) — primary typography and high-priority labels.
- **Cosmic Fog** (`#BEC7FF`) — secondary text and muted supporting copy.

Functional usage:
- Main CTA = Electric Blue with controlled glow halo.
- Secondary/outline controls = Deep Indigo + border-cosmic stroke.
- Cards/forms = translucent indigo glass with low-noise blur.
- Dividers = soft periwinkle border opacity, never pure gray.

## 3. Typography Rules
- **Primary family:** Space Grotesk / Inter system stack.
- **Body text:** medium contrast (`Cosmic Fog`) for long reading comfort.
- **Headlines:** Photon White with tight tracking and occasional gradient emphasis.
- **Emphasis:** short gradient spans (Electric Blue -> Neon Lilac), never full paragraph gradients.

## 4. Component Stylings
- **Buttons:** Rounded-xl to pill-adjacent geometry, luminous edge ring, energetic hover brightening.
- **Cards/Containers:** Softly rounded (`2xl`) translucent indigo surfaces with atmospheric blur and subtle ambient glow.
- **Inputs/Forms:** Glass-like dark input wells, periwinkle outline on focus, readable placeholder contrast.
- **Badges:** Compact rounded chips, high chroma accents for taxonomy/status signaling.
- **Navigation:** Frosted cosmic strip with restrained glow and clear focus states.

## 5. Layout Principles
- Layering model:
  1. Void base,
  2. radial burst field,
  3. conic/radial energy texture,
  4. content surfaces.
- Keep long-form sections on calmer surfaces; reserve highest-intensity visuals for hero/transition zones.
- Use broad spacing and breathing room around dense data blocks.
- Preserve accessibility: maintain high text contrast and reduced-motion fallback for animated glow/pulse effects.

## 6. Motion & Interaction Guidelines
- Motion style: slow pulse and soft drift, not fast jitter.
- Hover behavior: brightness and glow increase, no hard movement jumps.
- Reduced motion: disable pulse/floating animation when `prefers-reduced-motion: reduce` is enabled.

## 7. Implementation Notes (Current Repo)
- Theme contract centralized in `app/globals.css` via semantic tokens (`--background`, `--primary`, etc.).
- Global atmospheric layers are mounted in `app/layout.tsx`.
- Reusable primitives (`Button`, `Card`, `Input`, `Textarea`, `Select`, `Badge`) carry the cosmic surface language.
- Route/page-specific color classes are remapped from neutral slate tones to indigo/violet-biased tones for coherent site-wide visual identity.
