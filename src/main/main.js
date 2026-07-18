const { app, BrowserWindow } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const { getDatabasePath, createDatabaseConnection } = require('./database/database');
const { runMigrations } = require('./database/migration-runner');
const migrations = require('./database/migrations');
const { createStudentRepository } = require('./database/repositories/student.repository');
const { createActivityRepository } = require('./database/repositories/activity.repository');
const { createSessionRepository } = require('./database/repositories/session.repository');
const { createProgressRepository } = require('./database/repositories/progress.repository');
const { createSessionService } = require('./services/session.service');
const { registerIpcHandlers } = require('./ipc/register-ipc-handlers');
const { seedDemoDataIfNeeded } = require('./services/demo-data.service');
const { createMainWindow } = require('./window-manager');

let db = null;

function initializeDatabase() {
  const databasePath = getDatabasePath(app.getPath('userData'));
  db = createDatabaseConnection(databasePath);
  runMigrations(db, migrations);
  return db;
}

app.whenReady().then(() => {
  initializeDatabase();

  const studentRepository = createStudentRepository(db);
  const activityRepository = createActivityRepository(db);
  const sessionRepository = createSessionRepository(db);
  const progressRepository = createProgressRepository(db);
  const sessionService = createSessionService({ db, sessionRepository, progressRepository });
  seedDemoDataIfNeeded({ db, studentRepository, activityRepository, isDev: !app.isPackaged });

  registerIpcHandlers({
    studentRepository,
    activityRepository,
    sessionService,
    sessionRepository,
    progressRepository,
  });
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    db = null;
  }
});
