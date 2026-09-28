# Reconstrucción de pruebas: componentes

## Cambios

- `jest.setup.js` utiliza el Storage nativo de JSDOM. Limpia localStorage y sessionStorage antes y después de cada caso; restaura spies y temporizadores al terminar. Define `HTMLElement.prototype.scrollTo` y `window.scrollTo` como `jest.fn()` porque JSDOM no los implementa.
- Se eliminó `global.renderPage` y su envoltura general en `act`.
- Las utilidades de prueba viven en `src/__tests__/utils`:
  - `render.jsx` exporta `renderComponent(ui, { userOptions, ...renderOptions })`: crea una sesión de user-event por render, devuelve `{ user, ...render }` y acepta las opciones normales de Testing Library, incluido `wrapper`. `screen`, `within` y `waitFor` se importan de Testing Library.
  - `context.jsx` exporta `createContextWrapper(value)`, que monta el `EasyContext.Provider` real con el valor indicado, y `createActions(overrides)`, que entrega las acciones del contexto como `jest.fn()`.
  - `router.js` exporta `createRouter(overrides)`, un adaptador explícito del router de Next para las pruebas que lo necesitan (junto con `jest.mock('next/router')`).
- `jest.config.js`: se añadió `'/src/components/SVG/.*[.]jsx'` a `coveragePathIgnorePatterns` y se corrigió el patrón de Skeleton, que pasó de `'/src/components/Skeleton/*.jsx'` a `'/src/components/Skeleton/.*[.]jsx'`. Los patrones son expresiones regulares: en `SVG/*.jsx` el `*` solo aplica a la barra y el `.` admite un único carácter antes de `jsx`, por lo que nunca coincidía con `SVG/IconSpin.jsx` ni con ningún archivo de Skeleton, que seguían apareciendo en el reporte con 0%. No se cambió ninguna otra opción.
- Las pruebas replican la ruta de cada componente: `src/components/<Carpeta>/<Componente>.jsx` → `src/__tests__/components/<Carpeta>/<Componente>.test.jsx`.
- No se modificó ningún archivo de `src/components`.

## Criterios

Se prueban acciones y resultados, sin snapshots ni mocks de componentes hijos. Los componentes que consumen contexto reciben valores mediante `EasyContext.Provider` real; sus acciones son spies para comprobar el contrato. Esto no equivale a probar `EasyProvider`, autenticación o backend completos.

Solo se sustituyen fronteras externas:

- `next/router` (18 suites), `sweetalert2` en `Swal.fire` (21), funciones concretas de `src/services` (21) y `signOut` de `next-auth/react` (1).
- Los helpers de cálculo (`calcRateData`, `calcExchangeData`, `calcCheckCreditor`, `calcIndividualSummary`, `validateAuthorizationForRequest`…) se ejecutan reales. Cuando un módulo de servicios se sustituye completo y una lógica pura vive en él, el mock delega de forma diferida en `jest.requireActual`.

Los eventos usan `await user.*`; las respuestas asíncronas se esperan mediante consultas `findBy` o `waitFor`. `act` se limita al avance explícito de temporizadores simulados. Los componentes controlados se prueban con un `Harness` que conserva el estado y devuelve al componente lo que este notifica; los `next/dynamic` se esperan con `findBy`.

Convenciones:

- Nombres de `describe`/`test` en inglés.
- Consultas por rol o nombre accesible; `data-testid` o clases CSS solo cuando el componente no ofrezca otra opción, y se anota en el propio caso. JSDOM no ejecuta Tailwind ni verifica el aspecto visual, por lo que las comprobaciones de clase se limitan a estados (`disabled`, `mandatory`, `wrong`, colores de resultado).
- Los campos que bloquean el tecleo con `onKeyNumbers` se prueban con `fireEvent.change`, porque `user-event` no reporta `keyCode` (se anota en el caso). Cuando el valor controlado se restaura tras el evento, el spy captura `name` y `value` en el momento de la llamada.
- Los espacios de no separación del texto (`&nbsp;`) se comparan con `\s`.

## Alcance implementado

126 suites de componentes, una por cada `.jsx` de `src/components` fuera de `Skeleton`, `SVG`, `Layout` e `index.js`:

| Carpeta | Suites |
| --- | --- |
| Controls | 22 |
| Tables | 22 |
| PCD | 14 |
| Requests | 13 |
| Model | 10 |
| PropertyVerification | 10 |
| Cover | 6 |
| Filters | 6 |
| History | 6 |
| Solidary | 5 |
| CheckList | 4 |
| UI | 3 |
| GeneralInformation | 2 |
| Modal | 2 |
| SideMenu | 1 |

Además, `src/__tests__/setup/storage.test.js` verifica el contrato del entorno común.

Cada suite cubre la lectura de datos, las acciones del usuario y sus callbacks, los estados deshabilitados o de campos obligatorios, las ramas de error devuelto por servicios y las respuestas fallidas o con excepción.

## Validación

Última ejecución de `pnpm test` (completo, con cobertura v8):

- Código de salida 0.
- **127 suites y 1170 pruebas aprobadas**, 0 omitidas, 0 snapshots.
- Ninguna suite usa `skip`, `todo`, `toMatchSnapshot` ni `toMatchInlineSnapshot`, y ningún caso carece de aserción (revisado con búsqueda sobre `src/__tests__`).
- Cobertura global: 64.73% de líneas. Incluye pages, services, helpers y hooks, cuyas pruebas corresponden a las SPEC 02 y SPEC 03 y aún no se reconstruyen, por lo que no debe compararse con el porcentaje de la suite anterior.
- Todos los archivos de `src/components` cubiertos por esta spec tienen **al menos 80% de líneas** en `coverage/lcov.info`; la gran mayoría llega al 100%.

No se ejecutó Docker ni se actualizaron dependencias. Se conserva FixJSDOMEnvironment para `structuredClone`.

### Excepciones de cobertura

| Archivo | Cobertura | Motivo |
| --- | --- | --- |
| `Layout/AuthLayout.jsx`, `Layout/MainLayout.jsx` | 0% | Layout queda fuera de esta spec por decisión previa; se pospone. |
| `*/index.js` (Filters, Layout, Model, PCD, PropertyVerification, Solidary…) | 0% | Solo reexportan; están excluidos por la spec. |
| `Tracking/ExportTrackingButton.jsx` | 0% | El archivo está vacío (0 bytes): no hay comportamiento que probar ni líneas que cubrir. |

`SideMenu/index.jsx` se prueba en `SideMenu/SideMenu.test.jsx` y no en `SideMenu/index.test.jsx`, para conservar el nombre del componente.

### Medición de cobertura entre procesos

Al fusionar los resultados de v8 de varios workers, un archivo importado por la suite de otro componente puede perder líneas que solo ejecuta su propia suite. Ocurrió con `IndividualLoans.jsx`, cuya rama de historial vacío aparecía sin cubrir (55%) porque `CreditHistoryView` nunca la recorría. Se resolvió añadiendo en `CreditHistoryView.test.jsx` el caso de persona física sin historial. Si vuelve a aparecer una cobertura baja solo en la corrida completa, conviene revisar que la suite del componente padre ejerza las mismas ramas.

## Hallazgos pendientes

Los componentes no se modificaron; estos defectos se documentan sin convertirlos en expectativas de comportamiento correcto.

**Tablas, controles y documentos**

- NewPagination etiqueta como «Primera» una acción que retrocede una página.
- Algunos selectores usan elementos no semánticos para acciones y dependen de CSS para su visibilidad. La validación de teclado y accesibilidad requerirá mejoras en los componentes.
- TabOptionDocuments no incluye idClient entre las dependencias de su efecto y no captura promesas rechazadas.
- DownloadButton usa `'Document.pfd'` como nombre por defecto, por lo que el archivo se descarga como `Document.pfd.pdf`.

**Historial, CheckList, Cover y Solidary**

- `IconVerification` no declara `pendingVerification` en `propTypes`.
- `ParticipantsTable`: el botón `onApplyCIEC` está siempre `disabled`.
- `SearchObligated`: si falla la búsqueda por número, el aviso usa `${search}` y muestra «[object Object]»; las listas de clientes generan claves `RowGroup-undefined` duplicadas.
- `Format`: `checkBase` usa `|| true`, por lo que siempre está marcado.
- `ActiveLines`, `ItemSharedholding` y `SideCover` declaran `prototypes` en lugar de `propTypes`.
- `TermsAndConditions`: `data?.resolutionLinesResponse?.modelAuthorization.amountEm` falla si falta `modelAuthorization`.

**Requests**

- `ApplicantContainer` modifica en el lugar los elementos de `comments` (`item.comment = value`) antes de avisar al padre.
- `AuthorizationButtons` declara `idCatStatus` en `propTypes`, pero la prop real es `idStatusRequest`.
- `ChatComponent` oculta el botón de enviar con la clase `hidden`, sin `disabled`.

**PropertyVerification**

- `IndividualSummary` usa `data.resume` sin `?.` en la segunda fila; con `data` `undefined` falla, y con él `ApplicantsView` y `ObligatedsView`.
- `PropertiesEdit`: el valor por defecto `info = {}` no protege (`info?.properties.filter` falla sin `properties`); la lista incluye `Commercial`, que `optionsBase.propertyType` no tiene, por lo que `PropertiesView` no muestra su etiqueta.
- `OtherOwnersItem` declara `propType` en lugar de `propTypes`.
- `VerificationForm`: `e.preventDefault(e)` recibe un argumento que no usa; si `saveVerification` no devuelve 200 sale sin avisar al usuario.
- `PropertiesView`: `checked={item?.validation}` pasa de no controlado a controlado si `validation` no viene definido.

**Model**

- `CoverageRationalityView`: `data?.rateCalculator.sufficiency` falla con `data` vacío o sin `rateCalculator`.
- `FinancialReasonsView`: con `data` vacío, `info` queda `undefined` y `info?.overallRating[...]` falla.
- `SummaryModelView`: `data?.security['Total actual']` falla si falta `security` y el participante es Solicitante.
- `PaymentCapacityView`: la key usa `value?.replace(...)`, por lo que las cifras deben llegar como cadenas; resalta el botón de alertas con `alertsResume` en lugar de `alertsPayment`, por lo que nunca se resalta; `paymentStages[stage]` falla si falta un escenario; etiqueta «Intereses créditos Aevolventes MN» con errata.
- `ExecuteModel`: si la validación falla sin `error.response.message`, el aviso muestra «undefined»; si una petición lanza excepción, el `catch` solo registra el error y el Loader queda visible; usa `!=` en lugar de `!==`.
- `CreditHistoryView`, `CoverageRationalityView` y `RateExchangeView`: clases sin espacio (`pb-4text-xs`, `pb-4text-base`) que no se aplican.

**PCD**

- `CardGenericContainer`: con un `attribute` que no existe en `initDerivatives.cards`, `cardSettings.index[idx]` falla; el respaldo «Sin componente» nunca se alcanza.
- `CardCreditorItem`: los selectores de año están cruzados (contratación usa `expirationDate` y vencimiento usa `hiringDate`); un monto vacío se muestra como `$0` (`formatMoney(undefined)` devuelve `'0'`), por lo que al teclear queda `$01,500`; `fnCalculateRule` usa `_.isEmpty`, que es `true` para cualquier número, así que los montos numéricos nunca avisan.
- `ExchangeRateCalculatorView`: `calcExchangeData` deja `coverageIndex` en `NaN` cuando valor y posición son 0 (React avisa «Received NaN for the children attribute»); `formatNumber(info?.coverageIndex, 0, '-')` ignora el tercer argumento; `info?.customerPosition.includes` falla si `customerPosition` es `undefined`.
- `CoverageProfileView`: `data-testid` inconsistente (`import-whatPercentage` frente a `exports-whatPercentage`); `isDisabled` vale `true` por defecto, así que sin esa prop toda la pantalla queda bloqueada.
- `ProfileSummaryView`: `competitiveAdvantageOrDifferentiator` no lleva `|| ''` y pasa de no controlado a controlado; numeración de preguntas repetida.
- `NewsContainer` no valida `item.negatives` cuando no existe.

**Estrategia**

- La estrategia de pages debe conservar componentes y providers reales cuando se prueben integraciones; el límite entre pruebas unitarias, integración y E2E se definirá por flujo en la siguiente fase.
- `jest.config.js` conserva `collectCoverageFrom` con `src/pages`, `src/services`, `src/helpers` y `src/hooks`, lo que mantiene bajo el porcentaje global hasta que se completen las SPEC 02 y SPEC 03.

Para validar el estado completo: `pnpm test`.
