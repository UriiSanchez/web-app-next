# SPEC 01 — Pruebas unitarias de componentes

> **Status:** Aprobado
> **Depends on:** Ninguna
> **Date:** 2026-09-28
> **Objective:** Crear pruebas unitarias con Jest y React Testing Library para todos los componentes de `src/components`, excepto `Skeleton`, con una suite por archivo y una carpeta por paso, excluyendo `Skeleton`, `SVG` y `Layout`.

## Por qué existe esta spec

El commit `bc14f7d` eliminó la suite anterior y `693ef72` dejó una base nueva (`jest.setup.js`, `src/__tests__/utils/render.jsx` y `router.js`). `docs/components-tests-refactor.md` define el criterio de la reconstrucción, pero reconoce que cubre solo una primera batería. Esta spec convierte ese criterio en un plan verificable para los componentes. Pages y services se harán en specs posteriores.

## Alcance

**Dentro:**

- Una suite `src/__tests__/components/<Carpeta>/<Componente>.test.jsx` por cada `.jsx` de `src/components/**` fuera de `Skeleton`, `SVG` y `Layout` (127 archivos en 16 carpetas: CheckList, Controls, Cover, Filters, GeneralInformation, History, Modal, Model, PCD, PropertyVerification, Requests, SideMenu, Solidary, Tables, Tracking, UI).
- Añadir `'/src/components/SVG/*.jsx'` a `coveragePathIgnorePatterns` de `jest.config.js`, junto al patrón existente `'/src/components/Skeleton/*.jsx'`, que se conserva tal cual.
- Uso de la infraestructura existente: `renderComponent` (`src/__tests__/utils/render.jsx`) y `createRouter` (`src/__tests__/utils/router.js`).
- Criterio de `docs/components-tests-refactor.md`: pruebas de acciones y resultados, sin snapshots, sin mocks de componentes hijos, `EasyContext.Provider` real con acciones espiadas, `await user.*`, y mocks solo en fronteras (funciones de servicios, `Swal.fire`, `signOut`, `next/router`).
- Cada suite cubre el caso correcto, los estados vacío o de error y las interacciones principales del componente.
- Ajustar `docs/components-tests-refactor.md` al final: rutas reales de utilidades y alcance implementado.

**Fuera de alcance (specs futuras):**

- Pruebas de `pages` (SPEC 02) y `services` (SPEC 03).
- Componentes de `src/components/Skeleton`, `src/components/SVG` y `src/components/Layout` (no son necesarios por ahora).
- Archivos `index.js` (solo reexportan).
- Pruebas de `hooks`, `helpers`, `context` y middleware.
- Pruebas E2E e integración con red simulada.
- Corregir la sintaxis de los patrones de `coveragePathIgnorePatterns` (como regex, `/src/components/Skeleton/*.jsx` y `/src/components/SVG/*.jsx` probablemente no coinciden con los archivos), añadir `coverageThreshold`, migrar dependencias, `eslint-plugin-jest`/`testing-library`, corregir `jest-sonar-reporter`.
- Corregir defectos hallados en componentes (p. ej. la etiqueta «Primera» de `NewPagination`): se documentan, no se corrigen aquí.

## Modelo de datos

Esta spec no introduce estructuras de datos de aplicación. Añade solo archivos de prueba y, si hace falta, fixtures compartidos en `src/__mocks__/` (ya existen `analyst.js`, `leaders.js`, `request.js`, `users.js`).

Convenciones:

- Ruta de la suite: refleja la ruta del componente. `src/components/Controls/AddButton.jsx` → `src/__tests__/components/Controls/AddButton.test.jsx` (coincide con `testMatch` de `jest.config.js`).
- Nombres de `describe`/`test` en inglés.
- Consultas por rol o nombre accesible; `data-testid` o clases CSS solo cuando el componente no ofrezca otra opción, y se anota en el propio caso.

## Plan de implementación

Cada paso cubre una carpeta y termina con `pnpm test` en verde. Orden: de componentes más simples y reutilizados a los más compuestos.

1. **Controls** (22 archivos): botones, enlaces, selects, inputs numéricos, dropdowns, tooltips, stepper, reasignación, etc.
2. **UI, SideMenu, Tracking** (3 + 1 + 1 archivos).
3. **Filters** (6 archivos) y **Modal** (2 archivos, incluido `PDFModal`).
4. **Tables** (22 archivos): paginación, celdas de encabezado, tablas compuestas.
5. **CheckList** (4), **GeneralInformation** (2) e **History** (6).
6. **Cover** (6) y **Solidary** (5).
7. **Requests** (13).
8. **PropertyVerification** (10).
9. **Model** (10), incluido `ExecuteModel`.
10. **PCD** (14).
11. Añadir el patrón de SVG a `coveragePathIgnorePatterns` en `jest.config.js`.
12. Actualizar `docs/components-tests-refactor.md` (rutas reales, alcance, hallazgos) y ejecutar `pnpm test` completo para medir cobertura.

## Criterios de aceptación

- [ ] Existe una suite por cada `.jsx` de `src/components` fuera de `Skeleton`, `SVG`, `Layout` e `index.js`, en la ruta espejo dentro de `src/__tests__/components`.
- [ ] `pnpm test` termina con código 0, sin suites ni pruebas omitidas (`skip`, `todo`, comentadas).
- [ ] Ninguna prueba usa `toMatchSnapshot` ni `toMatchInlineSnapshot`.
- [ ] Ninguna prueba mockea componentes hijos con `jest.mock`; los mocks se limitan a servicios, `Swal.fire`, `signOut`, `next/router` y módulos externos.
- [ ] Todo caso contiene al menos una aserción sobre resultado o callback.
- [ ] Cada archivo cubierto tiene al menos 80% de líneas en el reporte de cobertura v8 (`coverage/lcov.info`). Cualquier excepción se lista, con motivo, en `docs/components-tests-refactor.md`.
- [ ] `jest.config.js` incluye `'/src/components/SVG/*.jsx'` en `coveragePathIgnorePatterns` y conserva el de Skeleton; no se cambió ninguna otra opción.
- [ ] No se modificó código de `src/components` (salvo autorización expresa registrada en el doc).
- [ ] `docs/components-tests-refactor.md` refleja el estado final.

## Decisiones tomadas y descartadas

- **Solo components en esta spec.** Se descartó incluir pages y services: son más de 240 archivos en tres áreas. Se dividen en SPEC 02 y SPEC 03.
- **Un paso por carpeta.** Descartado el listado archivo por archivo (demasiado largo) y cubrir solo un subconjunto (dejaría deuda sin dueño).
- **Criterio de `docs/components-tests-refactor.md` adoptado tal cual.** Se descartó permitir mockear hijos pesados; si un caso lo necesitara, se detiene y se replantea.
- **Terminado = suite verde + 80% de líneas por archivo.** Descartado umbral global en `coverageThreshold` (cambia configuración fuera de alcance) y "solo suite verde" (permitiría suites superficiales). La cobertura mide ejecución, no calidad de aserciones; por eso existe el criterio de aserciones.
- **Skeleton, SVG, Layout e `index.js` excluidos.** Skeleton y SVG son presentación pura; los `index.js` solo reexportan; Layout se pospone porque no es necesario por ahora. El patrón de SVG se añade a la cobertura con la misma sintaxis que el de Skeleton, por decisión del usuario.
- **Utilidades en `src/__tests__/utils`.** El doc menciona `src/test-utils/render.jsx`, pero el código real está en `src/__tests__/utils`; se toma el código como fuente de verdad y se corrige el doc.

## Riesgos identificados

- **Skeleton, SVG y Layout pueden seguir instrumentados.** Como regex, los patrones `/src/components/Skeleton/*.jsx` y `/src/components/SVG/*.jsx` probablemente no coinciden con los archivos, y Layout no tiene patrón; el porcentaje global los incluirá sin pruebas. Por eso la verificación es por archivo, no global.
- **Componentes con red, `Swal` o navegación.** Requieren mockear con cuidado las fronteras; un mock demasiado amplio vuelve la prueba vacía.
- **Selectores frágiles.** Algunos componentes usan elementos no semánticos para acciones, según el doc de refactor; puede obligar a `data-testid` o clases puntuales.
- **Promesas rechazadas sin manejar** (p. ej. `TabOptionDocuments`): los casos cubren errores devueltos como datos, no ese rechazo.
- **Tiempo de ejecución.** ~127 suites con `collectCoverage: true` y `testTimeout` de 30 s; usar `pnpm test --runInBand` si hay inestabilidad.
- **Directorio `src/test-utils`** contiene carpetas heredadas vacías, sin efecto sobre Jest; no se tocan.
