// const Log = require('../model/logModel'); // Assuming you have a Log model
// const CatchAsync = require('../utils/CatchAsync');
// const APIFeatures = require('../utils/APIFeatures'); // Assuming APIFeatures can handle basic filtering and pagination
// exports.getLogs = CatchAsync(async (req, res, next) => {
//   const { userId, action, entity, startDate, endDate } = req.query;

//   let filter = {};

//   if (userId) filter.user = userId;
//   if (action) filter.action = action;
//   if (entity) filter.entity = entity;
//   if (startDate && endDate) {
//     filter.timestamp = {
//       $gte: new Date(startDate),
//       $lte: new Date(endDate),
//     };
//   }

//   const features = new APIFeatures(Log.find(filter), req.query).sort().paginate();

//   const logs = await features.query;

//   return res.status(200).json({
//     status: 'success',
//     results: logs.length,
//     // data: logs.map((log) => ({ description: log.description, timestamp: log.timestamp })),
//     data: logs,
//   });
// });

const Log = require('../model/logModel'); // Assuming you have a Log model
const CatchAsync = require('../utils/CatchAsync');
const APIFeatures = require('../utils/APIFeatures'); // Assuming APIFeatures can handle basic filtering and pagination

exports.getLogs = CatchAsync(async (req, res, next) => {
  const { userId, action, startDate, endDate } = req.query;

  let filter = {};

  if (userId) filter.user = userId;
  if (action) filter.action = action;
  if (startDate && endDate) {
    filter.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const query = Log.find(filter);

  // Dynamically populate the `entityId` based on the `entity` field
  query.populate({
    path: 'entityId',
    strictPopulate: false, // Allow population even if schema strictness applies
  });

  const features = new APIFeatures(query, req.query).sort().paginate();

  const logs = await features.query;

  return res.status(200).json({
    status: 'success',
    results: logs.length,
    data: logs, // Logs with populated entity details
  });
});
