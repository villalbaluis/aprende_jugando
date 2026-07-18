
# DECISIONS.md

## Propósito

Este archivo registra decisiones importantes del proyecto.

Cada decisión debe conservar:

* Contexto.
* Decisión.
* Motivo.
* Consecuencias.
* Estado.

Estados posibles:

```text
accepted
proposed
deprecated
superseded
```

---

## ADR-001: Electron como plataforma de escritorio

**Estado:** accepted

### Contexto

La aplicación debe funcionar en computadores Windows, con o sin internet, y permitir utilizar tecnologías web.

### Decisión

Utilizar Electron como contenedor de escritorio.

### Motivo

* Permite reutilizar HTML, CSS y JavaScript.
* Incluye Chromium.
* Permite acceso controlado al sistema local.
* Permite generar instaladores para Windows.
* No requiere que el docente instale Node.js.

### Consecuencias

* El tamaño del instalador será mayor que una web tradicional.
* Debe prestarse atención a seguridad y actualizaciones.
* Los módulos nativos deben empaquetarse correctamente.

---

## ADR-002: Electron Forge para empaquetado

**Estado:** accepted

### Decisión

Utilizar Electron Forge durante el MVP.

### Motivo

* Proporciona estructura inicial.
* Integra desarrollo, empaquetado y generación de instaladores.
* Facilita reconstrucción de módulos nativos.
* Es adecuado para una primera versión.

### Consecuencias

La elección puede revisarse si aparecen necesidades específicas de distribución.

---

## ADR-003: SQLite como base de datos local

**Estado:** accepted

### Decisión

Utilizar SQLite mediante `better-sqlite3`.

### Motivo

* No requiere servidor.
* No requiere instalación adicional para el docente.
* Permite consultas y relaciones.
* Es apropiada para múltiples estudiantes y sesiones.
* Facilita copias de seguridad.

### Consecuencias

* Debe ejecutarse únicamente en el proceso principal.
* Requiere manejo de migraciones.
* `better-sqlite3` es un módulo nativo y debe empaquetarse correctamente.

---

## ADR-004: JSON no será editado manualmente por el docente

**Estado:** accepted

### Decisión

El docente administrará contenido mediante formularios.

JSON se utilizará para:

* Importar.
* Exportar.
* Precargar contenido.
* Crear copias legibles.

### Motivo

Editar JSON manualmente genera errores y exige conocimientos técnicos.

### Consecuencias

Debe construirse un banco de actividades funcional desde etapas tempranas.

---

## ADR-005: El panel docente estará en el MVP

**Estado:** accepted

### Decisión

Incluir el panel docente desde la primera versión.

### Motivo

* Es una parte central del producto.
* Permite validar desde temprano la experiencia de gestión.
* Obliga a construir correctamente estudiantes, actividades y progreso.
* Evita agregar administración tardíamente a juegos ya aislados.

### Consecuencias

Algunas secciones podrán ser visuales o limitadas inicialmente, pero deben distinguirse claramente de funciones disponibles.

---

## ADR-006: Separar contenido educativo y mecánica

**Estado:** accepted

### Decisión

Las actividades educativas no estarán acopladas a una única presentación visual.

### Motivo

Una misma actividad puede presentarse mediante diferentes juegos compatibles.

Ejemplo:

```text
Operación matemática
├── selección múltiple
├── carrera
├── meteoritos
└── atrapar respuestas
```

### Consecuencias

Se requiere un modelo flexible de actividades y contratos claros para motores de juego.

---

## ADR-007: Primer motor de juego

**Estado:** accepted

### Decisión

El primer motor funcional será selección múltiple.

### Motivo

* Permite probar el recorrido completo.
* Es técnicamente sencillo.
* Puede utilizarse en varias asignaturas.
* Valida estudiantes, actividades, sesiones y progreso.

### Consecuencias

La arquitectura debe preparar nuevos tipos sin implementar abstracciones excesivas.

---

## ADR-008: JavaScript modular en el MVP

**Estado:** accepted

### Decisión

Utilizar JavaScript modular inicialmente.

### Motivo

* Reduce configuración.
* Facilita un prototipo rápido.
* Coincide con las tecnologías base del proyecto.

### Consecuencias

La migración futura a TypeScript queda abierta si el crecimiento del proyecto lo justifica.

---

## ADR-009: Sin frameworks de interfaz inicialmente

**Estado:** accepted

### Decisión

Utilizar HTML, CSS y JavaScript sin React, Vue o Angular en el primer corte.

### Motivo

* El MVP tiene una interfaz controlada.
* Reduce dependencias.
* Facilita funcionamiento offline.
* Permite validar primero el modelo y la arquitectura.

### Consecuencias

La interfaz debe mantenerse modular para evitar archivos monolíticos.

---

## ADR-010: Phaser no formará parte del primer corte

**Estado:** accepted

### Decisión

No utilizar Phaser en el primer motor.

### Motivo

Selección múltiple puede construirse con HTML, CSS y JavaScript.

### Consecuencias

Phaser será evaluado al construir juegos arcade, carreras, plataformas o meteoritos.

---

## ADR-011: Datos mutables en `userData`

**Estado:** accepted

### Decisión

Guardar SQLite, configuraciones y respaldos en la carpeta proporcionada por:

```js
app.getPath("userData")
```

### Motivo

La carpeta de instalación puede ser de solo lectura o reemplazarse durante actualizaciones.

### Consecuencias

El instalador y las actualizaciones no deben sobrescribir la base del usuario.

---

## ADR-012: Funcionamiento offline obligatorio

**Estado:** accepted

### Decisión

No depender de CDN, APIs remotas ni recursos externos para funciones esenciales.

### Motivo

La aplicación debe utilizarse en instituciones con conectividad limitada o inexistente.

### Consecuencias

Todos los recursos deben empaquetarse localmente y probarse sin conexión.

---

## ADR-013: Información mínima de estudiantes

**Estado:** accepted

### Decisión

Guardar inicialmente:

* Identificador.
* Nombre visible o apodo.
* Grado.
* Avatar.
* Progreso.

### Motivo

Reducir la recolección de datos personales de menores.

### Consecuencias

No se solicitarán documentos, direcciones, diagnósticos ni fotografías durante el MVP.

---

## ADR-014: Windows x64 como primer objetivo

**Estado:** accepted

### Decisión

Generar inicialmente una versión para Windows x64.

### Motivo

Es el entorno más probable en las instituciones objetivo.

### Consecuencias

Linux, macOS, ARM64 y versiones móviles quedan fuera del MVP.

---

## Decisiones pendientes

### ADR-P01: Sistema de navegación del renderer

**Estado:** superseded

Ver ADR-015, que la resuelve durante el primer corte.

### ADR-P02: Herramienta de pruebas

**Estado:** superseded

Ver ADR-016, que la resuelve durante el primer corte.

### ADR-P03: Instalador final

**Estado:** superseded

Ver ADR-029, que la resuelve en Corte 5.

### ADR-P04: Esquema detallado de respuestas

**Estado:** proposed

`session_answers` no se incluyó en la migración `001_initial_schema` de este corte porque el CRUD de actividades y el motor de selección múltiple todavía no existen (fuera de alcance del primer corte). Se agregará en una migración posterior cuando exista un motor de juego real que registre respuestas.

### ADR-P05: Estrategia de copias automáticas

**Estado:** proposed

Debe definirse:

* Frecuencia.
* Cantidad de copias.
* Restauración.
* Ubicación.
* Exportación manual.

No forma parte del primer corte.

---

## ADR-015: Router propio basado en hash para el renderer

**Estado:** superseded

Ver ADR-021: en uso real bajo Electron con `sandbox: true` y `file://`, la navegación por `location.hash` resultó bloqueada por Chromium ("'file:' URLs are treated as unique security origins"), rompiendo la navegación y `window.learningAPI`. Se reemplazó por un router 100% en memoria.

### Contexto

ADR-P01 quedaba pendiente. El primer corte necesita navegación entre las seis secciones del panel docente sin introducir un framework de interfaz (ver ADR-009).

### Decisión

Implementar un router mínimo propio (`src/renderer/router.js`) basado en `location.hash`, sin librería externa. Cada página se registra como un objeto `{ render(container), unmount() }` en `window.AppPages`.

Las páginas se cargan mediante etiquetas `<script>` clásicas (no módulos ES) para evitar problemas conocidos de carga de módulos ES sobre el protocolo `file://` en Chromium/Electron.

### Motivo

* Cero dependencias nuevas.
* El hash permite recargar o depurar una sección directamente.
* Suficiente para seis secciones; una librería de rutas sería una abstracción prematura en este corte.

### Consecuencias

Si el árbol de navegación crece considerablemente (rutas anidadas, parámetros complejos), esta decisión debe revisarse.

---

## ADR-016: Node.js Test Runner (`node:test`) para las pruebas

**Estado:** accepted

### Contexto

ADR-P02 quedaba pendiente entre Vitest, Jest y Node Test Runner.

### Decisión

Usar el test runner integrado de Node.js (`node:test` + `node:assert/strict`), ejecutado con `node --test`.

### Motivo

* No agrega dependencias de desarrollo.
* Node 18+ ya lo incluye de forma estable.
* Es suficiente para pruebas unitarias e de integración con `better-sqlite3` en memoria.

### Consecuencias

Si el proyecto necesita mocks avanzados, cobertura de código integrada o ejecución en paralelo más sofisticada, se puede reevaluar Vitest.

---

## ADR-017: Canal IPC único `students:set-active` para activar y desactivar

**Estado:** accepted

### Contexto

El listado de ejemplo en `docs/ARCHITECTURE.md` solo menciona `students:disable`, pero `docs/MVP.md` requiere poder activar **y** desactivar un estudiante.

### Decisión

Usar un único canal `students:set-active` que recibe `{ id, isActive }`, en vez de dos canales separados `enable`/`disable`.

### Motivo

Evita duplicar validación y lógica del repositorio para una operación que es, en esencia, una sola actualización de estado booleano.

### Consecuencias

Futuros canales similares (por ejemplo `activities:set-active`) deberían seguir el mismo patrón por consistencia.

---

## ADR-018: El preload no importa el módulo compartido de canales IPC

**Estado:** accepted

### Contexto

`src/preload/preload.js` usa `sandbox: true` (ver `docs/ARCHITECTURE.md`, sección Seguridad). Un preload en sandbox solo puede hacer `require()` de `electron` y de un subconjunto de módulos nativos de Node; no puede requerir de forma confiable archivos arbitrarios del proyecto sin un bundler, y este corte no usa ninguno (ADR-009).

### Decisión

Los nombres de canal IPC se repiten como literales dentro de `preload.js`, en vez de importar `src/shared/constants/ipc-channels.js` (que sí usan `main` y los validadores, donde no hay restricción de sandbox).

### Motivo

Evita un fallo en tiempo de ejecución difícil de diagnosticar por una restricción de `require` específica del preload en sandbox.

### Consecuencias

Los nombres de canal deben mantenerse sincronizados manualmente entre `src/shared/constants/ipc-channels.js` y `src/preload/preload.js`. Si en el futuro se introduce un bundler para el preload, esta duplicación puede eliminarse.

---

## ADR-019: Estudiantes demostrativos identificados por sufijo en el nombre

**Estado:** accepted

### Contexto

`docs/DATA_MODEL.md` define una columna `source` para `activities` (para distinguir contenido `system`/`teacher`/`imported`), pero no define una columna equivalente para `students`.

### Decisión

Los dos estudiantes de prueba que se siembran en desarrollo (ver `docs/MVP.md`, "Contenido inicial") se identifican con el sufijo `" (demo)"` en `display_name`, en vez de agregar una columna nueva no documentada.

### Motivo

Cumple con el requisito de poder distinguir datos demostrativos sin modificar el esquema de `students` fuera de lo ya especificado en `docs/DATA_MODEL.md`.

### Consecuencias

Si en el futuro se requiere distinguir el origen de un estudiante de forma más robusta (por ejemplo, para excluirlos de reportes), se debe agregar una columna `source` explícita mediante una nueva migración, análoga a la de `activities`.

---

## ADR-020: Electron fijado a una versión con binario precompilado de `better-sqlite3`

**Estado:** accepted

### Contexto

Al instalar dependencias, `better-sqlite3` intenta descargar un binario precompilado (`prebuild-install`) antes de compilar desde el código fuente. Para el runtime de Electron, ese binario depende del ABI exacto de la versión de Electron (calculable con el paquete `node-abi`). Durante este corte, la versión "latest" de Electron disponible en npm (43.x, ABI 148) no tenía todavía un binario precompilado publicado por `better-sqlite3`, y este entorno de desarrollo no cuenta con un toolchain de compilación C++ funcional (Visual Studio 2026 instalado sin el componente "Desktop development with C++" completo), por lo que la recompilación automática de Electron Forge fallaba.

### Decisión

Fijar `electron` a la versión `42.7.0` (ABI 146), para la cual `better-sqlite3@12.11.1` sí publica un binario precompilado (`better-sqlite3-v12.11.1-electron-v146-win32-x64.tar.gz`).

### Motivo

* Evita depender de un compilador C++ en la máquina de desarrollo o, más importante, en la máquina del docente (que nunca debe necesitar instalar herramientas de compilación).
* Es consistente con ADR-003 ("`better-sqlite3` es un módulo nativo y debe empaquetarse correctamente").

### Consecuencias

Antes de actualizar Electron a una versión más nueva, se debe verificar que `better-sqlite3` (o la versión que se use en ese momento) publique un binario precompilado para el ABI de esa versión de Electron; en caso contrario, la actualización debe esperar a que se publique, o evaluarse una compilación desde el código fuente con un toolchain C++ verificado.

---

## ADR-021: Router del renderer sin `location.hash`

**Estado:** accepted

### Contexto

Usando la aplicación real (Sprint 1 ya completo), al navegar entre secciones el DevTools mostraba:

```
Unsafe attempt to load URL file:///.../index.html#home from frame with URL file:///.../index.html.
'file:' URLs are treated as unique security origins.
```

y, tras esto, `window.learningAPI` quedaba `undefined` en el renderer (causando `Cannot read properties of undefined (reading 'students')` al intentar crear un estudiante). La causa: `router.js` (ADR-015) navegaba mutando `window.location.hash`. Bajo Electron con `sandbox: true` y contenido cargado por `file://` (`mainWindow.loadFile`), Chromium trata la navegación por hash sobre `file://` como un intento de navegación a un origen "único" y la bloquea, lo que corta el frame y pierde el `window.learningAPI` inyectado por el preload al cargar por primera vez.

### Decisión

Reescribir `src/renderer/router.js` como un router 100% en memoria: una variable `currentRouteName` en el módulo, `navigate(name)` llama directamente a `renderRoute(name)`, `init()` renderiza `initialRoute` directamente. Ninguna parte del router lee ni escribe `window.location`.

### Motivo

* Elimina la causa raíz (la navegación insegura) en vez de mitigar el síntoma.
* Es consistente con `docs/ARCHITECTURE.md` ("Restringir navegación externa" en la sección de Seguridad).
* Ya era una de las opciones consideradas en ADR-P01 ("Navegación por componentes y estados").

### Consecuencias

Se pierde la posibilidad de recargar o enlazar directamente a una sección mediante la URL (no se usaba en la práctica y no es un requisito del producto). Si en el futuro se necesita deep-linking, debe evaluarse un protocolo personalizado (`registerFileProtocol`) en vez de `file://` + hash.

---

## ADR-022: `ValidationError` y envoltorio de handlers IPC compartidos

**Estado:** accepted

### Contexto

Al implementar el CRUD de actividades (Sprint 2), `activity.validator.js` y `activity.handlers.js` necesitan exactamente la misma clase `ValidationError` y el mismo envoltorio `{ok,data}`/`{ok,error}` que ya existían duplicados de forma local en `student.validator.js`/`student.handlers.js`.

### Decisión

Extraer `ValidationError` a `src/shared/errors/validation-error.js`, y el envoltorio genérico de IPC (`handle(channel, executor)`, `toSafeError`, `notFoundError`) a `src/main/ipc/ipc-response.js`. `student.validator.js`/`student.handlers.js` se actualizan para usarlos, sin cambios de comportamiento.

### Motivo

* Es lógica idéntica y relevante para seguridad (nunca filtrar detalles internos al renderer); duplicarla por una segunda entidad multiplicaría el lugar donde un futuro fix de seguridad debe aplicarse.
* No se extraen los validadores de campo (`grade`, `isActive`, etc.): son reglas de negocio independientes por entidad, y duplicarlas es más barato que una abstracción genérica prematura (ver ADR-009).

### Consecuencias

Cualquier entidad nueva (por ejemplo, futuras sesiones o progreso) debe usar estos mismos módulos compartidos en vez de duplicar el envoltorio de errores.

---

## ADR-023: Alcance del banco de actividades (Sprint 2)

**Estado:** accepted

### Contexto

`docs/MVP.md` describe para "Actividades": listar, crear, editar, duplicar, activar/desactivar, filtrar por grado/asignatura/tema/tipo, y eliminar con confirmación. El Sprint 2 solicitado explícitamente por el usuario solo incluye: listar, crear, editar, duplicar, activar/desactivar, filtrar por grado y por asignatura.

### Decisión

Implementar únicamente lo solicitado en el Sprint 2. Quedan explícitamente fuera de este corte:

* Eliminación definitiva (con confirmación) de actividades.
* Filtros por tema y por tipo.

Además, se siembran actividades demostrativas de `multiple-choice` (matemáticas y español) en desarrollo, solo si la tabla `activities` está vacía, con `source: 'system'` (a diferencia de las creadas por el docente, que siempre quedan como `source: 'teacher'`), análogo a los estudiantes demo de la ADR-019 pero aprovechando que `activities` sí tiene una columna `source` documentada.

### Motivo

Mantener el corte acotado a lo pedido; `eliminar` y los filtros de tema/tipo no bloquean el flujo de uso real (activar/desactivar ya oculta una actividad sin perder su historial).

### Consecuencias

Cuando se implemente "eliminar con confirmación", debe decidirse si es un borrado físico o lógico adicional a `is_active`, y agregarse los filtros de tema/tipo al mismo tiempo que su UI correspondiente.

---

## ADR-024: Alcance del Sprint 3 (motor de selección múltiple)

**Estado:** accepted

### Contexto

`docs/MVP.md` divide "Corte 3: primer juego" (motor, consultar actividades, mostrar preguntas, registrar respuestas, mostrar resultado) de "Corte 4: progreso" (guardar sesiones, actualizar progreso acumulado). El flujo pedido para este sprint es: seleccionar estudiante → seleccionar actividad → jugar → resultado, sin especificar si "seleccionar actividad" significa una sola pregunta o un conjunto de ellas.

### Decisión

* **Sin persistencia todavía.** El motor y la sesión de juego viven enteramente en memoria del renderer; `game_sessions` y `progress` (ya creadas en el esquema) quedan sin usarse hasta el corte de "Progreso". El resumen que produce `game-session.js` ya tiene la forma que ese corte necesitará para guardarlo directamente.
* **"Seleccionar actividad" se interpreta como elegir una asignatura** (o "todas las asignaturas") entre las actividades activas apropiadas para el grado del estudiante (mismo grado o sin grado asignado), y jugar la secuencia completa de esas preguntas como un quiz. Se eligió así porque el MVP exige un "contador de preguntas" y "puntuación", que no tendrían sentido jugando una sola pregunta suelta.
* **Sin límite de tiempo ni audio en este corte.** `activity.settings` siempre es `null` (el formulario de creación de actividades todavía no lo recolecta, ver ADR-023), así que no hay forma de configurar `timeLimitSeconds`; se ignora. `shuffleOptions` sí se aplica siempre como `true` (el valor por defecto documentado). Los controles de audio/volumen son responsabilidad de Configuración, todavía no implementada.

### Motivo

Mantener el corte acotado a lo que ya tiene datos reales para configurarse (ninguna actividad tiene `settings` ni duración), y producir una sesión de juego que tenga sentido pedagógico (varias preguntas, no una).

### Consecuencias

Si "seleccionar actividad" debía significar literalmente una sola pregunta, este flujo debe ajustarse; el desacople entre el motor (`src/games/`) y la página (`games-page.js`) hace que ese cambio no requiera tocar el motor, solo cómo `games-page.js` arma el arreglo de `activities` que le pasa.

---

## ADR-025: Patrón de doble exportación para el código de dominio de juego

**Estado:** accepted

### Contexto

`src/games/core/score-manager.js` y `game-session.js` contienen lógica pura (puntuación, registro de respuestas) que `AGENTS.md` pide cubrir con pruebas unitarias. El renderer los carga como `<script>` clásicos (sin `require`, ver ADR-015/021), pero las pruebas corren bajo Node con `require()`.

### Decisión

Cada archivo se envuelve en `(function (root) { ...; if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { root.GameCore = Object.assign(root.GameCore || {}, api); } })(typeof window !== 'undefined' ? window : globalThis);` — un patrón UMD mínimo, sin ninguna dependencia nueva.

### Motivo

Permite `require()` directo en las pruebas y `<script>` directo en el renderer con el mismo archivo, sin bundler (ADR-009) y sin duplicar la lógica.

### Consecuencias

El motor concreto (`src/games/engines/multiple-choice/index.js`), que solo manipula DOM y no tiene lógica pura que valga la pena testear con `node:test`, no usa este patrón: se adjunta directamente a `window.GameEngines`.

---

## ADR-026: Alcance del Sprint 4 (persistencia de sesiones y progreso)

**Estado:** accepted

### Contexto

`docs/MVP.md` ("Corte 4: progreso") pide guardar sesiones, actualizar el progreso acumulado y mostrarlo en el panel docente. Las tablas `game_sessions` y `progress` ya existían desde la migración inicial (Corte 1); este sprint por fin las usa.

### Decisión

* Se agregan los canales `sessions:start`, `sessions:finish` y `progress:by-student`, ya previstos en `docs/ARCHITECTURE.md`. Se agrega además `sessions:by-student` (no estaba en ese ejemplo) porque `docs/MVP.md` pide mostrar en Progreso una tabla por sesión (fecha, aciertos, errores, puntuación, % de aciertos, duración) y no solo el acumulado — el mismo razonamiento que ya se aplicó para `students:set-active` en ADR-017.
* `src/main/services/session.service.js` coordina `session.repository.js` y `progress.repository.js` dentro de una transacción (`db.transaction`), siguiendo el ejemplo `finishGameSession()` de `docs/ARCHITECTURE.md`. El progreso acumulado usa `INSERT ... ON CONFLICT(student_id, engine_id) DO UPDATE` sobre la restricción `UNIQUE` ya definida en `docs/DATA_MODEL.md`, en vez de un `get` + `insert`/`update` manual.
* `current_level` en `progress` queda fijo en `1`: el MVP no define una regla de niveles todavía.
* Una sesión se marca `abandoned` (con las respuestas conocidas hasta ese momento, vía un nuevo callback `onProgress` del motor) si el estudiante sale del juego o navega a otra sección antes de terminar. Por simplicidad, `durationSeconds` de una sesión abandonada se registra como `0` (no se hizo un seguimiento fino del tiempo transcurrido para ese caso).
* El guardado de sesión/progreso es "best effort" desde el renderer: si la llamada IPC falla, el juego sigue funcionando (la pantalla de resultado ya se calculó en memoria); solo se pierde la persistencia de esa partida.
* La página de Progreso lista **todos** los estudiantes (activos e inactivos) en su selector, a diferencia de Juegos (que solo lista activos): revisar el historial de un estudiante desactivado sigue siendo útil aunque ya no pueda jugar.

### Motivo

Mantener la coordinación entre sesión y progreso atómica y en un solo lugar (el servicio), evitar niveles inventados sin base en el MVP, y no bloquear el juego por fallos de persistencia.

### Consecuencias

Si se define una regla de niveles más adelante, debe implementarse en `progress.repository.js` (o en el servicio) sin cambiar la forma de la tabla. Si se necesita medir con precisión la duración de una sesión abandonada, el motor tendría que exponer un timestamp de "última interacción" además del resumen de puntuación.

---

## ADR-027: Configuración guardada en `localStorage`, no en la tabla `settings`

**Estado:** accepted

### Contexto

`docs/DATA_MODEL.md` ya definía una tabla `settings` (`key`, `value_json`, `updated_at`) pensada justamente para esto, y `docs/ARCHITECTURE.md` lista `settings:get`/`settings:update` como canales IPC de ejemplo. Sin embargo, para este corte se decidió explícitamente **no** usar SQLite para la configuración: son preferencias simples, de una sola máquina (sonido, volumen, modo de pantalla), sin necesidad de aparecer en un backup ni de validarse con las mismas reglas que estudiantes/actividades/sesiones.

### Decisión

* La configuración (`{ audio: { enabled, musicVolume, effectsVolume }, interface: { fullscreen } }`) se guarda en `window.localStorage` desde el renderer (`src/renderer/services/settings.service.js`), sin pasar por IPC ni por la tabla `settings`.
* La tabla `settings` **queda en el esquema sin usarse** por ahora (no se elimina la migración: no se modifican migraciones ya publicadas, ver `docs/ARCHITECTURE.md`).
* Dos acciones sí necesitan al proceso principal y se agregan como canales nuevos, porque no son "guardar una preferencia" sino consultar información del proceso principal o accionar la ventana real:
  * `app:info` — devuelve la versión de la app (`app.getVersion()`) y la ruta de `userData`, para la sección "Información" de Configuración (incluye dónde viven los datos, ya que las copias de seguridad automáticas todavía no existen).
  * `window:set-fullscreen` — aplica el modo de pantalla realmente sobre la `BrowserWindow` (`setFullScreen()`); la preferencia en sí se guarda en `localStorage`, pero sin este canal el control no haría nada visible, lo que violaría el principio de AGENTS.md de no presentar controles que parezcan funcionar sin estarlo.

### Motivo

Evita construir validación, IPC y repositorio completos para un puñado de banderas locales que no necesitan las garantías de SQLite (transacciones, relaciones, consultas). `localStorage` para un `BrowserWindow` cargado siempre desde el mismo `file://` persiste correctamente entre reinicios de la app (vive en la carpeta de perfil de Electron dentro de `userData`).

### Consecuencias

* Las preferencias de Configuración no se incluirán en ninguna futura exportación/backup de la base de datos (solo cubre la tabla `settings`, no `localStorage`). Si esto se vuelve un problema (por ejemplo, si el docente reinstala la app y quiere conservar sus preferencias), habría que migrar esta decisión y volver a la tabla `settings`.
* No se implementaron controles para `highContrast` ni `fontScale` (mencionados como ejemplo en `docs/DATA_MODEL.md`): `docs/MVP.md` no los pide explícitamente en la sección Configuración, así que se dejan fuera hasta que haya un requisito concreto.
* El volumen de música/efectos y el interruptor de sonido son, por ahora, solo preferencias guardadas: ningún lugar de la app reproduce audio todavía (no hay motor de audio ni assets de sonido cargados).

---

## ADR-028: Indicadores de Inicio con datos reales (sin datos demostrativos)

**Estado:** accepted

### Contexto

`docs/MVP.md` permitía que "Inicio" usara datos demostrativos en el primer corte, siempre que quedaran identificados como tales. Para cuando se implementó Inicio, Actividades/Juegos/Progreso ya existían y producían datos reales, así que ya no hacía falta simularlos.

### Decisión

Los cuatro indicadores (estudiantes registrados, actividades disponibles, sesiones realizadas, promedio general de aciertos) se calculan con consultas agregadas reales:

* Estudiantes registrados: `COUNT(*)` sobre `students`, activos e inactivos (es un conteo de registros, no de uso activo).
* Actividades disponibles: `COUNT(*)` sobre `activities` con `is_active = 1` ("disponibles" implica utilizables ahora mismo).
* Sesiones realizadas: `COUNT(*)` sobre `game_sessions`, sin importar el estado (incluye abandonadas: de todas formas "se realizaron").
* Promedio general de aciertos: promedio del % de aciertos (`correct_answers / (correct_answers + incorrect_answers)`) entre las sesiones con `status = 'completed'` y al menos una respuesta. Se muestra "Sin partidas todavía" si no hay ninguna sesión completada que promediar, en vez de mostrar `0%` (que sería engañoso).

Se agregó un canal nuevo, `dashboard:summary`, que calcula los cuatro valores en un solo viaje de IPC en vez de que el renderer combine varias listas.

### Motivo

Con datos reales ya disponibles, simular indicadores habría sido menos útil y más confuso que mostrar las cifras reales de uso.

### Consecuencias

Si en el futuro se agregan más motores de juego o tipos de actividad, `dashboard:summary` debe revisarse (por ejemplo, "actividades disponibles" hoy asume que todo lo activo es de tipo `multiple-choice`, lo cual es cierto mientras ese sea el único tipo soportado).

---

## ADR-029: Distribución final — Squirrel.Windows + ZIP portátil (Corte 5)

**Estado:** accepted

### Contexto

`docs/MVP.md` (Corte 5) exige generar un paquete Windows sin requerir instalar SQLite/Node.js en la máquina destino, probar una instalación limpia y probar que los datos existentes se conservan. `forge.config.js` ya traía `@electron-forge/maker-squirrel` y `@electron-forge/maker-zip` configurados desde el primer corte (ADR-P03), pero nunca se había generado ni probado un instalador real.

### Decisión

Se usa la configuración ya existente sin cambios de arquitectura, con un ajuste menor: `package.json` no tenía el campo `author`, requerido por el generador de `.nuspec` de Squirrel (falla con "Authors is required" si falta). Se agregó `"author": { "name": "luchoFlyr", "email": "luis.villalba@flyr.com" }`.

Se ejecutó y verificó en vivo (no solo mediante tests automatizados):

* `npm run package` → genera `out/Aprende Jugando-win32-x64/Aprende Jugando.exe`, ejecutable standalone sin instalador. `better-sqlite3` queda correctamente desempacado en `resources/app.asar.unpacked/` gracias a `@electron-forge/plugin-auto-unpack-natives` (ya configurado).
* `npm run make` → genera `out/make/squirrel.windows/x64/Aprende Jugando-0.1.0 Setup.exe` (instalador Squirrel), su `.nupkg` y `RELEASES`, además de `out/make/zip/win32/x64/Aprende Jugando-win32-x64-0.1.0.zip` (versión portable).
* **Instalación limpia:** se simuló moviendo temporalmente la carpeta `userData` real fuera de su ubicación y lanzando el ejecutable empaquetado. Con la base de datos ausente, la app la crea vacía y (al estar `app.isPackaged`) no siembra datos demostrativos, tal como está documentado. Se creó un estudiante de prueba por la UI, se reinició la app y se confirmó que persistía, tanto por consulta directa a la base SQLite como por el indicador "Estudiantes registrados" en Inicio.
* **Conservación de datos ante instalación:** se restauró la carpeta `userData` original (con el historial de pruebas de los Sprints 1-5) y se ejecutó el instalador Squirrel real (`Setup.exe`) generado por `npm run make` contra esa carpeta ya existente. Squirrel instaló la app en `%LocalAppData%\edugames_hub\app-0.1.0\` y creó un acceso directo en el menú Inicio (`Programs\luchoFlyr\Aprende Jugando.lnk`); al lanzarla, el panel de Inicio mostró los indicadores reales calculados sobre los datos preexistentes (3 estudiantes, 10 actividades, 100% de aciertos), confirmando que instalar/actualizar la app no borra ni reinicia `userData`.

No se evaluó WiX MSI: Squirrel.Windows ya cumple los requisitos del MVP (sin dependencias externas en la máquina destino, instalación y actualización silenciosas) y evita la complejidad adicional de mantener una plantilla WiX.

### Consecuencias

* Queda una instalación real de Squirrel en la máquina de desarrollo (`%LocalAppData%\edugames_hub\`) usada para esta prueba; es responsabilidad de quien la ejecutó decidir si la conserva o la desinstala.
* No se firmó el instalador (code signing) ni se probó el flujo de actualización automática de Squirrel (requeriría un servidor de actualizaciones, fuera de alcance del MVP).
* La prueba de "instalación limpia" fue simulada moviendo `userData`, no mediante una máquina Windows completamente distinta sin Node.js/Visual Studio preinstalados; el requisito de "no requiere instalar SQLite/Node.js" se sostiene porque `better-sqlite3` viaja empacado con binarios precompilados dentro del `.asar.unpacked`, no porque se haya probado en una VM limpia.
