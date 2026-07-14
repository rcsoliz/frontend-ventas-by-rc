---
target: ClientesPage
total_score: 27
p0_count: 0
p1_count: 2
p2_count: 2
timestamp: 2026-07-13T23-47-57Z
slug: src-features-clientes-clientespage-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence), run as two isolated sub-agents.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton/success toast work; empty/malformed field feedback is the browser's native popover, not the app's own language. |
| 2 | Match Between System and Real World | 2 | Native validation tooltips surface in English in an otherwise all-Spanish product. |
| 3 | User Control and Freedom | 3 | Escape/click-outside/× all verified working; no focus trap in the modal. |
| 4 | Consistency and Standards | 3 | Faithful to the shared component system, except this form doesn't follow the `noValidate` pattern already fixed on CarritoPage. |
| 5 | Error Prevention | 3 | `required`/`type=email` mechanically block bad submits, but via native chrome, not app language. |
| 6 | Recognition Rather Than Recall | 3 | Labels always visible; mobile table hides Teléfono/Dirección with no visual cue. |
| 7 | Flexibility and Efficiency of Use | 2 | Full keyboard flow works, but no `autoComplete` on any of the 5 inputs. |
| 8 | Aesthetic and Minimalist Design | 4 | Faithful, sober execution of "The Ledger." |
| 9 | Error Recovery | 3 | Duplicate-email path is excellent (precise, in-context, form preserved); required/format path isn't at that bar yet. |
| 10 | Help and Documentation | 1 | Zero contextual help on the form — likely intentional minimalism. |
| **Total** | | **27/40** | **Acceptable — solid foundation, same native-validation gap as CarritoPage** |

## Anti-Patterns Verdict

**LLM assessment**: Not AI slop — faithful "Ledger" execution (hairlines, single accent, Caption headers, shadow reserved for the Modal). The one seam: submitting empty or a malformed email drops into the raw, unstyled, English browser validation popover — the same class of issue already fixed once this pass on CarritoPage, recurring here because `ClienteForm`'s `<form>` has no `noValidate`. Worth noting: this makes the form's own `CORREO_REGEX` check and Spanish error message currently **dead code** — the native browser check intercepts submission before React's handler ever runs.

**Deterministic scan**: `detect.mjs` on all 4 target files: exit 0, clean. Browser-injected detector (whole-page) flagged `cramped-padding` on the Table wrapper — same false positive identified on the two prior critiques this pass (cell padding provides the real inset, not wrapper padding; also a shared-component concern, not specific to this page). `single-font`/`flat-type-hierarchy` are page-level and match the already-documented single-typeface system. No new actionable findings from B beyond what Assessment A already covers.

## Overall Impression

The strongest piece of this screen — the duplicate-email error path — is genuinely excellent, on-brand, and backed by a real test. The weakest piece is that its sibling validation cases (empty field, malformed email) never actually reach that same code path in the live app, because nothing stops the browser's native constraint validation from intercepting first. It's the identical root cause already fixed on CarritoPage, just not yet applied here. The modal's missing focus trap is a separate, real accessibility gap worth closing at the same time since it's a shared `Modal` component fix that benefits every modal in the app.

## What's Working

1. **Duplicate-email handling is done right, not just styled right**: inline on the Correo field, in Spanish, form state preserved, backed by a passing test (`ClienteForm.test.tsx`) — exactly what PRODUCT.md asks for.
2. **Table/EmptyState/Skeleton composition is faithful to "The Ledger"** — confirmed against the desktop screenshot, not approximated.
3. **All three modal exit paths work**: Escape, click-outside, and the labeled × button were each verified live.

## Priority Issues

**[P1] Native, English, unstyled browser validation tooltips instead of the app's own error treatment.**
- **Why it matters**: Same root cause already fixed on CarritoPage. `ClienteForm`'s `<form>` has no `noValidate`, so the browser intercepts submission before `CORREO_REGEX`'s own Spanish message ever runs — making it dead code today. Breaks brand voice (English) at the most likely first-friction point for a fast vendedor/administrador.
- **Fix**: Add `noValidate` to the form; add empty-field validation reusing each `Input`'s existing `error` prop, same pattern as CarritoPage.
- **Suggested command**: `/impeccable harden`

**[P1] Modal has no focus trap — confirmed live.**
- **Why it matters**: Tabbing forward from the × button through all 5 inputs and submit lands on `document.body`, not back inside the dialog, despite `aria-modal="true"`. Violates PRODUCT.md's explicit "navegación completa por teclado" commitment; a screen-reader user can be silently stranded in background content.
- **Fix**: Trap Tab/Shift+Tab within the dialog's focusable elements in the shared `Modal.tsx` — benefits every modal in the app, not just this one.
- **Suggested command**: `/impeccable harden`

**[P2] Mobile table clips Teléfono/Dirección with no scroll affordance.** Same class of issue as Historial/Carrito — no fade/cue that the table scrolls. — `/impeccable clarify`

**[P2] No way to view or edit an existing client** — Table has no `onRowClick`; this is also a confirmed, tracked gap in `ROADMAP_FRONTEND.md`. — `/impeccable layout`

**[P3] No `autoComplete` attributes on any of the 5 inputs** (nombre/apellido/correo/telefono/direccion). — `/impeccable optimize`

## Persona Red Flags

**Sam (Accessibility)**: focus leaks out of the modal on Tab (confirmed live); `aria-invalid` never gets set for the empty/malformed-email cases since the native check intercepts first — only the duplicate-email path is actually accessible to a screen reader today.

**Jordan (First-Timer)**: "Please fill out this field." in English inside a Spanish product reads as "the site broke," not "I missed a field" — and the inconsistency between that and the correctly-Spanish duplicate-email message is itself confusing.

**Casey (Mobile)**: checking a client's phone one-handed before a sale — a plausible PRODUCT.md scenario — only shows Nombre/Correo at 375px, with zero cue that Teléfono/Dirección exist off-screen.

## Minor Observations

- Toast auto-dismisses at a fixed 4000ms with no manual close — shared `Toast` behavior, not specific to this screen.
- `apellido` has no format guardrails beyond `required` — low impact, consistent with the form's minimal enforcement elsewhere.
