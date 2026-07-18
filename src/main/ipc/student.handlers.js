const channels = require('../../shared/constants/ipc-channels');
const { createHandler, notFoundError } = require('./ipc-response');
const {
  sanitizeCreateStudentInput,
  sanitizeUpdateStudentInput,
  sanitizeStudentId,
  sanitizeIsActive,
  sanitizeListFilters,
} = require('../../shared/validators/student.validator');

const handle = createHandler({
  notFoundMessage: 'El estudiante solicitado no existe.',
  logLabel: 'students',
});

function registerStudentHandlers({ studentRepository }) {
  handle(channels.STUDENTS_LIST, (payload) => studentRepository.list(sanitizeListFilters(payload)));

  handle(channels.STUDENTS_CREATE, (payload) =>
    studentRepository.create(sanitizeCreateStudentInput(payload))
  );

  handle(channels.STUDENTS_UPDATE, (payload) => {
    const id = sanitizeStudentId(payload && payload.id);
    const changes = sanitizeUpdateStudentInput(payload && payload.data);
    const updated = studentRepository.update(id, changes);
    if (!updated) throw notFoundError('student not found');
    return updated;
  });

  handle(channels.STUDENTS_SET_ACTIVE, (payload) => {
    const id = sanitizeStudentId(payload && payload.id);
    const isActive = sanitizeIsActive(payload && payload.isActive);
    const updated = studentRepository.setActive(id, isActive);
    if (!updated) throw notFoundError('student not found');
    return updated;
  });
}

module.exports = { registerStudentHandlers };
