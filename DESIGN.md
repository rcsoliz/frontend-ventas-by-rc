---
name: Ventas
description: Backoffice de ventas, panel SaaS claro con superficie azulada, badges de estado y sombra suave real.
colors:
  bg: "#f4f6fb"
  surface: "#ffffff"
  border: "#e6e9f4"
  border-strong: "#d6dbec"
  text: "#111827"
  text-muted: "#64748b"
  text-subtle: "#94a3b8"
  primary: "#111111"
  primary-hover: "#2d2d2d"
  accent: "#2563eb"
  accent-bg: "#eff4ff"
  accent-border: "#c7d9fb"
  danger: "#dc2626"
  danger-bg: "#fee2e2"
  danger-border: "#fecaca"
  success: "#16a34a"
  success-bg: "#dcfce7"
  success-border: "#bbf7d0"
  warning: "#d97706"
  warning-bg: "#fef3c7"
  warning-border: "#fde68a"
typography:
  page-title:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "normal"
  title:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "normal"
  body:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "18px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  modal-dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge:
    rounded: "{rounded.full}"
    typography: "{typography.label}"
    padding: "2px 10px"
---

# Design System: Ventas

## 0. Nota de versión (2026-07-14)

Este documento **reemplaza** la v1 ("The Ledger", monocromática cálida, casi sin sombra). El usuario proveyó capturas de Stitch (`public/img/Login.png`, `Dashboard.png`, `ListarProductos.png`, `ListarVenas.png`) con una dirección distinta — un panel SaaS claro, con badges de color, sombra real y jerarquía tipográfica más amplia — y pidió adoptarla tal cual. Las reglas de v1 ("Acento Único", "Techo Bajo", "Plano-por-Defecto") quedan **derogadas**; ver sección 6 por las reglas vigentes de esta v2. `PRODUCT.md` fue ajustado en paralelo para no contradecir esto — si encontrás texto de `PRODUCT.md` que siga rechazando "KPI cards" o "color decorativo", es una referencia vieja no actualizada, no una regla vigente.

**Creative North Star: "Clarity"**

Un panel de control claro y profesional: fondo azulado muy pálido, tarjetas blancas con sombra suave real (no la sombra casi invisible de v1), badges en pastilla para comunicar estado (stock, variación %, rol), y un acento azul (`accent`) para enlaces/información secundaria — conviviendo con el negro sólido (`primary`) que sigue reservado a la acción principal de cada pantalla. Referencia directa: los 4 mockups de Stitch listados arriba.

## 1. Colores

- **`primary` (`#111111`)**: botones de acción principal ("Ingresar", "+ Nuevo producto", "+ NUEVA VENTA", link activo del sidebar). Se mantiene igual que v1 — es el único valor que Stitch no cambió.
- **`accent` (`#2563eb`)**: enlaces informativos ("¿Olvidaste tu contraseña?"), texto de metadatos importantes (nombre de vendedor en la tabla de Ventas), estados de foco. A diferencia de v1, el azul **sí** puede usarse decorativamente para dar jerarquía a texto secundario, no solo para estado funcional.
- **`bg` (`#f4f6fb`)**: fondo de página — azulado muy pálido, reemplaza el "papel cálido" de v1.
- **`surface` (`#ffffff`)**: cards, sidebar, tabla, modal, inputs.
- **`border` / `border-strong`**: `#e6e9f4` / `#d6dbec` — bordes con tinte azulado en vez del gris neutro de v1.
- **`success` / `success-bg` / `success-border`** (`#16a34a` / `#dcfce7` / `#bbf7d0`): variación positiva en KPI (▲ 100.0%), stock saludable, confirmaciones.
- **`danger` / `danger-bg` / `danger-border`** (`#dc2626` / `#fee2e2` / `#fecaca`): botón "Desactivar", stock crítico, errores.
- **`warning` / `warning-bg` / `warning-border`** (`#d97706` / `#fef3c7` / `#fde68a`, **nuevo en v2**, v1 no tenía tercer estado): stock bajo pero no crítico (ver Productos, columna Stock).

## 2. Tipografía

Misma familia sans que v1 (Helvetica Neue / Segoe UI / system-ui) — Stitch no cambia la fuente, cambia la escala.

- **Page Title** (700, **28px**): el `h1` de cada pantalla ("Panel", "Productos", "Ventas"). **Sube del techo de 20px de v1** — Stitch usa tipografía más grande como recurso de jerarquía, no solo peso/color.
- **Title** (600, 18px): título de card/sección ("Ingresos por día", título de modal).
- **Body** (400, 14px): tabla, inputs, botones, contenido general — igual que v1.
- **Label** (500, 13px): labels de formulario, texto de badge.
- **Caption** (500, 12px, uppercase, tracking 0.03em): encabezados de tabla — se mantiene igual que v1, Stitch también usa mayúsculas+tracking en headers de tabla (`PRODUCTO`, `DESCRIPCIÓN`, `PRECIO`...).

## 3. Elevación

**Cambio central respecto a v1**: la sombra ahora es real y perceptible en reposo, no solo en overlays.

- **`shadow-sm`** (`0 1px 2px rgba(16,24,40,0.05)`): inputs, filas de tabla.
- **`shadow-md`** (`0 4px 8px rgba(16,24,40,0.06), 0 2px 4px rgba(16,24,40,0.04)`): cards de KPI, topbar, card de login — la sombra por defecto de una superficie elevada.
- **`shadow-lg`** (`0 12px 24px rgba(16,24,40,0.1)`): modal, FAB, dropdown/menú kebab.

## 4. Radios

Todo crece respecto a v1: `sm` 8px (inputs/botones), `md` 12px (cards/tabla), `lg` 16px (modal), y se agrega `full` (999px) para badges, avatar circular, botón FAB y pastillas de paginación.

## 5. Componentes (por pantalla, ver mockups en `public/img/`)

### Login (`Login.png`)
Card blanca centrada, `shadow-md`, `radius-lg`. Logo cuadrado negro con icono. Inputs con icono a la izquierda (usuario/candado) + toggle de ojo para mostrar contraseña. **Nota**: el mockup incluye checkbox "Recordarme", link "¿Olvidaste tu contraseña?", link "Solicitar acceso" y badges de confianza SSL — el backend no tiene flujo de recuperación de contraseña ni de solicitud de acceso ni distingue sesión "recordada" de sesión normal (siempre `localStorage`, ver `ROADMAP_FRONTEND.md`). Implementar esos elementos como enlaces reales sería construir UI para funcionalidad inexistente — evaluar caso por caso en la implementación, no agregar enlaces muertos.

### Panel / Dashboard (`Dashboard.png`)
Sidebar (ver AppLayout abajo) + topbar con buscador, campana, engranaje. Breadcrumb `Gestión > Resumen de Ventas` bajo el `h1`. Fila de 4 KPI cards (`shadow-md`, `radius-md`, icono arriba-derecha en círculo `accent-bg`, badge de variación en pastilla `success-bg`/`success` con flecha ▲/▼ — mapea 1:1 con el `StatTile` que ya existe en el código, solo cambia el estilo). Chart card con línea de ingresos. Botón `+` flotante (FAB) esquina inferior derecha, `radius-full`, `shadow-lg`, fondo `primary`.

### AppLayout (sidebar + topbar, visible en los 4 mockups)
Sidebar blanco con logo+nombre arriba, nav con icono+label por link (Panel/Ventas/Clientes/Productos — mismo orden que ya existe en `AppLayout.tsx`), bloque de usuario abajo con avatar circular + nombre + rol. Topbar con buscador (`accent-bg` de fondo, placeholder gris), campana de notificaciones, engranaje de settings, avatar de usuario a la derecha.

### Productos / Clientes (`ListarProductos.png`)
Header con `h1` + descripción + botón "+ Nuevo producto" (`primary`). Fila de filtros: input Buscar, select "Mostrar" (Solo activos/Todos), botón "Filtrar" (`secondary` con icono). Tabla: celda de producto con icono cuadrado (`accent-bg`) + nombre, columna Stock con badge de 3 estados (`success`/`warning`/`danger` según umbral), acciones "Editar" (`secondary`) + "Desactivar" (`danger`) inline por fila. Paginación con números de página en pastillas (`radius-full`), flechas prev/next.

### Ventas (`ListarVenas.png`)
Tabs "HISTORIAL" / "NUEVA VENTA" bajo el `h1` — reemplaza visualmente las rutas separadas `/ventas` y `/ventas/nueva` con un selector de pestañas (mismo diseño de tabla que Productos/Clientes). Columna Vendedor con el nombre en `accent` (color por texto, no por fondo). Acciones por fila como menú kebab (⋮) en vez de botones inline — abre un dropdown con las acciones disponibles.

## 6. Reglas vigentes (v2, reemplazan a las de v1)

- **Regla del Acento Doble**: `primary` (negro) para la acción principal de cada pantalla, `accent` (azul) para navegación/información secundaria — ya no hay un único acento no funcional, hay dos con roles distintos.
- **Regla de Elevación Real**: las superficies elevadas (card, topbar, tabla) llevan `shadow-sm`/`shadow-md` en reposo — a diferencia de v1, la sombra ya no se reserva solo para overlays.
- **Regla de Estado en Pastilla**: cualquier variación/estado (KPI, stock, badge de rol) se comunica con una pastilla `radius-full` de fondo pálido + texto/borde del color de estado — nunca con texto plano de color suelto.
- Se mantiene de v1: `prefers-reduced-motion` anula toda animación; copy explícito en estados vacíos; anticipar reglas de negocio (stock, permisos, duplicados) en la UI.

## 7. Do's and Don'ts

### Do
- Do usar `shadow-md` en cards/KPI/topbar — es la elevación por defecto de v2, no la excepción.
- Do usar badges en pastilla para todo estado (stock, variación, rol) con el trío fondo pálido/borde/texto del color correspondiente.
- Do mantener `primary` (negro) exclusivo para la acción principal de cada pantalla — el azul es para lo secundario/informativo, no compite por esa jerarquía.
- Do seguir anticipando en la UI las reglas de negocio que el backend rechaza (stock, permisos, duplicados) — principio de `PRODUCT.md` que no cambió.

### Don't
- Don't reintroducir la sombra casi invisible de v1 (`0 1px 2px rgba(17,17,17,0.03)`) — ya no es el valor de `shadow-sm`.
- Don't agregar enlaces o controles que impliquen funcionalidad de backend inexistente (recuperar contraseña, solicitar acceso, "recordarme") sin marcarlo explícitamente como pendiente/deshabilitado.
- Don't mezclar radios de v1 (6/10/12px) con los de v2 (8/12/16px) en el mismo componente.
- Don't dejar el badge de stock en solo 2 estados (éxito/peligro) — Productos usa 3 (`success`/`warning`/`danger`).
