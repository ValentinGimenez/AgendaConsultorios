const express = require('express');
const router = express.Router();
const agendaController = require('../Controllers/agenda');

router.post('/crearAgenda', agendaController.create); 
router.get('/listarAgenda', agendaController.getAll);
router.get('/obtenerAgenda/:id', agendaController.getById);
router.get('/obtenerAgendas/:idMedicoEspecialidad', agendaController.obtenerAgendas);
router.put('/actualizarAgenda/:id', agendaController.update); 
router.delete('/eliminarAgenda/:id', agendaController.delete);

module.exports = router;