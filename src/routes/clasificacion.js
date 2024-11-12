const express = require('express');
const router = express.Router();
const clasificacionController = require('../Controllers/clasificacion');

router.post('/crearClasificacion', clasificacionController.create);
router.get('/listarClasificaciones', clasificacionController.getAll);
router.get('/obtenerClasificacion/:id', clasificacionController.getById);
router.put('/actualizarClasificacion/:id', clasificacionController.update);
router.delete('/eliminarClasificacion/:id', clasificacionController.delete);

module.exports = router;