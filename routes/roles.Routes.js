const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.Controller');

router.get('/', rolesController.obtenerRoles);
router.post('/', rolesController.crearRol);
router.put('/:id', rolesController.actualizarRol);
router.delete('/:id', rolesController.eliminarRol);

module.exports = router;
