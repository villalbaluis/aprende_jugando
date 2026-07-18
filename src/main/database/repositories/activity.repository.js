const crypto = require('node:crypto');

function parseNullableJson(value) {
  return value === null || value === undefined ? null : JSON.parse(value);
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    subject: row.subject,
    grade: row.grade,
    topic: row.topic,
    difficulty: row.difficulty,
    instruction: row.instruction,
    content: parseNullableJson(row.content_json),
    solution: parseNullableJson(row.solution_json),
    feedback: parseNullableJson(row.feedback_json),
    settings: parseNullableJson(row.settings_json),
    source: row.source,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Toda la SQL de actividades vive aquí, según docs/ARCHITECTURE.md.
function createActivityRepository(db) {
  const selectByIdStmt = db.prepare('SELECT * FROM activities WHERE id = ?');

  return {
    list({ grade = null, subject = null, includeInactive = true } = {}) {
      const clauses = [];
      const params = [];

      if (grade !== null) {
        clauses.push('grade = ?');
        params.push(grade);
      }
      if (subject !== null) {
        clauses.push('subject = ?');
        params.push(subject);
      }
      if (!includeInactive) {
        clauses.push('is_active = 1');
      }

      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const rows = db
        .prepare(`SELECT * FROM activities ${where} ORDER BY title COLLATE NOCASE`)
        .all(...params);
      return rows.map(mapRow);
    },

    getById(id) {
      const row = selectByIdStmt.get(id);
      return row ? mapRow(row) : null;
    },

    // `source` es un parámetro interno (no proviene de IPC/validador) usado
    // solo por el sembrado de datos demostrativos (ver ADR-023). El CRUD
    // expuesto al docente siempre crea actividades con source 'teacher'.
    create(
      { title, subject, grade, topic, difficulty, instruction, content, solution, feedback, settings },
      { source = 'teacher' } = {}
    ) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO activities (
           id, title, type, subject, grade, topic, difficulty, instruction,
           content_json, solution_json, feedback_json, settings_json,
           source, is_active, created_at, updated_at
         ) VALUES (?, ?, 'multiple-choice', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
      ).run(
        id,
        title,
        subject,
        grade ?? null,
        topic ?? null,
        difficulty ?? null,
        instruction,
        JSON.stringify(content),
        JSON.stringify(solution),
        feedback ? JSON.stringify(feedback) : null,
        settings ? JSON.stringify(settings) : null,
        source,
        now,
        now
      );
      return mapRow(selectByIdStmt.get(id));
    },

    update(id, changes) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;

      const now = new Date().toISOString();
      db.prepare(
        `UPDATE activities SET
           title = ?, subject = ?, grade = ?, topic = ?, difficulty = ?, instruction = ?,
           content_json = ?, solution_json = ?, feedback_json = ?, updated_at = ?
         WHERE id = ?`
      ).run(
        changes.title === undefined ? existing.title : changes.title,
        changes.subject === undefined ? existing.subject : changes.subject,
        changes.grade === undefined ? existing.grade : changes.grade,
        changes.topic === undefined ? existing.topic : changes.topic,
        changes.difficulty === undefined ? existing.difficulty : changes.difficulty,
        changes.instruction === undefined ? existing.instruction : changes.instruction,
        changes.content === undefined ? existing.content_json : JSON.stringify(changes.content),
        changes.solution === undefined ? existing.solution_json : JSON.stringify(changes.solution),
        changes.feedback === undefined
          ? existing.feedback_json
          : changes.feedback
            ? JSON.stringify(changes.feedback)
            : null,
        now,
        id
      );
      return mapRow(selectByIdStmt.get(id));
    },

    duplicate(id) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      db.prepare(
        `INSERT INTO activities (
           id, title, type, subject, grade, topic, difficulty, instruction,
           content_json, solution_json, feedback_json, settings_json,
           source, is_active, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', 1, ?, ?)`
      ).run(
        newId,
        `${existing.title} (copia)`,
        existing.type,
        existing.subject,
        existing.grade,
        existing.topic,
        existing.difficulty,
        existing.instruction,
        existing.content_json,
        existing.solution_json,
        existing.feedback_json,
        existing.settings_json,
        now,
        now
      );
      return mapRow(selectByIdStmt.get(newId));
    },

    setActive(id, isActive) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;
      const now = new Date().toISOString();
      db.prepare('UPDATE activities SET is_active = ?, updated_at = ? WHERE id = ?').run(
        isActive ? 1 : 0,
        now,
        id
      );
      return mapRow(selectByIdStmt.get(id));
    },

    countActive() {
      return db.prepare('SELECT COUNT(*) AS count FROM activities WHERE is_active = 1').get().count;
    },
  };
}

module.exports = { createActivityRepository };
