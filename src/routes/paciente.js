const express = require('express');
const router = express.Router();
const pacienteController = require('../Controllers/paciente'); 
const obraSocial = require('../models/obrasocial'); 
const { authMiddleware, secretariaMiddleware,pacienteMiddleware,userMiddleware} = require('../middlewares/auth');

router.post('/crearPaciente', pacienteController.create);
router.get('/listarPacientes', pacienteController.getAll);
router.get('/obtenerPaciente/:id', pacienteController.getById);
router.get('/obtenerPacienteidPersona/:id', pacienteController.obtenerPacienteidPersona);
router.put('/actualizarPaciente/:id', pacienteController.update);
router.delete('/eliminarPaciente/:id', pacienteController.delete);


router.get('/nuevo',userMiddleware, authMiddleware, secretariaMiddleware, async (req, res) => {
    try {
      const obrasSociales = await obraSocial.findAll();
      res.render("secretaria/nuevo-paciente", { obrasSociales });
    } catch (error) {
      console.error('Error al obtener la lista de pacientes:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de pacientes' });
    }
  });
  router.post("/nuevo", userMiddleware, authMiddleware, secretariaMiddleware,pacienteController.crearPaciente);

  router.get('/lista',userMiddleware, authMiddleware, secretariaMiddleware, async (req, res) => {
    try {
      const pacientes = await pacienteController.getAll(); 
      res.render('secretaria/listar-paciente', { pacientes});
    } catch (error) {
      console.error('Error al obtener la lista de pacientes:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de pacientes' });
    }
  });

  router.get('/:id/agendarTurno/', userMiddleware, authMiddleware, secretariaMiddleware, async (req, res) => {
      try {
        const pacienteId = req.params.id;
        const paciente = await pacienteController.obtenerPaciente(pacienteId); 
    
        if (!paciente) {
          return res.status(404).render('error', { error: 'Paciente no encontrado' });
        }
        res.render('secretaria/agendarTurno', { paciente });
      } catch (error) {
        console.error('Error al obtener los datos del paciente:', error);
        res.status(500).render('error', { error: 'Error al obtener los datos del paciente' });
      }
    });
  
    router.get('/:id/editar/', userMiddleware, authMiddleware, secretariaMiddleware, async (req, res) => {
      try {
        const pacienteId = req.params.id;
        const paciente = await pacienteController.obtenerPaciente(pacienteId); 
    
        if (!paciente) {
          return res.status(404).render('error', { error: 'Paciente no encontrado' });
        }
        const obrasSociales = await obraSocial.findAll();
        res.render('secretaria/editar-paciente', { paciente, obrasSociales }); 
      } catch (error) {
        console.error('Error al obtener los datos del paciente:', error);
        res.status(500).render('error', { error: 'Error al obtener los datos del paciente' });
      }
    });
  router.post("/:id/actualizar/",userMiddleware, authMiddleware, secretariaMiddleware, pacienteController.update);

module.exports = router;