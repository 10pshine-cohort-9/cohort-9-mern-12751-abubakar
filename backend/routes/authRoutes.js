const express = require('express');
const router = express.Router();

/**
 * Auth related routes – register, login, and fetch current user.
 */
const {
  register,
  login,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;