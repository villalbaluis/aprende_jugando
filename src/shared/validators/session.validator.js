const { fail } = require('../errors/validation-error');

const SUPPORTED_ENGINES = ['multiple-choice'];
const FINISH_STATUSES = ['completed', 'abandoned', 'error'];

function sanitizeId(rawValue, fieldName) {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: fieldName, message: 'El identificador no es válido.' }]);
  }
  return rawValue;
}

function sanitizeEngineId(rawValue) {
  if (!SUPPORTED_ENGINES.includes(rawValue)) {
    fail([{ field: 'engineId', message: 'Este motor de juego no está disponible.' }]);
  }
  return rawValue;
}

function sanitizeNonNegativeInteger(rawValue, fieldName) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 0) {
    fail([{ field: fieldName, message: `${fieldName} debe ser un número entero mayor o igual a 0.` }]);
  }
  return value;
}

function sanitizeStartSessionInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  return {
    studentId: sanitizeId(payload.studentId, 'studentId'),
    engineId: sanitizeEngineId(payload.engineId),
  };
}

function sanitizeFinishSessionInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  if (!FINISH_STATUSES.includes(payload.status)) {
    fail([{ field: 'status', message: `El estado debe ser uno de: ${FINISH_STATUSES.join(', ')}.` }]);
  }
  return {
    id: sanitizeId(payload.id, 'id'),
    status: payload.status,
    correctAnswers: sanitizeNonNegativeInteger(payload.correctAnswers, 'correctAnswers'),
    incorrectAnswers: sanitizeNonNegativeInteger(payload.incorrectAnswers, 'incorrectAnswers'),
    unanswered: sanitizeNonNegativeInteger(payload.unanswered, 'unanswered'),
    score: sanitizeNonNegativeInteger(payload.score, 'score'),
    durationSeconds: sanitizeNonNegativeInteger(payload.durationSeconds, 'durationSeconds'),
  };
}

function sanitizeStudentIdParam(rawValue) {
  return sanitizeId(rawValue, 'studentId');
}

module.exports = {
  sanitizeStartSessionInput,
  sanitizeFinishSessionInput,
  sanitizeStudentIdParam,
};
