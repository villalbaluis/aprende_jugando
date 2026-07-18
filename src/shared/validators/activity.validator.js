const { fail } = require('../errors/validation-error');

const TITLE_MAX_LENGTH = 120;
const SUBJECT_MAX_LENGTH = 60;
const TOPIC_MAX_LENGTH = 60;
const GRADE_MIN = 1;
const GRADE_MAX = 6;
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SUPPORTED_TYPES = ['multiple-choice'];
const DEFAULT_TYPE = 'multiple-choice';

function parseTitle(rawValue, { required }) {
  if (rawValue === undefined && !required) return undefined;
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: 'title', message: 'El título es obligatorio.' }]);
  }
  const trimmed = rawValue.trim();
  if (trimmed.length > TITLE_MAX_LENGTH) {
    fail([{ field: 'title', message: `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.` }]);
  }
  return trimmed;
}

function parseSubject(rawValue, { required }) {
  if (rawValue === undefined && !required) return undefined;
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: 'subject', message: 'La asignatura es obligatoria.' }]);
  }
  const trimmed = rawValue.trim();
  if (trimmed.length > SUBJECT_MAX_LENGTH) {
    fail([{ field: 'subject', message: `La asignatura no puede superar los ${SUBJECT_MAX_LENGTH} caracteres.` }]);
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

function parseTopic(rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null || rawValue === '') return null;
  if (typeof rawValue !== 'string' || rawValue.trim().length > TOPIC_MAX_LENGTH) {
    fail([{ field: 'topic', message: 'El tema no es válido.' }]);
  }
  return rawValue.trim();
}

function parseDifficulty(rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null || rawValue === '') return null;
  if (!DIFFICULTIES.includes(rawValue)) {
    fail([{ field: 'difficulty', message: `La dificultad debe ser una de: ${DIFFICULTIES.join(', ')}.` }]);
  }
  return rawValue;
}

function parseInstruction(rawValue, { required }) {
  if (rawValue === undefined && !required) return undefined;
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: 'instruction', message: 'La instrucción es obligatoria.' }]);
  }
  return rawValue.trim();
}

function parseType(rawValue, { required }) {
  if (rawValue === undefined) {
    return required ? DEFAULT_TYPE : undefined;
  }
  if (!SUPPORTED_TYPES.includes(rawValue)) {
    fail([{ field: 'type', message: 'Este tipo de actividad todavía no está disponible.' }]);
  }
  return rawValue;
}

function parseMultipleChoiceContent(rawContent) {
  if (!rawContent || typeof rawContent !== 'object') {
    fail([{ field: 'content.question', message: 'La pregunta es obligatoria.' }]);
  }
  const question = typeof rawContent.question === 'string' ? rawContent.question.trim() : '';
  if (!question) {
    fail([{ field: 'content.question', message: 'La pregunta es obligatoria.' }]);
  }

  const rawOptions = Array.isArray(rawContent.options) ? rawContent.options : [];
  if (rawOptions.length < 2) {
    fail([{ field: 'content.options', message: 'Debe haber al menos dos opciones.' }]);
  }

  const options = rawOptions.map((option, index) => {
    const id = typeof option?.id === 'string' ? option.id.trim() : '';
    const text = typeof option?.text === 'string' ? option.text.trim() : '';
    if (!id || !text) {
      fail([{ field: `content.options[${index}]`, message: 'Cada opción debe tener identificador y texto.' }]);
    }
    return { id, text };
  });

  const ids = options.map((option) => option.id);
  if (new Set(ids).size !== ids.length) {
    fail([{ field: 'content.options', message: 'No puede haber identificadores de opción duplicados.' }]);
  }

  return { question, options };
}

function parseMultipleChoiceSolution(rawSolution, content) {
  const correctOptionId =
    typeof rawSolution?.correctOptionId === 'string' ? rawSolution.correctOptionId.trim() : '';
  if (!correctOptionId) {
    fail([{ field: 'solution.correctOptionId', message: 'Debes marcar una respuesta correcta.' }]);
  }
  const matches = content.options.some((option) => option.id === correctOptionId);
  if (!matches) {
    fail([
      {
        field: 'solution.correctOptionId',
        message: 'La respuesta correcta debe coincidir con una opción existente.',
      },
    ]);
  }
  return { correctOptionId };
}

// Único punto de extensión para futuros tipos de actividad (ver docs/MVP.md):
// agregar un nuevo `case` aquí cuando se implemente otra mecánica.
function parseContentAndSolution(type, rawContent, rawSolution) {
  switch (type) {
    case 'multiple-choice': {
      const content = parseMultipleChoiceContent(rawContent);
      const solution = parseMultipleChoiceSolution(rawSolution, content);
      return { content, solution };
    }
    default:
      return fail([{ field: 'type', message: 'Este tipo de actividad todavía no está disponible.' }]);
  }
}

function parseFeedback(rawValue) {
  if (rawValue === undefined) return undefined;
  if (rawValue === null) return null;
  if (typeof rawValue !== 'object') {
    fail([{ field: 'feedback', message: 'La retroalimentación no es válida.' }]);
  }
  const correct = typeof rawValue.correct === 'string' ? rawValue.correct.trim() : '';
  const incorrect = typeof rawValue.incorrect === 'string' ? rawValue.incorrect.trim() : '';
  return { correct: correct || null, incorrect: incorrect || null };
}

function sanitizeCreateActivityInput(input) {
  const payload = input && typeof input === 'object' ? input : {};
  const type = parseType(payload.type, { required: true });
  const title = parseTitle(payload.title, { required: true });
  const subject = parseSubject(payload.subject, { required: true });
  const grade = parseGrade(payload.grade) ?? null;
  const topic = parseTopic(payload.topic) ?? null;
  const difficulty = parseDifficulty(payload.difficulty) ?? null;
  const instruction = parseInstruction(payload.instruction, { required: true });
  const { content, solution } = parseContentAndSolution(type, payload.content, payload.solution);
  const feedback = parseFeedback(payload.feedback) ?? null;

  return {
    type,
    title,
    subject,
    grade,
    topic,
    difficulty,
    instruction,
    content,
    solution,
    feedback,
    settings: null,
  };
}

function sanitizeUpdateActivityInput(input) {
  const payload = input && typeof input === 'object' ? input : {};

  if (payload.type !== undefined) {
    fail([{ field: 'type', message: 'El tipo de una actividad no se puede modificar.' }]);
  }

  const changes = {};
  const title = parseTitle(payload.title, { required: false });
  if (title !== undefined) changes.title = title;
  const subject = parseSubject(payload.subject, { required: false });
  if (subject !== undefined) changes.subject = subject;
  const grade = parseGrade(payload.grade);
  if (grade !== undefined) changes.grade = grade;
  const topic = parseTopic(payload.topic);
  if (topic !== undefined) changes.topic = topic;
  const difficulty = parseDifficulty(payload.difficulty);
  if (difficulty !== undefined) changes.difficulty = difficulty;
  const instruction = parseInstruction(payload.instruction, { required: false });
  if (instruction !== undefined) changes.instruction = instruction;

  // El contenido y la respuesta correcta se validan cruzados entre sí
  // (correctOptionId debe existir en options), así que solo pueden
  // actualizarse juntos; el validador no consulta la base de datos.
  const hasContent = payload.content !== undefined;
  const hasSolution = payload.solution !== undefined;
  if (hasContent !== hasSolution) {
    fail([{ field: 'general', message: 'El contenido y la respuesta correcta deben actualizarse juntos.' }]);
  }
  if (hasContent && hasSolution) {
    const { content, solution } = parseContentAndSolution('multiple-choice', payload.content, payload.solution);
    changes.content = content;
    changes.solution = solution;
  }

  const feedback = parseFeedback(payload.feedback);
  if (feedback !== undefined) changes.feedback = feedback;

  if (Object.keys(changes).length === 0) {
    fail([{ field: 'general', message: 'No se recibió ningún cambio para actualizar.' }]);
  }

  return changes;
}

function sanitizeActivityId(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    fail([{ field: 'id', message: 'El identificador de la actividad no es válido.' }]);
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
  const rawGrade = payload.grade;
  const grade =
    rawGrade === undefined || rawGrade === null || rawGrade === '' ? null : Number(rawGrade);
  const subject = typeof payload.subject === 'string' && payload.subject.trim() ? payload.subject.trim() : null;

  return {
    grade: Number.isInteger(grade) ? grade : null,
    subject,
    includeInactive: payload.includeInactive !== false,
  };
}

module.exports = {
  sanitizeCreateActivityInput,
  sanitizeUpdateActivityInput,
  sanitizeActivityId,
  sanitizeIsActive,
  sanitizeListFilters,
};
