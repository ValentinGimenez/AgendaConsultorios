const express = require('express');
const router = express.Router();
const pacienteController = require('../Controllers/paciente'); 
const obraSocial = require('../models/obrasocial'); 
const upload = require("../utils/uploadConfig");
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
  router.post("/nuevo", upload.single('fotodni'), userMiddleware, authMiddleware, secretariaMiddleware,pacienteController.crearPaciente);

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
  router.get('/personas',userMiddleware, authMiddleware, secretariaMiddleware, async (req, res) => {
    try {
      const personas = await pacienteController.getAvailablePersons(); 
      res.render('secretaria/listar-personasNoP',{personas});
    } catch (error) {
      console.error('Error al obtener la lista de personas:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de personas' });
    }
  });
  
  router.get('/identificar', userMiddleware, authMiddleware, secretariaMiddleware, (req, res) => {
      res.render('secretaria/identificarPaciente');
  });

  router.get('/buscarPorDni/:dni', userMiddleware, authMiddleware, secretariaMiddleware, pacienteController.buscarPorDni);
module.exports = router;