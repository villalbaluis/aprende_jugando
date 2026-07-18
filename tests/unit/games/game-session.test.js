const test = require('node:test');
const assert = require('node:assert/strict');

const { createGameSession } = require('../../../src/games/core/game-session');

test('createGameSession inicia en estado started sin respuestas', () => {
  const session = createGameSession({ studentId: 's1', engineId: 'multiple-choice', activities: [] });
  assert.equal(session.studentId, 's1');
  assert.equal(session.engineId, 'multiple-choice');
  assert.ok(session.startedAt);
  assert.deepEqual(session.getAnswers(), []);
});

test('recordAnswer acumula las respuestas en orden', () => {
  const session = createGameSession({ studentId: 's1', engineId: 'multiple-choice', activities: [] });
  session.recordAnswer({ activityId: 'a1', isCorrect: true, selectedOptionId: 'a' });
  session.recordAnswer({ activityId: 'a2', isCorrect: false, selectedOptionId: 'b' });

  const answers = session.getAnswers();
  assert.equal(answers.length, 2);
  assert.equal(answers[0].activityId, 'a1');
  assert.equal(answers[0].isCorrect, true);
  assert.equal(answers[1].activityId, 'a2');
  assert.equal(answers[1].isCorrect, false);
  assert.ok(answers[0].answeredAt);
});

test('getSummary antes de finish no calcula duración', () => {
  const session = createGameSession({ studentId: 's1', engineId: 'multiple-choice', activities: [] });
  const summary = session.getSummary({ score: 10 });
  assert.equal(summary.status, 'started');
  assert.equal(summary.finishedAt, null);
  assert.equal(summary.durationSeconds, null);
  assert.equal(summary.score, 10);
});

test('finish marca el estado y permite calcular la duración', () => {
  const session = createGameSession({ studentId: 's1', engineId: 'multiple-choice', activities: [] });
  session.finish('completed');
  const summary = session.getSummary({ score: 20 });
  assert.equal(summary.status, 'completed');
  assert.ok(summary.finishedAt);
  assert.equal(typeof summary.durationSeconds, 'number');
  assert.ok(summary.durationSeconds >= 0);
});

test('finish acepta un estado distinto, como abandoned', () => {
  const session = createGameSession({ studentId: 's1', engineId: 'multiple-choice', activities: [] });
  session.finish('abandoned');
  assert.equal(session.getSummary({}).status, 'abandoned');
});
