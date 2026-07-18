const { contextBridge, ipcRenderer } = require('electron');

// Los nombres de canal se repiten aquí como literales (no se importa
// src/shared/constants/ipc-channels.js) porque un preload con sandbox:true
// solo puede hacer require() de electron y de módulos nativos de Node, no de
// archivos del proyecto, salvo que se use un bundler (ver docs/DECISIONS.md).
// Deben mantenerse en sincronía con ese archivo.
const STUDENTS_LIST = 'students:list';
const STUDENTS_CREATE = 'students:create';
const STUDENTS_UPDATE = 'students:update';
const STUDENTS_SET_ACTIVE = 'students:set-active';

const ACTIVITIES_LIST = 'activities:list';
const ACTIVITIES_CREATE = 'activities:create';
const ACTIVITIES_UPDATE = 'activities:update';
const ACTIVITIES_DUPLICATE = 'activities:duplicate';
const ACTIVITIES_SET_ACTIVE = 'activities:set-active';

const SESSIONS_START = 'sessions:start';
const SESSIONS_FINISH = 'sessions:finish';
const SESSIONS_BY_STUDENT = 'sessions:by-student';

const PROGRESS_BY_STUDENT = 'progress:by-student';

const APP_INFO = 'app:info';
const WINDOW_SET_FULLSCREEN = 'window:set-fullscreen';

const DASHBOARD_SUMMARY = 'dashboard:summary';

function unwrap(response) {
  if (response && response.ok) return response.data;
  const errorInfo = (response && response.error) || {
    code: 'unexpected_error',
    message: 'Ocurrió un error inesperado.',
  };
  const error = new Error(errorInfo.message);
  error.code = errorInfo.code;
  error.issues = errorInfo.issues;
  throw error;
}

contextBridge.exposeInMainWorld('learningAPI', {
  students: {
    list: (filters) => ipcRenderer.invoke(STUDENTS_LIST, filters).then(unwrap),
    create: (data) => ipcRenderer.invoke(STUDENTS_CREATE, data).then(unwrap),
    update: (id, data) => ipcRenderer.invoke(STUDENTS_UPDATE, { id, data }).then(unwrap),
    setActive: (id, isActive) =>
      ipcRenderer.invoke(STUDENTS_SET_ACTIVE, { id, isActive }).then(unwrap),
  },
  activities: {
    list: (filters) => ipcRenderer.invoke(ACTIVITIES_LIST, filters).then(unwrap),
    create: (data) => ipcRenderer.invoke(ACTIVITIES_CREATE, data).then(unwrap),
    update: (id, data) => ipcRenderer.invoke(ACTIVITIES_UPDATE, { id, data }).then(unwrap),
    duplicate: (id) => ipcRenderer.invoke(ACTIVITIES_DUPLICATE, { id }).then(unwrap),
    setActive: (id, isActive) =>
      ipcRenderer.invoke(ACTIVITIES_SET_ACTIVE, { id, isActive }).then(unwrap),
  },
  sessions: {
    start: (data) => ipcRenderer.invoke(SESSIONS_START, data).then(unwrap),
    finish: (data) => ipcRenderer.invoke(SESSIONS_FINISH, data).then(unwrap),
    byStudent: (studentId) => ipcRenderer.invoke(SESSIONS_BY_STUDENT, { studentId }).then(unwrap),
  },
  progress: {
    byStudent: (studentId) => ipcRenderer.invoke(PROGRESS_BY_STUDENT, { studentId }).then(unwrap),
  },
  app: {
    getInfo: () => ipcRenderer.invoke(APP_INFO).then(unwrap),
  },
  appWindow: {
    setFullscreen: (fullscreen) => ipcRenderer.invoke(WINDOW_SET_FULLSCREEN, { fullscreen }).then(unwrap),
  },
  dashboard: {
    getSummary: () => ipcRenderer.invoke(DASHBOARD_SUMMARY).then(unwrap),
  },
});
