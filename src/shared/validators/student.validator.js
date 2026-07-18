const { ValidationError, fail } = require('../errors/validation-error');

const NAME_MIN_LENGTH = 1;
const NAME_MAX_LENGTH = 60;
const GRADE_MIN = 1;
const GRADE_MAX = 6;
const AVATAR_MAX_LENGTH = 40;

function parseDisplayName(rawValue, { required }) {
  if (rawValue === undefined && !required) return undefined;
  if (typeof rawValue !== 'string') {
    fail([{ field: 'displayName', message: 'El nombre visible es obligatorio.' }]);
  }
  const trimmed = rawValue.trim();
  if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
    fail([{ field: 'displayName', message: `El nombre visible debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.` }]);
  }
  return trimmed;
}

function parseGrade(rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null || rawValue === '') return null;
  const grade = Number(rawValue);
  if (!Number.isInteger(grade) || grade < GRADE_MIN || grade > GRADE_MAX) {
    fail([{ field: 'grade', message: `El grado debe ser un número entero entre ${GRADE_MIN} y ${GRADE_MAX}.` }]);
  }
  return grade;
}

function parseAvatar(rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null || rawValue === '') return null;
  if (typeof rawValue !== 'string' || rawValue.length > AVATAR_MAX_LENGTH) {
    fail([{ field: 'avatar', message: 'El avatar seleccionado no es válido.' }]);
  }
  return rawValue;
}

function sanitizeCreateStudentInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  const displayName = parseDisplayName(payload.displayName, { required: true });
  const grade = parseGrade(payload.grade) ?? null;
  const avatar = parseAvatar(payload.avatar) ?? null;
  return { displayName, grade, avatar };
}

function sanitizeUpdateStudentInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  const changes = {};
  const displayName = parseDisplayName(payload.displayName, { required: false });
  if (displayName !== undefined) changes.displayName = displayName;
  const grade = parseGrade(payload.grade);
  if (grade !== undefined) changes.grade = grade;
  const avatar = parseAvatar(payload.avatar);
  if (avatar !== undefined) changes.avatar = avatar;
  if (Object.keys(changes).length === 0) {
    fail([{ field: 'general', message: 'No se recibió ningún cambio para actualizar.' }]);
  }
  return changes;
}

function sanitizeStudentId(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: 'id', message: 'El identificador del estudiante no es válido.' }]);
  }
  return rawValue;
}

function sanitizeIsActive(rawValue) {
  if (typeof rawValue !== 'boolean') {
    fail([{ field: 'isActive', message: 'El estado activo debe ser verdadero o falso.' }]);
  }
  return rawValue;
}

function sanitizeListFilters(input) {
  const payload = input && typeof input === 'object' ? input : {};
  return { includeInactive: payload.includeInactive !== false };
}

module.exports = {
  ValidationError,
  sanitizeCreateStudentInput,
  sanitizeUpdateStudentInput,
  sanitizeStudentId,
  sanitizeIsActive,
  sanitizeListFilters,
};
