# MVP - Aprende Jugando

## Objetivo del MVP

Construir una primera versión funcional de Aprende Jugando que demuestre el flujo completo de la aplicación:

1. El docente abre la aplicación.
2. Ingresa al panel docente.
3. Crea un estudiante.
4. Crea una actividad educativa.
5. Selecciona un estudiante.
6. El estudiante ejecuta un juego.
7. La aplicación guarda el resultado.
8. El docente consulta el progreso.
9. Los datos permanecen después de cerrar y volver a abrir la aplicación.

El MVP debe funcionar completamente offline en Windows.

---

## Alcance funcional

### 1. Aplicación de escritorio

La primera versión debe incluir:

* Aplicación construida con Electron.
* Empaquetado mediante Electron Forge.
* Compatibilidad inicial con Windows x64.
* Funcionamiento sin conexión a internet.
* Recursos visuales y auditivos almacenados localmente.
* Ventana principal con navegación entre módulos.

---

### 2. Panel docente

El panel docente debe existir desde la primera versión.

Debe incluir una navegación lateral con las siguientes secciones:

* Inicio.
* Estudiantes.
* Actividades.
* Juegos.
* Progreso.
* Configuración.

#### Inicio

Debe mostrar:

* Cantidad de estudiantes registrados.
* Cantidad de actividades disponibles.
* Cantidad de sesiones realizadas.
* Promedio general de resultados.

En el primer corte, algunos indicadores pueden utilizar datos demostrativos, pero deben estar claramente identificados como tales.

#### Estudiantes

Debe permitir:

* Crear un estudiante.
* Editar un estudiante.
* Listar estudiantes.
* Activar o desactivar un estudiante.
* Seleccionar un avatar.
* Asignar un grado.
* Consultar el progreso básico del estudiante.

Campos iniciales:

* Nombre visible o apodo.
* Grado.
* Avatar.
* Estado activo o inactivo.

#### Actividades

Debe permitir:

* Listar actividades.
* Crear actividades.
* Editar actividades.
* Duplicar actividades.
* Activar o desactivar actividades.
* Filtrar por grado, asignatura, tema y tipo.
* Eliminar actividades con confirmación.

En el MVP solo será funcional el tipo:

* Selección múltiple.

La arquitectura debe quedar preparada para incorporar:

* Verdadero o falso.
* Ordenar elementos.
* Relacionar parejas.
* Memoria.
* Clasificación.
* Atrapar respuestas.
* Juegos arcade.

#### Juegos

Debe mostrar los juegos disponibles.

En el MVP habrá un único motor funcional:

* Juego de selección múltiple.

Debe incluir:

* Pantalla de instrucciones.
* Pregunta.
* Opciones de respuesta.
* Retroalimentación visual.
* Puntuación.
* Contador de preguntas.
* Pantalla de resultado final.
* Botón para regresar al menú.

#### Progreso

Debe mostrar:

* Estudiante.
* Juego realizado.
* Fecha.
* Cantidad de respuestas correctas.
* Cantidad de respuestas incorrectas.
* Puntuación.
* Porcentaje de aciertos.
* Duración de la sesión.

Los gráficos avanzados no forman parte del MVP.

#### Configuración

Debe permitir inicialmente:

* Activar o desactivar sonidos.
* Ajustar volumen.
* Seleccionar modo de pantalla.
* Consultar versión de la aplicación.
* Ver la ubicación de las copias de seguridad.

---

## Alcance técnico

### Electron

La aplicación debe usar:

* Proceso principal.
* Proceso renderer.
* Archivo preload.
* Comunicación IPC.
* `contextIsolation: true`.
* `nodeIntegration: false`.

El renderer no debe tener acceso directo a:

* Node.js.
* SQLite.
* Sistema de archivos.
* Sistema operativo.

---

### Base de datos

La aplicación debe utilizar SQLite mediante `better-sqlite3`.

La base debe crearse en:

```js
app.getPath("userData")
```

La base debe incluir inicialmente las siguientes tablas:

* `schema_migrations`
* `students`
* `activities`
* `game_sessions`
* `progress`
* `settings`

Debe existir un sistema de migraciones versionadas.

La aplicación nunca debe eliminar automáticamente una base existente durante una actualización.

---

### Actividades

El MVP debe implementar actividades de selección múltiple.

Cada actividad debe incluir:

* Identificador.
* Título.
* Asignatura.
* Grado.
* Tema.
* Dificultad.
* Tipo.
* Instrucción.
* Enunciado.
* Opciones.
* Respuesta correcta.
* Retroalimentación positiva.
* Retroalimentación de error.
* Estado.
* Fecha de creación.
* Fecha de actualización.

---

### Progreso

Al finalizar una sesión deben almacenarse:

* Identificador de sesión.
* Estudiante.
* Actividad o juego.
* Fecha de inicio.
* Fecha de finalización.
* Cantidad de respuestas correctas.
* Cantidad de respuestas incorrectas.
* Puntuación.
* Duración.
* Estado de finalización.

El progreso acumulado debe conservar:

* Nivel actual.
* Mejor puntuación.
* Cantidad total de sesiones.
* Cantidad total de respuestas correctas.
* Cantidad total de respuestas incorrectas.
* Última fecha de juego.

---

## Contenido inicial

La aplicación debe incluir datos demostrativos locales:

* Dos estudiantes de prueba.
* Una asignatura de matemáticas.
* Una asignatura de español.
* Al menos diez actividades de selección múltiple.
* Un tema visual inicial.
* Sonidos locales básicos.

Los datos demostrativos deben poder distinguirse de los datos creados por el docente.

En producción no se deben insertar nuevamente si ya existen datos.

---

## Diseño inicial

El diseño debe ser:

* Colorido.
* Claro.
* Amigable para niños.
* Comprensible para docentes.
* Adaptable a diferentes resoluciones.
* Navegable con teclado y mouse.
* Legible en pantallas escolares.

Debe incluir:

* Botones grandes.
* Tipografía clara.
* Estados de enfoque visibles.
* Mensajes de error comprensibles.
* Confirmaciones antes de eliminar.
* Indicadores cuando una función aún no esté disponible.

---

## Fuera del alcance del MVP

No se implementará inicialmente:

* Sincronización en la nube.
* Inicio de sesión por internet.
* Gestión de instituciones.
* Gestión de múltiples computadores.
* Actualizaciones automáticas.
* Aplicación móvil.
* Juego multijugador.
* Reconocimiento de voz.
* Inteligencia artificial generativa.
* Reportes PDF.
* Gráficos estadísticos avanzados.
* Phaser.
* Juegos tridimensionales.
* Importación masiva desde Excel.
* Instalador para macOS o Linux.
* Control parental remoto.
* Fotografías de estudiantes.

---

## Orden de implementación

### Corte 1: base técnica

* Crear proyecto Electron Forge.
* Configurar procesos.
* Configurar seguridad.
* Integrar SQLite.
* Implementar migraciones.
* Crear estructura visual del panel docente.
* Crear gestión de estudiantes.

### Corte 2: banco de actividades

* Crear tabla de actividades.
* Crear validaciones.
* Crear formulario de selección múltiple.
* Crear listado, edición y desactivación.

### Corte 3: primer juego

* Crear motor de selección múltiple.
* Consultar actividades desde SQLite.
* Mostrar preguntas.
* Registrar respuestas.
* Mostrar resultado.

### Corte 4: progreso

* Guardar sesiones.
* Actualizar progreso acumulado.
* Mostrar resultados en el panel docente.

### Corte 5: distribución

* Agregar recursos locales.
* Verificar funcionamiento sin internet.
* Generar paquete Windows.
* Probar instalación limpia.
* Probar conservación de datos.

---

## Criterios de aceptación

El MVP se considera funcional cuando:

* La aplicación abre sin conexión a internet.
* El docente puede crear un estudiante.
* El docente puede crear una actividad.
* La actividad aparece en el banco.
* Un estudiante puede jugarla.
* La respuesta correcta se valida.
* La sesión se guarda.
* El panel muestra el resultado.
* Los datos siguen existiendo después de reiniciar.
* La aplicación no requiere instalar SQLite ni Node.js en el computador final.
* Las pruebas principales pasan.
* Se puede generar un paquete ejecutable para Windows.
