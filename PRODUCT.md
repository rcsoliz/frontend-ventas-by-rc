# Product

## Register

product

## Platform

web

## Users

Personal interno de un negocio chico/mediano, con dos roles de permisos distintos que conviven en el mismo sistema: **vendedores**, que registran ventas rápido en el día a día (mostrador/caja, necesitan velocidad y fricción mínima), y **administradores**, que gestionan clientes y catálogo de productos con más calma, típicamente desde una oficina. No es una relación de audiencia primaria/secundaria — ambos son usuarios directos y frecuentes; solo cambia el flujo y las acciones visibles según el grupo (`Vendedores` / `Administradores`).

## Product Purpose

Sistema de gestión de ventas a medida para este negocio, cubriendo el flujo completo clientes → productos → venta → historial, en reemplazo de una planilla de cálculo o un ERP genérico. El éxito es doble y simultáneo: un vendedor registra una venta en segundos sin fricción (validaciones claras de stock, cliente inactivo, línea duplicada), y un administrador mantiene control confiable sobre catálogo, clientes e historial.

## Positioning

Un sistema hecho a medida del flujo real de este negocio: simple donde una planilla se vuelve caótica, liviano donde un ERP genérico se vuelve burocrático. Las reglas de negocio (stock, permisos por rol, duplicados) se anticipan en la interfaz, no se descubren como un error del backend.

## Brand Personality

Sobrio, confiable, directo. Una herramienta de trabajo seria pero no fría — sin adornos ni personalidad juguetona. Ya expresado en la paleta monocromática cálida (`minimalist-ui`) de `src/design-system/tokens.css`: el color es un recurso escaso, sombras casi inexistentes, radios acotados.

## Anti-references

Ni estética de "ERP de escritorio" anticuada (tablas densísimas sin jerarquía, iconos genéricos, aspecto tipo Windows XP) ni el cliché "SaaS 2024" (gradientes, hero-metrics, tarjetas de KPI idénticas, eyebrows en mayúscula sobre cada sección).

## Design Principles

El flujo de negocio manda sobre la estética: clientes → productos → venta → historial siempre visible y directo, sin desvíos decorativos.

Las reglas de negocio se muestran en la interfaz, no solo se validan en el backend: permisos por rol, stock, duplicados se anticipan visualmente antes de que el usuario choque con un error.

Sobriedad como default: color como recurso escaso, casi todo resuelto en gris cálido más un acento mínimo, sin sombras pesadas.

Rápido para vender, preciso para administrar: ambos roles conviven en el mismo sistema sin que el flujo de uno estorbe al del otro.

Cero decoración sin función: nada de gradientes, glassmorphism o motion gratuito — cada elemento visual justifica su lugar.

## Accessibility & Inclusion

WCAG AA como estándar: contraste ≥4.5:1 en texto de cuerpo, navegación completa por teclado, foco visible en todos los controles interactivos. Sin necesidades de usuario específicas conocidas por ahora.
