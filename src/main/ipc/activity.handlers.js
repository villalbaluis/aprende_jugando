const channels = require('../../shared/constants/ipc-channels');
const { createHandler, notFoundError } = require('./ipc-response');
const {
  sanitizeCreateActivityInput,
  sanitizeUpdateActivityInput,
  sanitizeActivityId,
  sanitizeIsActive,
  sanitizeListFilters,
} = require('../../shared/validators/activity.validator');

const handle = createHandler({
  notFoundMessage: 'La actividad solicitada no existe.',
  logLabel: 'activities',
});

function registerActivityHandlers({ activityRepository }) {
  handle(channels.ACTIVITIES_LIST, (payload) => activityRepository.list(sanitizeListFilters(payload)));

  handle(channels.ACTIVITIES_CREATE, (payload) =>
    activityRepository.create(sanitizeCreateActivityInput(payload))
  );

  handle(channels.ACTIVITIES_UPDATE, (payload) => {
    const id = sanitizeActivityId(payload && payload.id);
    const changes = sanitizeUpdateActivityInput(payload && payload.data);
    const updated = activityRepository.update(id, changes);
    if (!updated) throw notFoundError('activity not found');
    return updated;
  });

  handle(channels.ACTIVITIES_DUPLICATE, (payload) => {
    const id = sanitizeActivityId(payload && payload.id);
    const duplicated = activityRepository.duplicate(id);
    if (!duplicated) throw notFoundError('activity not found');
    return duplicated;
  });

  handle(channels.ACTIVITIES_SET_ACTIVE, (payload) => {
    const id = sanitizeActivityId(payload && payload.id);
    const isActive = sanitizeIsActive(payload && payload.isActive);
    const updated = activityRepository.setActive(id, isActive);
    if (!updated) throw notFoundError('activity not found');
    return updated;
  });
}

module.exports = { registerActivityHandlers };
