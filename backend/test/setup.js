const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

exports.mochaHooks = {
  async beforeAll() {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is required for tests. Add it to backend/.env');
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  },

  async afterAll() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  },
};
