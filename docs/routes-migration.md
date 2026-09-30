# Plan de migración de Pages Router a App Router

> **Spec:** [SPEC 05](../specs/05-pages-to-app-router-migration-plan.md)  
> **Estado del documento:** completo según el plan de la spec (secciones 1 a 11); pendiente de revisión.  
> **Alcance:** solo planifica. Ninguna ola se ejecuta desde este documento.

## 1. Inventario de `src/pages`

Tabla generada a partir de `src/pages` (archivos de página y subcomponentes; `_app.js`, `_document.js` y `api/` van en sus propias secciones). Las columnas "Usa `next/router`" indican las llamadas a `router.push` / `router.reload` detectadas con `grep`; el detalle de `query` se clasifica en el Paso 2.

Leyenda de la columna **Ola**: `N` = migración 1:1 (misma URL); `N → 6` = además se unifica la ruta en la Ola 6. Las olas 0, 1, 7, 8 y 9 no mueven páginas.

| Ruta pública                             | Archivo actual                                                    | Archivo destino                                                 | Ola         | `getServerSideProps` | Usa `next/router`    | Suite actual                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- | ----------- | -------------------- | -------------------- | -------------------------------------------------------------------------------- |
| (cualquier ruta inexistente)             | `src/pages/404.jsx`                                               | `src/app/not-found.jsx`                                         | 2           | no                   | sí                   | `src/__tests__/pages/404.test.jsx`                                               |
| (error de servidor)                      | `src/pages/500.jsx`                                               | `src/app/error.jsx` + `global-error.jsx`                        | 2           | no                   | sí                   | `src/__tests__/pages/500.test.jsx`                                               |
| `/ADC/ApplicationEvaluation/[group]`     | `src/pages/ADC/ApplicationEvaluation/[group].jsx`                 | `src/app/ADC/ApplicationEvaluation/[group]/page.jsx`            | 4 (ADC) → 6 | sí                   | sí                   | `src/__tests__/pages/ADC/ApplicationEvaluation/[group].test.jsx`                 |
| `/ADC/Documentation/[group]`             | `src/pages/ADC/Documentation/[group].jsx`                         | `src/app/ADC/Documentation/[group]/page.jsx`                    | 4 (ADC) → 6 | sí                   | sí                   | `src/__tests__/pages/ADC/Documentation/[group].test.jsx`                         |
| `/ADC/Recomendation/[group]`             | `src/pages/ADC/Recomendation/[group].jsx`                         | `src/app/ADC/Recomendation/[group]/page.jsx`                    | 4 (ADC) → 6 | sí                   | sí                   | `src/__tests__/pages/ADC/Recomendation/[group].test.jsx`                         |
| — (no enrutable en app/)                 | `src/pages/ADC/Recomendation/components/ItemRecomendation.jsx`    | `src/app/ADC/Recomendation/components/ItemRecomendation.jsx`    | 4 (ADC)     | no                   | no                   | `src/__tests__/pages/ADC/Recomendation/components/ItemRecomendation.test.jsx`    |
| `/ADC/RequestsReview`                    | `src/pages/ADC/RequestsReview/index.jsx`                          | `src/app/ADC/RequestsReview/page.jsx`                           | 3 → 6       | no                   | sí (router.push×1)   | `src/__tests__/pages/ADC/RequestsReview/index.test.jsx`                          |
| `/ADC/ReturnRequest/[group]`             | `src/pages/ADC/ReturnRequest/[group].jsx`                         | `src/app/ADC/ReturnRequest/[group]/page.jsx`                    | 4 (ADC) → 6 | sí                   | sí                   | `src/__tests__/pages/ADC/ReturnRequest/[group].test.jsx`                         |
| `/EMG/Documentation/[group]`             | `src/pages/EMG/Documentation/[group].jsx`                         | `src/app/EMG/Documentation/[group]/page.jsx`                    | 4 (EMG) → 6 | sí                   | sí                   | `src/__tests__/pages/EMG/Documentation/[group].test.jsx`                         |
| — (no enrutable en app/)                 | `src/pages/EMG/Documentation/components/LegalRepresentatives.jsx` | `src/app/EMG/Documentation/components/LegalRepresentatives.jsx` | 4 (EMG)     | no                   | sí (router.reload×1) | `src/__tests__/pages/EMG/Documentation/components/LegalRepresentatives.test.jsx` |
| `/EMG/GeneralInformation/[client]`       | `src/pages/EMG/GeneralInformation/[client].jsx`                   | `src/app/EMG/GeneralInformation/[client]/page.jsx`              | 4 (EMG)     | sí                   | sí                   | `src/__tests__/pages/EMG/GeneralInformation/[client].test.jsx`                   |
| `/EMG/PCD/[request]`                     | `src/pages/EMG/PCD/[request].jsx`                                 | `src/app/EMG/PCD/[request]/page.jsx`                            | 4 (EMG) → 6 | sí                   | sí                   | `src/__tests__/pages/EMG/PCD/[request].test.jsx`                                 |
| `/EMG/RequestsReview`                    | `src/pages/EMG/RequestsReview/index.jsx`                          | `src/app/EMG/RequestsReview/page.jsx`                           | 3 → 6       | no                   | sí (router.push×1)   | `src/__tests__/pages/EMG/RequestsReview/index.test.jsx`                          |
| `/EMG/Solidary/[group]`                  | `src/pages/EMG/Solidary/[group].jsx`                              | `src/app/EMG/Solidary/[group]/page.jsx`                         | 4 (EMG)     | sí                   | sí                   | `src/__tests__/pages/EMG/Solidary/[group].test.jsx`                              |
| `/FAC/RequestsReview/[group]`            | `src/pages/FAC/RequestsReview/[group].jsx`                        | `src/app/FAC/RequestsReview/[group]/page.jsx`                   | 4 (FAC) → 6 | sí                   | sí (router.push×3)   | `src/__tests__/pages/FAC/RequestsReview/[group].test.jsx`                        |
| `/FAC/RequestsReview`                    | `src/pages/FAC/RequestsReview/index.jsx`                          | `src/app/FAC/RequestsReview/page.jsx`                           | 3 → 6       | no                   | sí (router.push×1)   | `src/__tests__/pages/FAC/RequestsReview/index.test.jsx`                          |
| `/LDC/ApplicationEvaluation/[group]`     | `src/pages/LDC/ApplicationEvaluation/[group].jsx`                 | `src/app/LDC/ApplicationEvaluation/[group]/page.jsx`            | 4 (LDC) → 6 | sí                   | sí                   | `src/__tests__/pages/LDC/ApplicationEvaluation/[group].test.jsx`                 |
| `/LDC/Documentation/[group]`             | `src/pages/LDC/Documentation/[group].jsx`                         | `src/app/LDC/Documentation/[group]/page.jsx`                    | 4 (LDC) → 6 | sí                   | sí                   | `src/__tests__/pages/LDC/Documentation/[group].test.jsx`                         |
| `/LDC/Recomendation/[group]`             | `src/pages/LDC/Recomendation/[group].jsx`                         | `src/app/LDC/Recomendation/[group]/page.jsx`                    | 4 (LDC) → 6 | sí                   | sí                   | `src/__tests__/pages/LDC/Recomendation/[group].test.jsx`                         |
| — (no enrutable en app/)                 | `src/pages/LDC/Recomendation/components/ItemRecomendation.jsx`    | `src/app/LDC/Recomendation/components/ItemRecomendation.jsx`    | 4 (LDC)     | no                   | no                   | `src/__tests__/pages/LDC/Recomendation/components/ItemRecomendation.test.jsx`    |
| `/LDC/RequestsReview`                    | `src/pages/LDC/RequestsReview/index.jsx`                          | `src/app/LDC/RequestsReview/page.jsx`                           | 3 → 6       | no                   | no                   | `src/__tests__/pages/LDC/RequestsReview/index.test.jsx`                          |
| `/LDC/ReturnRequest/[group]`             | `src/pages/LDC/ReturnRequest/[group].jsx`                         | `src/app/LDC/ReturnRequest/[group]/page.jsx`                    | 4 (LDC) → 6 | sí                   | sí                   | `src/__tests__/pages/LDC/ReturnRequest/[group].test.jsx`                         |
| `/Login`                                 | `src/pages/Login/index.jsx`                                       | `src/app/Login/page.jsx`                                        | 2           | no                   | sí (router.push×1)   | `src/__tests__/pages/Login/index.test.jsx`                                       |
| `/MRC/BuroValidation/[client]`           | `src/pages/MRC/BuroValidation/[client].jsx`                       | `src/app/MRC/BuroValidation/[client]/page.jsx`                  | 4 (MRC)     | sí                   | sí                   | `src/__tests__/pages/MRC/BuroValidation/[client].test.jsx`                       |
| — (no enrutable en app/)                 | `src/pages/MRC/BuroValidation/components/MethodConsult.jsx`       | `src/app/MRC/BuroValidation/components/MethodConsult.jsx`       | 4 (MRC)     | no                   | no                   | `src/__tests__/pages/MRC/BuroValidation/components/MethodConsult.test.jsx`       |
| `/MRC/Documentation/[group]`             | `src/pages/MRC/Documentation/[group].jsx`                         | `src/app/MRC/Documentation/[group]/page.jsx`                    | 4 (MRC) → 6 | sí                   | sí                   | `src/__tests__/pages/MRC/Documentation/[group].test.jsx`                         |
| `/MRC/RequestsReview`                    | `src/pages/MRC/RequestsReview/index.jsx`                          | `src/app/MRC/RequestsReview/page.jsx`                           | 3 → 6       | no                   | sí (router.push×1)   | `src/__tests__/pages/MRC/RequestsReview/index.test.jsx`                          |
| `/MRC/ValidateRequest/[group]`           | `src/pages/MRC/ValidateRequest/[group].jsx`                       | `src/app/MRC/ValidateRequest/[group]/page.jsx`                  | 4 (MRC)     | sí                   | sí                   | `src/__tests__/pages/MRC/ValidateRequest/[group].test.jsx`                       |
| `/SEC/Cover/[group]`                     | `src/pages/SEC/Cover/[group].jsx`                                 | `src/app/SEC/Cover/[group]/page.jsx`                            | 4 (SEC) → 6 | sí                   | sí (router.push×1)   | `src/__tests__/pages/SEC/Cover/[group].test.jsx`                                 |
| `/SEC/RequestsReview/[group]`            | `src/pages/SEC/RequestsReview/[group].jsx`                        | `src/app/SEC/RequestsReview/[group]/page.jsx`                   | 4 (SEC) → 6 | sí                   | no                   | `src/__tests__/pages/SEC/RequestsReview/[group].test.jsx`                        |
| `/SEC/RequestsReview`                    | `src/pages/SEC/RequestsReview/index.jsx`                          | `src/app/SEC/RequestsReview/page.jsx`                           | 3 → 6       | no                   | sí (router.push×1)   | `src/__tests__/pages/SEC/RequestsReview/index.test.jsx`                          |
| `/Shared/Cover/[group]`                  | `src/pages/Shared/Cover/[group].jsx`                              | `src/app/Shared/Cover/[group]/page.jsx`                         | 5 → 6       | sí                   | sí                   | `src/__tests__/pages/Shared/Cover/[group].test.jsx`                              |
| `/Shared/GeneralBalance/[request]`       | `src/pages/Shared/GeneralBalance/[request].jsx`                   | `src/app/Shared/GeneralBalance/[request]/page.jsx`              | 5           | sí                   | sí                   | `src/__tests__/pages/Shared/GeneralBalance/[request].test.jsx`                   |
| — (no enrutable en app/)                 | `src/pages/Shared/GeneralBalance/components/ItemBalance.jsx`      | `src/app/Shared/GeneralBalance/components/ItemBalance.jsx`      | 5           | no                   | no                   | `src/__tests__/pages/Shared/GeneralBalance/components/ItemBalance.test.jsx`      |
| `/Shared/History/[group]`                | `src/pages/Shared/History/[group].jsx`                            | `src/app/Shared/History/[group]/page.jsx`                       | 5           | sí                   | sí (router.push×1)   | `src/__tests__/pages/Shared/History/[group].test.jsx`                            |
| `/Shared/History`                        | `src/pages/Shared/History/index.jsx`                              | `src/app/Shared/History/page.jsx`                               | 5           | no                   | no                   | `src/__tests__/pages/Shared/History/index.test.jsx`                              |
| `/Shared/Model/[group]`                  | `src/pages/Shared/Model/[group].jsx`                              | `src/app/Shared/Model/[group]/page.jsx`                         | 5           | sí                   | sí                   | `src/__tests__/pages/Shared/Model/[group].test.jsx`                              |
| `/Shared/PCD/[request]`                  | `src/pages/Shared/PCD/[request].jsx`                              | `src/app/Shared/PCD/[request]/page.jsx`                         | 5 → 6       | sí                   | sí                   | `src/__tests__/pages/Shared/PCD/[request].test.jsx`                              |
| `/Shared/PropertyVerification/[request]` | `src/pages/Shared/PropertyVerification/[request].jsx`             | `src/app/Shared/PropertyVerification/[request]/page.jsx`        | 5           | sí                   | sí (router.push×1)   | `src/__tests__/pages/Shared/PropertyVerification/[request].test.jsx`             |
| `/Shared/StateResults/[request]`         | `src/pages/Shared/StateResults/[request].jsx`                     | `src/app/Shared/StateResults/[request]/page.jsx`                | 5           | sí                   | sí                   | `src/__tests__/pages/Shared/StateResults/[request].test.jsx`                     |
| `/Shared/Tracking`                       | `src/pages/Shared/Tracking/index.jsx`                             | `src/app/Shared/Tracking/page.jsx`                              | 5           | no                   | no                   | `src/__tests__/pages/Shared/Tracking/index.test.jsx`                             |
| — (no enrutable en app/)                 | `src/pages/Shared/components/PeriodView.jsx`                      | `src/app/Shared/components/PeriodView.jsx`                      | 5           | no                   | no                   | `src/__tests__/pages/Shared/components/PeriodView.test.jsx`                      |
| `/`                                      | `src/pages/index.jsx`                                             | `src/app/page.jsx`                                              | 2           | no                   | sí (router.push×2)   | `src/__tests__/pages/index.test.jsx`                                             |

### 1.1 Archivos fuera de la tabla

| Archivo                               | Destino                                               | Ola                       | Suite actual                                     |
| ------------------------------------- | ----------------------------------------------------- | ------------------------- | ------------------------------------------------ |
| `src/pages/_app.js`                   | `src/app/layout.jsx` + componente cliente `Providers` | 0 (se crea), 9 (se borra) | —                                                |
| `src/pages/_document.js`              | `src/app/layout.jsx` (`<html>`/`<body>`)              | 0 (se crea), 9 (se borra) | —                                                |
| `src/pages/api/auth/[...nextauth].js` | `src/app/api/auth/[...nextauth]/route.js`             | 7                         | — (sin suite propia)                             |
| `src/pages/api/genericRequest.js`     | `src/app/api/genericRequest/route.js`                 | 7                         | `src/__tests__/pages/api/genericRequest.test.js` |

### 1.2 Conteos verificados (reproducibles)

Ejecutados desde la raíz del repositorio el 2026-09-29:

```bash
find src/pages -type f | wc -l                                              # 47
find src/pages -type f ! -name '_app.js' ! -name '_document.js' | wc -l     # 45 (incluye los 2 handlers de api/)
grep -rl 'next/router' src --include=*.js --include=*.jsx --exclude-dir=__tests__ | wc -l   # 43 (34 en src/pages + 9 en src/components)
grep -rl getServerSideProps src/pages | wc -l                               # 25
grep -rlE 'idProfile|constProfiles' src --include=*.js --include=*.jsx --exclude-dir=__tests__ | wc -l                          # 29 (26 sin src/__mocks__)
grep -rE 'router\.(push|reload|replace|back)' src --include=*.js --include=*.jsx --exclude-dir=__tests__ | wc -l                # 22 líneas (todas `push` salvo 1 `reload`)
```

**Diferencias con lo que dice la spec** (a resolver por el humano, la spec no se toca desde la implementación):

| Dato                                             | Spec                                    | Medido                                                                                                            | Nota                                                                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Archivos en `src/pages`                          | 44                                      | 47 en total; 45 sin `_app.js`/`_document.js`; **44 sin `_app.js`, `_document.js` ni `api/auth/[...nextauth].js`** | La cifra 44 coincide con los archivos cubiertos por SPEC 03 (`jest.config.js` excluye `_app`, `_document` y `api/auth/*` de la cobertura). El inventario de este documento usa los 47, porque la migración también los mueve. |
| Archivos con `next/router`                       | 43                                      | 43                                                                                                                | Coincide, pero **34 están en `src/pages` y 9 en `src/components`** (ver Paso 2).                                                                                                                                              |
| Con `getServerSideProps`                         | 25                                      | 25                                                                                                                | Coincide.                                                                                                                                                                                                                     |
| Con `idProfile`/`constProfiles` fuera de pruebas | 27                                      | 29 (26 excluyendo `src/__mocks__`)                                                                                | Depende de si `src/__mocks__` cuenta como "pruebas".                                                                                                                                                                          |
| Páginas de `Shared` en la Ola 5                  | "12 páginas de `Shared` y `PeriodView`" | 9 páginas + 2 subcomponentes (`ItemBalance`, `PeriodView`) = 11 archivos                                          | La cifra 12 no cuadra.                                                                                                                                                                                                        |
| `router.reload`                                  | 1                                       | 1 (`EMG/Documentation/components/LegalRepresentatives.jsx`)                                                       | Coincide.                                                                                                                                                                                                                     |

Observaciones que afectan a olas posteriores:

- `pages/SEC/RequestsReview/[group].jsx` y `pages/Shared/History/index.jsx` usan `query` sin importar `next/router` (es el contexto de `getServerSideProps` en el primero y un objeto de filtros en el segundo), así que **no** son consumidores del router.
- `LDC/RequestsReview/index.jsx` no usa `next/router` (los demás `RequestsReview/index` sí).
- `next/head` se usa en `src/components/Layout/AuthLayout.jsx` y `MainLayout.jsx`; en App Router hay que reemplazarlo por `metadata` (se documenta en el Paso 6).
- Las suites de `src/__tests__/pages` existen para todos los archivos de la tabla; solo faltan para `_app`, `_document` y `[...nextauth]`.

## 2. Compatibilidad de router

### 2.1 Uso real de `next/router` (43 archivos)

Clasificación por API usada (medida con `grep` sobre `src/`, sin pruebas). **La spec hablaba de `push`, `query` y `reload`; el código usa además `replace`, `back` y `asPath`, y `reload` aparece 3 veces, no 1.**

| API de Pages Router                        | Dónde se usa                                                                                                                                                                                                                                                                   | Equivalente en App Router                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `push(string)`                             | ~22 llamadas directas en páginas (`router.push`) y otras ~40 desestructuradas (`const { push } = useRouter()`) en páginas y en `CancelRequestButton`, `IconVerification`, `VerificationCompanyView`, `AccessDirectApplication`, `RequestsContainer`, `RowItem`, `CoverPreview` | `router.push` de `next/navigation` (sin `Promise`)                                                                                                     |
| `push({ pathname })` (objeto)              | `CoverPreview.jsx:41`                                                                                                                                                                                                                                                          | `router.push(string)`; el objeto no existe en App Router. El adaptador debe aceptar ambos o el componente pasa a `string`                              |
| `replace(string)`                          | `LDC/Documentation/[group]` (l. 79), `LDC/ReturnRequest/[group]` (l. 45)                                                                                                                                                                                                       | `router.replace`                                                                                                                                       |
| `back()`                                   | `404.jsx`, `500.jsx`                                                                                                                                                                                                                                                           | `router.back`                                                                                                                                          |
| `reload()`                                 | `ReassignmentAnalystBall.jsx:60`, `MRC/Documentation/[group].jsx:103`, `EMG/Documentation/components/LegalRepresentatives.jsx:136`                                                                                                                                             | Ver 2.3                                                                                                                                                |
| `asPath`                                   | `Navbar.jsx:12` (resalta el ítem activo con `includes`)                                                                                                                                                                                                                        | `usePathname()` (+ `useSearchParams()` si se quisiera la query)                                                                                        |
| `query` (lectura de `useRouter`)           | `CoverPreview.jsx:38` (`router.query.group`)                                                                                                                                                                                                                                   | `useParams()` para segmentos dinámicos, `useSearchParams()` para query string                                                                          |
| `query` (contexto de `getServerSideProps`) | 25 páginas (`params`) y `EMG/PCD`, `Shared/PCD` (`query.request`, `query.idGroup`)                                                                                                                                                                                             | Prop `params` de la página; **`PCD` lee `idGroup` de la query string, no del segmento**: en App Router es la prop `searchParams` o `useSearchParams()` |

No se usan `router.events`, `isReady`, `prefetch`, `beforePopState` ni `await router.push(...)`: nadie depende de la promesa que devuelve `push`, así que la diferencia de tipo de retorno no rompe nada.

### 2.2 Consumidores de `next/router`

**En `src/components` (9 archivos, compartidos por ambos routers durante la convivencia; necesitan el adaptador en la Ola 0):**

| Componente                                         | API                                                                                                          | Notas                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `Controls/CancelRequestButton.jsx`                 | `push`                                                                                                       |                                                                                                               |
| `Controls/ReassignmentAnalystBall.jsx`             | `reload`                                                                                                     | recarga datos tras reasignar (ver 2.3)                                                                        |
| `History/IconVerification.jsx`                     | `push`                                                                                                       | también usa `next/link`                                                                                       |
| `PropertyVerification/VerificationCompanyView.jsx` | `push` (2)                                                                                                   |                                                                                                               |
| `Requests/CoverPreview.jsx`                        | `push` (objeto y string), `query`                                                                            | el más delicado: lee `router.query.group` y hace `push({ pathname })`; se usa en `SEC/RequestsReview/[group]` |
| `Tables/LeaderRequest/AccessDirectApplication.jsx` | `push`                                                                                                       |                                                                                                               |
| `Tables/LeaderRequest/RequestsContainer.jsx`       | `push`                                                                                                       |                                                                                                               |
| `Tables/RowItem.jsx`                               | `push` con URL armada a mano (`/${user?.path}/ApplicationEvaluation/${id}`), que no pasa por `mapRoutePages` | revisar en la Ola 6                                                                                           |
| `UI/Navbar.jsx`                                    | `asPath`                                                                                                     | usado por `Layout/MainLayout`; además `MainLayout` y `AuthLayout` usan `next/head`                            |

**En `src/pages` (34 archivos):** cada página se convierte en su ola y reemplaza el import por el adaptador o por `next/navigation`. Detalle por API en la tabla 2.1; el detalle por archivo está en la columna "Usa `next/router`" del inventario.

**Un componente compartido no puede migrarse antes que todas las páginas que lo usan** (bajo `app/` `next/router` lanza error; bajo `pages/` `next/navigation`'s `useRouter` también lanza). Por eso el adaptador es obligatorio y no basta con reemplazar imports.

### 2.3 Qué hacer con `reload()`

`router.refresh()` de App Router **no** recarga el estado del cliente ni vuelve a ejecutar los `useEffect` que traen datos, que es lo que hacen hoy los tres usos (recargar la pantalla tras una mutación y esperar 1–2 s para que se vea el mensaje). Decisión propuesta: **el adaptador expone `reload` como `window.location.reload()` bajo App Router** y `router.reload()` de Pages bajo Pages. Es el mismo comportamiento (recarga completa), no cambia la experiencia y no exige reescribir las pantallas. Reemplazar estos tres usos por refetch de datos queda como mejora futura, fuera de esta spec.

### 2.4 Contrato del adaptador (Ola 0)

Ubicación propuesta: `src/hooks/useAppRouter.js`. Devuelve `{ push, replace, back, reload, query, pathname, asPath }` (se añade `asPath`, que la spec no listaba, por `Navbar`).

- **Selección:** `useRouter` de `next/compat/router`; si devuelve un objeto, estamos en Pages Router y se delega en él. Si devuelve `null`, estamos en App Router y se construye a partir de `useRouter`, `usePathname`, `useParams` y `useSearchParams` de `next/navigation`.
- **`push`/`replace` con objeto:** si el argumento es `{ pathname, query }`, en App se convierte a `string`.
- **`query`:** en App es la unión de `useParams()` y `Object.fromEntries(useSearchParams())`; en Pages, `router.query`.
- **`reload`:** ver 2.3.
- **Reglas de hooks:** los hooks de `next/navigation` se llaman siempre y sus resultados se ignoran en Pages (no lanzan, salvo `useRouter` de `next/navigation`, que solo se invoca cuando el compat devuelve `null`); un componente vive en un solo router durante su ciclo de vida, así que el orden de hooks es estable. Se documenta con `eslint-disable` local.
- **Retirada:** la Ola 9 borra el adaptador y cada consumidor pasa a `next/navigation` directamente.

### 2.5 Impacto en pruebas

- 58 archivos bajo `src/__tests__` mencionan `next/router`, y 21 usan `createRouter` de `src/__tests__/utils/router.js`; `src/__tests__/utils/page.jsx` hace `useRouter.mockReturnValue(...)` sobre `next/router`.
- En la Ola 0 el helper pasa a mockear el adaptador (`src/hooks/useAppRouter`) en vez de `next/router`, y `createRouter` gana `asPath`/`query` coherentes con el adaptador. Los componentes compartidos se prueban una vez contra el adaptador y no contra cada router.
- Cada ola conserva el criterio de ≥ 80% de líneas y ramas por archivo (SPEC 03).

## 3. Perfilamiento: mantener o evolucionar

### 3.1 Dónde decide hoy el perfil

Medido con `grep` sobre `src/` (sin pruebas ni `__mocks__`). Los 26 archivos con `idProfile`/`constProfiles` caen en tres categorías distintas, y solo la primera es "permiso de pantalla":

| #   | Categoría                                     | Piezas                                                                                                                                                                                                                                                                                                                                                                                                        | Qué decide                                                                                                                                                                                |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | **Acceso y arranque**                         | `helpers/config/gbConfig.js` (`pagesByPerfil`), `pages/api/auth/[...nextauth].js` (inyecta `settings: pagesByPerfil[idProfile]`), `middleware.js`, `pages/Login/index.jsx` (`push(settings.startPage)`), `components/UI/Navbar.jsx` (`settings.startPage`, `settings.menu`, `asPath`), `context/easyReducer.js` (copia `settings.path` y `settings.status` a `user`)                                          | Qué URLs puede abrir, a dónde va al entrar, qué menú ve                                                                                                                                   |
| B   | **Perfil dentro de la URL**                   | 23 archivos leen `user.path` / `userActive.path` (`CancelRequestButton`, `VerificationCompanyView`, `AccessDirectApplication`, `RowItem` y 19 páginas) y **23 llamadas** a `mapRoutePages.*` pasan el perfil como literal (`'LDC'`, `'MRC'`, `'EMG'`, `'ADC'`)                                                                                                                                                | Construye `/<perfil>/...`; si la URL deja de llevar el perfil, todas dejan de tener sentido                                                                                               |
| C   | **Comportamiento de negocio por `idProfile`** | `components/` (`ParticipantsTable`, `CancelRequestButton`, `FilterContainer`, `History/*`, `PropertiesView`, `VerificationCompanyView`, `ApplicantDropdown`, `QuickActionBar`, `RowItem`), `context/EasyProvider.js`, `helpers/initials/initDocuments.js` e `initHistory.js`, `services/servCheckList.js`, `services/servPropertyVerification.js`, `Shared/History`, `Shared/PropertyVerification`, `EMG/PCD` | Qué botones, filtros, checklist, plantillas de historial y reglas de validación aplican; también qué catálogos se cargan (`setDataAnalyst` solo para LDC, `setDataLeader` para LDC y MRC) |
| —   | **`status` por perfil**                       | `settings.status` (p. ej. `[4, 22]` en ADC) se usa en `CancelRequestButton`, `AccessDirectApplication`, `RowItem` y `servCheckList` para habilitar acciones según el estado de la solicitud                                                                                                                                                                                                                   | Regla de negocio (estado × perfil), no un permiso de pantalla                                                                                                                             |

Consecuencia directa para el diseño: **entregar solo `screens` desde el backend no basta**. La categoría C y `status` seguirán necesitando `idProfile` (o banderas de capacidad) mientras la lógica de negocio del front no se rediseñe, y eso está fuera de esta spec.

### 3.2 Comportamiento actual de `pagesByPerfil` y `middleware.js`

Permisos efectivos hoy = carpeta propia del perfil (implícita por `path`) + `allowedPages` (solo pantallas de `Shared`, pero también sirven para otras carpetas, ver 3.3).

| Perfil | `idProfile` | `path` | Carpeta propia                                                                                     | `allowedPages`                                                                                           | `startPage`           | `status`   |
| ------ | ----------- | ------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- | ---------- |
| ADC    | 1           | `ADC`  | `ApplicationEvaluation`, `Documentation`, `Recomendation`, `RequestsReview`, `ReturnRequest`       | `PCD`, `PropertyVerification`, `History`, `Model`, `Cover`, `GeneralBalance`, `StateResults`, `Tracking` | `/ADC/RequestsReview` | 4, 22      |
| MRC    | 2           | `MRC`  | `BuroValidation`, `Documentation`, `RequestsReview`, `ValidateRequest`                             | `PCD`, `PropertyVerification`, `History`, `Tracking`                                                     | `/MRC/RequestsReview` | 2          |
| EMG    | 3           | `EMG`  | `Documentation`, `GeneralInformation`, `PCD`, `RequestsReview`, `Solidary` (más `/` como buscador) | `PropertyVerification`, `History`, `Tracking`                                                            | `/`                   | 1, 7, 8, 9 |
| LDC    | 4           | `LDC`  | `ApplicationEvaluation`, `Documentation`, `Recomendation`, `RequestsReview`, `ReturnRequest`       | `PCD`, `PropertyVerification`, `History`, `Model`, `Cover`, `StateResults`, `GeneralBalance`, `Tracking` | `/LDC/RequestsReview` | 3, 5       |
| SEC    | 5           | `SEC`  | `Cover`, `RequestsReview` (+`[group]`)                                                             | `History`, `Tracking`                                                                                    | `/SEC/RequestsReview` | 6          |
| FAC    | 6           | `FAC`  | `RequestsReview` (+`[group]`)                                                                      | `History`, `Tracking`                                                                                    | `/FAC/RequestsReview` | 26         |

Lógica del middleware (`src/middleware.js`): sin sesión → `/Login`; con sesión:

1. `isAllowed = allowedPages.some(p => pathname.includes(p))`.
2. Si el perfil **no** es EMG, la URL no contiene `path` y no `isAllowed` → `startPage`. En la práctica, solo EMG puede quedarse en `/`.
3. Si la URL no es `/`, no contiene `path` y no `isAllowed` → `startPage`.

El `matcher` cubre `/` y las carpetas `ADC|EMG|MRC|LDC|Shared|SEC|FAC`; `/Login`, `/404`, `/500` y `/api/*` quedan fuera (públicos).

### 3.3 Hallazgos que el rediseño debe decidir (no arreglar por sorpresa)

- **Coincidencia por subcadena con efectos laterales.** Como `allowedPages` se compara con `includes` sobre toda la URL, `PCD` en ADC/MRC/LDC también abre `/EMG/PCD/...`, y `Cover` en ADC/LDC abre `/SEC/Cover/...`, aunque esas carpetas "no son suyas". Es el comportamiento vigente; las pruebas de la Ola 8 lo deben caracterizar. Con claves de pantalla (`screens`) deja de existir y hay que decidir con el equipo funcional si se conserva o se corrige.
- **El permiso viaja en el JWT y no se refresca.** En `[...nextauth].js` el callback `jwt` solo copia `user` cuando hay `account` (login); `maxAge` es 14 400 s (4 h). Un cambio de permisos en backend no se ve hasta el siguiente login.
- **`settings` completo (incluido `menu`) va en el token**; una lista de pantallas grande engorda el JWT en cada request al middleware.
- **`settings.path` cumple dos roles** (prefijo de URL y clave de perfil); al desaparecer de la URL solo queda el segundo.
- **`pagesByPerfil` no cubre pantallas nuevas por sí solo**: añadir una pantalla implica tocar carpeta, `allowedPages`/`menu` y a veces el `matcher`.

### 3.4 Opciones evaluadas

|           | **A. Mantener** (perfil en la URL, `pagesByPerfil` en el front)                                                                           | **B. Evolucionar por fases** (recomendada)                                                                                                                    | **C. Backend directo desde el primer día** (sin capa intermedia)                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Idea      | Migrar a `app/` conservando `/<perfil>/...`, `includes` y `matcher`                                                                       | Capa de permisos en el front (Ola 1) → URLs 1:1 (Olas 2–5) → rutas compartidas (Ola 6) → permisos del backend (Ola 7)                                         | Consumir permisos del backend ya en la migración, sin adaptador sobre `pagesByPerfil`                                                                           |
| Ventajas  | Cero cambio de URLs y de comportamiento; migración corta                                                                                  | Cada paso se valida con las suites existentes y se revierte solo; el backend no bloquea el resto; separa el cambio de router, de URLs y de origen de permisos | Menos código transitorio; una sola fuente de verdad desde el inicio                                                                                             |
| Costes    | Conserva carpetas duplicadas, `path` en 23 archivos y `includes`; **no cumple** la decisión de que el backend decida pantallas y permisos | Más olas y código transitorio (adaptador sobre `pagesByPerfil`, redirecciones)                                                                                | Depende del contrato del backend antes de mover una sola página; si se retrasa se bloquea todo; ante un fallo no se sabe si es de router, de URLs o de permisos |
| Riesgo    | Bajo a corto plazo, deuda alta                                                                                                            | Bajo por ola; puntos de no retorno en Ola 6 y Ola 9                                                                                                           | Alto: tres cambios de naturaleza distinta a la vez                                                                                                              |
| Reversión | Trivial                                                                                                                                   | Por ola con `git revert`                                                                                                                                      | Difícil (mezcla de cambios)                                                                                                                                     |

**Recomendación: opción B.** La Ola 1 introduce una abstracción única (`puede acceder a la pantalla X`, `pantalla de inicio`, `menú`, `estados`) que hoy lee de un adaptador sobre `pagesByPerfil`; cuando el backend entregue los permisos solo cambia `authorize`, y el middleware y el `Navbar` no vuelven a cambiar. La opción A queda descartada por contradecir la decisión del usuario; la C, porque acopla la migración al calendario del backend.

### 3.5 Contrato de permisos que se pide al backend

**Es una propuesta para acordar con el equipo de backend; esta spec no la implementa.**

```jsonc
// Respuesta de POST /v1/auth/login (o de un endpoint de permisos posterior)
{
  "idProfile": 1,                       // se mantiene: la categoría C lo sigue necesitando
  "settings": {
    "screens": ["RequestsReview", "Documentation", "ApplicationEvaluation", "Recomendation",
                "ReturnRequest", "PCD", "PropertyVerification", "History", "Model", "Cover",
                "GeneralBalance", "StateResults", "Tracking"],   // claves de pantalla, no prefijos de URL
    "startPage": "/RequestsReview",     // URL final tras la Ola 6 (hasta entonces, la URL vigente)
    "menu": [{ "title": " Solicitudes", "redirectTo": "/RequestsReview", "isDisable": false }],
    "status": [4, 22]                   // estados sobre los que el perfil puede actuar (regla de negocio)
  }
}
```

- **Claves de pantalla:** las carpetas actuales (`RequestsReview`, `Documentation`, `ApplicationEvaluation`, `Recomendation`, `ReturnRequest`, `PCD`, `Cover`, `PropertyVerification`, `History`, `Model`, `GeneralBalance`, `StateResults`, `Tracking`) más las pantallas propias de un perfil (`GeneralInformation`, `Solidary`, `BuroValidation`, `ValidateRequest`). Cada una debe declararse explícitamente: ya no hay pantallas "implícitas por carpeta".
- **Momento de obtención:** en el login (`authorize`), guardado en el JWT como hoy. Para reflejar cambios de permisos antes de 4 h conviene un refresco periódico (p. ej. cada `updateAge` de 3 600 s desde el callback `jwt`) o una revalidación en servidor; se decide con backend.
- **Tamaño:** un arreglo de ≤ 20 claves cortas es pequeño; si `menu` crece conviene no incluirlo en el token y derivarlo en el cliente desde `screens`.
- **Qué piezas de `pagesByPerfil` desaparecen y cuáles no:**

| Campo          | Destino                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `allowedPages` | Reemplazado por `screens` (backend)                                                                      |
| `startPage`    | Backend                                                                                                  |
| `menu`         | Backend (o derivado de `screens`)                                                                        |
| `status`       | Backend (regla de negocio; el front sigue leyéndolo)                                                     |
| `path`         | **Desaparece** en rutas unificadas (Ola 6); queda solo si una pantalla propia de perfil conserva prefijo |
| `idProfile`    | **Se mantiene** hasta que la lógica de la categoría C se rediseñe                                        |

- **Seguridad:** el control del front es solo experiencia de usuario; **el backend debe autorizar cada llamada de API**, sobre todo cuando el perfil ya no aparece en la URL.

### 3.6 Preguntas abiertas para el equipo

1. ¿El backend mantiene `idProfile` en la respuesta de login? (lo necesita la categoría C).
2. ¿Los `screens` incluyen las pantallas propias de cada perfil o solo las de `Shared`?
3. ¿Se conserva el efecto de subcadena de 3.3 (p. ej. ADC abriendo `/EMG/PCD`) o se corrige?
4. ¿Cómo y cuándo se refrescan los permisos sin reloguear?
5. ¿`status` sigue siendo un dato del perfil o pasa a depender de cada solicitud?

## 4. Reutilización de pantallas entre perfiles

Principio: **se comparte la ruta, no el código.** Una URL única elige el componente según el perfil del usuario; los componentes actuales se mueven sin fusionarse.

### 4.1 Inventario revalidado con `diff`

Líneas cambiadas según `diff a b | grep -c '^[<>]'` (medido el 2026-09-29; entre paréntesis, largo de cada archivo).

| Pantalla                                     | Perfiles hoy                 | Comparación           | Líneas cambiadas | Lectura                                                                            |
| -------------------------------------------- | ---------------------------- | --------------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `RequestsReview` (índice)                    | ADC, EMG, FAC, LDC, MRC, SEC | ADC ↔ EMG (56/60)     | 24               | casi iguales                                                                       |
|                                              |                              | ADC ↔ MRC (56/51)     | 37               | casi iguales                                                                       |
|                                              |                              | EMG ↔ MRC (60/51)     | 43               | parecidas                                                                          |
|                                              |                              | FAC ↔ SEC (121/102)   | 39               | **parecidas entre sí**                                                             |
|                                              |                              | ADC ↔ FAC / ADC ↔ SEC | 119 / 110        | distintas                                                                          |
|                                              |                              | ADC ↔ LDC (56/131)    | **157**          | **muy distintas** (la spec no lo mencionaba)                                       |
| `RequestsReview/[group]`                     | FAC, SEC                     | FAC ↔ SEC (184/137)   | 183              | distintas                                                                          |
| `Documentation/[group]`                      | ADC, EMG, LDC, MRC           | ADC ↔ MRC (133/142)   | 121              | distintas                                                                          |
|                                              |                              | ADC ↔ LDC (133/169)   | 122              | distintas                                                                          |
|                                              |                              | ADC ↔ EMG (133/196)   | **183**          | distintas (la spec decía 121–174)                                                  |
|                                              |                              | LDC ↔ MRC / EMG ↔ MRC | 173 / 174        | distintas                                                                          |
| `ApplicationEvaluation/[group]`              | ADC, LDC                     | ADC ↔ LDC (191/151)   | 130              | distintas                                                                          |
| `Recomendation/[group]`                      | ADC, LDC                     | ADC ↔ LDC (153/158)   | **43**           | **casi iguales** (la spec la agrupaba con las distintas)                           |
| `Recomendation/components/ItemRecomendation` | ADC, LDC                     | ADC ↔ LDC (88/115)    | 121              | distintos                                                                          |
| `ReturnRequest/[group]`                      | ADC, LDC                     | ADC ↔ LDC (111/145)   | 92               | distintas                                                                          |
| `PCD/[request]`                              | `EMG`, `Shared`              | (403/65)              | 416              | **no son variantes: son "editar" (EMG) y "solo lectura" (`Shared`, `isDisabled`)** |
| `Cover/[group]`                              | `SEC`, `Shared`              | (169/217)             | 210              | **"Editar Carátula" (SEC) y "Caratula" de lectura (`Shared`)**                     |

Conclusión: se confirma que **la pantalla se repite y el código no**. Dos precisiones frente a la spec: (a) hay tres familias en el índice de `RequestsReview` (ADC/EMG/MRC, FAC/SEC y LDC) y (b) `PCD` y `Cover` son dos modos (edición y lectura) más que dos perfiles. Ninguna precisión cambia el mecanismo propuesto; solo sirve para priorizar candidatos a una fusión futura, fuera de esta spec.

**Pantallas exclusivas de un perfil (no se duplican):** `EMG/GeneralInformation/[client]`, `EMG/Solidary/[group]`, `MRC/BuroValidation/[client]`, `MRC/ValidateRequest/[group]`. Ver 4.6.

### 4.2 Rutas compartidas propuestas (Ola 6)

El nombre de carpeta actual se conserva (`RequestsReview`, no `Request`), con las mayúsculas exactas.

| Ruta compartida                                                                      | Reemplaza                                                               | Componentes por perfil                                                                                             | Sub-ola |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `/RequestsReview`                                                                    | `/ADC/…`, `/EMG/…`, `/FAC/…`, `/LDC/…`, `/MRC/…`, `/SEC/RequestsReview` | ADC, EMG, FAC, LDC, MRC, SEC (6 vistas)                                                                            | 6a      |
| `/RequestsReview/[group]`                                                            | `/FAC/RequestsReview/[group]`, `/SEC/RequestsReview/[group]`            | FAC, SEC (2 vistas); cualquier otro perfil → `notFound()`                                                          | 6a      |
| `/Documentation/[group]`                                                             | `/ADC/…`, `/EMG/…`, `/LDC/…`, `/MRC/Documentation/[group]`              | ADC, EMG, LDC, MRC (4 vistas + `LegalRepresentatives` de EMG)                                                      | 6b      |
| `/ApplicationEvaluation/[group]`, `/Recomendation/[group]`, `/ReturnRequest/[group]` | `/ADC/…` y `/LDC/…` de cada una                                         | ADC, LDC (2 vistas por pantalla; `ItemRecomendation` por perfil)                                                   | 6c      |
| `/PCD/[request]?idGroup=`                                                            | `/EMG/PCD/[request]`, `/Shared/PCD/[request]`                           | EMG → vista editable; el resto de perfiles permitidos (ADC, LDC, MRC) → vista de solo lectura (la actual `Shared`) | 6d      |
| `/Cover/[group]`                                                                     | `/SEC/Cover/[group]`, `/Shared/Cover/[group]`                           | SEC → vista editable; ADC y LDC → vista de solo lectura (la actual `Shared`)                                       | 6e      |

Las demás páginas de `Shared` (`History`, `Tracking`, `Model`, `GeneralBalance`, `StateResults`, `PropertyVerification`) **no cambian de URL**: ya son comunes y su prefijo `Shared` no es un perfil. Quitar ese prefijo es una decisión aparte (ver 4.6).

### 4.3 Mecanismo de selección por perfil

```js
// src/app/RequestsReview/_views/registry.js   (Ola 6; ubicación a confirmar)
import dynamic from 'next/dynamic';
export const profileViews = {
  1: dynamic(() => import('./ADC')),   // idProfile 1 = ADC
  2: dynamic(() => import('./MRC')),
  3: dynamic(() => import('./EMG')),
  4: dynamic(() => import('./LDC')),
  5: dynamic(() => import('./SEC')),
  6: dynamic(() => import('./FAC')),
};
```

- `src/app/RequestsReview/page.jsx` es un componente cliente: lee `idProfile` del contexto de usuario, elige la vista y le pasa las mismas props que hoy recibía (`idGroup` = `parseInt(params.group)`, etc.). Si el perfil no tiene vista → `notFound()`. Mientras la sesión carga, muestra el loader existente.
- **Dónde viven las vistas (propuesta):** en una carpeta privada junto a la ruta (`src/app/<Pantalla>/_views/<PERFIL>.jsx`); en App Router una carpeta con prefijo `_` no es enrutable, y el `git mv` conserva el historial. Alternativa descartada: `src/views/…` (separa el código de su pantalla). Se confirma en la primera sub-ola.
- **Carga diferida (`next/dynamic`) por perfil:** evita que cada página cargue las vistas de todos los perfiles. El registro `pantalla → perfil → componente` es el único punto que hay que tocar para añadir una vista.
- **Dos capas de control:** el permiso de pantalla (`screens` del contrato de la sección 3) decide si se puede entrar; el registro decide qué vista mostrar. Un perfil con permiso pero sin vista registrada → `notFound()`.
- Las suites de `src/__tests__/pages/<PERFIL>/<Pantalla>` se mueven con sus vistas a `src/__tests__/app/<Pantalla>/_views/`, y se añade una prueba de selección por perfil (sección de pruebas).

### 4.4 Cambio de URLs y redirecciones

Se implementan con `redirects()` en `next.config.js` como redirecciones **temporales** (`permanent: false`). Next las aplica **antes** del middleware y conserva la query string (`?idGroup=…`). Un patrón `:profile(A|B)` cubre varias URLs en una regla.

| #   | Origen (URL antigua)                                     | Destino                         | Sub-ola |
| --- | -------------------------------------------------------- | ------------------------------- | ------- |
| 1   | `/:profile(ADC\|EMG\|FAC\|LDC\|MRC\|SEC)/RequestsReview` | `/RequestsReview`               | 6a      |
| 2   | `/:profile(FAC\|SEC)/RequestsReview/:group`              | `/RequestsReview/:group`        | 6a      |
| 3   | `/:profile(ADC\|EMG\|LDC\|MRC)/Documentation/:group`     | `/Documentation/:group`         | 6b      |
| 4   | `/:profile(ADC\|LDC)/ApplicationEvaluation/:group`       | `/ApplicationEvaluation/:group` | 6c      |
| 5   | `/:profile(ADC\|LDC)/Recomendation/:group`               | `/Recomendation/:group`         | 6c      |
| 6   | `/:profile(ADC\|LDC)/ReturnRequest/:group`               | `/ReturnRequest/:group`         | 6c      |
| 7   | `/:profile(EMG\|Shared)/PCD/:request`                    | `/PCD/:request`                 | 6d      |
| 8   | `/:profile(SEC\|Shared)/Cover/:group`                    | `/Cover/:group`                 | 6e      |

- **Por qué hacen falta:** las sesiones activas conservan en su JWT el `menu` y el `startPage` antiguos hasta 4 h (sección 3); además hay marcadores, correos y enlaces del backend hacia `/EMG/...` y equivalentes.
- **Cambio de comportamiento aceptado:** hoy `/ADC/RequestsReview` abierto por un usuario LDC lo devuelve a su `startPage`; con la redirección lo lleva a `/RequestsReview` y ve **su** vista. El resultado para el usuario es equivalente.
- **Criterio para retirarlas:** cuando los registros de acceso (servidor o New Relic) no muestren tráfico a las URLs origen durante un periodo acordado (propuesta: 30 días), se pasan a `permanent: true` y, después, se eliminan en la Ola 9.
- **`middleware.js` en las olas 6a–6e:** el `matcher` debe incluir las rutas nuevas y la lógica `includes` debe seguir permitiéndolas (p. ej. añadirlas a `allowedPages` de los perfiles correspondientes) hasta la Ola 8, o el usuario será devuelto a su `startPage`. Se documenta por sub-ola.

### 4.5 Efecto sobre `mapRoutePages`, menús y URLs armadas a mano

`mapRoutePages` (`src/helpers/config/gbConstants.js`) pierde el parámetro `path` en las 7 funciones que lo reciben:

| Función                             | Hoy                                            | Después de la Ola 6              |
| ----------------------------------- | ---------------------------------------------- | -------------------------------- |
| `GO_TO_REQUESTS_PAGE`               | `(path)` → `/${path}/RequestsReview`           | `()` → `/RequestsReview`         |
| `GO_TO_REQUEST_DETAILS_PAGE`        | `(path, idGroup)`                              | `(idGroup)`                      |
| `GO_TO_CHECKLIST_PAGE`              | `(idGroup, path)` → `/${path}/Documentation/…` | `(idGroup)` → `/Documentation/…` |
| `GO_TO_PCD_PAGE`                    | `(path, idRequest, idGroup)`                   | `(idRequest, idGroup)`           |
| `GO_TO_RETURN_REQUEST_PAGE`         | `(path, idGroup, origin)`                      | `(idGroup, origin)`              |
| `GO_TO_APPLICATION_EVALUATION_PAGE` | `(path, idGroup)`                              | `(idGroup)`                      |
| `GO_TO_COVER_PAGE`                  | `(path, idGroup)`                              | `(idGroup)`                      |
| `GO_TO_RECOMENDATION_PAGE`          | `(path, idGroup)`                              | `(idGroup)`                      |

Para no tocar los 23 archivos de una vez, **cada sub-ola cambia solo la función de su pantalla, y el parámetro `path` sobrante se ignora hasta el final**; el borrado del parámetro en los llamadores se hace en la última sub-ola de 6 o en la Ola 9. Las 23 llamadas con perfil literal (`'LDC'`, `'MRC'`, …) pasan a la firma nueva en su sub-ola.

**URLs armadas a mano** que no pasan por `mapRoutePages` y hay que cubrir:

| Archivo                                                                                   | URL                                                                                | Sub-ola |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| `components/Tables/RowItem.jsx:55`                                                        | `` `/${user?.path}/ApplicationEvaluation/${idGroup}` ``                            | 6c      |
| `pages/LDC/ReturnRequest/[group].jsx:105-106`                                             | `` `/LDC/Documentation/${id}` `` y `` `/LDC/${origin}/${id}` ``                    | 6b/6c   |
| `pages/Shared/PropertyVerification/[request].jsx:119-120`                                 | `` `/${user.path}/${origin}/${idGroup}` `` cuando `origin === 'Documentation'`     | 6b      |
| `services/servCheckList.js:150-151`                                                       | `path = EMG ? 'EMG' : 'Shared'` para `GO_TO_PCD_PAGE`                              | 6d      |
| `pages/SEC/RequestsReview/[group].jsx:93,102` y `components/Requests/CoverPreview.jsx:41` | `pathname` con perfil (`GO_TO_COVER_PAGE`, `GO_TO_REQUEST_DETAILS_PAGE('SEC', …)`) | 6a/6e   |

**Menús y `startPage`** (`pagesByPerfil` o el backend, sección 3): al terminar 6a, el ítem "Solicitudes" pasa de `/<PERFIL>/RequestsReview` a `/RequestsReview` para los 6 perfiles, y `startPage` de ADC, MRC, LDC, SEC y FAC pasa a `/RequestsReview` (EMG conserva `/`). `Navbar` marca el ítem activo con `asPath.includes(redirectTo)`, que sigue funcionando con la ruta nueva.

### 4.6 Decisiones pendientes (a confirmar antes de la Ola 6)

| Tema                                                                                                    | Opciones                                                                                                    | Propuesta                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL de las pantallas exclusivas (`GeneralInformation`, `Solidary`, `BuroValidation`, `ValidateRequest`) | (a) conservar `/EMG/…` y `/MRC/…`; (b) quitar el prefijo (`/Solidary/[group]`…) y protegerlas por `screens` | **(b)**, en una sub-ola 6f con sus redirecciones: es la única forma de que el middleware definitivo (Ola 8) no conserve lógica de prefijo de perfil. La spec no las incluye en las sub-olas de la Ola 6; hay que aprobarlo. |
| Prefijo `Shared` en las demás pantallas comunes                                                         | conservarlo / quitarlo                                                                                      | Conservarlo: no depende del perfil ni bloquea el rediseño; quitarlo es cosmético                                                                                                                                            |
| Nombre de la carpeta de solicitudes                                                                     | `RequestsReview` / `Request` (lo que escribió el usuario)                                                   | `RequestsReview` (nombre real actual; evita renombrar archivos, pruebas y redirecciones)                                                                                                                                    |
| Ubicación de las vistas por perfil                                                                      | `_views/` junto a la ruta / `src/views/`                                                                    | `_views/`                                                                                                                                                                                                                   |
| Perfil con permiso pero sin vista registrada                                                            | `notFound()` / redirigir a `startPage`                                                                      | `notFound()` (falla visible y probada)                                                                                                                                                                                      |

## 5. Olas 0 y 1: base y permisos

Ninguna de las dos mueve páginas. `_app.js` y `_document.js` permanecen mientras exista algo en `src/pages` (hasta la Ola 9).

### 5.1 Ola 0 — Base

**Archivos nuevos**

| Archivo                                                   | Contenido                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/layout.jsx`                                      | Componente de servidor. Importa `material-symbols/outlined.css` y `../styles/globals.css` (mismos imports que `_app.js`; la ruta relativa es idéntica porque `src/app` y `src/pages` están al mismo nivel) y renderiza `<html><body><Providers>{children}</Providers></body></html>`. Sin atributo `lang`, igual que el `<Html>` actual de `_document.js`; añadir `lang='es'` es una mejora aparte. Exporta un `metadata` por defecto (`title: 'EasyCredit'`, la misma descripción que `MainLayout`). |
| `src/app/Providers.jsx`                                   | `'use client'`. `<SessionProvider><EasyProvider>{children}</EasyProvider></SessionProvider>`, con el mismo orden que `_app.js` y sin pasar `session` (hoy tampoco se pasa).                                                                                                                                                                                                                                                                                                                           |
| `src/hooks/useAppRouter.js`                               | Adaptador de router (sección 2.4). Se exporta desde `src/hooks/index.js`.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/components/Layout/PageHead.jsx` (nombre a confirmar) | Reemplazo de `next/head` en `MainLayout` y `AuthLayout` (ver 5.1.2).                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**5.1.1 Estado de los estilos y la fuente (comprobado en el repositorio)**

- Poppins no se carga con `next/font`: se declara con `@font-face` en `src/styles/globals.css` y `url(../../public/fonts/Poppins-*.ttf)` (18 archivos en `public/fonts`), y se aplica a `html`, `pre`, `button` y `div` dentro de `@layer base`. La URL es relativa al CSS, no al archivo que lo importa, así que ambos routers resuelven los mismos archivos.
- `tailwind.config.js` ya incluye `./src/app/**/*` en `content`, y `next.config.js` ya incluye `src/app` en `eslint.dirs`: no hay que cambiarlos en la Ola 0.
- **Comprobación de aceptación:** con una página de prueba temporal en `src/app` (se descarta, no se commitea) y una de `src/pages`, la fuente Poppins, los estilos de Tailwind y los iconos `material-symbols` deben verse igual en las dos; se verifica en la pestaña de red (18 fuentes `200`, sin duplicados) y visualmente.

**5.1.2 Cabecera de página (`next/head`)**

`MainLayout` y `AuthLayout` usan `next/head` para `<title>` y `<meta name='description'>`. Bajo App Router `next/head` **no** aplica, y una página `'use client'` no puede exportar `metadata` (React 18.3 tampoco eleva `<title>`). Opciones:

| Opción                                                                            | Ventaja                                                                                                                                       | Coste                                                                                                           |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **A. `PageHead` que delega según el router (propuesta)**                          | Cada página conserva su título sin cambios; bajo Pages sigue `next/head`, bajo App un `useEffect` fija `document.title` y la meta descripción | El título llega al cliente, no en el HTML inicial, en las páginas ya migradas (pantallas autenticadas, sin SEO) |
| B. `page.jsx` de servidor que exporta `metadata` y envuelve un componente cliente | Título en el HTML inicial                                                                                                                     | Un archivo extra por página (más de 30) y se aparta del patrón "una página = un componente cliente"             |

La spec no resuelve esto; se propone la **A**, con el `metadata` por defecto del `layout.jsx` como respaldo. Se confirma antes de ejecutar la Ola 0.

**5.1.3 Adaptador `useAppRouter`**

El contrato completo está en 2.4. Añadidos de esta ola:

- Se sustituyen los 9 imports de `next/router` en `src/components` por el adaptador (los de `src/pages` se cambian en su ola).
- **Pruebas:**
  - En `src/__tests__/utils/page.jsx`, `useRouter.mockReturnValue(...)` pasa a mockear `next/compat/router`, que es lo que el adaptador usa bajo Pages. Las 58 suites que hoy declaran `jest.mock('next/router', …)` cambian esa línea a `jest.mock('next/compat/router', …)` (cambio mecánico, un `sed`) sin tocar sus aserciones.
  - El adaptador tiene su propia suite con ambos caminos (Pages: compat devuelve un objeto; App: compat devuelve `null` y se mockea `next/navigation`) y cubre `reload`, `push` con objeto, `query` unificada y `asPath`. Los hooks de `next/navigation` distintos de `useRouter` no lanzan fuera de App Router; si algún caso lo hiciera, se ajusta en esta ola.
- **Verificación de la premisa de 2.4** (los hooks de `next/navigation` no lanzan bajo Pages) antes de fijar el adaptador.

**5.1.4 Configuración de calidad**

| Archivo                         | Cambio                                                                                                                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jest.config.js`                | `collectCoverageFrom` añade `src/app/**/*`; `coveragePathIgnorePatterns` añade `/src/app/layout.jsx` y `/src/app/Providers.jsx` (mismo criterio que `_app.js`/`_document.js`); `testMatch` ya cubre `src/__tests__/app/**` sin cambios |
| `sonar-project.properties`      | `sonar.sources` añade `src/app` (hoy no figura); `sonar.coverage.exclusions` añade `src/app/layout.jsx, src/app/Providers.jsx`                                                                                                         |
| `src/__tests__/utils/router.js` | `createRouter` gana `asPath` coherente con `pathname` y `query` (ya los tiene)                                                                                                                                                         |

**5.1.5 Comprobaciones de aceptación de la Ola 0**

- `pnpm run test` sin cambios en resultados ni en cobertura por archivo (≥ 80%).
- `pnpm run build` correcto con `src/app` presente y sin ninguna ruta en `app/` (Next debe aceptar un `layout.jsx` sin páginas; si no, se crea una ruta de sonda y se retira).
- Login → listado → detalle sin errores de hidratación; `MainLayout` y `AuthLayout` conservan su título.
- `docker build` con `compose.local.yml`: tamaño de imagen dentro del criterio de SPEC 04 y `newrelic` cargando (App Router cambia el trazado de `standalone`).
- **Reversión:** `git revert` del PR; no queda ninguna página en `app/`.

### 5.2 Ola 1 — Capa de permisos

**Objetivo:** que nadie más lea `pagesByPerfil` ni `settings.path`/`allowedPages` directamente, **sin cambiar ningún comportamiento ni URL**.

**5.2.1 Módulo propuesto:** `src/helpers/permissions.js` (nombre y ubicación a confirmar).

| Función                                         | Qué devuelve                                                                                                                                    | Hoy lo hace                                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `buildSettings(idProfile)`                      | `{ screens, startPage, menu, status, path }` a partir de `pagesByPerfil[idProfile]`; `screens` = carpeta propia + `allowedPages` (tabla de 3.2) | `authorize` en `[...nextauth].js`                                 |
| `canAccessRoute(settings, idProfile, pathname)` | `boolean`                                                                                                                                       | lógica de `middleware.js` (`includes`, excepción de EMG y de `/`) |
| `canAccessScreen(settings, screenKey)`          | `boolean` sobre `screens`                                                                                                                       | (no existe)                                                       |
| `getStartPage(settings)`                        | `string`                                                                                                                                        | `settings.startPage` en `Login` y `Navbar`                        |
| `getMenu(settings)`                             | arreglo de ítems                                                                                                                                | `settings.menu` en `Navbar`                                       |
| `getStatuses(settings)`                         | arreglo de estados                                                                                                                              | `settings.status` vía `easyReducer`                               |

**Decisiones de diseño de la ola**

1. **`canAccessRoute` reproduce la lógica actual, incluido el efecto de subcadena descrito en 3.3.** `screens` se calcula y se guarda en `settings`, pero **no decide todavía**: hacerlo cambiaría qué URLs abre cada perfil. La Ola 8 pasa a decidir con `screens`, tras resolver esa pregunta con el equipo.
2. **`middleware.js` solo cambia sus llamadas:** `session` → `canAccessRoute(...)` → `NextResponse.redirect(getStartPage(settings))` / `next()`. El `matcher` no cambia.
3. **`authorize`** usa `buildSettings`. Cuando el backend entregue los permisos (Ola 7) solo cambia esa función.
4. **`Navbar`, `Login` y `easyReducer`** leen con `getMenu`, `getStartPage` y `getStatuses`; `easyReducer` sigue copiando `path` a `user.path` (necesario hasta la Ola 6).

**5.2.2 Pruebas (el punto más importante de la ola)**

El middleware **no tiene pruebas hoy** (`find src/__tests__ -iname '*middleware*'` sin resultados). Antes de refactorizarlo:

1. Se congela el comportamiento vigente con una **prueba de caracterización** de la función actual: matriz *perfil × URL* con las 6 carpetas de perfil, `/`, las 9 páginas de `Shared` y los `[group]`/`[request]` del inventario (sección 1) → resultado esperado (`next` o `redirect` a qué URL). Se genera ejecutando el `middleware.js` sin modificar.
2. Se refactoriza, y la misma matriz debe pasar sin cambios.
3. Se añaden casos sin sesión (→ `/Login`) y los efectos de subcadena de 3.3 (p. ej. ADC → `/EMG/PCD/1`, ADC → `/SEC/Cover/1`), marcados como "comportamiento vigente".
4. Suites nuevas para `permissions.js` (≥ 80% de líneas y ramas) y actualización de `Navbar.test.jsx` y de las pruebas de `Login`.

**5.2.3 Comprobaciones de aceptación de la Ola 1**

- La matriz de caracterización pasa idéntica antes y después.
- `grep -rn "pagesByPerfil\|allowedPages" src --include=*.js --include=*.jsx --exclude-dir=__tests__` solo encuentra `gbConfig.js` y `permissions.js`.
- `grep -rn "settings\.\(path\|startPage\|menu\|status\|allowedPages\)" src` solo encuentra `permissions.js` y `easyReducer.js`.
- Login con cada uno de los 6 perfiles termina en su `startPage` actual.
- **Dependencias:** Ola 0 (usa el adaptador en `Navbar`). **Reversión:** `git revert` del PR; el JWT de las sesiones activas tiene la misma forma (se añade `screens`, no se quita nada).

## 6. Olas 2 a 5: migración 1:1 (las URLs no cambian)

**Hasta la Ola 6 ninguna URL pública cambia.** Estas olas solo cambian de router; la lista de URLs a verificar (con mayúsculas exactas) está en 6.7.

### 6.1 Regla de oro: borrar en el mismo commit

Next falla al compilar si `pages/<ruta>` y `app/<ruta>` resuelven la misma URL. Por eso, en el commit que crea `src/app/<ruta>/page.jsx` se borra `src/pages/<ruta>`; con `git mv` ambos pasos son uno solo y el historial se conserva. Como cada ola es un PR, la aplicación compila y funciona en cada commit.

**Excepción documentada: `404` y `500`.** `not-found.jsx`/`error.jsx` no son rutas, no colisionan con `pages/404.jsx` y `pages/500.jsx`, y mientras existan páginas en `pages/` Next sigue necesitando ambas. Por eso en la Ola 2 se **crean** las de `app/` y las de `pages/` se **borran en la Ola 9** (riesgo ya recogido en la spec: 404/500).

### 6.2 Patrón de conversión de una página

Se aplica a cada archivo de la tabla de 6.3 a 6.6 (no a los subcomponentes, que solo se mueven):

1. `git mv src/pages/<A>/<B>/[group].jsx src/app/<A>/<B>/[group]/page.jsx` (los `index.jsx` pasan a `page.jsx` en la misma carpeta).
2. Primera línea `'use client';` (las páginas usan hooks, contexto y `next-auth/react`).
3. **Imports relativos: una carpeta más para las páginas dinámicas.** `[group].jsx` se convierte en `[group]/page.jsx`, un nivel más profundo, así que `../../../components` pasa a `../../../../components`. Los `index.jsx` y los subcomponentes conservan su profundidad. (No hay alias `@/` en `jsconfig.json`; crearlo queda fuera de esta spec.)
4. `import { useRouter } from 'next/router'` → `useAppRouter` (`src/hooks`). Se usa el adaptador y no `next/navigation` directamente, para que las suites cambien solo el mock (spec: "sustituir el mock de `next/router` por el del adaptador"); la Ola 9 los cambia a `next/navigation`.
5. `getServerSideProps` desaparece y la página recibe `{ params, searchParams }` (en Next 14.2 son objetos; en Next 15 serían promesas, y actualizar Next está fuera de esta spec). Equivalencias en 6.2.1.
6. **Un `page.jsx` solo puede exportar el componente por defecto** (y `metadata`, `dynamic`… propios de Next): cualquier otra exportación con nombre es un error de Next. Los `getServerSideProps` exportados se eliminan; su prueba se sustituye por una de `params` (6.2.2).
7. Mover la suite (6.2.2) y comprobar cobertura ≥ 80% por archivo.

#### 6.2.1 De `getServerSideProps` a `params`/`searchParams`

Lo que hay hoy en las 25 páginas (revisado archivo por archivo). **La spec decía que todas leen `params` con un patrón trivial; 9 leen `query` (segmento + query string), una devuelve 404 y hay valores por defecto que cambian el tipo.**

| Grupo                                                           | Páginas                                                                                                                                                                                                                                                                                                                                                                                                                                                | Antes                                                                          | Después                                                                                                                                                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Solo `params`, `idGroup` sin convertir (13)                  | `ADC/{ApplicationEvaluation,Documentation,Recomendation,ReturnRequest}`, `LDC/{ApplicationEvaluation,Documentation,Recomendation}`, `MRC/{Documentation,ValidateRequest}`, `FAC/RequestsReview/[group]`, `Shared/{Cover,History/[group],Model}`                                                                                                                                                                                                        | `{ group = 0 } = params` → `idGroup: group`                                    | `idGroup = params.group` (el segmento siempre existe; el `= 0` deja de ser alcanzable)                                                                                                    |
| 2. `params` con `parseInt` (3)                                  | `EMG/Documentation/[group]`, `EMG/Solidary/[group]` (`idGroup`), `EMG/GeneralInformation/[client]` (`idClient`)                                                                                                                                                                                                                                                                                                                                        | `parseInt(group)`                                                              | `parseInt(params.group)` (se conserva la conversión)                                                                                                                                      |
| 3. `query` = segmento + query string (8)                        | `EMG/PCD/[request]`, `Shared/PCD/[request]` (`idGroup`), `LDC/ReturnRequest/[group]` (`origin`, por defecto `'Documentation'`), `MRC/BuroValidation/[client]` (`idRequest = 0`, `idGroup`), `Shared/GeneralBalance/[request]` (`idClient`, `idGroup`, `rfc`, todos `= 0`), `Shared/PropertyVerification/[request]` (`idGroup = 0`, `origin = 'Documentation'`), `Shared/StateResults/[request]` (`idClient`, `idGroup`) y `SEC/RequestsReview/[group]` | valores de `query` con defaults                                                | segmento de `params` y el resto de `searchParams`, **conservando cada valor por defecto** (`searchParams.origin ?? 'Documentation'`, etc.)                                                |
| 4. `params` + `query` (1)                                       | `SEC/Cover/[group]`                                                                                                                                                                                                                                                                                                                                                                                                                                    | `idRequest: query.idRequest`                                                   | `searchParams.idRequest`                                                                                                                                                                  |
| 5. **404 condicional** (mismo archivo ya contado en el grupo 3) | `SEC/RequestsReview/[group]`                                                                                                                                                                                                                                                                                                                                                                                                                           | `notFound: true` si `group` no es numérico; `coverPreview = false` por defecto | `notFound()` de `next/navigation` al inicio del componente; `coverPreview` desde `searchParams`. Ojo: `searchParams.coverPreview` llega como cadena (`'true'`), igual que hoy con `query` |

Tipos: `params` y `searchParams` traen cadenas o arreglos de cadenas igual que `query`, así que los tipos de las props no cambian.

#### 6.2.2 Pruebas de cada página

- Se mueve `src/__tests__/pages/<ruta>` a `src/__tests__/app/<ruta>`: `[group].test.jsx` → `[group]/page.test.jsx`, `index.test.jsx` → `page.test.jsx`; se ajusta el import relativo del componente.
- Se cambia el mock de router al del adaptador (Ola 0: `next/compat/router`).
- **La prueba de `getServerSideProps` se reemplaza por una de `params`:** las suites de hoy llaman a `getServerSideProps({ params: { group: '7' } })` y esperan `{ props: { idGroup: '7' } }` (p. ej. `ADC/Documentation` líneas 52–58). Como `page.jsx` no puede exportar esa función, la equivalencia se comprueba renderizando `<Page params={{ group: '7' }} />` y afirmando el efecto observable (p. ej. `getDocumentation` recibe `'7'`, o el título de la página). Los defaults de `searchParams` y el `notFound()` de `SEC/RequestsReview/[group]` tienen su caso propio.
- Criterio: ≥ 80% de líneas y ramas por archivo (SPEC 03). No se aceptan olas que bajen ese umbral por mover suites.

### 6.3 Ola 2 — Sueltas (4 archivos)

| Archivo actual              | Destino                                          | Notas                                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/Login/index.jsx` | `src/app/Login/page.jsx`                         | Usa `signIn`/`useSession`; `pages.signIn: '/Login'` de NextAuth no cambia. Sus imports estáticos de `public/` conservan la profundidad. Comprobar que `router.push(startPage)` hacia una página aún en `pages/` es una navegación completa (ver riesgo de contexto, 6.8).                                                                     |
| `src/pages/index.jsx`       | `src/app/page.jsx`                               | URL `/`; 2 `router.push` y `mapRoutePages[destination]` con `user.path`. Colisiona con `pages/index.jsx`: se borra en el mismo commit.                                                                                                                                                                                                        |
| `src/pages/404.jsx`         | `src/app/not-found.jsx`                          | `'use client'` (usa `back`); envuelve `MainLayout`, que necesita `Providers` (los pone `layout.jsx`). La versión de `pages/` se borra en la Ola 9 (6.1).                                                                                                                                                                                      |
| `src/pages/500.jsx`         | `src/app/error.jsx` + `src/app/global-error.jsx` | `error.jsx` (`'use client'`, props `error`, `reset`) sustituye al mensaje "Server-side error occurred" para errores de render. `global-error.jsx` se renderiza **fuera** de `layout.jsx`: lleva sus propias etiquetas `<html><body>` y no puede usar `MainLayout` ni `Navbar` (sin `Providers`). La versión de `pages/` se borra en la Ola 9. |

- **Diferencia a comprobar:** `error.jsx` no atiende la URL `/500`; hoy `/500` se puede visitar directamente. Mientras exista `pages/500.jsx` la URL sigue funcionando.
- **Por confirmar en esta ola** (afecta a las siguientes): con `pages/404.jsx` y `app/not-found.jsx` a la vez, qué archivo atiende una URL desconocida. Se comprueba con `pnpm run build && pnpm start` visitando `/no-existe` y una URL de `app/` que llame a `notFound()`.
- Suites: `404.test.jsx`, `500.test.jsx`, `Login/index.test.jsx`, `index.test.jsx`.
- **Dependencias:** Ola 0 (layout, `Providers`, adaptador) y Ola 1 (el login usa `getStartPage`).

### 6.4 Ola 3 — Listados (6 archivos, misma URL)

| Archivo actual                           | Destino                               | Llamadas de router     |
| ---------------------------------------- | ------------------------------------- | ---------------------- |
| `src/pages/ADC/RequestsReview/index.jsx` | `src/app/ADC/RequestsReview/page.jsx` | `push` ×1              |
| `src/pages/EMG/RequestsReview/index.jsx` | `src/app/EMG/RequestsReview/page.jsx` | `push` ×1              |
| `src/pages/FAC/RequestsReview/index.jsx` | `src/app/FAC/RequestsReview/page.jsx` | `push` ×1              |
| `src/pages/LDC/RequestsReview/index.jsx` | `src/app/LDC/RequestsReview/page.jsx` | (no usa `next/router`) |
| `src/pages/MRC/RequestsReview/index.jsx` | `src/app/MRC/RequestsReview/page.jsx` | `push` ×1              |
| `src/pages/SEC/RequestsReview/index.jsx` | `src/app/SEC/RequestsReview/page.jsx` | `push` ×1              |

- Sin `getServerSideProps`; los `index.jsx` no cambian de profundidad, así que los imports relativos no se tocan.
- Los `[group]` de `FAC` y `SEC` siguen en `pages/` hasta la Ola 4: `app/FAC/RequestsReview/page.jsx` y `pages/FAC/RequestsReview/[group].jsx` conviven porque son URLs distintas.
- Estos listados usan los componentes de tabla que llaman a `RowItem`, `RequestsContainer` y `AccessDirectApplication` (con el adaptador, Ola 0): es la primera comprobación real de los componentes compartidos bajo App Router.
- **Dependencias:** Olas 0 y 2 (el patrón ya está validado en las sueltas).

### 6.5 Ola 4 — Páginas dinámicas por perfil (22 archivos, en 6 sub-olas)

Orden de menor a mayor complejidad (una rama/PR por sub-ola). Los subcomponentes `components/` se mueven sin cambios.

| Sub-ola | Perfil | Páginas (`[…].jsx` → `[…]/page.jsx`)                                                                                                                                    | Subcomponentes (se mueven tal cual)                                   | Total |
| ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----- |
| 4a      | FAC    | `RequestsReview/[group]` (`router.push` ×3)                                                                                                                             | —                                                                     | 1     |
| 4b      | SEC    | `Cover/[group]` (`push`, `searchParams.idRequest`), `RequestsReview/[group]` (`notFound()`, `coverPreview`; usa `CoverPreview`, que ya usa el adaptador)                | —                                                                     | 2     |
| 4c      | MRC    | `BuroValidation/[client]`, `Documentation/[group]` (`push`, `reload`), `ValidateRequest/[group]`                                                                        | `BuroValidation/components/MethodConsult.jsx`                         | 4     |
| 4d      | ADC    | `ApplicationEvaluation/[group]`, `Documentation/[group]`, `Recomendation/[group]`, `ReturnRequest/[group]`                                                              | `Recomendation/components/ItemRecomendation.jsx`                      | 5     |
| 4e      | LDC    | `ApplicationEvaluation/[group]`, `Documentation/[group]` (`push`, `replace`), `Recomendation/[group]`, `ReturnRequest/[group]` (`push`, `replace`, `origin`)            | `Recomendation/components/ItemRecomendation.jsx`                      | 5     |
| 4f      | EMG    | `Documentation/[group]` (`parseInt`), `GeneralInformation/[client]` (`parseInt`), `PCD/[request]` (403 líneas, `searchParams.idGroup`), `Solidary/[group]` (`parseInt`) | `Documentation/components/LegalRepresentatives.jsx` (`router.reload`) | 5     |

- Cada sub-ola cambia las URLs de **una** carpeta de perfil sin cambiar ninguna URL pública y se puede revertir sola.
- `EMG/PCD` y `Shared/PCD`, `SEC/Cover` y `Shared/Cover` viven en sub-olas distintas (4f, 4b y Ola 5) pero no colisionan: son URLs distintas.
- Los `reload` de `MRC/Documentation` y `LegalRepresentatives` usan `window.location.reload()` del adaptador (2.3); se comprueban a mano (mensaje → recarga a los 1–2 s).
- **Dependencias:** Ola 3 (los listados enlazan a estas páginas; conviene que la navegación listado → detalle ya esté bajo el mismo router).

### 6.6 Ola 5 — Shared (11 archivos)

| Archivo actual                                               | Destino                                 | Notas                                                   |
| ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------- |
| `src/pages/Shared/Cover/[group].jsx`                         | `src/app/Shared/Cover/[group]/page.jsx` | Se unifica con `SEC/Cover` en la Ola 6e                 |
| `src/pages/Shared/GeneralBalance/[request].jsx`              | `…/[request]/page.jsx`                  | 4 valores por defecto en `searchParams`                 |
| `src/pages/Shared/GeneralBalance/components/ItemBalance.jsx` | mismo directorio en `app/`              | subcomponente                                           |
| `src/pages/Shared/History/index.jsx`                         | `src/app/Shared/History/page.jsx`       | no usa `next/router` (su `query` es un filtro)          |
| `src/pages/Shared/History/[group].jsx`                       | `…/[group]/page.jsx`                    | `push` ×1                                               |
| `src/pages/Shared/Model/[group].jsx`                         | `…/[group]/page.jsx`                    |                                                         |
| `src/pages/Shared/PCD/[request].jsx`                         | `…/[request]/page.jsx`                  | Se unifica con `EMG/PCD` en la Ola 6d                   |
| `src/pages/Shared/PropertyVerification/[request].jsx`        | `…/[request]/page.jsx`                  | `push`; construye `genericUrl` con `user.path` (Ola 6b) |
| `src/pages/Shared/StateResults/[request].jsx`                | `…/[request]/page.jsx`                  |                                                         |
| `src/pages/Shared/Tracking/index.jsx`                        | `src/app/Shared/Tracking/page.jsx`      |                                                         |
| `src/pages/Shared/components/PeriodView.jsx`                 | mismo directorio en `app/`              | subcomponente                                           |

- **Nota sobre la spec:** en 1.2 se midió que son 9 páginas y 2 subcomponentes (11 archivos), no "12 páginas".
- Se hace al final de las migraciones 1:1 porque estas páginas son las más enlazadas desde el resto (checklist, historial).
- **Dependencias:** Olas 3 y 4 (todas las pantallas que enlazan a `Shared` ya usan `app/`; en la Ola 5 desaparecen los saltos entre routers en el flujo principal).

### 6.7 Comprobaciones de aceptación por ola (Olas 2 a 5)

Para cada PR de ola o sub-ola:

- [ ] `git mv` en un solo commit: no queda el archivo origen en `src/pages` y `pnpm run build` no informa de conflicto de rutas.
- [ ] `pnpm run test`: suites movidas en verde, ≥ 80% de líneas y ramas por archivo migrado, sin bajar la cobertura de otros archivos.
- [ ] `pnpm run build` y `pnpm start`: cada URL de la ola responde (sin redirecciones nuevas) y la consola del navegador no muestra errores de hidratación.
- [ ] Flujo login → listado → detalle con un usuario de **cada perfil afectado** (6 en Olas 2–3; el de la sub-ola en la Ola 4; ADC, LDC, MRC y EMG en la Ola 5).
- [ ] Ningún acceso a `next/router` en los archivos migrados (`grep -n "next/router" <archivos>` vacío).
- [ ] Al terminar 2 y 4: `docker build` con `compose.local.yml`, tamaño de imagen (SPEC 04) y carga de `newrelic`.
- [ ] Reversión: `git revert` del PR; al no haber cambios de URL ni de datos, no hay otra acción.

**URLs públicas a verificar (mayúsculas exactas; `[x]` = un id real):**

| Ola | URLs                                                                                                                                                                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | `/`, `/Login` (más `/no-existe` para el 404)                                                                                                                                                                                                                                                                                                                         |
| 3   | `/ADC/RequestsReview`, `/EMG/RequestsReview`, `/FAC/RequestsReview`, `/LDC/RequestsReview`, `/MRC/RequestsReview`, `/SEC/RequestsReview`                                                                                                                                                                                                                             |
| 4a  | `/FAC/RequestsReview/[group]`                                                                                                                                                                                                                                                                                                                                        |
| 4b  | `/SEC/Cover/[group]?idRequest=[x]`, `/SEC/RequestsReview/[group]`, `/SEC/RequestsReview/[group]?coverPreview=true`, `/SEC/RequestsReview/abc` (debe dar 404)                                                                                                                                                                                                         |
| 4c  | `/MRC/BuroValidation/[client]?idRequest=[x]&idGroup=[x]`, `/MRC/Documentation/[group]`, `/MRC/ValidateRequest/[group]`                                                                                                                                                                                                                                               |
| 4d  | `/ADC/ApplicationEvaluation/[group]`, `/ADC/Documentation/[group]`, `/ADC/Recomendation/[group]`, `/ADC/ReturnRequest/[group]?origin=Documentation`                                                                                                                                                                                                                  |
| 4e  | `/LDC/ApplicationEvaluation/[group]`, `/LDC/Documentation/[group]`, `/LDC/Recomendation/[group]`, `/LDC/ReturnRequest/[group]?origin=Documentation`                                                                                                                                                                                                                  |
| 4f  | `/EMG/Documentation/[group]`, `/EMG/GeneralInformation/[client]`, `/EMG/PCD/[request]?idGroup=[x]`, `/EMG/Solidary/[group]`                                                                                                                                                                                                                                          |
| 5   | `/Shared/Cover/[group]`, `/Shared/GeneralBalance/[request]?idGroup=[x]&rfc=[x]&idClient=[x]`, `/Shared/History`, `/Shared/History/[group]`, `/Shared/Model/[group]`, `/Shared/PCD/[request]?idGroup=[x]`, `/Shared/PropertyVerification/[request]?idGroup=[x]&origin=History`, `/Shared/StateResults/[request]?idGroup=[x]&rfc=[x]&idClient=[x]`, `/Shared/Tracking` |

Las URLs con perfil distinto al del usuario deben seguir devolviéndolo a su `startPage` (el middleware no cambia en estas olas): se prueba con al menos un caso denegado por ola.

### 6.8 Riesgos específicos de las olas 1:1

- **Navegación entre routers.** `pages/` y `app/` no comparten el árbol de React: pasar de una a otra es una carga completa, y el estado de `EasyProvider` que no esté en `localStorage` se pierde. Es transitorio y disminuye ola a ola; el orden 2 → 3 → 4 → 5 reduce los cruces del flujo principal.
- **Profundidad de imports.** Olvidar el `../` extra en las páginas dinámicas es el error más probable; falla al compilar, no en ejecución.
- **Valores por defecto de `query`.** Perder un `= 0` o `= 'Documentation'` cambia lo que reciben servicios y URLs; por eso 6.2.1 los lista por página y la suite de cada una los comprueba.
- **404 condicional de `SEC/RequestsReview/[group]`:** verificar `/SEC/RequestsReview/abc` y `/SEC/RequestsReview/0`.
- **Sesión durante la carga.** Si una página aún no tiene `user` en el contexto en el primer render, hoy y después es el mismo comportamiento (`EasyProvider` es el mismo); solo se compara, no se corrige.

## 7. Ola 6 — Unificación de rutas

Es la primera ola que **cambia URLs públicas** y, junto con la Ola 9, un punto de no retorno (7.9). Parte de que las Olas 3, 4 y 5 ya terminaron: todas las páginas afectadas están en `src/app` con su perfil en la ruta (`src/app/ADC/RequestsReview/page.jsx`, etc.). El diseño (rutas, registro, redirecciones, `mapRoutePages`) está en la sección 4; aquí se define **cómo se ejecuta**, en qué orden y con qué comprobaciones.

### 7.1 Orden y dependencias

| Sub-ola | Pantalla                                                                                     | Por qué en este orden                                                                                                                                               | Depende de    |
| ------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 6a      | `RequestsReview` (índice y `[group]`)                                                        | Mayor parecido entre perfiles (ADC/EMG/MRC casi iguales); es la puerta de entrada de todos los perfiles y arrastra menú y `startPage`; valida el mecanismo completo | Olas 1, 3 y 4 |
| 6b      | `Documentation/[group]`                                                                      | Cuatro vistas distintas; `ReturnRequest` de LDC arma `/${origin}/…` y enlaza con ella                                                                               | 6a            |
| 6c      | `ApplicationEvaluation`, `Recomendation`, `ReturnRequest`                                    | Solo ADC y LDC; `Recomendation` es la más parecida (43 líneas de diferencia), se hace primero                                                                       | 6b            |
| 6d      | `PCD/[request]`                                                                              | Un modo editable (EMG) y uno de solo lectura (resto)                                                                                                                | 6a            |
| 6e      | `Cover/[group]`                                                                              | Un modo editable (SEC) y uno de solo lectura (ADC, LDC)                                                                                                             | 6a            |
| 6f      | Pantallas exclusivas (`GeneralInformation`, `Solidary`, `BuroValidation`, `ValidateRequest`) | **Solo si se aprueba** (decisión 1 de 4.6); la spec no la incluye                                                                                                   | 6a a 6e       |

Cada sub-ola es un PR independiente con su propia spec (`/spec` + `/spec-impl`). Una sub-ola no se mezcla con otra: si algo falla no debe haber duda de cuál pantalla es la causa.

### 7.2 Procedimiento común de una sub-ola

1. **Mover las vistas, sin editarlas.** `git mv src/app/<PERFIL>/<Pantalla>/page.jsx src/app/<Pantalla>/_views/<PERFIL>.jsx` (para `[group]`: `src/app/<Pantalla>/[group]/_views/<PERFIL>.jsx`). La vista es el componente por defecto de la antigua página y **conserva su propio mapeo de `params`/`searchParams`** (incluido el `parseInt` de EMG): así el movimiento es un `git mv` más una línea, y el historial se conserva. Se elimina el `'use client'` de la vista solo si la nueva `page.jsx` ya lo declara; los subcomponentes `components/` se mueven junto a su vista.
2. **Crear `registry.js` y `page.jsx`** de la ruta compartida según 4.3: `page.jsx` (`'use client'`) lee `idProfile` de `useGlobalContext()`, busca la vista en el registro y le pasa `{ params, searchParams }`; si no hay vista, `notFound()`; mientras el usuario no está cargado muestra `Loader`. Cada vista se importa con `next/dynamic` y `loading: () => <Loader />`.
3. **`mapRoutePages`:** se cambian solo las funciones de la pantalla. La firma **conserva la posición de los argumentos** (`(_path, idGroup)`) para no tocar los 23 archivos que hoy pasan el perfil; el parámetro sobrante se elimina en el cierre (7.8).
4. **Permisos y middleware.** Con la Ola 1, `canAccessRoute` reproduce la lógica anterior. En cada sub-ola se declara la ruta compartida como **pantalla unificada**: para ella `canAccessRoute` decide con `screens` (clave = nombre de la pantalla, sección 3.5) y no con `includes`. Además:
   - se añade la ruta compartida al `matcher` de `middleware.js` (`/RequestsReview`, `/Documentation/:path*`, …); **si se olvida, la ruta queda sin protección de sesión en el borde**;
   - las URLs antiguas ya no llegan al middleware porque `redirects()` se aplica antes.
5. **Menú y `startPage`** (solo 6a): `redirectTo` de "Solicitudes" y `startPage` cambian a `/RequestsReview` en `pagesByPerfil` (o el backend, si ya entrega permisos); EMG conserva `startPage: '/'`.
6. **Redirecciones:** se añaden a `redirects()` en `next.config.js` las reglas de la tabla de 4.4 correspondientes (`permanent: false`).
7. **Pruebas** (7.7) y **comprobaciones de aceptación** (cada sub-ola en 7.3 a 7.6).

### 7.3 Sub-ola 6a — `RequestsReview`

| Antes                                                       | Después                                                                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app/{ADC,EMG,FAC,LDC,MRC,SEC}/RequestsReview/page.jsx` | `src/app/RequestsReview/_views/{ADC,EMG,FAC,LDC,MRC,SEC}.jsx` + `src/app/RequestsReview/{page.jsx,_views/registry.js}` |
| `src/app/{FAC,SEC}/RequestsReview/[group]/page.jsx`         | `src/app/RequestsReview/[group]/_views/{FAC,SEC}.jsx` + `src/app/RequestsReview/[group]/{page.jsx,_views/registry.js}` |

- **`mapRoutePages`:** `GO_TO_REQUESTS_PAGE()` → `/RequestsReview`; `GO_TO_REQUEST_DETAILS_PAGE(_path, idGroup)` → `/RequestsReview/${idGroup}`.
- **Otros archivos que cambian por esta URL:** `components/Requests/CoverPreview.jsx` (usa `'SEC'` literal en `GO_TO_REQUEST_DETAILS_PAGE`) y `Navbar` (el ítem activo con `asPath.includes('/RequestsReview')` sigue funcionando). Para las sesiones ya abiertas, la redirección cubre el `menu` y `startPage` antiguos guardados en su JWT (hasta 4 h).
- **Redirecciones:** reglas 1 y 2 de 4.4.
- **Acceptance específica:**
  - Cada perfil, tras iniciar sesión, llega a su `startPage` (`/RequestsReview` salvo EMG en `/`) y ve **su** vista; la tabla y sus acciones se comportan como en la Ola 3.
  - `/ADC/RequestsReview`, `/EMG/RequestsReview`, `/FAC/RequestsReview`, `/LDC/RequestsReview`, `/MRC/RequestsReview`, `/SEC/RequestsReview` redirigen a `/RequestsReview` conservando la query.
  - `/FAC/RequestsReview/[group]` y `/SEC/RequestsReview/[group]` redirigen a `/RequestsReview/[group]`; ese destino con ADC, EMG, LDC o MRC da 404 (`notFound()`).
  - `/RequestsReview/abc` (SEC) sigue dando 404 (`notFound()` de la vista).
  - Los botones de "volver a solicitudes" de `Documentation`, `ReturnRequest`, `Recomendation`, `Cover` y `PropertyVerification` llevan a `/RequestsReview` y no a una URL con perfil (`grep -rn "RequestsReview" src --include=*.jsx --include=*.js --exclude-dir=__tests__` no debe encontrar rutas con perfil).

### 7.4 Sub-olas 6b y 6c — `Documentation` y evaluación

| Sub-ola | Moves                                                                                                                                                                                                                  | `mapRoutePages`                                                                                                                                      | Redirecciones   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 6b      | `app/{ADC,EMG,LDC,MRC}/Documentation/[group]/page.jsx` → `app/Documentation/[group]/_views/{ADC,EMG,LDC,MRC}.jsx`; `EMG/Documentation/components/LegalRepresentatives.jsx` junto a la vista de EMG                     | `GO_TO_CHECKLIST_PAGE(idGroup)` → `/Documentation/${idGroup}`                                                                                        | regla 3         |
| 6c      | `app/{ADC,LDC}/{ApplicationEvaluation,Recomendation,ReturnRequest}/[group]/page.jsx` → `app/<Pantalla>/[group]/_views/{ADC,LDC}.jsx`; `Recomendation/components/ItemRecomendation.jsx` de cada perfil junto a su vista | `GO_TO_APPLICATION_EVALUATION_PAGE(_path, idGroup)`, `GO_TO_RECOMENDATION_PAGE(_path, idGroup)`, `GO_TO_RETURN_REQUEST_PAGE(_path, idGroup, origin)` | reglas 4, 5 y 6 |

- **URLs armadas a mano que se corrigen aquí** (4.5): `Shared/PropertyVerification/[request]` (`genericUrl` con `user.path` cuando `origin === 'Documentation'` → `/Documentation/${idGroup}`), `LDC/ReturnRequest/[group]` (`/LDC/Documentation/${id}` y `/LDC/${origin}/${id}` → `/Documentation/${id}` y `/${origin}/${id}`, con `origin` ∈ `Documentation`, `ApplicationEvaluation`) y `components/Tables/RowItem.jsx:55` (`/${user.path}/ApplicationEvaluation/${idGroup}`).
- **Acceptance específica:** las 4 vistas de `Documentation` y las 2 de cada pantalla de 6c funcionan como antes; el paso ReturnRequest ↔ Documentation ↔ ApplicationEvaluation de LDC y ADC completo (ida y vuelta) sin salir a una URL con perfil; `/Documentation/1` con SEC o FAC da 404.

### 7.5 Sub-ola 6d — `PCD`

| Antes                               | Después                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `app/EMG/PCD/[request]/page.jsx`    | `app/PCD/[request]/_views/EMG.jsx` (editable)          |
| `app/Shared/PCD/[request]/page.jsx` | `app/PCD/[request]/_views/ReadOnly.jsx` (solo lectura) |

- **Registro:** `{ 3: EMG }` y una vista por defecto `ReadOnly` para los demás perfiles con el permiso `PCD` (ADC, MRC, LDC). Este registro es la única pantalla con `default`; el resto devuelve `notFound()`.
- **`mapRoutePages`:** `GO_TO_PCD_PAGE(_path, idRequest, idGroup)` → `/PCD/${idRequest}?idGroup=${idGroup}`; `services/servCheckList.js:150-151` deja de calcular `path = EMG ? 'EMG' : 'Shared'` (el botón conserva su etiqueta y `enable`, que ya dependen del perfil).
- **Redirección:** regla 7 (`/:profile(EMG|Shared)/PCD/:request`).
- **Cambio de comportamiento a aceptar:** hoy ADC, MRC y LDC, por la coincidencia de subcadena (3.3), pueden abrir `/EMG/PCD/…` y ver la vista editable (aunque la propia página deshabilita los controles cuando `idProfile !== EMG`); con la ruta unificada verán la vista de solo lectura. Es el resultado buscado, pero debe confirmarlo el equipo funcional.
- **Acceptance específica:** EMG edita y guarda; ADC/MRC/LDC ven solo lectura; SEC y FAC dan 404 en `/PCD/1`; `/EMG/PCD/1?idGroup=2` y `/Shared/PCD/1?idGroup=2` redirigen a `/PCD/1?idGroup=2`.

### 7.6 Sub-ola 6e — `Cover`

| Antes                                                | Después                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `app/SEC/Cover/[group]/page.jsx` ("Editar Carátula") | `app/Cover/[group]/_views/SEC.jsx` (editable)                     |
| `app/Shared/Cover/[group]/page.jsx` ("Caratula")     | `app/Cover/[group]/_views/ReadOnly.jsx` (solo lectura, ADC y LDC) |

- **Registro:** `{ 5: SEC }` y `ReadOnly` para ADC y LDC; otros perfiles → `notFound()`.
- **`mapRoutePages`:** `GO_TO_COVER_PAGE(_path, idGroup)` → `/Cover/${idGroup}`. Las llamadas con `'Shared'` de `ApplicationEvaluation` (ADC/LDC) y con `user.path` de `SEC/RequestsReview/[group]` usan la misma función.
- **Redirección:** regla 8 (`/:profile(SEC|Shared)/Cover/:group`).
- **Cambio de comportamiento a aceptar:** igual que en `PCD`, ADC y LDC hoy pueden abrir `/SEC/Cover/…` (edición) por coincidencia de subcadena; con la ruta unificada verán solo lectura.
- **Acceptance específica:** SEC edita (guarda carátula y estudio); ADC/LDC ven lectura desde `ApplicationEvaluation`; MRC, EMG y FAC dan 404 en `/Cover/1`.

### 7.7 Pruebas de la Ola 6

- **Vistas:** cada suite de `src/__tests__/app/<PERFIL>/<Pantalla>/…` se mueve con su vista a `src/__tests__/app/<Pantalla>/_views/<PERFIL>.test.jsx` (con `git mv`); cambia solo el import.
- **Selección por perfil (nueva, por pantalla):** para cada perfil del registro se renderiza `page.jsx` con un usuario de ese perfil y se comprueba que se monta **su** vista (las vistas se sustituyen por dobles); perfil sin vista → `notFound()`; usuario aún no cargado → `Loader`. En `PCD` y `Cover` se prueba además la vista por defecto y el perfil sin permiso.
- **Redirecciones (nueva):** una suite que importa `next.config.js`, lee `redirects()` y comprueba, con la sintaxis de `path-to-regexp` de Next, que cada URL antigua de la tabla 4.4 (con al menos un caso por perfil y con query string) resuelve a su destino; y que ninguna URL nueva figura como origen.
- **Permisos y middleware:** la matriz de caracterización de la Ola 1 se amplía con las rutas compartidas (perfil × ruta → `next`/redirect) y con `notFound` de registro.
- **Cobertura:** ≥ 80% de líneas y ramas por archivo, incluyendo `page.jsx` y `registry.js`.

### 7.8 Cierre de la Ola 6

Tras la última sub-ola (6e, o 6f si se aprueba):

- `mapRoutePages` pierde el parámetro sobrante (`_path`) y se ajustan sus llamadores: **23 archivos** con `user.path` y **23 llamadas** con perfil literal (sección 3.1). Ningún código de aplicación debe seguir usando `user.path` ni pasar `'ADC'`, `'LDC'`, `'MRC'`, `'EMG'`, `'SEC'` ni `'FAC'` a esas funciones (`grep -rnE "mapRoutePages\.\w+\([^)]*'(ADC|LDC|MRC|EMG|SEC|FAC)'" src --exclude-dir=__tests__` vacío).
- `settings.path` deja de leerse (`easyReducer` ya no lo copia a `user.path`); la eliminación completa de `pagesByPerfil` es de la Ola 9.
- Carpetas vacías de perfil en `src/app` eliminadas; comprobación con `find src/app -type d -empty`.

### 7.9 Punto de no retorno, reversión y retirada de redirecciones

- **Reversión de una sub-ola:** `git revert` del PR devuelve las carpetas por perfil y la URL antigua. **Salvedad:** las sesiones iniciadas mientras la sub-ola estuvo desplegada guardan el `menu`/`startPage` nuevos en el JWT (hasta 4 h, sección 3.3) y apuntarían a `/RequestsReview`, que ya no existe. Mitigación: incluir en el revert una redirección inversa temporal, o forzar el cierre de sesión (rotar `NEXTAUTH_SECRET` invalida todos los JWT). Por eso la promoción `dev` → `qa` → producción de cada sub-ola es obligatoria (7.2, paso 7).
- **Retirada de las redirecciones** (regla de 4.4): cuando los registros de acceso no muestren tráfico a la URL antigua durante el periodo acordado (propuesta: 30 días) se pasan a `permanent: true`; se eliminan definitivamente en la Ola 9.
- **Coordinación con backend:** cualquier enlace que el backend devuelva a `/EMG/…`, `/ADC/…` (correos, notificaciones) debe actualizarse; la redirección es red de seguridad, no solución.
- **Puntos de no retorno del plan:** Ola 6 (URLs nuevas en uso, enlaces guardados) y Ola 9 (se borra `src/pages`).

## 8. Olas 7 y 8: API y middleware definitivo

Las dos olas cambian el borde de seguridad de la aplicación. Cada una es un PR con su propia spec y se despliega y valida en `dev` y `qa` antes de promoverse.

### 8.1 Ola 7 — API (`pages/api` → route handlers)

**Las URLs no cambian:** `/api/auth/*` y `/api/genericRequest`. Como en las olas 1:1, en el mismo commit que crea el `route.js` se borra el archivo de `pages/api` (dos definiciones de la misma URL no compilan).

| Archivo actual                                         | Destino                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `src/pages/api/auth/[...nextauth].js`                  | `src/app/api/auth/[...nextauth]/route.js`                          |
| `src/pages/api/genericRequest.js`                      | `src/app/api/genericRequest/route.js`                              |
| `authOptions` (hoy exportado desde `[...nextauth].js`) | `src/helpers/auth/authOptions.js` (nombre y ubicación a confirmar) |

**8.1.1 `authOptions` debe salir del archivo de la ruta.** `genericRequest.js` importa hoy `authOptions` de `./auth/[...nextauth]`. Un `route.js` solo puede exportar métodos HTTP y opciones propias de Next, así que `authOptions` se mueve a un módulo aparte que importan las dos rutas. `jest.config.js` (`coveragePathIgnorePatterns`) y `sonar-project.properties` (`sonar.coverage.exclusions`) tienen hoy la exclusión `src/pages/api/auth/*`: se actualiza la ruta para conservar la situación actual (decisión: mantener la exclusión, o cubrir `authorize`, `jwt` y `session` con pruebas nuevas, que se prefiere pero no es requisito de esta spec).

**8.1.2 `[...nextauth]/route.js`**

```js
import NextAuth from 'next-auth/next';
import { authOptions } from '../../../../helpers/auth/authOptions';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

`next-auth` 4.22 admite este patrón; se verifica en `dev` con login, cierre de sesión y `GET /api/auth/session`. No cambian `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, el nombre de la cookie ni los callbacks: **las sesiones abiertas antes del despliegue siguen siendo válidas** (se comprueba en `dev`).

**8.1.3 `genericRequest/route.js`**

| Pages Router                                       | Route handler                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `export default async function handler(req, res)`  | `export async function POST(request)`                                                                |
| `getServerSession(req, res, authOptions)`          | `getServerSession(authOptions)`                                                                      |
| `req.body?.url`                                    | `(await request.json().catch(() => ({})))?.url`: **sin cuerpo debe seguir respondiendo 400**, no 500 |
| `res.status(x).json(y)`                            | `NextResponse.json(y, { status: x })`                                                                |
| `res.status(result?.status \|\| 200).json(result)` | `NextResponse.json(result, { status: result?.status \|\| 200 })`                                     |
| `res.status(500).json(error?.message)`             | `NextResponse.json(error?.message, { status: 500 })`                                                 |

- `genericFetch` (`src/hooks/useFetch.js`, 66 usos) llama con `POST` y `Content-Type: application/json`, así que solo se define `POST`. **Cambio:** un `GET` o cualquier otro método a `/api/genericRequest` respondía antes por el mismo handler (con 400 por falta de cuerpo) y ahora será `405` automático.
- Las pruebas se mueven a `src/__tests__/app/api/genericRequest/route.test.js`; los dobles pasan de `req`/`res` a un `Request` con `json()`, y las aserciones sobre `res.status`/`res.json` a las de la `Response` devuelta. Las rutas necesitan el entorno `node` (`/** @jest-environment node */`) para disponer de `Response`/`NextResponse`; se confirma con `FixJSDOMEnvironment.js`. Se conservan todos los casos de la suite actual (validación 400, autorización, reenvío, `addToken`, error 500).

**8.1.4 Hallazgo de seguridad previo: falta un `return` tras el 401**

En `genericRequest.js`, cuando no hay sesión el handler ejecuta `res.status(401).json({ message: 'Proceso no autorizado' })` **sin `return`** y sigue: valida el cuerpo, llama a `getTokenAPI()` si `addToken` es `true` y ejecuta `customAxios(url, method, header, data)` contra el backend. Es un defecto ya documentado en la suite (`src/__tests__/pages/api/genericRequest.test.js`, prueba "keeps processing the request after responding 401 (missing return)"). Consecuencias, por lectura del código (no reproducidas en ejecución):

- Una petición **sin sesión** provoca igualmente la llamada al backend configurado (`NEXT_PUBLIC_API_URL`), con el token de la aplicación si envía `addToken: true`; el llamante no recibe el resultado (la respuesta ya se envió), pero el efecto secundario ocurre.
- `/api/*` no pasa por el middleware (el `matcher` no lo cubre), así que este chequeo es la única protección de esa ruta.

| Opción                                                              | Efecto                                                                                                                                                                              |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Corregir antes de la Ola 7, en una spec propia (recomendada)** | Un `return` y la inversión de esa prueba; no se mezcla con la migración y se corrige cuanto antes. Requiere confirmar que ningún cliente legítimo depende del comportamiento actual |
| B. Corregir dentro de la Ola 7                                      | El `route.js` nace ya con `return NextResponse.json(…, { status: 401 })`; mezcla un cambio de seguridad con uno de estructura                                                       |
| C. Portarlo tal cual                                                | Solo si se decide explícitamente; la prueba migrada debe seguir documentando el defecto                                                                                             |

Esto queda **fuera del alcance de esta spec** (no se cambia lógica de negocio); se registra para que el humano decida antes de la Ola 7. Independientemente de la opción, la prueba migrada debe reflejar el comportamiento que exista en ese momento.

**8.1.5 Otras comprobaciones**

- **Proxy sin identidad de usuario.** `genericRequest` reenvía con `Authorization: Bearer` obtenido de `getTokenAPI()` (token de la aplicación); del código revisado no se ve que la identidad o el perfil del usuario viaje en una cabecera. Si es así, el backend autoriza a "la aplicación", no al usuario. Es coherente con la advertencia de la spec (el backend debe autorizar cada llamada) y es un tema **de contrato con backend** (¿reenviar una identidad firmada?), no de esta migración.
- **Permisos del backend.** Si para entonces el backend ya entrega los permisos (sección 3.5), `authorize` usa `result.data.settings` validado (`startPage ∈ screens`, `screens` y `menu` con la forma esperada) y, de forma **transitoria**, `buildSettings(idProfile)` (Ola 1) si el backend no los envía; el respaldo se elimina en la Ola 9.
- **Refresco de permisos.** El callback `jwt` hoy solo carga `user` al iniciar sesión (sección 3.3). Propuesta a acordar con backend: guardar `permissionsAt` y, cuando pase un intervalo (propuesta: 15 min), volver a pedir los permisos; si el backend responde 401/403 se invalida la sesión, y si falla por red se conserva la anterior hasta `maxAge`. El callback solo corre cuando el cliente consulta la sesión (`useSession`, al enfocar la ventana, por defecto), y el middleware lee la cookie sin ejecutarlo, así que un cambio de permisos se verá en la siguiente consulta.
- **Docker y New Relic:** el `CMD` es `node -r newrelic server.js` y `next.config.js` externaliza `newrelic` con `serverComponentsExternalPackages`; se verifica que la imagen `standalone` incluye los route handlers, que `newrelic` carga y que los nombres de transacción de `/api/genericRequest` y `/api/auth/*` siguen apareciendo (App Router puede nombrarlas distinto).

**8.1.6 Comprobaciones de aceptación de la Ola 7**

- [ ] `pnpm run test` con las suites movidas en verde, ≥ 80% por archivo.
- [ ] Login y cierre de sesión con los 6 perfiles; la sesión anterior al despliegue sigue válida.
- [ ] `POST /api/genericRequest` con sesión: mismos códigos y cuerpos que antes (casos de la suite); sin cuerpo → 400; sin sesión → según la opción elegida en 8.1.4.
- [ ] `GET /api/genericRequest` → 405.
- [ ] `find src/pages/api` sin archivos; `pnpm run build` sin conflicto de rutas.
- **Dependencias:** Ola 1 (`buildSettings`). No depende técnicamente de las Olas 2 a 6, pero se ejecuta después para no acumular riesgos.
- **Reversión:** `git revert` del PR; las cookies y el formato del JWT no cambian.

### 8.2 Ola 8 — Middleware definitivo

**Objetivo:** que el control de acceso dependa de la **clave de pantalla** y del permiso `screens` de la sesión, sin `includes` sobre el prefijo de perfil, sin la excepción de EMG y sin editar el `matcher` cada vez que se añade una pantalla.

**8.2.1 Tabla de rutas → pantalla**

Un módulo puro (`src/helpers/permissions/routeScreens.js`, compatible con Edge) con una lista ordenada de `{ patrón anclado, clave }`, sin subcadenas:

| Ruta                                                                                                                                                    | Clave                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                                                                                                                                                     | `Search` (buscador; hoy solo lo abre EMG. **La clave debe estar en el contrato de permisos de 3.5**) |
| `/RequestsReview`, `/RequestsReview/:group`                                                                                                             | `RequestsReview`                                                                                     |
| `/Documentation/:group`                                                                                                                                 | `Documentation`                                                                                      |
| `/ApplicationEvaluation/:group`, `/Recomendation/:group`, `/ReturnRequest/:group`                                                                       | igual que el segmento                                                                                |
| `/PCD/:request`, `/Cover/:group`                                                                                                                        | `PCD`, `Cover`                                                                                       |
| `/Shared/History`, `/Shared/History/:group`                                                                                                             | `History`                                                                                            |
| `/Shared/Tracking`, `/Shared/Model/:group`, `/Shared/GeneralBalance/:request`, `/Shared/StateResults/:request`, `/Shared/PropertyVerification/:request` | `Tracking`, `Model`, `GeneralBalance`, `StateResults`, `PropertyVerification`                        |
| Pantallas exclusivas (`GeneralInformation`, `Solidary`, `BuroValidation`, `ValidateRequest`)                                                            | su nombre, con o sin prefijo de perfil según se resuelva la decisión 1 de 4.6                        |

**8.2.2 Lógica**

1. Sin sesión → `/Login` (igual que hoy).
2. `screen = resolveScreen(pathname)`. Si la ruta **no** está en la tabla, el middleware la deja pasar y Next responde 404 (la ruta no expone nada); si está y `screen ∉ settings.screens` → redirección a `startPage`.
3. No hay excepciones por perfil: EMG llega a `/` porque su `screens` incluye `Search`.
4. **Invariante `startPage ∈ screens`, comprobado al iniciar sesión** (en `authorize`/`buildSettings`) y no en cada petición: si no se cumple, el login falla con un error claro. Sin esto, un `startPage` mal configurado produce un bucle de redirecciones (hoy el mismo riesgo existe para cualquier `startPage` fuera del `path`).

**8.2.3 `matcher`**

Se pasa de la lista de carpetas por perfil a un **matcher negativo**: todas las rutas excepto `Login`, `api`, `_next/static`, `_next/image`, `favicon.ico` y los recursos de `public/` (`fonts`, `icons`, `pictures`, `flags`, `logo_*`, `login_demo.svg`, `loading.gif`). Hoy los recursos estáticos no pasan por el middleware porque el matcher es positivo; con el negativo, **olvidar uno de esos prefijos redirige las imágenes a `/Login`**. Por eso el matcher tiene una prueba propia (8.2.5).

**8.2.4 Qué control va en cada capa**

| Capa                                                                                                 | Qué comprueba                                                | Con qué información                                  |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| **Middleware** (borde)                                                                               | Hay sesión y la pantalla está en `screens`                   | Solo lo que trae el JWT; sin E/S                     |
| **Servidor** (`getServerSession(authOptions)` en route handlers; si se decide, también en el layout) | Sesión válida en cada llamada de API; renovación de permisos | Cookie y callbacks de NextAuth                       |
| **Cliente** (registro por perfil, botones según `idProfile`/`status`)                                | Qué vista y qué acciones se muestran                         | Contexto de usuario. Es experiencia, no seguridad    |
| **Backend**                                                                                          | **Autoriza cada llamada de API**                             | Debe recibir identidad y no fiarse del front (8.1.5) |

**8.2.5 Casos por perfil a comprobar**

Matriz esperada tras la Ola 6 (✓ = pasa; ✗ = redirige a `startPage`). `RequestsReview/[group]` pasa por el permiso `RequestsReview` y el registro devuelve 404 a los perfiles sin vista (ADC, EMG, LDC, MRC).

| Pantalla                                                  | ADC | MRC | EMG | LDC | SEC | FAC |
| --------------------------------------------------------- | --- | --- | --- | --- | --- | --- |
| `/` (`Search`)                                            | ✗   | ✗   | ✓   | ✗   | ✗   | ✗   |
| `RequestsReview`                                          | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| `Documentation`                                           | ✓   | ✓   | ✓   | ✓   | ✗   | ✗   |
| `ApplicationEvaluation`, `Recomendation`, `ReturnRequest` | ✓   | ✗   | ✗   | ✓   | ✗   | ✗   |
| `PCD`                                                     | ✓   | ✓   | ✓   | ✓   | ✗   | ✗   |
| `Cover`                                                   | ✓   | ✗   | ✗   | ✓   | ✓   | ✗   |
| `PropertyVerification`                                    | ✓   | ✓   | ✓   | ✓   | ✗   | ✗   |
| `Model`, `GeneralBalance`, `StateResults`                 | ✓   | ✗   | ✗   | ✓   | ✗   | ✗   |
| `History`, `Tracking`                                     | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| `GeneralInformation`, `Solidary`                          | ✗   | ✗   | ✓   | ✗   | ✗   | ✗   |
| `BuroValidation`, `ValidateRequest`                       | ✗   | ✓   | ✗   | ✗   | ✗   | ✗   |

La tabla sale de 3.2 (carpeta propia + `allowedPages`). Pruebas de la Ola 8:

1. **Matriz completa** (6 perfiles × todas las rutas de la tabla de 8.2.1, más `/Login` y un recurso de `public/`), con sesión y sin ella.
2. **Comparación con el comportamiento anterior:** la matriz de caracterización de la Ola 1 y su ampliación de la Ola 6 se ejecutan también contra el middleware nuevo; **toda diferencia debe estar listada y aprobada**. Diferencias esperadas: desaparece el efecto de subcadena de 3.3 (que ya no tiene efecto tras 6d y 6e, porque esas URLs se unificaron) y desaparece la excepción de EMG.
3. **Cobertura de la tabla de rutas:** una prueba recorre `src/app` en busca de `page.jsx` y exige que cada ruta esté en la tabla; una página nueva sin clave falla la prueba y no llega a producción sin protección.
4. **Contrato:** todas las claves de la tabla existen en los `screens` de al menos un perfil; `startPage ∈ screens` para los 6.
5. **`matcher`:** expresión evaluada contra las rutas de la aplicación (coinciden) y contra `/Login`, `/api/auth/session`, `/_next/static/x.js`, `/fonts/Poppins-Thin.ttf`, `/logo_black.png` (no coinciden).

**8.2.6 Comprobaciones de aceptación de la Ola 8**

- [ ] Todas las pruebas anteriores en verde, ≥ 80% de líneas y ramas por archivo.
- [ ] Login con cada perfil termina en su `startPage`; una URL denegada por perfil regresa a `startPage` sin bucles.
- [ ] Imágenes, fuentes y favicon cargan en `/Login` y en las pantallas (matcher negativo).
- [ ] `grep -rn "includes(path)\|allowedPages\|Profile.EMG" src/middleware.js` vacío.
- [ ] Con sesión caducada se redirige a `/Login` desde cualquier ruta.
- **Dependencias:** Ola 6 (URLs finales, tabla de rutas estable) y Ola 1 (capa de permisos). Con permisos del backend (Ola 7) o con `buildSettings`: la lógica es la misma porque lee `screens`.
- **Reversión:** `git revert` del PR devuelve el middleware de la Ola 1; el JWT conserva la misma forma (`screens` ya estaba desde la Ola 1).

## 9. Ola 9 — Cierre

Última ola y segundo punto de no retorno: desaparece `src/pages`. Solo se ejecuta cuando las Olas 0 a 8 están en producción y estables. No añade funcionalidad: retira lo transitorio.

### 9.1 Requisitos de entrada

- [ ] `find src/pages -type f` solo devuelve `404.jsx`, `500.jsx`, `_app.js` y `_document.js` (todo lo demás ya migró; `pages/api` se fue en la Ola 7).
- [ ] No queda tráfico a rutas que solo existan en `pages/` ni errores de `pages/` en los registros de las últimas semanas.
- [ ] Decisión del backend sobre los permisos (sección 3.5): determina si `pagesByPerfil` se puede borrar (9.2, punto 5).
- [ ] Decisión sobre las redirecciones de la Ola 6 (9.4).

### 9.2 Contenido a borrar o reemplazar

| #   | Qué                                                                                                                                  | Cómo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Comprobación                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/pages/404.jsx` y `src/pages/500.jsx`                                                                                            | Se borran; ya existen `app/not-found.jsx`, `app/error.jsx` y `app/global-error.jsx` (Ola 2). Se borran también sus suites de `src/__tests__/pages` si aún existen                                                                                                                                                                                                                                                                                                                                         | Visitar una URL inexistente y provocar un error de render: se ven las pantallas de `app/`. **La URL `/500` deja de existir** (dará 404); hoy se puede visitar directamente |
| 2   | `src/pages/_app.js` y `src/pages/_document.js`                                                                                       | Se borran; su papel lo cumplen `app/layout.jsx` y `app/Providers.jsx` (Ola 0)                                                                                                                                                                                                                                                                                                                                                                                                                             | `find src/pages` no existe                                                                                                                                                 |
| 3   | El directorio `src/pages`                                                                                                            | `git rm -r` de lo que quede; comprobar que la carpeta desaparece                                                                                                                                                                                                                                                                                                                                                                                                                                          | `test ! -d src/pages`                                                                                                                                                      |
| 4   | Adaptador `src/hooks/useAppRouter.js` y `next/compat/router`                                                                         | Cada consumidor pasa a `next/navigation`: `useRouter` (`push`, `replace`, `back`), `usePathname` (reemplaza `asPath` en `Navbar`), `useParams`/`useSearchParams` (reemplazan `query` en `CoverPreview`). `reload` pasa a `window.location.reload()` escrito de forma explícita en los tres usos (sección 2.3). `push({ pathname })` de `CoverPreview` ya es una cadena. Las suites cambian el mock de `next/compat/router` a `next/navigation` (`sed` mecánico; `createRouter` y `renderPage` se ajustan) | `grep -rn "useAppRouter\|next/compat/router\|next/router" src` vacío                                                                                                       |
| 5   | `pagesByPerfil` (`src/helpers/config/gbConfig.js`), su export en `helpers/config/index.js` y el respaldo `buildSettings` de la Ola 7 | **Solo si el backend ya entrega los permisos.** `authorize` deja de recurrir a `buildSettings`. Si el backend no está listo, se conservan y el cierre se limita a lo demás                                                                                                                                                                                                                                                                                                                                | `grep -rn "pagesByPerfil" src` vacío (o justificado por escrito)                                                                                                           |
| 6   | `settings.path` / `user.path`                                                                                                        | Se elimina la copia de `path` en `easyReducer.js` (`user: { …, path: settings.path }`) y el campo `path` de `EASY_INITIAL_STATE.settings`; `status` y `menu` se mantienen                                                                                                                                                                                                                                                                                                                                 | `grep -rn "\.path\b" src/context src/components src/app` sin usos de perfil                                                                                                |
| 7   | Rama de `next/head` en `PageHead` (Ola 0)                                                                                            | `PageHead` deja de delegar en `next/head` y usa solo la variante de App Router                                                                                                                                                                                                                                                                                                                                                                                                                            | `grep -rn "next/head" src` vacío                                                                                                                                           |
| 8   | Suites en `src/__tests__/pages`                                                                                                      | Ya se movieron a `src/__tests__/app` en cada ola; se borra lo que quede y cualquier `import` a `pages/`                                                                                                                                                                                                                                                                                                                                                                                                   | `test ! -d src/__tests__/pages` y `grep -rln "/pages/" src/__tests__` vacío                                                                                                |

Los subcomponentes que hoy viven junto a las páginas (`components/`, `_views/`) ya están en `src/app` desde las olas anteriores; no hay que moverlos.

### 9.3 Configuración y documentación a actualizar

Estado actual comprobado el 2026-09-29:

| Archivo                                                                                                             | Referencia actual                                                                                                                                              | Cambio                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js`                                                                                                    | `eslint.dirs: ['src/pages', 'src/components', 'src/app', 'src/lib']`                                                                                           | Quitar `src/pages`. Conserva el resto (`src/lib` no existe hoy: se deja a criterio de la spec de la Ola 9 si se limpia o se crea la carpeta)                            |
| `next.config.js`                                                                                                    | `serverComponentsExternalPackages: ['newrelic']` y el hook de webpack de `newrelic/load-externals`                                                             | Se mantienen; se verifica el arranque con `node -r newrelic` (9.5)                                                                                                      |
| `jest.config.js`                                                                                                    | `collectCoverageFrom` incluye `src/pages/**/*`; `coveragePathIgnorePatterns` incluye `/src/pages/_app.js`, `/src/pages/_document.js` y `/src/pages/api/auth/*` | Quitar `src/pages/**/*` y las tres exclusiones de `pages` (las de `src/app` de las Olas 0 y 7 permanecen)                                                               |
| `sonar-project.properties`                                                                                          | `sonar.sources=src/components,src/pages,src/helpers,src/services,src/hooks`; `sonar.coverage.exclusions` con `src/pages/…`                                     | `sonar.sources` sustituye `src/pages` por `src/app` (**hoy `src/app` no figura y debe añadirse desde la Ola 0**, ver 5.1.4); las exclusiones de `pages` se quitan       |
| `tailwind.config.js`                                                                                                | `content` incluye `./src/pages/**/*`                                                                                                                           | Quitar la línea (`./src/app/**/*` ya existe)                                                                                                                            |
| `Dockerfile`, `Jenkinsfile`, `compose.local.yml`, `docker-compose.yml`, `package.json`                              | Sin referencias a `pages`                                                                                                                                      | Sin cambios; se comprueba el tamaño de imagen y el arranque (SPEC 04)                                                                                                   |
| `README.md`                                                                                                         | Línea 199: "La configuración se encuentra en **src/pages/api/auth/[...nextauth].js**"                                                                          | Apuntar a `src/helpers/auth/authOptions.js` y `src/app/api/auth/[...nextauth]/route.js`; añadir el enlace a este documento (paso 12)                                    |
| `docs/src-migration.md`                                                                                             | Describe la carpeta `src/pages` y `pages/api`                                                                                                                  | Añadir una nota de que la estructura vigente está en este documento                                                                                                     |
| `docs/pages-tests.md`, `docs/components-tests-refactor.md`, `docs/testing-review.md`, `specs/03-page-unit-tests.md` | Citan `src/pages` y `src/__tests__/pages`                                                                                                                      | Son registro histórico de sus specs: no se reescriben; se añade una nota al inicio de `docs/pages-tests.md` indicando que las suites ahora están en `src/__tests__/app` |

Cada ola anterior ya actualizó lo que le corresponde (Ola 0: `jest`, `sonar`; Ola 7: rutas de `authOptions`). La Ola 9 solo quita lo que quedó de `pages/`.

### 9.4 Redirecciones de la Ola 6

Las 8 reglas de 4.4 **no se borran por defecto** en la Ola 9:

- Si los registros de acceso no muestran tráfico a las URLs antiguas durante el periodo acordado (propuesta: 30 días) y el equipo lo aprueba, se eliminan de `next.config.js` junto con su prueba.
- Si aún hay tráfico (marcadores, correos, enlaces del backend), se pasan a `permanent: true` y se dejan; su coste es cero y su prueba sigue siendo válida.

### 9.5 Verificación de la Ola 9

- [ ] `pnpm run test`: todas las suites en verde, ≥ 80% de líneas y ramas por archivo, cobertura global no inferior a la de la Ola 8.
- [ ] `pnpm run build`: la salida no lista rutas de Pages Router y no informa de `pages/` ausente; `next lint` sin errores nuevos.
- [ ] `pnpm start` y recorrido de **todas** las URLs finales: las de 6.7 ya migradas, las rutas unificadas de la sección 4 y `/`, `/Login`, `/no-existe`, más un usuario de cada perfil (login → listado → detalle → volver).
- [ ] `docker build` con `compose.local.yml`: tamaño de imagen dentro del criterio de SPEC 04; `node -r newrelic server.js` arranca y `newrelic` registra transacciones (incluidas `/api/genericRequest` y `/api/auth/*`).
- [ ] `grep` de restos: `grep -rniE "src/pages|next/router|next/compat|useAppRouter|pagesByPerfil|next/head" src next.config.js jest.config.js sonar-project.properties tailwind.config.js README.md` sin resultados salvo los justificados (por ejemplo `pagesByPerfil` si el backend aún no entrega permisos).
- [ ] Una sesión iniciada antes del despliegue sigue funcionando o, si no, el usuario vuelve limpiamente a `/Login`.
- **Reversión:** `git revert` del PR restaura `src/pages` y el adaptador. Es viable mientras las olas anteriores sigan en producción; después de retirar las redirecciones y limpiar el JWT antiguo, la reversión total exige revisar sesiones y enlaces como en 7.9.

## 10. Verificación transversal

Lista de comprobaciones que **todo PR de ola** debe pasar y cómo ejecutarlas de forma reproducible. Cada spec de ola las cita en sus criterios de aceptación; esta sección evita repetirlas.

### 10.1 Qué se comprueba en cada ola

| Comprobación                                                                      | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| --------------------------------------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pnpm run test` con cobertura por archivo (10.2)                                  | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| `pnpm run build` sin errores de rutas (10.3)                                      | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| `pnpm start` y recorrido de las URLs de la ola, sin errores de hidratación (10.4) | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| Redirecciones y protección de sesión por `curl` (10.5)                            |     | ✓   |     |     |     |     | ✓   | ✓   | ✓   | ✓   |
| Flujo con un usuario de cada perfil afectado                                      |     | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |
| `docker build` con `compose.local.yml`, tamaño y `newrelic` (10.6)                | ✓   |     | ✓   |     | ✓   |     | ✓   | ✓   |     | ✓   |
| Validación en `dev`/`qa` antes de promover (10.7)                                 | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |

El `docker build` es "periódico" según la spec: obligatorio en las olas que cambian cómo se empaqueta o se sirve la aplicación (0: primer `app/`; 2: primera página en `app/`; 4: el mayor volumen de páginas; 6: URLs nuevas y `redirects()`; 7: route handlers y NextAuth; 9: cierre), y recomendable en el resto.

### 10.2 Pruebas y cobertura por archivo

```bash
pnpm run test          # jest --coverage; escribe coverage/lcov.info y test-report.xml
```

`jest.config.js` **no define `coverageThreshold`**, así que el umbral de 80% de líneas y de ramas por archivo (criterio de SPEC 03) no lo aplica Jest: se comprueba leyendo `coverage/lcov.info` **después de una ejecución completa** (una ejecución parcial da porcentajes falsos por archivo). El script siguiente lista los archivos que no llegan y sale con código 1 si hay alguno; recibe un prefijo opcional para filtrar (`node cobertura.js src/app`). No se añade al repositorio (esta spec solo toca `docs/`, `README.md` y `specs/`); si el equipo lo quiere, será su propia spec.

```js
// cobertura.js — lista los archivos con menos de 80% de líneas o de ramas
const fs = require('fs');
const min = 80;
const prefix = process.argv[2] || 'src/';
const records = fs.readFileSync('coverage/lcov.info', 'utf8').split('end_of_record');
const low = [];
let total = 0;
for (const rec of records) {
   const sf = ((rec.match(/^SF:(.+)$/m) || [])[1] || '').split('\\').join('/');
   if (!sf.startsWith(prefix)) continue;
   total++;
   const n = (key) => Number((rec.match(new RegExp('^' + key + ':(\\d+)$', 'm')) || [])[1] || 0);
   const lines = n('LF') ? (n('LH') / n('LF')) * 100 : 100;
   const branches = n('BRF') ? (n('BRH') / n('BRF')) * 100 : 100;
   if (lines < min || branches < min) low.push(`${sf}  líneas ${lines.toFixed(1)}%  ramas ${branches.toFixed(1)}%`);
}
console.log(`${total} archivos, ${low.length} por debajo de ${min}%`);
low.forEach((l) => console.log(l));
process.exitCode = low.length ? 1 : 0;
```

- **Línea base medida el 2026-09-29** (rama `refactor/all-test`, `pnpm run test` completo, salida 0, 83 s): **189 suites y 2 520 pruebas, todas en verde**; `coverage/lcov.info` cubre 256 archivos y **29 quedan por debajo de 80% de líneas o de ramas**: 12 en `src/components` (p. ej. `MainLayout.jsx`, 50% de ramas), 13 en `src/helpers`, 3 en `src/hooks` y 1 en `src/pages` (`Shared/components/PeriodView.jsx`, 40% de ramas). Esa lista es el punto de comparación: **una ola no puede añadir archivos a ella**.
- **Advertencia ya documentada** (`docs/pages-tests.md`): con el proveedor `v8`, el `lcov.info` de una ejecución completa puede reportar menos ramas que la suite aislada del mismo archivo (`PeriodView.jsx` aparece con 33–40% y 100% aislado; `MainLayout.jsx`, 57% frente a 100%). Si un archivo migrado sale por debajo de 80% solo en la ejecución completa, se confirma ejecutando su suite aislada (`pnpm exec jest <suite> --coverage --collectCoverageFrom=<archivo>`) y se anota como en `docs/pages-tests.md`; no se acepta como excepción sin esa comprobación.
- **Criterio por ola:** los archivos migrados o nuevos (`src/app/**`, `src/hooks/useAppRouter.js`, `src/helpers/permissions*`, `src/helpers/auth/*`) alcanzan ≥ 80% de líneas y ramas; ningún otro archivo empeora respecto de la línea base; el número de suites solo sube o se mantiene por movimiento (los archivos movidos conservan sus casos).
- **Exclusiones vigentes:** `_app.js`, `_document.js` y `api/auth/*` (más `layout.jsx` y `Providers.jsx` desde la Ola 0). Cualquier exclusión nueva se justifica en el PR.

### 10.3 Compilación

```bash
pnpm run build
```

- Sin errores ni advertencias nuevas de rutas: en particular, "conflicting app and page file" indica que se olvidó borrar el archivo de `pages/` en el mismo commit (regla 6.1).
- La tabla de rutas que imprime `next build` debe listar cada URL de la ola con el router esperado (las de `app/` sin la marca de Pages) y las URLs sin cambios en las olas 2 a 5.
- `pnpm run lint` no debe añadir errores. `next.config.js` tiene `eslint.ignoreDuringBuilds: true`, así que el `build` no los detecta.

### 10.4 Arranque y recorrido manual

```bash
pnpm run build && pnpm start        # producción local en http://localhost:3001
```

- Recorrer cada URL de la ola (lista de 6.7, y las de la sección 4 desde la Ola 6) con un usuario del perfil que corresponda; para cada página: carga completa, sin pantalla en blanco, acciones principales funcionan y volver a la pantalla anterior conserva el contexto.
- **Errores de hidratación:** con la consola del navegador abierta durante el recorrido, no deben aparecer errores de React de hidratación. En producción se ven minificados (`Minified React error #418`, `#423`, `#425`); en `pnpm run dev` aparecen como "Hydration failed…". Se revisa también la pestaña Red: sin peticiones 404 a fuentes, imágenes ni `_next/static`.
- **Flujo mínimo por perfil** (login → listado → detalle → acción → volver): ADC, MRC, EMG, LDC, SEC y FAC en las olas que afectan a todos (0, 1, 6, 7, 8, 9); solo el perfil afectado en las olas 3 a 5.
- **Sesión:** iniciar sesión antes del despliegue de la ola y comprobar que sigue válida después (olas 0, 1, 7 y 9).

### 10.5 Redirecciones y protección de sesión, sin credenciales

Con `pnpm start` levantado, un `curl` sin cookie prueba dos cosas sin necesitar usuario: que las URLs protegidas envían a `/Login` (middleware) y que las URLs antiguas de la Ola 6 llegan a su destino (las `redirects()` se aplican **antes** del middleware). Ejemplo para las olas 6 a 9:

```bash
for u in /RequestsReview /Documentation/1 /PCD/1 /Cover/1 /Shared/History /Shared/Tracking; do
  curl -s -o /dev/null -w "%{http_code} $u -> %{redirect_url}\n" "http://localhost:3001$u"
done
# esperado: 307 hacia /Login para cada una

for u in /EMG/RequestsReview /ADC/RequestsReview /FAC/RequestsReview/1 /EMG/PCD/1?idGroup=2 /Shared/Cover/1; do
  curl -s -o /dev/null -w "%{http_code} $u -> %{redirect_url}\n" "http://localhost:3001$u"
done
# esperado (mientras existan las reglas de 4.4): 307 hacia la URL nueva, con la query conservada

curl -s -o /dev/null -w "%{http_code} /Login\n" http://localhost:3001/Login          # 200
curl -s -o /dev/null -w "%{http_code} logo\n"   http://localhost:3001/logo_black.png # 200, sin redirección (Ola 8)
```

Las comprobaciones con sesión (qué ve cada perfil, qué se deniega) las cubre la matriz automatizada de las Olas 1, 6 y 8 (`pnpm run test`) y el recorrido manual de 10.4.

### 10.6 Imagen Docker

Referencias de SPEC 04 (`docs/docker-image.md`): **≤ 420 MB** en la columna `DISK USAGE` de Docker Desktop (417 MB medidos; ~321 MB descomprimidos, que es lo que muestra un daemon clásico como el de Jenkins), con `.next/standalone` en 56,2 MB y `node_modules` de New Relic en 74,9 MB.

```bash
docker compose -f compose.local.yml build
docker images gfb-easycredit-web:pnpm-local            # tamaño ≤ 420 MB
docker compose -f compose.local.yml up -d
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/Login       # 200
docker compose -f compose.local.yml logs easycredit-web                    # sin "Cannot find module"
docker compose -f compose.local.yml down
```

- `compose.local.yml` define `NEW_RELIC_ENABLED: 'false'`, así que el arranque comprueba que `node -r newrelic server.js` **carga el módulo** sin errores, pero no que reporte datos; la transmisión de transacciones se valida en `dev`/`qa`, con el agente activo (10.7).
- Un cambio de tamaño de `.next/standalone` mayor al esperado tras añadir `app/` se anota en el PR; solo bloquea si la imagen supera los 420 MB.
- Si la imagen cambia de tamaño por dependencias nuevas, se revisa `docs/docker-image.md`, que enumera las capas.

### 10.7 Validación en entornos y transmisión

Cada ola sigue el flujo: rama → spec (`/spec` + `/spec-impl`) → PR → **despliegue en `dev`** → validación con el checklist de 10.4 → **`qa`** → promoción. En `dev`/`qa`, además, con `newrelic` activo:

- las transacciones de las URLs migradas siguen apareciendo con nombres comparables (App Router puede nombrarlas distinto); en la Ola 7, `/api/genericRequest` y `/api/auth/*`;
- la tasa de errores no sube respecto de la ola anterior;
- en las olas 6 y 9 se revisa el tráfico a las URLs antiguas para decidir la retirada de redirecciones (9.4).

### 10.8 Registro que debe llevar cada PR de ola

- [ ] Resultado de `pnpm run test` (suites, pruebas) y salida de `node cobertura.js src/app` (y de los demás prefijos tocados).
- [ ] `pnpm run build` correcto, con la tabla de rutas.
- [ ] URLs recorridas, perfiles usados y capturas o notas de los errores de consola (ninguno).
- [ ] `docker images` (tamaño) y resultado del arranque, si la ola lo exige.
- [ ] `git diff --stat`: solo los archivos que la spec de la ola lista.
- [ ] Resultado de la validación en `dev` y `qa`, y de New Relic en las olas indicadas.

## 11. Reversión y orden de trabajo

### 11.1 Flujo de cada ola

Cada ola (y cada sub-ola de la Ola 4 y de la Ola 6) sigue el mismo recorrido y es un PR independiente y revertible:

1. **Spec propia.** `/spec` redacta `specs/NN-<slug>.md` con los archivos exactos, comprobaciones y reversión de la ola, tomados de este documento. Una spec por ola evita que el PR crezca más allá de lo revisable.
2. **Rama.** `/spec-impl NN-<slug>` trabaja en una rama `spec-NN-<slug>` (o en la actual si así se confirma; hoy `AutoCreateBranch: false` pide confirmación).
3. **Implementación por pasos** con revisión del diff en cada paso; sin commits automáticos.
4. **PR** hacia la rama de integración. Según el `Jenkinsfile`, un PR con destino `develop` ejecuta `pnpm run test` y **SonarQube con puerta de calidad bloqueante**, y no construye imagen.
5. **Merge (recomendado: squash).** Un commit por ola deja el revert en un solo `git revert <sha>`; con un merge normal sería `git revert -m 1 <sha>`. Git detecta los renombrados por similitud, así que el historial de los `git mv` sobrevive al squash.
6. **`develop` → despliegue en `dev`.** El push a `develop` construye y publica la imagen y despliega por SSH. Validación con el checklist de 10.4 y de 10.7 (New Relic).
7. **`qa` → despliegue en `stg`.** Se promueve con el mismo procedimiento; validación funcional y de perfiles.
8. **Producción.** Manual, según la guía de despliegue del README (Confluence). Se promueve una ola a la vez, con la ola anterior ya estable.

**Salvedad a confirmar.** El `Jenkinsfile` y el README hablan de las ramas `develop` y `qa`, pero en este clon solo existen `main` y `refactor/all-test` (`git branch -a`). Hay que confirmar la rama base real de los PR de las olas antes de la Ola 0.

**Slugs sugeridos** (numeración la decide el equipo): `wave-0-app-router-base`, `wave-1-permissions-layer`, `wave-2-standalone-pages`, `wave-3-requests-lists`, `wave-4a-fac` … `wave-4f-emg`, `wave-5-shared`, `wave-6a-requests-review` … `wave-6e-cover`, `wave-7-api-routes`, `wave-8-middleware`, `wave-9-closing`. En total **19 PRs** (20 con la sub-ola 6f) más el arreglo opcional de seguridad de 8.1.4.

### 11.2 Orden y dependencias entre olas

```
(arreglo genericRequest, opcional y previo)
Ola 0 ─ Ola 1 ─ Ola 2 ─ Ola 3 ─ Ola 4 (4a → 4b → 4c → 4d → 4e → 4f) ─ Ola 5 ─ Ola 6 (6a → 6b → 6c;  6a → 6d;  6a → 6e;  [6f]) ─ Ola 7 ─ Ola 8 ─ Ola 9
```

| Regla                                                                                                                                                                                   | Motivo                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Un solo PR de migración desplegándose a la vez** por ambiente                                                                                                                         | Si algo falla, la causa es la ola recién desplegada                            |
| **Nunca dos olas abiertas que toquen a la vez** `middleware.js`, `helpers/config/gbConstants.js` (`mapRoutePages`), `gbConfig.js`/`permissions.js`, `next.config.js` o `jest.config.js` | Son puntos compartidos; el conflicto de merge oculta errores de comportamiento |
| Las sub-olas 4a–4f tocan archivos disjuntos: pueden **prepararse en paralelo**, pero **se fusionan y se despliegan en secuencia**                                                       | Cada perfil se valida solo                                                     |
| 6d y 6e son independientes entre sí, pero ambas editan `redirects()`, el `matcher` y `mapRoutePages`: **secuenciales**                                                                  | Conflictos de merge                                                            |
| La Ola 7 puede prepararse antes, pero se despliega tras la 6                                                                                                                            | Evita mezclar riesgos de rutas con los de autenticación                        |
| La Ola 8 exige la Ola 6 terminada                                                                                                                                                       | La tabla de rutas debe reflejar las URLs finales                               |

### 11.3 Reversión por ola

Regla general: **revertir en orden inverso al de fusión.** Una ola no se puede revertir por sí sola si una posterior movió o editó sus mismos archivos (por ejemplo, la Ola 3 tras la 6a); en ese caso primero se revierte la posterior.

| Ola              | Cómo se revierte                                                                                                | Efectos a vigilar                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 0                | `git revert` del PR                                                                                             | Ninguno: no hay páginas en `app/`; se restauran `jest`, `sonar` y las suites con el mock de `next/router`          |
| 1                | `git revert`                                                                                                    | El JWT de las sesiones abiertas tiene `screens` de más; es inocuo                                                  |
| 2–5              | `git revert` del PR (o de la sub-ola)                                                                           | Sin cambios de URL ni de datos. Las suites vuelven a `src/__tests__/pages`                                         |
| 6 (cada sub-ola) | `git revert`, más una **redirección inversa temporal** o el cierre de sesión de todos (rotar `NEXTAUTH_SECRET`) | Las sesiones creadas con la sub-ola desplegada guardan `menu`/`startPage` nuevos en su JWT durante hasta 4 h (7.9) |
| 7                | `git revert`                                                                                                    | Cookies y JWT no cambian; comprobar `signIn`, cierre de sesión y `POST /api/genericRequest`                        |
| 8                | `git revert` (vuelve el middleware de la Ola 1)                                                                 | Mismo JWT, no hay estado que limpiar                                                                               |
| 9                | `git revert` restaura `src/pages`, el adaptador y `pagesByPerfil`                                               | Solo viable mientras el resto de olas siga en producción y no se hayan retirado las redirecciones                  |

**Reversión de la imagen desplegada.** El `Jenkinsfile` etiqueta la imagen únicamente como `dev`, `qa` o `latest` (`IMAGE_SUFFIX ?: 'latest'`): **las etiquetas se sobrescriben en cada construcción y no hay una versión inmutable a la que volver**. Por eso la reversión real es `git revert` + nueva construcción por el pipeline. Recomendaciones (fuera del alcance de esta spec): anotar en el PR el *digest* de la imagen de producción antes de promover cada ola, y estudiar una etiqueta inmutable por commit en una spec de CI/CD.

### 11.4 Puntos de no retorno

**Ola 6, por las URLs nuevas.** Desde el primer despliegue de 6a hay enlaces guardados, correos y sesiones que usan `/RequestsReview`. Revertir devuelve el código, pero no las URLs ya distribuidas. **Lista de "adelante/no adelante" antes de promover a producción cada sub-ola:**

- [ ] Las redirecciones de la sub-ola y su prueba están en verde y comprobadas con `curl` (10.5) en `qa`.
- [ ] Backend informado: los enlaces que devuelve (correos, notificaciones) que apunten a `/<PERFIL>/…` de esa pantalla están identificados y con plan de cambio.
- [ ] Decidida la ventana de despliegue (menor tráfico) y el plan para las sesiones abiertas (duran hasta 4 h).
- [ ] Decididas las cuestiones pendientes de 4.6 que afectan a la sub-ola (URLs de pantallas exclusivas, prefijo `Shared`).
- [ ] Confirmado por el equipo funcional el cambio de comportamiento de `PCD` y `Cover` (7.5 y 7.6).
- [ ] Plan de reversión escrito en la spec de la sub-ola, incluida la redirección inversa.

**Ola 9, por el borrado de `src/pages`.** Va precedida de:

- [ ] Todas las olas anteriores estables en producción durante el periodo acordado.
- [ ] Sin tráfico a URLs que dependan de `pages/` ni errores atribuibles a él.
- [ ] Decisión sobre `pagesByPerfil` (¿el backend ya entrega permisos?) y sobre las redirecciones (9.4).
- [ ] Copia del *digest* de la imagen previa y rama/tag de respaldo (`pre-wave-9`) para poder reconstruir.

**Punto de compromiso con backend (Ola 7).** No es irreversible en código, pero cambiar de fuente de permisos afecta a un sistema ajeno: se acuerda el contrato de 3.5 antes de la spec de la ola.

### 11.5 Decisiones abiertas consolidadas

Recogidas de todo el documento; ninguna la resuelve esta spec.

| #   | Decisión                                                                                                                                                                                                                                                                                       | Quién                  | Antes de                       | Ref.            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------ | --------------- |
| 1   | Rama base de los PR (`develop`/`qa` no aparecen en este clon)                                                                                                                                                                                                                                  | Equipo                 | Ola 0                          | 11.1            |
| 2   | Cabecera de página en App Router: `PageHead` con efecto (recomendada) o `page.jsx` de servidor con `metadata`                                                                                                                                                                                  | Equipo                 | Ola 0                          | 5.1.2           |
| 3   | Verificar que los hooks de `next/navigation` (salvo `useRouter`) no lanzan bajo Pages                                                                                                                                                                                                          | Quien ejecute la Ola 0 | Ola 0                          | 2.4             |
| 4   | Arreglo del `return` faltante tras el 401 de `genericRequest`: spec previa (recomendada), dentro de la Ola 7 o portarlo tal cual                                                                                                                                                               | Equipo / seguridad     | Ola 7 (idealmente ya)          | 8.1.4           |
| 5   | Contrato de permisos con backend (5 preguntas), incluido `idProfile`, la clave `Search` y el refresco                                                                                                                                                                                          | Equipo + backend       | Ola 1 (diseño), Ola 7          | 3.6, 8.2.1      |
| 6   | URL de las pantallas exclusivas (sub-ola 6f: quitar el prefijo de perfil, recomendada)                                                                                                                                                                                                         | Equipo                 | Ola 6                          | 4.6             |
| 7   | Prefijo `Shared`, nombre `RequestsReview`, ubicación `_views/`, `notFound()` para perfil sin vista                                                                                                                                                                                             | Equipo                 | Ola 6                          | 4.6             |
| 8   | Cambio de comportamiento de `PCD` y `Cover` para ADC/MRC/LDC                                                                                                                                                                                                                                   | Equipo funcional       | 6d, 6e                         | 7.5, 7.6        |
| 9   | Periodo sin tráfico para retirar redirecciones (propuesta: 30 días)                                                                                                                                                                                                                            | Equipo                 | Ola 9                          | 4.4, 9.4        |
| 10  | Intervalo de refresco de permisos en el JWT (propuesta: 15 min)                                                                                                                                                                                                                                | Equipo + backend       | Ola 7                          | 8.1.5           |
| 11  | Identidad del usuario hacia el backend en `genericRequest`                                                                                                                                                                                                                                     | Backend                | Ola 7                          | 8.1.5           |
| 12  | Cubrir `authorize`/`jwt`/`session` con pruebas o mantener la exclusión de cobertura                                                                                                                                                                                                            | Equipo                 | Ola 7                          | 8.1.1           |
| 13  | `src/lib` figura en `eslint.dirs` y no existe: limpiar o crear                                                                                                                                                                                                                                 | Equipo                 | Ola 9                          | 9.3             |
| 14  | Etiquetas inmutables de imagen para poder revertir por imagen                                                                                                                                                                                                                                  | Quien mantiene CI/CD   | Antes de la Ola 6              | 11.3            |
| 15  | Corregir la spec: 44 archivos (cuadra con SPEC 03, no con el total), Ola 5 con 11 archivos y no "12 páginas", 29 archivos con `idProfile`/`constProfiles` (26 sin `__mocks__`), `reload` en 3 sitios, `replace`/`back`/`asPath` además de `push`/`query`, 25 `getServerSideProps` no triviales | Autor de la spec       | Cuando se apruebe la ejecución | 1.2, 2.1, 6.2.1 |

### 11.6 Coordinación

- **Backend:** enlaces en correos y notificaciones, contrato de permisos, identidad del usuario en las llamadas.
- **QA/funcional:** lista de URLs (6.7 y sección 4), matriz de perfiles (8.2.5) y los cambios aceptados de comportamiento.
- **Soporte:** aviso de cambio de URLs cuando llegue la Ola 6 (marcadores) y de la ventana de sesión de hasta 4 h.
- **CI/CD:** etiquetas de imagen, tamaño (≤ 420 MB), `newrelic` activo en `dev`/`qa`.
