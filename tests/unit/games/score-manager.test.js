const test = require('node:test');
const assert = require('node:assert/strict');

const { createScoreManager } = require('../../../src/games/core/score-manager');

test('getSummary devuelve ceros antes de registrar nada', () => {
  const scoreManager = createScoreManager();
  assert.deepEqual(scoreManager.getSummary(), {
    correctAnswers: 0,
    incorrectAnswers: 0,
    unanswered: 0,
    totalQuestions: 0,
    score: 0,
    accuracyPercent: 0,
  });
});

test('registra respuestas correctas e incorrectas y calcula el puntaje', () => {
  const scoreManager = createScoreManager();
  scoreManager.registerCorrect();
  scoreManager.registerCorrect();
  scoreManager.registerIncorrect();

  const summary = scoreManager.getSummary();
  assert.equal(summary.correctAnswers, 2);
  assert.equal(summary.incorrectAnswers, 1);
  assert.equal(summary.totalQuestions, 3);
  assert.equal(summary.score, 20);
  assert.equal(summary.accuracyPercent, 67);
});

test('permite configurar los puntos por respuesta correcta', () => {
  const scoreManager = createScoreManager({ pointsPerCorrect: 5 });
  scoreManager.registerCorrect();
  assert.equal(scoreManager.getSummary().score, 5);
});

test('cuenta las respuestas no contestadas en el total', () => {
  const scoreManager = createScoreManager();
  scoreManager.registerCorrect();
  scoreManager.registerUnanswered();
  const summary = scoreManager.getSummary();
  assert.equal(summary.totalQuestions, 2);
  assert.equal(summary.accuracyPercent, 50);
});
