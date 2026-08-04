const jwt = require('jsonwebtoken');

/**
 * Creates a JWT for the given user ID.
 * Token expires in 7 days, secret from .env.
 * @param {string} userId
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;