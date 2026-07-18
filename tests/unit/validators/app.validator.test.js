const test = require('node:test');
const assert = require('node:assert/strict');

const { ValidationError } = require('../../../src/shared/errors/validation-error');
const { sanitizeSetFullscreenInput } = require('../../../src/shared/validators/app.validator');

test('sanitizeSetFullscreenInput acepta true y false', () => {
  assert.deepEqual(sanitizeSetFullscreenInput({ fullscreen: true }), { fullscreen: true });
  assert.deepEqual(sanitizeSetFullscreenInput({ fullscreen: false }), { fullscreen: false });
});

test('sanitizeSetFullscreenInput rechaza valores que no son booleanos', () => {
  assert.throws(() => sanitizeSetFullscreenInput({ fullscreen: 'true' }), ValidationError);
  assert.throws(() => sanitizeSetFullscreenInput({}), ValidationError);
  assert.throws(() => sanitizeSetFullscreenInput(null), ValidationError);
});
