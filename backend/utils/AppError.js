/**
 * Custom error used for known operational issues (e.g. invalid input).
 * It carries an HTTP status code and marks the error as operational.
 */
class AppError extends Error {
  /**
   * @param {string} message – Human-readable error description
   * @param {number} statusCode – HTTP status to send back
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;