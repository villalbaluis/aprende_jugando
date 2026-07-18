const { ipcMain } = require('electron');
const { ValidationError } = require('../../shared/errors/validation-error');

function notFoundError(message) {
  const error = new Error(message);
  error.code = 'NOT_FOUND';
  return error;
}

// Los detalles técnicos (SQL, stacks) solo se registran en consola de
// desarrollo, nunca se envían al renderer (ver docs/ARCHITECTURE.md).
function toSafeError(error, { notFoundMessage, logLabel }) {
  if (error instanceof ValidationError) {
    return {
      code: 'validation_error',
      message: 'Los datos ingresados no son válidos.',
      issues: error.issues,
    };
  }
  if (error && error.code === 'NOT_FOUND') {
    return { code: 'not_found', message: notFoundMessage };
  }
  console.error(`[${logLabel}:ipc] error inesperado`, error);
  return { code: 'unexpected_error', message: 'Ocurrió un error inesperado. Intenta nuevamente.' };
}

// Crea un `handle(channel, executor)` ligado a un mensaje de "no encontrado"
// y una etiqueta de log propios de una entidad (estudiantes, actividades, ...).
function createHandler({ notFoundMessage, logLabel }) {
  return function handle(channel, executor) {
    ipcMain.handle(channel, async (_event, payload) => {
      try {
        const data = await executor(payload);
        return { ok: true, data };
      } catch (error) {
        return { ok: false, error: toSafeError(error, { notFoundMessage, logLabel }) };
      }
    });
  };
}

module.exports = { createHandler, notFoundError };
