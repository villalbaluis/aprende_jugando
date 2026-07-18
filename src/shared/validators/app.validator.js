const { fail } = require('../errors/validation-error');

function sanitizeSetFullscreenInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  if (typeof payload.fullscreen !== 'boolean') {
    fail([{ field: 'fullscreen', message: 'El modo de pantalla debe ser verdadero o falso.' }]);
  }
  return { fullscreen: payload.fullscreen };
}

module.exports = { sanitizeSetFullscreenInput };
