const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ValidationError,
  sanitizeCreateStudentInput,
  sanitizeUpdateStudentInput,
  sanitizeStudentId,
  sanitizeIsActive,
  sanitizeListFilters,
} = require('../../../src/shared/validators/student.validator');

test('sanitizeCreateStudentInput acepta datos válidos y recorta espacios', () => {
  const result = sanitizeCreateStudentInput({ displayName: '  Sofía  ', grade: 2, avatar: 'cat-01' });
  assert.deepEqual(result, { displayName: 'Sofía', grade: 2, avatar: 'cat-01' });
});

test('sanitizeCreateStudentInput usa null para grado y avatar ausentes', () => {
  const result = sanitizeCreateStudentInput({ displayName: 'Mateo' });
  assert.deepEqual(result, { displayName: 'Mateo', grade: null, avatar: null });
});

test('sanitizeCreateStudentInput rechaza nombre vacío', () => {
  assert.throws(() => sanitizeCreateStudentInput({ displayName: '   ' }), ValidationError);
});

test('sanitizeCreateStudentInput rechaza nombre ausente', () => {
  assert.throws(() => sanitizeCreateStudentInput({}), ValidationError);
});

test('sanitizeCreateStudentInput rechaza nombre demasiado largo', () => {
  const longName = 'a'.repeat(61);
  assert.throws(() => sanitizeCreateStudentInput({ displayName: longName }), ValidationError);
});

test('sanitizeCreateStudentInput rechaza grado fuera de rango', () => {
  assert.throws(() => sanitizeCreateStudentInput({ displayName: 'Ana', grade: 9 }), ValidationError);
});

test('sanitizeCreateStudentInput rechaza grado no entero', () => {
  assert.throws(() => sanitizeCreateStudentInput({ displayName: 'Ana', grade: 'segundo' }), ValidationError);
});

test('sanitizeCreateStudentInput rechaza avatar inválido', () => {
  assert.throws(() => sanitizeCreateStudentInput({ displayName: 'Ana', avatar: 42 }), ValidationError);
});

test('sanitizeUpdateStudentInput permite cambios parciales', () => {
  const result = sanitizeUpdateStudentInput({ grade: 4 });
  assert.deepEqual(result, { grade: 4 });
});

test('sanitizeUpdateStudentInput rechaza payload sin cambios', () => {
  assert.throws(() => sanitizeUpdateStudentInput({}), ValidationError);
});

test('sanitizeUpdateStudentInput permite limpiar el grado con null', () => {
  const result = sanitizeUpdateStudentInput({ grade: null });
  assert.deepEqual(result, { grade: null });
});

test('sanitizeStudentId rechaza valores vacíos o no string', () => {
  assert.throws(() => sanitizeStudentId(''), ValidationError);
  assert.throws(() => sanitizeStudentId(undefined), ValidationError);
  assert.throws(() => sanitizeStudentId(123), ValidationError);
});

test('sanitizeStudentId acepta un id válido', () => {
  assert.equal(sanitizeStudentId('abc-123'), 'abc-123');
});

test('sanitizeIsActive exige un booleano', () => {
  assert.throws(() => sanitizeIsActive('true'), ValidationError);
  assert.equal(sanitizeIsActive(true), true);
  assert.equal(sanitizeIsActive(false), false);
});

test('sanitizeListFilters incluye inactivos por defecto', () => {
  assert.deepEqual(sanitizeListFilters(undefined), { includeInactive: true });
  assert.deepEqual(sanitizeListFilters({ includeInactive: false }), { includeInactive: false });
});
