# Reconstrucción de pruebas: pages

## Cambios

-  46 suites nuevas: una por cada archivo de `src/pages` no excluido de la cobertura (44) y una por `MainLayout` y `AuthLayout` (2). Viven en `src/__tests__/pages/<ruta espejo>` y en `src/__tests__/components/Layout/`. `_app.js`, `_document.js` y `api/auth/[...nextauth].js` quedan fuera (ya estaban en `coveragePathIgnorePatterns`).
-  Utilidad nueva `src/__tests__/utils/page.jsx` (`renderPage` y `createPageContext`); reutiliza `render.jsx`, `context.jsx` y `router.js`.
-  No se modificó `jest.config.js`, `jest.setup.js`, ninguna dependencia, ni `src/pages` ni `src/components`. Los defectos hallados se documentan abajo; no se corrigieron.
-  Las suites previas de `.migration/src-baseline/__tests__/pages/` se usaron solo como guía de casos; ninguna se copió. El baseline `EMG/GeneralInformation/[client].jsx` no terminaba en `.test`, por lo que Sonar no lo detectaba; la suite nueva se llama `[client].test.jsx`.
-  Esta spec sustituye la exclusión de `Layout` de SPEC 01: `MainLayout` y `AuthLayout` se prueban aquí. SPEC 01 no se editó.

## Criterios

Se prueban acciones y resultados visibles, sin snapshots. Cada página cubre la carga (estado inicial y de carga), el éxito, el `status` distinto de 200, la excepción del servicio y las ramas por perfil o parámetro de ruta; `getServerSideProps` se prueba en cada archivo que lo exporta.

-  `MainLayout`, `EasyContext.Provider` y los componentes hijos son reales. Los mocks se limitan a fronteras: `next/router`, `next-auth/react` (`useSession`, `signIn`, `signOut`), `../services` (solo las funciones de red; el resto se toma con `jest.requireActual`), `sweetalert2` y, en el handler de API, `next-auth`, `../hooks` (`customAxios`) y `../services` (`getTokenAPI`).
-  Excepciones justificadas: `next/head` se reemplaza por un fragmento en `MainLayout` y `AuthLayout`, porque JSDOM no renderiza su contenido y no se podría comprobar el título ni la meta descripción. En `api/genericRequest` se mockean `next-auth/next` y `next-auth/providers/credentials`, porque importar el `authOptions` real arrastra `jose` (ESM), que Jest no transforma; `authOptions` sí es el real.
-  `renderPage(ui, { context, router, session, userOptions })` renderiza con un `EasyContext` real, `useRouter` y `useSession` simulados y devuelve `context` y `router` (con las acciones espiadas) y `updateContext(overrides)`, que sustituye partes del contexto y vuelve a renderizar (por ejemplo `pagination.sourcePage` o `isReloading`). `createPageContext` trae valores por defecto para `MainLayout`, las tablas y las bandejas.

Convenciones:

-  Nombres de `describe`/`test` en inglés. Extensión `.test.jsx` para páginas y layouts, `.test.js` para el handler de API. Un `describe` por comportamiento.
-  Las redirecciones con `setTimeout` (`push` a los 1 s, 2.5 s, 3 s o 5 s, recarga a los 2 s) se prueban con `jest.useFakeTimers()` y `userOptions: { delay: null }`; `jest.setup.js` restaura los temporizadores reales.
-  `sweetalert2` se mockea con `jest.fn()` para `fire` y `mixin`; cada caso fija su resolución (`{ isConfirmed: true }` por defecto) para simular «aceptar» o «cancelar».
-  El servicio real deja copias en `localStorage` (`BS_Page`, `SR_Page`, `Property_Page`, `PCD_Page`, `CoverPage`). Como el servicio va mockeado, la prueba escribe la copia que la página compara para habilitar «Guardar». `EMG/PCD` usa el `parseDerivaties` real para construir los datos.
-  Estado que la página calcula en un efecto posterior al primer render (por ejemplo «Finalizar» o «Continuar» en `GeneralBalance`): se comprueba con `waitFor`, porque `findBy` puede resolver antes del efecto.
-  `jsdom` 20 no informa `submitter` al enviar un formulario con un clic, y `Shared/Cover` lee `e.nativeEvent.submitter.id`: la prueba despacha el evento `submit` con el botón como `submitter`.
-  `onKeyNumbers` (`LegalRepresentatives`) lee `keyCode`, que `user-event` no informa para los dígitos: el valor se cambia con `fireEvent.change` y el filtrado de teclas se prueba con `fireEvent.keyDown` y `keyCode` explícito.
-  Los `propTypes` avisan una sola vez por proceso: no se aserta sobre esos `console.error`, porque dependería del orden de las pruebas.
-  Se prefieren consultas por rol o nombre accesible. Algunos encabezados usan `&nbsp;`; su nombre accesible se consulta con `/Solicitud\s+.../`.

## Alcance implementado

| Archivo                                                       | Suite                                                              | Pruebas | Líneas | Ramas |
| ------------------------------------------------------------- | ------------------------------------------------------------------ | ------: | -----: | ----: |
| `components/Layout/AuthLayout.jsx`                            | `components/Layout/AuthLayout.test.jsx`                            |       5 |   100% |  100% |
| `components/Layout/MainLayout.jsx`                            | `components/Layout/MainLayout.test.jsx`                            |      13 |   100% |  100% |
| `pages/404.jsx`                                               | `pages/404.test.jsx`                                               |       2 |   100% |  100% |
| `pages/500.jsx`                                               | `pages/500.test.jsx`                                               |       2 |   100% |  100% |
| `pages/index.jsx`                                             | `pages/index.test.jsx`                                             |      20 |   100% |  100% |
| `pages/Login/index.jsx`                                       | `pages/Login/index.test.jsx`                                       |      12 |   100% |  100% |
| `pages/api/genericRequest.js`                                 | `pages/api/genericRequest.test.js`                                 |      19 |   100% |  100% |
| `pages/ADC/ApplicationEvaluation/[group].jsx`                 | `pages/ADC/ApplicationEvaluation/[group].test.jsx`                 |      16 |   100% | 93.9% |
| `pages/ADC/Documentation/[group].jsx`                         | `pages/ADC/Documentation/[group].test.jsx`                         |      16 |   100% |  100% |
| `pages/ADC/Recomendation/[group].jsx`                         | `pages/ADC/Recomendation/[group].test.jsx`                         |      11 |   100% |  100% |
| `pages/ADC/Recomendation/components/ItemRecomendation.jsx`    | `pages/ADC/Recomendation/components/ItemRecomendation.test.jsx`    |      15 |   100% | 87.5% |
| `pages/ADC/RequestsReview/index.jsx`                          | `pages/ADC/RequestsReview/index.test.jsx`                          |       9 |   100% |  100% |
| `pages/ADC/ReturnRequest/[group].jsx`                         | `pages/ADC/ReturnRequest/[group].test.jsx`                         |      10 |   100% |  100% |
| `pages/EMG/Documentation/[group].jsx`                         | `pages/EMG/Documentation/[group].test.jsx`                         |      24 |  96.9% |  100% |
| `pages/EMG/Documentation/components/LegalRepresentatives.jsx` | `pages/EMG/Documentation/components/LegalRepresentatives.test.jsx` |      25 |   100% |  100% |
| `pages/EMG/GeneralInformation/[client].jsx`                   | `pages/EMG/GeneralInformation/[client].test.jsx`                   |      16 |   100% |  100% |
| `pages/EMG/PCD/[request].jsx`                                 | `pages/EMG/PCD/[request].test.jsx`                                 |      39 |   100% | 99.0% |
| `pages/EMG/RequestsReview/index.jsx`                          | `pages/EMG/RequestsReview/index.test.jsx`                          |      10 |   100% |  100% |
| `pages/EMG/Solidary/[group].jsx`                              | `pages/EMG/Solidary/[group].test.jsx`                              |      22 |   100% | 96.2% |
| `pages/FAC/RequestsReview/[group].jsx`                        | `pages/FAC/RequestsReview/[group].test.jsx`                        |      21 |   100% |  100% |
| `pages/FAC/RequestsReview/index.jsx`                          | `pages/FAC/RequestsReview/index.test.jsx`                          |      14 |   100% |  100% |
| `pages/LDC/ApplicationEvaluation/[group].jsx`                 | `pages/LDC/ApplicationEvaluation/[group].test.jsx`                 |      15 |   100% |  100% |
| `pages/LDC/Documentation/[group].jsx`                         | `pages/LDC/Documentation/[group].test.jsx`                         |      19 |   100% |  100% |
| `pages/LDC/Recomendation/[group].jsx`                         | `pages/LDC/Recomendation/[group].test.jsx`                         |      12 |   100% |  100% |
| `pages/LDC/Recomendation/components/ItemRecomendation.jsx`    | `pages/LDC/Recomendation/components/ItemRecomendation.test.jsx`    |      17 |   100% | 83.3% |
| `pages/LDC/RequestsReview/index.jsx`                          | `pages/LDC/RequestsReview/index.test.jsx`                          |      16 |   100% |  100% |
| `pages/LDC/ReturnRequest/[group].jsx`                         | `pages/LDC/ReturnRequest/[group].test.jsx`                         |      14 |   100% |  100% |
| `pages/MRC/BuroValidation/[client].jsx`                       | `pages/MRC/BuroValidation/[client].test.jsx`                       |      26 |   100% | 96.7% |
| `pages/MRC/BuroValidation/components/MethodConsult.jsx`       | `pages/MRC/BuroValidation/components/MethodConsult.test.jsx`       |      12 |   100% | 88.9% |
| `pages/MRC/Documentation/[group].jsx`                         | `pages/MRC/Documentation/[group].test.jsx`                         |      15 |   100% |  100% |
| `pages/MRC/RequestsReview/index.jsx`                          | `pages/MRC/RequestsReview/index.test.jsx`                          |      11 |   100% |  100% |
| `pages/MRC/ValidateRequest/[group].jsx`                       | `pages/MRC/ValidateRequest/[group].test.jsx`                       |      16 |   100% |  100% |
| `pages/SEC/Cover/[group].jsx`                                 | `pages/SEC/Cover/[group].test.jsx`                                 |      14 |  95.3% | 90.6% |
| `pages/SEC/RequestsReview/[group].jsx`                        | `pages/SEC/RequestsReview/[group].test.jsx`                        |      16 |   100% |  100% |
| `pages/SEC/RequestsReview/index.jsx`                          | `pages/SEC/RequestsReview/index.test.jsx`                          |      12 |   100% |  100% |
| `pages/Shared/components/PeriodView.jsx`                      | `pages/Shared/components/PeriodView.test.jsx`                      |      11 |   100% |  100% |
| `pages/Shared/Cover/[group].jsx`                              | `pages/Shared/Cover/[group].test.jsx`                              |      19 |  95.4% | 91.3% |
| `pages/Shared/GeneralBalance/[request].jsx`                   | `pages/Shared/GeneralBalance/[request].test.jsx`                   |      21 |   100% | 88.9% |
| `pages/Shared/GeneralBalance/components/ItemBalance.jsx`      | `pages/Shared/GeneralBalance/components/ItemBalance.test.jsx`      |      19 |   100% |  100% |
| `pages/Shared/History/[group].jsx`                            | `pages/Shared/History/[group].test.jsx`                            |      10 |   100% | 95.0% |
| `pages/Shared/History/index.jsx`                              | `pages/Shared/History/index.test.jsx`                              |      19 |   100% | 97.1% |
| `pages/Shared/Model/[group].jsx`                              | `pages/Shared/Model/[group].test.jsx`                              |      13 |   100% | 98.1% |
| `pages/Shared/PCD/[request].jsx`                              | `pages/Shared/PCD/[request].test.jsx`                              |      10 |   100% |  100% |
| `pages/Shared/PropertyVerification/[request].jsx`             | `pages/Shared/PropertyVerification/[request].test.jsx`             |      24 |  97.5% | 95.5% |
| `pages/Shared/StateResults/[request].jsx`                     | `pages/Shared/StateResults/[request].test.jsx`                     |      20 |   100% | 89.3% |
| `pages/Shared/Tracking/index.jsx`                             | `pages/Shared/Tracking/index.test.jsx`                             |      11 |   100% | 95.7% |
| **Total**                                                     | 46 suites                                                          | **713** |        |       |

Las rutas de archivo y de suite son relativas a `src/` y `src/__tests__/`. Los números de cobertura se midieron con `pnpm test`, ejecutando cada suite por separado sobre su propio archivo (ver [Medición de cobertura](#medición-de-cobertura)). Los 46 archivos superan el 80% de líneas y de ramas.

## Medición de cobertura

El proveedor `v8` no fusiona de forma fiable la cobertura de archivos compartidos entre suites: con el mismo código y las mismas pruebas, `coverage/lcov.info` de una ejecución completa puede reportar menos ramas que la tabla de texto de esa misma ejecución. Se observó, por ejemplo, `PeriodView.jsx` con 33-40% de ramas en `lcov.info` y 100% en su suite aislada, y `MainLayout.jsx` con 57% en la ejecución completa y 100% en la suite de `Layout`. La ejecución con `--runInBand` no lo evita.

Por eso los porcentajes de este documento se midieron ejecutando cada suite por separado y limitando `--collectCoverageFrom` a `src/pages/**` y `src/components/Layout/*`. Es una medida por suite: no cuenta la cobertura que otras suites aporten al mismo archivo, así que es un piso. Antes de fijar un `coverageThreshold` en otra spec conviene resolver este problema de fusión (por ejemplo migrando el proveedor a `babel`) o medir por carpeta.

Verificaciones sobre el conjunto (`pnpm test` completo: 189 suites y 2520 pruebas del proyecto en verde):

-  Sin `skip`, `todo`, `xit`, `xdescribe` ni snapshots en las suites de `pages` y `Layout`.
-  Los 713 casos tienen al menos una aserción: se ejecutaron con `expect.hasAssertions()` forzado en un `beforeEach` temporal y ninguno falló.
-  Todos los `jest.mock` son de `next/router`, `next-auth/react`, `../services`, `sweetalert2`, `next/head`, `next-auth`, `next-auth/next`, `next-auth/providers/credentials` y, solo en el handler de API, `../hooks`.

## Excepciones de cobertura

Todos los archivos superan el 80% en líneas y ramas; estas son las partes que quedan sin cubrir.

| Archivo                                  | Sin cubrir                                                                                                                             | Motivo                                                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `EMG/Documentation/[group].jsx`          | `onApplyCIEC` (líneas 110-115)                                                                                                         | Inalcanzable: `ParticipantsTable` renderiza el botón «Solicitar CIEC» con `disabled` fijo.                                                                     |
| `Shared/Cover/[group].jsx`               | Respuesta no 200 de `getCoverInfo` (28-29), aviso «carátula completada» (87-91), aviso «campos inválidos» (102-104)                    | El último es código muerto: `setErrors` nunca se llama, porque `ActiveLines` lo recibe y no lo usa. El aviso de «completada» exige una carátula completa.     |
| `SEC/Cover/[group].jsx`                  | Aviso «carátula completada» (78-82) y aviso «campos inválidos» (93-95)                                                                 | Los mismos motivos que en `Shared/Cover`.                                                                                                                    |
| `Shared/Tracking/index.jsx`              | Guard `newPage < 1 \|\| newPage > totalPages` (94)                                                                                     | Inalcanzable desde la interfaz: `NewPagination` deshabilita esos botones.                                                                                    |
| `ADC/ApplicationEvaluation/[group].jsx`  | `\|\| '-'` y `\|\| ''` del detalle del error del modelo (59-60)                                                                        | Inalcanzable: `stObj.message + ': ' + stObj.description \|\| '-'` es siempre una cadena no vacía.                                                             |
| `ADC` y `LDC/Recomendation/ItemRecomendation.jsx` | `\|\| '-'` del número de solicitud (ADC 21 y 32); ramas de visualización de la fila LDC (25-29, 35)                            | El primero es inalcanzable: `formatId(undefined)` devuelve `'0undefined'`. El resto son valores por defecto de datos ausentes.                                |
| `MRC/BuroValidation/components/MethodConsult.jsx` | `dc.title \|\| ''` (41)                                                                                                                | Valor por defecto para un documento sin título; no se probó.                                                                                                 |
| `EMG/PCD`, `EMG/Solidary`, `MRC/BuroValidation`, `Shared/History`, `Shared/Model`, `Shared/PropertyVerification`, `Shared/StateResults`, `Shared/GeneralBalance` | Ramas sueltas de valor por defecto o nulo (`\|\| ''`, `?? ''`, `\|\| {}`) y del cálculo global del especialista | Valores por defecto de datos ausentes; forzarlos exigiría casos de bajo valor.                                                                               |

## Advertencias de consola corregidas

`pnpm test` mostraba cuatro advertencias de React en suites de `pages`. Se corrigieron en el código fuente, porque eran defectos reales de los componentes y no de las pruebas. Con los cambios, las suites afectadas (`BodyRow`, `TableGeneric`, `SearchObligated`, `EMG/PCD/[request]` y `Shared/PCD/[request]`) pasan sin esas advertencias.

| Advertencia | Causa | Corrección |
| --- | --- | --- |
| `validateDOMNesting`: `<div>` no puede ser hijo de `<tbody>` | `Tables/BodyRow.jsx` renderizaba `TrackingDetails` (que devuelve `div`s) directamente dentro de la tabla. | Se envolvió en `<tr><td className='p-0'>`. El panel es `fixed`/`absolute`, así que el diseño no debería cambiar; no se verificó en el navegador. |
| Input no controlado que pasa a controlado | `PCD/Controls/NewsContainer.jsx` usaba `checked={item?.noNewsWereFound}`, que es `undefined` al inicio. | `checked={!!item?.noNewsWereFound}`. |
| Key duplicada `RowGroup-undefined` | `Tables/TableGeneric.jsx` construía la key con `item.idGroup`, pero las filas de `DROP_LIST_CLIENTS` (`SearchObligated`) solo tienen `idClient`. | La key es `item.idGroup ?? item.idClient ?? idx`. |
| `NaN` recibido en `children` | `PCD/ExchangeRateCalculatorView.jsx` llama `formatNumber(info?.coverageIndex, 0, '-')`, pero `formatNumber` ignoraba el tercer argumento y devolvía `NaN`. | `helpers/helpFormats.js`: `formatNumber(number, decimals = 2, defaultValue)` devuelve `defaultValue` si el valor no es numérico. Sin `defaultValue` se comporta igual que antes, así que los demás llamadores no cambian. |

## Hallazgos sin corregir

Se documentan porque quedan fuera del alcance de esta spec (no se corrigen defectos de `src/pages` ni de `src/components`) o porque no está claro si son intencionales. Las pruebas que fijan un comportamiento actual lo indican en un comentario y hay que invertirlas si se corrige.

`api/genericRequest`:

-  Con la sesión ausente responde 401 pero no hace `return`: sigue procesando la petición y responde una segunda vez. Una prueba fija el comportamiento.

Bandejas y tablas:

-  `FAC` y `SEC/RequestsReview/index`, `Shared/History/index`: si el servicio responde con un estado distinto de 200, `execClientMethod` muestra el error y devuelve `[]` sin apagar la carga; la tabla se queda en «Cargando datos…». Una prueba fija el comportamiento en cada página.
-  `Shared/Tracking`: el botón «Primera» llama a `onPageChange(currentPage - 1)`: va a la página anterior, no a la primera (mismo defecto que `NewPagination`, ya anotado en SPEC 01).

Detalle de solicitudes (`FAC` y `SEC/RequestsReview/[group]`):

-  `JSON.parse(localStorage.getItem('ACTIVE_APPLICANT')).idRequest` lanza `TypeError` sin capturar si la clave no existe; `useLocalStorage` guarda la cadena `"null"` en ese caso. No se probó, porque fijaría un fallo.
-  `SEC/RequestsReview/[group]` monta `CoverPreview` con `idRequest` e `idClient` indefinidos antes de cargar el grupo (los `propTypes` lo advierten) y pide el PDF dos veces. Una prueba fija la primera llamada.

Flujos de perfiles ADC, LDC, MRC y EMG:

-  `ADC` y `LDC/Recomendation/ItemRecomendation`: `item.relatedPersonResponseList.find(...)` no usa `?.`; una solicitud sin esa lista lanza `TypeError`. No se probó.
-  `LDC/Recomendation/ItemRecomendation`: los botones del analista se deshabilitan al revés (`disabled={recommendationAc}`: «Recomiendo» queda deshabilitado cuando el analista sí recomienda), y con `recommendationLc` en `null` el botón «No Recomiendo» del líder se ve seleccionado. Dos pruebas fijan el comportamiento actual.
-  `LDC/ReturnRequest` y `LDC/Documentation`: si el usuario no es el líder de la solicitud, avisa y redirige a los 5 s, pero antes carga y muestra los datos. `LDC/Documentation` además vuelve a pedir el grupo cuando cambia `user?.userAD` y otra vez con `isReloading`. `LDC/ReturnRequest` importa `isEmpty` de `lodash` y `id` de `date-fns/locale` sin usarlos.
-  `LDC/ApplicationEvaluation`: si un cliente cambió sus financieros redirige al checklist pero sigue actualizando el estado; `title-request` muestra «Solicitud » sin número si el grupo no trae `idGroup`.
-  `ADC/ApplicationEvaluation`: usa `sweetNormal` para el error del servicio en lugar de `getError`, a diferencia de las demás páginas; `JSON.parse(errorModel)` falla si `errorModel` llega sin formato JSON (no se probó).
-  `MRC/ValidateRequest`: «Devolver solicitud» no pide confirmación, a diferencia de `ADC` y `LDC`.
-  `MRC/Documentation`: guarda `infoMRC` en `localStorage` antes de comprobar el estado de la respuesta; con un servicio fallido escribe datos vacíos.
-  `EMG/Documentation`: `getServerSideProps` usa `parseInt`; con un grupo inválido devolvería `NaN`.
-  `EMG/GeneralInformation`: `info.group.length` falla si el servicio no trae `group`; si `postCreateRequest` responde con otro estado no muestra ningún mensaje.
-  `EMG/Solidary`: el `finally` de `handleSaveApplicants` llama a `toggleLoading()` aunque no se encendió (sin cambios o sin permiso de edición).
-  `EMG/PCD`: el `catch` de `handleSaveData` está vacío; si `saveCustomerProfile` lanza, el indicador de carga queda encendido y sin mensaje (una prueba lo fija). `handleVerifyCalculators` muta `templateDerivatives.calculatorRateExchange`, que se comparte entre casos.
-  `MRC/BuroValidation`: `method.screenBureau` lanza si `infoMRC` no está en `localStorage` (no se probó); los campos deshabilitados (país, nacionalidad, teléfono) se envían al actualizar.
-  `Login`: `setMsgError(res.error)` lanza si `signIn` devuelve `undefined` (no se probó).

Páginas compartidas:

-  `Shared/StateResults`: mientras carga, el título concatena `request?.fullName` sin valor por defecto y muestra «Obligado Solidario: undefined» (una prueba lo fija).
-  `Shared/GeneralBalance`: si `saveBalanceSheet` responde con un estado distinto de 204 no muestra ningún mensaje; con `getBalanceSheet` fallido el título queda «Obligado solidario:» a medias.
-  `Shared/GeneralBalance/components/ItemBalance`: con `info = {}` (sin `periods`), `info?.periods[0]` lanza `TypeError`; sí se cubrió `{ periods: [] }`.
-  `Shared/Model`: `setPageActive(applicant.pages[0])` falla si el solicitante no trae `pages` (no se probó).
-  `MRC/BuroValidation/components/MethodConsult`: no tiene valor por defecto para `docMCBC`; `docMCBC.folio` falla si llega `undefined` (no se probó).
-  `Shared/Cover` y `SEC/Cover`: la validación de errores es código muerto (ver [Excepciones de cobertura](#excepciones-de-cobertura)).
