const express = require("express");
const router = express.Router();
const medicoController = require("../Controllers/medico");
const { authMiddleware, adminMiddleware,userMiddleware} = require('../middlewares/auth');
const medicoEspecialidadController = require('../Controllers/medico_especialidad');
// const especialidadController = require('../Controllers/especialidad');
const Especialidad = require('../models/especialidad'); 
router.post("/", authMiddleware, adminMiddleware,medicoController.crearMedico);
router.post("/crearMedico", authMiddleware, adminMiddleware,medicoController.crearMedico);
router.get("/listarMedicos", authMiddleware, adminMiddleware,medicoController.getAll);
router.get("/obtenerMedico/:id",authMiddleware, adminMiddleware, medicoController.getById);
router.put("/actualizarMedico/:id",authMiddleware, adminMiddleware, medicoController.update);
router.get("/obtenerMedicos",medicoController.obtenerMedicos);
router.delete("/eliminarMedico/:id", authMiddleware, adminMiddleware,medicoController.delete);

router.get('/lista',userMiddleware,authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const medicos = await medicoController.getAll(); 
      res.render('admin/listar-medico', { medicos});
    } catch (error) {
      console.error('Error al obtener la lista de médicos:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de médicos' });
    }
  });

  router.get('/nuevo',userMiddleware, authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const personas = await medicoController.getAvailablePersons(); 
      res.render('admin/nuevo-medico',{personas});
    } catch (error) {
      console.error('Error al obtener la lista de médicos:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de médicos' });
    }
  });
  router.get('/personas',userMiddleware, authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const personas = await medicoController.getAvailablePersons(); 
      res.render('admin/listar-personasNoM',{personas});
    } catch (error) {
      console.error('Error al obtener la lista de médicos:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de médicos' });
    }
  });
  router.post('/:id/activar', userMiddleware, authMiddleware, adminMiddleware,medicoController.activarMedico);
  router.post('/:id/desactivar', userMiddleware, authMiddleware, adminMiddleware,medicoController.desactivarMedico); 
  router.get('/:id/editar/', userMiddleware, authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const medicoId = req.params.id;
      const medico = await medicoController.obtenerMedico(medicoId); // Obtener el médico por su ID
  
      if (!medico) {
        return res.status(404).render('error', { error: 'Médico no encontrado' });
      }
      const especialidades = await Especialidad.findAll(); // Obtener todas las especialidades
      res.render('admin/editar-medico', { medico, especialidades }); // Renderizar la vista en la ruta
    } catch (error) {
      console.error('Error al obtener los datos del médico:', error);
      res.status(500).render('error', { error: 'Error al obtener los datos del médico' });
    }
  });
router.post('/:id/agregarEspecialidad/:especialidadId',userMiddleware, authMiddleware, adminMiddleware, medicoEspecialidadController.agregarEspecialidad);
router.post('/:id/quitarEspecialidad/:especialidadId', userMiddleware, authMiddleware, adminMiddleware,medicoEspecialidadController.quitarEspecialidad);
router.post("/:id/actualizar/",userMiddleware, authMiddleware, adminMiddleware, medicoController.actualizarCorreoTelefono);

router.get("/:id/horario/", userMiddleware, authMiddleware, adminMiddleware, async (req, res) => {
  const id = req.params.id;
  res.render("admin/horario-medico", { id });
});
module.exports = router;
