// Crea el esquema inicial descrito en docs/DATA_MODEL.md.
// `session_answers` queda deliberadamente fuera de esta migración: el motor
// de selección múltiple y el CRUD de actividades todavía no existen en este
// corte (ver docs/DECISIONS.md, ADR-P04), por lo que se agregará en una
// migración posterior cuando se registren sesiones reales.
module.exports = {
  version: 1,
  name: 'initial_schema',
  up(db) {
    db.exec(`
      CREATE TABLE students (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        grade INTEGER,
        avatar TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

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

        FOREIGN KEY (student_id) REFERENCES students(id)
      );

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

        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE (student_id, engine_id)
      );

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },
};
