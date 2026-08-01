const pino = require('pino');
const loggerOptions = {
  level: 'info',
  redact: ['req.headers.authorization', 'req.headers.cookie'],
};

if (process.env.NODE_ENV !== 'production') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: { colorize: true },
  };
}

const logger = pino(loggerOptions);
module.exports = logger;