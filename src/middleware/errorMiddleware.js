function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const isMulterError = error.name === 'MulterError';
  const statusCode = error.statusCode || (isMulterError ? 400 : 500);
  res.status(statusCode).json({
    message: error.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
}

module.exports = { notFound, errorHandler };
