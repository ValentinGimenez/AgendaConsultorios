const express = require('express');
const router = express.Router();
const turnoController = require('../Controllers/turno'); 

router.post('/crearTurno', turnoController.create);
router.post('/generarTurnos', turnoController.generarTurnos);
router.get('/listarTurnos', turnoController.getAll);
router.get('/turnosLibres/:id', turnoController.turnosLibres);
router.get('/turnosReservados/:id', turnoController.turnosReservados);
router.get('/obtenerTurno/:id', turnoController.getById);
router.put('/actualizarTurno/:id', turnoController.update);
router.put('/asignarTurno/:id', turnoController.agendarTurno);
router.delete('/eliminarTurno/:id', turnoController.delete);
router.post('/crearSobreturno/:id', turnoController.crearSobreturno);
// router.post('/turnosSinSobreturno/:idAgenda', turnoController.turnosSinSobreturnoPorAgenda);
router.get('/turnosSinSobreturno/:idAgenda', turnoController.turnosSinSobreturnoPorAgenda);
router.get('/obtenerSobreturnos/:idAgenda', turnoController.sobreturnos);

module.exports = router;