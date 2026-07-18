// Envoltorio delgado sobre window.learningAPI.students. El renderer nunca
// llama IPC ni Node.js directamente (ver docs/ARCHITECTURE.md).
window.StudentService = {
  list(filters) {
    return window.learningAPI.students.list(filters);
  },
  create(data) {
    return window.learningAPI.students.create(data);
  },
  update(id, data) {
    return window.learningAPI.students.update(id, data);
  },
  setActive(id, isActive) {
    return window.learningAPI.students.setActive(id, isActive);
  },
};
