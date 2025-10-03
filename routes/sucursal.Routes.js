const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursal.Controller');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/destinos',authMiddleware, requireRole(2), sucursalController.getSucursalesDestino);
router.get('/', sucursalController.getSucursales);
router.get('/:id', sucursalController.getSucursalById);
router.post('/', sucursalController.createSucursal);
router.put('/:id', sucursalController.updateSucursal);
router.delete('/:id', sucursalController.deleteSucursal);

module.exports = router;
