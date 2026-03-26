# AWS-Client

Cliente AWS S3 para dispositivos móviles Android, construido con SolidJS y Capacitor. Permite ver, cargar, eliminar y mover archivos en un bucket de Amazon S3 directamente desde tu dispositivo.

## ⚠️ Aviso de seguridad sobre credenciales

> **Las credenciales de AWS (Access Key ID y Secret Access Key) se guardan localmente en el dispositivo donde se instala esta aplicación.**
>
> - **El usuario es el único responsable** de la seguridad de sus credenciales.
> - No compartas el dispositivo con personas no autorizadas.
> - Se recomienda usar **IAM credentials con permisos mínimos** (sólo las acciones de S3 necesarias) y **nunca** las credenciales de root de la cuenta AWS.
> - Esta aplicación **no utiliza ninguna base de datos ni servicio externo** para almacenar, transmitir o procesar credenciales. Toda la información queda exclusivamente en el dispositivo.
> - Si pierdes el control del dispositivo, **revoca inmediatamente** las credenciales desde la consola de IAM de AWS.

## Tecnologías

- **[SolidJS](https://solidjs.com/)** — Framework frontend reactivo
- **[SUID](https://suid.io/)** — Componentes Material UI para SolidJS
- **[AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)** — Cliente oficial de AWS para JavaScript
- **[Vite](https://vitejs.dev/)** — Bundler y servidor de desarrollo
- **[Capacitor](https://capacitorjs.com/)** — Bridge para aplicaciones Android/iOS nativas
- **[TypeScript](https://www.typescriptlang.org/)** — Tipado estático
- **[ESLint](https://eslint.org/)** — Linting de código
- **[Prettier](https://prettier.io/)** — Formateo de código
- **[pnpm](https://pnpm.io/)** — Manejador de paquetes

## Requisitos previos

### Desarrollo (dentro del devContainer)

- [Docker](https://www.docker.com/) y [VS Code](https://code.visualstudio.com/) con la extensión [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- El devContainer incluye: Node.js, pnpm y Java JDK (necesario para Capacitor)

### Compilación Android (en el host)

- [Android Studio](https://developer.android.com/studio) instalado en tu máquina host
- [Android SDK](https://developer.android.com/studio#downloads) configurado
- Java JDK 17 o superior

## Configuración inicial

### 1. Abrir en devContainer

Clona el repositorio y ábrelo en VS Code. Acepta la notificación para abrir en devContainer, o ejecuta el comando `Dev Containers: Reopen in Container`.

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Iniciar servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Compilar para Android

### 1. Compilar el frontend

```bash
pnpm build
```

### 2. Sincronizar con Capacitor

```bash
pnpm cap:sync
```

### 3. Abrir en Android Studio (en el host)

Copia la carpeta `android/` a tu máquina host (si desarrollas dentro del devContainer) y ábrela con Android Studio, o ejecuta:

```bash
pnpm cap:android
```

## Scripts disponibles

| Script              | Descripción                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | Inicia el servidor de desarrollo                           |
| `pnpm build`        | Compila el proyecto para producción                        |
| `pnpm preview`      | Vista previa del build de producción                       |
| `pnpm lint`         | Ejecuta ESLint                                             |
| `pnpm lint:fix`     | Ejecuta ESLint y corrige errores automáticamente           |
| `pnpm format`       | Formatea el código con Prettier                            |
| `pnpm format:check` | Verifica el formateo con Prettier                          |
| `pnpm cap:sync`     | Sincroniza el build con los proyectos nativos de Capacitor |
| `pnpm cap:android`  | Abre el proyecto Android en Android Studio                 |

## Estructura del proyecto

```
├── .devcontainer/        # Configuración del devContainer
│   └── devcontainer.json
├── android/              # Proyecto Android (generado por Capacitor, ignorado en git)
├── src/
│   ├── App.tsx           # Componente raíz de SolidJS
│   ├── App.module.css    # Estilos del componente App
│   ├── index.tsx         # Punto de entrada
│   ├── index.css         # Estilos globales
│   └── vite-env.d.ts     # Declaraciones de tipos para Vite
├── capacitor.config.ts   # Configuración de Capacitor
├── eslint.config.js      # Configuración de ESLint
├── index.html            # HTML de entrada
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts        # Configuración de Vite
```

## Configuración de Android

Antes de compilar para Android por primera vez, ejecuta:

```bash
# Agregar la plataforma Android (solo la primera vez)
pnpm dlx cap add android

# Sincronizar assets y plugins
pnpm cap:sync
```
