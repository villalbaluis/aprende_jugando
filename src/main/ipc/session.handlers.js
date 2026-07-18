const channels = require('../../shared/constants/ipc-channels');
const { createHandler, notFoundError } = require('./ipc-response');
const {
  sanitizeStartSessionInput,
  sanitizeFinishSessionInput,
  sanitizeStudentIdParam,
} = require('../../shared/validators/session.validator');

const handle = createHandler({
  notFoundMessage: 'La sesión solicitada no existe.',
  logLabel: 'sessions',
});

function registerSessionHandlers({ sessionService, sessionRepository }) {
  handle(channels.SESSIONS_START, (payload) => sessionService.startSession(sanitizeStartSessionInput(payload)));

  handle(channels.SESSIONS_FINISH, (payload) => {
    const data = sanitizeFinishSessionInput(payload);
    const result = sessionService.finishSession(data);
    if (!result) throw notFoundError('session not found');
    return result;
  });

  handle(channels.SESSIONS_BY_STUDENT, (payload) => {
    const studentId = sanitizeStudentIdParam(payload && payload.studentId);
    return sessionRepository.listByStudent(studentId);
  });
}

module.exports = { registerSessionHandlers };
