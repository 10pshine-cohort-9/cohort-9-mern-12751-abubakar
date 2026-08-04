const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema for user accounts – stores basic info and hashed passwords.
 * Automatically hashes the password before saving, and provides
 * a helper to compare passwords during login.
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      validate: {
        validator: function(v) {
          // bcrypt has a 72-byte limit; reject longer inputs
          return Buffer.byteLength(v, 'utf8') <= 72;
        },
        message: 'Password is too long',
      },
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

/**
 * Hashes the password before saving if it has been modified.
 * @param {function} next
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Check if a given password matches the hashed one stored in the DB.
 * @param {string} candidatePassword – password from the login form
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);