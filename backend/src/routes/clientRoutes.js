const express = require('express');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminOrAttendant } = require('../middlewares/roleMiddleware');
const { validateClient } = require('../middlewares/validation');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(adminOrAttendant);

// Rotas de clientes
router.get('/', clientController.list);
router.get('/:id', clientController.getById);
router.get('/cpf/:cpf', clientController.getByCpf);
router.post('/', validateClient, clientController.create);
router.put('/:id', validateClient, clientController.update);
router.delete('/:id', clientController.delete); // Só ADMIN pode excluir

module.exports = router;
