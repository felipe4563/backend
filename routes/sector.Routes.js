const express = require('express');
const router = express.Router();
const sectorController = require('../controllers/sector.Controller');
const {authMiddleware} = require('../middlewares/authMiddleware');

router.get('/sucursales',authMiddleware, sectorController.obtenerSucursalesPorSector);
router.get('/', sectorController.ObtenerSectores);
router.get('/:id', sectorController.ObtenerSectorporId);
router.post('/', sectorController.crearSector);
router.put('/:id', sectorController.actualizarSector);
router.delete('/:id', sectorController.eliminarSector);

module.exports = router;
