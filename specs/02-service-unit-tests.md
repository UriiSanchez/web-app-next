# SPEC 02 — Pruebas unitarias de services

> **Status:** Aprobado  
> **Depends on:** SPEC 01  
> **Date:** 2026-09-28  
> **Objective:** Crear pruebas unitarias con Jest para los 16 servicios de `src/services`, con una suite por archivo, mockeando solo `../hooks` y con al menos 80% de líneas y de ramas por archivo.

## Por qué existe esta spec

El commit `bc14f7d` eliminó la suite anterior. Las suites previas de services se conservan en `.migration/src-baseline/__tests__/services/` (16 archivos, ~3700 líneas) y sirven de referencia de casos, no de código a copiar. `src/__tests__/services/` existe pero está vacío. SPEC 01 dejó pendientes pages y services; esta spec cubre services y adopta el mismo criterio de calidad.

## Alcance

**Dentro:**

- Una suite `src/__tests__/services/<archivo>.test.js` por cada servicio de `src/services` excepto `index.js` (16 archivos): `servBalanceSheet`, `servBureValidation`, `servCheckList`, `servClients`, `servCommon`, `servCover`, `servDerivaties`, `servEmpowered`, `servGeneralInfomation`, `servModel`, `servPropertyVerification`, `servRequests`, `servSecretary`, `servSolidary`, `servStateResults`, `servTracking`.
- Reescribir cada suite usando el baseline como guía de casos, con el criterio de SPEC 01: sin snapshots, aserciones sobre resultado, `await` en todo código asíncrono.
- Mock únicamente de `../hooks` (`genericFetch`, `customAxios`). `../helpers` y `../helpers/config` se usan reales (por ejemplo `getError` y las constantes de estado).
- Por cada función exportada, cubrir: camino feliz (URL, método y cuerpo enviados a `genericFetch`/`customAxios` y resultado transformado), `status` distinto de 200, excepción del fetch (`catch`), datos vacíos o nulos y cada rama por parámetro.
- Corregir defectos de `src/services` hallados al probar. Cada corrección es mínima, va acompañada de su caso de prueba y se registra en `docs/services-tests.md`.
- Crear `docs/services-tests.md` con las convenciones usadas, los defectos hallados y las excepciones de cobertura.

**Fuera de alcance (specs futuras):**

- `src/services/index.js` (solo reexporta).
- Pruebas de `hooks`, `helpers`, `context`, `pages` y middleware.
- Pruebas E2E, pruebas de integración con red simulada (MSW) y mock de `axios`.
- Cambios en `jest.config.js` (`coverageThreshold`, patrones de cobertura, reporters).
- Refactors de servicios que no sean corregir un defecto (renombrar `servGeneralInfomation`, unificar formatos de error, etc.).

## Modelo de datos

Esta spec no introduce estructuras de datos de aplicación. Añade solo archivos de prueba y, si hace falta, fixtures compartidos en `src/__mocks__/` (ya existen `analyst.js`, `leaders.js`, `request.js`, `users.js`).

Convenciones:

- Ruta de la suite: `src/services/servClients.js` → `src/__tests__/services/servClients.test.js` (coincide con `testMatch`). El archivo `servGeneralInfomation.js` conserva su nombre con la errata: `servGeneralInfomation.test.js`.
- Extensión `.test.js`: los servicios no contienen JSX.
- Mock estándar al inicio de cada suite: `jest.mock('../../hooks', () => ({ genericFetch: jest.fn(), customAxios: jest.fn() }))`, solo con las funciones que el servicio importe.
- Nombres de `describe`/`test` en inglés, un `describe` por función exportada.
- `localStorage` (usado en `servCommon`) es el de JSDOM; `jest.setup.js` lo limpia entre casos.

## Plan de implementación

Cada paso cubre un grupo de servicios y termina con `pnpm test` en verde. Orden: de los más pequeños a los de más ramas.

1. **Pequeños** (5 archivos, ≤ 75 líneas): `servModel`, `servBureValidation`, `servGeneralInfomation`, `servTracking`, `servSecretary`.
2. **Medianos** (4 archivos): `servBalanceSheet`, `servStateResults`, `servSolidary`, `servEmpowered`.
3. **`servCover` y `servCommon`** (2 archivos), incluyendo `initExchangeValue` con `localStorage` vacío y con datos.
4. **`servClients` y `servRequests`** (2 archivos): ramas por tipo de búsqueda (`forNumber`, `forGroup`, `forName`) y por tipo de persona.
5. **`servPropertyVerification`, `servCheckList` y `servDerivaties`** (3 archivos, los más grandes).
6. Crear `docs/services-tests.md` y ejecutar `pnpm test` completo para medir cobertura por archivo.

## Criterios de aceptación

- [ ] Existe una suite por cada servicio de `src/services` excepto `index.js`, en `src/__tests__/services/`.
- [ ] `pnpm test` termina con código 0, sin suites ni pruebas omitidas (`skip`, `todo`, comentadas).
- [ ] Ninguna prueba usa `toMatchSnapshot` ni `toMatchInlineSnapshot`.
- [ ] Los únicos `jest.mock` de las suites apuntan a `../../hooks`.
- [ ] Todo caso contiene al menos una aserción sobre resultado o sobre los argumentos enviados a `genericFetch`/`customAxios`.
- [ ] Cada función exportada de cada servicio tiene casos para éxito, `status` no exitoso y excepción del fetch.
- [ ] Cada archivo de `src/services` (excepto `index.js`) alcanza al menos 80% de líneas y 80% de ramas en `coverage/lcov.info`. Cualquier excepción se lista, con motivo, en `docs/services-tests.md`.
- [ ] `jest.config.js` no se modificó.
- [ ] Todo cambio en `src/services` corresponde a un defecto listado en `docs/services-tests.md` y tiene una prueba que falla sin la corrección.
- [ ] `docs/services-tests.md` existe y refleja el estado final.

## Decisiones tomadas y descartadas

- **Sí:** reescribir las suites usando el baseline como guía. **No:** copiarlas y adaptarlas, porque heredarían aserciones superficiales; **no** ignorarlas, porque ya contienen casos de negocio valiosos.
- **Sí:** mockear solo `../hooks`. **No:** mockear `../helpers`, porque vuelve las pruebas vacías y no detecta roturas en `getError`. **No:** mockear `axios` o usar MSW, porque desplaza las pruebas hacia integración y añade dependencias.
- **Sí:** 80% de líneas y de ramas por archivo. **No:** solo líneas como en SPEC 01, porque en servicios las ramas (status, `catch`, vacíos) concentran la lógica. **No:** 90%, porque obligaría a casos de bajo valor.
- **Sí:** permitir corregir defectos de `src/services` con prueba y registro. **No:** solo documentarlos como en SPEC 01, por decisión del usuario.
- **No:** probar `index.js`. Solo reexporta; se descarta un test que duplicaría el listado de exports.
- **Sí:** archivos `.test.js`. Los servicios no tienen JSX, a diferencia de los componentes de SPEC 01.
- **Numeración:** esta spec es la 02. SPEC 01 la menciona como «SPEC 03» porque preveía pages en la 02; esa referencia queda obsoleta y no se edita aquí.

## Riesgos identificados

| Riesgo                                                                                       | Mitigación                                                                                                                                   |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Corregir un defecto cambia el contrato que consumen páginas o componentes.                   | Buscar los usos de la función con `Grep` antes de corregir y limitar el cambio al defecto; registrar el impacto en `docs/services-tests.md`. |
| Un mock de `genericFetch` demasiado permisivo hace pasar pruebas sin validar la petición.    | Aserción obligatoria sobre `url`, `method` y `data` enviados.                                                                                |
| Los errores se devuelven con formatos distintos (`getError`, `{status: 500, message}`, `0`). | Un caso por cada formato, según lo que devuelva cada función; no se unifican en esta spec.                                                   |
| Cobertura de ramas difícil en servicios de 300+ líneas (`servCheckList`, `servDerivaties`).  | Dividir el `describe` por función y documentar como excepción las ramas inalcanzables.                                                       |
| Diferencias entre `src/services` y el baseline dejan casos obsoletos.                        | Contrastar cada caso del baseline con el código actual antes de reutilizarlo.                                                                |

## Qué **no** está en esta spec

- Pruebas de `pages`, `hooks`, `helpers`, `context` y middleware.
- Pruebas E2E o de integración con red simulada.
- Prueba de `src/services/index.js`.
- Cambios en `jest.config.js` o en dependencias.
- Refactors de servicios distintos de corregir defectos.

Cada uno de ellos, si se aborda, va en su propia spec.
