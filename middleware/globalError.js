const { appConfig } = require('../config');
const ErrorHandler = require('../utils/appError');

const handleJwtExpiredError = () => {
  return new ErrorHandler('Token Expired. Please login again!', 401);
};

const handleJwtTokenError = () => {
  const newErr = new ErrorHandler('Invalid Token or has expired.', 401);

  return newErr;
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} ${error.value._id}.`;
  return new ErrorHandler(message, 400);
};

const handleDuplicateErrorDB = (error) => {
  const value = JSON.stringify(error.keyValue);
  const _value = value.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  //Regex for match string between quotes (["'](\\?.)*?\1)
  const __value = _value.split('"')[1];
  console.log(__value);
  const message = `Duplicate field value ${__value}. Please use another value!`;

  return new ErrorHandler(message, 400);
};

const handleValidationErrorDB = (error) => {
  const validationErr = Object.values(error.errors).map((el) => el.message);

  const message = `${validationErr.join('. ')}`;
  return new ErrorHandler(message, 403);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR>>>', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // console.log(error);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
      sendErrProd(error, res);
    } else if (err.code === 11000) {
      error = handleDuplicateErrorDB(error);
      sendErrProd(error, res);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
      sendErrProd(error, res);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJwtTokenError();
      sendErrProd(error, res);
    } else if (err.name === 'TokenExpiredError') {
      error = handleJwtExpiredError();
      sendErrProd(error, res);
    } else {
      sendErrProd(err, res);
    }
  }
};
