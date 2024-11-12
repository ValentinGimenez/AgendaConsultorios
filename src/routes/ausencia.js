const express = require('express');
const router = express.Router();
const ausenciaController = require('../Controllers/ausencia');

router.post('/crearAusencia', ausenciaController.create);
router.get('/listarAusencias', ausenciaController.getAll);
router.get('/obtenerAusencia/:id', ausenciaController.getById);
router.put('/actualizarAusencia/:id', ausenciaController.update);
router.delete('/eliminarAusencia/:id', ausenciaController.delete);

module.exports = router;