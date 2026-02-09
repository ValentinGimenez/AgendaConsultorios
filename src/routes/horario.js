const express = require('express');
const router = express.Router();
const horarioController = require('../Controllers/horario'); 

router.post('/crearHorario', horarioController.create);
router.get('/listarHorarios', horarioController.getAll);
router.get('/obtenerHorario/:id', horarioController.getById);
router.put('/actualizarHorario/:id', horarioController.update);
router.delete('/eliminarHorario/:id', horarioController.delete);
router.get('/obtenerRango/:id', horarioController.obtenerRango);
router.post('/obtenerAgendaHorario', horarioController.obtenerAgendaHorarios);
router.get('/obtenerAgendaMedico/:id', horarioController.obtenerAgendaMedico);
router.get('/obtenerHorariosPorAgenda/:id', horarioController.obtenerHorariosPorAgenda);




module.exports = router;