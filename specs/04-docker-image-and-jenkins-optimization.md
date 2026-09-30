# SPEC 04 — Optimización de la imagen Docker y del Jenkinsfile

> **Status:** Implementado  
> **Depends on:** ninguna (ajusta el trabajo de migración a pnpm descrito en `docs/pnpm-migration.md`)  
> **Date:** 2026-09-29  
> **Objective:** Reducir la imagen Docker de producción de ~1 GB a ≤ 420 MB (medido con `docker images` de Docker Desktop; ~321 MB descomprimidos) copiando solo New Relic y sus dependencias sobre el `standalone` de Next, resolver el aviso de `sharp` en despliegue y simplificar el `Jenkinsfile` usando Corepack y eliminando el stage de instalación redundante en las ramas de build.

## Por qué existe esta spec

La migración de npm a pnpm dejó un `Dockerfile` que prioriza reproducibilidad sobre tamaño (lo dice `docs/pnpm-migration.md`): la etapa `runner` copia el `.next/standalone` (que ya trae su `node_modules` trazado por Next) y encima copia el `node_modules` completo de producción generado por `pnpm install --prod`, con los enlaces simbólicos de pnpm. El resultado duplica `next`, `react`, `sharp`, `newrelic` y sus dependencias nativas, y la imagen llega a ~1 GB. `Dockerfile.old` solo añadía `newrelic` (~100 MB) sobre el standalone.

Hallazgos adicionales que motivan la spec:

- New Relic está externalizado (`serverComponentsExternalPackages: ['newrelic']` y `newrelic/load-externals` en `next.config.js`), por lo que el tracing de standalone no lo incluye; es la única razón por la que se copia el grafo completo.
- Al desplegar aparece un aviso de Next indicando que se instale `sharp`, aunque está en `dependencies` y `NEXT_SHARP_PATH=/app/node_modules/sharp` está definido. `sharp` se usa: hay `next/image` en varios componentes (`SideCover`, `IconResult`, etc.).
- En `Jenkinsfile`, el stage `Install dependencies` corre también en `develop`/`qa` sin PR, donde solo se construye la imagen; el `docker build` reinstala todo dentro de la imagen y `.dockerignore` excluye `node_modules`, así que ese stage no aporta nada allí.
- `scripts/setup-pnpm.sh` (único archivo de `scripts/`) instala pnpm con `npm install --global` en cada stage; el desarrollador ya usa `corepack enable pnpm` en otro proyecto con éxito, por lo que el script y la carpeta quedan obsoletos.
- `Dockerfile.old` es una referencia histórica que nadie construye y solo se menciona en `.dockerignore` y `docs/pnpm-migration.md`.
- El daemon de Docker local ya está activo, pero no hay una imagen de la aplicación construida (solo `node:22-alpine`, `mysql` y `postgres`): el paso 1 del plan construye la línea base.

## Alcance

**Dentro:**

- Medir la línea base: tamaño de la imagen actual y de cada capa relevante (`docker images`, `docker history`).
- Reescribir la etapa `runner` de `Dockerfile` para que contenga: `.next/standalone`, `.next/static`, `public`, `newrelic.js` y **solo** `newrelic` con sus dependencias (etapa de instalación aislada), sin duplicar el grafo completo de producción.
- Diagnosticar y resolver el aviso de `sharp` en despliegue, conservando `sharp` y la optimización de `next/image`. Ajustar `NEXT_SHARP_PATH` o la forma en que llega `sharp` a la imagen según el diagnóstico.
- Sustituir la instalación de pnpm con `npm install --global` por Corepack (`corepack enable` + `corepack prepare` con la versión de `packageManager`) en `Dockerfile` y en el `Jenkinsfile`, **inline** (sin script auxiliar).
- Eliminar lo que queda obsoleto: la carpeta `scripts/` (`setup-pnpm.sh`), `Dockerfile.old` y sus menciones en `.dockerignore`, `docs/pnpm-migration.md` y `README.md` (que cita `scripts/` en la estructura del repositorio).
- `Jenkinsfile`:
  - Quitar el stage `Install dependencies` de las ramas `develop`/`qa` sin PR; conservarlo (o fusionarlo con `Unit Testing`) donde se ejecutan pruebas y Sonar, es decir PRs hacia `develop`.
  - Evitar reinstalar pnpm en cada stage (un solo contenedor/stage para instalar y probar, o Corepack en cada uno sin descarga costosa).
- Documentación final: nuevo `docs/docker-image.md` (diseño del Dockerfile por etapas, cómo construir y medir la imagen, Corepack y `COREPACK_NPM_REGISTRY`, causa y solución del aviso de `sharp`, medidas antes/después, flujo del Jenkinsfile) y actualización de `docs/pnpm-migration.md` y `README.md` con enlaces y sin referencias a lo eliminado.

**Fuera de alcance (specs futuras):**

- Cambiar la imagen base (se mantiene `node:22-alpine`) o pasar a distroless.
- Caché de BuildKit (`--mount=type=cache`) para el store de pnpm; requiere confirmar BuildKit en el agente Jenkins.
- Quitar o reemplazar New Relic; cambiar la observabilidad.
- Cambiar versiones de dependencias, del lockfile o de `pnpm-workspace.yaml` (`allowBuilds`, `strictDepBuilds`).
- Cambios en el stage de despliegue por SSH, credenciales, registro Nexus o condiciones de ramas del pipeline (salvo el `when` del stage de instalación).
- Cambiar `docker-compose.yml` o `compose.local.yml`, salvo que el nuevo Dockerfile lo exija.

## Modelo de datos

Esta spec no introduce estructuras de datos. Modifica archivos de infraestructura: `Dockerfile`, `.dockerignore`, `Jenkinsfile`, `docs/pnpm-migration.md` y `README.md`; añade `docs/docker-image.md`; elimina `scripts/setup-pnpm.sh` (y con él la carpeta `scripts/`) y `Dockerfile.old`.

## Plan de implementación

Cada paso deja el sistema construible; los pasos 1 y 7 requieren el daemon de Docker activo.

1. **Línea base.** Docker ya está activo: `docker compose -f compose.local.yml build` y registrar `docker images` y `docker history` de `gfb-easycredit-web:pnpm-local` en `.migration/` (archivo excluido de Git). Anotar además el tamaño de `.next/standalone/node_modules` y del `node_modules` de producción.
2. **Diagnóstico de sharp.** En el contenedor de la línea base, reproducir el aviso (`docker run` + una petición a `/_next/image`) y verificar si `sharp` se resuelve: `node -e "require(process.env.NEXT_SHARP_PATH)"` y contenido de `.next/standalone/node_modules`. Registrar la causa (p. ej. ruta simbólica de pnpm inexistente en el nuevo runner, binario `@img/sharp-linuxmusl-x64` ausente o `NEXT_SHARP_PATH` mal apuntado).
3. **Etapa aislada de New Relic.** Añadir en `Dockerfile` una etapa que instale solo `newrelic` con la versión fijada en `pnpm-lock.yaml` (por ejemplo `pnpm deploy --filter` o un install aislado con el lockfile) y produzca un `node_modules` sin enlaces simbólicos rotos. Sustituir `production-deps` por esta etapa.
4. **Runner mínimo.** Reescribir `runner` para copiar standalone, static, public, `newrelic.js` y el `node_modules` de New Relic (superpuesto sin pisar el trazado de standalone). Aplicar la corrección de `sharp` según el paso 2. Mantener usuario no root, `PORT`, `HOSTNAME`, `TZ` y `CMD ["node", "-r", "newrelic", "server.js"]`.
5. **Corepack.** Reemplazar `npm install --global "$(... packageManager)"` por `corepack enable` y `corepack prepare "$(node -p ...)" --activate` en `Dockerfile`, y usar el mismo comando en el `Jenkinsfile` (paso 6); conservar la validación de que `packageManager` empiece por `pnpm@`. Documentar `COREPACK_NPM_REGISTRY` para el registro corporativo si el agente no alcanza npmjs.
6. **Jenkinsfile.** Ajustar el `when` del stage `Install dependencies` para que solo corra en `changeRequest target: 'develop'`, y fusionarlo con `Unit Testing` (o compartir el contenedor) para no aprovisionar pnpm dos veces. Sustituir las dos llamadas a `sh scripts/setup-pnpm.sh` por Corepack inline. Mantener intactos build, push, despliegue, correo y timeouts.
7. **Validación.** Construir con `compose.local.yml`, medir `docker images` y comparar con la línea base; arrancar el contenedor y comprobar `/`, un recurso de `public` y `/_next/image` sin avisos de `sharp`; confirmar que el agente New Relic carga (`NEW_RELIC_ENABLED=true` con una clave de prueba y sin errores de `require('newrelic')`).
8. **Limpieza.** Eliminar `scripts/` y `Dockerfile.old`; quitar `Dockerfile.old` de `.dockerignore` y las menciones a ambos en `docs/` y `README.md` (`grep` sin resultados).
9. **Documentación final.** Crear `docs/docker-image.md` con el contenido descrito en el alcance; actualizar `docs/pnpm-migration.md` (decisiones, medidas antes/después, retirar "prioriza un arranque reproducible sobre minimizar el tamaño de imagen" y la nota sobre `Dockerfile.old`) y enlazar la nueva guía desde `README.md`.

## Criterios de aceptación

- [ ] La línea base (tamaño total y por capa) está registrada en `.migration/` antes de modificar el `Dockerfile`.
- [ ] `docker images gfb-easycredit-web` muestra un tamaño ≤ 420 MB (417 MB medidos; DISK USAGE de Docker Desktop suma contenido descomprimido y comprimido) para la imagen construida con `compose.local.yml`.
- [ ] La imagen final no contiene el `node_modules` completo de producción: `docker run --rm <img> ls node_modules` muestra `newrelic` y sus dependencias, y `next` aparece solo dentro del trazado de standalone (sin `.pnpm` duplicado de `next`/`react`).
- [ ] El contenedor arranca como `user_easyfront` (UID 1001) y escucha en el puerto 3001.
- [ ] Una petición a `/_next/image?url=...&w=...&q=75` devuelve 200 y los logs del contenedor no contienen el aviso que pide instalar `sharp`.
- [ ] `node -r newrelic server.js` inicia sin `Cannot find module 'newrelic'` con `NEW_RELIC_ENABLED=true` y con `false`.
- [ ] Ni `Dockerfile` ni `Jenkinsfile` ejecutan `npm install --global` de pnpm; usan Corepack con la versión de `packageManager`.
- [ ] `scripts/` y `Dockerfile.old` no existen y `grep -rn "setup-pnpm|Dockerfile.old" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.migration --exclude-dir=specs` no devuelve resultados.
- [ ] En el `Jenkinsfile`, el stage de instalación no se ejecuta en `develop`/`qa` sin PR, y se ejecuta en PRs hacia `develop`; el stage de build de imagen y de despliegue conservan sus condiciones originales.
- [ ] En un PR hacia `develop`, pnpm se aprovisiona una sola vez antes de instalar y probar.
- [ ] `pnpm install --frozen-lockfile` y `pnpm run test` siguen pasando sin cambios en `pnpm-lock.yaml`.
- [ ] `docs/docker-image.md` existe, incluye las medidas antes/después y el diagnóstico de `sharp`, y está enlazado desde `README.md`.
- [ ] `docs/pnpm-migration.md` refleja el nuevo diseño y ya no dice que se prioriza reproducibilidad sobre tamaño.

## Decisiones tomadas y descartadas

- **Solo `newrelic` + dependencias sobre standalone (elegida)** frente a podar el grafo completo de producción: elimina la duplicación de raíz, en lugar de mitigarla.
- **Conservar `sharp`, no eliminarlo (elegida por el usuario):** `next/image` se usa y el fallback WASM es más lento; el aviso se trata como defecto a corregir, no como motivo para quitar la dependencia.
- **Corepack en lugar de `npm install -g pnpm` (elegida por el usuario):** evita instalar pnpm con otro gestor; ya funciona en otro proyecto del usuario. Requiere que el agente alcance el registro de paquetes (mitigado con `COREPACK_NPM_REGISTRY`).
- **Quitar `Install dependencies` de las ramas de build (elegida):** el `docker build` reinstala dentro de la imagen; conservarlo solo desperdicia tiempo dentro del límite de 15 minutos.
- **Meta ≤ 420 MB medida con `docker images` (elegida por el usuario tras medir 417 MB; la meta inicial era 400 MB):** realista con alpine + standalone + New Relic; una meta de 250 MB obligaría a quitar `sharp` o podar New Relic, contrario a lo decidido.
- **Eliminar `scripts/` y `Dockerfile.old` (decisión del usuario):** con Corepack inline el script no aporta nada y `Dockerfile.old` es referencia histórica; el historial de Git los conserva.
- **Descartado:** caché de BuildKit, cambio de imagen base y retirada de New Relic (ver "Fuera de alcance").

## Riesgos identificados

- **Docker no disponible al inicio:** sin daemon no hay línea base ni validación; los pasos 1 y 7 se detienen hasta activarlo.
- **Dependencias nativas de New Relic** (`@newrelic/native-metrics`, `@newrelic/fn-inspect`): al aislar la instalación pueden faltar binarios para musl o los scripts permitidos en `allowBuilds`; se valida arrancando con `NEW_RELIC_ENABLED=true`.
- **Enlaces simbólicos de pnpm:** copiar solo parte del grafo puede dejar enlaces rotos; por eso la etapa aislada debe producir un `node_modules` autocontenido y verificado con `require`.
- **Jenkins sin script compartido:** el comando de Corepack se repite en el `Jenkinsfile`; se acepta a cambio de no mantener una carpeta de un solo archivo (se mitiga fusionando Install y Test en un solo stage).
- **Corepack en red corporativa:** descargar pnpm exige acceso al registro; si falla, el build de Jenkins no arranca. Se documenta la variable de registro y se prueba en el pipeline real.
- **Causa de `sharp` no reproducible localmente:** el aviso ocurre en despliegue; si el paso 2 no lo reproduce, se registra la evidencia y se valida en el ambiente `dev` antes de promover.

## Qué **no** está en esta spec

- Caché de BuildKit, imagen base distinta, distroless o multi-arquitectura.
- Reemplazo o eliminación de New Relic.
- Cambios de dependencias, lockfile o `pnpm-workspace.yaml`.
- Cambios en despliegue SSH, credenciales, Nexus, Sonar o notificaciones del pipeline.
