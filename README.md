# Frontend de Ventas

Vite + React + TypeScript + Apollo Client, consumiendo el backend GraphQL (`../BackEnd`, Django + Strawberry). Ver `ROADMAP_FRONTEND.md` para el detalle por agente/feature.

## Setup

```bash
npm install
cp .env.example .env   # ajustar VITE_GRAPHQL_URL si el backend no corre en localhost:8000
```

El backend debe estar corriendo (`docker compose up` en `../BackEnd`) antes de generar tipos o levantar el dev server.

### CORS (backend)

El backend no traía configuración de CORS — se agregó un middleware mínimo propio (`../BackEnd/config/cors_middleware.py`, sin dependencias nuevas) que permite el origen `http://localhost:5173` por defecto. Configurable vía `CORS_ALLOWED_ORIGINS` (coma-separado) en el `.env` del backend si el frontend corre en otro puerto/host.

## Comandos

```bash
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run codegen     # regenera src/graphql/generated/ por introspección del backend real
npm run build       # typecheck + build de producción
npm run test        # Vitest (unit + integración con MockedProvider)
```

## Estructura

- `src/graphql/` — Apollo Client (`client.ts`), manejo centralizado de errores (`errors.ts`, `authEvents.ts`), documentos `.graphql` (`operations/`) y tipos generados (`generated/`, no versionado — se regenera con `npm run codegen`).
- `src/features/auth/` — login, sesión (JWT en `localStorage`), rutas protegidas, gating de UI por grupo.
- `src/features/clientes/`, `src/features/productos/`, `src/features/ventas/` — features de negocio (Fase 1).
- `src/components/` + `src/design-system/` — sistema de diseño compartido (Button, Input, Select, Table, Modal, Toast, Card, EmptyState, Skeleton).
- `src/app/` — layout de la aplicación autenticada (nav + logout).

## Usuarios de prueba (seed del backend)

- `admin1` / `Administrador#2025` (grupo Administradores)
- `vendedor1` / `Vendedor#2025` (grupo Vendedores)

## Pendiente / notas conocidas

- Las 3 skills de diseño de referencia del roadmap (`taste-skill`, `impeccable`, `emil-design-eng`) no se instalaron como skills de Claude Code en esta sesión (requiere `npx skills add ...` interactivo/con red hacia GitHub) — el sistema de diseño se construyó a mano siguiendo esa misma dirección visual (minimalista, tipo backoffice). Se pueden instalar más adelante sin conflicto con lo ya construido.
- E2E con Playwright: `@playwright/test` está instalado como devDependency pero no hay specs formales en `e2e/` todavía — se usó para verificación manual puntual durante el desarrollo (login → clientes → productos → venta → historial).
