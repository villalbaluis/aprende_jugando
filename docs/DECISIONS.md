
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

**Estado:** proposed

Opciones:

* Enrutador sencillo propio.
* Navegación por componentes y estados.
* Librería ligera de rutas.

Debe resolverse durante el primer corte.

### ADR-P02: Herramienta de pruebas

**Estado:** proposed

Opciones:

* Vitest.
* Jest.
* Node Test Runner.

Debe elegirse evitando complejidad innecesaria.

### ADR-P03: Instalador final

**Estado:** proposed

Opciones:

* Squirrel.Windows.
* WiX MSI.
* Versión portable ZIP.

Durante el MVP se probará primero una alternativa sencilla.

### ADR-P04: Esquema detallado de respuestas

**Estado:** proposed

Debe decidirse si `session_answers` se incluye desde la primera migración o en una migración posterior.

### ADR-P05: Estrategia de copias automáticas

**Estado:** proposed

Debe definirse:

* Frecuencia.
* Cantidad de copias.
* Restauración.
* Ubicación.
* Exportación manual.
