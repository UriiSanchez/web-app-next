# Revisión breve de las pruebas

Fecha: 28 de septiembre de 2026. Revisión de configuración y de una muestra de
pruebas de componentes, páginas y servicios. Las rutas siguientes reflejan el
traslado a `src`; las mejoras descritas no se implementaron con ese traslado.

## Lo que funciona bien

-  Jest usa `next/jest`, alineando transformación, estilos e imágenes con Next.js.
-  Existe una base comprobada de 104 suites y 643 pruebas. La referencia anterior
   al traslado tiene 80.78% de cobertura de líneas, 73.14% de ramas y 56.74% de funciones.
   La cobertura mide ejecución; no garantiza que las aserciones detecten errores.
-  La estructura de `src/__tests__` refleja componentes, páginas y servicios.
   Los casos de servicios contemplan respuestas correctas, errores y datos ausentes.
-  React Testing Library, `jest-dom` y `userEvent.setup()` permiten probar comportamiento
   visible e interacciones. Hay ejemplos que comprueban argumentos enviados a callbacks.
-  Se generan LCOV y XML para la integración con Sonar. `clearMocks: true` evita
   reutilizar conteos de llamadas entre casos.
-  `FixJSDOMEnvironment.js` incorpora `structuredClone` de Node, necesario para
   funciones que sí utiliza la aplicación; no pierde tipos mediante un clon JSON.

## Mejoras prioritarias

| Prioridad | Evidencia                                                                                                                                                                    | Mejora propuesta                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alta      | En `src/__tests__/components/Controls/CustomSelect.test.jsx`, el caso que promete abrir el selector hace clic pero no incluye ninguna aserción.                              | Comprobar el efecto declarado; preferir un resultado visible o, en esta prueba unitaria, la llamada esperada a `setIsOpen(true)`.                                                             |
| Alta      | `jest.setup.js` instala un storage compartido por los casos de cada archivo, sin limpieza global. `getItem` convierte un valor vacío en `null`; `setItem` no fuerza cadenas. | Usar el storage de JSDOM cuando sea posible y limpiar almacenamiento entre casos. Restaurar spies deliberadamente; `clearMocks` no restaura implementaciones.                                 |
| Alta      | `coverageThreshold` no está configurado. Autenticación queda excluida; contexto y middleware no están en la selección de cobertura.                                          | Definir umbrales a partir de una medición acordada y agregar pruebas de permisos, sesión ausente y perfil desconocido en una tarea específica.                                                |
| Media     | Exclusiones como `/components/Skeleton/*.jsx` están escritas como glob dentro de `coveragePathIgnorePatterns`, que interpreta expresiones regulares.                         | Corregir los patrones y revisar la lista real de archivos instrumentados. Recalcular la referencia: el porcentaje puede cambiar sólo por corregir el alcance.                                 |
| Media     | `renderPage` es global, envuelve todo `render` en `act` y devuelve utilidades de Testing Library; el setup mezcla utilidades, entorno y mocks.                               | Extraer un `test-utils` importable, reservar el setup para preparación global y usar `act` sólo cuando sea necesario.                                                                         |
| Media     | Hay selectores acoplados al DOM (`firstChild`, `children[1]`, clases CSS), uso de `fireEvent` y casos comentados en `CoverageProfileView.test.jsx`.                          | Preferir consultas por rol/nombre y `userEvent` para interacciones completas. Resolver o registrar los casos comentados para que no queden invisibles.                                        |
| Media     | Varias páginas sustituyen servicios, contexto y layout mediante mocks.                                                                                                       | Mantener pruebas unitarias, pero añadir posteriormente algunas integraciones con proveedores reales y red simulada. Estos mocks no prueban el contrato real de API ni la navegación completa. |

La configuración de Jest contiene muchos comentarios de plantilla y un timeout
global de 30 segundos. Conviene reducir ruido y ajustar tiempos por necesidad,
sin bajar límites indiscriminadamente ni introducir fallos intermitentes.

Al ampliar experimentalmente el alcance de lint durante el traslado aparecieron
errores en archivos antes no analizados: un mock de componente sin `displayName`
en `IconResult.test.jsx` y referencias a reglas de plugins no configurados en
`helpers/helpValidations.js`. Incorporar reglas de `eslint-plugin-jest` y
`eslint-plugin-testing-library` podría detectar pruebas sin aserciones y usos
frágiles, pero debe evaluarse como una mejora explícita de herramientas y alcance.

## Sonar: hallazgo adicional

El `package.json` declara `jest-sonar-reporter` con `useRelativePath`,
`outputDirectory` y `outputName`. Sin embargo, el paquete instalado lee la clave
`jestSonar`, con opciones como `reportPath` y `reportFile` (ver su
`lib/utils/getConfig.js`). La configuración declarada no tiene el efecto esperado:
la generación actual puede funcionar por sus valores predeterminados. Corregir
el contrato y verificar las rutas XML en Jenkins antes de cambiar el reporter.

Además, `src/__tests__/pages/EMG/GeneralInformation/[client].jsx` sí es descubierto
por Jest dentro de `__tests__`, pero no coincide con los patrones `.test.js/.test.jsx`
de Sonar. Normalizar ese nombre o su inclusión en una tarea posterior.

## ¿Hay que actualizar dependencias?

No es necesario actualizar para efectuar el traslado a `src`: la suite actual
funciona. Sí hay mantenimiento recomendable, separado del cambio estructural.

| Dependencia resuelta                                                     | Evaluación                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jest` y `jest-environment-jsdom` 29.7.0; JSDOM 20.0.3                   | Evaluar una migración conjunta a Jest 30.x. Cambia el DOM a JSDOM 26 y elimina aliases de matchers; verificar `next/jest` de Next 14, el entorno personalizado y el reporter. No forzar JSDOM directamente mediante un override. |
| `@testing-library/react` 15.0.7                                          | Evaluar 16.x en un cambio independiente. Desde 16, `@testing-library/dom` debe declararse como peer instalado explícitamente; revisar también los peers de tipos. No requiere por sí mismo migrar la aplicación a React 19.      |
| `@testing-library/jest-dom` 6.6.3 y `@testing-library/user-event` 14.6.1 | No se identificó un bloqueo funcional que obligue a actualizarlos. Revisar parches compatibles dentro del mantenimiento habitual.                                                                                                |
| `jest-sonar-reporter` 2.0.0                                              | Priorizar evaluación de reemplazo: su repositorio está archivado desde 2019. Validar que el sustituto emita el formato genérico de ejecución que consume Sonar; un XML JUnit no es intercambiable automáticamente.               |
| `jest-preview`                                                           | Existe el script `test:preview`, pero falta la dependencia. Decidir si se necesita esa función: instalar una versión validada o retirar el comando en una tarea posterior.                                                       |

No eliminar `FixJSDOMEnvironment.js` suponiendo que una actualización resuelve
`structuredClone`: el issue de JSDOM sigue abierto. Comprobarlo con el entorno
elegido; el clon de Node también puede tener diferencias entre contextos de ejecución.

Orden sugerido: fortalecer aserciones y aislamiento, corregir medición/reportes,
evaluar el reporter y después actualizar las herramientas por grupos. No se hizo
una auditoría de vulnerabilidades en este análisis; antigüedad no equivale por sí
sola a una vulnerabilidad demostrada.

Fuentes consultadas:

-  [Migración oficial de Jest 29 a 30](https://jestjs.io/docs/upgrading-to-jest30).
-  [Releases de React Testing Library](https://github.com/testing-library/react-testing-library/releases).
-  [Issue de structuredClone en JSDOM](https://github.com/jsdom/jsdom/issues/3363).
-  [Repositorio archivado de jest-sonar-reporter](https://github.com/3dmind/jest-sonar-reporter).
