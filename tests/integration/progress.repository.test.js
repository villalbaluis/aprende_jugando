const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../src/main/database/migration-runner');
const migrations = require('../../src/main/database/migrations');
const { createStudentRepository } = require('../../src/main/database/repositories/student.repository');
const { createProgressRepository } = require('../../src/main/database/repositories/progress.repository');

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

test('upsertAfterSession crea el registro de progreso en la primera partida', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createProgressRepository(db);

  const progress = repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 30,
    correctAnswers: 3,
    incorrectAnswers: 1,
    durationSeconds: 42,
  });

  assert.equal(progress.currentLevel, 1);
  assert.equal(progress.bestScore, 30);
  assert.equal(progress.totalSessions, 1);
  assert.equal(progress.totalCorrectAnswers, 3);
  assert.equal(progress.totalIncorrectAnswers, 1);
  assert.equal(progress.totalPlayTimeSeconds, 42);

  db.close();
});

test('upsertAfterSession acumula sobre una partida posterior', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createProgressRepository(db);

  repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 30,
    correctAnswers: 3,
    incorrectAnswers: 1,
    durationSeconds: 42,
  });
  const progress = repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 20,
    correctAnswers: 2,
    incorrectAnswers: 2,
    durationSeconds: 30,
  });

  assert.equal(progress.bestScore, 30, 'debe conservar el mejor puntaje entre partidas');
  assert.equal(progress.totalSessions, 2);
  assert.equal(progress.totalCorrectAnswers, 5);
  assert.equal(progress.totalIncorrectAnswers, 3);
  assert.equal(progress.totalPlayTimeSeconds, 72);

  db.close();
});

test('upsertAfterSession actualiza el mejor puntaje cuando la nueva partida es mejor', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createProgressRepository(db);

  repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 10,
    correctAnswers: 1,
    incorrectAnswers: 0,
    durationSeconds: 10,
  });
  const progress = repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 50,
    correctAnswers: 5,
    incorrectAnswers: 0,
    durationSeconds: 20,
  });

  assert.equal(progress.bestScore, 50);

  db.close();
});

test('getByStudentAndEngine devuelve null si no hay progreso registrado', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createProgressRepository(db);

  assert.equal(repository.getByStudentAndEngine(student.id, 'multiple-choice'), null);

  db.close();
});

test('listByStudent devuelve el progreso del estudiante', () => {
  const db = createMigratedDb();
  const student = createTestStudent(db);
  const repository = createProgressRepository(db);

  repository.upsertAfterSession({
    studentId: student.id,
    engineId: 'multiple-choice',
    score: 10,
    correctAnswers: 1,
    incorrectAnswers: 0,
    durationSeconds: 10,
  });

  const rows = repository.listByStudent(student.id);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].engineId, 'multiple-choice');

  db.close();
});
