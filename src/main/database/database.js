const path = require('node:path');
const Database = require('better-sqlite3');

function getDatabasePath(userDataPath) {
  return path.join(userDataPath, 'aprende-jugando.db');
}

// No mantiene un singleton interno a propósito: las pruebas crean su propia
// conexión (por ejemplo, en memoria) y main.js crea la conexión real de la
// aplicación una sola vez al arrancar.
function createDatabaseConnection(databasePath) {
  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

module.exports = { getDatabasePath, createDatabaseConnection };
