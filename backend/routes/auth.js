const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/auth
 * @desc    Get auth routes information
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working!',
        availableEndpoints: [
            { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
            { method: 'POST', path: '/api/auth/login', description: 'Login user' },
            { method: 'GET', path: '/api/auth/me', description: 'Get current user (Protected)' }
        ]
    });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;