const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./config/logger');
require('dotenv').config();

/**
 * Starts the Express server after validating environment variables
 * and connecting to MongoDB.
 */
const rawPort = process.env.PORT || '5000';
const PORT = Number(rawPort);
const MONGO_URI = process.env.MONGO_URI;

// Validate required environment variables before starting
if (typeof MONGO_URI !== 'string' || MONGO_URI.trim() === '') {
  logger.error('MONGO_URI is required');
  process.exit(1);
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  logger.error(`Invalid PORT value: ${rawPort}`);
  process.exit(1);
}

if (typeof process.env.JWT_SECRET !== 'string' || process.env.JWT_SECRET.trim() === '') {
  logger.error('JWT_SECRET is required');
  process.exit(1);
}

if (process.env.JWT_SECRET === 'your_jwt_secret_here' || process.env.JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET must be a strong, long random string (min 32 chars)');
  process.exit(1);
}

// Connect to database, then start listening
mongoose.connect(MONGO_URI)
  .then(() => {
    /**
     * Callback executed after MongoDB connects successfully.
     * Starts the HTTP server.
     */
    logger.info('Connected to MongoDB');
    const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

    // If the HTTP server itself fails (e.g. port already in use), clean up DB connection
    server.on('error', async (err) => {
      logger.error(err, 'HTTP server failed to start');

      try {
        await mongoose.disconnect();
      } catch (disconnectErr) {
        logger.error(disconnectErr, 'MongoDB disconnect failed');
      } finally {
        process.exit(1);
      }
    });
  })
  .catch(err => {
    logger.error(err, 'MongoDB connection failed');
    process.exit(1);
  });