const test = require('node:test');
const assert = require('node:assert/strict');

const { ValidationError } = require('../../../src/shared/errors/validation-error');
const {
  sanitizeStartSessionInput,
  sanitizeFinishSessionInput,
  sanitizeStudentIdParam,
} = require('../../../src/shared/validators/session.validator');

test('sanitizeStartSessionInput acepta un payload válido', () => {
  const result = sanitizeStartSessionInput({ studentId: 's1', engineId: 'multiple-choice' });
  assert.deepEqual(result, { studentId: 's1', engineId: 'multiple-choice' });
});

test('sanitizeStartSessionInput rechaza studentId vacío', () => {
  assert.throws(() => sanitizeStartSessionInput({ studentId: '', engineId: 'multiple-choice' }), ValidationError);
});

test('sanitizeStartSessionInput rechaza un motor no soportado', () => {
  assert.throws(() => sanitizeStartSessionInput({ studentId: 's1', engineId: 'true-false' }), ValidationError);
});

test('sanitizeFinishSessionInput acepta un payload completado válido', () => {
  const result = sanitizeFinishSessionInput({
    id: 'sess-1',
    status: 'completed',
    correctAnswers: 3,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 30,
    durationSeconds: 42,
  });
  assert.deepEqual(result, {
    id: 'sess-1',
    status: 'completed',
    correctAnswers: 3,
    incorrectAnswers: 1,
    unanswered: 0,
    score: 30,
    durationSeconds: 42,
  });
});

test('sanitizeFinishSessionInput rechaza un estado no soportado', () => {
  assert.throws(
    () =>
      sanitizeFinishSessionInput({
        id: 'sess-1',
        status: 'in-progress',
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: 0,
        score: 0,
        durationSeconds: 0,
      }),
    ValidationError
  );
});

test('sanitizeFinishSessionInput rechaza números negativos', () => {
  assert.throws(
    () =>
      sanitizeFinishSessionInput({
        id: 'sess-1',
        status: 'completed',
        correctAnswers: -1,
        incorrectAnswers: 0,
        unanswered: 0,
        score: 0,
        durationSeconds: 0,
      }),
    ValidationError
  );
});

test('sanitizeFinishSessionInput rechaza id ausente', () => {
  assert.throws(
    () =>
      sanitizeFinishSessionInput({
        status: 'completed',
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: 0,
        score: 0,
        durationSeconds: 0,
      }),
    ValidationError
  );
});

test('sanitizeStudentIdParam rechaza valores vacíos o no string', () => {
  assert.throws(() => sanitizeStudentIdParam(''), ValidationError);
  assert.throws(() => sanitizeStudentIdParam(undefined), ValidationError);
  assert.equal(sanitizeStudentIdParam('s1'), 's1');
});
