const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.Controller');

// Ruta pública para consultar encomienda por número de guía
router.get('/encomienda/:numero_guia', publicController.getEncomiendaPorNumeroGuia);

module.exports = router;
