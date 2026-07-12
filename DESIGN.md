---
name: Ventas
description: Backoffice de ventas sobrio, tinta casi negra sobre papel cálido, casi sin sombra.
colors:
  ink: "#111111"
  ink-hover: "#333333"
  paper: "#f7f6f3"
  surface: "#ffffff"
  hairline: "#eaeaea"
  hairline-strong: "#dcdad5"
  text-muted: "#5f5e5b"
  text-subtle: "#918f8a"
  brick: "#9f2f2d"
  brick-bg: "#fdebec"
  brick-border: "#f3d2d1"
  forest: "#346538"
  forest-bg: "#edf3ec"
  forest-border: "#cfe3cd"
typography:
  page-title:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "normal"
  title:
    fontFamily: "Helvetica Neue, Segoe UI, -apple-system, system-ui, sans-serif"
    fontSize: "16px"
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
  sm: "6px"
  md: "10px"
  lg: "12px"
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
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.brick}"
    textColor: "{colors.surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  modal-dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Ventas

## 1. Overview

**Creative North Star: "The Ledger" (El Libro Mayor)**

Tinta casi negra sobre papel cálido, líneas finas en vez de sombra, un único acento sólido reservado para la acción principal. El sistema se comporta como un libro contable bien llevado: cada fila, cada campo, cada botón declara su función sin adorno, y el color se reserva casi por completo para lo funcional (peligro, éxito) en vez de lo decorativo. No hay tipografía de gran escala ni gestos visuales que compitan con los datos — este es un producto (register `product`), no una landing; el diseño sirve el flujo clientes → productos → venta → historial, nunca al revés.

Rechaza explícitamente la estética "ERP de escritorio" anticuada (tablas sin jerarquía, iconos genéricos, aspecto Windows XP) y el cliché "SaaS 2024" (gradientes, hero-metrics, tarjetas de KPI idénticas, eyebrows en mayúscula) — ambos anti-referencias directas de PRODUCT.md.

**Key Characteristics:**
- Monocromático cálido: casi todo resuelto en escala de grises tibios, color solo para estado (peligro/éxito) y para el acento primario (negro puro).
- Prácticamente sin sombra: la separación entre superficies la da el borde de 1px, no la elevación.
- Un solo gesto de movimiento: compresión (`scale(0.97)`) al presionar; el resto son transiciones de tono, `140–200ms`, `cubic-bezier(0.23, 1, 0.32, 1)`.
- Sin escala tipográfica "hero": el título de página (`h1` de cada pantalla) es 20px/600, el techo de todo el sistema — la jerarquía la da el peso y el color, no un salto de tamaño mayor.
- Modo oscuro completo por `prefers-color-scheme`, invirtiendo tinta/papel sin cambiar la estructura.

## 2. Colors

Paleta monocromática cálida: casi todo el sistema vive en grises tibios sobre un papel cálido, con dos acentos funcionales (peligro/éxito) y un único acento sólido (tinta) para la acción primaria.

### Primary
- **Tinta Casi Negra** (`#111111`): color primario y de texto. Fondo de botones primarios, links activos de navegación, texto de cuerpo. En hover, se aclara a **Tinta Suave** (`#333333`).

### Neutral
- **Papel Cálido** (`#f7f6f3`): fondo de página. Ligeramente tibio, nunca blanco puro — el "papel" del libro mayor.
- **Blanco Limpio** (`#ffffff`): superficie de cards, inputs, tabla, modal — un nivel por encima del papel de fondo. También el color de texto sobre botones oscuros (primario/peligro).
- **Gris Línea Fina** (`#eaeaea`): bordes por defecto, divisores de tabla.
- **Gris Línea Firme** (`#dcdad5`): bordes de inputs y botones secundarios, hover de bordes.
- **Gris Texto Apagado** (`#5f5e5b`): texto secundario, labels, botones ghost.
- **Gris Texto Sutil** (`#918f8a`): texto terciario, hints, placeholders (mostrar contraste real, no el gris más claro disponible).

### Named Rules (optional, powerful)
**La Regla del Acento Único.** El negro (`#111111`) es el único acento no funcional del sistema. Ningún otro color decorativo compite con él; peligro y éxito existen solo para comunicar estado, nunca como adorno.

### Functional (danger / success)
- **Ladrillo Apagado** (`#9f2f2d`): texto y borde de error — "Stock insuficiente", "Cliente inactivo". Fondo asociado: **Rosa Ladrillo Pálido** (`#fdebec`), borde **Rosa Ladrillo** (`#f3d2d1`).
- **Verde Bosque Profundo** (`#346538`): texto y borde de éxito — confirmaciones de venta/creación. Fondo asociado: **Verde Musgo Pálido** (`#edf3ec`), borde **Verde Musgo** (`#cfe3cd`).

### Modo oscuro
Cada rol se invierte manteniendo la misma estructura: papel → `#121110`, superficie → `#1a1918`, tinta → `#f2f1ee` (con hover a blanco puro `#ffffff`), bordes → `#2b2a28` / `#3d3b38`, peligro/éxito se aclaran (`#e5928f` / `#8fbf90`) para mantener contraste sobre fondo oscuro. Activado automáticamente por `prefers-color-scheme: dark`, sin control manual todavía.

## 3. Typography

**Body Font:** Helvetica Neue (con Segoe UI, -apple-system, system-ui, sans-serif de respaldo)
**Mono Font:** SF Mono (con JetBrains Mono, ui-monospace de respaldo) — **reservado**, declarado en tokens pero aún sin aplicar a ningún componente; candidato natural para cifras tabulares (precios, totales) cuando `ventas-feature` los necesite.

**Character:** Una sola familia sans, sin pareja tipográfica ni fuente de display — la jerarquía vive en el peso (400/500/600) y el color, nunca en el tamaño. Es la tipografía de una herramienta de trabajo, no de una portada.

### Hierarchy
- **Page Title** (600, 20px, line-height normal): el `h1` de cada pantalla ("Ventas", "Clientes", "Productos", "Nueva venta", detalle de venta) — consistente en las 5 pantallas del sistema. El techo real del sistema.
- **Title** (600, 16px, line-height normal): título de modal, marca "Ventas" en el sidebar.
- **Body** (400, 14px, 20px): texto de tabla, inputs, botones tamaño `md`, contenido general.
- **Label** (500, 13px, 18px): labels de formulario, botones tamaño `sm`, nombre de usuario en el sidebar.
- **Caption** (500, 12px, uppercase, letter-spacing 0.03em): encabezados de tabla, rol de usuario, hints — el único uso de mayúsculas + tracking del sistema, reservado a metadatos, nunca a contenido de negocio.

### Named Rules (optional)
**La Regla del Techo Bajo.** Ningún texto supera los 20px (el `h1` de página). Todo lo demás vive en 16px o menos. Si un elemento necesita más peso visual, se le da peso de fuente o color, no tamaño — la jerarquía tipográfica de un dashboard denso no puede permitirse una escala "hero".

## 4. Elevation

Plano por defecto: cards, inputs y tabla no llevan sombra perceptible (`shadow-sm`, `0 1px 2px rgba(17,17,17,0.03)`, prácticamente invisible) — la separación de superficies la da el borde de 1px sobre el papel de fondo, no la elevación. La sombra aparece únicamente cuando un elemento flota por encima de la página: Modal (`shadow-lg`) y Toast (`shadow-md`), ambos superposiciones reales sobre el contenido.

### Shadow Vocabulary (if applicable)
- **Ambient (`shadow-sm`)** (`0 1px 2px rgba(17, 17, 17, 0.03)`): cards en reposo — casi decorativo, no estructural.
- **Flotante (`shadow-md`)** (`0 2px 8px rgba(17, 17, 17, 0.04)`): toasts — separación suave sobre el contenido de la página.
- **Superpuesta (`shadow-lg`)** (`0 8px 28px rgba(17, 17, 17, 0.08)`): modal — la única sombra realmente perceptible del sistema, reservada al elemento que de verdad bloquea la interacción con el resto de la página.

### Named Rules (optional)
**La Regla de Plano-por-Defecto.** Ninguna superficie en reposo lleva sombra perceptible. La sombra es la excepción que marca "esto flota sobre todo lo demás" (modal, toast), no un recurso decorativo de card en card.

## 5. Components

### Buttons
- **Shape:** radio 6px (`rounded.sm`), borde de 1px transparente por defecto.
- **Primary:** fondo Tinta Casi Negra, texto Blanco Limpio, hover aclara a Tinta Suave (`#333333`).
- **Secondary:** fondo Blanco Limpio, texto Tinta Casi Negra, borde Gris Línea Firme; hover oscurece el borde a Gris Texto Sutil.
- **Danger:** fondo Ladrillo Apagado, texto blanco; hover `brightness(0.92)`.
- **Ghost:** transparente, texto Gris Texto Apagado; hover rellena con Gris Línea Fina.
- **Press:** único gesto de movimiento del sistema, `scale(0.97)` en `:active`, `140ms ease-out`. Deshabilitado: opacidad `0.55`, cursor `not-allowed`.
- **Loading:** spinner circular de 14px, borde `currentColor` con el segmento superior transparente, giro continuo.

### Inputs / Fields
- **Style:** borde Gris Línea Firme, fondo Blanco Limpio, radio 6px, label 13px/500 en Gris Texto Apagado encima del campo.
- **Focus:** borde pasa a Tinta Casi Negra + anillo de foco `0 0 0 3px rgba(17,17,17,0.35)` — nunca se apoya solo en el cambio de borde.
- **Error:** borde Ladrillo Apagado, anillo de foco en el mismo tono (`brick-border`) en vez del anillo neutro.
- **Select:** mismo tratamiento que input; flecha dibujada con dos gradientes lineales de 5×5px en `currentColor`, sin ícono de librería.

### Cards / Containers
- **Corner Style:** radio 10px (`rounded.md`).
- **Background:** Blanco Limpio sobre Papel Cálido.
- **Shadow Strategy:** `shadow-sm`, ver Elevation — casi imperceptible, la estructura la da el borde.
- **Border:** 1px Gris Línea Fina.
- **Internal Padding:** 24px (`space-5`).

### Table
- **Style:** contenedor con borde 1px + radio 10px y `overflow-x: auto` (nunca escapa el scroll horizontal del layout). Encabezados en estilo Caption (12px, uppercase, tracking 0.03em, Gris Texto Apagado), divisor de 1px entre filas, sin línea bajo la última fila.
- **Row hover:** fondo pasa a Papel Cálido (el mismo tono del fondo de página, no un gris nuevo) cuando la fila es clickeable.
- **Alignment:** utilidades `left` / `right` / `center` explícitas por columna — pensado para columnas numéricas (cantidades, totales) alineadas a la derecha.

### Navigation
- **Style:** sidebar fija de 232px, fondo Blanco Limpio, borde derecho de 1px. Cada link 14px/500 en Gris Texto Apagado; activo pasa a fondo Tinta Casi Negra + texto Blanco Limpio (el único lugar donde el acento primario se usa como fondo de bloque, no solo de botón).
- **Mobile (`≤720px`):** el sidebar se convierte en una barra horizontal (nav + usuario + logout en fila) — **pendiente el patrón de drawer con hamburguesa** documentado en `ROADMAP_FRONTEND.md`; hoy en angosto los links y el bloque de usuario aún compiten por espacio.

### Modal
- **Style:** overlay `rgba(0,0,0,0.4)` centrado, dialog Blanco Limpio, radio 12px (`rounded.lg`), `shadow-lg`, ancho máx. 480px.
- **Motion:** overlay hace fade-in, dialog entra con `slideUp` (8px + `scale(0.98)` → posición final) en `200ms`; ambas animaciones se anulan por completo bajo `prefers-reduced-motion: reduce`.

### Toast
- **Style:** stack fijo esquina inferior derecha, cada toast 1px de borde + `shadow-md`, radio 6px. Variante `info` neutra (borde Gris Línea Firme), `success` (fondo/borde/texto Verde Bosque) y `error` (fondo/borde/texto Ladrillo) — nunca un ícono de librería sin re-tematizar.
- **Motion:** entra con `slideIn` (8px → posición final), anulado bajo `prefers-reduced-motion`.

### Empty States (signature)
- **Style:** contenido centrado, ícono 32px, título 15px/500 en Tinta Casi Negra, descripción 13px en Gris Texto Apagado (máx. 340px) — copy explícito en vez de una tabla en blanco (ej. "Aún no registraste ventas"), acción opcional debajo.

### Loading / Skeleton (signature)
- **Style:** bloques con gradiente `shimmer` entre Gris Línea Fina y Gris Línea Firme, radio 6px, animación de 1.4s; anulada bajo `prefers-reduced-motion`. `tableSkeleton` arma filas con grid `auto-fit` para simular columnas antes de que lleguen los datos reales.

## 6. Do's and Don'ts

### Do:
- **Do** mantener el color como recurso escaso: negro para la acción primaria, ladrillo/bosque solo para estado, todo lo demás en gris cálido.
- **Do** resolver la separación entre superficies con borde de 1px antes que con sombra; reservar `shadow-md`/`shadow-lg` para lo que de verdad flota (Modal, Toast).
- **Do** anticipar en la interfaz las reglas de negocio que el backend va a rechazar (stock, permisos por rol, duplicados) — coincide con el principio de PRODUCT.md de "reglas de negocio visibles en la UI, no solo validadas en el backend".
- **Do** usar copy explícito en estados vacíos ("Aún no registraste ventas") en vez de dejar una tabla en blanco.
- **Do** anular toda animación (`Modal`, `Toast`, `Skeleton`) bajo `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** introducir sombras decorativas en cards o filas de tabla en reposo — rompe la Regla de Plano-por-Defecto.
- **Don't** usar tablas densísimas sin jerarquía, iconos genéricos, ni ningún aspecto "ERP de escritorio anticuado" (anti-referencia directa de PRODUCT.md).
- **Don't** usar gradientes decorativos, hero-metrics, tarjetas de KPI idénticas ni eyebrows en mayúscula sobre cada sección — cliché "SaaS 2024" explícitamente rechazado en PRODUCT.md.
- **Don't** subir ningún texto por encima de 20px (el `h1` de página) ni introducir una segunda familia tipográfica de "display" — la Regla del Techo Bajo se rompe con cualquier tamaño hero.
- **Don't** usar `border-left`/`border-right` de color como acento decorativo en cards o alertas.
- **Don't** dejar el estilo por defecto de una librería (toasts, iconos) sin re-tematizar a esta paleta.
