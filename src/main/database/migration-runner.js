function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

function getAppliedVersions(db) {
  const rows = db.prepare('SELECT version FROM schema_migrations').all();
  return new Set(rows.map((row) => row.version));
}

// Ejecuta las migraciones pendientes en orden de versión, cada una dentro de
// su propia transacción. Una migración ya registrada en schema_migrations
// nunca se vuelve a ejecutar (soporta actualizar una base existente sin
// perder datos, ver docs/ARCHITECTURE.md).
function runMigrations(db, migrations) {
  ensureMigrationsTable(db);
  const applied = getAppliedVersions(db);
  const pending = [...migrations]
    .sort((a, b) => a.version - b.version)
    .filter((migration) => !applied.has(migration.version));

  for (const migration of pending) {
    const applyMigration = db.transaction(() => {
      migration.up(db);
      db.prepare(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)'
      ).run(migration.version, migration.name, new Date().toISOString());
    });
    applyMigration();
  }

  return pending.map((migration) => migration.version);
}

module.exports = { runMigrations };
