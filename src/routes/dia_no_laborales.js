const express = require('express');
const router = express.Router();
const diaNoLaboralController = require('../Controllers/dia_no_laborales');

router.post('/crearDiaNoLaboral', diaNoLaboralController.create);
router.get('/listarDiasNoLaborales/', diaNoLaboralController.getAll);
router.get('/obtenerDiaNoLaboral/:id', diaNoLaboralController.getById);
router.put('/actualizarDiaNoLaboral/:id', diaNoLaboralController.update);
router.delete('/eliminarDiaNoLaboral/:id', diaNoLaboralController.delete);

module.exports = router;