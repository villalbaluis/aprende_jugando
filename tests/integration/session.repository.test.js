const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../src/main/database/migration-runner');
const migrations = require('../../src/main/database/migrations');
const { createStudentRepository } = require('../../src/main/database/repositories/student.repository');
const { createSessionRepository } = require('../../src/main/database/repositories/session.repository');

function createMigratedDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db, migrations);
  return db;
}

function createTestStudent(db) {
  const studentRepository = createStudentRepository(db);
  return studentRepository.create({ displayName: 'Ana', grade: 2, avatar: null });
}

test('start crea una sesión con estado started y contadores en cero', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  const session = repository.start({ studentId: student.id, engineId: 'multiple-choice' });

  assert.ok(session.id);
  assert.equal(session.studentId, student.id);
  assert.equal(session.engineId, 'multiple-choice');
  assert.equal(session.status, 'started');
  assert.equal(session.correctAnswers, 0);
  assert.equal(session.finishedAt, null);

  db.close();
});

test('finish actualiza los contadores finales y el estado', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);
  const session = repository.start({ studentId: student.id, engineId: 'multiple-choice' });

  const finished = repository.finish(session.id, {
    status: 'completed',
    correctAnswers: 3,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 30,
    durationSeconds: 42,
  });

  assert.equal(finished.status, 'completed');
  assert.equal(finished.correctAnswers, 3);
  assert.equal(finished.score, 30);
  assert.ok(finished.finishedAt);

  db.close();
});

test('finish devuelve null si la sesión no existe', () => {
  const db = createMigratedDb();
  const repository = createSessionRepository(db);

  const result = repository.finish('id-inexistente', {
    status: 'completed',
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 0,
    score: 0,
    durationSeconds: 0,
  });

  assert.equal(result, null);

  db.close();
});

test('listByStudent devuelve las sesiones del estudiante ordenadas por fecha descendente', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  const first = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  const second = repository.start({ studentId: student.id, engineId: 'multiple-choice' });

  const sessions = repository.listByStudent(student.id);
  assert.equal(sessions.length, 2);
  assert.deepEqual(
    sessions.map((s) => s.id).sort(),
    [first.id, second.id].sort()
  );

  db.close();
});

test('countAll cuenta todas las sesiones sin importar su estado', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  assert.equal(repository.countAll(), 0);

  const session = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.finish(session.id, {
    status: 'abandoned',
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 1,
    score: 0,
    durationSeconds: 5,
  });

  assert.equal(repository.countAll(), 2);

  db.close();
});

test('getAverageAccuracyPercent devuelve null sin sesiones completadas', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  repository.start({ studentId: student.id, engineId: 'multiple-choice' });

  assert.equal(repository.getAverageAccuracyPercent(), null);

  db.close();
});

test('getAverageAccuracyPercent promedia el % de aciertos de las sesiones completadas', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  const first = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.finish(first.id, {
    status: 'completed',
    correctAnswers: 3,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 30,
    durationSeconds: 40,
  });

  const second = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.finish(second.id, {
    status: 'completed',
    correctAnswers: 1,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 10,
    durationSeconds: 20,
  });

  // (75% + 50%) / 2 = 62.5% -> redondeado a 63
  assert.equal(repository.getAverageAccuracyPercent(), 63);

  db.close();
});

test('getAverageAccuracyPercent ignora sesiones abandonadas y sin respuestas', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createSessionRepository(db);

  const completed = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.finish(completed.id, {
    status: 'completed',
    correctAnswers: 2,
    incorrectAnswers: 0,
    unanswered: 0,
    score: 20,
    durationSeconds: 10,
  });

  const abandoned = repository.start({ studentId: student.id, engineId: 'multiple-choice' });
  repository.finish(abandoned.id, {
    status: 'abandoned',
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 4,
    score: 0,
    durationSeconds: 0,
  });

  assert.equal(repository.getAverageAccuracyPercent(), 100);

  db.close();
});
