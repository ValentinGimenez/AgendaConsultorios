const express = require('express');
const router = express.Router();
const listaEsperaController = require('../Controllers/lista_de_espera'); 
const { authMiddleware, secretariaMiddleware,pacienteMiddleware,userMiddleware} = require('../middlewares/auth');

router.post('/crearListaEspera',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.create);
router.get('/listarEnEspera',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.getAll);
router.get('/obtenerPacienteListaEspera/:id',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.getById);
router.put('/actualizarListaEspera/:id',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.update);
router.delete('/EliminarPacienteListaEspera/:id',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.delete);
router.get('/listarPorEspecialidad/:idEspecialidad',authMiddleware,  secretariaMiddleware,  userMiddleware, listaEsperaController.getByEspecialidad);
router.get('/',authMiddleware,  secretariaMiddleware, userMiddleware, listaEsperaController.getVistaListaEspera);


module.exports = router;