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
      console.error('Error al obtener la lista de médicos:', error);
      res.status(500).render('error', { error: 'Error al obtener la lista de médicos' });
    }
  });
module.exports = router;