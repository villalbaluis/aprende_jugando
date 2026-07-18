const { registerStudentHandlers } = require('./student.handlers');
const { registerActivityHandlers } = require('./activity.handlers');
const { registerSessionHandlers } = require('./session.handlers');
const { registerProgressHandlers } = require('./progress.handlers');
const { registerAppHandlers } = require('./app.handlers');
const { registerDashboardHandlers } = require('./dashboard.handlers');

function registerIpcHandlers({ studentRepository, activityRepository, sessionService, sessionRepository, progressRepository }) {
  registerStudentHandlers({ studentRepository });
  registerActivityHandlers({ activityRepository });
  registerSessionHandlers({ sessionService, sessionRepository });
  registerProgressHandlers({ progressRepository });
  registerAppHandlers();
  registerDashboardHandlers({ studentRepository, activityRepository, sessionRepository });
}

module.exports = { registerIpcHandlers };
