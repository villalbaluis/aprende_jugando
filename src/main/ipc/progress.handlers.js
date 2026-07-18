const channels = require('../../shared/constants/ipc-channels');
const { createHandler } = require('./ipc-response');
const { sanitizeStudentIdParam } = require('../../shared/validators/session.validator');

const handle = createHandler({
  notFoundMessage: 'El progreso solicitado no existe.',
  logLabel: 'progress',
});

function registerProgressHandlers({ progressRepository }) {
  handle(channels.PROGRESS_BY_STUDENT, (payload) => {
    const studentId = sanitizeStudentIdParam(payload && payload.studentId);
    return progressRepository.listByStudent(studentId);
  });
}

module.exports = { registerProgressHandlers };
