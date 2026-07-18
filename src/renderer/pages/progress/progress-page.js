window.AppPages = window.AppPages || {};

window.AppPages.progress = (function createProgressPage() {
  let containerRef = null;
  let students = [];
  let selectedStudentId = '';
  let progressRows = [];
  let sessions = [];
  let listAlert = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function formatDuration(totalSeconds) {
    const seconds = Number(totalSeconds) || 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  }

  function statusLabel(status) {
    if (status === 'completed') return '<span class="badge badge-active">Completada</span>';
    if (status === 'abandoned') return '<span class="badge badge-inactive">Abandonada</span>';
    return `<span class="badge badge-inactive">${escapeHtml(status)}</span>`;
  }

  function renderAlert() {
    if (!listAlert) return '';
    const cssClass = listAlert.type === 'error' ? 'alert-error' : 'alert-success';
    return `<div class="alert ${cssClass}" role="status">${escapeHtml(listAlert.message)}</div>`;
  }

  function renderStudentSelect() {
    const options = students
      .map(
        (student) =>
          `<option value="${student.id}" ${selectedStudentId === student.id ? 'selected' : ''}>${escapeHtml(student.displayName)}${student.isActive ? '' : ' (inactivo)'}</option>`
      )
      .join('');
    return `
      <div class="form-field progress-student-select">
        <label for="progress-student">Estudiante</label>
        <select id="progress-student" data-action="select-student">
          <option value="">Selecciona un estudiante</option>
          ${options}
        </select>
      </div>
    `;
  }

  function renderSummary() {
    if (!selectedStudentId) return '';
    if (progressRows.length === 0) {
      return '<div class="card progress-empty">Este estudiante todavía no tiene partidas registradas.</div>';
    }
    const cards = progressRows
      .map(
        (row) => `
          <div class="card progress-summary-card">
            <h3>Selección múltiple</h3>
            <div class="progress-summary-grid">
              <div class="progress-summary-item"><span class="progress-summary-value">${row.bestScore}</span><span class="progress-summary-label">Mejor puntaje</span></div>
              <div class="progress-summary-item"><span class="progress-summary-value">${row.totalSessions}</span><span class="progress-summary-label">Sesiones</span></div>
              <div class="progress-summary-item"><span class="progress-summary-value">${row.totalCorrectAnswers}</span><span class="progress-summary-label">Aciertos totales</span></div>
              <div class="progress-summary-item"><span class="progress-summary-value">${row.totalIncorrectAnswers}</span><span class="progress-summary-label">Errores totales</span></div>
            </div>
            <p class="game-meta">Última vez jugado: ${formatDate(row.lastPlayedAt)}</p>
          </div>
        `
      )
      .join('');
    return `<div class="progress-summary-list">${cards}</div>`;
  }

  function renderSessionsTable() {
    if (!selectedStudentId) return '';
    if (sessions.length === 0) return '';

    const rows = sessions
      .map((session) => {
        const total = session.correctAnswers + session.incorrectAnswers;
        const accuracy = total > 0 ? Math.round((session.correctAnswers / total) * 100) : 0;
        return `
          <tr>
            <td>${formatDate(session.startedAt)}</td>
            <td>${session.correctAnswers}</td>
            <td>${session.incorrectAnswers}</td>
            <td>${session.score}</td>
            <td>${accuracy}%</td>
            <td>${formatDuration(session.durationSeconds)}</td>
            <td>${statusLabel(session.status)}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <div class="card">
        <table class="progress-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Correctas</th><th>Incorrectas</th><th>Puntuación</th><th>% Aciertos</th><th>Duración</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  function render(container) {
    containerRef = container;
    container.innerHTML = `
      <section class="page-header">
        <h1>Progreso</h1>
        <p>Consulta el historial de partidas de cada estudiante.</p>
      </section>
      ${renderAlert()}
      ${renderStudentSelect()}
      ${renderSummary()}
      ${renderSessionsTable()}
    `;
    bindEvents();
  }

  function rerender() {
    if (containerRef) render(containerRef);
  }

  async function loadStudents() {
    try {
      students = await window.StudentService.list({ includeInactive: true });
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar la lista de estudiantes.' };
      students = [];
    }
  }

  async function selectStudent(studentId) {
    selectedStudentId = studentId;
    progressRows = [];
    sessions = [];
    if (!studentId) {
      rerender();
      return;
    }
    try {
      [progressRows, sessions] = await Promise.all([
        window.ProgressService.progressByStudent(studentId),
        window.ProgressService.sessionsByStudent(studentId),
      ]);
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar el progreso del estudiante.' };
    }
    rerender();
  }

  function bindEvents() {
    containerRef.querySelector('[data-action="select-student"]')?.addEventListener('change', (event) => {
      selectStudent(event.target.value);
    });
  }

  return {
    async render(container) {
      selectedStudentId = '';
      progressRows = [];
      sessions = [];
      listAlert = null;
      render(container);
      await loadStudents();
      rerender();
    },
    unmount() {
      containerRef = null;
    },
  };
})();
