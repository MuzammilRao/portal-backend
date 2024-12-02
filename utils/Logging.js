const { LOG_ACTIONS } = require('../constants');
const Log = require('../model/logModel');
const userModel = require('../model/userModel');

// Generate log descriptions based on actions and entities
const generateDescription = (user, action, entity, changes) => {
  switch (action) {
    case LOG_ACTIONS.CREATE:
      return `${user} created a new ${entity}.`;
    case LOG_ACTIONS.UPDATE:
      return `${user} updated ${entity} details: ${formatChanges(changes)}.`;
    case LOG_ACTIONS.DELETE:
      return `${user} deleted a ${entity}.`;
    case LOG_ACTIONS.READ:
      return `${user} read the ${entity} table.`;
    case LOG_ACTIONS.VIEWED:
      return `${user} viewed ${entity}.`;
    case LOG_ACTIONS.LOGIN:
      return `${user} logged in.`;
    case LOG_ACTIONS.LOGOUT:
      return `${user} logged out.`;
    case LOG_ACTIONS.APPROVE:
      return `${user} approved ${entity}.`;
    case LOG_ACTIONS.REJECT:
      return `${user} rejected ${entity}.`;
    case LOG_ACTIONS.DOWNLOAD:
      return `${user} downloaded ${entity}.`;
    case LOG_ACTIONS.UPLOAD:
      return `${user} uploaded a file to ${entity}.`;
    case LOG_ACTIONS.ASSIGN:
      return `${user} assigned ${entity}.`;
    case LOG_ACTIONS.UNASSIGN:
      return `${user} unassigned ${entity}.`;
    case LOG_ACTIONS.IMPORT:
      return `${user} imported data to ${entity}.`;
    case LOG_ACTIONS.EXPORT:
      return `${user} exported data from ${entity}.`;
    case LOG_ACTIONS.SUBMIT:
      return `${user} submitted ${entity}.`;
    case LOG_ACTIONS.REVIEW:
      return `${user} reviewed ${entity}.`;
    case LOG_ACTIONS.SYNC:
      return `${user} synchronized ${entity}.`;
    case LOG_ACTIONS.SHARE:
      return `${user} shared ${entity}.`;
    default:
      return `${user} performed an action on ${entity}.`;
  }
};

// Format changes for detailed logging
const formatChanges = (changes) => {
  return Object.entries(changes)
    .filter(([field, { from, to }]) => {
      if (Array.isArray(from) && Array.isArray(to)) {
        return from.toString() !== to.toString();
      }
      return from !== to && typeof from !== 'object' && typeof to !== 'object';
    })
    .map(([field, { from, to }]) => {
      if (Array.isArray(from) || Array.isArray(to)) {
        return `${field} changed from an array of length ${from.length} to an array of length ${to.length}`;
      }
      return `${field} from '${from}' to '${to}'`;
    })
    .join(', ');
};

// Log an action with user details, action type, and entity information
const logAction = async (
  userId,
  action,
  entity,
  entityId,
  changes = {},
  customDescription = null,
) => {
  const user = await userModel.findById(userId).select('name'); // Assumes user has a `name` field
  const userName = user?.name || 'Unknown User';

  const description = customDescription || generateDescription(userName, action, entity, changes);

  await Log.create({
    user: userId,
    action,
    entity,
    entityId,
    changes,
    description,
  });
};

module.exports = { logAction };
