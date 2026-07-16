# Arquitectura - Aprende Jugando

## Visión general

Aprende Jugando es una aplicación de escritorio offline basada en Electron.

La arquitectura debe separar claramente:

* Interfaz de usuario.
* Lógica de negocio.
* Motores de juego.
* Persistencia.
* Acceso al sistema operativo.
* Recursos locales.
* Importación y exportación.

La interfaz no debe acceder directamente a SQLite, Node.js ni al sistema de archivos.

---

## Diagrama general

```text
┌──────────────────────────────────────────────┐
│                Electron App                  │
├──────────────────────────────────────────────┤
│ Renderer                                     │
│ HTML, CSS, JavaScript                        │
│                                              │
│ - Panel docente                              │
│ - Perfiles                                   │
│ - Banco de actividades                       │
│ - Motores de juego                           │
│ - Progreso                                   │
└──────────────────────┬───────────────────────┘
                       │
                       │ window.learningAPI
                       ▼
┌──────────────────────────────────────────────┐
│ Preload                                      │
│                                              │
│ - contextBridge                              │
│ - API limitada                               │
│ - Sin lógica SQL                             │
│ - Sin acceso general a Node.js               │
└──────────────────────┬───────────────────────┘
                       │
                       │ IPC validado
                       ▼
┌──────────────────────────────────────────────┐
│ Main Process                                 │
│                                              │
│ - Ventanas                                   │
│ - IPC handlers                               │
│ - Base de datos                              │
│ - Backups                                    │
│ - Importación y exportación                  │
│ - Sistema de archivos                        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ SQLite                                       │
│                                              │
│ - Estudiantes                                │
│ - Actividades                                │
│ - Sesiones                                   │
│ - Progreso                                   │
│ - Configuración                              │
└──────────────────────────────────────────────┘
```

---

## Tecnologías iniciales

* Electron.
* Electron Forge.
* HTML.
* CSS.
* JavaScript modular.
* Node.js incorporado dentro de Electron.
* SQLite.
* `better-sqlite3`.
* API IPC.
* Recursos locales.

No se utilizarán inicialmente:

* React.
* Vue.
* Angular.
* TypeScript.
* Tailwind.
* Phaser.
* Servidor web externo.
* API remota.
* CDN.

Estas tecnologías pueden evaluarse posteriormente si existe una necesidad concreta.

---

## Estructura propuesta

```text
aprende-jugando/
├── AGENTS.md
├── README.md
├── package.json
├── forge.config.js
├── docs/
│   ├── PRODUCT.md
│   ├── MVP.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   └── DECISIONS.md
│
├── src/
│   ├── main/
│   │   ├── main.js
│   │   ├── window-manager.js
│   │   │
│   │   ├── database/
│   │   │   ├── database.js
│   │   │   ├── migration-runner.js
│   │   │   ├── migrations/
│   │   │   └── repositories/
│   │   │
│   │   ├── ipc/
│   │   │   ├── register-ipc-handlers.js
│   │   │   ├── student.handlers.js
│   │   │   ├── activity.handlers.js
│   │   │   ├── progress.handlers.js
│   │   │   └── settings.handlers.js
│   │   │
│   │   └── services/
│   │       ├── backup.service.js
│   │       ├── import.service.js
│   │       └── export.service.js
│   │
│   ├── preload/
│   │   └── preload.js
│   │
│   ├── renderer/
│   │   ├── index.html
│   │   ├── app.js
│   │   ├── router.js
│   │   ├── styles/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── students/
│   │   │   ├── activities/
│   │   │   ├── games/
│   │   │   ├── progress/
│   │   │   └── settings/
│   │   │
│   │   └── services/
│   │       ├── student.service.js
│   │       ├── activity.service.js
│   │       └── progress.service.js
│   │
│   ├── games/
│   │   ├── core/
│   │   │   ├── game-engine.js
│   │   │   ├── game-session.js
│   │   │   └── score-manager.js
│   │   │
│   │   └── engines/
│   │       └── multiple-choice/
│   │           ├── index.js
│   │           ├── styles.css
│   │           └── manifest.json
│   │
│   ├── shared/
│   │   ├── constants/
│   │   ├── validators/
│   │   ├── errors/
│   │   └── contracts/
│   │
│   └── assets/
│       ├── images/
│       ├── characters/
│       ├── backgrounds/
│       ├── sounds/
│       ├── music/
│       ├── icons/
│       └── fonts/
│
└── tests/
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

## Proceso principal

El proceso principal será responsable de:

* Crear ventanas.
* Configurar seguridad.
* Inicializar SQLite.
* Ejecutar migraciones.
* Registrar handlers IPC.
* Acceder al sistema de archivos.
* Crear copias de seguridad.
* Importar y exportar contenido.
* Cerrar correctamente la base de datos.

No debe contener lógica visual.

---

## Renderer

El renderer será responsable de:

* Mostrar el panel docente.
* Mostrar formularios.
* Mostrar juegos.
* Validar datos básicos de interfaz.
* Presentar errores.
* Administrar navegación.
* Ejecutar animaciones.
* Ejecutar motores de juego.

El renderer no debe importar:

```js
require("fs");
require("path");
require("better-sqlite3");
```

Tampoco debe acceder directamente a:

```js
process
__dirname
Buffer
```

salvo que sean expuestos de forma controlada y exista una necesidad justificada.

---

## Preload

El preload debe exponer una API mínima.

Ejemplo:

```js
window.learningAPI.students.list();
window.learningAPI.students.create(data);
window.learningAPI.students.update(id, data);

window.learningAPI.activities.list(filters);
window.learningAPI.activities.create(data);
window.learningAPI.activities.update(id, data);

window.learningAPI.sessions.start(data);
window.learningAPI.sessions.finish(data);

window.learningAPI.progress.getByStudent(studentId);

window.learningAPI.settings.get();
window.learningAPI.settings.update(data);
```

No debe exponerse directamente:

```js
ipcRenderer
fs
path
database
shell
```

Cada método debe corresponder a una operación concreta.

---

## IPC

Todos los datos recibidos por IPC deben validarse en el proceso principal.

Flujo:

```text
Formulario
   ↓
Validación de interfaz
   ↓
Preload
   ↓
IPC
   ↓
Validación principal
   ↓
Repositorio o servicio
   ↓
SQLite
```

La validación en el renderer mejora la experiencia, pero no reemplaza la validación en el proceso principal.

Los canales IPC deben tener nombres consistentes:

```text
students:list
students:create
students:update
students:disable

activities:list
activities:create
activities:update
activities:duplicate

sessions:start
sessions:finish

progress:by-student

settings:get
settings:update
```

---

## Persistencia

SQLite será la fuente principal de información mutable.

La base debe ubicarse en:

```js
path.join(app.getPath("userData"), "aprende-jugando.db");
```

No debe almacenarse en:

* `src`.
* `resources`.
* `app.asar`.
* `Program Files`.
* Carpeta del ejecutable.
* Repositorio.

---

## Repositorios

Cada entidad tendrá un repositorio.

Ejemplo:

```text
student.repository.js
activity.repository.js
session.repository.js
progress.repository.js
settings.repository.js
```

Los repositorios deben:

* Ejecutar consultas SQL.
* Convertir filas a objetos.
* Manejar transacciones cuando corresponda.
* No contener lógica visual.
* No depender del renderer.

---

## Servicios

Los servicios deben coordinar operaciones de negocio.

Ejemplos:

* Finalizar una sesión.
* Actualizar progreso.
* Crear respaldo.
* Importar actividades.
* Exportar contenido.

Un servicio puede utilizar varios repositorios.

Ejemplo:

```text
finishGameSession()
    ├── guarda sesión
    ├── actualiza progreso
    ├── calcula mejor puntuación
    └── devuelve resumen
```

---

## Migraciones

Cada cambio estructural debe implementarse como una migración numerada.

Ejemplo:

```text
001_initial_schema.js
002_add_activity_status.js
003_add_student_avatar.js
```

Cada migración debe incluir:

* Número de versión.
* Nombre.
* Operación `up`.
* Fecha de aplicación registrada.

Las migraciones deben ejecutarse dentro de transacciones.

No debe modificarse una migración que ya haya sido publicada. Debe crearse una nueva.

---

## Motores de juego

Un motor de juego es una mecánica reutilizable.

Ejemplos futuros:

* Multiple choice.
* True or false.
* Ordering.
* Matching.
* Memory.
* Catch items.
* Racing.
* Meteor defense.

Contrato conceptual:

```js
class GameEngine {
  async initialize(config) {}
  start() {}
  pause() {}
  resume() {}
  finish() {}
  destroy() {}
}
```

Cada motor debe recibir:

* Configuración.
* Actividades.
* Estudiante.
* Callbacks de eventos.
* Preferencias de audio.

Y debe producir:

* Respuestas.
* Puntuación.
* Duración.
* Estado de finalización.
* Resumen de sesión.

---

## Separación entre contenido y mecánica

Una actividad contiene el contenido pedagógico.

Ejemplo:

```text
¿Cuánto es 5 + 3?
```

Un motor define la interacción.

Ejemplos:

* Botones.
* Carrera.
* Meteoritos.
* Atrapar objetos.

El contenido no debe conocer los detalles visuales del motor.

El motor no debe contener preguntas pedagógicas escritas directamente en su código.

---

## Recursos

Todo recurso requerido debe estar disponible localmente:

* Imágenes.
* Sprites.
* Audio.
* Música.
* Fuentes.
* Iconos.
* Bibliotecas.

No se deben realizar solicitudes de red para funciones esenciales.

---

## Errores

La aplicación debe diferenciar:

* Error de validación.
* Error de base de datos.
* Error de importación.
* Error de archivo.
* Error inesperado.

El renderer debe recibir errores seguros y comprensibles.

No se deben mostrar al usuario:

* Rutas internas sensibles.
* Consultas SQL completas.
* Stack traces.
* Información técnica innecesaria.

Los detalles técnicos deben registrarse en modo desarrollo.

---

## Seguridad

Configuración mínima de BrowserWindow:

```js
webPreferences: {
  preload: preloadPath,
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true
}
```

Las decisiones que requieran desactivar `sandbox` deben documentarse.

También se debe:

* Validar IPC.
* Evitar `eval`.
* Evitar HTML no sanitizado.
* Restringir navegación externa.
* Evitar abrir enlaces no confiables.
* No ejecutar archivos importados.
* Tratar JSON importado como datos, nunca como código.

---

## Pruebas

### Unitarias

* Validadores.
* Cálculo de puntuación.
* Reglas de progreso.
* Transformación de datos.
* Repositorios aislados cuando sea posible.

### Integración

* Creación de base.
* Migraciones.
* CRUD de estudiantes.
* CRUD de actividades.
* Finalización de sesiones.
* Actualización de progreso.

### Manuales

* Primera ejecución.
* Ejecución sin internet.
* Reinicio de aplicación.
* Persistencia de datos.
* Instalación limpia.
* Actualización sin perder base.
* Resoluciones de pantalla distintas.

---

## Principio central

La aplicación debe permitir reemplazar o agregar motores de juego sin modificar la persistencia principal ni el panel docente completo.

Del mismo modo, debe permitir agregar nuevas actividades sin modificar el código del motor cuando la actividad sea compatible.
