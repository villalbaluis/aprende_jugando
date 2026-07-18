// Router propio, 100% en memoria (sin librería externa, ver
// docs/DECISIONS.md, ADR-021). Cada página es un objeto {render(container)}
// registrado en window.AppPages y cargado por <script> clásicos en
// index.html (no se usan módulos ES para evitar problemas de carga de
// módulos sobre el protocolo file://).
//
// Deliberadamente NO usa window.location/location.hash: bajo Electron con
// sandbox:true y contenido servido por file://, Chromium bloquea la
// navegación por hash como un intento de navegación a un origen "único"
// ("'file:' URLs are treated as unique security origins"), lo que rompía la
// navegación y dejaba window.learningAPI indefinido tras el bloqueo (ver
// ADR-021). La ruta actual vive únicamente en una variable JS.
window.AppRouter = (function createRouter() {
  const routes = new Map();
  let viewRoot = null;
  let navButtons = [];
  let defaultRoute = null;
  let currentPage = null;
  let currentRouteName = null;

  function updateActiveNav(routeName) {
    navButtons.forEach((button) => {
      const isActive = button.dataset.route === routeName;
      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  }

  function renderRoute(name) {
    const routeName = routes.has(name) ? name : defaultRoute;
    const page = routes.get(routeName);
    if (!page) return;

    if (currentPage && typeof currentPage.unmount === 'function') {
      currentPage.unmount();
    }

    viewRoot.innerHTML = '';
    page.render(viewRoot);
    currentPage = page;
    currentRouteName = routeName;
    updateActiveNav(routeName);
    viewRoot.focus();
  }

  function register(name, page) {
    routes.set(name, page);
  }

  function navigate(name) {
    // Siempre vuelve a renderizar, incluso si ya es la ruta activa: preserva
    // el comportamiento previo de "reiniciar" el estado interno de la
    // página al hacer clic de nuevo en la misma sección.
    renderRoute(name);
  }

  function init({ root, navSelector, initialRoute }) {
    viewRoot = root;
    navButtons = Array.from(document.querySelectorAll(navSelector));
    defaultRoute = initialRoute;

    navButtons.forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.route));
    });

    renderRoute(initialRoute);
  }

  return { register, navigate, init };
})();
