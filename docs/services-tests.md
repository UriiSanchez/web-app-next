# Reconstrucción de pruebas: services

## Cambios

-  16 suites nuevas en `src/__tests__/services/<archivo>.test.js`, una por cada servicio de `src/services` excepto `index.js` (solo reexporta). El archivo `servGeneralInfomation.js` conserva la errata en su nombre: `servGeneralInfomation.test.js`.
-  No se modificó `jest.config.js`, `jest.setup.js` ni ninguna dependencia.
-  Se corrigieron dos defectos en `src/services` (ver [Defectos corregidos](#defectos-corregidos)).
-  Las suites previas de `.migration/src-baseline/__tests__/services/` se usaron solo como guía de casos; ninguna se copió.

## Criterios

Se prueban resultados y peticiones enviadas, sin snapshots. Cada función exportada cubre el camino feliz (URL, método y cuerpo enviados a `genericFetch` o `customAxios` y resultado transformado), el `status` no exitoso, la excepción del fetch (`catch`), los datos vacíos o nulos y cada rama por parámetro.

-  El único `jest.mock` de las 16 suites es `../../hooks`: `genericFetch` (todas) y `customAxios` (solo `servCommon`). `../helpers` y `../helpers/config` se ejecutan reales.
-  `Swal.fire` se espía con `jest.spyOn(Swal, 'fire')` y no con `jest.mock`, así se verifica el mensaje que ve el usuario (`getError`, `sweetNormal` y `sweetSnackbar` llaman a `Swal.fire`).
-  `jest.setup.js` restaura los spies y limpia `localStorage` después de cada caso. `Date.now`, `console.log` y `console.error` se espían por caso.

Convenciones:

-  Nombres de `describe`/`test` en inglés, un `describe` por función exportada. Extensión `.test.js`: los servicios no contienen JSX.
-  Los mocks de respuesta usan `mockResolvedValueOnce` y `mockRejectedValueOnce`. Solo `servSolidary` y `servCommon` usan `mockImplementation`, para responder según la URL cuando una misma prueba hace varias peticiones distintas; `servSolidary` restablece el mock con `mockReset` al terminar.
-  Los formatos de error distintos se prueban tal como los devuelve cada función (`getError`, `{ status: 500, error }`, `{ status: 500, message }`, `0`); no se unificaron.
-  Cuando un servicio toma la fecha actual (`dayjs()`), la prueba fija el reloj con `jest.useFakeTimers().setSystemTime(...)`. `jest.setup.js` restaura los temporizadores reales.
-  `servCheckList` reinicia los módulos (`jest.resetModules()`) antes de cada caso, porque `DocumentsClass` y el servicio mutan estado compartido (ver [Hallazgos](#hallazgos-sin-corregir)). `servDerivaties` restaura en sitio `templateDerivatives` después de cada caso por el mismo motivo.
-  `createObjectURL` y `crypto.randomUUID` no existen en JSDOM: `servEmpowered` y `servCommon` los definen en el caso que los necesita.

## Alcance implementado

| Servicio                   | Suite                              | Pruebas | Líneas | Ramas |
| -------------------------- | ---------------------------------- | ------: | -----: | ----: |
| `servBalanceSheet`         | `servBalanceSheet.test.js`         |      20 |   100% | 94.7% |
| `servBureValidation`       | `servBureValidation.test.js`       |       9 |   100% |  100% |
| `servCheckList`            | `servCheckList.test.js`            |     108 |   100% |  100% |
| `servClients`              | `servClients.test.js`              |      57 |   100% |  100% |
| `servCommon`               | `servCommon.test.js`               |      45 |   100% | 98.3% |
| `servCover`                | `servCover.test.js`                |      34 |   100% |  100% |
| `servDerivaties`           | `servDerivaties.test.js`           |     142 |  99.2% | 99.4% |
| `servEmpowered`            | `servEmpowered.test.js`            |      33 |  94.2% |  100% |
| `servGeneralInfomation`    | `servGeneralInfomation.test.js`    |       9 |   100% |  100% |
| `servModel`                | `servModel.test.js`                |      10 |   100% |  100% |
| `servPropertyVerification` | `servPropertyVerification.test.js` |      44 |   100% |  100% |
| `servRequests`             | `servRequests.test.js`             |      52 |   100% |  100% |
| `servSecretary`            | `servSecretary.test.js`            |      15 |   100% |  100% |
| `servSolidary`             | `servSolidary.test.js`             |      31 |   100% |  100% |
| `servStateResults`         | `servStateResults.test.js`         |      18 |   100% | 97.6% |
| `servTracking`             | `servTracking.test.js`             |      10 |   100% |  100% |
| **Total**                  | 16 suites                          | **637** |        |       |

Cobertura medida con `pnpm test` (proveedor v8, `coverage/lcov.info`): 143 suites y 1807 pruebas del proyecto en verde. Todos los archivos superan el 80% de líneas y de ramas.

## Defectos corregidos

Cada corrección es de una línea, tiene una prueba y esa prueba falla sin el cambio.

| Servicio                                | Cambio                                                        | Problema                                                                                                                                                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `servCheckList.js` (`getDocumentation`) | `isFoundDocument.mandatory` → `isFoundDocument?.mandatory`    | Si la respuesta del backend omitía cualquier documento del perfil, la función lanzaba `TypeError` y devolvía 500 para todo el checklist. La línea anterior ya usaba `?.` y el resto del código maneja el documento ausente. Sin el cambio fallan 85 de las 108 pruebas de la suite. |
| `servCover.js` (`saveCoverInfo`)        | `return genericFetch(...)` → `return await genericFetch(...)` | El `catch` con `{ status: 500, message }` no atrapaba el rechazo del fetch, y la función terminaba rechazada. Las páginas `SEC/Cover` y `Shared/Cover` esperan un objeto con `status`.                                                                                              |

Impacto: en ambos casos el cambio solo aplica a un camino que fallaba; no altera las respuestas exitosas. Con el `genericFetch` real (`src/hooks/useFetch.js` hace `.catch(error => error)`) un rechazo no ocurre hoy, así que la corrección de `saveCoverInfo` protege ante un cambio futuro de ese hook, no cambia el comportamiento actual.

## Hallazgos sin corregir

Se documentan porque quedan fuera de `src/services` o porque no está claro si son intencionales. Ninguno cambia lo que verifican las pruebas, salvo que se indica.

En `src/helpers`:

-  `getError` (`helpErrors.js`) lanza `TypeError` con cualquier `status` que no esté en `mapTypeErrors` (por ejemplo 403 o 503). Los servicios que lo llaman dentro de un `try` devuelven entonces un 500 genérico. Una prueba de `servGeneralInfomation` fija este comportamiento.
-  `DocumentsClass` (`initDocuments.js`) reutiliza los arreglos `toAction` de sus documentos base, y `servCheckList` los modifica. Una llamada puede heredar valores de otra (`url`, `label`, `enable`). Por eso `servCheckList.test.js` reinicia los módulos en cada caso.
-  `templateDerivatives` (`initDerivativesProfile.js`) se asigna por referencia en `parseDerivaties` y `handleVerifyCalculators`, y luego se modifica. Las pruebas de `servDerivaties` lo restauran en cada caso.

En `src/services`:

-  `initExchangeValue` (`servCommon`): por el `else if`, si el DOLLAR guardado es inválido la UDI no se revisa y se conserva aunque sea inválida. Una prueba fija el comportamiento (`{ DOLLAR: '0', UDI: '0' }` devuelve `UDI: '0'`).
-  `initExchangeValue`: usa `_.isEmpty` sobre valores que podrían ser numéricos; con un número (`17.5`) siempre se vuelve a pedir el valor.
-  `getExchangeValue` (`servCommon`) devuelve un número (`0`) en unos casos y un objeto `{ status, value, message }` si el fetch se rechaza; `initExchangeValue` guarda ese objeto como valor de cambio.
-  `getClientsById` (`servClients`) no tiene `catch`: si el fetch se rechaza, la función se rechaza. Hoy lo cubre el `try/catch` de `getRequestsByParam`.
-  `postSavePersons` (`servRequests`) filtra `delete == undefined`, de modo que una persona con `delete: false` también se excluye de `obligators`.
-  `postSaveAuthorization` (`servEmpowered`) devuelve `true` con cualquier `status` distinto de 400, 404, 409 y 500 (por ejemplo 403).
-  `mapList` (`servStateResults`) usa `_.isEmpty(item?.amount)`: con un `amount` numérico el porcentaje siempre queda en `'0'`; solo se conserva si `amount` es una cadena.
-  `saveCustomerProfile` (`servDerivaties`) no atrapa el rechazo del fetch: su `try/catch` solo protege la construcción de `DerivativesClass` (un paso inexistente devuelve 500).
-  `parseRequest` (`servRequests`) deja `status` como `undefined` cuando `idCatStatus` no está en `catStatus`.

## Excepciones de cobertura

Todo el código no cubierto es inalcanzable o no se usa.

| Archivo               | Líneas o ramas  | Motivo                                                                                                                                                                        |
| --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `servBalanceSheet.js` | rama, línea 47  | El `                                                                                                                                                                          |     | dayjs().format('DD-MM-YYYY')`nunca se ejecuta:`dateToString`ya devuelve`'-'`cuando no hay fecha, y una cadena con contenido es verdadera. Una prueba fija que sin fecha el resultado es`'-'`. |
| `servStateResults.js` | rama, línea 78  | Igual que el caso anterior, en `mapData`.                                                                                                                                     |
| `servCommon.js`       | rama, línea 163 | En `'La solicitud no pudo ser procesada: ' + error \|\| 'No result'`, la precedencia hace que el `                                                                            |     | 'No result'`sea inalcanzable. Con`error`indefinido el mensaje termina en`: undefined`.                                                                                                        |
| `servDerivaties.js`   | líneas 255-257  | El `return true` final del validador `calculatorType` es inalcanzable: la condición previa `if (isEmpty(isType) \|\| isEmpty(data)) return false` ya cubre el caso contrario. |
| `servEmpowered.js`    | líneas 139-147  | `saveInLocalStorageDocument` no se exporta y nada la llama (código muerto).                                                                                                   |

## Validación

-  `pnpm test`: 143 suites y 1807 pruebas en verde, código de salida 0, sin `skip`, `todo` ni pruebas comentadas, sin snapshots (`Snapshots: 0 total`).
-  Cada archivo de `src/services` (excepto `index.js`) supera el 80% de líneas y de ramas en `coverage/lcov.info`.
-  `jest.config.js` no se modificó.
-  Los únicos cambios en `src/services` son los dos de [Defectos corregidos](#defectos-corregidos); cada uno tiene una prueba que falla sin la corrección.
