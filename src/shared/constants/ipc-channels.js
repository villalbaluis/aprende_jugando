// Nombres de canal usados por el proceso principal (ipcMain) y por los
// handlers de IPC. El preload usa los mismos valores como literales propios
// (ver src/preload/preload.js) porque un preload con sandbox:true solo puede
// hacer require() de electron y de módulos nativos de Node, no de otros
// archivos del proyecto sin un bundler.
module.exports = {
  STUDENTS_LIST: 'students:list',
  STUDENTS_CREATE: 'students:create',
  STUDENTS_UPDATE: 'students:update',
  STUDENTS_SET_ACTIVE: 'students:set-active',

  ACTIVITIES_LIST: 'activities:list',
  ACTIVITIES_CREATE: 'activities:create',
  ACTIVITIES_UPDATE: 'activities:update',
  ACTIVITIES_DUPLICATE: 'activities:duplicate',
  ACTIVITIES_SET_ACTIVE: 'activities:set-active',

  SESSIONS_START: 'sessions:start',
  SESSIONS_FINISH: 'sessions:finish',
  SESSIONS_BY_STUDENT: 'sessions:by-student',

  PROGRESS_BY_STUDENT: 'progress:by-student',

  APP_INFO: 'app:info',
  WINDOW_SET_FULLSCREEN: 'window:set-fullscreen',

  DASHBOARD_SUMMARY: 'dashboard:summary',
};
