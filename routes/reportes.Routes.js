const express = require('express');
const reportesController = require('../controllers/reportes.Controller');

const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Solo admin puede acceder
router.get('/reporte-secretaria', authMiddleware, requireRole(2), reportesController.getReporteEncomiendasSecretaria);
router.get('/reporte-conductor', authMiddleware, requireRole(3), reportesController.getReporteManifiestosConductor)
router.get("/encomiendas", authMiddleware, requireRole(1), reportesController.encomiendas);
router.get("/rango", authMiddleware, requireRole(1), reportesController.reportePorRangoFechas);
router.get("/secretaria", authMiddleware, requireRole(1), reportesController.reportePorSecretaria);
router.get("/sucursal", authMiddleware, requireRole(1), reportesController.reportePorSucursal);
router.get("/conductor", authMiddleware, requireRole(1), reportesController.reportePorConductor);
router.get("/monto-empresa", authMiddleware, requireRole(1), reportesController.montoEmpresaPorSucursal);
router.get("/resumen-sucursales", authMiddleware, requireRole(1), reportesController.resumenSucursales)

module.exports = router;
