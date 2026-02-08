const express = require('express');
const router = express.Router();
const turnoController = require('../Controllers/turno'); 
const pacienteController = require('../Controllers/paciente'); 
const { authMiddleware, userMiddleware} = require('../middlewares/auth');
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


router.get('/listar', userMiddleware, authMiddleware, async (req, res) => {
    try {
        const datos = await turnoController.getDatosSecretaria(req);
        res.render('secretaria/turnos-listar', datos);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Error al cargar la secretaría' });
    }
});

router.get('/mis-turnos', userMiddleware, authMiddleware, async (req, res) => {
    try {
        const datos = await turnoController.getDatosPaciente(req);
        res.render('paciente/mis-turnos', datos);
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Error al cargar tus turnos' });
    }
});
router.post('/:id/estado', userMiddleware, authMiddleware, turnoController.cambiarEstado);

module.exports = router;