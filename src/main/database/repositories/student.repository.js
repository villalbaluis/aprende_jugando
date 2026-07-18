const crypto = require('node:crypto');

function mapRow(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    grade: row.grade,
    avatar: row.avatar,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Toda la SQL de estudiantes vive aquí, según docs/ARCHITECTURE.md.
function createStudentRepository(db) {
  const selectByIdStmt = db.prepare('SELECT * FROM students WHERE id = ?');

  return {
    list({ includeInactive = true } = {}) {
      const rows = includeInactive
        ? db.prepare('SELECT * FROM students ORDER BY display_name COLLATE NOCASE').all()
        : db
            .prepare('SELECT * FROM students WHERE is_active = 1 ORDER BY display_name COLLATE NOCASE')
            .all();
      return rows.map(mapRow);
    },

    getById(id) {
      const row = selectByIdStmt.get(id);
      return row ? mapRow(row) : null;
    },

    create({ displayName, grade, avatar }) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      db.prepare(
        `INSERT INTO students (id, display_name, grade, avatar, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`
      ).run(id, displayName, grade ?? null, avatar ?? null, now, now);
      return mapRow(selectByIdStmt.get(id));
    },

    update(id, { displayName, grade, avatar }) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;
      const now = new Date().toISOString();
      db.prepare(
        `UPDATE students SET display_name = ?, grade = ?, avatar = ?, updated_at = ? WHERE id = ?`
      ).run(
        displayName === undefined ? existing.display_name : displayName,
        grade === undefined ? existing.grade : grade,
        avatar === undefined ? existing.avatar : avatar,
        now,
        id
      );
      return mapRow(selectByIdStmt.get(id));
    },

    setActive(id, isActive) {
      const existing = selectByIdStmt.get(id);
      if (!existing) return null;
      const now = new Date().toISOString();
      db.prepare('UPDATE students SET is_active = ?, updated_at = ? WHERE id = ?').run(
        isActive ? 1 : 0,
        now,
        id
      );
      return mapRow(selectByIdStmt.get(id));
    },

    countAll() {
      return db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
    },
  };
}

module.exports = { createStudentRepository };
