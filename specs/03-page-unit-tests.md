# SPEC 03 — Pruebas unitarias de pages

> **Status:** Aprobado  
> **Depends on:** SPEC 01, SPEC 02  
> **Date:** 2026-09-29  
> **Objective:** Crear pruebas unitarias con Jest y React Testing Library para los 44 archivos de `src/pages` no excluidos de la cobertura y para `MainLayout` y `AuthLayout`, con una suite por archivo, mocks solo en fronteras y al menos 80% de líneas y de ramas por archivo.

## Por qué existe esta spec

El commit `bc14f7d` eliminó la suite anterior. Las suites previas de pages se conservan en `.migration/src-baseline/__tests__/pages/` (36 archivos) y sirven de referencia de casos, no de código a copiar: mockean `MainLayout`, `useGlobalContext` y los servicios enteros, y dependen de un `renderPage` global que ya no existe. `src/__tests__/pages/` está vacío. SPEC 01 dejó pages fuera y también dejó fuera `Layout`; SPEC 02 cubrió services. Esta spec cubre pages y, por decisión del usuario, añade las pruebas de `Layout` que SPEC 01 pospuso.

## Alcance

**Dentro:**

- Una suite por cada archivo de `src/pages` excepto `_app.js`, `_document.js` y `api/auth/[...nextauth].js` (ya excluidos en `coveragePathIgnorePatterns`): 44 archivos.
  - Páginas por perfil: `ADC`, `EMG`, `FAC`, `LDC`, `MRC`, `SEC`.
  - Páginas `Shared`, `Login`, `index`, `404` y `500`.
  - Subcomponentes bajo `pages/**/components`: `ItemBalance`, `ItemRecomendation` (ADC y LDC), `PeriodView`, `MethodConsult`, `LegalRepresentatives`.
  - Handler `api/genericRequest.js`.
- Una suite para `src/components/Layout/MainLayout.jsx` y otra para `AuthLayout.jsx` en `src/__tests__/components/Layout/` (2 archivos). Esto sustituye la exclusión de Layout de SPEC 01, que no se edita.
- Prueba de `getServerSideProps` en cada archivo que lo exporte.
- Criterio de SPEC 01: sin snapshots, sin mocks de componentes hijos, `EasyContext.Provider` real, `await user.*`, aserciones sobre resultado o callback.
- Mocks solo en fronteras: funciones de `../services`, `next/router`, `next-auth/react` (`useSession`, `signOut`), `next-auth` (`getServerSession`, en el handler), `Swal.fire`, `customAxios` de `../hooks` (solo en el handler) y otros módulos externos. `MainLayout` se renderiza real.
- Documentar en `docs/pages-tests.md` las convenciones, los defectos hallados y las excepciones de cobertura.

**Fuera de alcance (specs futuras):**

- `_app.js`, `_document.js` y `api/auth/[...nextauth].js`.
- Pruebas de `hooks`, `helpers`, `context` y middleware.
- Pruebas E2E, integración con red simulada (MSW) y mock de `axios`.
- Cambios en `jest.config.js` (`coverageThreshold`, patrones, reporters) y en dependencias.
- Corregir defectos de `src/pages` o de `src/components`: se documentan, no se corrigen.
- Mock de componentes hijos o de `MainLayout` para simplificar una prueba; si un caso lo necesitara, se detiene y se replantea.

## Modelo de datos

Esta spec no introduce estructuras de datos de aplicación. Añade archivos de prueba y, si hace falta, utilidades en `src/__tests__/utils/` (ya existen `render.jsx`, `router.js` y `context.jsx`) y fixtures en `src/__mocks__/` (ya existen `analyst.js`, `leaders.js`, `request.js`, `users.js`).

Convenciones:

- Ruta de la suite: refleja la ruta del archivo. `src/pages/Shared/History/[group].jsx` → `src/__tests__/pages/Shared/History/[group].test.jsx`; `src/pages/api/genericRequest.js` → `src/__tests__/pages/api/genericRequest.test.js`; `src/components/Layout/MainLayout.jsx` → `src/__tests__/components/Layout/MainLayout.test.jsx`. Todas coinciden con `testMatch`.
- Extensión `.test.jsx` para páginas y layouts, `.test.js` para el handler de API.
- Nombres de `describe`/`test` en inglés, un `describe` por comportamiento relevante (render, carga de datos, error del servicio, acciones, `getServerSideProps`).
- Cada suite prueba el estado de carga, el éxito, `status` distinto de 200, la excepción del servicio y las ramas por perfil o por parámetro de ruta que tenga la página.
- `AuthLayout` usa `setTimeout` de 2 s: se prueba con temporizadores falsos y `act`.
- El baseline `EMG/GeneralInformation/[client].jsx` no termina en `.test`; la nueva suite sí se llama `[client].test.jsx`.

## Plan de implementación

Cada paso termina con `pnpm test` en verde. Orden: de lo más simple a lo más compuesto.

1. **Layout** (2 archivos) y **utilidades**: `MainLayout` (con `useSession` con y sin sesión, mensaje de bienvenida una sola vez vía `localStorage`, `Loader`, `PDFModal`, `CustomStepper` según el contexto) y `AuthLayout` (pantalla de carga y contenido tras 2 s). Crear en `src/__tests__/utils/` el helper para renderizar páginas con `EasyContext` real, sesión simulada y router simulado, reutilizando `context.jsx` y `router.js`.
2. **Triviales y API** (3 archivos): `404`, `500` y `api/genericRequest` (sin sesión, sin `url` o `method`, con `addToken`, éxito, `status` del resultado, excepción).
3. **Subcomponentes de pages** (6 archivos): `ItemBalance`, `ItemRecomendation` (ADC, LDC), `PeriodView`, `MethodConsult`, `LegalRepresentatives`.
4. **Bandejas de solicitudes** (8 archivos): `RequestsReview/index` de `ADC`, `EMG`, `FAC`, `LDC`, `MRC` y `SEC`, más `FAC/RequestsReview/[group]` y `SEC/RequestsReview/[group]`.
5. **Flujos ADC, LDC y MRC** (11 archivos): `ReturnRequest` (ADC, LDC), `Recomendation/[group]` (ADC, LDC), `Documentation/[group]` (ADC, LDC, MRC), `ApplicationEvaluation/[group]` (ADC, LDC) y `MRC/ValidateRequest/[group]`, además de `EMG/Documentation/[group]`.
6. **Shared** (9 archivos): `History/index`, `History/[group]`, `Tracking`, `Cover/[group]`, `GeneralBalance/[request]`, `Model/[group]`, `StateResults/[request]`, `PropertyVerification/[request]`, `PCD/[request]`.
7. **Acceso y resto** (7 archivos): `Login`, `index`, `SEC/Cover/[group]`, `EMG/GeneralInformation/[client]`, `EMG/Solidary/[group]`, `EMG/PCD/[request]` y `MRC/BuroValidation/[client]` (la más grande, 622 líneas).
8. Crear `docs/pages-tests.md` y ejecutar `pnpm test` completo para medir cobertura por archivo.

## Criterios de aceptación

- [ ] Existe una suite por cada archivo de `src/pages` excepto `_app.js`, `_document.js` y `api/auth/[...nextauth].js` (44), en la ruta espejo dentro de `src/__tests__/pages`.
- [ ] Existen `MainLayout.test.jsx` y `AuthLayout.test.jsx` en `src/__tests__/components/Layout/`.
- [ ] `pnpm test` termina con código 0, sin suites ni pruebas omitidas (`skip`, `todo`, comentadas).
- [ ] Ninguna prueba usa `toMatchSnapshot` ni `toMatchInlineSnapshot`.
- [ ] Ninguna prueba mockea componentes hijos ni `MainLayout` con `jest.mock`; los mocks se limitan a `../services`, `next/router`, `next-auth/react`, `next-auth`, `Swal.fire`, `customAxios` en el handler y módulos externos.
- [ ] Todo caso contiene al menos una aserción sobre resultado, navegación, callback o argumentos enviados a un servicio.
- [ ] Cada página que llama a un servicio tiene casos de éxito, `status` distinto de 200 y excepción del servicio.
- [ ] Cada archivo que exporta `getServerSideProps` tiene un caso que verifica sus `props`.
- [ ] Cada archivo cubierto (los 44 más `MainLayout` y `AuthLayout`) alcanza al menos 80% de líneas y 80% de ramas en `coverage/lcov.info`. Cualquier excepción se lista, con motivo, en `docs/pages-tests.md`.
- [ ] `jest.config.js` y `src/pages` no se modificaron; tampoco `src/components`.
- [ ] `docs/pages-tests.md` existe y refleja el estado final: convenciones, defectos hallados y excepciones de cobertura.

## Decisiones tomadas y descartadas

- **Sí:** cubrir todo `src/pages` no excluido, incluidos subcomponentes y el handler `genericRequest`. **No:** solo páginas con ruta ni solo perfiles concretos, porque dejarían archivos instrumentados sin dueño y con cobertura baja.
- **Sí:** `MainLayout` real, con mocks en `next-auth/react` y `next/router`. **No:** mockearlo como passthrough como hacía el baseline, porque contradice SPEC 01 y no detecta roturas en el layout.
- **Sí:** añadir las pruebas de `MainLayout` y `AuthLayout` aquí, por decisión del usuario. **No:** dejar Layout sin pruebas, porque se ejecuta en cada página y seguiría fuera del criterio de cobertura. SPEC 01 no se edita.
- **Sí:** 80% de líneas y de ramas por archivo, criterio de SPEC 02. **No:** solo líneas como SPEC 01, porque en las páginas la lógica está en las ramas (`status`, `catch`, perfil). **No:** 70%, porque bajaría la exigencia sin motivo probado.
- **Sí:** documentar los defectos sin corregirlos y probar `getServerSideProps`. **No:** corregir como SPEC 02, por decisión del usuario; cambiaría contratos de rutas y navegación. **No:** omitir `getServerSideProps`, porque es una función pura y pequeña que dejaría ramas sin cubrir.
- **Sí:** reescribir las suites usando el baseline como guía de casos. **No:** copiarlas (dependen de `renderPage` global y de mocks de layout y contexto) ni ignorarlas.
- **Sí:** `EasyContext.Provider` real con acciones espiadas (`createContextWrapper`, `createActions`). **No:** mockear `useGlobalContext`, como hacía el baseline.
- **Sí:** un paso por grupo de páginas de complejidad similar. **No:** un paso por carpeta de perfil, porque mezclaría archivos triviales con flujos largos.

## Riesgos identificados

| Riesgo                                                                                                                                          | Mitigación                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Con `MainLayout` y componentes reales, cada página necesita sesión, router y contexto completos; el setup por suite puede ser largo y repetido. | El helper del paso 1 centraliza sesión, router y `EasyContext`; se amplía con lo mínimo que exija cada página.                                         |
| Un defecto en un componente hijo (SPEC 01 lo documentó, no lo corrigió) hace fallar la prueba de una página.                                    | Se documenta en `docs/pages-tests.md`. La prueba se ajusta al comportamiento real observable sin tocar `src/components` y el defecto queda registrado. |
| `api/genericRequest`: si no hay sesión responde 401 pero **no hace `return`**, y continúa procesando la petición.                               | Se prueba y documenta como defecto sin corregirlo; la prueba fija el comportamiento actual y se anota que debería retornar.                            |
| Páginas grandes (`BuroValidation` 622 líneas, `EMG/PCD` 403, `PropertyVerification` 320, `StateResults` 310) dificultan el 80% de ramas.        | Un `describe` por comportamiento; las ramas inalcanzables se listan como excepción con motivo.                                                         |
| Tiempo de ejecución: ~46 suites nuevas más las existentes con `collectCoverage: true` y `testTimeout` de 30 s.                                  | Usar `pnpm test --runInBand` si hay inestabilidad; temporizadores falsos en `AuthLayout` y donde haya `setTimeout`.                                    |
| Los mocks de servicios demasiado permisivos hacen pasar pruebas sin validar la llamada.                                                         | Aserción obligatoria sobre los argumentos recibidos por cada servicio mockeado.                                                                        |
| Casos del baseline obsoletos frente al código actual (las páginas ya no coinciden con las suites de origen).                                    | Contrastar cada caso con la página actual antes de reutilizarlo.                                                                                       |
| Promesas rechazadas sin manejar o `console.log` de errores dejan ruido en la salida.                                                            | Espiar `console.log` y `console.error` en los casos de error y verificar el mensaje esperado.                                                          |

## Qué **no** está en esta spec

- Pruebas de `_app.js`, `_document.js` y `api/auth/[...nextauth].js`.
- Pruebas de `hooks`, `helpers`, `context` y middleware.
- Pruebas E2E o de integración con red simulada.
- Corrección de defectos en `src/pages` y `src/components`.
- Cambios en `jest.config.js` o en dependencias.

Cada uno de ellos, si se aborda, va en su propia spec.
