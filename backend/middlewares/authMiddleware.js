const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized, no token provided', 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      throw new AppError('Not authorized, invalid or expired token', 401);
    }

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };