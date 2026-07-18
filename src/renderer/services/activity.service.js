// Envoltorio delgado sobre window.learningAPI.activities. El renderer nunca
// llama IPC ni Node.js directamente (ver docs/ARCHITECTURE.md).
window.ActivityService = {
  list(filters) {
    return window.learningAPI.activities.list(filters);
  },
  create(data) {
    return window.learningAPI.activities.create(data);
  },
  update(id, data) {
    return window.learningAPI.activities.update(id, data);
  },
  duplicate(id) {
    return window.learningAPI.activities.duplicate(id);
  },
  setActive(id, isActive) {
    return window.learningAPI.activities.setActive(id, isActive);
  },
};
