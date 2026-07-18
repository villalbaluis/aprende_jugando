// Representa una sesión de juego en memoria (sin persistencia todavía: ver
// docs/DECISIONS.md, ADR-024 - `game_sessions`/`progress` quedan para un
// corte posterior). La forma del resumen que produce ya coincide con las
// columnas de `game_sessions` en docs/DATA_MODEL.md para que ese corte
// futuro solo tenga que guardar este objeto, sin rediseñarlo.
(function (root) {
  function createGameSession({ studentId, engineId, activities }) {
    const startedAt = new Date().toISOString();
    const answers = [];
    let finishedAt = null;
    let status = 'started';

    return {
      studentId,
      engineId,
      startedAt,
      activities,

      recordAnswer({ activityId, isCorrect, selectedOptionId }) {
        answers.push({
          activityId,
          isCorrect,
          selectedOptionId,
          answeredAt: new Date().toISOString(),
        });
      },

      getAnswers() {
        return answers.slice();
      },

      finish(finalStatus = 'completed') {
        finishedAt = new Date().toISOString();
        status = finalStatus;
      },

      getSummary(scoreSummary) {
        const durationSeconds = finishedAt
          ? Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
          : null;
        return {
          studentId,
          engineId,
          startedAt,
          finishedAt,
          status,
          durationSeconds,
          answers: answers.slice(),
          ...scoreSummary,
        };
      },
    };
  }

  const api = { createGameSession };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GameCore = Object.assign(root.GameCore || {}, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);
