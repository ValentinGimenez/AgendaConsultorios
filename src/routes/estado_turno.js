const express = require('express');
const router = express.Router();
const estadoTurnoController = require('../Controllers/estado_turno'); 

router.post('/crearEstadoTurno', estadoTurnoController.create);
router.get('/listarEstadosTurno', estadoTurnoController.getAll);
router.get('/obtenerEstadoTurno/:id', estadoTurnoController.getById);
router.put('/actualizarEstadoTurno/:id', estadoTurnoController.update);
router.delete('/eliminarEstadoTurno/:id', estadoTurnoController.delete);

module.exports = router;