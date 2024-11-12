const express = require("express");
const router = express.Router();
const especialidadController = require("../Controllers/especialidad");

router.post("/crearEspecialidad", especialidadController.create);
router.get("/listarEspecialidades", especialidadController.getAll);
router.get("/obtenerEspecialidad/:id", especialidadController.getById);
router.put("/actualizarEspecialidad/:id", especialidadController.update);
router.delete("/eliminarEspecialidad/:id", especialidadController.delete);

module.exports = router;
