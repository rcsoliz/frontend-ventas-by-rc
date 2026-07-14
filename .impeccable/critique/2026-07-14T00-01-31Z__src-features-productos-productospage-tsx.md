---
target: ProductosPage
total_score: 28
p0_count: 0
p1_count: 1
timestamp: 2026-07-14T00-01-31Z
slug: src-features-productos-productospage-tsx
---
Method: dual-agent (A: general-purpose design-review sub-agent · B: general-purpose detector/evidence sub-agent, run isolated in parallel via the Agent tool — the `impeccable` skill's own slash-invocation was unavailable this session, so the dual-agent orchestration was replicated manually per `.claude/skills/impeccable/reference/critique.md`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton/error/aria-busy all present; no inline confirmation beyond a transient toast. |
| 2 | Match Between System and Real World | 4 | n/a — Spanish labels, `Bs` currency prefix. |
| 3 | User Control and Freedom | 2 | No Cancel button in the create modal (Esc/backdrop/× only); no way to edit/deactivate a product once created. |
| 4 | Consistency and Standards | 3 | `ProductoForm` doesn't use `Input`'s per-field `error` prop the way `ClienteForm` does — one generic banner instead. Also missing `noValidate` (confirmed via grep: `ProductoForm.tsx:44` has no `noValidate` attribute), unlike Carrito/Historial/Clientes forms already fixed this pass. |
| 5 | Error Prevention | 2 | No live duplicate-name check; only native `min`/`step` constraints on number inputs. |
| 6 | Recognition Rather Than Recall | 4 | n/a. |
| 7 | Flexibility and Efficiency of Use | 1 | No search/sort/filter on the product table, no edit, no stock adjustment. |
| 8 | Aesthetic and Minimalist Design | 4 | n/a — clean, on-system. |
| 9 | Error Recovery | 3 | Backend text surfaces via `extraerMensajeError` but isn't field-anchored. |
| 10 | Help and Documentation | 2 | `Input`'s `hint` prop (used elsewhere) unused here — no unit/format guidance on Precio/Stock. |
| **Total** | | **28/40** | **Good — solid foundation, same native-validation gap as Carrito/Historial/Clientes, plus a real feature ceiling (create-only catalog)** |

## Anti-Patterns Verdict

**LLM assessment**: Not AI slop — composes existing primitives faithfully, no gradient/emoji/hero-metric tells. Reads as an intentionally thin feature slice (list + create-only) rather than an over-generated one.

**Deterministic scan**: `detect.mjs --json` on `src/features/productos`: exit 0, clean (`[]`). Grep confirmed `ProductoForm.tsx`'s `<form>` (line 44) has no `noValidate` — the fourth screen this pass to hit this exact root cause. No `autoComplete` or `aria-*` beyond the one `role="alert"` banner either. No browser visualization this run — no browser automation tool exposed in this session (documented fallback, not a failure).

## Overall Impression

The list/loading/empty/error branching is genuinely exhaustive and role-gating is honestly enforced end-to-end (hidden in the UI *and* backed by a passing test), which is more disciplined than most first passes at a CRUD screen. The two real gaps are of very different character: the missing `noValidate` is the same one-line root cause already fixed three times this pass and should be closed now; "catalog is create-only" is a genuine product gap, but there's no `actualizarProducto` (or deactivate) mutation anywhere in the GraphQL schema — this is a backend feature that doesn't exist yet, not a UI bug, so it's deferred rather than fixed in this pass (same treatment as the Clientes edit gap).

## What's Working

1. **Loading/empty/error/success branching (`ProductosPage.tsx:56-79`)** is exhaustive and mutually exclusive — no flash of the wrong state during a fetch.
2. **Role gating is honest, not decorative**: `puedeCrearProducto` hides both the button and the modal mount, and `ProductosPage.test.tsx` actually asserts this.
3. **Inherits prior shared-component fixes cleanly** — Table's focus-on-`<td>` and Modal's Tab trap both apply here with no regression.

## Priority Issues

**[P1] `ProductoForm` has no `noValidate` — native, English, unstyled browser validation tooltips.**
- **Why it matters**: Identical root cause already fixed on CarritoPage, HistorialVentasPage's sibling form, and ClienteForm this same review pass. Breaks brand voice (English popover in an all-Spanish product) at the first-friction point of the create flow.
- **Fix**: Add `noValidate` to the form; add empty/format validation reusing each `Input`'s `error` prop, same pattern as `ClienteForm.tsx`.
- **Suggested command**: `/impeccable harden`

**[P2] No Cancel button in the create modal.** Only Esc/backdrop/× close it — no visible, clickable exit for a first-timer. — `/impeccable clarify`

**[P2] Catalog is create-only — no edit, deactivate, or restock anywhere in `productos/`.** No `actualizarProducto`-equivalent mutation exists in the GraphQL schema yet, so this is a backend gap, not fixable in this pass; worth adding to `ROADMAP_FRONTEND.md` (currently only lists `crearProducto`/alta as in-scope for Productos). — tracked, not commanded

**[P2] Error display not field-anchored.** `ProductoForm` falls back to one generic `<p role="alert">` banner instead of mapping backend field errors onto `Input`'s `error` prop like `ClienteForm` does. — `/impeccable harden`

**[P3] No duplicate-name anticipation before submit**, despite PRODUCT.md/DESIGN.md calling for anticipating duplicates visually. — `/impeccable clarify`

**[P3] No search/sort on the product table.** Thin for any catalog beyond a handful of items. — `/impeccable layout`

## Persona Red Flags

**Sam (Accessibility)**: Generic error banner isn't associated with the offending `<input>` via `aria-describedby` the way `ClienteForm` already does it — a screen-reader user gets an undifferentiated "algo salió mal," not a pointer to the bad field.

**Alex (Power User/Admin)**: Can't fix a typo'd product or retire a discontinued one without leaving this screen — routine catalog maintenance is a dead end today.

**Jordan (First-Timer)**: No visible Cancel button in the create modal; the first instinct (clicking something, not pressing Esc) has no target.

## Minor Observations

- `precio` renders via raw string interpolation (`ProductosPage.tsx:36`), no thousands separator for larger prices.
- No low/zero-stock visual cue in the Stock column despite stock being a named business rule elsewhere in the app.
- `descripcion` is unbounded with `white-space: nowrap` cells — long descriptions could force wide horizontal scroll (spec-compliant, but a max-width/truncate + tooltip would read better).
