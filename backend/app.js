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

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;