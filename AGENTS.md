# AGENTS.md

## Project overview

This repository contains an offline-first educational desktop application for primary-school children.

The application is built with Electron, HTML, CSS, JavaScript and SQLite. It must run locally on Windows without requiring teachers to install Node.js, SQLite, Python or any additional server.

Read the following documents before making architectural or product changes:

* `docs/PRODUCT.md`
* `docs/ARCHITECTURE.md`
* `docs/MVP.md`
* `docs/DATA_MODEL.md`
* `docs/DECISIONS.md`

## Product principles

* The application must work completely offline.
* The teacher must interact through friendly forms, never by editing JSON manually.
* Educational content and game mechanics must remain separated.
* The system must support reusable configurable game engines and specialized games.
* Student progress must be stored locally.
* Avoid collecting unnecessary personal information about children.
* Accessibility and ease of use are core product requirements.

## Technical rules

* Use Electron Forge for development and packaging.
* Use plain JavaScript initially unless the project documents explicitly approve TypeScript.
* Use `better-sqlite3` only from Electron's main process.
* Never expose Node.js, SQLite or filesystem access directly to the renderer.
* Use `contextIsolation: true`.
* Use a limited preload API through `contextBridge`.
* Communicate between renderer and main through validated IPC handlers.
* Store mutable data under `app.getPath("userData")`.
* Never write mutable data inside `app.asar`, `resources`, `src` or the installation directory.
* Use database migrations. Never delete or recreate an existing user database during an update.
* Use UUIDs for persistent entity identifiers.
* Store dates as ISO 8601 UTC strings.
* Keep SQL inside database repositories or services.
* Keep game engines independent of Electron-specific APIs.
* Do not load fonts, libraries, images, scripts or audio from CDNs.
* Every runtime dependency must work offline.

## Architecture boundaries

The application is divided into:

1. Electron main process.
2. Preload bridge.
3. Renderer application.
4. SQLite persistence layer.
5. Configurable game engines.
6. Specialized educational games.
7. Local assets.
8. Import and export services.

The renderer must call a stable API such as:

```js
window.learningAPI.students.list();
window.learningAPI.activities.save(activity);
window.learningAPI.progress.save(progress);
```

It must not call SQLite or Node.js directly.

## Development practices

Before implementing a task:

1. Read the relevant documentation.
2. Inspect the existing code.
3. State any assumptions that materially affect the implementation.
4. Make the smallest coherent change that completes the task.
5. Run formatting, linting and tests.
6. Summarize files changed, tests run and remaining limitations.

Do not perform unrelated refactors while implementing a feature.

## Testing

* Add unit tests for validation, repositories and game-domain logic.
* Add integration tests for migrations and IPC handlers where practical.
* Validate all IPC input.
* Test first-run database creation.
* Test upgrading an existing database through migrations.
* Test that the application starts without internet access.

## UI principles

* Use large, readable controls.
* Support keyboard and mouse interaction.
* Avoid relying only on color to communicate state.
* Include visible focus states.
* Provide volume and mute controls.
* Make unavailable features visibly disabled rather than presenting broken buttons.
* Keep the initial teacher dashboard useful even when some reports are placeholders.

## Definition of done

A task is complete only when:

* The feature works through the intended interface.
* Errors are handled visibly and safely.
* Existing behavior is not broken.
* Relevant tests pass.
* Documentation is updated when architecture, commands or behavior change.
