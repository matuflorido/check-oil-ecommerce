/* eslint-disable no-unused-vars */

/**
 * Express error handler middleware
 * Catches all errors and returns standardized error response
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  console.error('Error:', err.message);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
