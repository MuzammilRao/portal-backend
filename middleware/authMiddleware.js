// const { config } = require('../config');
// const User = require('../model/userModel');
// const jwt = require('jsonwebtoken');
// const AppError = require('../utils/appError');

// const authMiddleware = async (req, res, next) => {
//   const { authorization, 'x-api-key': apiKey } = req.headers;
//   const referer = req.get('referer');

//   // Check API Key
//   // if (!apiKey || apiKey !== process.env.API_KEY) {
//   if (!apiKey || apiKey !== 'myapikeys') {
//     return next(new AppError('Access denied.', 403));
//   }

//   // Check Referer Header to allow requests only from a specific domain
//   if (!referer || !referer.startsWith('https://billing.inventixcrew.com')) {
//     return next(new AppError('Access denied: Invalid referrer.', 403));
//   }

//   // Check if the Authorization header exists
//   if (!authorization) {
//     return next(new AppError('Authorization header is missing. Please log in to get access.', 401));
//   }

//   // Check if the token is in the correct "Bearer <token>" format
//   if (!authorization.startsWith('Bearer ')) {
//     return next(new AppError('Invalid token format. Expected "Bearer <token>".', 401));
//   }

//   // Extract the token from the header
//   const token = authorization.split(' ')[1];

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, config.SECRET);

//     // Find the user based on the token's payload
//     const user = await User.findById(decoded._id);
//     if (!user) {
//       return next(new AppError('The user belonging to this token no longer exists.', 401));
//     }

//     // Attach user data to the request object
//     req.user = user;
//     next();
//   } catch (error) {
//     // Differentiate between JWT errors for more specific messages
//     if (error.name === 'TokenExpiredError') {
//       return next(new AppError('Your session has expired. Please log in again.', 401));
//     } else if (error.name === 'JsonWebTokenError') {
//       return next(new AppError('Invalid token. Please log in again.', 401));
//     } else {
//       console.error('Authentication error:', error);
//       return next(new AppError('Failed to authenticate. Please try again later.', 500));
//     }
//   }
// };

// module.exports = authMiddleware;

const { config } = require('../config');
const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  // Check if the Authorization header exists
  if (!authorization) {
    return next(new AppError('Authorization header is missing. Please log in to get access.', 401));
  }

  // Check if the token is in the correct "Bearer <token>" format
  if (!authorization.startsWith('Bearer ')) {
    return next(new AppError('Invalid token format. Expected "Bearer <token>".', 401));
  }

  // Extract the token from the header
  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, config.SECRET);

    const user = await User.findOne({ _id });

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Attach user data to the request object
    req.user = user;

    next();
  } catch (error) {
    // Differentiate between JWT errors
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    } else {
      console.error('Authentication error:', error);
      return next(new AppError('Failed to authenticate. Please try again later.', 500));
    }
  }
};

module.exports = authMiddleware;
