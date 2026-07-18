// Motor de selección múltiple. No importa `electron` ni usa IPC: recibe
// todo lo que necesita (estudiante, actividades ya cargadas) por `config`
// y solo manipula el `container` que le entregan (ver docs/ARCHITECTURE.md,
// "Motores de juego", y AGENTS.md: "Keep game engines independent of
// Electron-specific APIs").
window.GameEngines = window.GameEngines || {};

window.GameEngines.multipleChoice = function createMultipleChoiceEngine() {
  let container = null;
  let student = null;
  let activities = [];
  let callbacks = {};
  let session = null;
  let scoreManager = null;

  let state = 'idle';
  let currentIndex = 0;
  let currentOptions = [];
  let selectedOptionId = null;
  let isPaused = false;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function currentActivity() {
    return activities[currentIndex];
  }

  function renderInstructions() {
    return `
      <div class="game-card">
        <span class="game-tag">Selección múltiple</span>
        <h2>¿Cómo se juega?</h2>
        <p>Lee cada pregunta con calma y elige la respuesta correcta. Al final verás tu puntuación.</p>
        <p class="game-meta">Estudiante: <strong>${escapeHtml(student.displayName)}</strong> · ${activities.length} pregunta${activities.length === 1 ? '' : 's'}</p>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="start">Comenzar</button>
          <button type="button" class="btn btn-secondary" data-action="exit">Volver al menú</button>
        </div>
      </div>
    `;
  }

  function renderQuestion() {
    const activity = currentActivity();
    const optionsHtml = currentOptions
      .map(
        (option) => `
          <button type="button" class="game-option" data-action="select-option" data-option-id="${escapeHtml(option.id)}">
            ${escapeHtml(option.text)}
          </button>
        `
      )
      .join('');

    return `
      <div class="game-card">
        <p class="game-progress">Pregunta ${currentIndex + 1} de ${activities.length}</p>
        <p class="game-instruction">${escapeHtml(activity.instruction)}</p>
        <h2>${escapeHtml(activity.content.question)}</h2>
        <div class="game-options">${optionsHtml}</div>
      </div>
    `;
  }

  function renderFeedback() {
    const activity = currentActivity();
    const isCorrect = selectedOptionId === activity.solution.correctOptionId;
    const feedbackText = isCorrect
      ? (activity.feedback && activity.feedback.correct) || '¡Correcto!'
      : (activity.feedback && activity.feedback.incorrect) || 'Respuesta incorrecta.';
    const isLast = currentIndex === activities.length - 1;

    const optionsHtml = currentOptions
      .map((option) => {
        const classes = ['game-option', 'game-option-disabled'];
        let marker = '';
        if (option.id === activity.solution.correctOptionId) {
          classes.push('game-option-correct');
          marker = ' ✓';
        } else if (option.id === selectedOptionId) {
          classes.push('game-option-incorrect');
          marker = ' ✗';
        }
        return `<button type="button" class="${classes.join(' ')}" disabled>${escapeHtml(option.text)}${marker}</button>`;
      })
      .join('');

    return `
      <div class="game-card">
        <p class="game-progress">Pregunta ${currentIndex + 1} de ${activities.length}</p>
        <p class="game-instruction">${escapeHtml(activity.instruction)}</p>
        <h2>${escapeHtml(activity.content.question)}</h2>
        <div class="game-options">${optionsHtml}</div>
        <div class="game-feedback ${isCorrect ? 'game-feedback-correct' : 'game-feedback-incorrect'}" role="status">
          ${isCorrect ? '✓' : '✗'} ${escapeHtml(feedbackText)}
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="next">${isLast ? 'Ver resultado' : 'Siguiente pregunta'}</button>
        </div>
      </div>
    `;
  }

  function renderResult() {
    const summary = scoreManager.getSummary();
    return `
      <div class="game-card">
        <h2>Resultado</h2>
        <p class="game-meta">${escapeHtml(student.displayName)}</p>
        <div class="game-result-grid">
          <div class="game-result-item"><span class="game-result-value">${summary.score}</span><span class="game-result-label">Puntos</span></div>
          <div class="game-result-item"><span class="game-result-value">${summary.correctAnswers}</span><span class="game-result-label">Correctas</span></div>
          <div class="game-result-item"><span class="game-result-value">${summary.incorrectAnswers}</span><span class="game-result-label">Incorrectas</span></div>
          <div class="game-result-item"><span class="game-result-value">${summary.accuracyPercent}%</span><span class="game-result-label">Aciertos</span></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" data-action="exit">Volver al menú</button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    container.querySelector('[data-action="start"]')?.addEventListener('click', () => engine.start());
    container.querySelector('[data-action="exit"]')?.addEventListener('click', () => {
      if (callbacks.onExit) callbacks.onExit();
    });
    container.querySelectorAll('[data-action="select-option"]').forEach((button) => {
      button.addEventListener('click', () => selectOption(button.dataset.optionId));
    });
    container.querySelector('[data-action="next"]')?.addEventListener('click', () => nextQuestion());
  }

  function render() {
    if (!container) return;
    let html = '';
    if (state === 'instructions') html = renderInstructions();
    else if (state === 'question') html = renderQuestion();
    else if (state === 'feedback') html = renderFeedback();
    else if (state === 'result') html = renderResult();

    container.innerHTML = `<div class="game-shell" tabindex="-1">${html}</div>`;
    bindEvents();
    container.querySelector('.game-shell')?.focus();
  }

  function beginQuestion() {
    const activity = currentActivity();
    // settings queda null en todas las actividades de este corte (el
    // formulario de creación todavía no lo recolecta, ver ADR-023), lo que
    // equivale al valor por defecto documentado shuffleOptions:true.
    const shuffleEnabled = !activity.settings || activity.settings.shuffleOptions !== false;
    currentOptions = shuffleEnabled ? shuffle(activity.content.options) : activity.content.options.slice();
    selectedOptionId = null;
    state = 'question';
    render();
  }

  function selectOption(optionId) {
    if (state !== 'question' || isPaused) return;
    const activity = currentActivity();
    selectedOptionId = optionId;
    const isCorrect = optionId === activity.solution.correctOptionId;
    if (isCorrect) scoreManager.registerCorrect();
    else scoreManager.registerIncorrect();
    session.recordAnswer({ activityId: activity.id, isCorrect, selectedOptionId: optionId });
    if (callbacks.onProgress) callbacks.onProgress(scoreManager.getSummary());
    state = 'feedback';
    render();
  }

  function nextQuestion() {
    if (currentIndex < activities.length - 1) {
      currentIndex += 1;
      beginQuestion();
      return;
    }
    session.finish('completed');
    state = 'result';
    render();
    if (callbacks.onFinish) callbacks.onFinish(session.getSummary(scoreManager.getSummary()));
  }

  const engine = {
    async initialize(config) {
      container = config.container;
      student = config.student;
      activities = config.activities;
      callbacks = config.callbacks || {};
      session = window.GameCore.createGameSession({
        studentId: student.id,
        engineId: 'multiple-choice',
        activities,
      });
      scoreManager = window.GameCore.createScoreManager();
      currentIndex = 0;
      state = 'instructions';
      render();
    },
    start() {
      currentIndex = 0;
      beginQuestion();
    },
    pause() {
      isPaused = true;
    },
    resume() {
      isPaused = false;
    },
    finish() {
      session.finish('abandoned');
      state = 'result';
      render();
    },
    destroy() {
      if (container) container.innerHTML = '';
      container = null;
    },
  };

  return engine;
};
