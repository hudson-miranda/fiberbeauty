const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do dashboard
router.get('/', dashboardController.getStats);
router.get('/stats', dashboardController.getStats);
router.get('/chart-data', dashboardController.getChartData);
router.get('/client-ranking', dashboardController.getClientRanking);
router.get('/services-distribution', dashboardController.getServicesDistribution);
router.get('/activities', dashboardController.getAllActivities);

module.exports = router;
