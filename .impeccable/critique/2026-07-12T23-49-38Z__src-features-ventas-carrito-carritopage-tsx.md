---
target: CarritoPage (Nueva venta)
total_score: 26
p0_count: 0
p1_count: 2
p2_count: 2
timestamp: 2026-07-12T23-49-38Z
slug: src-features-ventas-carrito-carritopage-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence), run as two isolated sub-agents.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Cliente/Producto selects give no distinct "loading" vs "empty" signal — same disabled placeholder either way. |
| 2 | Match Between System and Real World | 3 | Spanish domain language + inline stock hints are strong, but the native quantity-validation tooltip breaks into English mid-flow. |
| 3 | User Control and Freedom | 2 | Can remove a line but no undo, no "vaciar carrito", no warning before losing the cart on navigation. |
| 4 | Consistency and Standards | 3 | Faithful use of the component system everywhere except the one unstyled native validation popup. |
| 5 | Error Prevention | 3 | Strong on duplicate-line prevention; stock-over-limit is only caught at final submit, not against the already-visible stock number. |
| 6 | Recognition Rather Than Recall | 3 | Cart/client/stock stay visible on one screen; "Quitar" is labeled, not iconic. |
| 7 | Flexibility and Efficiency of Use | 1 | No shortcuts, no bulk-add, no refocus to Producto after "Agregar" — works against the stated vendedor need for speed. |
| 8 | Aesthetic and Minimalist Design | 4 | Rigorous adherence to the "Ledger" system: single column, no decorative clutter, functional color only. |
| 9 | Error Recovery | 3 | Stock-insufficient error is specific and preserves the cart; generic network error has no retry action. |
| 10 | Help and Documentation | 1 | No contextual help anywhere, e.g. no hint that re-adding a product merges quantities. |
| **Total** | | **26/40** | **Acceptable — significant improvements needed before users are happy** |

## Anti-Patterns Verdict

**LLM assessment**: Does not read as AI-generated. It consistently executes its own documented "Ledger" system (warm paper, near-flat cards separated by hairlines, single black accent, functional-only color, no gradients/hero type/kicker-eyebrows). Concrete Spanish copy, not templated placeholder text. The one slip: the native HTML5 quantity-validation bubble is unstyled, English browser chrome dropped into an otherwise fully re-themed, fully-Spanish interface — a genuine "unfinished corner," and a direct violation of DESIGN.md's own "don't leave library defaults un-rethemed" rule.

**Deterministic scan**: `detect.mjs --json` on `CarritoPage.tsx`/`.module.css` returned exit 2 with one advisory finding: `design-system-font-size` at `CarritoPage.module.css:9` (`.page h1 { font-size: 20px; }`), flagged as off DESIGN.md's documented type ramp. **Investigated and resolved**: this 20px `h1` turns out to be the *consistent, deliberate page-title size across all 5 feature screens* (Ventas, Clientes, Productos, Carrito, Detalle de venta all use it) — not a slip in this one file. The real gap was in `DESIGN.md` itself, which I'd documented with a 16px ceiling and missed this page-title role. Fixed by adding a `page-title` (20px/600) token to `DESIGN.md`/`design.json` and updating the "Regla del Techo Bajo" to reflect the true system ceiling; no code change needed or made.

The browser-injected detector separately flagged `flat-type-hierarchy` (7 sizes: 12/13/13.3/14/15/16/20px). Assessment B's own investigation notes this is a full-page-chrome metric (sidebar nav, user footer, native `<select>` rendering) — 6 of 7 sizes don't originate in `CarritoPage.module.css` itself, so it's not a CarritoPage-specific issue.

## Overall Impression

The screen is a disciplined, on-brand execution of a genuinely well-thought-out design system, and its standout strength — preventing duplicate lines and preserving cart state on error — is real defensive UX, not decoration. The gap is entirely in the details that matter for a vendedor moving fast under real stakes: stock limits are checked too late, a silent merge on duplicate-add is indistinguishable from "nothing happened," and one native browser validation bubble breaks the illusion the rest of the screen works hard to build. None of this is a redesign; it's a hardening pass.

## What's Working

1. **Duplicate-line prevention is proactive, not reactive.** `useCarrito.agregarLinea` merges into the existing line instead of letting the backend reject a second row with `LineaDuplicadaError` — a real defensive decision in the state layer, not just a UI nicety.
2. **Errors don't destroy user work.** A stock-insufficient rejection shows a specific, brand-styled banner while leaving the cart completely intact (confirmed via `CarritoPage.test.tsx` and live code path) — exactly right for a screen whose job is "don't lose a sale to friction."
3. **The system lives its own design language under real conditions**, not just in the static case: dark mode correctly inverts paper/ink without restructuring anything, and real keyboard Tab navigation produces a visible focus ring exactly as DESIGN.md specifies (box-shadow ring, never border-color alone).

## Priority Issues

**[P1] Stock limits are enforced only at final submit, not where the stock number is already visible.**
- **Why it matters**: The Producto select already shows `(stock: N)` inline, but neither `handleAgregarLinea` nor the merge path in `useCarrito.ts` checks the (summed) quantity against it. A vendedor can build an 8-line cart with an over-limit quantity buried in line 5, hit "Confirmar venta," and get bounced — having to hunt through the cart to find and fix it. This is precisely the scenario PRODUCT.md says the interface should prevent, not just the backend.
- **Fix**: Add `max={producto.stock}` to the Cantidad input for the selected product, and validate the (merged) quantity against stock inline at add-time, not only at submit.
- **Suggested command**: `/impeccable harden`

**[P1] Duplicate-add merge gives zero user feedback.**
- **Why it matters**: Confirmed live — re-adding an already-in-cart product silently sums the quantity (2→5 in testing) with no toast, no highlight, no `aria-live` announcement. A fast-moving vendedor can't tell "nothing happened" from "it merged," and it's invisible to screen-reader users despite the app already having a working `aria-live="polite"` toast pattern.
- **Fix**: On merge, fire a brief toast ("Cantidad actualizada a 5") and/or momentarily highlight the affected row.
- **Suggested command**: `/impeccable clarify`

**[P2] Unstyled, English-language native validation bubble breaks the interface's own rules.**
- **Why it matters**: Entering `0` in Cantidad triggers the browser's native tooltip ("Value must be greater than or equal to 1") instead of the app's own `.inputError` treatment already built into `Input.tsx` and used everywhere else — breaking the all-Spanish locale and DESIGN.md's own "don't leave library defaults un-rethemed" rule.
- **Fix**: Add `noValidate` to the form and drive the existing `error` prop on `Input` with a Spanish message instead of the native tooltip.
- **Suggested command**: `/impeccable harden`

**[P2] No visible distinction between "loading" and "empty" on the Cliente/Producto selects.**
- **Why it matters**: Both selects just show `disabled` with the same placeholder whether data is still loading or genuinely empty. DESIGN.md documents a skeleton/shimmer pattern for exactly this, unused here.
- **Fix**: Show a loading-specific label ("Cargando clientes…") or use the documented Skeleton pattern instead of a silently-disabled control.
- **Suggested command**: `/impeccable polish`

**[P3] Mobile cart table clips "Subtotal"/"Quitar" with no scroll affordance.**
- **Why it matters**: At 375px the table scrolls horizontally (per the fix just applied to the shared Table component) but nothing hints that more columns exist off-screen — a one-thumb mobile vendedor may never discover "Quitar" is reachable by scrolling sideways.
- **Fix**: Add a right-edge scroll-shadow cue when content overflows, or stack cart rows as cards below a narrow breakpoint.
- **Suggested command**: `/impeccable layout`

## Persona Red Flags

**Alex (Power User — the vendedor this product is explicitly built for)**
- Focus never returns to the Producto select after "Agregar" — every one of potentially dozens of daily lines requires a full manual click-into-dropdown cycle. Directly contradicts PRODUCT.md's stated need for "velocidad y fricción mínima."
- No bulk-add path, no keyboard shortcut to submit.
- Stock limits caught only at final submit (P1 above) — costly when entering many lines fast.

**Sam (Accessibility-dependent)**
- Positive: real Tab-key testing confirmed a genuinely visible focus ring and correctly wired `aria-describedby`/`role="alert"` — better than most.
- The silent duplicate-merge (P1 above) fires no `aria-live` announcement — a screen-reader user gets no audible confirmation a quantity changed.
- The native validation bubble for quantity < 1 behaves inconsistently (browser/OS-dependent) vs. the reliable `role="alert"` pattern used for every other error.

**Casey (Mobile)**
- Cart table clips "Subtotal"/"Quitar" off-screen with no scroll cue (P3 above) — may be functionally unable to remove a wrongly-added line one-handed.
- When "Confirmar venta" is disabled, there's no inline hint explaining why (missing client? empty cart?) — an interrupted-and-returning Casey has to scroll up to diagnose it.
- Cart state lives in plain component `useState` with no persistence — a reload mid-flow silently loses the entire in-progress cart, for a user who by definition gets interrupted often.

## Minor Observations

- Live console flagged: `Unknown query named "Ventas" requested in refetchQueries options` when submitting from `/ventas/nueva`. Likely a test artifact (Assessment A navigated there by direct URL/full page load rather than the normal in-app click-through from the historial list, so the client's Apollo cache never had "Ventas" registered as a known query in that fresh session) rather than a real bug in normal usage — worth a quick manual sanity check of the real click-through flow (historial → "Nueva venta" → confirm → back to historial) to be certain the list actually reflects the new sale without a manual refresh.
- The native number input still shows the browser's default spinner arrows — a small, visible break from the otherwise fully custom input styling.
- The Total line (16px/600) correctly respects the system's type ceiling — good on-brand restraint.
- The empty-cart `EmptyState` copy ("El carrito está vacío" / "Agregá al menos un producto para poder registrar la venta.") is a clean, on-brand example of the documented signature pattern.
- "Quitar" as a labeled ghost button (not an icon) is good for recognition and consistent with the anti-"ERP desktop" positioning.
