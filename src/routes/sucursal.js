const express = require('express');
const router = express.Router();
const sucursalController = require('../Controllers/sucursal'); 

router.post('/crearSucursal', sucursalController.create);
router.get('/listarSucursales', sucursalController.getAll);
router.get('/obtenerSucursal/:id', sucursalController.getById);
router.put('/actualizarSucursal/:id', sucursalController.update);
router.delete('/eliminarSucursal/:id', sucursalController.delete);

module.exports = router;