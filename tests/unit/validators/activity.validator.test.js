const test = require('node:test');
const assert = require('node:assert/strict');

const { ValidationError } = require('../../../src/shared/errors/validation-error');
const {
  sanitizeCreateActivityInput,
  sanitizeUpdateActivityInput,
  sanitizeActivityId,
  sanitizeIsActive,
  sanitizeListFilters,
} = require('../../../src/shared/validators/activity.validator');

function validPayload(overrides = {}) {
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
    ...overrides,
  };
}

test('sanitizeCreateActivityInput acepta una actividad multiple-choice válida', () => {
  const result = sanitizeCreateActivityInput(validPayload());
  assert.equal(result.type, 'multiple-choice');
  assert.equal(result.title, 'Suma básica');
  assert.equal(result.subject, 'Matemáticas');
  assert.equal(result.grade, 2);
  assert.deepEqual(result.content.options, [
    { id: 'a', text: '6' },
    { id: 'b', text: '7' },
  ]);
  assert.deepEqual(result.solution, { correctOptionId: 'b' });
  assert.equal(result.settings, null);
});

test('sanitizeCreateActivityInput rechaza título vacío', () => {
  assert.throws(() => sanitizeCreateActivityInput(validPayload({ title: '   ' })), ValidationError);
});

test('sanitizeCreateActivityInput rechaza asignatura ausente', () => {
  const payload = validPayload();
  delete payload.subject;
  assert.throws(() => sanitizeCreateActivityInput(payload), ValidationError);
});

test('sanitizeCreateActivityInput rechaza instrucción vacía', () => {
  assert.throws(() => sanitizeCreateActivityInput(validPayload({ instruction: '' })), ValidationError);
});

test('sanitizeCreateActivityInput rechaza pregunta vacía', () => {
  const payload = validPayload({ content: { question: '   ', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }] } });
  assert.throws(() => sanitizeCreateActivityInput(payload), ValidationError);
});

test('sanitizeCreateActivityInput rechaza menos de dos opciones', () => {
  const payload = validPayload({ content: { question: '¿?', options: [{ id: 'a', text: '1' }] } });
  assert.throws(() => sanitizeCreateActivityInput(payload), ValidationError);
});

test('sanitizeCreateActivityInput rechaza identificadores de opción duplicados', () => {
  const payload = validPayload({
    content: {
      question: '¿?',
      options: [
        { id: 'a', text: '1' },
        { id: 'a', text: '2' },
      ],
    },
    solution: { correctOptionId: 'a' },
  });
  assert.throws(() => sanitizeCreateActivityInput(payload), ValidationError);
});

test('sanitizeCreateActivityInput rechaza respuesta correcta que no coincide con ninguna opción', () => {
  assert.throws(
    () => sanitizeCreateActivityInput(validPayload({ solution: { correctOptionId: 'z' } })),
    ValidationError
  );
});

test('sanitizeCreateActivityInput rechaza grado fuera de rango', () => {
  assert.throws(() => sanitizeCreateActivityInput(validPayload({ grade: 9 })), ValidationError);
});

test('sanitizeCreateActivityInput rechaza un tipo no soportado', () => {
  assert.throws(() => sanitizeCreateActivityInput(validPayload({ type: 'true-false' })), ValidationError);
});

test('sanitizeCreateActivityInput asume multiple-choice si no se envía type', () => {
  const payload = validPayload();
  delete payload.type;
  const result = sanitizeCreateActivityInput(payload);
  assert.equal(result.type, 'multiple-choice');
});

test('sanitizeUpdateActivityInput permite cambios parciales', () => {
  const result = sanitizeUpdateActivityInput({ title: 'Nuevo título' });
  assert.deepEqual(result, { title: 'Nuevo título' });
});

test('sanitizeUpdateActivityInput rechaza payload sin cambios', () => {
  assert.throws(() => sanitizeUpdateActivityInput({}), ValidationError);
});

test('sanitizeUpdateActivityInput rechaza el campo type (inmutable)', () => {
  assert.throws(() => sanitizeUpdateActivityInput({ type: 'multiple-choice' }), ValidationError);
});

test('sanitizeUpdateActivityInput exige actualizar content y solution juntos', () => {
  assert.throws(
    () => sanitizeUpdateActivityInput({ content: { question: '¿?', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }] } }),
    ValidationError
  );
});

test('sanitizeUpdateActivityInput acepta content y solution juntos', () => {
  const result = sanitizeUpdateActivityInput({
    content: { question: '¿?', options: [{ id: 'a', text: '1' }, { id: 'b', text: '2' }] },
    solution: { correctOptionId: 'a' },
  });
  assert.deepEqual(result.content.options, [
    { id: 'a', text: '1' },
    { id: 'b', text: '2' },
  ]);
  assert.deepEqual(result.solution, { correctOptionId: 'a' });
});

test('sanitizeActivityId rechaza valores vacíos o no string', () => {
  assert.throws(() => sanitizeActivityId(''), ValidationError);
  assert.throws(() => sanitizeActivityId(undefined), ValidationError);
});

test('sanitizeIsActive exige un booleano', () => {
  assert.throws(() => sanitizeIsActive('true'), ValidationError);
  assert.equal(sanitizeIsActive(true), true);
});

test('sanitizeListFilters normaliza grado y asignatura', () => {
  assert.deepEqual(sanitizeListFilters(undefined), { grade: null, subject: null, includeInactive: true });
  assert.deepEqual(sanitizeListFilters({ grade: '2', subject: ' Matemáticas ' }), {
    grade: 2,
    subject: 'Matemáticas',
    includeInactive: true,
  });
});
