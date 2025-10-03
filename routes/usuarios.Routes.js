const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.Controller');
const { authMiddleware, requireRole } = require('../middlewares/authMiddleware');

router.get('/', usuariosController.getUsuarios);
router.post('/', usuariosController.createUsuario);
router.put('/:id', usuariosController.updateUsuario);
router.delete('/:id', usuariosController.deleteUsuario);
router.patch("/:id/activo", usuariosController.toggleActivo);

router.get('/conductores', usuariosController.getConductores);
router.get('/secretarias', usuariosController.getSecretarias);
router.get('/ci/:ci', usuariosController.obtenerPersonaPorCI); 

module.exports = router;
