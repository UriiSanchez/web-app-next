# Migración a pnpm

Esta copia es un entorno aislado. No incluye API ni despliegues a producción.
La validación funcional por ahora comprende construcción, arranque y recursos
del login; no demuestra que la autenticación o los flujos de crédito funcionen.

## Entorno y uso

-  pnpm **12.5.1**, fijado en `package.json`.
-  Node **22.x**, mínimo 22.13.0; Node 24.x también está permitido para desarrollo.
-  Docker Desktop con contenedores Linux y Docker Compose v2.

Para provisionar el gestor con Corepack (incluido en Node 22), que usa la
versión fijada en `packageManager`:

```sh
corepack enable
corepack prepare pnpm@12.5.1 --activate
pnpm --version
pnpm install --frozen-lockfile
pnpm run dev
```

Las dependencias de la aplicación se instalan con pnpm. Cambiar de gestor no
cambia por sí solo el registro de paquetes ni elimina riesgos de suministro.

En un checkout que ya tenga dependencias de npm, eliminar únicamente su carpeta
`node_modules` antes de instalar con pnpm. No reutilizar dependencias de Windows
en Linux. El lockfile `pnpm-lock.yaml` y `pnpm-workspace.yaml` se versionan juntos.
No regenerar el lockfile eliminándolo ni ejecutar actualizaciones para resolver
una instalación fallida sin revisar antes la causa.

```sh
pnpm run test --runInBand
pnpm run lint
pnpm run build
```

`test:preview` es un comando heredado que requiere `jest-preview`, no declarado
en el proyecto original. No forma parte de esta validación ni se agregó una
nueva dependencia para habilitarlo.

## Docker local sin API

```sh
docker compose -f compose.local.yml -p easycredit-pnpm-local up --build -d
docker compose -f compose.local.yml -p easycredit-pnpm-local logs --tail 50
docker compose -f compose.local.yml -p easycredit-pnpm-local down
```

Abrir http://localhost:3001/Login. El puerto se publica sólo en loopback.
Este archivo usa una clave pública de prueba y desactiva el agente New Relic;
no debe utilizarse como configuración de despliegue real. No iniciar sesión con
credenciales reales: no hay una API configurada.

`docker-compose.yml` conserva la configuración original con red externa
`easycredit`. Para la prueba aislada usar explícitamente `compose.local.yml`.

## Decisiones de migración

-  Lockfile importado del `package-lock.json` original; no se actualizaron
   intencionadamente las versiones de la aplicación.
-  ESLint 8.57.1 ahora es una dependencia de desarrollo explícita: era la versión
   resuelta por npm, pero el manifiesto no declaraba directamente la herramienta.
-  Los scripts de instalación permitidos se limitan a versiones concretas en
   `allowBuilds`. Scripts nuevos o desconocidos hacen fallar la instalación.
   `fsevents` se omite; es una optimización opcional de observación en macOS.
-  `verifyDepsBeforeRun: error` evita instalaciones implícitas al ejecutar scripts.
-  Docker instala todas las dependencias para construir y, en una etapa aislada,
   sólo New Relic (con las versiones del lockfile, sin enlaces simbólicos). El
   runner contiene únicamente el `standalone` de Next, sus recursos estáticos y
   ese `node_modules` de New Relic superpuesto, porque Next externaliza New Relic
   y no lo incluye en standalone. La imagen pasó de 902 MB a 417 MB; ver
   [imagen Docker y Jenkinsfile](docker-image.md).
-  New Relic deja de descargarse sin versión en el runner. El arranque sigue siendo
   `node -r newrelic server.js`. Ya no se define `NEXT_SHARP_PATH`: sharp viaja en
   el trazado de standalone. El aviso de sharp en despliegue se explica en la guía.
-  pnpm se provisiona con Corepack (no con `npm install --global`) en el
   `Dockerfile` y en el `Jenkinsfile`. Jenkins instala y prueba en un solo stage,
   sólo en PR hacia `develop`. Sólo cachear el store si se añade caché persistente;
   no compartir `node_modules` entre sistemas operativos. Las condiciones de ramas
   de build y despliegue no cambian.

## Traslado al repositorio principal

Aplicar juntos manifiesto, lockfile, configuración pnpm, Dockerfile,
Jenkinsfile y documentación. Retirar el lockfile npm en ese mismo cambio.
Validar de nuevo el registro/proxy corporativo y el pipeline real. Después,
validar con la API login, permisos y operaciones antes de promover ambientes.
Para revertir, restaurar el cambio completo y la imagen anterior; no reconstruir
una imagen histórica resolviendo dependencias nuevas.

Los registros locales de esta ejecución se guardan en `.migration/`, excluido de
Git y del contexto Docker, incluyendo una copia del lockfile npm de referencia.

## Resultado de validación (23 de septiembre de 2026)

| Comprobación                                   | Resultado                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| Versiones e integridad del grafo de aplicación | 856 paquetes únicos; sin diferencias entre npm y pnpm                 |
| Pruebas npm, Node 22.23.2 / Alpine             | 104 suites y 643 pruebas aprobadas                                    |
| Pruebas pnpm, Node 22.23.2 / Alpine            | 104 suites y 643 pruebas aprobadas                                    |
| Cobertura en ambos gestores                    | Statements/líneas 80.78%; ramas 73.14%; funciones 56.74%              |
| Build de referencia npm                        | Aprobado                                                              |
| Imagen Docker pnpm                             | Construida y arrancada; UID 1001; 902 MB → 417 MB (spec 04)           |
| Login en navegador                             | Formulario, estilos e imágenes visibles                               |
| HTTP local                                     | `/Login` 200; `/` 307 a `/Login`; sesión anónima 200                  |
| Sharp                                          | 0.33.5; optimización de imagen HTTP 200                               |
| New Relic                                      | 14.4.0 cargado; agente desactivado sólo en Compose local              |
| Instalación Windows, Node 24.19.0              | Aprobada; repetición offline aprobada sin cambiar hash del lockfile   |
| Compose y bootstrap Jenkins                    | Configuraciones válidas; instalación y pruebas con Corepack en Alpine |
| Lint                                           | Falla en ambos gestores con el mismo listado de diagnósticos          |

Los dos errores de lint existentes están en `components/Controls/CancelRequestButton.jsx`,
línea 71, por comillas sin escapar (`react/no-unescaped-entities`). También existen
advertencias de hooks. No se alteró código funcional para ocultarlas. Prettier
advierte sobre la opción heredada `requireParentheses`, pero la comprobación de
formato de los nuevos archivos pasa.

La instalación detectó advertencias de dependencias existentes; esta migración
preserva versiones y no constituye una actualización o auditoría de seguridad.
No se ejecutó Jenkins corporativo ni se verificó telemetría contra New Relic,
autenticación real, API o despliegues remotos.

Evidencia principal: `.migration/npm-test.log`, `.migration/pnpm-complete-test.log`,
`.migration/npm-lint.log`, `.migration/pnpm-complete-lint.log`,
`.migration/lockfile-comparison.json` y `.migration/docker-final-build.log`.
