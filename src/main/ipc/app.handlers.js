const { app, BrowserWindow } = require('electron');
const channels = require('../../shared/constants/ipc-channels');
const { createHandler } = require('./ipc-response');
const { sanitizeSetFullscreenInput } = require('../../shared/validators/app.validator');

const handle = createHandler({
  notFoundMessage: 'No aplica.',
  logLabel: 'app',
});

// Configuración (sonido, volumen, modo de pantalla) se guarda en el
// renderer vía localStorage, no en SQLite (ver docs/DECISIONS.md, ADR-027).
// Estos dos canales son la única parte que sí necesita al proceso
// principal: leer información de la app y aplicar el modo de pantalla real
// a la ventana.
function registerAppHandlers() {
  handle(channels.APP_INFO, () => ({
    version: app.getVersion(),
    userDataPath: app.getPath('userData'),
  }));

  handle(channels.WINDOW_SET_FULLSCREEN, (payload) => {
    const { fullscreen } = sanitizeSetFullscreenInput(payload);
    const window = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (window) window.setFullScreen(fullscreen);
    return { fullscreen };
  });
}

module.exports = { registerAppHandlers };
