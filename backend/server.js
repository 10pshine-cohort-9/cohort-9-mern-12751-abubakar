const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./config/logger');
require('dotenv').config();

const rawPort = process.env.PORT || '5000';
const PORT = Number(rawPort);
const MONGO_URI = process.env.MONGO_URI;

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  logger.error(`Invalid PORT value: ${rawPort}`);
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

    server.on('error', async (err) => {
      logger.error(err, 'HTTP server failed to start');
      try {
        await mongoose.disconnect();
      } finally {
        process.exit(1);
      }
    });
  })
  .catch(err => {
    logger.error(err, 'MongoDB connection failed');
    process.exit(1);
  });