const express = require('express');
const router = express.Router();
const manifiestoController = require('../controllers/manifiestos.Controller');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// 📌 Primero las rutas específicas
router.get('/conductor/todos',authMiddleware,requireRole(3), manifiestoController.getManifiestosConductorPersistentes);
router.get('/secretaria', authMiddleware, requireRole(2), manifiestoController.getManifiestosSecretaria);
router.get('/conductor', authMiddleware, requireRole(3), manifiestoController.getManifiestosConductor);

router.post('/asignar', authMiddleware, manifiestoController.asignarEncomiendas);
router.get("/por-recibir", authMiddleware, manifiestoController.getManifiestoSecretaria);


// 📌 Luego las rutas con parámetros
router.put('/encomiendas/:id/recibir', authMiddleware, requireRole(2), manifiestoController.recibirEncomienda);
router.put('/:id/recibir', authMiddleware, requireRole(2), manifiestoController.recibirTodasDelManifiesto);

router.get('/:id/detalle', authMiddleware, manifiestoController.getManifiestoDetalle);
router.get('/:id/encomiendas', authMiddleware, requireRole(2), manifiestoController.listarEncomiendasDeManifiesto);



module.exports = router;
