# Imagen Docker y Jenkinsfile

Esta guía describe cómo se construye la imagen de producción, cómo medirla, cómo
se provisiona pnpm con Corepack y qué hace el `Jenkinsfile`. Resume la spec
`specs/04-docker-image-and-jenkins-optimization.md`.

## Resultado

Medido el 29 de septiembre de 2026 con Docker Desktop (Docker 29.4.0, almacén
containerd), construyendo con `compose.local.yml`:

| Medida                                          | Antes   | Después |
| ----------------------------------------------- | ------- | ------- |
| `docker images` (columna `DISK USAGE`)          | 902 MB  | 417 MB  |
| Contenido comprimido (`CONTENT SIZE`)           | 196 MB  | 96,3 MB |
| Capas descomprimidas (suma de `docker history`) | ~706 MB | ~321 MB |
| `node_modules` dentro de la imagen              | 438 MB  | 121 MB  |

En Docker Desktop con containerd, `DISK USAGE` suma el contenido descomprimido
más el comprimido (321 + 96 = 417). Un daemon clásico, como el de un agente
Jenkins, muestra en `docker images` el tamaño descomprimido, es decir, unos 321 MB.
La meta acordada es ≤ 420 MB con la medida de Docker Desktop.

Distribución de las capas propias de la imagen final (sobre `node:22-alpine`):

| Capa                                               | Tamaño  |
| -------------------------------------------------- | ------- |
| `.next/standalone` (con su `node_modules` trazado) | 56,2 MB |
| `node_modules` de New Relic y sus dependencias     | 74,9 MB |
| `.next/static`                                     | 8,8 MB  |
| `public`                                           | 3,9 MB  |

Antes, la capa de `node_modules` copiaba el grafo completo de producción (459 MB,
con `next`, `react`, `sharp` y el compilador `@next/swc` duplicados).

## Diseño del `Dockerfile`

Etapas, en orden:

1. **`base`**: `node:22-alpine`, directorio `/app`.
2. **`tooling`**: `libc6-compat` y pnpm provisionado con Corepack (ver abajo). Copia
   `package.json`, `pnpm-lock.yaml` y `pnpm-workspace.yaml`.
3. **`deps`**: `pnpm install --frozen-lockfile` con todas las dependencias.
4. **`builder`**: copia el código y ejecuta `pnpm run build` (salida `standalone`).
5. **`newrelic`**: instala **solo** New Relic. Reduce el `package.json` de la etapa a
   `newrelic` y ejecuta `pnpm install --prod --no-frozen-lockfile --node-linker=hoisted`
   sobre el `pnpm-lock.yaml` real. pnpm conserva las versiones fijadas en el
   lockfile y poda el resto. La instalación es _hoisted_: no hay enlaces
   simbólicos, por lo que la carpeta se puede copiar sin romper referencias. Al
   final se borran los metadatos de pnpm (`.pnpm`, `.modules.yaml`,
   `.pnpm-workspace-state-v1.json`).
6. **`runner`**: usuario no root `user_easyfront` (UID 1001), y copia:

   -  `.next/standalone` del `builder`;
   -  el `node_modules` de la etapa `newrelic`, superpuesto (ningún nombre de primer
      nivel coincide con los del standalone);
   -  `.next/static`, `public` y `newrelic.js`.

   Arranca con `node -r newrelic server.js` en el puerto 3001.

¿Por qué una etapa aparte para New Relic? `next.config.js` lo externaliza
(`serverComponentsExternalPackages` y `newrelic/load-externals`), así que el
trazado de `standalone` no lo incluye. Es la única razón por la que hay que
llevarlo a la imagen; todo lo demás ya viene trazado por Next.

### Construir y medir

```sh
docker compose -f compose.local.yml build
docker images gfb-easycredit-web
docker history gfb-easycredit-web:pnpm-local
docker run --rm --entrypoint ls gfb-easycredit-web:pnpm-local node_modules
```

Para el despliegue real, Jenkins construye con `docker build -f Dockerfile` y el
argumento `ARG_ACTIVE_ISILOANS`.

## Corepack

pnpm ya no se instala con `npm install --global`. Tanto el `Dockerfile` como el
`Jenkinsfile` ejecutan, con la versión de `packageManager` de `package.json`:

```sh
corepack enable
corepack prepare "$(node -p "require('./package.json').packageManager")" --activate
```

Antes se valida que `packageManager` empiece por `pnpm@`; si no, el paso falla.

Corepack descarga pnpm de `registry.npmjs.org`. Si la red corporativa no llega a
ese registro, hay que definir `COREPACK_NPM_REGISTRY` con el registro alternativo
(por ejemplo, el proxy del banco):

-  **Jenkins:** declararlo en `environment { … }` del `Jenkinsfile`, o en el stage.
-  **Docker build:** el `Dockerfile` no lo declara hoy. Si hiciera falta, se añade
   `ARG COREPACK_NPM_REGISTRY` (y `ENV`) en la etapa `tooling` y se pasa con
   `--build-arg`. Un `--build-arg` no declarado se ignora.

Esto no se pudo probar contra el agente real de Jenkins; hay que confirmarlo en
el primer pipeline. Los logs locales mostraron descargas lentas del registro
(26–37 KiB/s en algunos paquetes), a tener en cuenta con el timeout de 15 minutos.

## Aviso de `sharp` en despliegue

Con Next 14.2.28, el aviso `'sharp' is required to be installed in standalone
mode…` aparece cuando `require(process.env.NEXT_SHARP_PATH || "sharp")` falla
(`next/dist/server/image-optimizer.js`).

Diagnóstico (29 de septiembre de 2026, evidencia en `.migration/spec-04/`):

-  Con el `Dockerfile` de pnpm, `sharp@0.33.5` y sus binarios `@img/sharp-linuxmusl-x64`
   y libvips viajan dentro del trazado de `standalone`. `sharp` carga y
   `/_next/image` responde 200 sin aviso.
-  Reproduciendo el aviso: con `NEXT_SHARP_PATH=/tmp/node_modules/sharp` (el valor
   que fijaba el Dockerfile anterior a la migración a pnpm) `require` falla y el log muestra el error.
-  El despliegue arranca el contenedor con `--env-file=${ENV_FILE}`, y las variables
   del env-file **sobrescriben** el `ENV` del `Dockerfile`.

Solución aplicada en el repositorio: se eliminó `ENV NEXT_SHARP_PATH` del
`Dockerfile`; `require("sharp")` resuelve por sí solo desde el standalone.

**Acción fuera del repositorio:** si el env-file de `dev`, `qa` o `prod` (por
defecto `/srv/easycredit-admin/config/.env`) todavía define
`NEXT_SHARP_PATH=/tmp/node_modules/sharp`, hay que quitar esa línea; de lo
contrario el aviso persistirá aunque la imagen sea correcta. No pude verificar
ese archivo desde aquí: validarlo en `dev` antes de promover.

## Flujo del `Jenkinsfile`

| Stage                            | Cuándo corre               |
| -------------------------------- | -------------------------- |
| Checkout & Initial Configuration | siempre                    |
| 🧪 Install & Unit Testing        | solo en PR hacia `develop` |
| 📊 Quality SonarQube             | solo en PR hacia `develop` |
| 🐳 Build and push docker image   | `develop` o `qa`, sin PR   |
| 🚀 Deploy to instances Web (SSH) | `develop` o `qa`, sin PR   |

-  El stage `Install dependencies` se fusionó con `Unit Testing`: un solo
   contenedor `node:22-alpine` provisiona pnpm una vez (Corepack), instala con
   `pnpm install --frozen-lockfile` y ejecuta `pnpm run test`.
-  Ya no se instala nada en `develop`/`qa` sin PR: allí solo se construye la imagen
   y el `docker build` instala las dependencias dentro de la imagen
   (`.dockerignore` excluye `node_modules`).
-  Build, push, despliegue por SSH, correo, credenciales y timeouts no cambiaron.

## Validación local

`docker compose -f compose.local.yml build` y arrancar el contenedor:

-  `/` responde 307 (redirección a login); `/logo_black.png` responde 200.
-  `/_next/image?url=%2Flogo_black.png&w=256&q=75` responde 200 (`image/png`, o
   `image/webp` con `Accept: image/webp`), sin mensajes de `sharp` en los logs.
-  El proceso corre como `user_easyfront` y escucha en el 3001.
-  `node -r newrelic server.js` arranca sin `Cannot find module 'newrelic'` con
   `NEW_RELIC_ENABLED=true` (clave de prueba) y con `false`. `@newrelic/native-metrics`
   y `fn-inspect` no tienen binario para musl (igual que antes): se registra un aviso
   y el agente funciona.
-  `pnpm install --frozen-lockfile` y `pnpm run test` (189 suites, 2520 pruebas) pasan
   sin cambios en `pnpm-lock.yaml`.
