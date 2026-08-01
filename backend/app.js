const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./config/logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/api/health', (req, res) => {
  logger.info('Health check');
  res.json({ status: 'OK' });
});

// 404 middleware
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

  logger.error({ err }, 'Unhandled request error');

  const status = Number.isInteger(err.status)
    ? err.status
    : err.statusCode;

  res
    .status(Number.isInteger(status) && status >= 400 ? status : 500)
    .json({ error: 'Something went wrong' });
});

module.exports = app;