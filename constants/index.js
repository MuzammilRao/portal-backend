const LOG_ACTIONS = {
  CREATE: 'CREATE',
  GET: 'GET',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  READ: 'READ',
  VIEWED: 'VIEWED',
  LOGIN: 'LOGIN', // For login actions
  LOGOUT: 'LOGOUT', // For logout actions
  APPROVE: 'APPROVE', // For approving an entity or action
  REJECT: 'REJECT', // For rejecting an entity or action
  ARCHIVE: 'ARCHIVE', // For archiving entities
  RESTORE: 'RESTORE', // For restoring archived entities
  DOWNLOAD: 'DOWNLOAD', // For downloading files or data
  UPLOAD: 'UPLOAD', // For uploading files or data
  ASSIGN: 'ASSIGN', // For assigning entities to users or teams
  UNASSIGN: 'UNASSIGN', // For unassigning entities
  NOTIFY: 'NOTIFY', // For sending notifications
  IMPORT: 'IMPORT', // For importing data
  EXPORT: 'EXPORT', // For exporting data
  SUBMIT: 'SUBMIT', // For submitting forms or data
  REVIEW: 'REVIEW', // For reviewing content or actions
  SYNC: 'SYNC', // For syncing data or entities
  SHARE: 'SHARE',
};

const LOG_ENTITIES = {
  CLIENT: 'Client',
  INVOICE: 'Invoice',
};

module.exports = { LOG_ACTIONS, LOG_ENTITIES };
