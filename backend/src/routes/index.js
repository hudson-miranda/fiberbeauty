const express = require('express');
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const attendanceFormRoutes = require('./attendanceFormRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const npsRoutes = require('./npsRoutes');

const router = express.Router();

// Definir rotas da API
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/attendance-forms', attendanceFormRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/nps', npsRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
