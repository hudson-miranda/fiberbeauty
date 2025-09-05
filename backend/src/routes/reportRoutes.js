const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter dados para relatórios e dashboard
router.get('/data', reportController.getReportsData);

module.exports = router;
