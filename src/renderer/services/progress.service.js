// Envoltorio delgado sobre window.learningAPI.sessions/progress. El
// renderer nunca llama IPC ni Node.js directamente (ver docs/ARCHITECTURE.md).
window.ProgressService = {
  startSession(data) {
    return window.learningAPI.sessions.start(data);
  },
  finishSession(id, data) {
    return window.learningAPI.sessions.finish({ id, ...data });
  },
  sessionsByStudent(studentId) {
    return window.learningAPI.sessions.byStudent(studentId);
  },
  progressByStudent(studentId) {
    return window.learningAPI.progress.byStudent(studentId);
  },
};
