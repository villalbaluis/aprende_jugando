const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');

const { runMigrations } = require('../../../src/main/database/migration-runner');

function createInMemoryDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  return db;
}

test('runMigrations crea schema_migrations y aplica una migración pendiente', () => {
  const db = createInMemoryDb();
  const migration = {
    version: 1,
    name: 'create_dummy',
    up(database) {
      database.exec('CREATE TABLE dummy (id TEXT PRIMARY KEY);');
    },
  };

  const applied = runMigrations(db, [migration]);

  assert.deepEqual(applied, [1]);
  const row = db.prepare('SELECT version, name FROM schema_migrations WHERE version = 1').get();
  assert.equal(row.name, 'create_dummy');

  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dummy'")
    .get();
  assert.ok(tableExists, 'la tabla dummy debe existir tras la migración');

  db.close();
});

test('runMigrations no vuelve a aplicar una migración ya registrada', () => {
  const db = createInMemoryDb();
  let executions = 0;
  const migration = {
    version: 1,
    name: 'create_dummy',
    up(database) {
      executions += 1;
      database.exec('CREATE TABLE dummy (id TEXT PRIMARY KEY);');
    },
  };

  runMigrations(db, [migration]);
  const secondRun = runMigrations(db, [migration]);

  assert.equal(executions, 1);
  assert.deepEqual(secondRun, []);

  db.close();
});

test('runMigrations aplica solo las migraciones nuevas al actualizar una base existente', () => {
  const db = createInMemoryDb();
  const migrationV1 = {
    version: 1,
    name: 'create_dummy',
    up(database) {
      database.exec('CREATE TABLE dummy (id TEXT PRIMARY KEY);');
    },
  };
  const migrationV2 = {
    version: 2,
    name: 'add_dummy_column',
    up(database) {
      database.exec('ALTER TABLE dummy ADD COLUMN label TEXT;');
    },
  };

  runMigrations(db, [migrationV1]);
  const secondRun = runMigrations(db, [migrationV1, migrationV2]);

  assert.deepEqual(secondRun, [2]);
  const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();
  assert.deepEqual(versions.map((row) => row.version), [1, 2]);

  db.close();
});

test('runMigrations revierte los cambios si una migración falla', () => {
  const db = createInMemoryDb();
  const failingMigration = {
    version: 1,
    name: 'broken_migration',
    up(database) {
      database.exec('CREATE TABLE dummy (id TEXT PRIMARY KEY);');
      throw new Error('fallo simulado');
    },
  };

  assert.throws(() => runMigrations(db, [failingMigration]));

  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dummy'")
    .get();
  assert.equal(tableExists, undefined, 'la transacción debe revertirse por completo');

  const migrationRow = db.prepare('SELECT * FROM schema_migrations WHERE version = 1').get();
  assert.equal(migrationRow, undefined, 'la migración fallida no debe quedar registrada');

  db.close();
});
