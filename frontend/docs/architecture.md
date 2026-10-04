# Frontend architecture

## Boundaries

- `src/app`: routing, layouts, metadata, and route composition.
- `src/features`: business capabilities migrated independently from the legacy site.
- `src/components/ui`: shadcn/ui primitives owned by the project.
- `src/components/shared`: Del Mar components composed from local UI primitives.
- `src/integrations`: adapters for external UI and animation libraries.
- `src/styles`: design tokens, global theme mapping, and motion accessibility.
- `src/lib`: framework-independent helpers.
- `src/config`: typed project configuration.

## Third-party UI

External components are copied or installed into a dedicated integration area,
then wrapped with Del Mar semantics and tokens. Feature code imports the wrapper,
not the source package. This keeps Skiper UI, registry components, Refero-derived
patterns, and future libraries replaceable.

## Animation

No animation runtime is installed by default. The adapter contracts support CSS,
Motion, GSAP, or scroll utilities per feature. Only client components may load a
browser animation runtime, preferably through dynamic imports. Every adapter must
support `prefers-reduced-motion` and return cleanup for listeners and timelines.

## Design system

Brand colors, spacing, radii, shadows, and motion curves live in
`src/styles/tokens.css`. Tailwind and shadcn semantic variables map to those tokens
in `src/app/globals.css`. Avoid hardcoded library colors in features.
