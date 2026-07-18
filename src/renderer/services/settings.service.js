// Configuración local del docente (sonido, volumen, modo de pantalla).
// Se guarda en localStorage, no en SQLite (ver docs/DECISIONS.md, ADR-027):
// son preferencias de esta máquina, no datos que deban respaldarse ni
// sincronizarse junto con estudiantes/actividades/progreso.
window.SettingsService = (function createSettingsService() {
  const STORAGE_KEY = 'aprende-jugando:settings';

  const DEFAULTS = {
    audio: { enabled: true, musicVolume: 0.5, effectsVolume: 0.8 },
    interface: { fullscreen: false },
  };

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function load() {
    let stored = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch (error) {
      stored = null;
    }
    const defaults = cloneDefaults();
    return {
      audio: { ...defaults.audio, ...(stored && stored.audio ? stored.audio : {}) },
      interface: { ...defaults.interface, ...(stored && stored.interface ? stored.interface : {}) },
    };
  }

  function save(settings) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // localStorage puede fallar (modo privado, cuota llena); no bloquea
      // el uso de la configuración durante esta sesión.
    }
  }

  return { load, save };
})();
