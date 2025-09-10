const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = { message, statusCode: 503 };
  }

  // Payment gateway errors
  if (err.type === 'StripeCardError') {
    const message = err.message || 'Payment failed';
    error = { message, statusCode: 400 };
  }

  if (err.type === 'StripeInvalidRequestError') {
    const message = 'Invalid payment request';
    error = { message, statusCode: 400 };
  }

  // API rate limit errors
  if (err.response && err.response.status === 429) {
    const message = 'External API rate limit exceeded';
    error = { message, statusCode: 503 };
  }

  // Market data errors
  if (err.code === 'MARKET_DATA_ERROR') {
    const message = 'Market data temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // Trading signal errors
  if (err.code === 'SIGNAL_EXPIRED') {
    const message = 'Trading signal has expired';
    error = { message, statusCode: 410 };
  }

  if (err.code === 'INSUFFICIENT_BALANCE') {
    const message = 'Insufficient balance for this operation';
    error = { message, statusCode: 400 };
  }

  // Algorithm errors
  if (err.code === 'ALGORITHM_ERROR') {
    const message = 'Algorithm execution error';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'ALGORITHM_NOT_FOUND') {
    const message = 'Algorithm not found';
    error = { message, statusCode: 404 };
  }

  // Subscription errors
  if (err.code === 'SUBSCRIPTION_EXPIRED') {
    const message = 'Subscription has expired';
    error = { message, statusCode: 403 };
  }

  if (err.code === 'SUBSCRIPTION_LIMIT_EXCEEDED') {
    const message = 'Subscription limit exceeded';
    error = { message, statusCode: 403 };
  }

  // Security errors
  if (err.code === 'SECURITY_VIOLATION') {
    const message = 'Security violation detected';
    error = { message, statusCode: 403 };
  }

  if (err.code === 'SUSPICIOUS_ACTIVITY') {
    const message = 'Suspicious activity detected';
    error = { message, statusCode: 403 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  // Don't send stack trace in production
  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Add additional error details for specific error types
  if (err.name === 'ValidationError') {
    response.details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  if (err.code === 11000) {
    response.field = Object.keys(err.keyValue)[0];
    response.value = Object.values(err.keyValue)[0];
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
