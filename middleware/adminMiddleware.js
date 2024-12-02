const CatchAsync = require('../utils/CatchAsync');
const AppError = require('../utils/appError');

const adminMiddleware = CatchAsync(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new AppError("You don't have permission to access this resource", 404));
  }
  next();
});

module.exports = adminMiddleware;
