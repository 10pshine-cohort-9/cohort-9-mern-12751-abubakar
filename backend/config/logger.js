const pino = require('pino');

/**
 * Configuration object for Pino logger.
 */
const loggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'req.headers.authorization[*]',
    ],
    censor: '[REDACTED]',
  },
};

// Pretty-print logs in development for easier reading
if (process.env.NODE_ENV == 'development') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

/**
 * Pre-configured Pino logger instance.
 * @module logger
 */
const logger = pino(loggerOptions);
module.exports = logger;