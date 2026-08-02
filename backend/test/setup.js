const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

const TEST_DB_NAME_PATTERN = /(?:^|[_-])test(?:[_-]|$)/i;

function getMongoDatabaseName(mongoUri) {
  try {
    return decodeURIComponent(new URL(mongoUri).pathname.replace(/^\/+/, ''));
  } catch {
    return '';
  }
}

exports.mochaHooks = {
  async beforeAll() {
    const testMongoUri = typeof process.env.MONGO_URI_TEST === 'string' ? process.env.MONGO_URI_TEST.trim() : '';
    const mongoUri = testMongoUri || (typeof process.env.MONGO_URI === 'string' ? process.env.MONGO_URI.trim() : '');

    if (!mongoUri) {
      throw new Error('Set MONGO_URI_TEST or point MONGO_URI at a dedicated test database before running tests.');
    }

    if (!testMongoUri) {
      const databaseName = getMongoDatabaseName(mongoUri);

      if (!databaseName || !TEST_DB_NAME_PATTERN.test(databaseName)) {
        throw new Error('Unsafe MONGO_URI for tests. Use a dedicated test database name such as notesapp_test, or set MONGO_URI_TEST.');
      }
    }

    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(mongoUri);
      } catch (error) {
        if (mongoose.connection.readyState !== 0) {
          try {
            await mongoose.connection.close();
          } catch {
            // Ignore close failures so the original setup error is preserved.
          }
        }

        const setupError = new Error(`MongoDB test setup failed while connecting to the configured test database: ${error.message}`);
        setupError.cause = error;
        throw setupError;
      }
    }
  },

  async afterAll() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  },
};
