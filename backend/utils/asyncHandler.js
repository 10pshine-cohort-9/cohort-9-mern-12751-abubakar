/**
 * Wraps an async route handler so any thrown error is passed to Express next().
 * @param {Function} fn - The async route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;