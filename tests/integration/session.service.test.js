const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../src/main/database/migration-runner');
const migrations = require('../../src/main/database/migrations');
const { createStudentRepository } = require('../../src/main/database/repositories/student.repository');
const { createSessionRepository } = require('../../src/main/database/repositories/session.repository');
const { createProgressRepository } = require('../../src/main/database/repositories/progress.repository');
const { createSessionService } = require('../../src/main/services/session.service');

function createSetup() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  runMigrations(db, migrations);

  const studentRepository = createStudentRepository(db);
  const sessionRepository = createSessionRepository(db);
  const progressRepository = createProgressRepository(db);
  const sessionService = createSessionService({ db, sessionRepository, progressRepository });
  const student = studentRepository.create({ displayName: 'Ana', grade: 2, avatar: null });

  return { db, sessionService, sessionRepository, progressRepository, student };
}

test('finishSession guarda la sesión y actualiza el progreso en una sola operación', () => {
  const { db, sessionService, student } = createSetup();

  const started = sessionService.startSession({ studentId: student.id, engineId: 'multiple-choice' });
  const result = sessionService.finishSession({
    id: started.id,
    status: 'completed',
    correctAnswers: 3,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 30,
    durationSeconds: 42,
  });

  assert.equal(result.session.status, 'completed');
  assert.equal(result.progress.bestScore, 30);
  assert.equal(result.progress.totalSessions, 1);

  db.close();
});

test('finishSession acumula el progreso a través de varias sesiones', () => {
  const { db, sessionService, student } = createSetup();

  const first = sessionService.startSession({ studentId: student.id, engineId: 'multiple-choice' });
  sessionService.finishSession({
    id: first.id,
    status: 'completed',
    correctAnswers: 2,
    incorrectAnswers: 2,
    unanswered: 0,
    score: 20,
    durationSeconds: 30,
  });

  const second = sessionService.startSession({ studentId: student.id, engineId: 'multiple-choice' });
  const result = sessionService.finishSession({
    id: second.id,
    status: 'completed',
    correctAnswers: 4,
    incorrectAnswers: 0,
    unanswered: 0,
    score: 40,
    durationSeconds: 25,
  });

  assert.equal(result.progress.totalSessions, 2);
  assert.equal(result.progress.bestScore, 40);
  assert.equal(result.progress.totalCorrectAnswers, 6);
  assert.equal(result.progress.totalIncorrectAnswers, 2);
  assert.equal(result.progress.totalPlayTimeSeconds, 55);

  db.close();
});

test('finishSession devuelve null si la sesión no existe (y no toca progreso)', () => {
  const { db, sessionService, progressRepository, student } = createSetup();

  const result = sessionService.finishSession({
    id: 'id-inexistente',
    status: 'completed',
    correctAnswers: 1,
    incorrectAnswers: 0,
    unanswered: 0,
    score: 10,
    durationSeconds: 5,
  });

  assert.equal(result, null);
  assert.equal(progressRepository.getByStudentAndEngine(student.id, 'multiple-choice'), null);

  db.close();
});

test('finishSession registra una sesión abandonada sin marcarla como completada', () => {
  const { db, sessionService, student } = createSetup();

  const started = sessionService.startSession({ studentId: student.id, engineId: 'multiple-choice' });
  const result = sessionService.finishSession({
    id: started.id,
    status: 'abandoned',
    correctAnswers: 1,
    incorrectAnswers: 0,
    unanswered: 3,
    score: 10,
    durationSeconds: 5,
  });

  assert.equal(result.session.status, 'abandoned');
  assert.equal(result.progress.totalSessions, 1);

  db.close();
});
