const express = require('express');
const router = express.Router();
const listaEsperaController = require('../Controllers/lista_de_espera'); 

router.post('/crearListaEspera', listaEsperaController.create);
router.get('/listarEnEspera', listaEsperaController.getAll);
router.get('/obtenerPacienteListaEspera/:id', listaEsperaController.getById);
router.put('/actualizarListaEspera/:id', listaEsperaController.update);
router.delete('/EliminarPacienteListaEspera/:id', listaEsperaController.delete);

module.exports = router;