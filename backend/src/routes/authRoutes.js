const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateLogin } = require('../middlewares/validation');

const router = express.Router();

// Rotas públicas
router.post('/login', validateLogin, authController.login);

// Rotas protegidas
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
