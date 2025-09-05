const express = require('express');
const attendanceFormController = require('../controllers/attendanceFormController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminOrAttendant } = require('../middlewares/roleMiddleware');
const { validateAttendanceForm, validateDuplicateForm } = require('../middlewares/validation');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas que atendentes podem acessar (somente leitura)
router.get('/', adminOrAttendant, attendanceFormController.list);
router.get('/:id', adminOrAttendant, attendanceFormController.getById);

// Rotas que apenas ADMIN pode acessar
router.post('/', validateAttendanceForm, attendanceFormController.create); // Só ADMIN
router.put('/:id', validateAttendanceForm, attendanceFormController.update); // Só ADMIN
router.post('/:id/duplicate', validateDuplicateForm, attendanceFormController.duplicate); // Só ADMIN
router.delete('/:id', attendanceFormController.delete); // Só ADMIN

module.exports = router;
