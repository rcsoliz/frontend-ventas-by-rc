# Roadmap — Frontend de Ventas (Vite + React + TS + Apollo Client)

Consume el backend `backup-ventas-by-rc` (Django + Strawberry GraphQL) revisado en la conversación. Mismo formato que `ROADMAP.md` del backend: tareas por agente y por fase, sin código — el código se escribe con Claude Code usando estos agentes (`.claude/agents/agent-*.md`).

Stack: Vite + React + TypeScript, Apollo Client (con `@graphql-codegen` para tipar queries/mutations desde el schema real del backend vía introspección), React Router.

Validación de formularios y feedback: `react-hook-form` + `zod` (como resolver) en vez de validación nativa del navegador (`required` de HTML5, que produce el globo genérico "Completa este campo" sin poder estilizarlo) — los errores se muestran inline, con el mismo sistema de diseño que el resto del formulario. `sonner` para toasts de éxito/error de mutations — encaja con la skill `emil-design-eng` ya instalada (mismo autor, Emil Kowalski, con una sección dedicada a los principios de Sonner).

Diseño profesional: 3 skills reales, confirmadas contra sus repos —
[`taste-skill`](https://github.com/Leonxlnx/taste-skill) (dirección visual anti-slop),
[`impeccable`](https://github.com/pbakaus/impeccable) (setup de contexto + 23 comandos de control de calidad: `critique`, `audit`, `polish`, etc.),
[`emil-design-eng`](https://github.com/emilkowalski/skills) (animación y criterio de diseño, de Emil Kowalski).
Viven en un agente dedicado (`ui-designer`), no repartidas en cada feature — así el resto de agentes se concentra en datos/lógica y no reinventa estilos por su cuenta.

Nota de seguridad heredada del backend: `login` devuelve un JWT sin mecanismo de refresh/revocación (expira a las 8h, ver `agent-auth-permissions.md` del backend). El frontend debe manejar la expiración (reintento → logout), no asumir que el token dura para siempre.

---

## Fase 1 — Frontend consumiendo el backend actual

### 1. `graphql-client`

- [ ] Proyecto Vite + React + TS (`npm create vite@latest -- --template react-ts`).
- [ ] Instalar `@apollo/client`, `graphql`, `@graphql-codegen/cli` + `@graphql-codegen/client-preset`.
- [ ] `codegen.ts` apuntando a `VITE_GRAPHQL_URL` del backend (introspección — requiere el backend corriendo) para generar hooks tipados (`useVentasQuery`, `useRegistrarVentaMutation`, etc.) a partir del schema real. Nunca escribir tipos de GraphQL a mano si el codegen ya los genera.
- [ ] `src/graphql/client.ts`: `ApolloClient` con `httpLink` (`VITE_GRAPHQL_URL`) + `authLink` (`setContext`) que agrega `Authorization: Bearer <token>` leyendo el token de donde lo deje `auth-frontend`.
- [ ] `errorLink`: intercepta `graphQLErrors`. El backend nunca devuelve HTTP de error para fallos de negocio/permisos (siempre 200 con `errors[]`, ver revisión del backend) — hay que leer el mensaje (`"No autenticado..."`, `"No tiene el permiso requerido..."`, `"Stock insuficiente..."`) y decidir: los de auth disparan logout, el resto se muestran como error de UI.
- [ ] Variables de entorno: `VITE_GRAPHQL_URL` (documentar en `.env.example`).

### 2. `auth-frontend`

- [ ] Pantalla de login: llama la mutation `login(username, password)`, guarda `token` + datos de `vendedor` (incluye `grupos`).
- [ ] Dónde guardar el token: `localStorage` (documentar el trade-off explícitamente — el backend ya decidió JWT por header en vez de cookie httpOnly, así que no hay alternativa sin tocar el backend; dejar anotado como limitación conocida, no como descuido).
- [ ] `AuthContext`/`useAuth()`: expone `vendedor`, `login()`, `logout()`, `isAuthenticated`.
- [ ] `ProtectedRoute`: redirige a `/login` si no hay sesión.
- [ ] Manejo de expiración: si `errorLink` (de `graphql-client`) detecta el mensaje de "no autenticado", `auth-frontend` limpia la sesión y redirige a `/login` — un solo lugar centralizado, no un catch repetido en cada pantalla.
- [ ] Gating de UI por grupo (`vendedor.grupos` incluye `"Administradores"` o `"Vendedores"`, ver `ARCHITECTURE.md` del backend): ocultar acciones que el backend igual va a rechazar (p.ej. "Crear producto" solo visible para Administradores) — **esto es solo UX**, la autorización real la sigue haciendo el backend (`HasDjangoPermission`); no confiar en el ocultamiento como control de seguridad.

### 3. `ui-designer`

- [ ] Instalar las skills: `minimalist-ui` y `emil-design-eng` copiando su `SKILL.md` a `.claude/skills/<nombre>/SKILL.md` (ya hecho); `impeccable` vía `npx impeccable install` en una terminal real con red, seguido de `/impeccable init` (superficie = "product").
- [ ] Al iniciar cualquier pantalla o componente nuevo: `minimalist-ui` como dirección visual base, `emil-design-eng` para animaciones/microinteracciones, y cerrar con `/impeccable critique` + `/impeccable audit` + `/impeccable polish` (si `impeccable` ya está instalado) antes de darla por terminada — ver detalle completo en `agent-ui-designer.md`.
- [ ] **AppShell responsive** (nav + header): por debajo de `md` (~768px), ocultar los links de navegación y el bloque de usuario, mostrar un botón de hamburguesa a la izquierda que abre un drawer lateral con esos mismos links + datos del vendedor (de `useAuth()`, de `auth-frontend`) + "Cerrar sesión". Arriba de `md`, nav horizontal como ya está. Sin esto, en pantallas angostas los links y el bloque de usuario se aprietan y se solapan (bug ya detectado en la pantalla de Productos).
- [ ] **Tabla responsive**: contener el scroll horizontal dentro de un wrapper de la tabla (`overflow-x-auto` en el contenedor, no que se escape de la página) — evita la barra de scroll suelta a la derecha de todo el layout.
- [ ] Tema visual de `sonner` (toasts): colores/tipografía acordes a los tokens de `minimalist-ui` (paleta monocromática cálida, sin sombras pesadas) — no dejar el estilo por defecto de la librería sin ajustar.
- [ ] Sistema de diseño compartido: tokens (color, tipografía, espaciado) + componentes base en `src/components/` (Button, Input, Select, Table, Modal, Toast, Card, EmptyState, Skeleton de carga).
- [ ] Pasada de pulido sobre las pantallas que entreguen `catalogo-feature` y `ventas-feature` — este agente no escribe la lógica de datos/GraphQL de esas pantallas, solo su capa visual y de interacción.
- [ ] Estados vacíos y de error con buen copy (ej. "Aún no registraste ventas" en vez de una tabla en blanco).

### 4. `catalogo-feature`

- [x] Clientes: listado (`clientes(soloActivos)`), alta (`crearCliente`) — formulario con validación inline propia (`noValidate` + mensajes en español por campo, no el globo nativo del navegador). El error de "correo duplicado" del backend (`ClienteDuplicadoError`) se muestra en el campo correspondiente, no como toast genérico.
- [x] Productos: catálogo (`productos(soloActivos)`), alta (`crearProducto`, solo visible/accesible para el grupo `Administradores`, coordinado con `auth-frontend`) — mismo patrón de validación inline que Clientes.
- [x] Clientes: edición y baja lógica (desactivar/activar) de un cliente existente — `ClienteForm` ahora soporta modo edición (prop `cliente` opcional, prefill + `actualizarCliente` en vez de `crearCliente`), columna "Acciones" en la tabla (Editar/Desactivar-Activar, gateada a `Administradores` igual que el permiso `ventas.change_cliente` del backend), columna "Estado" con badge cuando el filtro "Mostrar" está en "Todos (incluye inactivos)".
- [x] Productos: edición y baja lógica de un producto existente — mismo patrón que Clientes (`ProductoForm` con prop `producto` opcional, `actualizarProducto`/`cambiarEstadoProducto`, gateado a `Administradores`). Detectado en la pasada de revisión de diseño de `/impeccable` sobre `ProductosPage` (2026-07-14), implementado junto con la Fase 3 del backend el mismo día.
- [ ] `sonner`: `toast.success(...)` al crear cliente/producto exitosamente; `toast.error(mensaje)` para errores que no sean de un campo específico (ej. error de red).
- [ ] Ambas pantallas consumen los hooks tipados generados por `graphql-client` — no escribir queries GraphQL sueltas dentro de los componentes.

### 5. `ventas-feature`

- [ ] Carrito/multi-línea: seleccionar cliente + agregar productos con cantidad antes de confirmar. Validar en el cliente que no se repita el mismo producto en dos líneas (el backend ya lo rechaza con `LineaDuplicadaError`, pero conviene prevenirlo en el form).
- [ ] `registrarVenta`: nunca mandar `precioUnitario` ni el vendedor desde el frontend — el input (`VentaInput`/`DetalleVentaInput`) del backend directamente no los acepta.
- [ ] Mostrar errores de negocio del backend tal cual (`"Stock insuficiente para..."`, `"El cliente ... está inactivo..."`) vía `sonner` (`toast.error(mensaje)`) — son mensajes ya pensados para mostrarse al usuario, no reescribirlos. `react-hook-form` + `zod` solo para validar cantidad > 0 y selección de cliente/producto antes de enviar.
- [ ] `toast.success("Venta registrada")` al confirmar con éxito.
- [ ] Historial de ventas (`ventas`, `venta(idVenta)`): tabla con cliente, vendedor, fecha, total, líneas expandibles.
- [ ] En el detalle de venta, dejar reservado (sin implementar) un espacio/columna para el estado de facturación electrónica — ver Fase 2 más abajo.

### 6. `qa-frontend`

- [ ] Vitest + React Testing Library: componentes de `catalogo-feature`/`ventas-feature` (validación de formularios, estados de error, gating por grupo).
- [ ] Al menos un test de integración con Apollo `MockedProvider` para `registrarVenta` (éxito y stock insuficiente).
- [ ] E2E (Playwright, opcional pero recomendado): login → crear cliente → crear producto → registrar venta con 2 líneas → verlo en el historial.

---

## Fase 3 — Pulido de formularios, paginación y búsqueda (completado 2026-07-14)

Salió de una pasada de feedback directo del usuario tras el pase de revisión `/impeccable` (que cubrió las 5 pantallas y sus P1/P2/P3). Todo lo de esta fase quedó implementado y verificado (suite de tests + `tsc -b` + auditoría responsive con Playwright real a 375/768/1280px, sin overflow horizontal en ninguna pantalla).

### `catalogo-feature` / `ventas-feature`

- [x] Botón "Cancelar" en el modal de alta de Cliente (ya existía en Producto, faltaba en Cliente).
- [x] Los mensajes de error de campo (Cliente, Producto) se borran apenas el usuario empieza a corregir el campo — antes quedaban pegados hasta el siguiente submit.
- [x] Confirmado con un test de integración (`ClientesPage.test.tsx`) que el toast de éxito "Cliente creado correctamente." sí se dispara al crear un cliente — el código ya lo tenía, pero no había cobertura de test que lo probara end-to-end.
- [x] Búsqueda por nombre en Clientes (mismo patrón cliente-side ya usado en Productos e Historial).
- [x] Paginación (`src/components/Pagination.tsx`, 10 filas por página) en Clientes, Productos e Historial de ventas — hoy es 100% client-side sobre la lista ya traída por la query (`clientes`/`productos`/`ventas` no aceptan `limit`/`offset` todavía). Si el volumen de datos crece mucho, considerar paginación real del lado del backend (ver nota en `BackEnd/ROADMAP.md`).
- [x] Auditoría responsive real (Playwright, no solo lectura de CSS) de las 5 pantallas + modal + drawer de navegación mobile a 375/768/1280px — sin hallazgos, el trabajo de `AppLayout`/`Table` de pasadas anteriores ya lo dejaba bien resuelto.

---

## Fase 4 — Edición y baja lógica de Cliente y Producto (completado 2026-07-14)

Contraparte de UI de `BackEnd/ROADMAP.md` Fase 3 (mismo día): una vez que `actualizarCliente`, `cambiarEstadoCliente`, `actualizarProducto` y `cambiarEstadoProducto` existieron en el backend, se corrió `npm run codegen` para generar los hooks tipados y se conectó todo el flujo de UI.

### `catalogo-feature`

- [x] `ClienteForm`/`ProductoForm` ahora aceptan una prop opcional (`cliente`/`producto`) que, si viene, precarga el formulario y usa `actualizarCliente`/`actualizarProducto` en vez de `crearCliente`/`crearProducto` — mismo componente para alta y edición, sin duplicar el formulario. El botón cambia a "Guardar cambios" en modo edición.
- [x] Columna "Acciones" nueva en la tabla de Clientes y Productos: "Editar" (abre el modal en modo edición) y "Activar"/"Desactivar" (llama `cambiarEstadoCliente`/`cambiarEstadoProducto` directo desde la fila, con toast de confirmación). Ambos botones usan `e.stopPropagation()` porque viven dentro de una celda de tabla.
- [x] La columna de Acciones (y el botón "Nuevo cliente"/"Nuevo producto" en Productos) está gateada a `esAdministrador(vendedor)` — coincide exactamente con que `ventas.change_cliente`/`ventas.change_producto` son permisos solo de `Administradores` en `BackEnd/ARCHITECTURE.md`. Un Vendedor puede crear clientes (tiene `add_cliente`) pero no ve Editar/Desactivar en ninguna fila.
- [x] Filtro "Mostrar" (Solo activos / Todos, incluye inactivos) en ambas pantallas — antes las queries siempre pedían `soloActivos: true` y no había forma de ver ni reactivar un registro dado de baja. Cuando el filtro está en "Todos", aparece una columna "Estado" con un badge nuevo (`src/components/Badge.tsx`, variantes `success`/`muted`) mostrando Activo/Inactivo.
- [x] Verificado con tests de integración (`ClientesPage.test.tsx`, `ProductosPage.test.tsx`: gating por grupo en las acciones de fila, editar y ver el nuevo nombre reflejado, desactivar y confirmar que desaparece del listado de activos) y con una pasada manual en el navegador real (Playwright, no solo tests) contra el backend corriendo: crear → editar → desactivar → ver en "Todos" con badge Inactivo → reactivar, para Cliente y Producto.

---

## Fase 2 (previsión, no implementar aún) — Facturación Electrónica en el frontend

Cuando el backend implemente Fase 2 (`facturacion-integrator`, ver `FASE2_FACTURACION.md`), el frontend necesitará:

- [ ] En el detalle de venta: badge de estado (`pendiente`/`emitida`/`anulada`/`error`), CUF, y enlace/botón para ver el PDF (`urlPdf`).
- [ ] Botón "Emitir factura electrónica" en el historial de ventas, llamando a la futura mutation `emitirFacturaElectronica(idVenta)`.
- [ ] Manejo de estado asíncrono: el backend emite por webhook, así que el frontend debe hacer polling corto (`facturaElectronica(idVenta)`) o refrescar manualmente mientras el estado siga `pendiente`.

No crear estas pantallas ni estos componentes en Fase 1 — solo dejar el lugar reservado en el layout del detalle de venta (ver tarea de `ventas-feature` arriba) para no tener que rediseñar la pantalla después.

---

## Agentes

| Agente | Fase | Archivo |
|---|---|---|
| `graphql-client` | 1 | `agent-graphql-client.md` |
| `auth-frontend` | 1 | `agent-auth-frontend.md` |
| `ui-designer` | 1 (y pulido continuo) | `agent-ui-designer.md` |
| `catalogo-feature` | 1 | `agent-catalogo-feature.md` |
| `ventas-feature` | 1 (previsión Fase 2) | `agent-ventas-feature.md` |
| `qa-frontend` | 1 | `agent-qa-frontend.md` |

Copia los `agent-*.md` a `.claude/agents/` del proyecto frontend (repo aparte del backend, según lo planeado).
