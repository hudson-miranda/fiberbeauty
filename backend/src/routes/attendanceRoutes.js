const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminOrAttendant } = require('../middlewares/roleMiddleware');
const { validateAttendance } = require('../middlewares/validation');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(adminOrAttendant);

// Rotas de atendimentos
router.get('/', attendanceController.list);
router.get('/stats', attendanceController.getStats); // Só ADMIN
router.get('/:id', attendanceController.getById);
router.post('/', validateAttendance, attendanceController.create);
router.put('/:id', attendanceController.update);
router.patch('/:id/finalize', attendanceController.finalize); // Nova rota para finalizar
router.delete('/:id', attendanceController.delete);

module.exports = router;
