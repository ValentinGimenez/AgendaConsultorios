const express = require('express');
const router = express.Router();
const turnoController = require('../Controllers/turno'); 

router.post('/crearTurno', turnoController.create);
router.post('/generarTurnos', turnoController.generarTurnos);
router.get('/listarTurnos', turnoController.getAll);
router.get('/turnosLibres/:id', turnoController.turnosLibres);
router.get('/obtenerTurno/:id', turnoController.getById);
router.put('/actualizarTurno/:id', turnoController.update);
router.put('/asignarTurno/:id', turnoController.agendarTurno);
router.delete('/eliminarTurno/:id', turnoController.delete);

module.exports = router;