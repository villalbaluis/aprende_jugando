const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../src/main/database/migration-runner');
const migrations = require('../../src/main/database/migrations');
const { createStudentRepository } = require('../../src/main/database/repositories/student.repository');

function createMigratedDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db, migrations);
  return db;
}

test('la migración inicial crea todas las tablas requeridas por el MVP', () => {
  const db = createMigratedDb();
  const tableNames = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((row) => row.name);

  for (const expected of ['schema_migrations', 'students', 'activities', 'game_sessions', 'progress', 'settings']) {
    assert.ok(tableNames.includes(expected), `falta la tabla ${expected}`);
  }

  db.close();
});

test('create genera un estudiante con id y timestamps', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);

  const student = repository.create({ displayName: 'Sofía', grade: 2, avatar: 'cat-01' });

  assert.ok(student.id);
  assert.equal(student.displayName, 'Sofía');
  assert.equal(student.grade, 2);
  assert.equal(student.avatar, 'cat-01');
  assert.equal(student.isActive, true);
  assert.ok(student.createdAt);
  assert.equal(student.createdAt, student.updatedAt);

  db.close();
});

test('list devuelve estudiantes ordenados por nombre, con y sin inactivos', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);

  const mateo = repository.create({ displayName: 'Mateo', grade: 3, avatar: null });
  repository.create({ displayName: 'Ana', grade: 1, avatar: null });
  repository.setActive(mateo.id, false);

  const all = repository.list({ includeInactive: true });
  assert.deepEqual(all.map((s) => s.displayName), ['Ana', 'Mateo']);

  const onlyActive = repository.list({ includeInactive: false });
  assert.deepEqual(onlyActive.map((s) => s.displayName), ['Ana']);

  db.close();
});

test('update modifica solo los campos provistos', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);
  const student = repository.create({ displayName: 'Ana', grade: 1, avatar: 'cat-01' });

  const updated = repository.update(student.id, { grade: 2 });

  assert.equal(updated.displayName, 'Ana');
  assert.equal(updated.grade, 2);
  assert.equal(updated.avatar, 'cat-01');

  db.close();
});

test('update devuelve null si el estudiante no existe', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);

  const result = repository.update('id-inexistente', { grade: 2 });

  assert.equal(result, null);

  db.close();
});

test('setActive activa y desactiva un estudiante', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);
  const student = repository.create({ displayName: 'Ana', grade: 1, avatar: null });

  const deactivated = repository.setActive(student.id, false);
  assert.equal(deactivated.isActive, false);

  const reactivated = repository.setActive(student.id, true);
  assert.equal(reactivated.isActive, true);

  db.close();
});

test('countAll cuenta todos los estudiantes, activos e inactivos', () => {
  const db = createMigratedDb();
  const repository = createStudentRepository(db);

  assert.equal(repository.countAll(), 0);

  const mateo = repository.create({ displayName: 'Mateo', grade: 3, avatar: null });
  repository.create({ displayName: 'Ana', grade: 1, avatar: null });
  repository.setActive(mateo.id, false);

  assert.equal(repository.countAll(), 2);

  db.close();
});
