---
target: DetalleVentaPage
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-07-14T00-07-45Z
slug: src-features-ventas-historial-detalleventapage-tsx
---
Method: dual-agent (A: general-purpose design-review sub-agent · B: general-purpose detector/evidence sub-agent, run isolated in parallel via the Agent tool — the `impeccable` skill's own slash-invocation was unavailable this session, so the dual-agent orchestration was replicated manually per `.claude/skills/impeccable/reference/critique.md`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `SkeletonTable` only mimics the line-items table; the summary card and facturación placeholder pop in with no skeleton, causing a layout jump. |
| 2 | Match Between System and Real World | 4 | n/a — correct Spanish business terms throughout. |
| 3 | User Control and Freedom | 3 | Only exit is one small text link ("← Volver al historial"); Cliente/Vendedor/Producto names are plain text, no link to their own records. |
| 4 | Consistency and Standards | 2 | Error branch has `role="alert"`; the not-found branch two lines below doesn't. Not-found also uses a raw `<p>` instead of the `EmptyState` component every sibling list page (Historial/Clientes/Productos) uses for its equivalent state. |
| 5 | Error Prevention | 3 | n/a mostly — read-only page; malformed/empty `idVenta` is handled gracefully by the error/not-found branches. |
| 6 | Recognition Rather Than Recall | 4 | n/a — everything needed is on one screen. |
| 7 | Flexibility and Efficiency of Use | 2 | No print/export, no retry on query failure (`useVenta` doesn't expose `refetch`), no links out to related records. |
| 8 | Aesthetic and Minimalist Design | 4 | n/a — clean; dashed-border placeholder for the Fase 2 facturación card is a restrained way to signal "reserved, not implemented." |
| 9 | Error Recovery | 2 | Not-found message offers no recovery action beyond the tiny top link; error message has no "Reintentar." |
| 10 | Help and Documentation | 2 | n/a — consistent with the rest of the app. |
| **Total** | | **29/40** | **Good — one of the more disciplined screens in the set; the not-found state is the one real inconsistency** |

## Anti-Patterns Verdict

**LLM assessment**: Not AI slop. No gradients, no hero metrics, no generic icon soup. A sober grid of Cliente/Vendedor/Fecha/Total, a plain data table, and an honest dashed-border placeholder for unimplemented Fase 2 billing.

**Deterministic scan**: `detect.mjs --json` on `src/features/ventas/historial`: exit 2, one advisory finding — `design-system-font-size` at `DetalleVentaPage.module.css:35` (`font-size: 12px` off the DESIGN.md type ramp). Low-severity, folded into Minor Observations rather than treated as a priority issue. No browser visualization this run — no browser automation tool exposed in this session (documented fallback, not a failure).

## Overall Impression

This is one of the tightest screens reviewed this pass — correct money-column alignment, an honest "not yet built" placeholder instead of a fake feature, and a skeleton that matches the real table shape. The one real seam is that the not-found path (`idVenta` that doesn't resolve to a venta) was implemented before the app settled on `EmptyState` as its standard "nothing here" pattern, so it diverged: no `role="alert"`, no recovery action, inconsistent with every sibling screen's empty state.

## What's Working

1. **Skeleton→table shape match** for the line-items table reduces perceived jank almost 1:1.
2. **Dashed-border Fase 2 placeholder** communicates "intentionally not-yet" without apology copy — restrained and on-brand.
3. **Money grid alignment**: `align: "right"` on Cantidad/Precio/Subtotal matches DESIGN.md's numeric-column convention exactly.

## Priority Issues

**[P1] Not-found state is a second-class citizen.**
- **Why it matters**: `DetalleVentaPage.tsx:51-55` renders a bare `<p>` with no `role="alert"` and no recovery action, skipping the `EmptyState` pattern used identically on every sibling screen (Historial/Clientes/Productos). A screen-reader user gets silence instead of an announcement; a sighted user gets a dead end with only the tiny top-of-page link back.
- **Fix**: Replace the raw `<p>` with `EmptyState` (title + description + a "Volver al historial" action button), matching the pattern already established elsewhere.
- **Suggested command**: `/impeccable harden`

**[P2] No retry on query error.** `useVenta` doesn't expose `refetch`, so a flaky-connection error strands the user with static text and no in-page recovery. — `/impeccable harden`

**[P2] Dead-end identity fields.** Cliente, Vendedor, and each Producto name render as plain text with no link to their own record, even though those screens exist elsewhere in the app. — `/impeccable layout`

**[P3] Loading skeleton undersells the real layout.** Only the table card gets a skeleton; the summary card and placeholder card appear abruptly, producing a visible layout shift. — `/impeccable polish`

**[P3] `font-size: 12px` off the DESIGN.md type ramp** at `DetalleVentaPage.module.css:35` (detector-confirmed). — `/impeccable typeset`

## Persona Red Flags

**Sam (Accessibility)**: not-found state has no `role="alert"`/`status`, so a screen-reader user gets no announcement that the venta wasn't found.

**Alex (Power User)**: no way to jump from this receipt to the client's record, the vendor's record, or a product's record — forces a manual re-search every time.

**Riley (Stress Tester)**: a transient network error strands the user with static text and zero recovery path other than a full back-and-forth navigation.

## Minor Observations

- `String(venta.total)` vs. bare template interpolation for `precioUnitario`/`subtotal` — same `unknown`-typed Decimal scalar, handled two different ways in one file; harmless today but a footgun if the scalar's shape ever changes.
- The facturación placeholder card has no responsive collapse — on mobile it's just another full-width card to scroll past.
- `design-system-font-size` advisory at `DetalleVentaPage.module.css:35` (12px off-ramp) — low-severity, worth a look during a future `/impeccable typeset` pass.
