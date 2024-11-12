const express = require('express');
const router = express.Router();
const personaController = require('../Controllers/persona');

router.post('/crearPersona', personaController.crearPersona); 
router.put('/updatePersona/:id', personaController.update); 
router.get('/listarPersonas', personaController.getAll); 
router.get('/obtenerPersona/:id', personaController.getById); 
router.delete('/eliminarPersona/:id', personaController.delete); 

router.get('/obtenerPersonaDni/:dni', personaController.findByDni); 
router.get('/', personaController.getAll);
router.get('/', personaController.getById);

router.get('/register', async (req, res) => {
    const id = req.query.id; 
    res.render('persona', { id }); 
});

module.exports = router;