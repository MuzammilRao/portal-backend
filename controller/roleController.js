const Role = require('../model/Role');
const Factory = require('./handleFactory');

exports.createRole = Factory.createOne(Role);
exports.getRoles = Factory.getAll(Role, { isDeleted: false }, [], 'modulePermissions.module');
exports.softDeleteRole = Factory.softDelete(Role);
