# Roadmap — Frontend de Ventas (Vite + React + TS + Apollo Client)

Consume el backend `backup-ventas-by-rc` (Django + Strawberry GraphQL) revisado en la conversación. Mismo formato que `ROADMAP.md` del backend: tareas por agente y por fase, sin código — el código se escribe con Claude Code usando estos agentes (`.claude/agents/agent-*.md`).

Stack: Vite + React + TypeScript, Apollo Client (con `@graphql-codegen` para tipar queries/mutations desde el schema real del backend vía introspección), React Router.

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

- [ ] Instalar las 3 skills (`npx skills add https://github.com/Leonxlnx/taste-skill`, `npx impeccable install`, `npx skills@latest add emilkowalski/skills`) y correr `/impeccable init` una sola vez al principio (superficie = "product").
- [ ] Al iniciar cualquier pantalla o componente nuevo: `taste-skill` como dirección visual base, `emil-design-eng` para animaciones/microinteracciones, y cerrar con `/impeccable critique` + `/impeccable audit` + `/impeccable polish` antes de darla por terminada — ver detalle completo en `agent-ui-designer.md`.
- [ ] Sistema de diseño compartido: tokens (color, tipografía, espaciado) + componentes base en `src/components/` (Button, Input, Select, Table, Modal, Toast, Card, EmptyState, Skeleton de carga).
- [ ] Pasada de pulido sobre las pantallas que entreguen `catalogo-feature` y `ventas-feature` — este agente no escribe la lógica de datos/GraphQL de esas pantallas, solo su capa visual y de interacción.
- [ ] Estados vacíos y de error con buen copy (ej. "Aún no registraste ventas" en vez de una tabla en blanco).

### 4. `catalogo-feature`

- [ ] Clientes: listado (`clientes(soloActivos)`), alta (`crearCliente`) — formulario con validación de correo antes de enviar (el backend ya rechaza duplicados, pero el error debe verse claro en el form, no como un toast genérico).
- [ ] Productos: catálogo (`productos(soloActivos)`), alta (`crearProducto`, solo visible/accesible para el grupo `Administradores`, coordinar el gating con `auth-frontend`).
- [ ] Ambas pantallas consumen los hooks tipados generados por `graphql-client` — no escribir queries GraphQL sueltas dentro de los componentes.

### 5. `ventas-feature`

- [ ] Carrito/multi-línea: seleccionar cliente + agregar productos con cantidad antes de confirmar. Validar en el cliente que no se repita el mismo producto en dos líneas (el backend ya lo rechaza con `LineaDuplicadaError`, pero conviene prevenirlo en el form).
- [ ] `registrarVenta`: nunca mandar `precioUnitario` ni el vendedor desde el frontend — el input (`VentaInput`/`DetalleVentaInput`) del backend directamente no los acepta.
- [ ] Mostrar errores de negocio del backend tal cual (`"Stock insuficiente para..."`, `"El cliente ... está inactivo..."`) — son mensajes ya pensados para mostrarse al usuario, no reescribirlos.
- [ ] Historial de ventas (`ventas`, `venta(idVenta)`): tabla con cliente, vendedor, fecha, total, líneas expandibles.
- [ ] En el detalle de venta, dejar reservado (sin implementar) un espacio/columna para el estado de facturación electrónica — ver Fase 2 más abajo.

### 6. `qa-frontend`

- [ ] Vitest + React Testing Library: componentes de `catalogo-feature`/`ventas-feature` (validación de formularios, estados de error, gating por grupo).
- [ ] Al menos un test de integración con Apollo `MockedProvider` para `registrarVenta` (éxito y stock insuficiente).
- [ ] E2E (Playwright, opcional pero recomendado): login → crear cliente → crear producto → registrar venta con 2 líneas → verlo en el historial.

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
