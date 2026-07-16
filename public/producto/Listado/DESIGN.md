---
name: Apex Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#ba0035'
  on-secondary: '#ffffff'
  secondary-container: '#e21e49'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#07006c'
  on-tertiary-container: '#7073ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdada'
  secondary-fixed-dim: '#ffb3b6'
  on-secondary-fixed: '#40000c'
  on-secondary-fixed-variant: '#920028'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The brand personality is **authoritative, efficient, and precise**. Designed for high-stakes sales environments, the UI prioritizes data clarity and user confidence. The emotional response should be one of "controlled power"—where complex ERP/CRM data feels manageable and actionable.

The design style is **Corporate / Modern** with a lean toward **Minimalism**. It utilizes a systematic approach to whitespace and hierarchy to ensure that enterprise-level data density does not lead to cognitive overload. It avoids unnecessary decoration, focusing instead on structural integrity and functional motion.

## Colors

The palette is built on a foundation of **Charcoal and Slate** to establish a professional, SaaS-native atmosphere.

- **Primary:** A deep charcoal (#0F172A) used for headers, primary navigation, and high-level headings. It provides a more sophisticated ground than pure black.
- **Secondary (Accent):** A vibrant, modern crimson (#E11D48) reserved for critical actions, destructive states (like "Desactivar"), and urgent notifications.
- **Tertiary (System):** An Indigo (#6366F1) for focus states, secondary buttons, and data visualization highlights.
- **Neutral/Background:** A multi-layered gray scale. The main background is a very light "Cool Gray" (#F8FAFC), while containers use pure white (#FFFFFF) to create a clear "card" effect with high contrast for data readability.

## Typography

**Inter** is the exclusive typeface for this system, chosen for its exceptional legibility in data-heavy interfaces.

- **Headlines:** Use Bold (700) or Semi-Bold (600) weights with slight negative letter-spacing to maintain a compact, "designed" feel at larger sizes.
- **Data Tables:** Body-md (14px) is the standard for tabular data to maximize information density without sacrificing readability.
- **Labels:** Use uppercase for table headers and form labels to create a distinct visual anchor between the field descriptor and the user's input.

## Layout & Spacing

This design system uses a **fixed-fluid hybrid grid**. The sidebar navigation is fixed at 260px, while the main content area utilizes a fluid 12-column grid that caps at 1440px to prevent excessive line lengths on ultra-wide monitors.

- **Grid:** 12 columns with 24px (1.5rem) gutters.
- **Margins:** Page-level margins are 32px on desktop and 16px on mobile.
- **Vertical Rhythm:** A strict 8px base unit (4, 8, 16, 24, 32, 48, 64) governs all padding and stack spacing to ensure visual harmony across disparate modules like "Product Lists" and "New Sale Form."

## Elevation & Depth

Hierarchy is established through **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (Canvas):** The base background (#F8FAFC).
2.  **Level 1 (Cards/Containers):** Pure white surfaces with a subtle, 1px border (#E2E8F0) and a soft "Smoked" shadow (Y: 4px, Blur: 6px, Opacity: 0.05).
3.  **Level 2 (Modals/Dropdowns):** Elevated surfaces with a more pronounced shadow (Y: 12px, Blur: 24px, Opacity: 0.1) to clearly separate interactive overlays from the underlying data.
4.  **Interaction:** Buttons use a slight lifting effect (hover) or a shallow inset (active) to provide tactile feedback.

## Shapes

The shape language is **Structured and Modern**.

- **Standard Elements:** Buttons, input fields, and cards utilize a **0.5rem (8px)** corner radius. This creates a professional yet approachable feel that aligns with modern SaaS standards.
- **Large Elements:** Modals and large feature sections use **1rem (16px)** roundedness to soften the interface during focused tasks.
- **Small Elements:** Tooltips and tags use **0.25rem (4px)** to maintain a sharp, precise look for micro-information.

## Components

### Buttons
- **Primary:** Deep Charcoal background, white text. No border.
- **Secondary:** White background, Charcoal border (1px), Charcoal text.
- **Ghost/Tertiary:** No background or border. Indigo text. Used for "Cancel" or low-priority actions.
- **Destructive:** Crimson background for "Desactivar" or "Borrar" actions.

### Input Fields
- **Default:** White background, 1px Light Gray border (#CBD5E1). Height: 40px.
- **Focus State:** 1px Indigo border with a 3px soft Indigo outer glow (box-shadow).
- **Labels:** Positioned strictly above the field using `label-md` typography.

### Data Tables
- **Header:** Light Gray background (#F1F5F9), uppercase labels, 1px bottom border.
- **Rows:** White background with 1px horizontal separators. Hover state uses a very faint blue tint (#F8FAFC) to track rows.
- **Actions:** Grouped in the final column; use icon-plus-text or ghost buttons to reduce visual noise.

### Cards (Dashboard)
- Consistent 8px padding-top/bottom and 16px padding-left/right.
- Use Indigo for positive trends (upward arrows) and Crimson for negative trends.

### Chips/Tags
- **Status Tags:** Use a semi-transparent background of the status color (e.g., light green background with dark green text for "Active") with a fully rounded (pill) shape.