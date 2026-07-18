const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../src/main/database/migration-runner');
const migrations = require('../../src/main/database/migrations');
const { createActivityRepository } = require('../../src/main/database/repositories/activity.repository');

function createMigratedDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db, migrations);
  return db;
}

function sampleActivity(overrides = {}) {
  return {
    title: 'Suma básica',
    subject: 'Matemáticas',
    grade: 2,
    topic: 'suma',
    difficulty: 'easy',
    instruction: 'Selecciona la respuesta correcta.',
    content: {
      question: '¿Cuánto es 4 + 3?',
      options: [
        { id: 'a', text: '6' },
        { id: 'b', text: '7' },
      ],
    },
    solution: { correctOptionId: 'b' },
    feedback: { correct: '¡Bien!', incorrect: 'Intenta de nuevo.' },
    settings: null,
    ...overrides,
  };
}

test('create genera una actividad multiple-choice con source teacher por defecto', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  const activity = repository.create(sampleActivity());

  assert.ok(activity.id);
  assert.equal(activity.type, 'multiple-choice');
  assert.equal(activity.source, 'teacher');
  assert.equal(activity.isActive, true);
  assert.deepEqual(activity.content, sampleActivity().content);
  assert.deepEqual(activity.solution, { correctOptionId: 'b' });
  assert.equal(activity.createdAt, activity.updatedAt);

  db.close();
});

test('create acepta un source interno distinto (usado por datos demo)', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  const activity = repository.create(sampleActivity(), { source: 'system' });

  assert.equal(activity.source, 'system');

  db.close();
});

test('list filtra por grado y por asignatura', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  repository.create(sampleActivity({ title: 'Mate 2', subject: 'Matemáticas', grade: 2 }));
  repository.create(sampleActivity({ title: 'Mate 3', subject: 'Matemáticas', grade: 3 }));
  repository.create(sampleActivity({ title: 'Español 2', subject: 'Español', grade: 2 }));

  const byGrade = repository.list({ grade: 2 });
  assert.deepEqual(byGrade.map((a) => a.title).sort(), ['Español 2', 'Mate 2']);

  const bySubject = repository.list({ subject: 'Matemáticas' });
  assert.deepEqual(bySubject.map((a) => a.title).sort(), ['Mate 2', 'Mate 3']);

  const byBoth = repository.list({ grade: 2, subject: 'Matemáticas' });
  assert.deepEqual(byBoth.map((a) => a.title), ['Mate 2']);

  db.close();
});

test('list respeta includeInactive', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  const activity = repository.create(sampleActivity());
  repository.setActive(activity.id, false);

  const all = repository.list({ includeInactive: true });
  assert.equal(all.length, 1);

  const onlyActive = repository.list({ includeInactive: false });
  assert.equal(onlyActive.length, 0);

  db.close();
});

test('update modifica solo los campos provistos', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);
  const activity = repository.create(sampleActivity());

  const updated = repository.update(activity.id, { title: 'Suma actualizada' });

  assert.equal(updated.title, 'Suma actualizada');
  assert.equal(updated.subject, 'Matemáticas');
  assert.deepEqual(updated.content, sampleActivity().content);

  db.close();
});

test('update devuelve null si la actividad no existe', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  assert.equal(repository.update('id-inexistente', { title: 'x' }), null);

  db.close();
});

test('duplicate crea una copia independiente marcada con sufijo y source teacher', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);
  const original = repository.create(sampleActivity({ title: 'Original' }), { source: 'system' });
  repository.setActive(original.id, false);

  const copy = repository.duplicate(original.id);

  assert.notEqual(copy.id, original.id);
  assert.equal(copy.title, 'Original (copia)');
  assert.equal(copy.source, 'teacher');
  assert.equal(copy.isActive, true);
  assert.deepEqual(copy.content, original.content);
  assert.deepEqual(copy.solution, original.solution);

  db.close();
});

test('duplicate devuelve null si la actividad no existe', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  assert.equal(repository.duplicate('id-inexistente'), null);

  db.close();
});

test('setActive activa y desactiva una actividad', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);
  const activity = repository.create(sampleActivity());

  const deactivated = repository.setActive(activity.id, false);
  assert.equal(deactivated.isActive, false);

  const reactivated = repository.setActive(activity.id, true);
  assert.equal(reactivated.isActive, true);

  db.close();
});

test('countActive cuenta solo las actividades activas', () => {
  const db = createMigratedDb();
  const repository = createActivityRepository(db);

  assert.equal(repository.countActive(), 0);

  const a = repository.create(sampleActivity({ title: 'Uno' }));
  repository.create(sampleActivity({ title: 'Dos' }));
  repository.setActive(a.id, false);

  assert.equal(repository.countActive(), 1);

  db.close();
});
