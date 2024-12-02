const ModuleModel = require('../model/Module');
const Factory = require('./handleFactory');

exports.createModule = Factory.createOne(ModuleModel);
exports.getModules = Factory.getAll(ModuleModel);
