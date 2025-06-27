# TandT Migration Ledger - 2506271500

## State (Before Migration)
- Root `app`, `components`, `lib` directories contain prototype Next.js implementation with partial features and complex UI.
- `prototypes_tandt_250627_aistudio` holds a Vite/React prototype which has cleaner workflow proven by AI Studio.

## Intention
Migrate the most valuable UI/logic patterns from AI-Studio prototype into the Next.js application, eventually replacing redundant prototype code and consolidating into a single, visually polished, maintainable app.

## High-Level Tasks
1. Compare data models – ensure `lib/types.ts` aligns with prototype `types.ts`; unify naming (camelCase vs PascalCase).
2. Extract UI patterns from prototype components (Header, ElementCard, ComparisonModal, etc.) and port into Shadcn/Tailwind design system used in Next.js app.
3. Introduce global header/navigation with dark-mode toggle.
4. Replace duplicated/legacy components in `components/` with enhanced versions; adjust pages.
5. Audit services – decide whether to keep `lib/services/*` or prototype inline logic; refactor to single source.
6. Review state/event management; possibly replace manual fetch calls with internal service layer.
7. Remove stale mock Next.js API routes using in-memory arrays; wire to internal model store for SSR.
8. Update README & ROADMAP to merged vision; delete prototype duplicates.
9. Manual smoke test: create Decision & Performance models, complete flows, ensure UI parity with screenshots.

## Evolution Log
- 2025-06-27 15:00 – Initial ledger created, captured current state and migration plan. 