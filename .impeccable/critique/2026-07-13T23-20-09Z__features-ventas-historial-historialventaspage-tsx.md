---
target: HistorialVentasPage
total_score: 25
p0_count: 0
p1_count: 2
p2_count: 2
timestamp: 2026-07-13T23-20-09Z
slug: features-ventas-historial-historialventaspage-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence), run as two isolated sub-agents.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading/error states exist and are wired correctly; no indication of total record count or "live data" freshness. |
| 2 | Match Between System and Real World | 4 | Column order (Fecha/Cliente/Vendedor/Total) matches natural transaction narration; localized es-BO currency/dates. |
| 3 | User Control and Freedom | 1 | No filter, search, sort, or scoping — not even "solo mis ventas" for the logged-in vendedor. |
| 4 | Consistency and Standards | 3 | Faithful to the design system except the EmptyState on this screen omits the documented icon. |
| 5 | Error Prevention | 2 | No filter/search means nothing helps avoid misclicking in a long undifferentiated list. |
| 6 | Recognition Rather Than Recall | 3 | Columns labeled and visible on desktop; mobile gives no cue that more columns exist off-screen. |
| 7 | Flexibility and Efficiency of Use | 1 | No search/filter/sort/pagination on the screen PRODUCT.md frames as the administrador's audit-control surface. |
| 8 | Aesthetic and Minimalist Design | 4 | Exemplary execution of "The Ledger" — the strongest score on the sheet. |
| 9 | Error Recovery | 2 | Error is announced (`role="alert"`) but offers no retry action. |
| 10 | Help and Documentation | 2 | None needed for something this simple, and none offered — acceptable but zero affordance beyond hover. |
| **Total** | | **25/40** | **Acceptable — significant improvements needed (mainly control/flexibility), execution quality is high.** |

## Anti-Patterns Verdict

**LLM assessment**: Does not read as AI-generated. Consistent, disciplined execution of "The Ledger" (hairline borders, single black accent, caption-style uppercase headers reserved for metadata). None of the SaaS-dashboard clichés (identical KPI cards, gradients, hero numbers).

**Deterministic scan**: `detect.mjs` on the two target files: exit 0, clean. The browser-injected detector (whole-page scan) flagged `single-font` and `flat-type-hierarchy` (app-wide metrics, already accounted for — the 20px value is the documented `page-title` role, not a violation) and `cramped-padding` on the Table wrapper. **Investigated and resolved as a false positive**: the wrapper's visual inset comes from each cell's own padding (`td`/`th`), not wrapper padding — that's the correct way to build a table, not a defect. It's also a shared-component concern (`Table.module.css`), not specific to this page's own files.

## Overall Impression

This screen is the strongest visual execution of "The Ledger" reviewed so far, and it's also the app's post-login landing screen — which makes its biggest gap (zero filter/search/sort, and a keyboard focus indicator that's technically present but doesn't actually paint) more consequential than it would be on a secondary screen. Both are hardening/control-surface gaps, not aesthetic ones.

## What's Working

1. **Real discipline in the visual system**: hairline borders instead of shadow, one black accent, no decorative clutter — a reference-quality execution of the documented system.
2. **Keyboard operability is genuinely implemented, not markup-deep**: every row has `role="button"`, `tabIndex`, and an `onKeyDown` handler for Enter/Space, confirmed live (Enter on a focused row navigates correctly to the detail page).
3. **AppLayout's mobile drawer (fixed earlier this pass) holds up under real accessibility scrutiny**: `inert` on the offstage sidebar, focus moves to the first link on open and back to the toggle on close, Escape closes it.

## Priority Issues

**[P1] Keyboard focus on table rows is technically present but never visually paints.**
- **Why it matters**: Confirmed via screenshot — `getComputedStyle` reports the correct `outline` on the focused `<tr>`, but nothing visible renders (a known Chromium limitation: `outline` frequently fails to paint on `<tr>` inside `border-collapse: collapse` tables). This directly violates PRODUCT.md's explicit "foco visible en todos los controles interactivos" standard, on the app's post-login landing screen.
- **Fix**: move the focus treatment off the `<tr>` itself onto its `<td>` children (which paint reliably), combined with a background tint so keyboard users get at least the same feedback mouse users get from hover.
- **Suggested command**: `/impeccable harden`

**[P1] No filter, search, or scoping mechanism on the screen framed as the administrador's audit-control surface.**
- **Why it matters**: `useVentas()` fetches the full unfiltered list with no arguments. With real transaction volume this becomes a single long undifferentiated scroll with no way to find one sale, and it mixes every vendedor's sales together with no way to scope to "mine."
- **Fix**: client-side search over cliente/vendedor name plus an opt-in "solo mis ventas" scope, anchored above the table.
- **Suggested command**: `/impeccable clarify`

**[P2] Mobile table gives no affordance that it's horizontally scrollable.** VENDEDOR/TOTAL are fully clipped with no fade/shadow cue. — `/impeccable polish`

**[P2] EmptyState omits the documented icon, and its copy references "el catálogo de productos" while the button underneath says "Nueva venta"** — a language mismatch at a first-run trust moment. — `/impeccable clarify`

**[P3] Error state has no retry action**, only text — the only recovery path is a manual page refresh. — `/impeccable harden`

## Persona Red Flags

**Alex (administrador, the "control" persona this screen is explicitly for)**: no search, no column sort, no export — a real audit task would push Alex back to a spreadsheet, the exact tool this product claims to replace.

**Sam (accessibility)**: the sharpest finding this pass — focus is technically correct but invisible, so a keyboard user has no way to know which row is about to open without pressing Enter and finding out. Everything else (`role="alert"`, `role="status"`, skeleton `aria-label`) is solid.

**Riley (stress tester)**: no pagination or virtualization in `Table.tsx` — fine at today's fixture volume (4 rows), a real risk once volume grows. Back-navigation and duplicate timestamps tested live with no bugs found.

## Minor Observations

- `Bs 475.00` / `Bs 9950.00` align only via `text-align: right`, not true tabular figures — DESIGN.md already reserves `--font-mono` for this, unused so far.
- Row hover changes background; row focus currently has no equivalent change — resolved together with the P1 focus fix.
