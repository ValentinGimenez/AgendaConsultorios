const express = require('express');
const router = express.Router();
const medicoEspecialidadController = require('../Controllers/medico_especialidad'); 

router.post('/crearRelacionME', medicoEspecialidadController.create);
router.get('/ListarMedicoEspecialidad', medicoEspecialidadController.getAll);
router.get('/obtenerMedicodeEspecialidad/:id', medicoEspecialidadController.getById);
router.get('/obtenerId/:idMedico/:idEspecialidad', medicoEspecialidadController.obtenerid);
router.put('/aa:id', medicoEspecialidadController.update);
router.delete('/aa:id', medicoEspecialidadController.delete); 
router.get('/obtenerMedicos/:id',medicoEspecialidadController.obtenerMedicos);
router.get('/obtenerEspecialidad/:id',medicoEspecialidadController.obtenerEspecialidad);
router.get('/obtenerTodosMedicos',medicoEspecialidadController.obtenerTodosMedicos);
router.get('/obtenerTodasEspecialidades',medicoEspecialidadController.obtenerTodasEspecialidades);
router.get("/obtenerMedicosActivos/:id", medicoEspecialidadController.obtenerMedicosActivos);
module.exports = router;
