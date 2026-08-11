const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');

/**
 * Express application setup.
 * Configures middleware, routes, and error handling.
 */
const app = express();

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

/**
 * Health-check endpoint – returns status OK.
 */
app.get('/api/health', (req, res) => {
  logger.info('Health check');
  res.json({ status: 'OK' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Notes routes (protected)
app.use('/api/notes', notesRoutes);

/**
 * Catch-all middleware for undefined routes.
 */
app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.status = 404;
  next(err);
});

/**
 * Global error handler.
 * Sends consistent JSON errors and logs them with Pino.
 */
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.isOperational
    ? err.message
    : 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // Handle duplicate key (MongoDB 11000)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
  }

  // If it's a known client error but not marked operational,
  // still send the message (e.g. 404 from above)
  if (!err.isOperational && statusCode >= 400 && statusCode < 500 && typeof err.message === 'string') {
    message = err.message;
  }

  logger.error({ err }, 'Unhandled request error');

  res
    .status(Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599 ? statusCode : 500)
    .json({
      success: false,
      error: message,
    });
});

module.exports = app;