# EasyCredit WEB #

Para ejecutar esta copia aislada con Docker y pnpm, consulta la
[guía de migración y validación local](docs/pnpm-migration.md). Consulta también la [imagen Docker y el Jenkinsfile](docs/docker-image.md), el [traslado a src](docs/src-migration.md), la [revisión de pruebas](docs/testing-review.md) y el [plan de migración de Pages Router a App Router](docs/routes-migration.md).

*Readme v1.0.2*

¡Bienvenido a **EasyCredit WEB**! Aquí encontrarás todo lo relacionado con el proyecto frontend de EasyCredit. El lockfile fija **Next.js version 14.2.28**.

> ## Requerimientos ##

|         | Recomendado     | 
| ------  | --------------- |
| NodeJS  | 22.13.0 o mayor (22.x recomendado; 24.x compatible) |
| pnpm    | 12.5.1 (fijado en package.json)  |

---

> ## Quicksetup ##

Para fines de desarrollo, primero clona el proyecto desde este mismo repositorio, posteriormente ve a la rama `develop` y asegúrese de tener los últimos cambios. Luego sigue los siguientes pasos:

1. Instalar pnpm 12.5.1 con Corepack siguiendo la guía de migración en `docs/pnpm-migration.md`. Después instalar las dependencias del proyecto:

```
pnpm install --frozen-lockfile
```

1. Para conectarse a un backend autorizado, crear `.env.local` copiando `.env.template` y solicitar los valores al líder técnico. La prueba Docker aislada descrita en la guía no requiere este paso.

```
MY_VARIABLE=value
```

Para más información, visita la sección **Variables de ambiente** de este README.
El archivo `.env.local` es ignorado por defecto por el archivo _.gitignore_.

> `¡Super importante!`
>
> Las llaves, secretos o credenciales no deben subirse al repositorio del proyecto. Guardalas de manera segura.

>### Develop ###

 Inicia la aplicación en modo de desarrollo.

```
pnpm run dev
```

> ### Build ###

Construye el proyecto de la siguiente manera.

```
pnpm run build
```

>### Start ###

Inicia la aplicación en modo producción.

```
pnpm run start
```

>### Test ###

Ejecuta las pruebas unitarias.

```
pnpm run test
```
---

>## Stack de tecnologías ##

>### [Next.JS](https://nextjs.org/docs/14/getting-started) ###

Next.js es un framework de React para crear aplicaciones web integrales. Se utilizan componentes de React para crear interfaces de usuario y Next.js para funciones y optimizaciones adicionales.

**Características:**

-  **[Enrutamiento](https://nextjs.org/docs/app/building-your-application/routing)**: un sistema de enrutamiento por archivos construído sobre componentes de servidor (React) que tiene soporte para layouts, rutas anidadas, manejo de errores, etc.
-  **[Renderizado](https://nextjs.org/docs/app/building-your-application/rendering)**: capacidad para renderizar componentes del lado del servidor.
-  **[Obtención de datos](https://nextjs.org/docs/app/building-your-application/data-fetching)**: obtención de datos de forma simple utilizando async/await en componentes de servidor, así como capacidad de "memoization" y cache.
-  **[Estilos](https://nextjs.org/docs/app/building-your-application/styling)**: soporte para diferentes métodos de estilos como CSS Modules, Tailwind CSS y CSS-in-JS.
-  **[Optimizaciones](https://nextjs.org/docs/app/building-your-application/optimizing)**: optimización de imágenes, fuentes y scripts que ayudan a mejorar la experiencia de usuario.

> ### [React](https://es.react.dev/) ###

Librería para crear interfaces de aplicaciones web.

**Características:**

-  Utiliza una estructura con base en componentes.
-  Mejora la eficiencia de la aplicación utilizando un DOM virtual para actualizar solo los elementos que cambian.

> ### [Tailwind CSS](https://tailwindcss.com/) ###

Framework que se utiliza para aplicar estilos en la aplicación.

**Características:**

-  No require crear nombres de clases personalizados.
-  Solo se carga los estilos que se utilizan en la aplicación.

> ### Node.js ###

Node.js es un entorno en tiempo de ejecución multiplataforma, de código abierto, para la capa del servidor (pero no limitándose a ello) basado en el lenguaje de programación JavaScript, asíncrono, con E/S de datos en una arquitectura orientada a eventos y basado en el motor V8 de Google.
La Fundación OpenJS proporciona apoyo para el proyecto.

> ### Librerías y plugins ###

- **[axios (v^1.2.5)](https://axios-http.com)**: cliente HTTP para browser y node basado en promesas.
- **[crypto-js (v4.2.0)](https://github.com/brix/crypto-js)**: permite encriptar cadenas, utiliza el módulo nativo de Crypto.
- **[dayjs (v^1.11.7)](https://day.js.org/)**: librería sencilla para manipular y mostrar fechas.
- **[decimal.js (v^10.4.3)](https://github.com/MikeMcl/decimal.js#readme)**: realiza operaciones con punto decimal de forma precisa.
- **[dotenv (v^16.4.2)](https://github.com/motdotla/dotenv#readme)**: módulo para cargar varibles de ambiente desde un archivo.
- **[html-react-parser (v^5.0.6)](https://github.com/remarkablemark/html-react-parser#readme)**: convierte cadenas de html en componentes de React.
- **[immer (v^10.0.3)](https://github.com/immerjs/immer#readme)**: ayuda a trabajar con objetos inmutables de forma sencilla.
- **[lodash (v^4.17.21)](https://lodash.com/)**: librería con funciones útiles.
- **[material-symbols (v^0.4.4)](https://marella.me/material-symbols/demo/)**: librería de íconos.
- **[next-auth (v^4.22.1)](https://next-auth.js.org/)**: librería que facilita la implementación de autenticación en aplicaciones de NextJS.
- **[react-hook-form (v^7.43.9)](https://www.react-hook-form.com/)**: librería que facilita el manejo de formularios en React.
- **[react-number-format (v^5.3.1)](https://github.com/s-yadav/react-number-format#readme)**: librería que facilita la creación y manipulación de inputs numéricos.
- **[sharp (v^0.32.1)](https://sharp.pixelplumbing.com/)**: modifica el tamaño de imágenes de forma eficiente.
- **[sweetalert2 (v^11.4.8)](https://sweetalert2.github.io/)**: librería para mostrar alertas tipo pop-up.
- **[yup (v^1.0.2)](https://github.com/jquense/yup)**: validador de esquemas de objetos.
- **[postcss (v^8.4.21)](https://postcss.org/)**: Agrega prefijos de vendors a las reglas de CSS.
- **[prettier (v^2.8.4)](https://prettier.io/)**: plugin para dar formato al código de forma automática.
- **[tailwindcss (v^3.2.4)](https://tailwindcss.com/)**: un framework CSS con utilidades para crear rápidamente sitios web modernos sin abandonar nunca el HTML.

---

> ## Estructura del proyecto ##

El código de aplicación, middleware, pruebas y mocks se encuentran en `src/`. `public/`, `docs/` y la configuración permanecen en la raíz.

* #### Components ####
    Componentes globales usados en toda la aplicación
  - **CheckList**
  - **Controls**
  - **Cover**
  - **GeneralInformation**
  - **History**
  - **ItemRequest**
  - **Layouts**
  - **Modal**
  - **PCD**
  - **PropertyVerification**
  - **Requests**
  - **SideMenu**
  - **Skeletons**
  - **SVG**
  - **Tables**
  - **UI**

* #### Context ####
  Archivos que componen el estado global de la aplicación.

* #### Helpers ####
  Funciones que se utilizan para realizar cálculos así como constantes.
  - **calculates**: Funciones para hacer cálculos.
  - **config**: Constantes usadas en la aplicación.
  - **initials**: Valores usados para inicializar páginas.

* #### Hooks ####
   Funciones que permiten reutilizar funcionalidades en diferentes componentes.

* #### Pages ####
   Componentes que son tratados como páginas, subcarpetas se traducen en direcciones en el el path de la url.
   -  **api**: Define la autenticación y métodos para solicitar datos.

* #### Public ####
   Assets que se utilizan en la aplicación como imágenes o fuentes.

   -  **flags**: Imágenes de banderas
   -  **fonts**: Archivos de fuentes (text)
   -  **icons**: Archivos de iconos 
   -  **pictures**: Otras imágenes

* #### services ####
    Funciones para envíar peticiones HTTP.

* #### styles ####
    Archivos con estilos globales.

* #### \_\_tests\_\_ ###
    Pruebas unitarias.

> ### Nombramiento de los archivos ###
Para el nombramiento o estandares de desarrollo, revisa la guía que tenemos preparada en nuestro apartado de Confluence [Estándar de desarrollo WEB](https://bancobase.atlassian.net/wiki/spaces/Easycredit/pages/790659085/Est+ndar+de+desarrollo+Web)

---

> ## Seguridad ##
> ### NextAuth ###
* Se utiliza [NextAuth](https://next-auth.js.org/getting-started/introduction) para implementar la autenticación de los usuarios de EasyCredit. Actualmente se cuenta como único proveedor el back-end de EasyCredit.
* La configuración se encuentra en el archivo **src/pages/api/auth/[...nextauth].js**

> ### SonarQube ###
Utilizamos SonarQube para detectar vulnerabilidades en el código de forma automatizada.

---

> ## Variables de ambiente ##
Las variables de ambiente se encuentran en el archivo **.env.local** y se cargan automáticamente en el objeto **process.env** al iniciar la aplicación.

> ### NEXT_PUBLIC_API_URL ###
URL de EasyCredit API (back-end).
> ### NEXTAUTH_URL ###
Url del servidor de pruebas.
> ### NEXT_PUBLIC_APP_NAME ###
Se utiliza como parte de los request al back-end para identificar qué aplicación envía los request.
> ### NEXT_PUBLIC_ACTIVE_ISILOANS ###
Permite activar o desactivar la consulta al servicio de Isiloans, solo debe ser utilizada en ambiente `local`.
> ### NEXTAUTH_SECRET ###
Se utiliza como parte de la configuración de NextJS para obtener la sesión del usuario.
> ### NEXT_SECRET_CLIENT ###
Se utiliza para obtener el token de autorización de la API del back-end.
> ### NEXT_SECRET_ID ###
Se utiliza para obtener el token de autorización de la API del back-end.
> ### NEW_RELIC_APP_NAME ###
Se utiliza para definir el nombre con el que se rastreara el aplicativo en New Relic.
> ### NEW_RELIC_LICENSE_KEY ###
Se utiliza para indicar la licencia para conectarse a new relic
> ### NEW_RELIC_PROXY_URL ###
Dirección IP del proxy para conectarse a new relic
> ### NODE_TLS_REJECT_UNAUTHORIZED ###
Permite lanzar peticiones a url HTTP

---

> ## Mecanismo de despliegue ##

La aplicación cuenta con `CI/CD` atraves de Jenkins donde se tiene configurado un **Pipeline Multibranch** que ya contempla los ambientes **develop** y **stage**, de momento para producción se realiza de forma manual
y puedes consultar la [guía aquí](https://bancobase.atlassian.net/wiki/spaces/Easycredit/pages/790069316/Despliegue+manual+de+Easycredit).

El resultado del mecanismo de despliegue resulta en las siguientes la ejecucion de la aplicacion en las siguiente urls:

- [DEV](http://dev-easycredit.bancobase.net/)
- [STG](http://qa-easycredit.bancobase.net/)
- [PROD](http://easycredit.bancobase.net/)

---
>### Pruebas Unitarias ###

Las pruebas unitarias se ubican en `src/__tests__` y se construyen utilizando **Jest** + **React Testing Library**.
Se crea un archivo de pruebas por cada componente, página, servicio u otro archivo que se vaya a probar, siguiendo la misma estructura de carpetas:

-  src/components/
   -  Button/
      -  index.jsx
-  src/__tests__/
   -  src/components/
      -  Button/
         -  index.test.jsx

**jest.config.js**: Este archivo contiene la configuración general de Jest, así como la configuración específica para integrar con NextJS.
**jest.setup.js**: Este archivo se carga para cada archivo de pruebas y su función es la de ejecutar código que sea requerido por todos los tests.

Para saver más puedes leer nuestra [guía acá](https://bancobase.atlassian.net/wiki/spaces/Easycredit/pages/798064678/Unit+Testing)

> ## Referencias ##
Aqui se ponen las ligas a documentacion relevantes a la aplicacion.
-  [NodeJS](https://nodejs.org/en) - Sitio oficial de Nodejs.
-  [NextJS](https://nextjs.org/) - Sitio oficial de NextJS.
-  [React](https://react.dev/learn) - Sitio web oficial de la documentacion de React.
-  [TailwindCSS](https://tailwindcss.com/docs/installation) - Sitio oficial de la documentación de Tailwind CSS.
-  [NPM](https://www.npmjs.com/) - Sitio oficial de paquetes de NodeJS.

