const express = require("express");
const router = express.Router();
const usuarioController = require("../Controllers/usuario");
const Persona = require("../models/persona");
const { authMiddleware, adminMiddleware , userMiddleware } = require('../middlewares/auth');

router.post("/", authMiddleware, adminMiddleware, usuarioController.crearUsuario); 
router.get("/listarUsuarios", authMiddleware, adminMiddleware, usuarioController.getAll);
router.get("/obtenerUsuario/:id", authMiddleware, adminMiddleware, usuarioController.getById);
router.put("/actualizarUsuario/:id", authMiddleware, adminMiddleware, usuarioController.update);
router.delete("/eliminarUsuario/:id", authMiddleware, adminMiddleware, usuarioController.delete);

router.post("/login", usuarioController.login);


router.get("/nuevo", userMiddleware, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const personas = await Persona.findAll();
    res.render("crear-usuario", { personas });
  } catch (error) {
    console.error("Error al obtener las personas:", error);
    res.status(500).render("error", { error: "Error al obtener las personas" });
  }
});

router.get("/login", async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.error("Error al renderizar la vista de login:", error);
    res.status(500).render("error", { error: "Error al renderizar la vista de login" });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      res.status(500).json({ message: 'Error al cerrar sesión' });
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;