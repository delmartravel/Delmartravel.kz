# Integrations

Third-party UI and animation tools are isolated here. Components from Skiper UI,
shadcn-compatible registries, Motion, GSAP, or future libraries must be adapted
behind a local interface before feature code consumes them.

Do not import third-party animation packages directly from route components.
Keep shared motion values in `src/styles/tokens.css` and respect reduced motion.
