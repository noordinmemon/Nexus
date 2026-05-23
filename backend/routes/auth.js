const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    register,
    login,
    getProfile,
    updateProfile,
    generateOTP,
    verifyOTP,
    changePassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/generate-otp', protect, generateOTP);
router.post('/verify-otp', protect, verifyOTP);
router.put('/change-password', protect, changePassword);

module.exports = router;