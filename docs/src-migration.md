# Traslado del código a src

Fecha: 28 de septiembre de 2026.

## Estructura y alcance

Se movieron a `src/` las carpetas `components`, `context`, `helpers`, `hooks`,
`pages`, `services`, `styles`, `__tests__`, `__mocks__` y el archivo `middleware.js`.
La carpeta `pages/api` conserva sus handlers y las URLs públicas no cambian.

`public`, `scripts`, `docs`, archivos de entorno, manifiesto, lockfile y configuración
permanecen en raíz. También permanecen `jest.setup.js` y `FixJSDOMEnvironment.js`.
No se introdujeron aliases, actualizaciones de dependencias ni cambios de negocio.

## Referencias y configuración

-  Se añadió un nivel a los imports relativos de recursos de `public` y a las rutas
   de fuentes en `src/styles/globals.css`; los imports internos mantienen su relación.
-  Jest busca archivos bajo `src`, conserva `next/jest` con raíz de proyecto y actualiza
   las rutas de selección/exclusión de cobertura. El setup importa `src/styles/globals.css`.
-  Tailwind conserva sus carpetas de búsqueda, ahora bajo `src`.
-  Sonar conserva el alcance de fuentes y las exclusiones anteriores con el prefijo
   `src/`. Sus pruebas están en `src/__tests__`. Los reportes siguen en raíz:
   `coverage/lcov.info` y `test-report.xml`.
-  `.dockerignore` excluye las nuevas rutas de pruebas y mocks.
-  Next configura explícitamente las carpetas de lint equivalentes a las anteriores.
   Sin esto, `next lint` empieza a analizar todo `src`, incluidas pruebas y helpers
   que antes no analizaba. Los problemas de ese alcance ampliado se documentan para
   una tarea de calidad separada.
-  Dockerfile ya copia el contexto con `COPY . .`; Jenkins sigue ejecutando los mismos
   comandos desde raíz. No necesitaron cambios adicionales.
-  README actualizado y [revisión de pruebas](testing-review.md) añadida por separado.

Se conservaron deliberadamente los defectos existentes de configuración de pruebas
descritos en la revisión, para no mezclar una corrección de alcance de cobertura con
un traslado de archivos. Sonar/Jenkins corporativos y la API no están disponibles
para comprobar integración real.

## Evidencia y reversión

Los archivos previos al traslado están en `.migration/src-baseline/`, excluidos de
Git y Docker. Los registros de validación se guardan en `.migration/src-validation/`.
El traslado puede revertirse restaurando juntos carpetas y configuración desde
esa referencia; no se debe dejar simultáneamente `pages/` y `src/pages/` activos.

La guía de [migración a pnpm](pnpm-migration.md) conserva los resultados históricos
de la etapa anterior.

## Estructura posterior: App Router

Este documento describe el traslado a `src/` con `src/pages` (Pages Router) como
único router. El plan para migrar `src/pages` a `src/app` por olas, sin romper URLs,
está en [routes-migration.md](routes-migration.md). Mientras ese plan no se ejecute,
lo descrito aquí sigue vigente; durante la migración convivirán `src/pages` y
`src/app`, y al terminar la Ola 9 desaparecerá `src/pages`.

## Validación del traslado

- Suite local Windows: **104 suites y 643 pruebas aprobadas**, sin cambios respecto
  de la referencia; líneas/statements 80.78%, ramas 73.14%, funciones 56.74%.
- Se verificaron **397 archivos trasladados**: sólo difieren las referencias
  relativas a recursos públicos previstas para esta migración.
- El XML generado contiene 104 archivos de pruebas y LCOV 275 archivos de fuentes;
  todas sus rutas resuelven a archivos existentes.
- El hash SHA-256 del lockfile permanece en
  `8D7E7AB5F2BB23327846B4507F823749696687E75F31AF30907DCB9DEECDDB8B`.
- Imagen `gfb-easycredit-web:src-local` construida; comprobación HTTP en puerto local
  3002: `/Login`, sesión anónima, fuente Poppins y optimización de imagen responden
  200; `/` redirige con 307 a `/Login`. El manifiesto contiene 48 rutas de páginas
  y el middleware en `/`.
- La primera ejecución de lint detectó el alcance ampliado automáticamente por
  Next al existir `src`. Se fijó después el alcance anterior en `next.config.js`.
  La repetición de lint no fue autorizada, por lo que su resultado final queda
  pendiente; no se presenta como una comprobación aprobada.

La construcción y comprobación HTTP anteriores preceden al último ajuste de
`eslint.dirs`. Ese ajuste sólo afecta la selección de archivos de lint. No se
probó la API real ni la ejecución de Sonar/Jenkins corporativos.
