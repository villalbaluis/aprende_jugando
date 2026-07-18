const channels = require('../../shared/constants/ipc-channels');
const { createHandler } = require('./ipc-response');

const handle = createHandler({
  notFoundMessage: 'No aplica.',
  logLabel: 'dashboard',
});

// Indicadores de "Inicio" (ver docs/MVP.md): ya no son datos demostrativos,
// se calculan sobre datos reales ahora que Actividades/Juegos/Progreso
// existen.
function registerDashboardHandlers({ studentRepository, activityRepository, sessionRepository }) {
  handle(channels.DASHBOARD_SUMMARY, () => ({
    studentsCount: studentRepository.countAll(),
    activitiesCount: activityRepository.countActive(),
    sessionsCount: sessionRepository.countAll(),
    averageAccuracyPercent: sessionRepository.getAverageAccuracyPercent(),
  }));
}

module.exports = { registerDashboardHandlers };
