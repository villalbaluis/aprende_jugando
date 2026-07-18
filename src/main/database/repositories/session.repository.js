const crypto = require('node:crypto');

function mapRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    engineId: row.engine_id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    correctAnswers: row.correct_answers,
    incorrectAnswers: row.incorrect_answers,
    unanswered: row.unanswered,
    score: row.score,
    durationSeconds: row.duration_seconds,
  };
}

// Toda la SQL de sesiones de juego vive aquí, según docs/ARCHITECTURE.md.
function createSessionRepository(db) {
  const selectByIdStmt = db.prepare('SELECT * FROM game_sessions WHERE id = ?');

  return {
    start({ studentId, engineId }) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO game_sessions (
           id, student_id, engine_id, started_at, status,
           correct_answers, incorrect_answers, unanswered, score, duration_seconds,
           created_at
         ) VALUES (?, ?, ?, ?, 'started', 0, 0, 0, 0, 0, ?)`
      ).run(id, studentId, engineId, now, now);
      return mapRow(selectByIdStmt.get(id));
    },

    finish(id, { status, correctAnswers, incorrectAnswers, unanswered, score, durationSeconds }) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;
      const now = new Date().toISOString();
      db.prepare(
        `UPDATE game_sessions SET
           finished_at = ?, status = ?, correct_answers = ?, incorrect_answers = ?,
           unanswered = ?, score = ?, duration_seconds = ?
         WHERE id = ?`
      ).run(now, status, correctAnswers, incorrectAnswers, unanswered, score, durationSeconds, id);
      return mapRow(selectByIdStmt.get(id));
    },

    listByStudent(studentId) {
      const rows = db
        .prepare('SELECT * FROM game_sessions WHERE student_id = ? ORDER BY started_at DESC')
        .all(studentId);
      return rows.map(mapRow);
    },

    countAll() {
      return db.prepare('SELECT COUNT(*) AS count FROM game_sessions').get().count;
    },

    // Promedio general de % de aciertos entre las sesiones completadas con
    // al menos una respuesta (ver "Inicio" en docs/MVP.md). `null` si
    // todavía no hay ninguna sesión completada que se pueda promediar.
    getAverageAccuracyPercent() {
      const row = db
        .prepare(
          `SELECT AVG(CAST(correct_answers AS REAL) * 100.0 / (correct_answers + incorrect_answers)) AS avgAccuracy
           FROM game_sessions
           WHERE status = 'completed' AND (correct_answers + incorrect_answers) > 0`
        )
        .get();
      return row.avgAccuracy === null ? null : Math.round(row.avgAccuracy);
    },
  };
}

module.exports = { createSessionRepository };
