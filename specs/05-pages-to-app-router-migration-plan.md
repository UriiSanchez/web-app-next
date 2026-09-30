# SPEC 05 — Plan de migración gradual de Pages Router a App Router

> **Status:** Aprobado  
> **Depends on:** SPEC 03 (las suites de `src/__tests__/pages` son la red de seguridad de cada ola)  
> **Date:** 2026-09-29  
> **Objective:** Producir `docs/routes-migration.md`, un plan por olas para migrar `src/pages` a `src/app` (App Router de Next 14.2) sin romper URLs ni la aplicación en ningún commit, que además defina cómo unificar las pantallas repetidas entre perfiles (ruta compartida, componentes por perfil) y cómo evolucionar el perfilamiento hacia permisos entregados por el backend.

## Por qué existe esta spec

El proyecto usa Pages Router (`src/pages`, 44 archivos entre páginas, subcomponentes y handlers) sobre Next 14.2.28. "Routes" se interpreta como App Router (`src/app`), decisión del usuario. Next permite que `pages/` y `app/` convivan, siempre que no definan la misma ruta, así que la migración puede ser gradual. El coste real no está en mover archivos, sino en estos hallazgos del código actual.

**Migración de router:**

- **`next/router` en 43 archivos** (páginas y componentes compartidos como `Navbar`, `RowItem`, `CancelRequestButton`). En `app/` ese hook lanza error; hay que usar `next/navigation`. Los componentes de `src/components` los usan páginas de ambos routers durante la convivencia, por lo que necesitan un adaptador (p. ej. `next/compat/router`, que devuelve `null` bajo App Router) y no un reemplazo directo.
- **Uso de `router` acotado:** `push` en ~22 llamadas, `query` en 1, `reload` en 1. `router.reload` no tiene equivalente exacto (`router.refresh` no recarga el cliente).
- **`getServerSideProps` en 25 páginas**, todas con el mismo patrón trivial: leen `params` y devuelven `idGroup`/`idClient`/`idRequest` (algunas con `parseInt`). En App Router el `params` llega como prop de la página.
- **`_app.js`** monta `SessionProvider` y `EasyProvider` e importa `material-symbols` y `globals.css`; `_document.js` es el `Html` por defecto. Ambos se reemplazan por `app/layout.jsx` más un componente cliente de providers.
- **`pages/404.jsx` y `pages/500.jsx`** no equivalen 1:1 a `not-found.jsx` / `error.jsx`.
- **Los archivos bajo `pages/**/components/`** hoy son rutas públicas por accidente (p. ej. `/ADC/Recomendation/components/ItemRecomendation`); en `app/` solo `page.jsx` es enrutable.
- **Las URLs distinguen mayúsculas** (`/ADC/RequestsReview`, `/Shared/History/[group]`). Las carpetas de `app/` deben conservar exactamente los mismos nombres, sobre todo porque Windows (desarrollo) no distingue mayúsculas y la imagen Linux sí.

**Perfilamiento actual (acoplado a la URL y al front):**

- `pagesByPerfil` (`src/helpers/config/gbConfig.js`) define por perfil `path`, `allowedPages`, `startPage`, `status` y `menu`, y se inyecta en la sesión en `authorize` (`[...nextauth].js`). El control de acceso depende de que el perfil sea el prefijo de la URL.
- `middleware.js` decide con `nextUrl.includes(path)` e `includes(page)` (coincidencia por subcadena), con un `matcher` por carpeta de perfil; EMG tiene una excepción propia. Añadir o cambiar un perfil implica tocar carpetas, `pagesByPerfil` y el `matcher`.
- `mapRoutePages` (`gbConstants.js`) centraliza las URLs, pero varias reciben `path` (el perfil) como parámetro: `GO_TO_REQUESTS_PAGE`, `GO_TO_CHECKLIST_PAGE`, `GO_TO_PCD_PAGE`, `GO_TO_RETURN_REQUEST_PAGE`, `GO_TO_APPLICATION_EVALUATION_PAGE`, `GO_TO_COVER_PAGE`, `GO_TO_RECOMENDATION_PAGE`. Es un único punto de cambio, lo que abarata cualquier rediseño de rutas.
- Decisión del usuario: la aplicación deja de decidir qué pantallas y permisos tiene el usuario; lo hará el backend.

**Pantallas repetidas entre perfiles (medido comparando archivos con `diff`):**

| Pantalla                                                  | Perfiles donde existe        | Parecido del código                                                                           |
| --------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| `RequestsReview` (índice)                                 | ADC, EMG, FAC, LDC, MRC, SEC | EMG y MRC casi iguales a ADC (24 y 37 líneas distintas de 56); FAC y SEC bastante distintas   |
| `RequestsReview/[group]`                                  | FAC, SEC                     | Distintas (183 líneas de diferencia)                                                          |
| `Documentation/[group]`                                   | ADC, EMG, LDC, MRC           | Distintas entre sí (121–174 líneas)                                                           |
| `ApplicationEvaluation`, `Recomendation`, `ReturnRequest` | ADC, LDC                     | Misma estructura, lógica distinta (p. ej. `ApplicationEvaluation`: 130 de 191 líneas cambian) |
| `PCD/[request]`                                           | `EMG` y `Shared`             | Muy distintas (416 líneas)                                                                    |
| `Cover/[group]`                                           | `SEC` y `Shared`             | Distintas (210 líneas)                                                                        |

Conclusión del análisis: **la pantalla se repite, el código no**. Por eso la unificación es de **ruta**, no de código: una URL compartida que elige el componente según el perfil. Fusionar componentes queda fuera. Pantallas exclusivas de un perfil (`EMG/GeneralInformation`, `EMG/Solidary`, `MRC/BuroValidation`, `MRC/ValidateRequest`) no se duplican y se tratan como pantallas propias controladas por permiso.

## Alcance

**Dentro:**

- Redactar `docs/routes-migration.md` con: inventario completo de `src/pages` (ruta actual → ruta destino en `src/app`), estrategia de convivencia, adaptador de router, patrón de conversión de página, olas con su lista exacta de archivos, criterio de "hecho" por ola, reglas de pruebas y plan de reversión.
- Incluir en el documento una sección **"Perfilamiento: mantener o evolucionar"** con la evaluación de opciones y la recomendación (ver Decisiones), y una sección **"Reutilización de pantallas entre perfiles"** con:
  - inventario de pantallas repetidas (tabla anterior, revalidada), su ruta compartida propuesta y sus componentes por perfil;
  - el mecanismo de selección del componente por perfil (registro `pantalla → perfil → componente`, con carga diferida) y dónde viven los componentes por perfil (ubicación a confirmar en la Ola 6);
  - el cambio de URLs: `/EMG/RequestsReview` y equivalentes pasan a `/RequestsReview` (el usuario escribió `/Request`; el nombre real de la carpeta actual es `RequestsReview` y se conserva, salvo que se decida otro);
  - la tabla de redirecciones de las URLs antiguas a las nuevas (`redirects()` en `next.config.js`), que mantiene funcionando marcadores, correos y enlaces del backend;
  - el efecto sobre `mapRoutePages` (los parámetros `path` desaparecen de las rutas unificadas).
- Definir el **contrato de permisos** que la aplicación necesita del backend: qué campos de `pagesByPerfil` se mueven al backend (`allowedPages`, `startPage`, `status`, `menu`, `path`), formato propuesto de la lista de pantallas permitidas por clave de ruta (no por prefijo de URL), momento en que se obtiene (login/JWT) y cómo se refresca. Es una propuesta a acordar con el equipo de backend; esta spec no la implementa.
- Definir las olas de menor a mayor complejidad, cada una como un PR/rama independiente que deja la app funcional:
  - **Ola 0 — Base:** `src/app/layout.jsx`, componente cliente `Providers` (`SessionProvider` + `EasyProvider`), imports globales (`material-symbols`, `globals.css`), adaptador `useRouter` compatible con ambos routers, ajuste de utilidades de prueba (`src/__tests__/utils/router.js`). Sin mover ninguna página.
  - **Ola 1 — Capa de permisos:** abstracción única de acceso (`puede acceder a la pantalla X`, `pantalla de inicio`, `menú`) que lee de `session.user.settings`. Hoy se alimenta con un adaptador sobre `pagesByPerfil`; cuando el backend entregue los permisos solo cambia `authorize`. El middleware pasa a consultar la abstracción sin cambiar el comportamiento ni las URLs.
  - **Ola 2 — Sueltas:** `Login`, `index` (`/`), `404`, `500`.
  - **Ola 3 — Listados:** `RequestsReview/index` de ADC, EMG, FAC, LDC, MRC y SEC (misma URL de hoy).
  - **Ola 4 — Páginas dinámicas por perfil:** `[group]`, `[client]` y `[request]` de ADC, LDC, MRC, EMG, FAC y SEC, con sus subcomponentes `components/`, agrupadas en sub-olas por perfil (misma URL de hoy).
  - **Ola 5 — Shared:** las 12 páginas de `Shared` y `PeriodView`.
  - **Ola 6 — Unificación de rutas:** una sub-ola por pantalla repetida (`RequestsReview`, `Documentation`, `ApplicationEvaluation` + `Recomendation` + `ReturnRequest`, `PCD`, `Cover`): ruta compartida, componentes por perfil, redirección desde las URLs antiguas, actualización de `mapRoutePages`, menús y pruebas.
  - **Ola 7 — API:** `pages/api/auth/[...nextauth].js` y `pages/api/genericRequest.js` a route handlers (`route.js`) conservando las mismas URLs. Aquí se integra el contrato de permisos del backend si ya está disponible.
  - **Ola 8 — Middleware definitivo:** control por clave de pantalla/permiso, sin `includes` sobre el prefijo de perfil ni excepción de EMG; nuevo `matcher`; casos por perfil comparados con el comportamiento previo.
  - **Ola 9 — Cierre:** eliminar `_app.js`, `_document.js`, `src/pages`, el adaptador de router y `pagesByPerfil` (si el backend ya entrega los permisos); ajustar `next.config.js` (`eslint.dirs`), `jest.config.js`, `sonar-project.properties` y documentación.
- Documentar por ola el equivalente de cada API de Pages Router: `getServerSideProps` → prop `params`, `useRouter().query` → `useParams`/`useSearchParams`, `push`/`replace`/`back` → `next/navigation`, `reload` → decisión explícita, `next/head` (si existe) → `metadata`.
- Documentar cómo se prueba cada ola: mover la suite de `src/__tests__/pages/…` a `src/__tests__/app/…`, sustituir el mock de `next/router` por el del adaptador, reemplazar la prueba de `getServerSideProps` por una de `params`, y mantener ≥ 80% de líneas y ramas por archivo (criterio de SPEC 03). En la Ola 6 añadir pruebas de la selección de componente por perfil y de las redirecciones.
- Documentar el plan de reversión: cada ola es un PR revertible con `git revert`; en el mismo commit que crea `app/<ruta>/page.jsx` se borra `pages/<ruta>` (Next no admite ambas).

**Fuera de alcance (specs futuras):**

- Ejecutar cualquier ola: esta spec solo produce el documento; cada ola tendrá su propia spec o rama (`/spec` + `/spec-impl`).
- Implementar el contrato de permisos en el backend o decidir su diseño interno; aquí solo se define lo que el front necesita.
- Fusionar el código de las pantallas repetidas en un solo componente parametrizado: se comparte la ruta, no la implementación.
- Reescribir páginas como Server Components, o dividir vista y datos; las páginas se migran como componentes cliente (`'use client'`).
- Cambiar la lógica de negocio, el diseño, las dependencias o la versión de Next.
- Migrar `next-auth` a Auth.js v5 o cambiar el flujo de login.
- Pruebas E2E nuevas (salvo lo que el plan indique como criterio de las Olas 6 y 8).
- Cambios en `Dockerfile`, `Jenkinsfile` o New Relic (el plan solo debe listar qué verificar en cada ola).

## Modelo de datos

Esta spec no introduce estructuras de datos de aplicación. Añade `docs/routes-migration.md`, que incluye una tabla de inventario con esta forma (una fila por archivo de `src/pages`):

| Ruta pública          | Archivo actual                           | Archivo destino                                                                           | Ola   | `getServerSideProps` | Usa `next/router` | Suite actual                               |
| --------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- | ----- | -------------------- | ----------------- | ------------------------------------------ |
| `/ADC/RequestsReview` | `src/pages/ADC/RequestsReview/index.jsx` | `src/app/ADC/RequestsReview/page.jsx` (Ola 3) → `src/app/RequestsReview/page.jsx` (Ola 6) | 3 → 6 | no                   | sí                | `src/__tests__/pages/ADC/RequestsReview/…` |

El plan debe especificar, sin implementarlos, dos contratos. Los nombres y ubicaciones son propuestas a confirmar en las Olas 0, 1 y 6:

```js
// Adaptador de router (Ola 0): src/hooks/useAppRouter.js
// devuelve { push, replace, back, reload, query, pathname }
// usa next/compat/router si existe (Pages) y next/navigation en caso contrario (App)

// Permisos en sesión (Ola 1; el backend los entrega a partir de la Ola 7)
// session.user.settings = {
//    screens: ['RequestsReview', 'Documentation', 'PCD', ...],  // claves de pantalla, no prefijos de URL
//    startPage: '/RequestsReview',
//    menu: [{ title, redirectTo, isDisable }],
//    status: [4, 22],
// }

// Registro de componentes por perfil (Ola 6)
// profileViews = { RequestsReview: { 1: ADCRequestsReview, 2: MRCRequestsReview, ... } }
```

## Plan de implementación

Cada paso deja el repositorio igual de funcional, porque solo se crea documentación.

1. **Inventario.** Listar los 44 archivos de `src/pages` con ruta pública, ola asignada, uso de `getServerSideProps`, uso de `next/router` (con las llamadas concretas: `push`, `query`, `reload`) y suite existente en `src/__tests__/pages`. Verificar los conteos con `grep`.
2. **Compatibilidad de router.** Para los 43 archivos con `next/router`, clasificar cada uso y qué componente compartido (`src/components`) debe pasar por el adaptador en la Ola 0. Resolver en el documento qué se hace con `router.reload`.
3. **Perfilamiento.** Inventariar todos los puntos donde el perfil decide algo (`pagesByPerfil`, `middleware.js`, `mapRoutePages`, y los 27 archivos fuera de pruebas que usan `idProfile`/`constProfiles`). Redactar la evaluación de opciones y el contrato de permisos, marcando lo que depende del equipo de backend.
4. **Reutilización de pantallas.** Revalidar con `diff` la tabla de pantallas repetidas, definir la ruta compartida de cada una, la ubicación de los componentes por perfil, la tabla de redirecciones y el impacto en `mapRoutePages`, menús y en las pantallas que hoy están duplicadas en `Shared` y en un perfil (`PCD`, `Cover`).
5. **Olas 0 y 1 – Base y permisos.** Especificar `app/layout.jsx`, `Providers`, imports globales, el adaptador y la capa de permisos; `_app.js` y `_document.js` permanecen mientras existan páginas en `pages/`. Verificar que la fuente Poppins y `globals.css` cargan igual en ambos routers.
6. **Olas 2 a 5 – Páginas 1:1.** Para cada ola, tabla de archivos, el patrón de conversión (`params` como prop, `'use client'`, `next/navigation`), mapeo de 404/500 a `not-found.jsx`/`error.jsx`/`global-error.jsx`, y la regla de borrar el archivo de `pages/` en el mismo commit. Las URLs no cambian en estas olas.
7. **Ola 6 – Unificación.** Para cada pantalla repetida: ruta nueva, registro de componentes por perfil, redirecciones y pruebas. Definir el orden (empezar por `RequestsReview`, la de mayor parecido entre perfiles) y el criterio para retirar las redirecciones.
8. **Olas 7 y 8 – API y middleware.** Especificar la conversión a `route.js` (`export { handler as GET, handler as POST }` para NextAuth; `getServerSession(authOptions)` en `genericRequest`) con URLs sin cambio (`/api/auth/*`, `/api/genericRequest`); y el middleware definitivo con casos por perfil. Indicar qué controles se hacen en middleware (borde, con lo que trae el JWT) y cuáles en el layout/servidor, y que el backend debe autorizar cada llamada de API porque el control del front es solo de experiencia.
9. **Ola 9 – Cierre.** Listar el contenido a borrar y la configuración a actualizar (`next.config.js`, `jest.config.js`, `sonar-project.properties`, `docs/`, `README.md`).
10. **Verificación transversal.** Para cada ola: `pnpm run test` con cobertura por archivo, `pnpm run build`, arranque con `pnpm start` y visita manual de las URLs de la ola sin errores de hidratación; de forma periódica, `docker build` con `compose.local.yml` y el tamaño de imagen de SPEC 04.
11. **Reversión y orden de trabajo.** Flujo por ola (rama, spec, PR, validación en `dev`/`qa`, promoción) y puntos de no retorno (Ola 6 por las URLs nuevas y Ola 9).
12. **Enlaces.** Referenciar el documento desde `README.md` y desde `docs/src-migration.md`.

## Criterios de aceptación

- [ ] Existe `docs/routes-migration.md` y está enlazado desde `README.md`.
- [ ] El inventario contiene exactamente los 44 archivos de `src/pages` (más `_app.js` y `_document.js` en su propia sección), cada uno con ola asignada.
- [ ] Ningún archivo de `src/pages` aparece asignado a más de una ola de migración 1:1 ni queda sin ola; las pantallas de la Ola 6 indican su ola de origen y su ola de unificación.
- [ ] Los conteos citados (43 archivos con `next/router`, 25 con `getServerSideProps`, 27 archivos con `idProfile`/`constProfiles` fuera de pruebas) coinciden con un `grep` reproducible que el documento incluye.
- [ ] El documento define el adaptador de router y lista los componentes de `src/components` que lo necesitan.
- [ ] Cada ola tiene: archivos exactos, dependencias con otras olas, comprobaciones de aceptación y forma de revertirla.
- [ ] Cada ola de migración 1:1 incluye la regla de borrar el archivo de `pages/` en el mismo commit que crea el de `app/`, y el documento explica que esto evita el conflicto de rutas.
- [ ] El documento afirma que las URLs no cambian hasta la Ola 6 y lista las URLs públicas (con mayúsculas) para verificarlas.
- [ ] La sección "Perfilamiento: mantener o evolucionar" compara al menos tres opciones, con ventajas, costes, y una recomendación explícita.
- [ ] La sección de reutilización lista cada pantalla repetida con su ruta compartida, sus componentes por perfil, y la redirección de cada URL antigua a la nueva.
- [ ] El documento define el contrato de permisos que se pide al backend (campos, formato, momento de obtención) y marca cuáles piezas de `pagesByPerfil` desaparecen.
- [ ] El documento cubre la conversión de `api/` y el middleware definitivo, con los casos por perfil a comprobar, y advierte que el backend debe autorizar cada llamada.
- [ ] El documento define cómo se migran las pruebas (ruta destino, mock del router, prueba de `params`, umbral de 80%, pruebas de selección por perfil y redirecciones).
- [ ] No se modificó ningún archivo fuera de `docs/`, `README.md` y `specs/`; `git diff --stat` lo confirma y `pnpm run test` no cambia.

## Decisiones tomadas y descartadas

- **"Routes" = App Router (`src/app`), elegida por el usuario:** es el camino oficial de Next y admite convivencia con `pages/`; reorganizar carpetas no cambiaría el router.
- **Entregable = solo documento de plan, elegida por el usuario:** el riesgo se reparte en olas con su propia spec y rama; migrar 44 archivos y la autenticación en una sola implementación no sería revisable.
- **Olas de menor a mayor complejidad, elegida:** el patrón se valida primero en páginas sueltas y el riesgo de sesión/permiso queda para el final, con la mayor red de pruebas.
- **`api/` y `middleware.js` incluidos en el plan, decisión del usuario:** se planifican en sus propias olas.
- **El backend decidirá pantallas y permisos, decisión del usuario:** el front deja de ser la fuente de verdad del perfilamiento.
- **Perfilamiento: evolucionar en fases (recomendada, pendiente de confirmar con el usuario).**
  - *Opción A — Mantener el perfil en la URL dentro de `app/`:* cero riesgo de URLs y migración más corta, pero conserva carpetas duplicadas por perfil, la lógica de prefijo con `includes` en el middleware y los parámetros `path`; añadir o cambiar un perfil sigue exigiendo cambios de código y de `matcher`, lo que contradice el permiso entregado por el backend.
  - *Opción B — Evolucionar por fases (recomendada):* primero desacoplar (capa de permisos, Ola 1), luego migrar 1:1 con las mismas URLs (Olas 2–5) y solo después unificar rutas con redirecciones (Ola 6). Cada paso se valida con las suites existentes y puede revertirse sin mezclar dos cambios de naturaleza distinta (router y URLs).
  - *Opción C — Unificar rutas a la vez que se migra el router:* menos pasos en total, pero se pierde la comparación 1:1 contra las suites actuales y, si algo falla, no se sabe si la causa es el router o el rediseño de rutas.
- **Unificar la ruta, no el código (recomendada):** el análisis con `diff` muestra que las pantallas homónimas difieren mucho entre perfiles; una ruta compartida con componentes por perfil da el beneficio de rutas y permisos sin un componente lleno de condicionales por perfil.
- **Permisos por clave de pantalla en lugar de prefijo de URL:** la URL deja de contener el perfil, así que el control por `includes` ya no aplica; la clave es estable aunque la URL cambie.
- **Redirecciones temporales de las URLs antiguas:** protegen marcadores y enlaces externos durante la transición; se pasan a permanentes cuando se confirme que no hay tráfico a las rutas antiguas.
- **Migrar como componentes cliente (`'use client'`):** las páginas usan hooks, contexto y `next-auth/react`; convertirlas a Server Components no aporta en esta etapa y amplía el riesgo.
- **Adaptador de router en lugar de reemplazo directo:** los componentes compartidos sirven a páginas de ambos routers durante la convivencia. Descartado: reemplazar `next/router` en un solo PR, porque rompería las páginas aún en `pages/`.
- **Borrar la página antigua en el mismo commit:** Next falla si `pages/x` y `app/x` resuelven la misma ruta.

## Riesgos identificados

- **Componentes compartidos con `next/router` bajo `app/`:** lanzan error si la Ola 0 no los cubre; se mitiga con el adaptador y probando en las Olas 2–3 antes de escalar.
- **Diferencias de comportamiento del router:** `router.reload`, la lectura sincrónica de `query`, y la navegación por `push` pueden diferir; se documentan por uso concreto y se cubren con las suites de SPEC 03.
- **`SessionProvider` y `EasyProvider` con dos routers a la vez:** el estado del contexto (que puede persistir en `localStorage`) no se comparte entre navegaciones que cruzan `pages/` y `app/`, porque Next recarga completo al cambiar de router; se valida el flujo login → listado → detalle en cada ola.
- **Contrato de permisos sin definir en el backend:** la Ola 7 depende de él; por eso la Ola 1 se apoya en un adaptador sobre `pagesByPerfil` y el resto del plan no bloquea si el backend se retrasa.
- **Permisos en el JWT:** el middleware corre en el borde y solo ve lo que trae el token; un cambio de permisos del usuario no se refleja hasta renovar la sesión, y una lista grande de pantallas engorda el token. Se documenta la política de refresco y qué se valida en servidor.
- **El control del front no es seguridad:** ocultar o redirigir pantallas es experiencia de usuario; el backend debe autorizar cada llamada, sobre todo cuando el perfil ya no está en la URL.
- **URLs nuevas rompen enlaces externos:** correos, marcadores o enlaces devueltos por el backend a `/EMG/...`; se mitiga con las redirecciones y con la revisión de `mapRoutePages` y de cualquier URL construida a mano.
- **Selección por perfil y tamaño del bundle:** un registro con importaciones estáticas mete todos los perfiles en una página; se documenta la carga diferida (`next/dynamic`) por perfil.
- **Perfiles con pantallas propias:** `EMG/GeneralInformation`, `EMG/Solidary` y las de MRC no se unifican; hay que decidir su URL (con o sin prefijo) y cómo se protegen por permiso.
- **404/500:** `not-found`/`error` de App Router solo aplican a rutas de `app/`; hasta la Ola 9 la app mantiene ambos mecanismos.
- **Mayúsculas en nombres de carpeta:** un error de caso pasa desapercibido en Windows y falla en la imagen Linux; se verifica con la lista de URLs en el `docker build`.
- **Imagen Docker y New Relic:** App Router cambia el trazado de `standalone` y `serverComponentsExternalPackages`; se comprueba el tamaño y la carga de `newrelic` (criterios de SPEC 04) al terminar las Olas 0 y 9.
- **Cobertura:** mover suites puede bajar la cobertura por archivo; el criterio de 80% por archivo se mantiene por ola.

## Qué **no** está en esta spec

- La ejecución de las olas (cada una tendrá su spec).
- El diseño interno del servicio de permisos del backend.
- Fusionar el código de pantallas repetidas en un solo componente.
- Server Components, Server Actions o data fetching en servidor.
- Actualizar Next, React o `next-auth`.
- Cambios de negocio o de diseño.
- Pruebas E2E y cambios en la infraestructura de CI/CD.
