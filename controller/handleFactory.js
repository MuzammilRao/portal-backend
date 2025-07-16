const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');
const { logAction } = require('../utils/Logging');
const _ = require('lodash');
const { LOG_ACTIONS } = require('../constants');

exports.softDelete = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // Log the soft delete action
    await logAction(req.user._id, LOG_ACTIONS.DELETE, Model.modelName, doc._id, {
      isDeleted: { from: false, to: true },
    });

    return res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    // Log the hard delete action
    if (!!req?.user) {
      await logAction(req.user._id, LOG_ACTIONS.DELETE, Model.modelName, doc._id, {
        deleted: true,
      });
    }

    return res.status(204).json({
      status: 'success',
      data: null,
    });
  });
// exports.updateOne = (Model) =>
//   catchAsync(async (req, res, next) => {
//     const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!doc) {
//       return next(new AppError('No document found with that ID', 404));
//     }

//     return res.status(200).json({
//       status: 'success',
//       data: doc,
//     });
//   });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next, user = null) => {
    const originalDoc = await Model.findById(req.params.id).lean(); // Use .lean() for plain objects
    if (!originalDoc) {
      return next(new AppError('No document found with that ID', 404));
    }

    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!!user || !!req.user) {
      const changes = {};

      Object.keys(req.body).forEach((key) => {
        const originalValue = originalDoc[key];
        const newValue = req.body[key];

        if (
          key === '_id' ||
          key === 'createdAt' ||
          key === 'updatedAt' ||
          _.isEqual(originalValue, newValue) ||
          (Array.isArray(newValue) && newValue.length === 0 && originalValue === undefined) ||
          (newValue === '' && originalValue === undefined) ||
          (typeof newValue === 'object' && newValue._id)
        ) {
          return;
        }

        // Capture only actual changes
        changes[key] = {
          from: originalValue,
          to: newValue,
        };
      });

      if (Object.keys(changes).length > 0 && user) {
        await logAction(user._id, LOG_ACTIONS.UPDATE, Model.modelName, updatedDoc._id, changes);
      }
    }
    return res.status(200).json({
      status: 'success',
      data: updatedDoc,
    });
  });

exports.updateOneWithSave = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    Object.assign(doc, req.body);

    await doc.save();

    return res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    // console.log(req.user || 'No User Found');

    if (req.user) {
      await logAction(req.user._id, LOG_ACTIONS.CREATE, Model.modelName, doc._id);
    }

    return res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, ...populations) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    populations.forEach((populate, index) => {
      if (index % 2 === 0) {
        const populateRef = populate;
        const poplateFields = populations[index + 1];
        query = query.populate(populateRef, poplateFields);
      }
    });
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    if (!!req?.user) {
      await logAction(req.user._id, LOG_ACTIONS.VIEWED, Model.modelName, doc._id);
    }

    return res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = (Model, filter = {}, search = [], ...populations) =>
  catchAsync(async (req, res, next) => {
    if (filter.user === 'user._id') {
      filter = { ...filter, user: req.user._id };
    }
    filter.isDeleted = false;
    let query = Model.find(filter);

    populations.forEach((populate, index) => {
      if (index % 2 === 0) {
        const populateRef = populate;
        const poplateFields = populations[index + 1];
        query = query.populate(populateRef, poplateFields);
      }
    });

    const features = new APIFeatures(query, req.query, search)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    let total;
    if (Object.keys(filter).includes('user')) {
      total = await Model.count({ isDeleted: false, user: req.user._id });
    } else {
      total = await Model.count({ isDeleted: false });
    }

    await logAction(req.user._id, LOG_ACTIONS.READ, Model.modelName, null);

    // SEND RESPONSE
    return res.status(200).json({
      status: 'success',
      total: total,
      results: doc.length,
      data: doc,
    });
  });

/**
 *
 * @param {*} Model
 * @param {*} filter
 * @param {*} sort
 * @param  {...any} populations
 * @returns
 */
exports.getAllCustomSorted = (Model, filter = {}, sort, ...populations) =>
  catchAsync(async (req, res, next) => {
    if (filter.user === 'user._id') {
      filter.user = req.user._id;
    }

    let query = Model.find(filter);
    req.query.sort = sort;

    populations.forEach((populate, index) => {
      if (index % 2 === 0) {
        const populateRef = populate;
        const poplateFields = populations[index + 1];
        query = query.populate(populateRef, poplateFields);
      }
    });

    const features = new APIFeatures(query, req.query).filter().sort().limitFields().paginate();

    const doc = await features.query;

    // SEND RESPONSE
    return res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });
