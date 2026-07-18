window.AppPages = window.AppPages || {};

window.AppPages.games = (function createGamesPage() {
  const ENGINE_ID = 'multiple-choice';

  const AVATARS = {
    'cat-01': '🐱',
    'dog-01': '🐶',
    'fox-01': '🦊',
    'owl-01': '🦉',
    'bear-01': '🐻',
    'rabbit-01': '🐰',
  };

  let containerRef = null;
  let step = 'select-student'; // select-student | select-topic | playing
  let students = [];
  let selectedStudent = null;
  let studentActivities = [];
  let topics = [];
  let activeSessionActivities = [];
  let listAlert = null;
  let currentEngine = null;
  let currentSessionId = null;
  let sessionFinished = false;
  let lastKnownProgress = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function avatarEmoji(avatarId) {
    return AVATARS[avatarId] || '🙂';
  }

  function renderAlert() {
    if (!listAlert) return '';
    const cssClass = listAlert.type === 'error' ? 'alert-error' : 'alert-success';
    return `<div class="alert ${cssClass}" role="status">${escapeHtml(listAlert.message)}</div>`;
  }

  function renderHeader() {
    if (step === 'select-topic') {
      return `
        <section class="page-header">
          <h1>¿Qué quiere jugar ${escapeHtml(selectedStudent.displayName)}?</h1>
          <p>Selecciona una asignatura para comenzar.</p>
        </section>
      `;
    }
    return `
      <section class="page-header">
        <h1>Juegos</h1>
        <p>Elige quién va a jugar.</p>
      </section>
    `;
  }

  function renderStudentSelection() {
    if (students.length === 0) {
      return '<div class="card games-empty">No hay estudiantes activos todavía. Ve a la sección Estudiantes para crear uno.</div>';
    }
    const cards = students
      .map(
        (student) => `
          <button type="button" class="game-pick-card" data-action="pick-student" data-id="${student.id}">
            <span class="student-avatar">${avatarEmoji(student.avatar)}</span>
            <span class="game-pick-title">${escapeHtml(student.displayName)}</span>
            <span class="game-pick-subtitle">${student.grade ? `${student.grade}°` : 'Sin grado'}</span>
          </button>
        `
      )
      .join('');
    return `<div class="games-grid">${cards}</div>`;
  }

  function renderTopicSelection() {
    if (topics.length === 0) {
      return `
        <div class="card games-empty">
          Todavía no hay actividades disponibles para ${escapeHtml(selectedStudent.displayName)}. Crea actividades en la sección Actividades.
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="back-to-student">Elegir otro estudiante</button>
        </div>
      `;
    }

    const topicCards = topics
      .map(
        (topic) => `
          <button type="button" class="game-pick-card" data-action="pick-topic" data-subject="${escapeHtml(topic.subject)}">
            <span class="game-pick-title">${escapeHtml(topic.subject)}</span>
            <span class="game-pick-subtitle">${topic.count} pregunta${topic.count === 1 ? '' : 's'}</span>
          </button>
        `
      )
      .join('');

    return `
      <div class="games-grid">
        <button type="button" class="game-pick-card" data-action="pick-topic" data-subject="">
          <span class="game-pick-title">Todas las asignaturas</span>
          <span class="game-pick-subtitle">${studentActivities.length} pregunta${studentActivities.length === 1 ? '' : 's'}</span>
        </button>
        ${topicCards}
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" data-action="back-to-student">Elegir otro estudiante</button>
      </div>
    `;
  }

  function render(container) {
    containerRef = container;

    if (step === 'playing') {
      container.innerHTML = '<div data-slot="game-root"></div>';
      mountEngine(container.querySelector('[data-slot="game-root"]'));
      return;
    }

    container.innerHTML = `
      ${renderHeader()}
      ${renderAlert()}
      ${step === 'select-student' ? renderStudentSelection() : renderTopicSelection()}
    `;
    bindEvents();
  }

  function rerender() {
    if (containerRef) render(containerRef);
  }

  async function loadStudents() {
    try {
      students = await window.StudentService.list({ includeInactive: false });
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar la lista de estudiantes.' };
      students = [];
    }
  }

  function computeTopics() {
    const counts = new Map();
    studentActivities.forEach((activity) => {
      counts.set(activity.subject, (counts.get(activity.subject) || 0) + 1);
    });
    topics = Array.from(counts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => a.subject.localeCompare(b.subject, 'es'));
  }

  async function pickStudent(studentId) {
    selectedStudent = students.find((student) => student.id === studentId) || null;
    if (!selectedStudent) return;

    try {
      const allActive = await window.ActivityService.list({ includeInactive: false });
      // Actividades "apropiadas para su grado" (ver docs/PRODUCT.md): del
      // grado del estudiante, o sin grado asignado (aplican a cualquiera).
      studentActivities = allActive.filter(
        (activity) => !selectedStudent.grade || !activity.grade || activity.grade === selectedStudent.grade
      );
    } catch (error) {
      listAlert = { type: 'error', message: 'No se pudo cargar el banco de actividades.' };
      studentActivities = [];
    }

    computeTopics();
    step = 'select-topic';
    rerender();
  }

  function backToStudentSelection() {
    step = 'select-student';
    selectedStudent = null;
    studentActivities = [];
    topics = [];
    rerender();
  }

  function pickTopic(subject) {
    const pool = subject ? studentActivities.filter((activity) => activity.subject === subject) : studentActivities;
    if (pool.length === 0) return;
    activeSessionActivities = pool;
    step = 'playing';
    rerender();
  }

  // Si el estudiante sale o navega a otra sección sin terminar, se registra
  // como "abandoned" con el último progreso conocido (ver ADR-026). No
  // bloquea la navegación: es un intento "best effort", sin esperar la
  // respuesta de IPC.
  function abandonActiveSessionIfNeeded() {
    if (!currentSessionId || sessionFinished) return;
    const progress = lastKnownProgress || { correctAnswers: 0, incorrectAnswers: 0, score: 0 };
    const answered = progress.correctAnswers + progress.incorrectAnswers;
    window.ProgressService.finishSession(currentSessionId, {
      status: 'abandoned',
      correctAnswers: progress.correctAnswers,
      incorrectAnswers: progress.incorrectAnswers,
      unanswered: Math.max(activeSessionActivities.length - answered, 0),
      score: progress.score,
      durationSeconds: 0,
    }).catch(() => {});
    currentSessionId = null;
  }

  async function mountEngine(root) {
    currentSessionId = null;
    sessionFinished = false;
    lastKnownProgress = null;

    try {
      const session = await window.ProgressService.startSession({
        studentId: selectedStudent.id,
        engineId: ENGINE_ID,
      });
      currentSessionId = session.id;
    } catch (error) {
      // Si falla el registro de la sesión, igual se deja jugar: no debe
      // bloquear la partida por un problema de persistencia.
    }

    currentEngine = window.GameEngines.multipleChoice();
    await currentEngine.initialize({
      container: root,
      student: selectedStudent,
      activities: activeSessionActivities,
      callbacks: {
        onProgress(partialSummary) {
          lastKnownProgress = partialSummary;
        },
        async onFinish(summary) {
          sessionFinished = true;
          if (!currentSessionId) return;
          try {
            await window.ProgressService.finishSession(currentSessionId, {
              status: 'completed',
              correctAnswers: summary.correctAnswers,
              incorrectAnswers: summary.incorrectAnswers,
              unanswered: summary.unanswered,
              score: summary.score,
              durationSeconds: summary.durationSeconds || 0,
            });
          } catch (error) {
            // La pantalla de resultado ya se muestra con lo calculado en
            // memoria aunque falle el guardado.
          }
        },
        onExit() {
          abandonActiveSessionIfNeeded();
          if (currentEngine) {
            currentEngine.destroy();
            currentEngine = null;
          }
          step = 'select-topic';
          rerender();
        },
      },
    });
  }

  function bindEvents() {
    containerRef.querySelectorAll('[data-action="pick-student"]').forEach((button) => {
      button.addEventListener('click', () => pickStudent(button.dataset.id));
    });
    containerRef.querySelectorAll('[data-action="pick-topic"]').forEach((button) => {
      button.addEventListener('click', () => pickTopic(button.dataset.subject));
    });
    containerRef.querySelector('[data-action="back-to-student"]')?.addEventListener('click', backToStudentSelection);
  }

  return {
    async render(container) {
      step = 'select-student';
      selectedStudent = null;
      studentActivities = [];
      topics = [];
      listAlert = null;
      render(container);
      await loadStudents();
      rerender();
    },
    unmount() {
      abandonActiveSessionIfNeeded();
      if (currentEngine) {
        currentEngine.destroy();
        currentEngine = null;
      }
      containerRef = null;
    },
  };
})();
