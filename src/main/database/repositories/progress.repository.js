const crypto = require('node:crypto');

function mapRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    engineId: row.engine_id,
    currentLevel: row.current_level,
    bestScore: row.best_score,
    totalSessions: row.total_sessions,
    totalCorrectAnswers: row.total_correct_answers,
    totalIncorrectAnswers: row.total_incorrect_answers,
    totalPlayTimeSeconds: row.total_play_time_seconds,
    lastPlayedAt: row.last_played_at,
    updatedAt: row.updated_at,
  };
}

// Toda la SQL de progreso acumulado vive aquí, según docs/ARCHITECTURE.md.
// `current_level` queda fijo en 1: este corte no define una regla de
// niveles (ver docs/DECISIONS.md, ADR-026).
function createProgressRepository(db) {
  return {
    getByStudentAndEngine(studentId, engineId) {
      const row = db
        .prepare('SELECT * FROM progress WHERE student_id = ? AND engine_id = ?')
        .get(studentId, engineId);
      return row ? mapRow(row) : null;
    },

    listByStudent(studentId) {
      const rows = db
        .prepare('SELECT * FROM progress WHERE student_id = ? ORDER BY last_played_at DESC')
        .all(studentId);
      return rows.map(mapRow);
    },

    // Acumula los resultados de una sesión terminada. Usa el UNIQUE
    // (student_id, engine_id) de docs/DATA_MODEL.md como llave de upsert.
    upsertAfterSession({ studentId, engineId, score, correctAnswers, incorrectAnswers, durationSeconds }) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO progress (
           id, student_id, engine_id, current_level, best_score, total_sessions,
           total_correct_answers, total_incorrect_answers, total_play_time_seconds,
           last_played_at, updated_at
         ) VALUES (?, ?, ?, 1, ?, 1, ?, ?, ?, ?, ?)
         ON CONFLICT(student_id, engine_id) DO UPDATE SET
           best_score = MAX(best_score, excluded.best_score),
           total_sessions = total_sessions + 1,
           total_correct_answers = total_correct_answers + excluded.total_correct_answers,
           total_incorrect_answers = total_incorrect_answers + excluded.total_incorrect_answers,
           total_play_time_seconds = total_play_time_seconds + excluded.total_play_time_seconds,
           last_played_at = excluded.last_played_at,
           updated_at = excluded.updated_at`
      ).run(id, studentId, engineId, score, correctAnswers, incorrectAnswers, durationSeconds, now, now);
      return mapRow(
        db.prepare('SELECT * FROM progress WHERE student_id = ? AND engine_id = ?').get(studentId, engineId)
      );
    },
  };
}

module.exports = { createProgressRepository };
