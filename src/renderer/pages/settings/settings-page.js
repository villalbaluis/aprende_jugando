window.AppPages = window.AppPages || {};

window.AppPages.settings = (function createSettingsPage() {
  let containerRef = null;
  let settings = null;
  let appInfo = null;
  let statusAlert = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

  function renderAlert() {
    if (!statusAlert) return '';
    const cssClass = statusAlert.type === 'error' ? 'alert-error' : 'alert-success';
    return `<div class="alert ${cssClass}" role="status">${escapeHtml(statusAlert.message)}</div>`;
  }

  function render(container) {
    containerRef = container;
    const musicPercent = Math.round(settings.audio.musicVolume * 100);
    const effectsPercent = Math.round(settings.audio.effectsVolume * 100);

    container.innerHTML = `
      <section class="page-header">
        <h1>Configuración</h1>
        <p>Estas preferencias se guardan en este computador (no viajan con la base de datos ni con copias de seguridad).</p>
      </section>
      ${renderAlert()}
      <div class="card settings-card">
        <h2>Sonido</h2>
        <label class="settings-checkbox-field">
          <input type="checkbox" data-action="toggle-audio" ${settings.audio.enabled ? 'checked' : ''} />
          Sonido activado
        </label>
        <div class="form-field">
          <label for="music-volume">Volumen de música (${musicPercent}%)</label>
          <input id="music-volume" type="range" min="0" max="100" step="5" data-action="music-volume"
            value="${musicPercent}" ${settings.audio.enabled ? '' : 'disabled'} />
        </div>
        <div class="form-field">
          <label for="effects-volume">Volumen de efectos (${effectsPercent}%)</label>
          <input id="effects-volume" type="range" min="0" max="100" step="5" data-action="effects-volume"
            value="${effectsPercent}" ${settings.audio.enabled ? '' : 'disabled'} />
        </div>
      </div>
      <div class="card settings-card">
        <h2>Pantalla</h2>
        <div class="form-field settings-display-field">
          <label for="display-mode">Modo de pantalla</label>
          <select id="display-mode" data-action="display-mode">
            <option value="window" ${!settings.interface.fullscreen ? 'selected' : ''}>Ventana</option>
            <option value="fullscreen" ${settings.interface.fullscreen ? 'selected' : ''}>Pantalla completa</option>
          </select>
        </div>
      </div>
      <div class="card settings-card">
        <h2>Información</h2>
        <p><strong>Versión:</strong> ${escapeHtml(appInfo ? appInfo.version : '—')}</p>
        <p><strong>Ubicación de los datos:</strong> ${escapeHtml(appInfo ? appInfo.userDataPath : '—')}</p>
        <p class="settings-note">Las copias de seguridad automáticas todavía no están implementadas; mientras tanto, esta es la carpeta donde vive la base de datos.</p>
      </div>
    `;
    bindEvents();
  }

  function rerender() {
    if (containerRef) render(containerRef);
  }

  function persist() {
    window.SettingsService.save(settings);
  }

  function bindEvents() {
    containerRef.querySelector('[data-action="toggle-audio"]')?.addEventListener('change', (event) => {
      settings.audio.enabled = event.target.checked;
      persist();
      rerender();
    });

    containerRef.querySelector('[data-action="music-volume"]')?.addEventListener('change', (event) => {
      settings.audio.musicVolume = Number(event.target.value) / 100;
      persist();
      rerender();
    });

    containerRef.querySelector('[data-action="effects-volume"]')?.addEventListener('change', (event) => {
      settings.audio.effectsVolume = Number(event.target.value) / 100;
      persist();
      rerender();
    });

    containerRef.querySelector('[data-action="display-mode"]')?.addEventListener('change', async (event) => {
      const fullscreen = event.target.value === 'fullscreen';
      settings.interface.fullscreen = fullscreen;
      persist();
      try {
        await window.learningAPI.appWindow.setFullscreen(fullscreen);
        statusAlert = null;
      } catch (error) {
        statusAlert = { type: 'error', message: 'No se pudo cambiar el modo de pantalla de la ventana.' };
      }
      rerender();
    });
  }

  return {
    async render(container) {
      settings = window.SettingsService.load();
      appInfo = null;
      statusAlert = null;
      render(container);
      try {
        appInfo = await window.learningAPI.app.getInfo();
      } catch (error) {
        statusAlert = { type: 'error', message: 'No se pudo consultar la información de la aplicación.' };
      }
      rerender();
    },
    unmount() {
      containerRef = null;
    },
  };
})();
