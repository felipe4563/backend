const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.Controller');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/stats',authMiddleware,requireRole(1), dashboardController.obtenerEstadisticas);
router.get('/secretaria', authMiddleware, requireRole(2), dashboardController.getDashboardSecretaria);
router.get('/conductor', authMiddleware, requireRole(3), dashboardController.getDashboardConductor);
module.exports = router;
