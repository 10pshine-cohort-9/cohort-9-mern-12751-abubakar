const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/api/health', (req, res) => {
  logger.info('Health check');
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.status = 404;
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.isOperational
    ? err.message
    : 'Internal Server Error';

  // Normalize frequent Mongo/Mongoose errors to client-friendly statuses.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
  }

  if (!err.isOperational && statusCode >= 400 && statusCode < 500 && typeof err.message === 'string') {
    message = err.message;
  }

  logger.error({ err }, 'Unhandled request error');

  res
    .status(Number.isInteger(statusCode) && statusCode >= 400 ? statusCode : 500)
    .json({
      success: false,
      error: message,
    });
});

module.exports = app;