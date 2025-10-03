const express = require('express');
const router = express.Router();
const encomiendaController = require('../controllers/encomienda.Controller');

// Aquí deberías tener un middleware de autenticación que agregue `req.user`
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

// Ruta para registrar una nueva encomienda
router.post('/',  authMiddleware, encomiendaController.registrarEncomienda);
router.get('/secretaria', authMiddleware, encomiendaController.getEncomiendasPorSecretaria);

router.get('/por-recibir', authMiddleware, requireRole(2), encomiendaController.getEncomiendasRecepcionadas);

router.get('/:id/sticker', authMiddleware, encomiendaController.getStickerInfo);
router.get('/:id', authMiddleware, encomiendaController.getEncomiendaPorId);

router.post('/:id_manifiesto/escanear', authMiddleware, requireRole(3), encomiendaController.escanearEncomienda);
router.post('/:id_manifiesto/entregar', authMiddleware, requireRole(2), encomiendaController.entregarEncomienda);

router.post("/validar-entrega", authMiddleware, encomiendaController.getEncomiendaPorPinONumero);
// Confirmar entrega
router.post("/confirmar-entrega", authMiddleware, requireRole(2), encomiendaController.confirmarEntrega);
// Obtener comprobante (texto plano)
router.get("/comprobante-entrega/:numero_guia",authMiddleware, requireRole(2), encomiendaController.getComprobanteEntrega);

module.exports = router;
