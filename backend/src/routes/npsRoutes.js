const express = require('express');
const npsController = require('../controllers/npsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Criar avaliação NPS (público - não requer autenticação)
router.post('/', npsController.create);

// Obter avaliação por ID do atendimento (público - para verificar se já foi avaliado)
router.get('/attendance/:attendanceId', npsController.getByAttendanceId);

// Rotas que requerem autenticação
router.use(authMiddleware);

// Listar avaliações NPS
router.get('/', npsController.list);

// Obter estatísticas NPS
router.get('/statistics', npsController.getStatistics);

// Obter atendimentos por categoria NPS
router.get('/attendances/category', npsController.getAttendancesByCategory);

module.exports = router;
