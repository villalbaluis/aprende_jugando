(function bootstrap() {
  window.AppRouter.register('home', window.AppPages.home);
  window.AppRouter.register('students', window.AppPages.students);
  window.AppRouter.register('activities', window.AppPages.activities);
  window.AppRouter.register('games', window.AppPages.games);
  window.AppRouter.register('progress', window.AppPages.progress);
  window.AppRouter.register('settings', window.AppPages.settings);

  window.AppRouter.init({
    root: document.getElementById('view-root'),
    navSelector: '.nav-item',
    initialRoute: 'home',
  });
})();
