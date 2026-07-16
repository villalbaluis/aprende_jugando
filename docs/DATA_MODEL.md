# DATA_MODEL.md

## Objetivo

Este documento define el modelo inicial de datos de Aprende Jugando.

SQLite será la fuente principal para los datos editables y persistentes.

Los campos flexibles propios de cada tipo de actividad pueden almacenarse como JSON serializado dentro de columnas de texto.

---

## Convenciones

* Identificadores persistentes mediante UUID.
* Fechas en formato ISO 8601 UTC.
* Booleanos almacenados como `0` y `1`.
* Nombres de tablas en plural.
* Nombres de columnas en `snake_case`.
* Objetos JavaScript en `camelCase`.
* Eliminación lógica cuando sea preferible conservar historial.
* Claves foráneas activadas mediante:

```sql
PRAGMA foreign_keys = ON;
```

---

## Tabla `schema_migrations`

Registra las migraciones aplicadas.

```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
);
```

---

## Tabla `students`

Almacena perfiles locales de estudiantes.

```sql
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    grade INTEGER,
    avatar TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### Reglas

* `display_name` es obligatorio.
* No se requiere nombre completo.
* `grade` puede ser nulo inicialmente.
* `is_active` permite ocultar un estudiante sin eliminar su historial.
* El avatar será una referencia a un recurso local.

Ejemplo:

```json
{
  "id": "c4f4ed0a-65cb-4ea8-b3d1-46e04712cc8b",
  "displayName": "Sofi",
  "grade": 2,
  "avatar": "cat-01",
  "isActive": true,
  "createdAt": "2026-07-16T18:00:00.000Z",
  "updatedAt": "2026-07-16T18:00:00.000Z"
}
```

---

## Tabla `activities`

Almacena las actividades educativas creadas por el sistema o el docente.

```sql
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade INTEGER,
    topic TEXT,
    difficulty TEXT,
    instruction TEXT NOT NULL,
    content_json TEXT NOT NULL,
    solution_json TEXT NOT NULL,
    feedback_json TEXT,
    settings_json TEXT,
    source TEXT NOT NULL DEFAULT 'teacher',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### Valores iniciales de `type`

```text
multiple-choice
```

Valores futuros:

```text
true-false
ordering
matching
memory
classification
catch-items
racing
meteor-defense
```

### Valores de `source`

```text
system
teacher
imported
```

### Ejemplo de selección múltiple

```json
{
  "id": "activity-001",
  "title": "Suma básica",
  "type": "multiple-choice",
  "subject": "mathematics",
  "grade": 2,
  "topic": "addition",
  "difficulty": "easy",
  "instruction": "Selecciona la respuesta correcta",
  "content": {
    "question": "¿Cuánto es 4 + 3?",
    "options": [
      {
        "id": "a",
        "text": "6"
      },
      {
        "id": "b",
        "text": "7"
      },
      {
        "id": "c",
        "text": "8"
      }
    ]
  },
  "solution": {
    "correctOptionId": "b"
  },
  "feedback": {
    "correct": "¡Muy bien!",
    "incorrect": "Inténtalo nuevamente."
  },
  "settings": {
    "timeLimitSeconds": null,
    "shuffleOptions": true
  }
}
```

---

## Tabla `game_sessions`

Registra cada sesión de juego.

```sql
CREATE TABLE game_sessions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    engine_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL DEFAULT 'started',
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    unanswered INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    metadata_json TEXT,
    created_at TEXT NOT NULL,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
);
```

### Estados

```text
started
completed
abandoned
error
```

---

## Tabla `session_answers`

Registra las respuestas dadas dentro de una sesión.

```sql
CREATE TABLE session_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    answer_json TEXT,
    is_correct INTEGER NOT NULL,
    response_time_ms INTEGER,
    score_awarded INTEGER NOT NULL DEFAULT 0,
    answered_at TEXT NOT NULL,

    FOREIGN KEY (session_id)
        REFERENCES game_sessions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (activity_id)
        REFERENCES activities(id)
);
```

Esta tabla puede agregarse en la primera versión si se requiere análisis detallado. Si el primer corte solo guarda resultados generales, puede incorporarse en una migración posterior.

---

## Tabla `progress`

Almacena el progreso acumulado por estudiante y motor o juego.

```sql
CREATE TABLE progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    engine_id TEXT NOT NULL,
    current_level INTEGER NOT NULL DEFAULT 1,
    best_score INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_correct_answers INTEGER NOT NULL DEFAULT 0,
    total_incorrect_answers INTEGER NOT NULL DEFAULT 0,
    total_play_time_seconds INTEGER NOT NULL DEFAULT 0,
    last_played_at TEXT,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    UNIQUE(student_id, engine_id)
);
```

El identificador puede construirse como:

```text
studentId:engineId
```

Aunque se mantendrá como texto y no se dependerá de su formato para consultas.

---

## Tabla `settings`

Almacena configuración local.

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

Ejemplos:

```json
{
  "key": "audio",
  "value": {
    "enabled": true,
    "musicVolume": 0.5,
    "effectsVolume": 0.8
  }
}
```

```json
{
  "key": "interface",
  "value": {
    "fullscreen": false,
    "highContrast": false,
    "fontScale": 1
  }
}
```

---

## Tabla futura `content_packs`

Permitirá agrupar actividades.

```sql
CREATE TABLE content_packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    grade INTEGER,
    version TEXT NOT NULL,
    source TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

No es obligatoria para el primer corte.

---

## Relaciones principales

```text
students
   │
   ├── game_sessions
   │       └── session_answers
   │               └── activities
   │
   └── progress

activities
   └── pueden utilizarse en múltiples sesiones
```

---

## Validación de actividades

Todas las actividades deben tener:

* `id`.
* `title`.
* `type`.
* `subject`.
* `instruction`.
* `content`.
* `solution`.

Para `multiple-choice`:

* Debe existir una pregunta.
* Deben existir al menos dos opciones.
* Cada opción debe tener identificador.
* Debe existir una respuesta correcta.
* La respuesta correcta debe coincidir con una opción existente.
* No deben existir identificadores de opción duplicados.

---

## Importación y exportación

El formato de intercambio debe incluir versión:

```json
{
  "format": "aprende-jugando-content-pack",
  "version": 1,
  "exportedAt": "2026-07-16T18:00:00.000Z",
  "activities": []
}
```

La importación debe:

1. Validar formato.
2. Validar versión.
3. Validar cada actividad.
4. Rechazar contenido ejecutable.
5. Evitar sobrescritura accidental.
6. Generar nuevos identificadores cuando sea necesario.
7. Mostrar un resumen antes de confirmar.

---