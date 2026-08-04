const pino = require('pino');

/**
 * Pino logger instance.
 * Redacts sensitive fields and uses pino‑pretty in dev.
 * @module logger
 */
const loggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
    ],
    censor: '[REDACTED]',
  },
};

// Pretty-print logs in non-production environments
if (process.env.NODE_ENV !== 'production') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

const logger = pino(loggerOptions);
module.exports = logger;