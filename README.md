# Aprende Jugando (EduGames Hub)

Aplicación de escritorio offline con juegos educativos para primaria, construida con Electron, HTML, CSS y JavaScript modular. Ver [`AGENTS.md`](AGENTS.md) y [`docs/`](docs) para el contexto completo del producto y la arquitectura.

Este repositorio contiene el **MVP completo** (ver `docs/MVP.md`): procesos de Electron configurados de forma segura, base de datos SQLite con migraciones versionadas, gestión de estudiantes y actividades, un juego de selección múltiple jugable de punta a punta, persistencia de sesiones/progreso, preferencias locales de sonido/pantalla, un panel de Inicio con indicadores reales, y un paquete distribuible para Windows x64.

## Cómo ejecutar la aplicación

La aplicación **no es una página web suelta**: nunca abras `src/renderer/index.html` con doble clic ni en un navegador. Debe iniciarse siempre con:

```bash
npm start
```

Esto lanza el proceso principal de Electron, que crea la ventana con el `preload` correcto (ahí se expone `window.learningAPI`) y carga el renderer **dentro** de esa ventana. Abrir el HTML directamente en un navegador no tiene proceso principal, ni `preload`, ni SQLite, ni IPC — por eso fallaría cualquier acción que dependa de `window.learningAPI` (por ejemplo, crear un estudiante).

## Requisitos

* Node.js 24.x y npm.
* Windows x64 (primera plataforma objetivo, ver `docs/DECISIONS.md` ADR-014).

No se requiere instalar SQLite, Python ni un entorno de compilación C++: `better-sqlite3` se instala usando binarios precompilados (ver "Notas sobre `better-sqlite3`" más abajo).

## Instalación

```bash
git clone <url-del-repositorio>
cd edugames-hub
npm install
```

## Comandos

```bash
npm test        # Ejecuta las pruebas (node --test)
npm run lint     # No hay linter configurado todavía (ver docs/DECISIONS.md)
npm start        # Inicia la aplicación en modo desarrollo (electron-forge start)
npm run package  # Empaqueta la aplicación sin generar instalador
npm run make     # Genera el instalador/paquete para Windows x64
```

### Orden recomendado

Ejecuta `npm test` **antes** de `npm start` (ver la nota sobre ABI de `better-sqlite3` a continuación). Si ya ejecutaste `npm start` y luego `npm test` falla con un error de tipo `NODE_MODULE_VERSION` / "was compiled against a different Node.js version", corre:

```bash
npm rebuild better-sqlite3
```

para recompilar el módulo nativo contra el Node.js del sistema antes de volver a probar.

A la inversa: si acabas de correr `npm rebuild better-sqlite3` y luego `npm start` falla con el mismo tipo de error dentro de la app (Electron Forge no siempre detecta que hace falta reconstruir de nuevo para su propio ABI), fuerza la reconstrucción explícitamente:

```bash
npx @electron/rebuild -f -w better-sqlite3 -v 42.7.0
```

(usa la misma versión de `electron` que figura en `package.json`).

## Notas sobre `better-sqlite3`

* `better-sqlite3` es un módulo nativo. Se instala usando binarios precompilados publicados por el propio proyecto (vía `prebuild-install`), sin necesidad de Visual Studio ni Python en la máquina del docente.
* La versión de Electron queda **fijada** en `package.json` (actualmente `42.7.0`) a una que coincide con un binario precompilado (`electron-vNNN`) publicado por `better-sqlite3`. Si se actualiza Electron, verifica primero que exista un prebuild de `better-sqlite3` para el nuevo ABI (`node-abi` permite calcularlo) antes de actualizar, o el arranque de la app fallará al intentar compilar desde el código fuente. Ver `docs/DECISIONS.md`.
* Al ejecutar `npm start`/`npm run package`/`npm run make`, Electron Forge recompila (o redescarga el binario precompilado de) `better-sqlite3` para el ABI de Electron. Esto reemplaza el binario que `npm install` había preparado para el Node.js del sistema, por lo que las pruebas (`npm test`, que corren bajo Node.js normal) pueden dejar de funcionar hasta correr `npm rebuild better-sqlite3`.

## Estructura del proyecto

```text
edugames-hub/
├── AGENTS.md              # Reglas del proyecto para el agente/equipo
├── README.md
├── LICENSE
├── package.json
├── forge.config.js
├── docs/                  # Especificación del producto y decisiones tomadas
│   ├── PRODUCT.md
│   ├── MVP.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   └── DECISIONS.md       # Registro de ADRs: decisiones y desviaciones frente a la especificación
├── src/
│   ├── main/              # Proceso principal de Electron
│   │   ├── database/      # Conexión, migraciones y repositorios (SQLite)
│   │   ├── ipc/            # Handlers IPC validados por entidad
│   │   └── services/      # Lógica de negocio que coordina repositorios
│   ├── preload/           # Puente contextBridge (window.learningAPI)
│   ├── renderer/          # UI: páginas, servicios de renderer, router en memoria, estilos
│   ├── games/             # Motores de juego, independientes de Electron
│   │   ├── core/           # Contrato de motor, puntuación, sesión de juego
│   │   └── engines/        # Motores concretos (selección múltiple)
│   └── shared/             # Validadores, constantes de canales IPC y errores compartidos
└── tests/                 # node:test — unitarias e integración
    ├── unit/
    └── integration/
```

Esta es la estructura real del código (ver ADR-021 a ADR-029 en `docs/DECISIONS.md` para las decisiones que la fueron moldeando); la carpeta "Estructura propuesta" de `docs/ARCHITECTURE.md` es la especificación original y puede diferir en detalles menores (por ejemplo, no existen `src/assets/` ni `src/renderer/components/` porque el MVP no los necesitó todavía).

## Base de datos y migraciones

* La base SQLite se crea en `app.getPath("userData")` (nunca dentro de `src`, `resources`, `app.asar` o la carpeta de instalación).
* El esquema se aplica mediante migraciones versionadas (`src/main/database/migrations/`). Cada migración se ejecuta en una transacción y se registra en la tabla `schema_migrations`; nunca se vuelve a ejecutar ni se modifica una migración ya publicada.
* En modo desarrollo (`!app.isPackaged`), si las tablas están vacías, se insertan datos demostrativos: dos estudiantes (sufijo `(demo)`) y ocho actividades de selección múltiple (`source: 'system'`, asignaturas "Matemáticas" y "Español").

## Estado del panel docente

* **Estudiantes**: funcional (crear, editar, listar, activar/desactivar).
* **Actividades**: funcional, solo tipo selección múltiple (crear, editar, duplicar, listar, activar/desactivar, filtrar por grado y por asignatura). Eliminar con confirmación y filtros por tema/tipo quedan diferidos (ver ADR-023 en `docs/DECISIONS.md`).
* **Juegos**: funcional. Flujo: elegir estudiante activo → elegir asignatura (banco de preguntas apropiado para su grado) → jugar la secuencia de selección múltiple (instrucciones, pregunta, retroalimentación, contador de preguntas) → pantalla de resultado con puntuación. Cada partida se guarda como sesión (`sessions:start`/`sessions:finish`) y actualiza el progreso acumulado del estudiante, incluidas las partidas abandonadas antes de terminar (ver ADR-026).
* **Progreso**: funcional. Elige un estudiante (activo o inactivo) y muestra su progreso acumulado (mejor puntaje, sesiones totales, aciertos/errores totales, última vez jugado) y el historial de cada sesión (fecha, correctas, incorrectas, puntuación, % de aciertos, duración, estado).
* **Configuración**: funcional. Activar/desactivar sonido, ajustar volumen de música y efectos, elegir modo de pantalla (ventana/pantalla completa, aplicado de verdad sobre la ventana), y consultar la versión de la app y la ubicación de los datos. Se guarda en `localStorage`, no en SQLite (ver ADR-027 en `docs/DECISIONS.md`).
* **Inicio**: funcional. Muestra estudiantes registrados, actividades disponibles, sesiones realizadas y el promedio general de aciertos — datos reales, no demostrativos (ver ADR-028).

## Motores de juego (`src/games/`)

* `src/games/core/`: lógica de dominio reutilizable e independiente de Electron (`score-manager.js`, `game-session.js`, y el contrato documentado en `game-engine.js`). Se cargan tanto en el renderer (`<script>` clásico, se adjuntan a `window.GameCore`) como en las pruebas (`require()` bajo Node) gracias a un patrón de doble exportación mínimo (ver ADR-025).
* `src/games/engines/multiple-choice/`: el motor de selección múltiple (`index.js`, adjunto a `window.GameEngines.multipleChoice`), sus estilos propios y un `manifest.json` describiéndolo. No usa `ipcRenderer` ni `require('electron')`: recibe el estudiante y las actividades ya cargadas por `games-page.js` a través de `initialize(config)`.

## Pruebas

Las pruebas usan el test runner integrado de Node.js (`node:test`), sin dependencias adicionales:

* `tests/unit/validators/`: validación de datos de estudiantes y de actividades (incluye las reglas de selección múltiple).
* `tests/unit/database/`: runner de migraciones (aplicación, idempotencia, actualización incremental, rollback transaccional ante error).
* `tests/integration/`: repositorios de estudiantes, actividades, sesiones y progreso; el servicio `finishSession` (coordinación transaccional); creación del esquema completo sobre una base SQLite en memoria.
* `tests/unit/games/`: lógica de puntuación y de sesión de juego (`score-manager.js`, `game-session.js`).

## Distribución (Corte 5)

```bash
npm run package  # out/Aprende Jugando-win32-x64/Aprende Jugando.exe (sin instalador)
npm run make     # out/make/squirrel.windows/x64/Aprende Jugando-0.1.0 Setup.exe
                 # out/make/zip/win32/x64/Aprende Jugando-win32-x64-0.1.0.zip
```

Ambos comandos se ejecutaron y se verificaron manualmente (ver ADR-029 en `docs/DECISIONS.md`):

* El instalador Squirrel (`Setup.exe`) se ejecutó de verdad: instala en `%LocalAppData%\edugames_hub\` y crea un acceso directo en el menú Inicio.
* **Instalación limpia:** con la carpeta `userData` ausente, la app arranca con la base de datos vacía y sin datos demostrativos (por estar `app.isPackaged`); se creó un estudiante de prueba y se confirmó que persistía tras reiniciar la app.
* **Conservación de datos:** se ejecutó el instalador Squirrel contra una carpeta `userData` con datos preexistentes y se confirmó que no los borra ni los reinicia (el panel de Inicio mostró los indicadores calculados sobre esos datos ya existentes).
* No se requiere instalar SQLite, Python ni Node.js en la máquina destino: `better-sqlite3` viaja empacado con su binario precompilado dentro de `resources/app.asar.unpacked/`.

## Limitaciones conocidas

* No hay linter configurado (`npm run lint` es un no-op) para mantener las dependencias al mínimo (ADR-009 en `docs/DECISIONS.md`).
* El banco de actividades no incluye eliminación definitiva ni filtros por tema/tipo (ver ADR-023).
* No hay límite de tiempo por pregunta ni reproducción de audio real todavía (el volumen/sonido en Configuración son preferencias guardadas, sin un motor de audio ni assets de sonido detrás).
* `current_level` en el progreso queda fijo en 1: todavía no hay una regla de niveles definida (ver ADR-026). Las sesiones abandonadas registran duración `0` (no se mide el tiempo exacto hasta el abandono).
* El instalador no está firmado digitalmente (code signing) y no se probó el flujo de actualización automática de Squirrel (requeriría un servidor de actualizaciones).
* La prueba de "instalación limpia" se simuló moviendo la carpeta `userData`, no en una máquina Windows separada sin herramientas de desarrollo preinstaladas.

## Licencia

MIT — ver [`LICENSE`](LICENSE).
