# Reconstrucción de pruebas: componentes

## Cambios

- `jest.setup.js` utiliza el Storage nativo de JSDOM. Limpia localStorage y sessionStorage antes y después de cada caso; restaura spies y temporizadores al terminar.
- Se eliminó `global.renderPage` y su envoltura general en `act`.
- `src/test-utils/render.jsx` exporta `renderComponent(ui, options)`: crea una sesión de user-event por render y acepta las opciones normales de Testing Library, incluido `wrapper`. `screen`, `within` y `waitFor` se importan de Testing Library.
- `src/test-utils/router.js` proporciona un adaptador explícito del router de Next para las pruebas que lo necesitan.
- Las pruebas se agrupan por comportamiento en `src/__tests__/components`. Los casos de storage verifican además el contrato del entorno común.

## Criterios

Se prueban acciones y resultados, sin snapshots generales ni mocks de componentes hijos. Los componentes que consumen contexto reciben valores mediante `EasyContext.Provider` real; sus acciones pueden ser spies para comprobar el contrato. Esto no equivale a probar `EasyProvider`, autenticación o backend completos.

MainLayout conserva Navbar, Loader y CustomStepper reales y usa SessionProvider real con sesión nula. Solo se sustituye la operación externa de cierre de sesión. Los casos de documentos y ejecución del modelo sustituyen funciones concretas del servicio; SweetAlert se sustituye en su frontera `Swal.fire` para controlar confirmación y cancelación.

Los eventos usan `await user.*`; las respuestas asíncronas se esperan mediante consultas o `waitFor`. `act` se limita al avance explícito de temporizadores simulados. Las comprobaciones de clases de apertura son puntuales: JSDOM no ejecuta Tailwind ni verifica el aspecto visual.

## Alcance implementado

- Controles: agregar, eliminar, enlaces, toggle, encabezado, porcentaje, entrada numérica, selección, dropdown, tooltip, comentarios, stepper, alertas, breadcrumbs y reasignación.
- Filtros: búsqueda, selección múltiple, trámite y sucursal.
- Tablas: Pagination, NewPagination, HeadCell y TrackingSelect.
- Documentos: descarga, carga, error devuelto por servicio, cambio de solicitud y selección de año en DocumentationItem.
- Solicitudes: selección de solicitante, comentario y referencia de respuesta, autorización y confirmación de último rechazo.
- Composición: MainModal, Loader, AuthLayout, MainLayout y Navbar.
- Formularios: propietarios y copropietarios, términos y condiciones y tarjetas de tasas con controles reales.
- Modelo: validación previa, ejecución, indicadores de carga y respuestas fallidas.

Esta es una primera batería reconstruida: no representa cobertura completa de todos los componentes ni de todas sus ramas. Quedan, entre otros, tablas compuestas, formularios financieros extensos, PDFModal y operaciones de guardado/eliminación de varias vistas. Pages, services y la estrategia E2E quedan para las siguientes fases.

## Validación

La última ejecución autorizada de `pnpm test --runInBand` terminó con **15 suites y 72 pruebas aprobadas**, sin snapshots. Posteriormente se añadieron cinco suites: `execute-model`, `confirmation`, `rate-cards`, `navigation` y `fixed-filters`. La solicitud de ejecutar nuevamente las pruebas fue rechazada; esos casos están **pendientes de validación**. También fue rechazada la revisión final de Git, por lo que no se verificó el diff final mediante Git.

No se ejecutó Docker ni se actualizaron dependencias. No se modificó código funcional de componentes. Se conserva FixJSDOMEnvironment para structuredClone y se mantiene el alcance de cobertura existente; el porcentaje global incluye áreas cuyas pruebas aún no se han reconstruido y no debe compararse directamente con el de la suite anterior.

Para validar el estado completo: `pnpm test --runInBand`.

## Hallazgos pendientes

- NewPagination etiqueta como «Primera» una acción que retrocede una página. Se documenta sin convertir ese comportamiento en una expectativa de primera página ni corregirlo dentro de este cambio.
- Algunos selectores usan elementos no semánticos para acciones y dependen de CSS para su visibilidad. La validación de teclado y accesibilidad requerirá mejoras en los componentes.
- TabOptionDocuments no incluye idClient entre las dependencias de su efecto y no captura promesas rechazadas; los casos añadidos cubren errores devueltos como datos, no ese rechazo sin manejar.
- La estrategia de pages debe conservar componentes y providers reales cuando se prueben integraciones; el límite entre pruebas unitarias, integración y E2E se definirá por flujo en la siguiente fase.
