const express = require('express');
const router = express.Router();
const obraSocialController = require('../Controllers/obrasocial');

router.post('/crearObraSocial', obraSocialController.create);
router.get('/listarObrasSociales', obraSocialController.getAll);
router.get('/obtenerObraSocial/:id', obraSocialController.getById);
router.put('/actualizarObraSocial/:id', obraSocialController.update);
router.delete('/eliminarObraSocial/:id', obraSocialController.delete);

module.exports = router;