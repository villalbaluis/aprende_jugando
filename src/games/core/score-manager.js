// Lógica de puntuación, independiente de Electron y de cualquier motor
// concreto (ver docs/ARCHITECTURE.md). Se carga tanto desde el renderer
// (como <script> clásico, adjuntándose a window.GameCore) como desde
// pruebas con `require()` bajo Node - de ahí el doble export.
(function (root) {
  const POINTS_PER_CORRECT = 10;

  function createScoreManager({ pointsPerCorrect = POINTS_PER_CORRECT } = {}) {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    return {
      registerCorrect() {
        correct += 1;
      },
      registerIncorrect() {
        incorrect += 1;
      },
      registerUnanswered() {
        unanswered += 1;
      },
      getSummary() {
        const total = correct + incorrect + unanswered;
        const accuracyPercent = total > 0 ? Math.round((correct / total) * 100) : 0;
        return {
          correctAnswers: correct,
          incorrectAnswers: incorrect,
          unanswered,
          totalQuestions: total,
          score: correct * pointsPerCorrect,
          accuracyPercent,
        };
      },
    };
  }

  const api = { createScoreManager };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GameCore = Object.assign(root.GameCore || {}, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);
