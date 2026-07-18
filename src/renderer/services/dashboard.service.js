// Envoltorio delgado sobre window.learningAPI.dashboard. El renderer nunca
// llama IPC ni Node.js directamente (ver docs/ARCHITECTURE.md).
window.DashboardService = {
  getSummary() {
    return window.learningAPI.dashboard.getSummary();
  },
};
