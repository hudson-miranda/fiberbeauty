const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateUser } = require('../middlewares/validation');

const router = express.Router();

// Todas as rotas requerem autenticação e permissão de ADMIN
router.use(authMiddleware);

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', validateUser, userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.patch('/:id/reactivate', userController.reactivate);

module.exports = router;
