const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/authMiddleware');

// Todas as rotas requerem autenticação
router.use(auth);

// Listar notificações do usuário
router.get('/', notificationController.list);

// Obter contagem de notificações não lidas
router.get('/unread-count', notificationController.getUnreadCount);

// Marcar notificação como lida
router.patch('/:id/read', notificationController.markAsRead);

// Marcar todas as notificações como lidas
router.patch('/read-all', notificationController.markAllAsRead);

// Criar nova notificação (apenas admin)
router.post('/', (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}, notificationController.create);

// Deletar notificação
router.delete('/:id', notificationController.delete);

module.exports = router;
