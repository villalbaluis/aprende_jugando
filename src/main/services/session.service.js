// Coordina el repositorio de sesiones y el de progreso al terminar una
// partida, según el ejemplo de docs/ARCHITECTURE.md:
//   finishGameSession()
//       ├── guarda sesión
//       ├── actualiza progreso
//       ├── calcula mejor puntuación
//       └── devuelve resumen
function createSessionService({ db, sessionRepository, progressRepository }) {
  return {
    startSession({ studentId, engineId }) {
      return sessionRepository.start({ studentId, engineId });
    },

    finishSession({ id, status, correctAnswers, incorrectAnswers, unanswered, score, durationSeconds }) {
      const runFinish = db.transaction(() => {
        const session = sessionRepository.finish(id, {
          status,
          correctAnswers,
          incorrectAnswers,
          unanswered,
          score,
          durationSeconds,
        });
        if (!session) return null;

        const progress = progressRepository.upsertAfterSession({
          studentId: session.studentId,
          engineId: session.engineId,
          score,
          correctAnswers,
          incorrectAnswers,
          durationSeconds,
        });

        return { session, progress };
      });

      return runFinish();
    },
  };
}

module.exports = { createSessionService };
