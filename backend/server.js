const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./config/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch(err => {
    logger.error(err, 'MongoDB connection failed');
    process.exit(1);
  });