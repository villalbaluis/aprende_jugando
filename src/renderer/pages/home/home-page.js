window.AppPages = window.AppPages || {};

window.AppPages.home = (function createHomePage() {
  let containerRef = null;
  let summary = null;
  let loadError = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function renderStatCard(value, label) {
    return `
      <div class="card home-stat-card">
        <span class="home-stat-value">${escapeHtml(value)}</span>
        <span class="home-stat-label">${escapeHtml(label)}</span>
      </div>
    `;
  }

  function renderStats() {
    if (!summary) {
      return '<div class="card home-empty">Cargando indicadores…</div>';
    }
    const accuracyLabel =
      summary.averageAccuracyPercent === null ? 'Sin partidas todavía' : `${summary.averageAccuracyPercent}%`;
    return `
      <div class="home-stats-grid">
        ${renderStatCard(summary.studentsCount, 'Estudiantes registrados')}
        ${renderStatCard(summary.activitiesCount, 'Actividades disponibles')}
        ${renderStatCard(summary.sessionsCount, 'Sesiones realizadas')}
        ${renderStatCard(accuracyLabel, 'Promedio general de aciertos')}
      </div>
    `;
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      <section class="page-header">
        <h1>Inicio</h1>
        <p>Resumen general de Aprende Jugando.</p>
      </section>
      ${loadError ? `<div class="alert alert-error" role="status">${escapeHtml(loadError)}</div>` : ''}
      ${renderStats()}
    `;
  }

  return {
    async render(container) {
      summary = null;
      loadError = null;
      render(container);
      try {
        summary = await window.DashboardService.getSummary();
      } catch (error) {
        loadError = 'No se pudieron cargar los indicadores.';
      }
      render(container);
    },
    unmount() {
      containerRef = null;
    },
  };
})();
