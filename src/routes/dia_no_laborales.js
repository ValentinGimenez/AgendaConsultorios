const express = require("express");
const router = express.Router();
const diaNoLaboralController = require("../Controllers/dia_no_laborales");
const {  authMiddleware,  adminMiddleware,  userMiddleware,} = require("../middlewares/auth");

router.get(  "/lista",  userMiddleware,  authMiddleware,  adminMiddleware,  diaNoLaboralController.vistaLista);

router.post(  "/crearDiaNoLaboral",  authMiddleware,  adminMiddleware,  diaNoLaboralController.create);

router.get(  "/listarDiasNoLaborales",  authMiddleware,  adminMiddleware,  diaNoLaboralController.getAll);

router.get("/obtenerDiaNoLaboral/:id",  authMiddleware,  adminMiddleware,  diaNoLaboralController.getById);

router.put("/actualizarDiaNoLaboral/:id",  authMiddleware,  adminMiddleware, diaNoLaboralController.update);

router.delete("/eliminarDiaNoLaboral/:id",  authMiddleware,  adminMiddleware,  diaNoLaboralController.delete);

module.exports = router;
