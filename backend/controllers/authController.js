const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create user
    let user;
    try {
      user = await User.create({ fullName, email, password });
    } catch (createErr) {
      if (createErr.code === 11000) {
        throw new AppError('Email already registered', 409);
      }
      throw createErr;
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info({ userId: user._id }, 'New user registered');

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new AppError(Object.values(error.errors)[0].message, 400));
    }
    next(error);
  }
};

// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists (need to select password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info({ userId: user._id }, 'User logged in');
    
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };