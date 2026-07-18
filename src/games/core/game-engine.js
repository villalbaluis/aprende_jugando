// Contrato conceptual de un motor de juego (ver docs/ARCHITECTURE.md,
// sección "Motores de juego"). No se usa como clase base obligatoria -
// cada motor (por ejemplo multiple-choice) implementa este mismo shape de
// forma independiente, sin depender de Electron ni de IPC.
//
//   initialize(config) -> Promise<void>
//   start()
//   pause()
//   resume()
//   finish()
//   destroy()
//
// `config` recibido por `initialize` debe incluir al menos:
//   container: HTMLElement donde el motor renderiza su interfaz
//   student: { id, displayName, grade, avatar }
//   activities: actividades ya cargadas desde SQLite (vía IPC, fuera del motor)
//   callbacks: { onFinish(summary), onExit() }
(function (root) {
  const GAME_ENGINE_CONTRACT_METHODS = ['initialize', 'start', 'pause', 'resume', 'finish', 'destroy'];

  const api = { GAME_ENGINE_CONTRACT_METHODS };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GameCore = Object.assign(root.GameCore || {}, api);
  }
})(typeof window !== 'undefined' ? window : globalThis);
